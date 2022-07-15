def generic_all(name: str):
    ops = {"assign", "del", "deref", "seek", "total"}
    return set(
        [f"api_v2.generic.{op}.{name}" for op in ops],
    )


class Config:
    # Flask-Session
    SESSION_TYPE = "filesystem"
    SESSION_PERMANENT = True
    SESSION_USE_SIGNER = True

    # Yuui
    KYII_YUUI = True
    KYII_YUUI_ORIGIN = "https://yuui.kyii.nyiyui.ca"
    AIRY_GENERIC_LIMIT_MAX = 30

    # Flask-Admin
    FLASK_ADMIN_SWATCH = "paper"

    # SQLAlchemy
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = "sqlite:///test.db"

    AIRY_ANONYMOUS_PERMS = {
        "api_v2.signup",
    }
    AIRY_DEFAULT_PERMS = AIRY_ANONYMOUS_PERMS | {
        "api_v2.oauth.oclients",
        "api_v2.oauth.oclients.edit",
        "api_v2.oauth.oclients.delete",
        "api_v2.user.lookup",
        "api_v2.config.id",
        "api_v2.oauth.grants",
        "api_v2.config.ax",
        "api_v2.ul",
        "api_v2.logs",
        *generic_all("le"),
    }

    # Airy Rika
    AIRY_RIKA_COLOUR_PRIMARY = "indigo"
    AIRY_RIKA_COLOUR_ACCENT = "deep_purple"

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
        raise RuntimeError('local_config required')
    else:
        local_config.init_app(app)
    check(app)


REQUIRED_KEYS = [
    "SECRET_KEY",
    "KYII_YUUI",
    "KYII_YUUI_ORIGIN",
    "HOST",
    "UPLOAD_PATH",
    "VERIFIER_WEBAUTHN",
    "CACHE_TYPE",
]


def check(app):
    for key in REQUIRED_KEYS:
        if key not in app.config:
            raise TypeError(f"{key} required in config")
