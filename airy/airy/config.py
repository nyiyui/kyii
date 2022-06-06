from pathlib import Path

from authlib.jose import JsonWebKey, KeySet

SECRET_KEY = "876e1d975ea1cc9e3851ada3e992c3ba745101e902616189254ff9f8eaee5e2f3a3b02164d2da8ff8d1fa0b140c91bc286c83f434156ffd96ee19829ef47a2d7"


def setup_jwt_public():
    public_key_path = Path("./jwt.pem.pub")
    public_key = JsonWebKey.import_key(public_key_path.read_text())
    public_key["use"] = "sig"
    public_key["alg"] = "RS256"
    return KeySet([public_key])


def setup_jwt():
    JWT_CONFIG = {
        "key": SECRET_KEY,
        "alg": "RS256",
        "iss": "https://airy.kyii.nyiyui.ca",
        "exp": 3600,
    }
    private_key_path = Path("./jwt.pem")
    private_key = JsonWebKey.import_key(private_key_path.read_text())
    JWT_CONFIG["key"] = KeySet([private_key]).as_dict()
    JWT_CONFIG["key"] = private_key
    return JWT_CONFIG


class Config:
    SECRET_KEY = SECRET_KEY

    # PRIVATE_KEY = Path("./jwt.pem").read_text()

    # Flask-Session
    SESSION_TYPE = "filesystem"
    SESSION_PERMANENT = True
    SESSION_USE_SIGNER = True

    # Yuui
    KYII_YUUI = True
    KYII_YUUI_ORIGIN = "https://yuui.kyii.nyiyui.ca"

    # Flask-Admin
    FLASK_ADMIN_SWATCH = "paper"

    # SQLAlchemy
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = "sqlite:///test.db"

    AIRY_ANONYMOUS_PERMS = {
        "api_v1.signup",
        "api_v2.user.img",
    }
    AIRY_DEFAULT_PERMS = AIRY_ANONYMOUS_PERMS | {
        "api_v2.config.id",
        "api_v2.oauth.grants",
        "api_v2.config.ax",
        "api_v1.oauth.grants",
        "api_v1.config.ax",
        "api_v1.config.id",
        "api_v1.config.g.self",
        "api_v1.iori",
        "api_v1.ul",
    }

    # Airy Rika
    AIRY_RIKA_COLOUR_PRIMARY = "indigo"
    AIRY_RIKA_COLOUR_ACCENT = "deep_purple"

    # Images
    UPLOAD_PATH: Path = Path("/tmp/kyii-airy")

    # Verifiers
    VERIFIER_WEBAUTHN = dict(
        rp_id="https://yuui.kyii.nyiyui.ca",
        rp_name="Airy",
    )


def init_app(app):
    app.config.from_object(Config)
    try:
        from . import local_config
    except ImportError:
        pass
    else:
        local_config.init_app(app)
