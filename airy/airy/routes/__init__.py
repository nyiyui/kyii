from . import api2, main, rika


def init_app(app):
    main.init_app(app)
    api2.init_app(app)
    rika.init_app(app)
