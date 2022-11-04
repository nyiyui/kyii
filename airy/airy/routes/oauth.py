import uuid
from pathlib import Path
from urllib.parse import urlencode, urljoin

from authlib.integrations.flask_oauth2 import current_token
from authlib.jose import JsonWebKey, KeySet
from authlib.oauth2 import OAuth2Error
from flask import Blueprint, current_app, jsonify, redirect, request, session, url_for, render_template
from flask_cors import CORS
from werkzeug.datastructures import ImmutableMultiDict

from ..etc import csrf
from ..oauth2 import authorization, generate_user_info, require_oauth
from ..ul import current_user, login_required

bp = Blueprint("oauth", __name__)


def init_app(app):
    app.register_blueprint(bp)
    CORS(app)


@bp.route("/oauth/authorize", methods=("GET",))
def oauth_authorize():
    KEYS = [
        "response_type",
        "client_id",
        "redirect_uri",
        "scope",
        "state",
        "code_challenge",
        "code_challenge_method",
    ]
    args = {}
    for key in KEYS:
        if key in request.args:
            args[key] = request.args[key]
    try:
        grant = authorization.get_consent_grant(end_user=current_user)
    except OAuth2Error as error:
        return render_template("silica/oauth/error.html",
                               step="get_consent_grant", error=dict(error.get_body()))
    return render_template("silica/oauth/authz.html", args=args, grant=grant)


@bp.route("/oauth/authorize", methods=("POST",))
@login_required
def oauth_authorize_post():
    # SAFETY: If action_allow and action_deny are both present, default to deny.
    if "action_deny" in request.form:
        grant_user = None
    elif "action_allow" in request.form:
        grant_user = current_user
    else:
        return "invalid choice", 400
    scopes = [key[6:] for key in filter(lambda key: key.startswith('scope_'), request.form.keys())]
    r = request
    r.args = ImmutableMultiDict({
        **request.args,
        "scope": " ".join(scopes),
    })
    return authorization.create_authorization_response(request=r, grant_user=grant_user)


@bp.route("/oauth/token", methods=("POST",))
@csrf.exempt
def oauth_token():
    return authorization.create_token_response()


@bp.route("/oauth/userinfo")
@require_oauth("profile")
def oauth_userinfo():
    return jsonify(generate_user_info(current_token.user, current_token.scope))


@bp.route("/.well-known/openid-configuration")
def openid_configuration():
    def external_url(function_name):
        return url_for(function_name, _external=True)

    # NOTE: see https://ldapwiki.com/wiki/Openid-configuration
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
        "grant_types_supported": [*current_app.config["OAUTH2_GRANT_TYPES"]],
        # TODO: impl introspection_endpoint field
        # TODO: impl revocation_endpoint field
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
