from flask import Blueprint, render_template, request, abort, Response
from typing import Tuple
from uuid import UUID
import jsonschema
import json
from typing import List
from marshmallow import Schema, fields, validate
from ..db import APSchema, AFSchema
from datetime import datetime
from ..verifiers import VerificationError
from flask_login import current_user, login_required, logout_user
from ..db import User, AP, AF, UserLogin, ap_reqs, db
from sqlalchemy.exc import MultipleResultsFound, NoResultFound
from flask_login import current_user
from .util import current_user_login, login_user, update_ul_last
from typing import Optional
from flask_cors import CORS
from flask import session, jsonify
from ..session import API_V1_APID, API_V1_SOLVED, API_V1_UID
from ..util import req_perms


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


@api_v1.route("/api/v1/username", methods=("GET",))  # TODO: fix to "/status"
@update_ul_last
def api_username():
    slug = request.args["username"]
    try:
        u = User.query.filter_by(slug=slug).one()
    except MultipleResultsFound:
        abort(Response(response="multiple found", status=500))  # ooopsie
        return
    except NoResultFound:
        return dict(exists=False)
    return dict(exists=True)


@api_v1.route("/api/v1/uls", methods=("GET",))
@login_required
@update_ul_last
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
@update_ul_last
def api_uls_revoke():
    ul = UserLogin.query.filter_by(user=current_user, id=request.json["ulid"]).one()
    ul.revoke("revoke")
    db.session.commit()
    return {}
@api_v1.route("/api/v1/uls/delete", methods=("POST",))
@login_required
@update_ul_last
def api_uls_delete():
    ul = UserLogin.query.filter_by(user=current_user, id=request.json["ulid"]).delete()
    db.session.commit()
    return {}


@api_v1.route("/api/v1/uls/edit", methods=("POST",))
@login_required
@update_ul_last
def api_uls_edit():
    ul = UserLogin.query.filter_by(user=current_user, id=request.json["ulid"]).one()
    ul.name = request.json["name"]
    db.session.commit()
    return {}


@api_v1.route("/api/v1/logged_in", methods=("GET",))
@update_ul_last
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
@update_ul_last
def api_status():
    user = current_user
    if user.is_anonymous:
        return dict(
            user=None,
            user_session=None,
        )
    ul = current_user_login()
    if ul is None:
        abort(Response(response="logged in but UserLogin not found!", status=400))
        return
    return dict(
        user=dict(username=user.slug, uuid=user.id),
        user_session=dict(uuid=ul.id, name=ul.name, against=ul.against_id),
    )


@api_v1.route("/api/v1/csrf_token", methods=("GET",))
@update_ul_last
def api_csrf_token():
    csrf_token = render_template("api_v1/csrf_token.html")
    return dict(csrf_token=csrf_token)
    # return dict(csrf_token=session["_csrf_token"])


@api_v1.route("/api/v1/logout", methods=("POST",))
@login_required
@update_ul_last
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
    slug = request.form["username"]
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
    apid = str(UUID(request.form["ap_uuid"]))
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
    afid = str(UUID(request.form["af_uuid"]))
    cr = request.form["challenge_response"]
    try:
        af = AF.query.filter_by(id=afid).one()
    except MultipleResultsFound:
        abort(Response(response="multiple AFs found", status=500))  # ooopsie
        return
    except NoResultFound:
        abort(Response(response="no AF found", status=400))  # hmdge
        return
    u = User.query.get(uid := session[API_V1_UID])
    if af.user != u:
        abort(
            Response(response="chosen AF is not owned by chosen user", status=403)
        )  # hmdge
        return
    try:
        af.verify(cr)
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


class IdRequestSchema(Schema):
    slug = fields.Str(required=True, validate=validate.Length(max=128))
    name = fields.Str(required=True, validate=validate.Length(max=256))
    email = fields.Str()


V1_CONFIG_ID_SCHEMA = {  # TODO: move this to separate file?
    "$schema": "https://json-schema.org/draft/2019-09/schema",
    "type": "object",
    "properties": {
        "slug": {"type": "string", "minLength": 1, "maxLength": 128},
        "name": {"type": "string", "minLength": 1, "maxLength": 256},
        "email": {"type": "string", "format": "email"},
    },
}


def dbify_af(data: dict, user=current_user) -> Tuple[UUID, Optional[dict]]:
    # NOTE: data["params"] is gen_params here
    feedback = None
    if data["uuid"] != "":
        af = AF.query.filter_by(id=data["uuid"], user=user).one()
        af.name = data["name"]
        af.verifier = data["verifier"]
        if data["regen"]:
            feedback = af.regen_params(data["params"])
    else:
        af = AF(
            user=user,
            name=data["name"],
            verifier=data["verifier"],
            gen_params=data["params"],
        )
    db.session.add(af)
    return af.id, feedback


def dbify_ap(data: dict, afids: List[UUID], user=current_user) -> UUID:
    if data["uuid"] != "":
        ap = AP.query.filter_by(id=data["uuid"], user=user).one()
    else:
        ap = AP(user=user)
    ap.name = data["name"]
    ap.reqs = list(map(lambda n: AF.query.get(afids[n]), data["reqs"]))
    db.session.add(ap)
    return ap.id


def dbify_ax(data: dict, user=current_user) -> Tuple[List[UUID], List[Optional[dict]]]:
    afids = {}
    feedbacks = {}
    for af_raw in data["afs"]:
        n = af_raw["key"]
        af = af_raw["value"]
        afids[n], feedback = dbify_af(af)
        feedbacks[n] = feedback
    apids = list(dbify_ap(ap, afids, user=user) for ap in data["aps"])
    # TODO: optimize peephole (add ap and then del)
    for del_ap in data["del_aps"]:
        AP.query.filter_by(id=del_ap, user=user).delete()
    for del_af in data["del_afs"]:
        AF.query.filter_by(id=del_af, user=user).delete()
    return apids, feedbacks


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
                    "reqs": {"type": "array", "items": {"type": "integer"}},
                },
            },
        },
        "del_aps": {"type": "array", "items": {"type": "string"}},
        "afs": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "key": {"type": "integer"},
                    "value": {
                        "type": "object",
                        "properties": {
                            "uuid": {"type": "string", "format": "uuid"},
                            "name": {"type": "string"},
                            "verifier": {"type": "string"},
                            "params": {"type": "object"},
                        },
                    },
                },
            },
        },
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
@login_required
@update_ul_last
def api_config_ax():
    if request.method == "GET":
        afs = AF.query.filter_by(user=current_user)
        aps = AP.query.filter_by(user=current_user)
        return dict(
            afs=list(af.for_api_v1_trusted for af in afs),
            aps=list(ap.for_api_v1_trusted for ap in aps),
        )
    elif request.method == "POST":
        # TODO: require solving {all AFs} or {enough AFs to pass via at laest 1 AP} before changes are made (to db)
        jsonschema.validate(request.json, V1_CONFIG_AX_SCHEMA)
        _, feedbacks = dbify_ax(request.json)
        db.session.commit()
        return dict(
            feedbacks=feedbacks,
        )


@api_v1.route(
    "/api/v1/config/id",
    methods=(
        "GET",
        "POST",
    ),
)
@login_required
@update_ul_last
def api_config_id():
    if request.method == "GET":
        return dict(
            user=dict(
                slug=current_user.slug,
                name=current_user.name,
                email=current_user.email,
            )
        )
    elif request.method == "POST":
        schema = IdRequestSchema()
        req = schema.load(request.json)
        current_user.slug = req["slug"]
        current_user.name = req["name"]
        current_user.email = req["email"]
        db.session.commit()
        return ""


@api_v1.route("/api/v1/signup", methods=("POST",))
@req_perms(("api_v1.signup",), perm_handler)
@update_ul_last
def api_signup():
    if not current_user.is_anonymous:
        resp = jsonify(dict(type="logged_in"))
        resp.status_code = 403
        abort(resp)
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
    )  # NOTE: not using 201 as it requires Location (?), but signup doesn't return one
