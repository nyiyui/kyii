from typing import Optional, Tuple

from .errors import GenerationError, VerificationError


def gen(
    gen_params: dict,
    state: dict,
    **kwargs,
) -> Tuple[dict, Optional[dict], Optional[dict], bool]:
    raise GenerationError('not implemented')  # impl in silica


def verify(
    attempt: str, params: dict, state: dict, target_id: str, **kwargs
) -> Tuple[dict, Optional[dict], Optional[dict], bool]:
    raise VerificationError('not implemented')  # impl in silica


def public_params(params: dict, **kwargs) -> dict:
    return {}
