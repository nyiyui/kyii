from flask_cors import CORS
from authlib.integrations.flask_oauth2 import current_token
from authlib.oauth2 import OAuth2Error
from flask import (
    Blueprint,
    current_app,
    redirect,
)
from flask_login import current_user, login_required


bp = Blueprint("main", __name__)


def init_app(app):
    app.register_blueprint(bp)
    CORS(app)


@bp.route("/", methods=("GET",))
@login_required
def home():
    return redirect(current_app.config["KYII_YUUI_ORIGIN"], code=303)
