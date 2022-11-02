import secrets
from functools import wraps
from typing import Set, Tuple

from flask import current_app
from flask_login import current_user
from server_timing import Timing as t


def has_perms(want: Set[str]) -> Tuple[bool, str, Set[str]]:
    missing = want - current_app.config.get("AIRY_DEFAULT_PERMS", set())
    if len(missing) == 0:
        return True, "", set()
    if current_user.is_anonymous:
        reason = "anonymous"
        missing = want - current_app.config.get("AIRY_ANONYMOUS_PERMS", set())
    else:
        reason = "user"
        missing = want - current_user.perms
    return False, reason, missing


def all_perms() -> Set[str]:
    default_perms = current_app.config.get("AIRY_DEFAULT_PERMS", set())
    if current_user.is_anonymous:
        user_perms = current_app.config.get("AIRY_ANONYMOUS_PERMS", set())
    else:
        user_perms = current_user.perms
    return default_perms | user_perms


def req_perms(perms: Set[str], handler, cond=lambda: True):
    if isinstance(perms, str):
        perms = set([perms])
    if isinstance(perms, tuple):
        perms = set(perms)
    if not isinstance(perms, set):
        raise TypeError("perms must be a set, tuple, or str")

    def ret(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            with t.time("req_perms"):
                if cond():
                    ok, reason, missing = has_perms(perms)
                    if not ok:
                        return handler(list(missing), reason)
            return f(*args, **kwargs)

        return decorated_function

    return ret


def gen_token() -> str:
    return secrets.token_hex(32)


def flip(d: dict) -> dict:
    return {v: k for k, v in d.items()}


class BidirectionalDict(dict):
    pass
