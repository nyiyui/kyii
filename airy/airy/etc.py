from flask_cors import CORS
from typing import Optional
from flask_wtf.csrf import CSRFProtect

from flask_httpauth import HTTPBasicAuth
from flask_login import LoginManager, logout_user
from flask_seasurf import SeaSurf

from .db import User, UserLogin
from flask import session

auth = HTTPBasicAuth()
csrf = CSRFProtect()

def current_user_login() -> Optional[UserLogin]:
    if "ulid" in session:
        ulid = session["ulid"]
        return UserLogin.query.get(ulid)
    return None

@auth.verify_password
def verify_password(username, password):
    if not username.startswith("ul_v1_"):
        return None
    ul = UserLogin.query.get(id=username)
    params = dict(hash=ul.token)
    try:
        new_params = Pw.verify(password, params)
    except VerificationError:
        return None
    else:
        ul.token = new_params["hash"]
        db.session.commit()
        return ul


login_manager = LoginManager()


@login_manager.user_loader
def load_user(uid: str) -> User:
    ul = current_user_login()
    if ul is None:
        return None
    if ul.end is not None:
        return None
    return User.query.get(uid)


def init_app(app):
    csrf.init_app(app)
    login_manager.init_app(app)
