
from typing import Tuple
from .base import Attempt

from . import ext_ip
from . import otp_totp
from . import pw_argon2id

__all__ = ['FullAttempt']

afs = {
    'ext_ip': ext_ip,
    'otp_totp': otp_totp,
    'pw_argon2id': pw_argon2id,
}


class FullAttempt(Attempt):
    verifier: str
    params: dict

    def __init__(self, verifier: str, params: dict, **kwargs):
        super().__init__(**kwargs)
        self.verifier = verifier
        self.params = params

    def verify(self) -> Tuple[bool, str, dict]:
        if self.verifier not in afs:
            return False, "invalid verifier", {}
        return afs[self.verifier].verify(self.params, self.attempt)

    @property
    def attempt(self) -> dict:
        return Attempt(self.challenge_response, self.request)
