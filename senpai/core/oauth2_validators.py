from oauth2_provider.oauth2_validators import OAuth2Validator

class CustomOAuth2Validator(OAuth2Validator):
    def get_claim_dict(self, request):
        if self._get_additional_claims_is_request_agnostic():
            claims = {"sub": lambda r: str(r.user.sub)}
        else:
            claims = {"sub": str(request.user.sub)}

        # https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
        if self._get_additional_claims_is_request_agnostic():
            add = self.get_additional_claims()
        else:
            add = self.get_additional_claims(request)
        claims.update(add)
        return claims
