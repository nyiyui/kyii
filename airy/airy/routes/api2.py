import json
import os
import time
from functools import wraps
from pathlib import Path
from typing import List
from urllib.parse import urlencode, urljoin
from uuid import UUID, uuid4

import jsonschema
from authlib.oauth2 import OAuth2Error
from flask import (
    Blueprint,
    Response,
    abort,
    current_app,
    jsonify,
    redirect,
    render_template,
    request,
    send_file,
    session,
    url_for,
)
from flask_cors import CORS
from flask_limiter import RateLimitExceeded
from flask_login import current_user as current_user2
from flask_mail import Message
from flask_wtf.csrf import CSRFError
from sqlalchemy.exc import MultipleResultsFound, NoResultFound

from .. import verifiers
from ..db import (
    AF,
    AP,
    Email,
    Group,
    LogEntry,
    OAuth2Client,
    OAuth2Token,
    User,
    UserLogin,
    db,
)
from ..etc import limiter, login_ul, mail
from ..oauth2 import authorization
from ..session import API_V1_APID, API_V1_SOLVED, API_V1_UID
from ..ul import (
    current_ul,
    current_user,
    get_extra,
    login_required,
    login_user,
    logout_user,
)
from ..util2 import all_perms, gen_token, has_perms
from ..util2 import req_perms as _req_perms
from ..verifiers import GenerationError, VerificationError, remote
from .util import conv_to_webp

# TODO: decide if adding per-UL sessions


bp = Blueprint("api_v2", __name__, url_prefix="/api/v2")

cors = CORS()


@bp.errorhandler(CSRFError)
def handle_csrf_error(error: CSRFError):
    return (
        dict(
            errors=[
                dict(
                    code="csrf_token_not_found",
                    message=f"CSRF token not found.",
                )
            ]
        ),
        430,
    )


@bp.errorhandler(RateLimitExceeded)
def limiter_handler(error: RateLimitExceeded):
    return (
        dict(
            errors=[
                dict(
                    code="enhance_your_calm",
                    message=f"Enhance your calm: {error.description}",
                    data=error.description,
                )
            ]
        ),
        429,
    )


def init_app(app):
    @app.before_request
    def update_ul_last():
        if not current_ul.is_anonymous:
            current_ul.see()
            db.session.commit()

    if app.config["KYII_YUUI"]:
        cors.init_app(
            app=bp,
            resources={
                "/api/v2/*": dict(
                    origins=[app.config["KYII_YUUI_ORIGIN"]],
                    supports_credentials=True,
                ),
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
        return make_resp(
            data=dict(
                user=current_user2.for_api_v2
                if current_user2.is_authenticated
                else None
            )
        )
    elif request.method == "POST":
        login_ul(current_ul, remember=True)
        session.modified = True
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
@limiter.limit("60 per minute")
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
    u.add_le(LogEntry(renderer="login_start", data=dict(extra=get_extra())))
    return make_resp(
        data=dict(
            uid=u.id,
            aps=list(ap.for_api_v1 for ap in aps),
        )
    )


@bp.route("/login/choose", methods=("POST",))
@limiter.limit("60 per minute")
def login_choose():
    apid = str(UUID(request.form["apid"]))
    session[API_V1_APID] = apid
    uid = session[API_V1_UID]
    ap = AP.query.get(apid)
    if ap is None:
        return make_resp(error=dict(code="ap_not_found", message="ap not found"))
    if ap.user_id != uid:
        return make_resp(error=dict(code="ap_not_owned", message="ap not owned"))
    afs = ap.afs(user_id=uid)
    u = User.query.filter_by(id=uid).one()
    u.add_le(LogEntry(renderer="login_choose", data=dict(apid=apid)))
    return make_resp(
        data=dict(
            afs=[af.for_api_v1 for af in afs],
        )
    )


def get_login_uid():
    """
    Returns the UID for a login session.
    """
    return session[API_V1_UID]


@bp.route("/login/attempt", methods=("POST",))
@limiter.limit("2 per second", key_func=get_login_uid)
def login_attempt():
    afid = str(UUID(request.form["afid"]))
    if afid in session[API_V1_SOLVED]:
        return make_resp(error=dict(code="already_solved", message="AF already solved"))
    attempt = request.form["attempt"]
    try:
        af = AF.query.filter_by(id=afid).one()
    except NoResultFound:
        return make_resp(error=dict(code="af_not_found", message="AF not found"))
    u = User.query.get(session[API_V1_UID])
    if af.user != u:
        return make_resp(error=dict(code="af_not_owned", message="AF not owned"))

    uid = session[API_V1_UID]
    try:
        feedback, cur_done = af.verify(attempt, target_id=uid)
    except VerificationError as e:
        return make_resp(
            error=dict(code="verification_failed", message=str(e), data=str(e))
        )

    if cur_done:
        try:
            ap = AP.query.filter_by(id=session[API_V1_APID]).one()
        except NoResultFound:
            return make_resp(error=dict(code="ap_not_found", message="AP not found"))
        session[API_V1_SOLVED].add(afid)
        all_done = len(session[API_V1_SOLVED] ^ set(af.id for af in ap.reqs)) == 0
    else:
        all_done = False
    data = dict(
        feedback=feedback,
        all_done=all_done,
        cur_done=cur_done,
    )
    le_data = dict(afid=afid, cur_done=cur_done)
    u.add_le(LogEntry(renderer="login_attempt", data=le_data))
    if all_done:
        ul, token = login_user(u, session[API_V1_APID])
        # login_clear()  # TODO: clear and disable further submissions by Yuui
        data.update(dict(uid=u.id, ulid=ul.id, slug=u.slug, name=u.name, token=token))
        u.add_le(LogEntry(renderer="login", data=dict(ul=ul.id)))
    db.session.commit()
    return make_resp(data=data)


@bp.route("/logout", methods=("POST",))
@login_required
def logout():
    # TODO: merge with uls_revoke?
    logout_user()
    return make_resp()


@bp.route("/remote/decide", methods=("POST",))
@login_required
def remote_decide():
    token = request.form["token"]
    verifiers.remote._remote_decide(token, target_id=current_user.id)
    current_user.add_le(LogEntry(renderer="remote", data=dict(token=token)))
    db.session.commit()
    return make_resp()


def remote_stream(target_id: str, token: str):
    # TODO: fix this sad code

    class Proxy:
        def __init__(self):
            self.send = False

    p = Proxy()

    def insert_this(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            return f(f, *args, **kwargs)

        return wrapper

    @insert_this
    def handler(this, *args, **kwargs):
        p.send = True
        remote.decided.disconnect(this)

    remote.decided.connect(handler)
    counter = 0
    limit = remote.TIMEOUT
    interval = 1
    while 1:
        time.sleep(interval)
        if counter > limit / interval:
            yield "event: timeout\ndata: null\n\n"
            return
        if p.send:
            yield "event: decided\ndata: null\n\n"
            return
        counter += 1


@bp.route("/remote/wait", methods=("GET",))
def remote_wait():
    # SECURITY: leaking when and if tokens are verified or not should be fine
    target_id = request.args["uid"]
    token = request.args["token"]
    return Response(remote_stream(target_id, token), mimetype="text/event-stream")


########################################################################################
# User Miscellaneous
########################################################################################


@bp.route("/signup", methods=("POST",))
@limiter.limit("1 per hour")
@req_perms(("api_v2.signup",))
def api_signup():
    u = User()
    db.session.add(u)
    db.session.commit()
    ul, token = login_user(u, None)
    return make_resp(data=dict(token=token, uid=ul.user.id, ulid=ul.id))


########################################################################################
# Config
########################################################################################


############################################
# Config: Authencation
############################################


def dbify_taf(tafid: UUID, user=current_user) -> bool:
    data = session[f"taf-{tafid}"]
    if not data["gen_done"]:
        return False
    try:
        af = AF.query.filter_by(id=str(tafid), user=user).one()
    except NoResultFound:
        af = AF(id=str(tafid))
    af.user = user
    af.verifier = data["verifier"]
    af.params = data["params"]
    af.gen_done = True
    # NOTE: don't save state
    db.session.add(af)
    return True


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


def dbify_ax(data: dict, user=current_user):
    for del_ap in data["del_aps"]:
        AP.query.filter_by(id=del_ap, user=user).delete()
    for del_af in data["del_afs"]:
        AF.query.filter_by(id=del_af, user=user).delete()
    all_used = set()
    for ap in data["aps"]:
        reqs = ap["reqs"]
        all_used |= set(reqs)
    all_afs = set(map(str, session.get("tafs", set()))) | set(
        str(af.id) for af in AF.query.filter_by(user=user).all()
    )
    unused = all_afs - all_used
    warnings = []
    if len(unused) > 0:
        warnings.append(
            dict(
                code="unused_afs",
                message=f"unused AFs: {unused}",
                data=list(unused),
            )
        )
    for tafid in session.get("tafs", []):
        if tafid in data["del_afs"]:
            return make_resp(
                error=dict(code="dep_on_del", message=f"taf {tafid} in del_afs"),
            )
        taf = session[f"taf-{tafid}"]
        if not taf["solved"]:
            return make_resp(
                error=dict(
                    code="taf_not_solved",
                    message=f"taf {tafid} not solved",
                    data=dict(tafid=tafid),
                )
            )
        ok = dbify_taf(tafid)
        if not ok:
            return make_resp(
                error=dict(
                    code="taf_gen_not_done",
                    message=f"generation of taf {tafid} not done",
                    data=dict(tafid=tafid),
                )
            )
    apids = []
    for ap in data["aps"]:
        apid = dbify_ap(ap, user=user)
        apids.append(apid)
    db.session.commit()
    return make_resp(data=dict(apids=apids, warnings=warnings))


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
@login_required
@req_perms(("api_v2.config.ax",), cond=lambda: request.method == "POST")
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
                if taf == {}:
                    warnings += f"taf {tafid} is only allocated"
                    continue
                if not taf["gen_done"]:
                    warnings += f"taf {tafid} is not done generating"
                    continue
                if not taf["solved"]:
                    warnings += dict(
                        code="unsolved_taf",
                        message=f"taf {tafid} not solved",
                        data=dict(tafid=tafid),
                    )

        resp = dbify_ax(request.json).json
        if resp["errors"] and len(resp["errors"]) > 0:
            return resp
        if "afs" in request.json:
            for af in request.json["afs"]:
                af2 = AF.query.filter_by(id=af["uuid"], user=current_user).one()
                af2.name = af["name"]
        if "tafs" in session:
            for tafid in session["tafs"]:
                key = f"taf-{tafid}"
                if key in session:
                    del session[key]
            del session["tafs"]
        current_user.add_le(LogEntry(renderer="config_ax", data=dict()))
        db.session.commit()
        return make_resp(data=dict(warnings=warnings))


############################################
# User: Public
############################################


@bp.route("/user/<uid>/img", methods=("GET",))
def api_user_img(uid):
    try:
        u = User.query.filter_by(id=uid).one()  # ensure existence
    except NoResultFound:
        return "user not found", 404
    p = Path(os.path.join(current_app.config["UPLOAD_PATH"], f"img/{u.id}.webp"))
    if not p.exists():
        return "image not found", 404
    return send_file(p, mimetype="image/webp")


@bp.route("/user/<uid>", methods=("GET",))
def api_user(uid):
    try:
        u = User.query.filter_by(id=uid).one()  # ensure existence
    except NoResultFound:
        return make_resp(error=dict(code="user_not_found", message="user not found"))
    return make_resp(data=dict(name=u.name, slug=u.slug))


############################################
# TAF
############################################


@bp.route("/config/ax/taf/clear", methods=("POST",))
@login_required
def api_config_ax_taf_clear():
    if "tafs" in session:
        for tafid in session["tafs"]:
            key = f"taf-{tafid}"
            if key in session:
                del session[key]
        del session["tafs"]
    return make_resp()


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
    "/config/ax/taf/gen",
    methods=("POST",),
)
@login_required
def api_config_ax_taf_gen():
    data = request.json
    jsonschema.validate(data, CONFIG_AX_TAF_SET)
    name, verifier, gen_params = data["name"], data["verifier"], data.get("gen_params")
    cont = data["cont"]
    tafid = data["tafid"]
    if cont:
        gen_state = session[f"taf-{tafid}"]["gen_state"]
    else:
        session["tafs"] = session.get("tafs", set())
        session["tafs"].add(tafid)
        gen_state = None

    try:
        params, gen_state, feedback, done = verifiers.gen(
            verifier, gen_params, gen_state
        )
    except GenerationError as e:
        return make_resp(error=dict(code="generation_error", msg=str(e), data=str(e)))

    session[f"taf-{tafid}"] = dict(
        name=name,
        verifier=verifier,
        params=params,
        **(dict(gen_state=gen_state) if not done else dict()),
        gen_done=done,
        solved=False,
    )
    return make_resp(data=dict(taf=dict(tafid=tafid, feedback=feedback, done=done)))


@bp.route(
    "/config/ax/taf/verify",
    methods=("POST",),
)
@login_required
def api_config_ax_taf_verify():
    tafid = str(UUID(request.form["tafid"]))
    attempt = request.form["attempt"]
    key = f"taf-{tafid}"
    if key not in session:
        return jsonify(dict(type="taf_nonexistent"))
    taf = session[key]
    if not taf["gen_done"]:
        return make_resp(
            error=dict(code="taf_gen_not_done", msg="TAF generation not done"),
        )
    verifier = taf["verifier"]
    params = taf["params"]
    state = taf.get("state")
    try:
        new_params, new_state, feedback, done = verifiers.verify(
            verifier,
            attempt,
            params,
            state,
            target_id=current_user.id,
        )
    except VerificationError as e:
        taf["solved"] = False
        return make_resp(
            error=dict(code="verification_failed", message=f"failed: {e}", data=str(e))
        )
    else:
        taf["solved"] = done
        taf["params"] = new_params
        taf["state"] = new_state
        session[key] = taf
        return make_resp(data=dict(done=done, feedback=feedback))


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
def api_config_id():
    if request.method == "GET":
        return make_resp(
            data=dict(
                user=dict(
                    uid=current_user.id,
                    slug=current_user.slug,
                    name=current_user.name,
                    perms=list(current_user.perms),
                    groups=[g.for_api_v1_trusted for g in current_user.groups],
                    **(
                        dict(
                            emails=[
                                e.for_api_v2 for e in current_user.primary_group.emails
                            ],
                            default_perms=list(
                                current_app.config["AIRY_DEFAULT_PERMS"]
                            ),
                            primary_group=current_user.primary_group.for_api_v1_trusted,
                        )
                        if current_user.primary_group
                        else {}
                    ),
                )
            )
        )
    elif request.method == "POST":
        data = request.json
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
        if "emails" in data:
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
        current_user.add_le(LogEntry(renderer="config_id", data=dict()))
        return make_resp()


@bp.route(
    "/config/id/img",
    methods=(
        "GET",
        "POST",
    ),
)
@req_perms(("api_v2.config.id",))
@login_required
def api_config_id_img():
    if "img" not in request.files:
        return make_resp(error=dict(code="no_file_part", message="no file"))
    file = request.files["img"]
    if file.filename == "":
        return make_resp(error=dict(code="no_file", message="no file"))
    if file:
        ext = os.path.splitext(file.filename)[1]
        if ext not in {".png", ".webp", ".jpg", ".jpeg"}:
            # TODO(nyiyui): update to
            # <https://pillow.readthedocs.io/en/stable/handbook/image-file-formats.html>
            return make_resp(
                error=dict(
                    code="unsupported_ext", message=f"unsupported file extension {ext}"
                )
            )
        upload_path = current_app.config["UPLOAD_PATH"]
        tmp_path = os.path.join(upload_path, f"img-tmp/{current_user.id}{ext}")
        dst = os.path.join(upload_path, f"img/{current_user.id}.webp")
        try:
            file.save(tmp_path)
            try:
                conv_to_webp(tmp_path, dst)
            except Exception:
                return make_resp(
                    error=dict(code="conversion_failed", message="conversion failed")
                )
        finally:
            os.remove(tmp_path)
        current_user.add_le(LogEntry(renderer="config_id_img", data=dict()))
        return make_resp()


########################################################################################
# OAuth
########################################################################################


@bp.route("/oauth/clients", methods=("GET", "POST"))
@login_required
@req_perms(("api_v2.oauth.clients",))
def oauth_clients():
    if request.method == "GET":
        pass
    return "", 501


@bp.route("/oauth/grants", methods=("GET",))
@login_required
@req_perms(("api_v2.oauth.grants",))
def oauth_grants():
    tokens = list(
        token.for_api_v2 for token in OAuth2Token.query.filter_by(user=current_user)
    )
    return make_resp(data=dict(grants=tokens))


@bp.route("/oauth/grants/revoke", methods=("POST",))
@login_required
@req_perms(("api_v2.oauth.grants",))
def oauth_grants_revoke():
    grant_id = request.form["grant_id"]
    try:
        OAuth2Token.query.filter_by(id=grant_id, user=current_user).delete()
    except NoResultFound:
        return make_resp(error=dict(code="grant_not_found", message="grant not found"))
    else:
        db.session.commit()
    return make_resp()


@bp.route("/oauth/oclient", methods=("GET",))
@login_required
@req_perms(("api_v2.oauth.oclients",))
def oauth_oclient():
    oclid = request.args["oclid"]
    ocl = OAuth2Client.query.filter_by(client_id=oclid).one()
    return make_resp(data=dict(oclient=ocl.as_dict()))


@bp.route("/oauth/oclients", methods=("GET",))
@login_required
@req_perms(("api_v2.oauth.oclients",))
def oauth_oclients():
    print(OAuth2Client.query.all(), current_user)
    print(OAuth2Client.query.filter_by(user=current_user).all())
    oclients = list(
        oclient.for_api_v2
        for oclient in OAuth2Client.query.filter_by(user=current_user)
    )
    return make_resp(data=dict(oclients=oclients))


OCLIENTS_DELETE_SCHEMA = {
    "$schema": "https://json-schema.org/draft/2019-09/schema",
    "type": "object",
    "properties": {
        "oclid": {"type": "string"},
    },
}


@bp.route("/oauth/oclients/delete", methods=("POST",))
@login_required
@req_perms(("api_v2.oauth.oclients.delete",))
def oauth_oclients_delete():
    jsonschema.validate(request.json, OCLIENTS_DELETE_SCHEMA)
    oclid = request.json["oclid"]
    try:
        OAuth2Client.query.filter_by(user=current_user, id=oclid).delete()
    except NoResultFound:
        return make_resp(error=dict(code="ocl_not_found", message="oclient not found"))
    return make_resp()


OCLIENTS_EDIT_SCHEMA = {
    "$schema": "https://json-schema.org/draft/2019-09/schema",
    "type": "object",
    "properties": {
        "oclid": {"type": "string"},
        "ocl": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "uri": {"type": "string"},
                "grant_types": {"type": "array", "items": {"type": "string"}},
                "redirect_uris": {"type": "array", "items": {"type": "string"}},
                "response_types": {"type": "array", "items": {"type": "string"}},
                "scope": {"type": "string"},
                "token_endpoint_auth_method": {"type": "string"},
            },
        },
    },
}


@bp.route("/oauth/oclients/edit", methods=("POST",))
@login_required
@req_perms(("api_v2.oauth.oclients.edit",))
def oauth_oclients_edit():
    jsonschema.validate(request.json, OCLIENTS_EDIT_SCHEMA)
    oclid = request.json.get("oclid")
    ocli = request.json["ocl"]
    try:
        if oclid is None:
            ocl = OAuth2Client(user=current_user)
        else:
            ocl = OAuth2Client.query.filter_by(user=current_user, id=oclid).one()
    except NoResultFound:
        return make_resp(error=dict(code="ocl_not_found", message="oclient not found"))
    ocl.set_client_metadata(ocli)
    db.session.is_modified = True
    db.session.commit()
    ocl = OAuth2Client.query.filter_by(user=current_user, id=oclid).one()
    return make_resp()


@bp.route("/oauth/azrq", methods=("GET",))
@login_required
def oauth_azrq():
    azrqid = str(UUID(request.args["azrqid"]))
    key = f"azrq-{azrqid}"
    if key not in session:
        return make_resp(
            error=dict(code="azrq_not_found", message="azrq not found"),
        )
    return make_resp(data=dict(args=session[key]["args"]))


def grant_as_dict(grant):
    """
    Converts a grant to a dict for authorization requests.
    """
    return dict(
        client=grant.client.as_dict(),
        request=dict(
            response_type=grant.request.response_type,
            redirect_uri=grant.request.redirect_uri,
            scope=grant.request.scope,
            state=grant.request.state,
        ),
    )


@bp.route("/oauth/az/step", methods=("POST",))
@login_required
def oauth_az_step():
    azrqid = request.args["azrqid"]
    args = session[f"azrq-{azrqid}"]["args"]
    for key, value in args.items():
        if key not in request.args:
            return "args mismatch (missing)", 400
        if request.args[key] != value:
            return "args mismtach (not equal)", 400
    try:
        grant = authorization.get_consent_grant(end_user=current_user)
    except OAuth2Error as error:
        return jsonify(dict(error.get_body()))
    return make_resp(
        data=dict(
            grant=dict(
                args=request.args.to_dict(),
                **grant_as_dict(grant),
            )
        )
    )


########################################################################################
# Generic
########################################################################################


def generic_get_model(name: str):
    if name == "le":
        return LogEntry
    if name == "grant":
        return OAuth2Token


@bp.route("/generic/assign/<name>", methods=("POST",))
@login_required
def generic_assign(name: str):
    ok, reason, missing = has_perms((f"api_v2.generic.assign.{name}",))
    if not ok:
        return perm_handler(list(missing), reason)
    Model = generic_get_model(name)
    ref = request.args["ref"]
    data = json.loads(request.body)
    try:
        single = Model.q(user=current_user).filter_by(id=ref).one()
        single.generic_deserialize(data)
    except NoResultFound:
        return make_resp(error=dict(code="not_found"))
    except MultipleResultsFound:
        return make_resp(error=dict(code="multiple")), 500
    db.session.commit()
    return ""


@bp.route("/generic/del/<name>", methods=("POST",))
@login_required
def generic_del(name: str):
    ok, reason, missing = has_perms((f"api_v2.generic.del.{name}",))
    if not ok:
        return perm_handler(list(missing), reason)
    Model = generic_get_model(name)
    ref = request.args["ref"]
    try:
        Model.q(user=current_user).filter_by(id=ref).delete()
    except NoResultFound:
        return make_resp(error=dict(code="not_found"))
    except MultipleResultsFound:
        return make_resp(error=dict(code="multiple")), 500
    db.session.commit()
    return ""


@bp.route("/generic/deref/<name>", methods=("GET",))
@login_required
def generic_deref(name: str):
    ok, reason, missing = has_perms((f"api_v2.generic.deref.{name}",))
    if not ok:
        return perm_handler(list(missing), reason)
    Model = generic_get_model(name)
    ref = request.args["ref"]
    try:
        single = Model.q(user=current_user).filter_by(id=ref).one()
    except NoResultFound:
        return make_resp(error=dict(code="not_found"))
    except MultipleResultsFound:
        return make_resp(error=dict(code="multiple")), 500
    return make_resp(data=dict(single=single.generic_serialize()))


# @bp.route("/generic/list/<name>", methods=("GET",))
# @login_required
# def generic_list(name: str):
#     ok, reason, missing = has_perms((f"api_v2.generic.list.{name}",))
#     if not ok:
#         return perm_handler(list(missing), reason)
#     Model = generic_get_model(name)
#     ref = request.args["ref"]
#     page = request.args["page"]
#     per_page = request.args["per_page"]
#     values = Model.query.filter_by(user=current_user, id=ref).paginate(
#         page, per_page, error_out=False
#     )
#     if name == "log":
#         values = values.order_by(Model.created.desc())
#     else:
#         raise TypeError("invalid name")
#     values = list(le.generic_serialize for le in values)
#     return make_resp(data=dict(values=values))


@bp.route("/generic/seek/<name>", methods=("GET",))
@login_required
def generic_seek(name: str):
    ok, reason, missing = has_perms((f"api_v2.generic.seek.{name}",))
    if not ok:
        return perm_handler(list(missing), reason)
    Model = generic_get_model(name)
    direction = request.args["direction"]
    offset = int(request.args["offset"])
    length = int(request.args["length"])
    q = Model.q(user=current_user, direction=direction)
    if direction not in ("n", "p"):
        return make_resp(error=dict(code="not_p_nor_n")), 400
    q = q.offset(offset).limit(
        min(length, current_app.config["AIRY_GENERIC_LIMIT_MAX"])
    )
    q = q.with_entities(Model.id)
    return make_resp(data=dict(refs=list(a[0] for a in q.all())))


@bp.route("/generic/total/<name>", methods=("GET",))
@login_required
def generic_total(name: str):
    ok, reason, missing = has_perms((f"api_v2.generic.total.{name}",))
    if not ok:
        return perm_handler(list(missing), reason)
    Model = generic_get_model(name)
    return make_resp(data=dict(total=Model.q(user=current_user).count()))


########################################################################################
# Logs
########################################################################################


@bp.route("/logs", methods=("GET",))
@login_required
@req_perms(("api_v2.logs",))
def logs():
    logs = LogEntry.query.filter_by(user=current_user)
    logs = list(le.for_api_v2_trusted for le in logs)
    return make_resp(data=dict(logs=logs))


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
@req_perms(("api_v2.ul",))
def uls_list():
    uls = UserLogin.query.filter_by(user=current_user)
    return make_resp(
        data=dict(
            uls=[
                dict(
                    **ul.for_api_v2_trusted,
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
