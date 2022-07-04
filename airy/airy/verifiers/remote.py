from ..ul import current_user
import json, secrets
from typing import Tuple, Optional
from .errors import GenerationError, VerificationError
from ..etc import cache


# TODO: ignoring backend errors for now


PREFIX = "verifier_remote_"
TIMEOUT = 30


def gen(gen_params: dict, state: dict, **kwargs):
    return {}, None, None, True


def verify(
    attempt: str, params: dict, state: dict, target_id: str, **kwargs
) -> Tuple[dict, Optional[dict]]:
    args = json.loads(attempt)
    if args["state"] == "1_generate":
        token = secrets.token_hex(3)
        key = f"{PREFIX}{target_id}_{token}"
        if cache.get(key) is not None:
            raise GenerationError("token overlap")
        cache.set(key, False, timeout=TIMEOUT)
        return params, None, dict(token=token), False
    elif args["state"] == "2_verify":
        if "token" not in args:
            return VerificationError("invalid")
        token = args["token"]
        key = f"{PREFIX}{target_id}_{token}"
        if cache.get(key) is None:
            raise VerificationError("token invalid")
        val = cache.get(key)
        if val == True:
            return params, None, None, True
        raise VerificationError("not yet")


def public_params(params: dict, **kwargs) -> dict:
    return dict(timeout=TIMEOUT)


def _remote_decide(token: str, target_id: str) -> None:
    key = f"{PREFIX}{target_id}_{token}"
    if cache.get(key) is None:
        return
    cache.set(key, True, timeout=TIMEOUT)