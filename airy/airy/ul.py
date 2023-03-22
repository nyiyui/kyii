from functools import wraps
from typing import Optional, Tuple, Set
from urllib.parse import urlencode
from datetime import datetime

from flask import (
    _request_ctx_stack,
    abort,
    current_app,
    has_request_context,
    jsonify,
    request,
    session,
    flash,
    url_for,
    redirect,
)
from server_timing import Timing as t
from sqlalchemy.orm.exc import NoResultFound
from werkzeug.local import LocalProxy
from flask_babel import _

from .db import User, UserLogin, db, gen_id
from .session import SILICA_ULIDS, SILICA_CURRENT_ULID, SILICA_UL_MAP

TOKEN_HEADER = "X-Airy-Token"
TOKEN_NAME = "_airy_token"
ARG_NAME = "ul"
SHORT_NAME = "u"

current_ul = LocalProxy(lambda: _get_current_ul())
current_user = LocalProxy(lambda: _get_current_ul().user)


def _get_current_ul():
    if has_request_context() and not hasattr(_request_ctx_stack.top, "airy_ul"):
        current_app.ul_manager._load_ul()

    return getattr(_request_ctx_stack.top, "airy_ul", None)


def get_extra() -> dict:
    return dict(
        remote=request.remote_addr,
        headers={
            "key": (
                list(
                    request.headers[key]
                    for key in set(request.headers.keys())
                    & {
                        "User-Agent",
                        "Sec-Ch-Ua",
                        "Sec-Ch-Mobile",
                        "Sec-Ch-Ua-Platform",
                    }
                )
            )
        },
    )


def setup_pre_login_ul(u: User) -> UserLogin:
    ul = UserLogin(
        id=gen_id(),
        user=u,
        sid2=UserLogin.get_sid2(),
        extra=get_extra(),
    )
    db.session.add(ul)
    db.session.commit()
    return ul


def login_user(u: User, apid: Optional[str]) -> Tuple[UserLogin, str]:
    ul = (
        UserLogin.query.filter_by(
            sid2=UserLogin.get_sid2(),
            user=u,
        )
        .order_by(UserLogin.attempt.desc())
        .first()
    )  # TODO: race condition here, so have some kind of mutex to prevent new UserLogins (a good rate-limiting measure aniway)
    ul.against_id = apid
    ul.start = datetime.utcnow()
    token_secret = ul.gen_token()
    db.session.commit()
    return ul, f"ul{ul.id}:{token_secret}"


def logout_user() -> None:
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


def req_perms(perms: Set[str]):
    def inner(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if current_ul.is_authenticated:
                if perms - current_ul.user.perms == set():
                    return f(*args, **kwargs)
                else:
                    abort(403)
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
        flash(_("ログインが必要です。"), "warning")
        return redirect(
            url_for("silica.login", next=request.path, nextargs=urlencode(request.args))
        )

    def __get_ul(self, token):
        return UserLogin.query.filter_by(token=token).first()

    def _load_ul(self):
        with t.time("load_ul"):
            token = request.headers.get(TOKEN_HEADER)
            if token is None:
                token = request.form.get(TOKEN_NAME)
            if token is not None:
                # For APIs
                ulid, token_secret = token.split(":", 1)
                ulid = ulid.split("ul", 1)[1]
                try:
                    ul = UserLogin.query.filter_by(id=ulid).one()
                except NoResultFound:
                    abort(self.unauthenticated())
                    return
                with t.time("load_ul.check_token"):
                    ok = ul.verify_token(token_secret)
                if not ok:
                    abort(self.unauthenticated())
                    return
            elif (ulids := session.get(SILICA_ULIDS)) is not None:
                # For Silica
                ulid = (
                    session.get(SILICA_CURRENT_ULID)
                    or request.args.get(ARG_NAME)
                    or session.get(SILICA_UL_MAP, {}).get(request.args.get(SHORT_NAME))
                )
                if not ulid:
                    ul = AnonymousUserLogin()
                    _request_ctx_stack.top.airy_ul = ul
                else:
                    if ulid not in ulids:
                        if SILICA_CURRENT_ULID in session:
                            session[SILICA_CURRENT_ULID] = None
                        flash(_("不正（セッションデータに無い）なログインIDが指定されたので、初期化しました。"), "error")
                        abort(403)
                        return
                    try:
                        ul = UserLogin.query.filter_by(id=ulid).one()
                    except NoResultFound:
                        if SILICA_CURRENT_ULID in session:
                            session[SILICA_CURRENT_ULID] = None
                        flash(_("不正（データベースに無い）なログインIDが指定されたので、初期化しました。"), "error")
                        abort(403)
                        return
            else:
                ul = AnonymousUserLogin()
                _request_ctx_stack.top.airy_ul = ul
            if ul.is_authenticated and ul.revoked:
                session[SILICA_CURRENT_ULID] = None
                abort(403)
                return
            _request_ctx_stack.top.airy_ul = ul
            with t.time("load_ul.see"):
                if ul.is_authenticated and ul.see():
                    db.session.commit()
