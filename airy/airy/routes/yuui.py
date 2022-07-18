from flask import Blueprint, redirect, render_template, send_from_directory
from flask_cors import CORS

bp = Blueprint("yuui", __name__)


def init_app(app):
    app.register_blueprint(bp, url_prefix="/yuui")


@bp.route("/", methods=("GET",))
def index():
    return send_from_directory("yuui-static", "index.html")


@bp.route("/<path:path>", methods=("GET",))
def static(path):
    return send_from_directory("yuui-static", path)
