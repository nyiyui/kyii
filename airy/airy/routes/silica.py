from flask import Blueprint, redirect, render_template
from flask_cors import CORS

bp = Blueprint("silica", __name__)


def init_app(app):
    app.register_blueprint(bp)


@bp.route("/", methods=("GET",))
def index():
    return render_template("silica/index.html")
