import base64
from typing import Optional, Tuple

import nacl.pwhash
import pyotp
from nacl.exceptions import InvalidkeyError
from passlib.hash import django_pbkdf2_sha256

from . import webauthn
from .errors import GenerationError, VerificationError

# TODO: convert to modules


class Verifier:
    @classmethod
    def gen(
        cls, gen_params: dict, state: Optional[dict]
    ) -> Tuple[dict, Optional[dict], Optional[dict], bool]:
        """
        Generate params from gen_params and return params and feedback.

        :param gen_params: public dict of parameters for generation
        :param state: private state to generate against
        :return: Tuple of params, state, feedback, and done
        """
        raise NotImplementedError()

    @classmethod
    def verify(
        cls, attempt: str, params: dict, state: Optional[dict] = None
    ) -> Tuple[dict, Optional[dict], Optional[dict], bool]:
        """
        Verify attempt and return params and new state.

        :param attempt: public attempt to verify
        :param params: private params to verify against
        :param state: private state to verify against
        :return: Tuple of new params, new state, feedback, and done
        """
        raise NotImplementedError()


class Pw(Verifier):
    @classmethod
    def gen(cls, gen_params: dict, state: Optional[dict]):
        password = gen_params["password"]
        if not isinstance(password, str):
            raise TypeError("password must be a str")
        return (
            dict(
                hash=base64.b64encode(nacl.pwhash.str(password.encode("utf-8"))).decode(
                    "ascii"
                ),
            ),
            None,
            None,
            True,
        )

    @classmethod
    def verify(
        cls, attempt: str, params: dict, state
    ) -> Tuple[dict, Optional[dict], Optional[dict], bool]:
        hash_ = base64.b64decode(params["hash"].encode("ascii"))
        if "compat" in params.keys():
            cls.__verify_compat(attempt, hash_, params["compat"])
        else:
            cls.__verify(attempt, hash_)
        return cls.gen(dict(password=attempt), None)[0], None, None, True

    @classmethod
    def __verify_compat(cls, attempt: str, hash_: str, compat: str) -> None:
        if compat == "django_pbkdf2_sha256":
            ok = django_pbkdf2_sha256.verify(attempt, hash_)
            if not ok:
                raise VerificationError("verify failed")
        else:
            raise TypeError("invalid compat")

    @classmethod
    def __verify(cls, attempt: str, hash_: str) -> None:
        try:
            ok = nacl.pwhash.verify(hash_, attempt.encode("utf-8"))
            if not ok:
                raise VerificationError("verify failed")
        except InvalidkeyError:
            raise VerificationError("verify failed: invalid key")


class TOTP(Verifier):
    @classmethod
    def gen(cls, gen_params: dict, state: Optional[dict]):
        algorithm = "SHA1"  # TODO: multiple algorithms
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

    @classmethod
    def verify(
        cls, attempt: str, params: dict, state: dict
    ) -> Tuple[dict, Optional[dict]]:
        totp = pyotp.TOTP(
            params["secret_key"],
            digits=int(params["digits"]),
            interval=int(params["period"]),
        )
        ok = totp.verify(attempt)
        if not ok:
            raise VerificationError("verify failed")
        if state is not None and state.get("last_otp", None) == attempt:
            # NOTE: when async-ing, remember to lock this due to races
            raise VerificationError("already used")
        return params, dict(last_otp=attempt), None, True


class Limited(Verifier):
    @classmethod
    def gen(cls, gen_params: dict, state: Optional[dict]):
        if "times" not in gen_params:
            raise GenerationError("times must be specified")
        times = gen_params["times"]
        if not isinstance(times, int):
            raise GenerationError("times must be an int")
        return dict(limit=times), None, dict(remaining=times), True

    @classmethod
    def verify(
        cls, attempt: str, params: dict, state: dict
    ) -> Tuple[dict, Optional[dict]]:
        limit = params["limit"]
        used = state["used"] if state else 0
        if used >= limit:
            raise VerificationError("limit reached")
        return params, dict(used=used + 1), dict(remaining=limit - used), True


VERIFIERS = {
    "pw": Pw,
    "otp_totp": TOTP,
    "webauthn": webauthn,
    "limited": Limited,
}


def gen(
    verifier: str, gen_params: dict, state: Optional[dict]
) -> Tuple[dict, Optional[dict], Optional[dict], bool]:
    return VERIFIERS[verifier].gen(gen_params, state)


def verify(
    verifier: str, attempt: str, params: dict, state: Optional[dict] = None
) -> Tuple[dict, Optional[dict], Optional[dict], bool]:
    return VERIFIERS[verifier].verify(attempt, params, state)
