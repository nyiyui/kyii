import pyotp
import hashlib
from typing import Optional, Tuple


FUNCTIONS = {
    "SHA1": hashlib.sha1,
    "SHA256": hashlib.sha256,
    "SHA512": hashlib.sha512,
}


def gen(gen_params: dict, state: Optional[dict], **kwargs):
    algorithm = gen_params.get("algorithm", "SHA1")
    digits = gen_params.get("digits", 6)
    if digits not in (6, 8):
        raise GenerationError("digits must be either 6 or 8")
    period = gen_params.get("period", 30)
    if "secret_key" not in gen_params:
        secret_key = pyotp.random_base32()
    else:
        secret_key = gen_params["secret_key"]
    secret = dict(
        secret_key=secret_key,
        algorithm=algorithm,
        digits=digits,
        period=period,
    )
    return secret, None, secret, True


def verify(
    attempt: str, params: dict, state: dict, **kwargs
) -> Tuple[dict, Optional[dict]]:
    totp = pyotp.TOTP(
        params["secret_key"],
        digits=int(params["digits"]),
        digest=FUNCTIONS[params["algorithm"]],
        interval=int(params["period"]),
    )
    ok = totp.verify(attempt)
    if not ok:
        raise VerificationError("verify failed")
    if state is not None and state.get("last_otp", None) == attempt:
        # NOTE: when async-ing, remember to lock this due to races
        raise VerificationError("already used")
    return params, dict(last_otp=attempt), None, True


def public_params(params: dict, **kwargs) -> dict:
    return dict(digits=params["digits"])
