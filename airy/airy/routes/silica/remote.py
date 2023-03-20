import asyncio
from functools import wraps
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
    token = StringField(_l("トークン"), validators=[InputRequired(), Length(min=6, max=6)])


@bp.route("/remote_decide", methods=("GET", "POST"))
@login_required
def remote_decide():
    form = RemoteDecideForm(token=request.args.get("token"))
    token = form.token.data
    sid2 = remote._remote_get_sid2(token, current_user.id)
    if sid2 is None:
        flash(_("トークン%(token)sはありません。", token=token), "error")
    if form.validate_on_submit():
        remote._remote_decide(token, current_user.id)
        flash(_("トークン%(token)sを承認しました。", token=token))
        current_user.add_le(LogEntry(renderer="remote",
                                     data=dict(token=token, sid2=sid2)))
        return redirect(url_for("silica.remote_decide"))
    return render_template("silica/remote_decide.html", form=form, sid2=sid2, ul=UserLogin.query.filter_by(sid2=sid2).one_or_none())


@bp.route("/remote_confirm", methods=("POST",))
@login_required
def remote_confirm():
    form = RemoteConfirmForm(token=request.args.get("token"))
    if form.validate_on_submit():
        token = form.token.data
        sid2 = remote._remote_get_sid2(token, current_user.id)
        remote._remote_decide(token, current_user.id)
        flash(_("トークン%(token)sを承認しました。", token=token))
        current_user.add_le(LogEntry(renderer="remote",
                                     data=dict(token=token, sid2=sid2)))
        return redirect(url_for("silica.remote_decide"))
    return render_template("silica/remote_confirm.html", form=form)


async def remote_stream(target_id: str, token: str):
    # TODO: async
    class Proxy:
        def __init__(self):
            self.send = False

    p = Proxy()

    def insert_this(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            return f(f, *args, **kwargs)

        return wrapper

    @insert_this
    def handler(this, *args, **kwargs):
        p.send = True
        remote.decided.disconnect(this)

    remote.decided.connect(handler)
    counter = 0
    limit = remote.TIMEOUT
    interval = 1
    while 1:
        asyncio.sleep(interval)
        if counter > limit / interval:
            yield "event: timeout\ndata: null\n\n"
            return
        if p.send:
            yield "event: decided\ndata: null\n\n"
            return
        counter += 1


@bp.route("/remote/wait", methods=("GET",))
async def remote_wait():
    # SECURITY: leaking when and if tokens are verified or not should be fine
    target_id = request.args["uid"]
    token = request.args["token"]
    return Response(remote_stream(target_id, token), mimetype="text/event-stream")
