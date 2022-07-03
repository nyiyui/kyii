from typing import Optional, Tuple
import json

from flask import current_app
from webauthn import (
    base64url_to_bytes,
    generate_authentication_options,
    generate_registration_options,
    options_to_json,
    verify_authentication_response,
    verify_registration_response,
)
from webauthn.helpers.structs import (
    PublicKeyCredentialDescriptor,
    RegistrationCredential,
    UserVerificationRequirement,
)

from ..ul import current_user
from .errors import GenerationError, VerificationError
import secrets


def gen(gen_params: dict, state: dict, **kwargs):
    if gen_params["state"] == "1_generate":
        config = current_app.config["VERIFIER_WEBAUTHN"]
        webauthn_id = secrets.token_hex(32)
        ro = generate_registration_options(
            rp_id=config["rp_id"],
            rp_name=config["rp_name"],
            user_id=webauthn_id,
            user_name=current_user.slug,
            user_display_name=current_user.name,
        )
        jro = options_to_json(ro)
        return (
            None,
            dict(ro_gened=True, webauthn_id=webauthn_id, challenge=ro.challenge),
            jro,
            False,
        )
    elif gen_params["state"] == "2_verify":
        if not state:
            raise GenerationError("no state")
        if not state["ro_gened"]:
            raise GenerationError("no registration options generated")
        require_user_verification = gen_params["require_user_verification"]
        vr = verify_registration_response(
            credential=RegistrationCredential.parse_raw(gen_params["credential"]),
            expected_challenge=state["challenge"],
            expected_origin=current_app.config["KYII_YUUI_ORIGIN"],
            expected_rp_id=current_app.config["VERIFIER_WEBAUTHN"]["rp_id"],
            require_user_verification=require_user_verification,
        )
        return (
            dict(
                current_sign_count=0,
                vr=vr.json(),
                credential=gen_params["credential"],
                webauthn_id=state["webauthn_id"],
                require_user_verification=require_user_verification,
            ),
            None,
            None,
            True,
        )
    else:
        raise GenerationError("invalid state")


def verify(
    attempt: str, params: dict, state: dict, **kwargs
) -> Tuple[dict, Optional[dict]]:
    args = json.loads(attempt)
    vr = json.loads(params["vr"])
    if args["state"] == "1_generate":
        ao = generate_authentication_options(
            rp_id=current_app.config["VERIFIER_WEBAUTHN"]["rp_id"],
            allow_credentials=[PublicKeyCredentialDescriptor(id=vr["credential_id"])],
            user_verification=UserVerificationRequirement.REQUIRED,
        )
        return (
            None,
            dict(ao_gened=True, challenge=ao.challenge),
            options_to_json(ao),
            False,
        )
    elif args["state"] == "2_verify":
        if not state:
            raise VerificationError("no state")
        if not state["ao_gened"]:
            raise VerificationError("no authentication options generated")
        va = verify_authentication_response(
            credential=RegistrationCredential.parse_raw(args["credential"]),
            expected_challenge=state["challenge"],
            expected_rp_id=current_app.config["VERIFIER_WEBAUTHN"]["rp_id"],
            expected_origin=current_app.config["HOST"],
            credential_public_key=base64url_to_bytes(vr["credential_public_key"]),
            credential_current_sign_count=params["current_sign_count"],
            require_user_verification=params["require_user_verification"],
        )
        return dict(**params, current_sign_count=va.new_sign_count), None, None, True
    else:
        raise VerificationError("invalid state")
