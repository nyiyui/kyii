from flask import Flask
from flask_migrate import Migrate

from . import admin, db, etc, routes, seed
from .oauth2 import config_oauth
from .session import session


def create_app():
    app = Flask(__name__)
    from . import config

    app.config.from_object(config.init_app(app))
    __setup_app(app)
    return app


def __setup_app(app):
    app.url_map.strict_slashes = False
    db.init_app(app)
    routes.init_app(app)
    migrate = Migrate(app, db.db)
    session.init_app(app)
    config_oauth(app)
    etc.init_app(app)
    seed.init_app(app)
    admin.init_app(app)


if __name__ == "__main__":
    app.run(debug=True)
