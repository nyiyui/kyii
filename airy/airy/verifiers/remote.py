import json
import secrets
from typing import Optional, Tuple

from ..db import UserLogin
from ..etc import cache, signals
from .errors import GenerationError, VerificationError

# TODO: ignoring backend errors for now


PREFIX = "verifier_remote_"
TIMEOUT = 30
decided = signals.signal("verifier_remote_decided")


def gen(
    gen_params: dict,
    state: dict,
    **kwargs,
) -> Tuple[dict, Optional[dict], Optional[dict], bool]:
    return {}, None, None, True


def verify(
    attempt: str, params: dict, state: dict, target_id: str, **kwargs
) -> Tuple[dict, Optional[dict], Optional[dict], bool]:
    args = json.loads(attempt)
    if args["state"] == "1_generate":
        token = f"{secrets.randbits(20):06}"
        key = f"{PREFIX}{target_id}_{token}"
        if cache.get(key) is not None:
            raise GenerationError("token overlap")
        cache.set(key, dict(
            allowed=False,
            sid2=UserLogin.get_sid2(),
        ), timeout=TIMEOUT)
        return params, None, dict(token=token), False
    elif args["state"] == "2_verify":
        if "token" not in args:
            raise VerificationError("invalid")
        token = args["token"]
        key = f"{PREFIX}{target_id}_{token}"
        if cache.get(key) is None:
            raise VerificationError("token invalid")
        allowed = cache.get(key)['allowed']
        if allowed is True:
            return params, None, None, True
        raise VerificationError("not yet")
    raise VerificationError("invalid state")


def public_params(params: dict, **kwargs) -> dict:
    return dict(timeout=TIMEOUT)


def _remote_decide(token: str, target_id: str) -> None:
    key = f"{PREFIX}{target_id}_{token}"
    val = cache.get(key)
    if val is None:
        return
    val['allowed'] = True
    cache.set(key, val, timeout=TIMEOUT)
    decided.send((target_id, token))

def _remote_get_sid2(token: str, target_id: str) -> dict:
    key = f"{PREFIX}{target_id}_{token}"
    val = cache.get(key)
    if not val:
        return None
    return val['sid2']
