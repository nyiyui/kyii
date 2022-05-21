from . import main, api, rika


def init_app(app):
    main.init_app(app)
    api.init_app(app)
    rika.init_app(app)
