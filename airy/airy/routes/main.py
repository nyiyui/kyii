import json
from pathlib import Path
import logging
import time
import uuid
from datetime import datetime
from typing import Optional
from urllib.parse import urlencode, urljoin

from authlib.integrations.flask_oauth2 import current_token
from authlib.oauth2 import OAuth2Error
from authlib.jose import JsonWebKey, KeySet
from flask import (Blueprint, Response, abort, current_app, g, jsonify,
                   redirect, render_template, request, session, url_for)
from flask_login import current_user, login_required, login_user, logout_user
from werkzeug.security import gen_salt

from ..db import AF, AP, OAuth2Client, User, UserLogin, db
from ..etc import csrf, login_manager
from ..oauth2 import authorization, generate_user_info, require_oauth

bp = Blueprint("main", __name__)


@login_manager.unauthorized_handler
def unauthorized_callback():
    if current_app.config["KYII_YUUI"]:
        base = urljoin(current_app.config["KYII_YUUI_ORIGIN"], "/closet")
        query = urlencode({"next": request.path, "args": urlencode(request.args)})
        return redirect(f"{base}?{query}")
    else:
        return redirect(
            url_for("rika.login", next=request.path, args=urlencode(request.args))
        )


def init_app(app):
    app.register_blueprint(bp)


@bp.route("/login-check", methods=("GET",))
def login_check():
    return jsonify(
        user=repr(current_user),
        session=repr(session),
    )


@bp.route("/", methods=("GET", "POST"))
@login_required
def home():
    if request.method == "POST":
        username = request.form.get("username")
        user = User.query.filter_by(username=username).first()
        if not user:
            user = User(username=username)
            db.session.add(user)
            db.session.commit()
        session["id"] = user.id
        return redirect("/")
    user = current_user
    if user:
        clients = OAuth2Client.query.filter_by(user_id=user.id).all()
    else:
        clients = []
    return render_template("home.html", user=user, clients=clients)


def split_by_crlf(s):
    return [v for v in s.splitlines() if v]


@bp.route("/create_client", methods=("GET", "POST"))
@login_required
def create_client():
    user = current_user
    if not user:
        return redirect("/")
    if request.method == "GET":
        return render_template("create_client.html")
    form = request.form
    client_id = gen_salt(24)
    client = OAuth2Client(client_id=client_id, user_id=user.id)
    # Mixin doesn't set the issue_at date
    client.client_id_issued_at = int(time.time())
    if client.token_endpoint_auth_method == "none":
        client.client_secret = ""
    else:
        client.client_secret = gen_salt(48)

    client_metadata = {
        "client_name": form["client_name"],
        "client_uri": form["client_uri"],
        "grant_types": split_by_crlf(form["grant_type"]),
        "redirect_uris": split_by_crlf(form["redirect_uri"]),
        "response_types": split_by_crlf(form["response_type"]),
        "scope": form["scope"],
        "token_endpoint_auth_method": form["token_endpoint_auth_method"],
    }
    client.set_client_metadata(client_metadata)
    db.session.add(client)
    db.session.commit()
    return redirect("/")


def grant_as_dict(grant):
    return dict(
        client=grant.client.as_dict(),
        request=dict(
            response_type=grant.request.response_type,
            redirect_uri=grant.request.redirect_uri,
            scope=grant.request.scope,
            state=grant.request.state,
        ),
    )


@bp.route("/oauth/authorize", methods=["GET", "POST"])
@login_required
def oauth_authorize():
    user = current_user
    if request.method == "GET":
        try:
            grant = authorization.get_consent_grant(end_user=user)
        except OAuth2Error as error:
            return jsonify(dict(error.get_body()))
        if current_app.config["KYII_YUUI"]:
            base = urljoin(current_app.config["KYII_YUUI_ORIGIN"], "/authz")
            azrqid = uuid.uuid4()
            session[f"azrq-{azrqid}"] = dict(
                grant=(
                    {
                        "args": dict(azrqid=azrqid, **request.args.to_dict()),
                        **grant_as_dict(grant),
                    }
                )
            )
            query = urlencode(dict(azrqid=azrqid))
            return redirect(f"{base}?{query}")
        else:
            return render_template("authz.html", user=user, grant=grant)
    if "azrqid" not in request.args:
        return "azrqid required", 400
    azrqid = request.args["azrqid"]
    del session[f"azrq-{azrqid}"]
    if "action_allow" in request.form:
        grant_user = user
    else:
        grant_user = None
    return authorization.create_authorization_response(grant_user=grant_user)


@bp.route("/oauth/token", methods=["POST"])
@csrf.exempt
def oauth_token():
    resp = authorization.create_token_response()
    return resp


@bp.route("/oauth/userinfo")
@require_oauth("profile")
def oauth_userinfo():
    return jsonify(generate_user_info(current_token.user, current_token.scope))


@bp.route("/.well-known/openid-configuration")
def openid_configuration():
    def external_url(function_name):
        return url_for(function_name, _external=True)

    return {
        "authorization_endpoint": external_url(".oauth_authorize"),
        "token_endpoint": external_url(".oauth_token"),
        "userinfo_endpoint": external_url(".oauth_userinfo"),
        "jwks_uri": external_url(".jwks_endpoint"),
        "id_token_signing_alg_values_supported": ["RS256"],
        "issuer": current_app.config["OAUTH2_JWT_ISS"],
        "response_types_supported": [
            "code",
        ],
        "subject_types_supported": ["public"],
        "token_endpoint_auth_methods_supported": [
            "client_secret_post",
            "client_secret_basic",
        ],
    }


def load_public_keys():
    if "OAUTH2_JWT_KEY_PATH" in current_app.config:
        public_key_path = current_app.config["OAUTH2_JWT_KEY_PATH"]
        public_key = JsonWebKey.import_key(Path(public_key_path).read_bytes())
    else:
        public_key = JsonWebKey.import_key(current_app.config["OAUTH2_JWT_KEY"])
    return KeySet([public_key])

@bp.route("/.well-known/jwks.json")
def jwks_endpoint():
    pks = load_public_keys()
    return pks.as_dict()
