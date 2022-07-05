from flask_cors import CORS
from authlib.integrations.flask_oauth2 import current_token
from authlib.oauth2 import OAuth2Error
from flask import (
    Blueprint,
    current_app,
    redirect,
)


bp = Blueprint("main", __name__)


def init_app(app):
    app.register_blueprint(bp)
    CORS(app)


@bp.route("/", methods=("GET",))
def home():
    return redirect(current_app.config["KYII_YUUI_ORIGIN"], code=303)
