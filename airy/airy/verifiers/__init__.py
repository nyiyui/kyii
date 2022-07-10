import base64
from typing import Any, Dict, Optional, Tuple

import nacl.pwhash
from nacl.exceptions import InvalidkeyError
from passlib.hash import django_pbkdf2_sha256

from . import remote, totp, webauthn
from .errors import GenerationError, VerificationError

# TODO: convert to modules


class Verifier:
    @classmethod
    def gen(
        cls, gen_params: dict, state: Optional[dict], **kwargs
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
        cls, attempt: str, params: dict, state: Optional[dict] = None, **kwargs
    ) -> Tuple[dict, Optional[dict], Optional[dict], bool]:
        """
        Verify attempt and return params and new state.

        :param attempt: public attempt to verify
        :param params: private params to verify against
        :param state: private state to verify against
        :return: Tuple of new params, new state, feedback, and done
        """
        raise NotImplementedError()

    @classmethod
    def public_params(cls, params: dict, **kwargs) -> dict:
        """
        Get public params.

        :param params: private params to verify against
        :return: tuple of public params
        """
        return {}
        raise NotImplementedError()


class Pw(Verifier):
    @classmethod
    def gen(cls, gen_params: dict, state: Optional[dict], **kwargs):
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
        cls, attempt: str, params: dict, state: Optional[dict] = None, **kwargs
    ) -> Tuple[dict, Optional[dict], Optional[dict], bool]:
        hash_ = base64.b64decode(params["hash"].encode("ascii"))
        if "compat" in params.keys():
            cls.__verify_compat(attempt, hash_, params["compat"])
        else:
            cls.__verify(attempt, hash_)
        return cls.gen(dict(password=attempt), None)[0], None, None, True

    @classmethod
    def __verify_compat(cls, attempt: str, hash_: bytes, compat: str) -> None:
        if compat == "django_pbkdf2_sha256":
            ok = django_pbkdf2_sha256.verify(attempt, hash_)
            if not ok:
                raise VerificationError("verify failed")
        else:
            raise TypeError("invalid compat")

    @classmethod
    def __verify(cls, attempt: str, hash_: bytes) -> None:
        try:
            ok = nacl.pwhash.verify(hash_, attempt.encode("utf-8"))
            if not ok:
                raise VerificationError("verify failed")
        except InvalidkeyError:
            raise VerificationError("verify failed: invalid key")


class Limited(Verifier):
    @classmethod
    def gen(
        cls, gen_params: dict, state: Optional[dict], **kwargs
    ) -> Tuple[dict, Optional[dict], Optional[dict], bool]:
        if "times" not in gen_params:
            raise GenerationError("times must be specified")
        times = gen_params["times"]
        if not isinstance(times, int):
            raise GenerationError("times must be an int")
        return dict(limit=times), dict(used=0), dict(remaining=times), True

    @classmethod
    def verify(
        cls, attempt: str, params: dict, state: Optional[dict] = None, **kwargs
    ) -> Tuple[dict, Optional[dict], Optional[dict], bool]:
        limit = params["limit"]
        if state is None:
            raise VerificationError("state required")
        used = state["used"]
        if used >= limit:
            raise VerificationError("limit reached")
        return params, dict(used=used + 1), dict(remaining=limit - used), True


VERIFIERS: Dict[str, Any] = {
    "pw": Pw,
    "otp_totp": totp,
    "webauthn": webauthn,
    "limited": Limited,
    "remote": remote,
}


def gen(
    verifier: str,
    gen_params: dict,
    state: Optional[dict],
    **kwargs,
) -> Tuple[dict, Optional[dict], Optional[dict], bool]:
    return VERIFIERS[verifier].gen(gen_params, state, **kwargs)


def verify(
    verifier: str, attempt: str, params: dict, state: Optional[dict] = None, **kwargs
) -> Tuple[dict, Optional[dict], Optional[dict], bool]:
    return VERIFIERS[verifier].verify(attempt, params, state, **kwargs)


def public_params(verifier: str, params: dict, **kwargs) -> dict:
    v = VERIFIERS[verifier]
    if hasattr(v, "public_params"):
        return v.public_params(params, **kwargs)
    return {}
