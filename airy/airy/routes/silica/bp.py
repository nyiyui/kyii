from flask import Blueprint, session
from ...session import API_V1_UID


bp = Blueprint("silica", __name__)

@bp.context_processor
def login_doing_processor():
    return dict(login_doing=API_V1_UID in session)

def init_app(app):
    app.register_blueprint(bp, url_prefix="/silica")
