from .base import Attempt
from typing import Tuple
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
__all__ = ["verify", "gen"]

ph = PasswordHasher()

def verify(verify_params: dict, attempt: Attempt) -> Tuple[bool, str, dict]:
    password = attempt.challenge_response
    try:
        ph.verify(verify_params['hash'], password)
    except VerifyMismatchError:
        return False, "incorrect password", {}
    ret_params = verify_params
    if ph.check_needs_rehash(verify_params['hash']):
        ret_params = {'hash': ph.hash(password)}
    return True, '', ret_params

def gen(gen_params: dict) -> dict:
    return {'hash': ph.hash(gen_params['password'])}
