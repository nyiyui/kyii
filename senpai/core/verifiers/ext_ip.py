from .base import Attempt
from typing import Tuple

__all__ = ["verify", "gen"]

def verify(verify_params: dict, attempt: Attempt) -> Tuple[bool, str, dict]:
    return False, 'not implemented', {}

def gen(gen_params: dict) -> dict:
    return {'prefix': gen_params['prefix']}
