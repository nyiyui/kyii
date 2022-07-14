from flask import Blueprint, current_app, redirect
from flask_cors import CORS
from . import silica

bp = Blueprint("main", __name__)


def init_app(app):
    app.register_blueprint(bp)
    CORS(app)


@bp.route("/", methods=("GET",))
def home():
    if current_app.config["KYII_YUUI"]:
        return redirect(current_app.config["KYII_YUUI_ORIGIN"], code=303)
    return silica.index()
