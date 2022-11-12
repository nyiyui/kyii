from authlib.integrations.flask_client import OAuth

oauth = OAuth()

def init_app(app):
    oauth.init_app(app)
