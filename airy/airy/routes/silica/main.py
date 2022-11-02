from flask import redirect, render_template, url_for, session, request, flash, abort
from flask_cors import CORS
from flask_wtf import FlaskForm

from server_timing import Timing as t
from flask_babel import lazy_gettext as _l
from flask_wtf import FlaskForm
from wtforms import StringField, RadioField
from wtforms.validators import InputRequired, Length, ValidationError
from ...db import User, AP, AF, LogEntry, UserLogin
from ...session import API_V1_UID, API_V1_APID, API_V1_SOLVED
from ...ul import get_extra, current_user
from .bp import bp
from .etc import int_or_abort, paginate
from sqlalchemy.orm.exc import NoResultFound


@bp.app_template_filter()
def get_ap(apid):
    return AP.query.filter_by(id=apid).first()

@bp.app_template_filter()
def get_af(afid):
    return AF.query.filter_by(id=afid).first()

@bp.route("/", methods=("GET",))
def index():
    return render_template("silica/index.html")

@bp.route("/ui_test", methods=("GET",))
def ui_test():
    flash('メッセージ', 'message')
    flash('成功', 'success')
    flash('注意', 'caution')
    flash('警告', 'warning')
    flash('エラー', 'error')
    return render_template("silica/ui_test.html")

class LogFilterForm(FlaskForm):
    sid2 = StringField(_l('セッションID'))
    class Meta:
        csrf = False

@bp.route("/log", methods=("GET",))
def log():
    form = LogFilterForm(formdata=request.args if request.args.get('sid2') else None) # safe because this doesn't edit data
    page = int_or_abort(request.args.get("page", 1))
    per_page = 20
    with t.time('db'):
        les = LogEntry.q(current_user, "n")
        if form.validate() and form.sid2.data:
            les = les.filter_by(sid2=form.sid2.data)
        les = les.paginate(page, per_page, True)
    return render_template('silica/log.html', les=les, form=form)

class UserLoginFilterForm(FlaskForm):
    sid2 = StringField(_l('セッションID'))
    class Meta:
        csrf = False

@bp.route("/uls", methods=("GET",))
@paginate
def uls():
    form = UserLoginFilterForm(formdata=request.args if request.args.get('sid2') else None) # safe because this doesn't edit data
    page = int_or_abort(request.args.get("page", 1))
    per_page = 20
    query = UserLogin.q(current_user)
    if form.validate() and form.sid2.data:
        query = query.filter_by(sid2=form.sid2.data)
    return query, per_page, 'silica/uls.html', dict(form=form)

@bp.route("/ul/<uuid:ulid>", methods=("GET",))
def ul(ulid):
    try:
        ul = UserLogin.q(current_user).filter_by(id=str(ulid)).one()
    except NoResultFound:
        abort(404)
        return
    return render_template('silica/ul.html', ul=ul)
