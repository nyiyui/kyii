from typing import Optional

from flask import session
from flask_login import LoginManager
from flask_login import login_user as login_user2
from flask_mail import Mail
from flask_wtf.csrf import CSRFProtect
from flask_caching import Cache

from .db import User, UserLogin
from .ul import ULManager

csrf = CSRFProtect()

ulm = ULManager()


def current_user_login() -> Optional[UserLogin]:
    if "ulid" in session:
        ulid = session["ulid"]
        return UserLogin.query.get(ulid)
    return None


login_manager = LoginManager()


@login_manager.user_loader
def load_user(uid: str) -> User:
    ul = current_user_login()
    if ul is None:
        return None
    if ul.end is not None:
        return None
    return User.query.get(uid)


def login_ul(ul: UserLogin, **kwargs):
    session["ulid"] = ul.id
    login_user2(ul.user, **kwargs)


mail = Mail()


cache = Cache()


def init_app(app):
    csrf.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)
    ulm.init_app(app)
    cache.init_app(app)
