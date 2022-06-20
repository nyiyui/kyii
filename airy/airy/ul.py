from functools import wraps
from typing import Optional, Tuple

from flask import (
    _request_ctx_stack,
    abort,
    current_app,
    has_request_context,
    jsonify,
    request,
)
from sqlalchemy.orm.exc import NoResultFound
from werkzeug.local import LocalProxy

from .db import User, UserLogin, db, gen_uuid

TOKEN_HEADER = "X-Airy-Token"

current_ul = LocalProxy(lambda: _get_current_ul())
current_user = LocalProxy(lambda: _get_current_ul().user)


def _get_current_ul():
    if has_request_context() and not hasattr(_request_ctx_stack.top, "airy_ul"):
        current_app.ul_manager._load_ul()

    return getattr(_request_ctx_stack.top, "airy_ul", None)


def login_user(u: User, apid: Optional[str]) -> Tuple[UserLogin, str]:
    # flask_login.login_user(u)
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
    token_secret = ul.gen_token()
    db.session.add(ul)
    db.session.commit()
    return ul, f"ul{ul.id}:{token_secret}"


def logout_user() -> None:
    # flask_login.logout_user()
    ul = current_ul
    if not ul:
        raise RuntimeError("No user logged in")
    ul.revoke("logout")
    db.session.commit()


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if current_ul.is_authenticated:
            return f(*args, **kwargs)
        else:
            return current_app.ul_manager.unauthenticated()

    return decorated_function


class AnonymousUser:
    @property
    def is_active(self):
        return False

    @property
    def is_anonymous(self):
        return True


class AnonymousUserLogin:
    @property
    def is_active(self):
        return True

    @property
    def is_anonymous(self):
        return True

    @property
    def is_authenticated(self):
        return False

    @property
    def user(self):
        return AnonymousUser()


class ULManager:
    def __init__(self, app=None):
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        app.ul_manager = self

    def unauthenticated(self):
        resp = jsonify(
            dict(
                errors=[
                    dict(
                        code="unauthenticated",
                        message="Unauthorized",
                    )
                ]
            )
        )
        resp.status_code = 401
        return resp

    def __get_ul(self, token):
        return UserLogin.query.filter_by(token=token).first()

    def _load_ul(self):
        token = request.headers.get(TOKEN_HEADER)
        if token is not None:
            ulid, token_secret = token.split(":", 1)
            ulid = ulid.split("ul", 1)[1]
            try:
                ul = UserLogin.query.filter_by(id=ulid).one()
            except NoResultFound:
                abort(self.unauthenticated())
                return
            if ul.verify_token(token_secret):
                if ul.revoked:
                    abort(self.unauthenticated())
                    return
                _request_ctx_stack.top.airy_ul = ul
                return
        ul = AnonymousUserLogin()
        _request_ctx_stack.top.airy_ul = ul
