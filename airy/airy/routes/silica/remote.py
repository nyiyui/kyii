from flask import (
    redirect,
    render_template,
    url_for,
    flash,
    request,
    Response,
)

from flask_babel import lazy_gettext as _l
from flask_babel import _
from flask_wtf import FlaskForm
from wtforms import StringField
from wtforms.validators import InputRequired, Length
from ...ul import current_user, login_required
from .bp import bp
from ...db import LogEntry, UserLogin
from ...verifiers import remote


class RemoteDecideForm(FlaskForm):
    token = StringField(_l("トークン"), validators=[InputRequired(), Length(min=6)])


@bp.route("/remote_decide", methods=("GET", "POST"))
@login_required
def remote_decide():
    form = RemoteDecideForm(token=request.args.get("token"))
    token = form.token.data
    if token:
        token = token.strip()
    sid2 = remote._remote_get_sid2(token, current_user.id)
    if token and sid2 is None:
        flash(_("トークン%(token)sはありません。", token=token), "error")
    if form.validate_on_submit():
        print(request.form)
        if "next" in request.form:
            pass
        elif "confirm" in request.form:
            remote._remote_decide(token, current_user.id)
            flash(_("トークン%(token)sを承認しました。", token=token))
            current_user.add_le(
                LogEntry(renderer="remote", data=dict(token=token, sid2=sid2))
            )
            return redirect(url_for("silica.remote_decide"))
        else:
            raise TypeError("invalid submission")
    return render_template(
        "silica/remote_decide.html",
        form=form,
        sid2=sid2,
        ul=UserLogin.query.filter_by(sid2=sid2)
        .order_by(UserLogin.start.desc())
        .first(),
    )


@bp.route("/remote/poll", methods=("GET",))
def remote_poll():
    target_uid = request.args["uid"]
    token = request.args["token"]
    if remote._remote_decided(token, target_uid):
        return Response(status=200)
    else:
        return Response(status=202)
