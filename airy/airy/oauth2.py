"""
oauth2.py implements OAuth 2- and OpenID Connect-related functionality.
"""

from authlib.integrations.flask_oauth2 import AuthorizationServer, ResourceProtector
from authlib.integrations.sqla_oauth2 import (
    create_bearer_token_validator,
    create_query_client_func,
    create_save_token_func,
)
from authlib.oauth2.rfc7636 import CodeChallenge
from authlib.oauth2.rfc6749.grants import (
    AuthorizationCodeGrant as _AuthorizationCodeGrant,
    RefreshTokenGrant as _RefreshTokenGrant,
    ClientCredentialsGrant as _ClientCredentialsGrant,
)
from authlib.oidc.core import UserInfo
from authlib.oidc.core.grants import OpenIDCode as _OpenIDCode
from authlib.oidc.core.grants import OpenIDHybridGrant as _OpenIDHybridGrant
from authlib.oidc.core.grants import OpenIDImplicitGrant as _OpenIDImplicitGrant
from flask_login import current_user
from werkzeug.security import gen_salt

from .db import OAuth2AuthorizationCode, OAuth2Client, OAuth2Token, User, db

JWT_CONFIG = None


def exists_nonce(nonce, req):
    exists = OAuth2AuthorizationCode.query.filter_by(
        client_id=req.client_id, nonce=nonce
    ).first()
    return bool(exists)


def generate_user_info(user, scope):
    return UserInfo(sub=str(user.id), name=user.name)  # TODO: per-client sub


def create_authorization_code(client, grant_user, request):
    code = gen_salt(48)
    nonce = request.data.get("nonce")
    item = OAuth2AuthorizationCode(
        code=code,
        client_id=client.client_id,
        redirect_uri=request.redirect_uri,
        scope=request.scope,
        user_id=grant_user.id,
        nonce=nonce,
    )
    db.session.add(item)
    db.session.commit()
    return code


class AuthorizationCodeGrant(_AuthorizationCodeGrant):
    def create_authorization_code(self, client, grant_user, request):
        return create_authorization_code(client, grant_user, request)

    def query_authorization_code(self, code, client):
        item = OAuth2AuthorizationCode.query.filter_by(
            code=code, client_id=client.client_id
        ).first()
        if item and not item.is_expired():
            return item

    def delete_authorization_code(self, ac):
        db.session.delete(ac)
        db.session.commit()

    def authenticate_user(self, authorization_code):
        return User.query.get(authorization_code.user_id)

    def save_authorization_code(self, code, request):
        # TODO: pkce:
        # <https://github.com/authlib/example-oauth2-server/blob/master/website/oauth2.py>
        client = request.client
        ac = OAuth2AuthorizationCode(
            code=code,
            client_id=client.client_id,
            redirect_uri=request.redirect_uri,
            scope=request.scope,
            user_id=current_user.id,
        )
        db.session.add(ac)
        db.session.commit()
        return ac


class RefreshTokenGrant(_RefreshTokenGrant):
    TOKEN_ENDPOINT_AUTH_METHODS = ["client_secret_basic", "client_secret_post"]


class ClientCredentialsGrant(_ClientCredentialsGrant):
    TOKEN_ENDPOINT_AUTH_METHODS = ["client_secret_basic", "client_secret_post"]


class OpenIDCode(_OpenIDCode):
    def exists_nonce(self, nonce, request):
        return exists_nonce(nonce, request)

    def get_jwt_config(self, grant):
        return JWT_CONFIG

    def generate_user_info(self, user, scope):
        return generate_user_info(user, scope)


class ImplicitGrant(_OpenIDImplicitGrant):
    def exists_nonce(self, nonce, request):
        return exists_nonce(nonce, request)

    def get_jwt_config(self, grant):
        return JWT_CONFIG

    def generate_user_info(self, user, scope):
        return generate_user_info(user, scope)


class HybridGrant(_OpenIDHybridGrant):
    def create_authorization_code(self, client, grant_user, request):
        return create_authorization_code(client, grant_user, request)

    def exists_nonce(self, nonce, request):
        return exists_nonce(nonce, request)

    def get_jwt_config(self):
        return JWT_CONFIG

    def generate_user_info(self, user, scope):
        return generate_user_info(user, scope)


authorization = AuthorizationServer()
require_oauth = ResourceProtector()


def config_oauth(app):
    global JWT_CONFIG
    JWT_CONFIG = app.config["JWT_CONFIG"]
    query_client = create_query_client_func(db.session, OAuth2Client)
    save_token = create_save_token_func(db.session, OAuth2Token)
    authorization.init_app(app, query_client=query_client, save_token=save_token)

    # support all openid grants
    authorization.register_grant(
        AuthorizationCodeGrant,
        [
            OpenIDCode(require_nonce=False),  # TODO: fix mCTF to add nonce
            CodeChallenge(required=False),
        ],
    )
    authorization.register_grant(RefreshTokenGrant)
    authorization.register_grant(ClientCredentialsGrant)
    app.config["OAUTH2_GRANT_TYPES"] = set(
        cls.GRANT_TYPE
        for cls, _ in [
            *authorization._authorization_grants,
            *authorization._token_grants,
        ]
    )

    # protect resource
    bearer_cls = create_bearer_token_validator(db.session, OAuth2Token)
    require_oauth.register_token_validator(bearer_cls())
