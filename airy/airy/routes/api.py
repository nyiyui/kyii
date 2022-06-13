from typing import List, Optional, Tuple
from urllib.parse import urlencode, urljoin
from uuid import UUID, uuid4

import flask_login
import jsonschema
from flask import (Blueprint, Response, abort, current_app, jsonify, redirect,
                   render_template, request, session, url_for)
from flask_cors import CORS
from flask_login import current_user, login_required, logout_user
from flask_mail import Message
from sqlalchemy.exc import MultipleResultsFound, NoResultFound

from ..db import (AF, AP, Email, OAuth2Token, User, UserLogin, ap_reqs, db,
                  gen_uuid)
from ..etc import current_user_login, mail
from ..session import API_V1_APID, API_V1_SOLVED, API_V1_UID
from ..util import all_perms, gen_token, has_perms, req_perms
from ..verifiers import VerificationError


def login_user(u: User, apid: Optional[str]) -> Tuple[UserLogin, str]:
    flask_login.login_user(u)
    ul = UserLogin(
        id=gen_uuid(),
        user=u,
        extra={
            "remote": request.remote_addr,
            "headers": {
                key: request.headers[key]
                for key in set(request.headers.keys())
                & {
                    "User-Agent",
                    "Sec-Ch-Ua",
                    "Sec-Ch-Mobile",
                    "Sec-Ch-Ua-Platform",
                }
            },
        },
        against_id=apid,
    )
    token = ul.gen_token()  # TODO: revisit token-based api
    db.session.add(ul)
    db.session.commit()
    return ul, token


def perm_handler(missing_perms, reason):
    resp = jsonify(
        dict(
            type="missing_perms", data=dict(missing_perms=missing_perms, reason=reason)
        )
    )
    resp.status_code = 403
    abort(resp)


api_v1 = Blueprint("api_v1", __name__)


def init_app(app):
    @app.before_request
    def update_ul_last():
        ul = current_user_login()
        if ul is not None and not ul.is_anonymous:
            ul.see()
            db.session.commit()

    if app.config["KYII_YUUI"]:
        CORS(
            api_v1,
            resources={
                "/*": dict(
                    origins=[app.config["KYII_YUUI_ORIGIN"]],
                    supports_credentials=True,
                )
            },
        )
        app.register_blueprint(api_v1)


@api_v1.route("/api/v1/user/exists", methods=("GET",))  # TODO: fix to "/status"
def api_user_exists():
    slug = request.args["slug"]
    try:
        User.query.filter_by(slug=slug).one()
    except MultipleResultsFound:
        abort(Response(response="multiple found", status=500))  # ooopsie
        return
    except NoResultFound:
        return dict(exists=False)
    return dict(exists=True)


@api_v1.route("/api/v1/uls", methods=("GET",))
@login_required
def api_uls():
    # TODO: fix weird db queries (e.g. this one) using db.relationships etc
    uls = UserLogin.query.filter_by(user=current_user)
    cul = current_user_login()
    return dict(
        uls=[
            dict(
                **ul.for_api_v1_trusted,
                **(dict(current=True) if ul.id == cul.id else {}),
            )
            for ul in uls
        ]
    )


@api_v1.route("/api/v1/uls/revoke", methods=("POST",))
@login_required
def api_uls_revoke():
    ul = UserLogin.query.filter_by(user=current_user, id=request.form["ulid"]).one()
    ul.revoke("revoke")
    db.session.commit()
    return {}


@api_v1.route("/api/v1/uls/delete", methods=("POST",))
@login_required
def api_uls_delete():
    UserLogin.query.filter_by(user=current_user, id=request.form["ulid"]).delete()
    db.session.commit()
    return {}


@api_v1.route("/api/v1/uls/edit", methods=("POST",))
@login_required
def api_uls_edit():
    ul = UserLogin.query.filter_by(user=current_user, id=request.form["ulid"]).one()
    ul.name = request.form["name"]
    db.session.commit()
    return {}


@api_v1.route("/api/v1/logged_in", methods=("GET",))
def api_logged_in():
    user = current_user
    if user.is_anonymous:
        return dict(logged_in=False)
    ul = current_user_login()
    if ul is None:
        abort(Response(response="logged in but UserLogin not found!", status=400))
        return
    return dict(logged_in=True)


@api_v1.route("/api/v1/status", methods=("GET",))
def api_status():
    user = current_user
    if user.is_anonymous:
        return dict(
            user=None,
            user_session=None,
        )
    ul = current_user_login()
    if ul is None:
        abort(Response(response="logged in but userlogin not found!", status=400))
        return
    return dict(
        user=dict(username=user.slug, uuid=user.id),
        user_session=dict(uuid=ul.id, name=ul.name, against=ul.against_id),
    )


@api_v1.route("/api/v1/csrf_token", methods=("GET",))
def api_csrf_token():
    csrf_token = render_template("api_v1/csrf_token.html")
    return dict(csrf_token=csrf_token)
    # return dict(csrf_token=session["_csrf_token"])


@api_v1.route("/api/v1/logout", methods=("POST",))
@login_required
def api_logout_stop():
    logout_user()
    ul = current_user_login()
    ul.revoke("logout")
    db.session.commit()
    return {}


@api_v1.route("/api/v1/login/stop", methods=("POST",))
def api_login_stop():
    del session[API_V1_UID]
    del session[API_V1_APID]
    del session[API_V1_SOLVED]


@api_v1.route("/api/v1/login/start", methods=("POST",))
def api_login_start():
    slug = request.form["slug"]
    try:
        u = User.query.filter_by(slug=slug).one()
    except MultipleResultsFound:
        abort(Response(response="multiple found", status=500))  # ooopsie
        return
    except NoResultFound:
        return "", 204
    session[API_V1_UID] = u.id
    session[API_V1_APID] = None
    session[API_V1_SOLVED] = set()
    aps = AP.query.filter_by(user=u)
    resp = jsonify(
        dict(
            aps=list(ap.for_api_v1 for ap in aps),
        )
    )
    resp.headers["Accept-CH"] = ".".join(
        ["Arch", "Full-Version-List", "Mobile", "Model", "Platform", "Platform-Version"]
    )
    return resp


@api_v1.route("/api/v1/login/choose", methods=("POST",))
def api_login_choose():
    apid = str(UUID(request.form["apid"]))
    session[API_V1_APID] = apid
    uid = session[API_V1_UID]
    ap = AP.query.get(apid)
    if ap is None:
        abort(Response(response="selected ap nonexistent", status=400))  # sus
        return
    if ap.user_id != uid:
        abort(Response(response="selected ap not for selected user", status=400))  # sus
        return
    afs = AF.query.filter_by(user_id=uid).join(ap_reqs).filter_by(ap_id=apid)
    return dict(
        afs=[af.for_api_v1 for af in afs],
    )


@api_v1.route("/api/v1/login/attempt", methods=("POST",))
def api_login_attempt():
    afid = str(UUID(request.form["afid"]))
    cr = request.form["attempt"]
    try:
        af = AF.query.filter_by(id=afid).one()
    except MultipleResultsFound:
        abort(Response(response="multiple AFs found", status=500))  # ooopsie
        return
    except NoResultFound:
        abort(Response(response="no AF found", status=400))  # hmdge
        return
    u = User.query.get(session[API_V1_UID])
    if af.user != u:
        abort(
            Response(response="chosen AF is not owned by chosen user", status=403)
        )  # hmdge
        return
    try:
        af.verify2(cr)
    except VerificationError as e:
        return dict(success=False, msg=str(e))
    else:
        try:
            ap = AP.query.filter_by(id=session[API_V1_APID]).one()
        except MultipleResultsFound:
            abort(Response(response="multiple APs found", status=500))  # ooopsie
            return
        except NoResultFound:
            abort(Response(response="no AP found", status=400))  # hmdge
            return
        session[API_V1_SOLVED].add(afid)
        done = len(session[API_V1_SOLVED] ^ set(af.id for af in ap.reqs)) == 0
        if done:
            ul, token = login_user(u, session[API_V1_APID])
            session["ulid"] = ul.id
        return dict(
            success=True,
            done=done,
            **(dict(token=token) if done else {}),
        )


V1_CONFIG_ID_SCHEMA = {  # TODO: move this to separate file?
    "$schema": "https://json-schema.org/draft/2019-09/schema",
    "type": "object",
    "properties": {
        "slug": {"type": "string", "minLength": 1, "maxLength": 128},
        "name": {"type": "string", "minLength": 1, "maxLength": 256},
        "email": {"type": "string", "format": "email"},
    },
}


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
        map(lambda afid: AF.query.filter_by(id=afid, user=user).one(), data["taf_reqs"])
    )
    db.session.add(ap)
    return ap.id


def dbify_ax(data: dict, user=current_user) -> List[UUID]:
    for tafid in session.get("tafs", []):
        dbify_taf(tafid)
    apids = list(dbify_ap(ap, user=user) for ap in data["aps"])
    # TODO: optimize peephole (add ap and then del)
    for del_ap in data["del_aps"]:
        AP.query.filter_by(id=del_ap, user=user).delete()
    for del_af in data["del_afs"]:
        AF.query.filter_by(id=del_af, user=user).delete()
    return apids


V1_CONFIG_AX_TAF_SET = {  # TODO: move this to separate file?
    "$schema": "https://json-schema.org/draft/2019-09/schema",
    "type": "object",
    "properties": {
        "tafid": {"type": "string", "format": "uuid"},
        "name": {"type": "string"},
        "verifier": {"type": "string"},
        "params": {"type": "object"},
    },
}

V1_CONFIG_AX_SCHEMA = {  # TODO: move this to separate file?
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
                    "taf_reqs": {
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


@api_v1.route(
    "/api/v1/config/ax",
    methods=(
        "GET",
        "POST",
    ),
)
@req_perms(("api_v1.config.ax",), perm_handler, cond=lambda: request.method == "POST")
@login_required
def api_config_ax():
    if request.method == "GET":
        afs = AF.query.filter_by(user=current_user)
        aps = AP.query.filter_by(user=current_user)
        return dict(
            afs=list(af.for_api_v1_trusted for af in afs),
            aps=list(ap.for_api_v1_trusted for ap in aps),
        )
    elif request.method == "POST":
        # TODO: require solving {all AFs} or {enough AFs to pass via at laest 1 AP}
        #       before changes are made (to db)
        jsonschema.validate(request.json, V1_CONFIG_AX_SCHEMA)
        _ = dbify_ax(request.json)
        if "tafs" in session:
            for tafid in session["tafs"]:
                del session[f"taf-{tafid}"]
            del session["tafs"]
        db.session.commit()
        return dict(type="ok")


@api_v1.route(
    "/api/v1/config/ax/taf/alloc",
    methods=("POST",),
)
@login_required
def api_config_ax_taf_alloc():
    tafid = uuid4()
    session["tafs"] = session.get("tafs", set())
    session["tafs"].add(tafid)
    session[f"taf-{tafid}"] = dict()
    return dict(type="ok", tafid=tafid)


@api_v1.route(
    "/api/v1/config/ax/taf/dealloc",
    methods=("POST",),
)
@login_required
def api_config_ax_taf_dealloc():
    tafid = request.form["tafid"]
    session["tafs"] = session.get("tafs", set())
    if tafid in session:
        session["tafs"].remove(tafid)
        del session[f"taf-{tafid}"]
    return dict(type="ok")


@api_v1.route(
    "/api/v1/config/ax/taf/set",
    methods=("POST",),
)
@login_required
def api_config_ax_taf_set():
    data = request.json
    jsonschema.validate(data, V1_CONFIG_AX_TAF_SET)
    name, verifier, gen_params = data["name"], data["verifier"], data["gen_params"]
    params, feedback = AF.gen_params(verifier, gen_params)
    tafid = data["tafid"]
    session["tafs"] = session.get("tafs", set())
    session["tafs"].add(tafid)
    session[f"taf-{tafid}"] = dict(
        name=name,
        verifier=verifier,
        params=params,
    )
    return dict(type="ok", taf=dict(tafid=tafid, feedback=feedback))


@api_v1.route(
    "/api/v1/config/ax/taf/attempt",
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
        return dict(type="verification_error", msg=str(e))
    else:
        taf["params"] = new_params
        taf["state"] = new_state
        session[key] = taf
        return dict(type="ok")


@api_v1.route("/api/v1/email/verify/start", methods=("POST",))
@login_required
@req_perms(("api_v1.email.verify",), perm_handler)
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
        "api_v1.email_verify", email_id=email_id, token=token, _external=True
    )
    mail.send(msg)
    return jsonify(dict(type="ok"))


@api_v1.route("/api/v1/email/verify/info", methods=("GET",))
@login_required
@req_perms(("api_v1.email.verify",), perm_handler)
def email_verify_info():
    if "token" not in request.args:
        return jsonify(dict(type="no_token"))
    token = request.args["token"]
    email = Email.query.filter_by(verify_token=token).one()
    return jsonify(dict(type="ok", email=email.email))


@api_v1.route(
    "/api/v1/email/verify",
    methods=(
        "GET",
        "POST",
    ),
)
@login_required
@req_perms(("api_v1.email.verify",), perm_handler)
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
            return jsonify(dict(type="not_allowed"))

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
            return jsonify(dict(type="email_and_email_id_mismatch"))
        if token != email.verify_token:
            return "invalid token", 403
        email.verify_token = None
        email.verified = True
        db.session.commit()
        return "ok", 200


@login_required
@api_v1.route(
    "/api/v1/config/id",
    methods=(
        "GET",
        "POST",
    ),
)
@req_perms(("api_v1.config.id",), perm_handler, cond=lambda: request.method == "POST")
@login_required
def api_config_id():
    if request.method == "GET":
        return dict(
            user=dict(
                uuid=current_user.id,
                slug=current_user.slug,
                name=current_user.name,
                emails=[
                    email.for_api_v1_trusted
                    for email in current_user.primary_group.emails
                ],
                perms=list(current_user.perms),
                default_perms=list(current_app.config["AIRY_DEFAULT_PERMS"]),
                primary_group=current_user.primary_group.for_api_v1_trusted,
                groups=[g.for_api_v1_trusted for g in current_user.groups],
            )
        )
    elif request.method == "POST":
        data = request.form
        jsonschema.validate(data, V1_CONFIG_ID_SCHEMA)
        current_user.slug = data["slug"]
        current_user.name = data["name"]
        db.session.commit()
        return ""


@api_v1.route(
    "/api/v1/config/g",
    methods=(
        "GET",
        "POST",
    ),
)
@req_perms(
    ("api_v1.config.g.nonself",),
    perm_handler,
    lambda: request.method == "POST" and "target" in request.form,
)
@req_perms(
    ("api_v1.config.g.self",),
    perm_handler,
    lambda: request.method == "POST" and "target" not in request.form,
)
@login_required
def api_config_g():
    return "", 501


@api_v1.route("/api/v1/signup", methods=("POST",))
@req_perms(("api_v1.signup",), perm_handler)
def api_signup():
    if not current_user.is_anonymous:
        resp = jsonify(dict(type="logged_in"))
        resp.status_code = 403
        return
    u = User()
    db.session.add(u)
    db.session.commit()
    ul, _ = login_user(u, None)
    session["ulid"] = ul.id
    return (
        dict(
            user_id=u.id,
        ),
        200,
    )


@api_v1.route("/api/v1/oauth/clients", methods=("GET", "POST"))
@req_perms(("api_v1.oauth.clients",), perm_handler)
def api_oauth_clients():
    if request.method == "GET":
        pass
    return "", 501


@api_v1.route("/api/v1/oauth/grants", methods=("GET", "POST"))
@req_perms(("api_v1.oauth.grants",), perm_handler)
def api_oauth_grants():
    tokens = list(
        token.for_api_v1_trusted
        for token in OAuth2Token.query.filter_by(user=current_user)
    )
    return dict(
        tokens=tokens,
    )


@api_v1.route("/api/v1/oauth/azrq", methods=("GET",))
def api_oauth_azrq():
    azrqid = str(UUID(request.args["azrqid"]))
    key = f"azrq-{azrqid}"
    if key not in session:
        return dict(type="azrq_nonexistent")
    return jsonify(dict(type="ok", azrq=session[key]["grant"]))


@api_v1.route("/api/v1/perms", methods=("GET",))
def api_perms():
    return dict(perms=all_perms())


@api_v1.route("/api/v1/perms/has", methods=("GET",))
def api_perms_has():
    return has_perms(request.args.getlist("perm"))
