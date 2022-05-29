import base64
import json
from typing import Optional, Tuple

import nacl.pwhash
import pyotp
from nacl.exceptions import InvalidkeyError
from passlib.hash import django_pbkdf2_sha256

# TODO: convert to modules


class GenerationError(Exception):
    pass


class VerificationError(Exception):
    pass


class Verifier:
    @classmethod
    def gen(cls, gen_params: dict) -> Tuple[dict, Optional[dict]]:
        """
        Generate params from gen_params and return params and feedback.

        :param gen_params: dict of parameters for generation
        :return: Tuple of params and feedback
        """
        raise NotImplemented()

    @classmethod
    def verify(
        cls, attempt: str, params: dict, state: Optional[dict] = None
    ) -> Tuple[dict, Optional[dict]]:
        """
        Verify attempt and return params and new state.

        :param attempt: attempt to verify
        :param params: params to verify against
        :param state: state to verify against
        :return: Tuple of new params and new state
        """
        raise NotImplemented()


class Pw(Verifier):
    @classmethod
    def gen(cls, gen_params: dict):
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
        )

    @classmethod
    def verify(cls, attempt: str, params: dict, state) -> Tuple[dict, Optional[dict]]:
        hash_ = base64.b64decode(params["hash"].encode("ascii"))
        if "compat" in params.keys():
            return cls.__verify_compat(attempt, hash_, params["compat"]), None
        else:
            return cls.__verify(attempt, hash_), None

    @classmethod
    def __verify_compat(cls, attempt: str, hash_: str, compat: str) -> dict:
        if compat == "django_pbkdf2_sha256":
            ok = django_pbkdf2_sha256.verify(attempt, hash_)
            if not ok:
                raise VerificationError("verify failed")
            return cls.gen(dict(password=attempt))[0]
        else:
            raise TypeError("invalid compat")

    @classmethod
    def __verify(cls, attempt: str, hash_: str) -> dict:
        try:
            ok = nacl.pwhash.verify(hash_, attempt.encode("utf-8"))
            if not ok:
                raise VerificationError("verify failed")
        except InvalidkeyError as e:
            raise VerificationError("verify failed")
        else:
            return cls.gen(dict(password=attempt))[0]


class TOTP(Verifier):
    @classmethod
    def gen(cls, gen_params: dict):
        algorithm = "SHA1"  # TODO: multiple algorithms
        digits = gen_params.get("digits", 6)
        if digits not in (6, 8):
            raise GenerationError(f"digits must be either 6 or 8")
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
        return secret, secret

    @classmethod
    def verify(
        cls, attempt: str, params: dict, state: dict
    ) -> Tuple[dict, Optional[dict]]:
        totp = pyotp.TOTP(
            params["secret_key"],
            digits=int(params["digits"]),
            interval=int(params["period"]),
        )
        print(f"expected {totp.now()} got {attempt}")
        ok = totp.verify(attempt)
        if not ok:
            raise VerificationError("verify failed")
        if state is not None and state.get("last_otp", None) == attempt:
            # NOTE: when async-ing, remember to lock this so race conditions etc don't happen
            raise VerificationError("already used")
        return params, dict(last_otp=attempt)


VERIFIERS = {
    "pw": Pw,
    "otp_totp": TOTP,
}
