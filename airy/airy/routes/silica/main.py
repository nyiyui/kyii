from flask import render_template, request, flash
from flask_wtf import FlaskForm

from server_timing import Timing as t
from flask_babel import lazy_gettext as _l
from wtforms import StringField
from ...db import AP, AF, LogEntry, UserLogin
from ...ul import current_user, login_required
from .bp import bp
from .etc import paginate


@bp.app_template_filter()
def get_ap(apid):
    return AP.query.filter_by(id=apid).first()


@bp.app_template_filter()
def get_af(afid):
    return AF.query.filter_by(id=afid).first()


@bp.errorhandler(404)
def not_found(error):
    return render_template("silica/404.html"), 404


@bp.errorhandler(403)
def unauthorized(error):
    return render_template("silica/403.html"), 403


@bp.route("/", methods=("GET",))
def index():
    return render_template("silica/index.html")


@bp.route("/ui_test", methods=("GET",))
def ui_test():
    flash("メッセージ", "message")
    flash("成功", "success")
    flash("注意", "caution")
    flash("警告", "warning")
    flash("エラー", "error")
    return render_template("silica/ui_test.html")


class LogFilterForm(FlaskForm):
    sid2 = StringField(_l("セッションID"))

    class Meta:
        csrf = False


@bp.route("/log", methods=("GET",))
@login_required
@paginate
def log():
    form = LogFilterForm(
        formdata=request.args,
    )  # safe because this doesn't edit data
    with t.time("db"):
        les = LogEntry.q(current_user, "n")
        if form.validate() and form.sid2.data:
            les = les.filter_by(sid2=form.sid2.data)
    return les, "silica/log.html", dict(form=form)


class UserLoginFilterForm(FlaskForm):
    sid2 = StringField(_l("セッションID"))
    ulid = StringField(_l("ログインID"))

    class Meta:
        csrf = False


@bp.route("/uls", methods=("GET",))
@login_required
@paginate
def uls():
    form = UserLoginFilterForm(
        formdata=request.args,
    )  # safe because this doesn't edit data
    query = UserLogin.q(current_user)
    if form.validate():
        if form.sid2.data:
            query = query.filter_by(sid2=form.sid2.data)
        if form.ulid.data:
            query = query.filter_by(id=form.ulid.data)
    return query, "silica/uls.html", dict(form=form)
