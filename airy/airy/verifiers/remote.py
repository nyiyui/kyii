import json
import secrets
from typing import Tuple, Optional
from .errors import GenerationError, VerificationError
from ..etc import cache, signals


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
        cache.set(key, False, timeout=TIMEOUT)
        return params, None, dict(token=token), False
    elif args["state"] == "2_verify":
        if "token" not in args:
            raise VerificationError("invalid")
        token = args["token"]
        key = f"{PREFIX}{target_id}_{token}"
        if cache.get(key) is None:
            raise VerificationError("token invalid")
        val = cache.get(key)
        if val is True:
            return params, None, None, True
        raise VerificationError("not yet")
    raise VerificationError("invalid state")


def public_params(params: dict, **kwargs) -> dict:
    return dict(timeout=TIMEOUT)


def _remote_decide(token: str, target_id: str) -> None:
    key = f"{PREFIX}{target_id}_{token}"
    if cache.get(key) is None:
        return
    cache.set(key, True, timeout=TIMEOUT)
    decided.send((target_id, token))
