from pathlib import Path
import urllib.parse

from authlib.jose import JsonWebKey


def init_app(app):
    app.config["HOST"] = "http://localhost:5000"
    JWT_CONFIG = app.config["JWT_CONFIG"] = dict(
        key=JsonWebKey.import_key(Path("./jwt.pem").read_text()),
        alg="RS256",
        iss=app.config["HOST"],
        exp=60 * 60,
    )
    app.config.update(
        dict(
            KYII_YUUI_ORIGIN="http://localhost:3000",
        )
    )
    app.config.update(
        dict(
            OAUTH2_JWT_ENABLED=True,
            OAUTH2_JWT_ALG=JWT_CONFIG["alg"],
            OAUTH2_JWT_KEY_PATH="./jwt.pem",
            OAUTH2_JWT_ISS=JWT_CONFIG["iss"],
            OAUTH2_JWT_EXP=JWT_CONFIG["exp"],
            UPLOAD_PATH=Path("/tmp/kyii-airy"),
            VERIFIER_WEBAUTHN=dict(
                # https://github.com/w3c/webauthn/issues/963#issuecomment-399898625
                rp_id=urllib.parse.urlparse(app.config["KYII_YUUI_ORIGIN"]).hostname,
                rp_name="Airy",
            ),
        )
    )
    print(app.config["UPLOAD_PATH"])
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
