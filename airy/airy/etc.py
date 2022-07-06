from typing import Optional

from blinker import Namespace
from flask import session, current_app, request, redirect
from urllib.parse import urlencode, urljoin
from flask_login import LoginManager
from flask_login import login_user as login_user2
from flask_mail import Mail
from flask_wtf.csrf import CSRFProtect
from flask_caching import Cache
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from .db import User, UserLogin
from .ul import ULManager


signals = Namespace()

csrf = CSRFProtect()

ulm = ULManager()


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
    ulm.init_app(app)
    cache.init_app(app)
    limiter.init_app(app)
