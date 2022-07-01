from flask import Flask
import os
from pathlib import Path
from flask_migrate import Migrate

from . import admin, config, db, etc, routes, seed
from .oauth2 import config_oauth
from .session import session


def create_app():
    app = Flask(__name__)
    config.init_app(app)
    __setup_app(app)
    return app


def __setup_app(app):
    app.url_map.strict_slashes = False
    db.init_app(app)
    routes.init_app(app)
    Migrate(app, db.db)
    session.init_app(app)
    config_oauth(app)
    etc.init_app(app)
    seed.init_app(app)
    admin.init_app(app)
    upload_path = app.config["UPLOAD_PATH"]
    Path(os.path.join(upload_path, "img-tmp")).mkdir(parents=True, exist_ok=True)
    Path(os.path.join(upload_path, "img")).mkdir(parents=True, exist_ok=True)
