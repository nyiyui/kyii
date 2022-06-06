class VerifierError(Exception):
    pass


class GenerationError(VerifierError):
    pass


class VerificationError(VerifierError):
    pass
