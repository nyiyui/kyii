from typing import Optional
from urllib.parse import urlencode, urljoin

from flask_qrcode import QRcode
from blinker import Namespace
from flask import current_app, redirect, request, session, g
from flask_babel import Babel
from flask_caching import Cache
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_login import LoginManager
from flask_login import login_user as login_user2
from flask_login import current_user as current_user2
from flask_mail import Mail
from flask_wtf.csrf import CSRFProtect
from server_timing import Timing

from .db import User, UserLogin
from .ul import ULManager, current_user, current_ul

signals = Namespace()

csrf = CSRFProtect()

ulm = ULManager()

babel = Babel()


@babel.localeselector
def get_locale():
    lang = g.lang = request.accept_languages.best_match(current_app.config["LANGUAGES"])
    return lang


def current_user_login() -> Optional[UserLogin]:
    if "ulid" in session:
        ulid = session["ulid"]
        return UserLogin.query.get(ulid)
    return None


login_manager = LoginManager()


@login_manager.user_loader
def load_user(uid: str) -> Optional[User]:
    ul = current_user_login()
    if ul is None:
        return None
    if ul.end is not None:
        return None
    return User.query.get(uid)


@login_manager.unauthorized_handler
def unauthorized_callback():
    if current_app.config["KYII_YUUI"]:
        base = urljoin(current_app.config["KYII_YUUI_ORIGIN"], "/closet")
        query = urlencode({"next": request.path, "args": urlencode(request.args)})
        return redirect(f"{base}?{query}")
    raise TypeError("KYII_YUUI is not set")


def login_ul(ul: UserLogin, **kwargs):
    if (
        current_user2.is_authenticated
        and current_user2.id == ul.user.id
        and session["ulid"] == ul.id
    ):
        return
    session["ulid"] = ul.id
    login_user2(ul.user, **kwargs)


mail = Mail()


cache = Cache()


limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["2000 per hour"],
)


def init_app(app):
    csrf.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)
    babel.init_app(app)

    @app.context_processor
    def utility_processor():
        # this ensures  g.lang is injected before any _ etc call (needed for <html lang="{{ g.lang }}">)
        babel.locale_selector_func()
        return {}

    ulm.init_app(app)

    @app.context_processor
    def utility_processor():
        # this ensures  g.lang is injected before any _ etc call (needed for <html lang="{{ g.lang }}">)
        return dict(
            current_user=current_user,
            current_ul=current_ul,
        )

    cache.init_app(app)
    limiter.init_app(app)
    QRcode(app)
    Timing(app, force_debug=app.config["AIRY_TIMING"])

    @app.before_request
    def before_request():
        Timing.start("request")

    @app.after_request
    def before_request(resp):
        Timing.stop("request")
        return resp
