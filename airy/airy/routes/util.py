from typing import Optional
from datetime import datetime
from functools import wraps
from flask import abort
import flask_login
from ..db import UserLogin, User, gen_uuid, db
from ..etc import current_user_login
from flask import session, request, Response
from ..session import API_V1_APID



def login_user(u: User, apid: Optional[str]) -> UserLogin:
    flask_login.login_user(u)
    apid = session.get(API_V1_APID)
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
    token = ul.gen_token()  # TODO: revisit token-based api
    db.session.add(ul)
    db.session.commit()
    return ul, token


def update_ul_last(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        ul = current_user_login()
        if ul is not None:
            ul.last = datetime.utcnow()
            db.session.commit()
        return f(*args, **kwargs)

    return decorated_function
