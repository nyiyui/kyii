from typing import List
from urllib.parse import urlencode, urljoin
from uuid import UUID, uuid4

import jsonschema
from flask import (Blueprint, Response, abort, current_app, jsonify, redirect,
                   render_template, request, session, url_for)
from flask_cors import CORS
from flask_mail import Message
from sqlalchemy.exc import NoResultFound

from ..etc import login_ul
from flask_login import current_user as current_user2

from ..db import AF, AP, Email, OAuth2Token, User, UserLogin, ap_reqs, db, Group
from ..etc import mail
from ..session import API_V1_APID, API_V1_SOLVED, API_V1_UID
from ..ul import (current_ul, current_user, login_required, login_user,
                  logout_user)
from ..util2 import all_perms, gen_token, has_perms
from ..util2 import req_perms as _req_perms
from ..verifiers import VerificationError

# TODO: decide if adding per-UL sessions


bp = Blueprint("api_v2", __name__, url_prefix="/api/v2")


def init_app(app):
    @app.before_request
    def update_ul_last():
        if not current_ul.is_anonymous:
            current_ul.see()
            db.session.commit()

    if app.config["KYII_YUUI"]:
        CORS(
            bp,
            resources={
                "/*": dict(
                    origins=[app.config["KYII_YUUI_ORIGIN"]],
                    supports_credentials=True,
                )
            },
        )
        app.register_blueprint(bp)


def perm_handler(missing_perms, reason):
    return make_resp(
        error=dict(
            code="missing_perms",
            message=f"missing perms: {missing_perms}",
            data=dict(missing_perms=missing_perms, reason=reason),
        )
    )


def req_perms(perms, *args, **kwargs):
    return _req_perms(perms, perm_handler, *args, **kwargs)


RETURN_SCHEMA = {
    "$schema": "https://json-schema.org/draft/2019-09/schema",
    "type": "object",
    "properties": {
        "data": {},
        "error": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "code": {"type": "string"},
                    "message": {"type": "string"},
                    "data": {},
                },
            },
        },
    },
}


def make_resp(
    data: dict = None, errors: List[dict] = None, error: dict = None
) -> Response:
    if error is not None:
        if errors is None:
            errors = [error]
        else:
            raise TypeError("use either error or errors.")
    resp = jsonify(dict(data=data, errors=errors))
    resp.status_code = 200
    return resp


########################################################################################
# Miscellaneous
########################################################################################


@bp.route("/user/exists", methods=("GET",))  # TODO: fix to "/status"
@req_perms(("api_v2.user.lookup",))
def user_exists():
    slug = request.args["slug"]
    try:
        User.query.filter_by(slug=slug).one()
    except NoResultFound:
        return make_resp(data=dict(exists=False))
    return make_resp(data=dict(exists=True))


@bp.route("/csrf_token", methods=("GET",))
def api_csrf_token():
    csrf_token = render_template("api_v1/csrf_token.html")
    return make_resp(data=dict(csrf_token=csrf_token))


########################################################################################
# Login/Logout
########################################################################################


@bp.route("/login/sync", methods=("GET", "POST"))
@login_required
def api_login_sync():
    if request.method == "GET":
        return make_resp(data=dict(user=current_user2.for_api_v2 if current_user2.is_authenticated else None))
    elif request.method == "POST":
        print('user2', session)
        login_ul(current_ul, remember=True)
        session.modified = True
        print('user2', session)
        return make_resp()


@bp.route("/logged_in", methods=("GET",))
def api_logged_in():
    return make_resp(data=dict(logged_in=current_ul.is_authenticated))


@bp.route("/status", methods=("GET",))
def api_status():
    user = current_user
    if user.is_anonymous:
        return make_resp(error=dict(code="not_logged_in", message="Not logged in"))
    ul = current_ul
    if ul is None:
        abort(Response(response="logged in but userlogin not found!", status=400))
        return
    return make_resp(
        data=dict(
            user=dict(username=user.slug, uuid=user.id),
            user_session=dict(uuid=ul.id, name=ul.name, against=ul.against_id),
        )
    )


def login_clear():
    del session[API_V1_UID]
    del session[API_V1_APID]
    del session[API_V1_SOLVED]


@bp.route("/login/stop", methods=("POST",))
def login_stop():
    login_clear()
    return make_resp()


@bp.route("/login/start", methods=("POST",))
def login_start():
    slug = request.form["slug"]
    try:
        u = User.query.filter_by(slug=slug).one()
    except NoResultFound:
        return make_resp(error=dict(code="user_not_found", message="user not found"))
    session[API_V1_UID] = u.id
    session[API_V1_APID] = None
    session[API_V1_SOLVED] = set()
    aps = AP.query.filter_by(user=u)
    return make_resp(
        data=dict(
            aps=list(ap.for_api_v1 for ap in aps),
        )
    )


@bp.route("/login/choose", methods=("POST",))
def login_choose():
    apid = str(UUID(request.form["apid"]))
    session[API_V1_APID] = apid
    uid = session[API_V1_UID]
    ap = AP.query.get(apid)
    if ap is None:
        return make_resp(error=dict(code="ap_not_found", message="ap not found"))
    if ap.user_id != uid:
        return make_resp(error=dict(code="ap_not_owned", message="ap not owned"))
    afs = AF.query.filter_by(user_id=uid).join(ap_reqs).filter_by(ap_id=apid)
    return make_resp(
        data=dict(
            afs=[af.for_api_v1 for af in afs],
        )
    )


@bp.route("/login/attempt", methods=("POST",))
def login_attempt():
    afid = str(UUID(request.form["afid"]))
    attempt = request.form["attempt"]
    try:
        af = AF.query.filter_by(id=afid).one()
    except NoResultFound:
        return make_resp(error=dict(code="af_not_found", message="af not found"))
    u = User.query.get(session[API_V1_UID])
    if af.user != u:
        return make_resp(error=dict(code="af_not_owned", message="af not owned"))

    try:
        af.verify2(attempt)
    except VerificationError as e:
        return make_resp(error=dict(code="verification_failed", message=str(e)))
    try:
        ap = AP.query.filter_by(id=session[API_V1_APID]).one()
    except NoResultFound:
        return make_resp(error=dict(code="ap_not_found", message="ap not found"))
    session[API_V1_SOLVED].add(afid)
    done = len(session[API_V1_SOLVED] ^ set(af.id for af in ap.reqs)) == 0
    data = dict(done=done)
    if done:
        ul, token = login_user(u, session[API_V1_APID])
        login_clear()
        data["uid"] = u.id
        data["ulid"] = ul.id
        data["slug"] = u.slug
        data["name"] = u.name
        data["token"] = token
    return make_resp(data=data)


@bp.route("/logout", methods=("POST",))
@login_required
def logout():
    print(current_ul)
    # TODO: merge with uls_revoke?
    logout_user()
    return make_resp()


########################################################################################
# User Miscellaneous
########################################################################################


@bp.route("/signup", methods=("POST",))
@req_perms(("api_v2.signup",))
def api_signup():
    u = User()
    db.session.add(u)
    db.session.commit()
    ul, token = login_user(u, None)
    return make_resp(data=dict(token=token))


########################################################################################
# Config
########################################################################################


############################################
# Config: Authencation
############################################


def dbify_taf(tafid: UUID, user=current_user) -> None:
    data = session[f"taf-{tafid}"]
    af = AF()
    af.user = user
    af.name = data["name"]
    af.verifier = data["verifier"]
    af.params = data["params"]
    db.session.add(af)


def dbify_ap(data: dict, user=current_user) -> UUID:
    if data["uuid"] != "":
        ap = AP.query.filter_by(id=data["uuid"], user=user).one()
    else:
        ap = AP(user=user)
    ap.name = data["name"]
    ap.reqs = list(
        map(lambda afid: AF.query.filter_by(id=afid, user=user).one(), data["reqs"])
    )
    db.session.add(ap)
    return ap.id


def dbify_ax(data: dict, user=current_user) -> List[UUID]:
    for del_ap in data["del_aps"]:
        AP.query.filter_by(id=del_ap, user=user).delete()
    for del_af in data["del_afs"]:
        AF.query.filter_by(id=del_af, user=user).delete()
    for tafid in session.get("tafs", []):
        if tafid in data["del_afs"]:
            return make_resp(
                error=dict(code="dep_on_del", message=f"taf {tafid} in del_afs"),
            )
        dbify_taf(tafid)
    apids = []
    for ap in data["aps"]:
        try:
            apid = dbify_ap(ap, user=user)
        except NoResultFound:
            return make_resp(
                error=dict(code="dep_on_del", message=f"ap {apid} in del_aps"),
            )
        apids.append(apid)
    db.session.commit()
    return make_resp(data=dict(apids=apids))


CONFIG_AX_SCHEMA = {  # TODO: move this to separate file?
    "$schema": "https://json-schema.org/draft/2019-09/schema",
    "type": "object",
    "properties": {
        "aps": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "uuid": {"type": "string", "format": "uuid"},
                    "name": {"type": "string"},
                    "reqs": {
                        "type": "array",
                        "items": {"type": "string", "format": "uuid"},
                    },
                },
            },
        },
        "del_aps": {"type": "array", "items": {"type": "string"}},
        "del_afs": {"type": "array", "items": {"type": "string"}},
    },
}


@bp.route(
    "/config/ax",
    methods=("GET", "POST"),
)
@req_perms(("api_v2.config.ax",), cond=lambda: request.method == "POST")
@login_required
def api_config_ax():
    if request.method == "GET":
        afs = AF.query.filter_by(user=current_user)
        aps = AP.query.filter_by(user=current_user)
        return make_resp(
            data=dict(
                afs=list(af.for_api_v1_trusted for af in afs),
                aps=list(ap.for_api_v1_trusted for ap in aps),
            )
        )
    elif request.method == "POST":
        jsonschema.validate(request.json, CONFIG_AX_SCHEMA)
        # TODO: require solving all AFs?
        warnings = []
        if "tafs" in session:
            for tafid in session["tafs"]:
                taf = session[f"taf-{tafid}"]
                if not taf["solved"]:
                    warnings += dict(
                        code="unsolved_taf",
                        message=f"taf {tafid} not solved",
                        data=dict(tafid=tafid),
                    )

        resp = dbify_ax(request.json)
        if len(resp.errors) > 0:
            return resp
        if "tafs" in session:
            for tafid in session["tafs"]:
                del session[f"taf-{tafid}"]
            del session["tafs"]
        db.session.commit()
        return make_resp(data=dict(warnings=warnings))


############################################
# TAF
############################################


@bp.route("/config/ax/taf/list", methods=("GET",))
@login_required
def api_config_ax_taf_list():
    res = []
    tafids = session.get("tafs", [])
    for tafid in tafids:
        taf = session[f"taf-{tafid}"]
        res.append(dict(id=tafid, name=taf["name"], solved=taf["solved"]))
    return make_resp(data=dict(tafs=res))


@bp.route(
    "/config/ax/taf/alloc",
    methods=("POST",),
)
@login_required
def api_config_ax_taf_alloc():
    tafid = uuid4()
    session["tafs"] = session.get("tafs", set())
    session["tafs"].add(tafid)
    session[f"taf-{tafid}"] = dict()
    return make_resp(data=dict(type="ok", tafid=tafid))


@bp.route(
    "/config/ax/taf/dealloc",
    methods=("POST",),
)
@login_required
def api_config_ax_taf_dealloc():
    tafid = request.form["tafid"]
    session["tafs"] = session.get("tafs", set())
    session["tafs"].remove(tafid)
    del session[f"taf-{tafid}"]
    return make_resp()


CONFIG_AX_TAF_SET = {  # TODO: move this to separate file?
    "$schema": "https://json-schema.org/draft/2019-09/schema",
    "type": "object",
    "properties": {
        "tafid": {"type": "string", "format": "uuid"},
        "name": {"type": "string"},
        "verifier": {"type": "string"},
        "params": {"type": "object"},
    },
}


@bp.route(
    "/config/ax/taf/set",
    methods=("POST",),
)
@login_required
def api_config_ax_taf_set():
    data = request.json
    jsonschema.validate(data, CONFIG_AX_TAF_SET)
    name, verifier, gen_params = data["name"], data["verifier"], data["gen_params"]
    params, feedback = AF.gen_params(verifier, gen_params)
    tafid = data["tafid"]
    session["tafs"] = session.get("tafs", set())
    session["tafs"].add(tafid)
    session[f"taf-{tafid}"] = dict(
        name=name,
        verifier=verifier,
        params=params,
        state=None,
        solved=False,
    )
    return make_resp(data=dict(taf=dict(tafid=tafid, feedback=feedback)))


@bp.route(
    "/config/ax/taf/attempt",
    methods=("POST",),
)
@login_required
def api_config_ax_taf_attempt():
    tafid = str(UUID(request.form["tafid"]))
    attempt = request.form["attempt"]
    key = f"taf-{tafid}"
    if key not in session:
        return jsonify(dict(type="taf_nonexistent"))
    taf = session[key]
    verifier = taf["verifier"]
    params = taf["params"]
    state = taf.get("state")
    try:
        new_params, new_state = AF.verify(verifier, attempt, params, state)
    except VerificationError as e:
        taf["solved"] = False
        return make_resp(
            error=dict(code="verification_failed", message=f"failed: {e}", data=str(e))
        )
    else:
        taf["solved"] = True
        taf["params"] = new_params
        taf["state"] = new_state
        session[key] = taf
        return make_resp()


########################################################################################
# Email Verification
########################################################################################


@bp.route("/email/verify/start", methods=("POST",))
@login_required
@req_perms(("api_v2.email.verify",))
def email_verify_start():
    email_id = int(request.form["email_id"])
    email = Email.query.filter_by(id=email_id).one()
    if (
        current_user not in email.users
        and email.groups & current_user.all_groups == set()
    ):
        return jsonify(dict(type="not_yours"))
    msg = Message("Verify your email", recipients=[email.email])
    token = email.email_verify_token = gen_token()
    db.session.commit()
    msg.body = "Please verify your email address by accessing on the link below:\n\n"
    msg.body += url_for(
        "bp.email_verify", email_id=email_id, token=token, _external=True
    )
    mail.send(msg)
    return jsonify(dict(type="ok"))


@bp.route("/email/verify/info", methods=("GET",))
@login_required
@req_perms(("api_v2.email.verify",))
def email_verify_info():
    if "token" not in request.args:
        return make_resp(error=dict(code="token_not_found", message="token not found"))
    token = request.args["token"]
    email = Email.query.filter_by(verify_token=token).one()
    return make_resp(data=dict(email=email.email))


@bp.route(
    "/email/verify",
    methods=(
        "GET",
        "POST",
    ),
)
@login_required
@req_perms(("api_v2.email.verify",))
def email_verify():
    if request.method == "GET":
        if "token" not in request.args:
            return "token missing", 400
        token = request.form["token"]
        email = Email.query.filter_by(verify_token=token).one()
        if (
            current_user not in email.users
            and email.groups & current_user.all_groups == set()
        ):
            return jsonify(dict(type="not_allowed"))  # TODO: make more user-friendly

        if current_app.config["KYII_YUUI"]:
            base = urljoin(current_app.config["KYII_YUUI_ORIGIN"], "/email-verify")
            query = urlencode(dict(token=token))
            return redirect(f"{base}?{query}")
        else:
            return render_template("email_verify.html", token=token, email=email)
    elif request.method == "POST":
        if "token" not in request.form:
            return "token missing", 400
        token = request.form["token"]
        email: Email = Email.query.filter_by(verify_token=token).one()
        if request.form["email"] != email.email:
            return make_resp(
                error=dict(code="email_mismatch", message="email and email_id mismatch")
            )
        if token != email.verify_token:
            return make_resp(error=dict(code="token_invalid", message="token invalid"))
        email.verify_token = None
        email.verified = True
        db.session.commit()
        return make_resp()


############################################
# Config: Identity
############################################


CONFIG_ID_SCHEMA = {  # TODO: move this to separate file?
    "$schema": "https://json-schema.org/draft/2019-09/schema",
    "type": "object",
    "properties": {
        "slug": {"type": "string", "minLength": 1, "maxLength": 128},
        "name": {"type": "string", "minLength": 1, "maxLength": 256},
        "emails": {
            "type": "object",
            "properties": {
                "add": {
                    "type": "array",
                    "items": {"type": "string", "minLength": 1, "maxLength": 256},
                },
                "edit": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "integer", "minimum": 1},
                            "email": {
                                "type": "string",
                                "minLength": 1,
                                "maxLength": 256,
                            },
                        },
                    },
                },
                "delete": {
                    "type": "array",
                    "items": {"type": "integer", "minimum": 1},
                },
            },
        },
    },
}


@login_required
@bp.route(
    "/config/id",
    methods=(
        "GET",
        "POST",
    ),
)
@req_perms(("api_v2.config.id",), cond=lambda: request.method == "POST")
@login_required
def api_config_id():
    if request.method == "GET":
        return make_resp(data=dict(
            user=dict(
                slug=current_user.slug,
                name=current_user.name,
                emails=[e.for_api_v2 for e in current_user.primary_group.emails],
                perms=list(current_user.perms),
                default_perms=list(current_app.config["AIRY_DEFAULT_PERMS"]),
                primary_group=current_user.primary_group.for_api_v1_trusted,
                groups=[g.for_api_v1_trusted for g in current_user.groups],
            )
        ))
    elif request.method == "POST":
        data = request.form
        errors = []
        jsonschema.validate(data, CONFIG_ID_SCHEMA)
        current_user.slug = data["slug"]
        current_user.name = data["name"]
        if not current_user.primary_group:
            current_user.primary_group = Group(is_active=current_user.is_active)
            db.session.add(current_user.primary_group)
        pg = current_user.primary_group
        pg.slug = data["slug"]
        pg.name = data["name"]
        for email_data in data["emails"]["add"]:
            e = Email(email=email_data, is_verified=False, group=pg)
            db.session.add(e)
        for email_data in data["emails"]["edit"]:
            try:
                e = Email.query.filter_by(group=pg, id=email_data["id"]).delete()
            except NoResultFound:
                errors += dict(
                    code="email_not_found",
                    message=f"Email {email_data['id']} not found",
                    data=dict(email_id=email_data["id"]),
                )
            e.email = email_data["email"]
            e.unverify()
        for email_data in data["emails"]["delete"]:
            try:
                Email.query.filter_by(group=pg, id=email_data).delete()
            except NoResultFound:
                errors += dict(
                    code="email_not_found",
                    message=f"Email {email_data} not found",
                    data=dict(email_id=email_data),
                )
        db.session.commit()
        return make_resp()


########################################################################################
# OAuth
########################################################################################


@bp.route("/oauth/clients", methods=("GET", "POST"))
@req_perms(("api_v2.oauth.clients",))
def oauth_clients():
    if request.method == "GET":
        pass
    return "", 501


@bp.route("/oauth/grants", methods=("GET", "POST"))
@req_perms(("api_v2.oauth.grants",))
def oauth_grants():
    tokens = list(
        token.for_api_v2
        for token in OAuth2Token.query.filter_by(user=current_user)
    )
    return make_resp(data=dict(grants=tokens))


@bp.route("/oauth/azrq", methods=("GET",))
def oauth_azrq():
    azrqid = str(UUID(request.args["azrqid"]))
    key = f"azrq-{azrqid}"
    if key not in session:
        return make_resp(error=dict(code="azrq_not_found", message="azrq not found"))
    return make_resp(data=dict(azrq=session[key]["grant"]))


########################################################################################
# Permissions
########################################################################################


@bp.route("/perms", methods=("GET",))
def api_perms():
    return make_resp(data=dict(perms=all_perms()))


@bp.route("/perms/has", methods=("GET",))
def api_perms_has():
    ok, reason, missing = has_perms(request.args.getlist("perm"))
    return make_resp(data=dict(ok=ok, reason=reason, missing=missing))


########################################################################################
# UserLogins
########################################################################################


@bp.route("/uls", methods=("GET",))
@login_required
@req_perms(("api_v1.ul",))
def uls_list():
    uls = UserLogin.query.filter_by(user=current_user)
    return make_resp(
        data=dict(
            uls=[
                dict(
                    **ul.for_api_v1_trusted,
                    **(dict(current=True) if ul.id == current_ul.id else {}),
                )
                for ul in uls
            ],
        ),
    )


@bp.route("/uls/revoke", methods=("POST",))
@login_required
def uls_revoke():
    ul = UserLogin.query.filter_by(user=current_user, id=request.form["ulid"]).one()
    ul.revoke("revoke")
    db.session.commit()
    return make_resp()


@bp.route("/uls/delete", methods=("POST",))
@login_required
def uls_delete():
    UserLogin.query.filter_by(user=current_user, id=request.form["ulid"]).delete()
    db.session.commit()
    return make_resp()


@bp.route("/uls/edit", methods=("POST",))
@login_required
def uls_edit():
    ul = UserLogin.query.filter_by(user=current_user, id=request.form["ulid"]).one()
    ul.name = request.form["name"]
    db.session.commit()
    return make_resp()
