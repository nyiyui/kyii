from flask import Blueprint, session
from ...session import API_V1_UID
from ...db import db, ap_reqs


def get_ap_req(apid, afid):
    return db.session.query(ap_reqs).filter_by(ap_id=apid, af_id=afid).first()

bp = Blueprint("silica", __name__)


@bp.context_processor
def login_doing_processor():
    return dict(login_doing=API_V1_UID in session)


def init_app(app):
    app.register_blueprint(bp)
    app.jinja_env.globals['get_ap_req'] = get_ap_req
