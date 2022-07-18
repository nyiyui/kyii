from flask import Blueprint, current_app, redirect
from . import silica

bp = Blueprint("main", __name__)


def init_app(app):
    app.register_blueprint(bp)


@bp.route("/", methods=("GET",))
def home():
    if current_app.config["KYII_YUUI"]:
        return redirect("/yuui", code=303)
    return redirect("/silica", code=303)
