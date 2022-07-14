from . import api2, main, oauth, silica


def init_app(app):
    main.init_app(app)
    api2.init_app(app)
    oauth.init_app(app)
    silica.init_app(app)
