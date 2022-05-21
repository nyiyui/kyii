from pathlib import Path

from authlib.jose import JsonWebKey


def init_app(app):
    app.config["HOST"] = "https://airy.kyii.nyiyui.ca"
    JWT_CONFIG = app.config["JWT_CONFIG"] = dict(
        key=JsonWebKey.import_key(Path("./jwt.pem").read_text()),
        alg="RS256",
        iss=app.config["HOST"],
        exp=60 * 60,
    )
    app.config.update(
        dict(
            OAUTH2_JWT_ENABLED=True,
            OAUTH2_JWT_ISS=JWT_CONFIG["iss"],
            OAUTH2_JWT_KEY=JWT_CONFIG["key"],
            OAUTH2_JWT_ALG=JWT_CONFIG["alg"],
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
