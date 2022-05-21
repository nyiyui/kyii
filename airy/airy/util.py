from functools import wraps
from typing import Set, Tuple
from flask_login import current_user
from typing import Set

from flask import current_app, g, redirect, request, url_for

from .session import AIRY_IORI_USERS

def has_perms(perms: Set[str]) -> Tuple[bool, str, set]:
    default_perms = current_app.config.get("AIRY_DEFAULT_PERMS", set())
    missing = perms - default_perms
    if len(missing) == 0:
        return True, "", set()
    if current_user.is_anonymous:
        anon_perms = current_app.config.get("AIRY_ANONYMOUS_PERMS", set())
        missing = perms - anon_perms
        if len(missing) > 0:
            return False, "anonymous", missing
    elif not current_user.has_perms(perms):
        return False, "user", missing


def req_perms(perms: Set[str], handler):
    if isinstance(perms, str):
        perms = set([perms])
    if isinstance(perms, tuple):
        perms = set(perms)
    if not isinstance(perms, set):
        raise TypeError("perms must be a set, tuple, or str")

    def ret(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            ok, reason, missing = has_perms(perms)
            if not ok:
                handler(list(missing), reason)
                return
            return f(*args, **kwargs)
        return decorated_function
    return ret
