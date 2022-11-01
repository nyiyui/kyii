from flask import Blueprint, current_app, redirect
from . import silica

bp = Blueprint("main", __name__)


def init_app(app):
    app.register_blueprint(bp)
