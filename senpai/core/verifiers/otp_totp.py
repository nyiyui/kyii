from .base import Attempt
import pyotp
from typing import Tuple
__all__ = ["verify", "gen"]

def verify(verify_params: dict, attempt: Attempt) -> Tuple[bool, str, dict]:
    passcode = attempt.challenge_response
    totp = pyotp.TOTP(verify_params['secret'])
    ok = totp.verify(passcode)
    return ok, '', verify_params

def gen(gen_params: dict) -> dict:
    return {'secret': pyotp.random_base32()}
