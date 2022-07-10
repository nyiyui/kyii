import urllib.parse
from pathlib import Path

SECRET_KEY = (
    "876e1d975ea1cc9e3851ada3e992c3ba745101e902616189254ff9f8eaee5e2f"
    "3a3b02164d2da8ff8d1fa0b140c91bc286c83f434156ffd96ee19829ef47a2d7"
)


def init_app(app):
    app.config["HOST"] = "http://localhost:5000"
    app.config.update(
        dict(
            SECRET_KEY=SECRET_KEY,
            KYII_YUUI_ORIGIN="http://localhost:3000",
            OAUTH2_JWT_ENABLED=True,
            OAUTH2_JWT_ALG="RS256",
            OAUTH2_JWT_KEY_PATH="./jwt.pem",
            OAUTH2_JWT_ISS=app.config["HOST"],
            OAUTH2_JWT_EXP=60 * 60,
            UPLOAD_PATH=Path("/tmp/kyii-airy"),
            VERIFIER_WEBAUTHN=dict(
                # https://github.com/w3c/webauthn/issues/963#issuecomment-399898625
                rp_id=urllib.parse.urlparse(app.config["KYII_YUUI_ORIGIN"]).hostname,
                rp_name="Airy",
            ),
            CACHE_TYPE="SimpleCache",
        )
    )
    from logging.config import dictConfig

    dictConfig(
        {
            "version": 1,
            "formatters": {
                "default": {
                    "format": "[%(asctime)s] %(levelname)s in %(module)s: %(message)s",
                }
            },
            "handlers": {
                "wsgi": {
                    "class": "logging.StreamHandler",
                    "stream": "ext://flask.logging.wsgi_errors_stream",
                    "formatter": "default",
                }
            },
            "root": {"level": "DEBUG", "handlers": ["wsgi"]},
        }
    )
