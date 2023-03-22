import time
from typing import Optional

from flask_qrcode import QRcode
from blinker import Namespace
from flask import current_app, request, session, g
from flask_babel import Babel
import flask_babel
from flask_caching import Cache
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_mail import Mail
from flask_moment import Moment
from flask_moment import moment
from flask_wtf.csrf import CSRFProtect
from server_timing import Timing

from .db import UserLogin
from .ul import ULManager, current_user, current_ul


signals = Namespace()

csrf = CSRFProtect()

ulm = ULManager()

babel = Babel()

moment_ = Moment()


def get_locale() -> str:
    lang = g.lang = request.accept_languages.best_match(current_app.config["LANGUAGES"])
    return lang


def current_user_login() -> Optional[UserLogin]:
    if "ulid" in session:
        ulid = session["ulid"]
        return UserLogin.query.get(ulid)
    return None


mail = Mail()


cache = Cache()


limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["2000 per hour"],
)


def format_time(t):
    now = time.time()
    if now - t.timestamp() < 604800:
        return moment(t).fromNow()
    else:
        return moment(t).format("LLL")


def init_app(app) -> None:
    csrf.init_app(app)
    mail.init_app(app)
    babel.init_app(app, locale_selector=get_locale)

    @app.context_processor
    def utility_processor():
        # ensure g.lang is injected before (needed for <html lang="{{ g.lang }}">)
        get_locale()
        return dict(
            current_user=current_user,
            current_ul=current_ul,
        )

    ulm.init_app(app)
    cache.init_app(app)
    limiter.init_app(app)
    QRcode(app)
    Timing(app, force_debug=app.config["AIRY_TIMING"])

    @app.before_request
    def before_request():
        Timing.start("request")

    @app.after_request
    def after_request(resp):
        Timing.stop("request")
        return resp

    KEYS = ["format_datetime", "format_date", "format_time"]
    for key in KEYS:
        app.jinja_env.filters[key] = getattr(flask_babel, key)

    app.jinja_env.globals["now_epoch"] = time.time
    app.jinja_env.filters["time"] = format_time

    moment_.init_app(app)
