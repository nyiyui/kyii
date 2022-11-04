import json
from flask import redirect, render_template, url_for, session, flash, request, abort
from flask_cors import CORS
from collections import defaultdict

from server_timing import Timing as t
from flask_babel import lazy_gettext as _l
from flask_babel import _
from flask_wtf import FlaskForm
from wtforms import StringField, RadioField, PasswordField
from wtforms.validators import InputRequired, Length, ValidationError
from ...db import User, AF, AP, LogEntry, UserLogin, db
from ...session import (
    API_V1_UID,
    API_V1_APID,
    API_V1_SOLVED,
    SILICA_ULIDS,
    SILICA_CURRENT_ULID,
    SILICA_UL_MAP,
    SILICA_NEXT,
)
from ...util import flip
from ...ul import get_extra, login_user, current_user, login_required
from ...verifiers import VerificationError, remote, VERIFIER_NAMES
from .bp import bp


@bp.errorhandler(403)
def unauthorized(error):
    return render_template("silica/403.html"), 403


@bp.route("/login", methods=("GET", "POST"))
def login():
    if API_V1_UID in session:
        return redirect(url_for("silica.login_choose"))
    session[SILICA_NEXT] = request.args.get("next")
    form = LoginStartForm()
    if form.validate_on_submit():
        target = User.query.filter_by(slug=form.slug.data, is_active=True).one()
        session[API_V1_UID] = target.id
        return redirect(url_for("silica.login_choose"))
    return render_template("silica/login/start.html", form=form)


class LoginStartForm(FlaskForm):
    slug = StringField("ハンドルネーム", validators=[InputRequired(), Length(min=1, max=128)])

    def validate_slug(form, field):
        if not User.query.filter_by(slug=field.data, is_active=True).count():
            raise ValidationError("Invalid slug")


@bp.route("/login/choose", methods=("GET", "POST"))
def login_choose():
    form = LoginChooseForm()
    if API_V1_UID not in session:
        raise RuntimeError("start login first")  # TODO: nicer UX
    with t.time("db"):
        u = User.query.get(session[API_V1_UID])
        aps = AP.query.filter_by(user=u)
        u.add_le(LogEntry(renderer="login_start", data=dict(extra=get_extra())))
    if API_V1_APID in session and API_V1_APID not in session:
        return redirect(url_for("silica.login_list"))
    form.apid.choices = [(ap.id, ap.name) for ap in aps]
    if form.validate_on_submit():
        session[API_V1_APID] = form.apid.data
        session[API_V1_SOLVED] = set()
        u.add_le(LogEntry(renderer="login_choose", data=dict(apid=form.apid.data)))
        return redirect(url_for("silica.login_list"))
    return render_template("silica/login/choose.html", form=form, u=u)


class LoginChooseForm(FlaskForm):
    apid = RadioField(_l("認証パス"), validators=[InputRequired()])


@bp.route("/login/list", methods=("GET",))
def login_list():
    if (
        API_V1_UID not in session
        or API_V1_APID not in session
        or API_V1_SOLVED not in session
    ):
        return redirect(url_for("silica.login"))
    with t.time("db"):
        u = User.query.get(session[API_V1_UID])
        ap = AP.query.get(session[API_V1_APID])
    afs = ap.afs(user_id=u.id)
    afids = set(a[0] for a in afs.with_entities(AF.id).all())
    missing = afids - session[API_V1_SOLVED]
    if len(missing) == 1:
        afid = list(missing)[0]
        if afid not in session[API_V1_SOLVED]:
            return redirect(url_for("silica.login_attempt", afid=afid))
    if len(missing) == 0:
        print("NEXT", session[SILICA_NEXT], session)
        flash(_("全ての認証が完了しました。%(name)sとしてログインしました。", name=u.name), "success")
        ul, _token = login_user(u, ap.id)
        session.pop(API_V1_UID)
        session.pop(API_V1_APID)
        session.pop(API_V1_SOLVED)
        session[SILICA_ULIDS] = session.get(SILICA_ULIDS, set()) | {ul.id}
        session[SILICA_CURRENT_ULID] = ul.id
        session[SILICA_UL_MAP] = session.get(SILICA_UL_MAP, {})
        i = max([0] + list(session[SILICA_UL_MAP].keys())) + 1
        session[SILICA_UL_MAP][i] = ul.id
        print("NEXT", session[SILICA_NEXT], session)
        if (next_ := session.get(SILICA_NEXT, None)) is not None:
            return redirect(next_)
        return redirect(url_for("silica.index"))
    return render_template(
        "silica/login/list.html",
        u=u,
        ap=ap,
        afs=afs,
        solved_afs=session[API_V1_SOLVED],
    )


class LoginAttemptRemoteForm(FlaskForm):
    pass


class LoginAttemptPwForm(FlaskForm):
    password = PasswordField(_l("パスワード"), validators=[InputRequired()])

    @property
    def attempt(self):
        return self.password


class LoginAttemptOtpTotpForm(FlaskForm):
    code = StringField(_l("コード"), validators=[InputRequired()])

    @property
    def attempt(self):
        return self.code


SINGLE_ATTEMPT_FORMS = dict(
    pw=LoginAttemptPwForm,
    otp_totp=LoginAttemptOtpTotpForm,
)

AUTOMATIC_VERIFIERS = {"limited"}


@bp.route("/login/attempt", methods=("GET", "POST"))
def login_attempt():
    if (
        API_V1_UID not in session
        or API_V1_APID not in session
        or API_V1_SOLVED not in session
    ):
        return redirect(url_for("silica.login"))
    with t.time("db"):
        u = User.query.get(session[API_V1_UID])
        af = AF.query.get(request.args["afid"])
        if af is None:
            flash(_("認証要素IDが存在していないのに参照しています。"), "error")
            return redirect(url_for("silica.login_list"))
        ap = AP.query.get(session[API_V1_APID])
    if af.id in session[API_V1_SOLVED]:
        flash(_("「%(af_name)s」認証要素は既に解決されています。", af_name=af.name), "caution")
        return redirect(url_for("silica.login_list"))
    if af.verifier in SINGLE_ATTEMPT_FORMS:
        Form = SINGLE_ATTEMPT_FORMS[af.verifier]
        form = Form()
        if form.validate_on_submit():
            attempt = form.attempt.data
            try:
                with t.time("verify"):
                    feedback, cur_done = af.verify(attempt, target_id=u.id)
            except VerificationError as e:
                flash(_("ペケ！認証要素を解けません：%(error)s", error=str(e)), "error")
                cur_done = False
            u.add_le(
                LogEntry(
                    renderer="login_attempt", data=dict(afid=af.id, cur_done=cur_done)
                )
            )
            if cur_done:
                flash(_("「%(af_name)s」認証要素を解きました。", af_name=af.name))
                session[API_V1_SOLVED] = session[API_V1_SOLVED] | {af.id}
                return redirect(url_for("silica.login_list"))
        return render_template(
            "silica/login/attempt_single.html", form=form, u=u, ap=ap, af=af
        )
    elif af.verifier in AUTOMATIC_VERIFIERS:
        abort(400)  # cannot attempt an automatic verifier
        return
    elif af.verifier == "webauthn":
        feedback, done = af.verify(json.dumps(dict(state="1_generate")))
        if done:
            raise RuntimeError("webauthn 1_generate expected not to finish with done")
        return render_template(
            "silica/login/attempt_webauthn.html", form=form, u=u, ap=ap, af=af
        )
    elif af.verifier == "remote":
        form = LoginAttemptRemoteForm()
        if form.validate_on_submit():
            session[API_V1_SOLVED] |= {af.id}
            return redirect(url_for("silica.login_list"))
        else:
            feedback, done = af.verify(
                json.dumps(dict(state="1_generate")), target_id=u.id
            )
            if done:
                raise RuntimeError(
                    "webauthn 1_generate expected not to finish with done"
                )
            return render_template(
                "silica/login/attempt_remote.html",
                u=u,
                ap=ap,
                af=af,
                feedback=feedback,
                timeout=remote.TIMEOUT,
                form=form,
            )
    else:
        flash(_("未知の認証要素の認証方法です。どうしよう…"), "error")
        return redirect(url_for("silica.index"))


class LoginStopForm(FlaskForm):
    pass


@bp.route("/login/stop", methods=("GET", "POST"))
def login_stop():
    if (
        API_V1_UID not in session
        or API_V1_APID not in session
        or API_V1_SOLVED not in session
    ):
        return redirect(url_for("silica.login"))
    form = LoginStopForm()
    ap = AP.query.get(session[API_V1_APID])
    u = User.query.get(session[API_V1_UID])
    if form.validate_on_submit():
        u.add_le(LogEntry(renderer="login_stop"))
        session.pop(API_V1_UID)
        session.pop(API_V1_APID)
        session.pop(API_V1_SOLVED)
        return redirect(url_for("silica.login"))
    return render_template("silica/login/stop.html", form=form, u=u, ap=ap)


@bp.route("/signup", methods=("GET",))
def signup():
    return render_template("silica/signup.html")


@bp.route("/iori", methods=("GET",))
@login_required
def iori():
    if (
        SILICA_ULIDS not in session
        or SILICA_UL_MAP not in session
        or SILICA_CURRENT_ULID not in session
    ):
        return redirect(url_for("silica.login"))
    ulids = session[SILICA_ULIDS]
    uls = UserLogin.get_usable().filter(UserLogin.id.in_(ulids)).all()
    session[SILICA_ULIDS] = set(ul.id for ul in uls)
    current = session.get(SILICA_CURRENT_ULID)
    return render_template(
        "silica/iori.html",
        uls=uls,
        current=current,
        ul_map_flipped=flip(session[SILICA_UL_MAP]),
    )


@bp.route("/iori/logout", methods=("POST",))
@login_required
def iori_logout():
    ulid = request.form["ulid"]
    if SILICA_ULIDS not in session:
        return redirect(url_for("silica.login"))
    if ulid not in session[SILICA_ULIDS]:
        abort(403)
        return
    ul = UserLogin.query.get(ulid)
    if session.get(SILICA_CURRENT_ULID) == ul.id:
        del session[SILICA_CURRENT_ULID]
        del session[SILICA_UL_MAP][flip(session[SILICA_UL_MAP])[ul.id]]
        flash(_("現ログインをログアウトしました。"), "caution")
    else:
        flash(_("他ログインをログアウトしました。"), "message")
    ul.revoke("revoke")
    db.session.commit()
    return redirect(url_for("silica.iori"))


@bp.route("/iori/rename", methods=("POST",))
@login_required
def iori_rename():
    ulid = request.form["ulid"]
    name = request.form["name"]
    ul = UserLogin.query.get(ulid)
    if ul.user != current_user:
        abort(403)
        return
    ul.name = name
    db.session.commit()
    return redirect(url_for("silica.iori"))


@bp.route("/iori/choose", methods=("POST",))
@login_required
def iori_choose():
    ulid = request.form["ulid"]
    if ulid not in session.get(SILICA_ULIDS, set()):
        abort(403)
        return
    session[SILICA_CURRENT_ULID] = ulid
    return redirect(url_for("silica.iori"))


@bp.route("/self", methods=("GET",))
@login_required
def self():
    return render_template("silica/self.html")


@bp.route("/user", methods=("GET",))
@login_required
def user():
    uid = request.args["uid"]
    u = User.query.get_or_404(uid)
    return render_template("silica/user.html", user=u)


class RemoteDecideForm(FlaskForm):
    token = StringField(_l("トークン"), validators=[InputRequired(), Length(min=6, max=6)])


@bp.route("/remote_decide", methods=("GET", "POST"))
@login_required
def remote_decide():
    form = RemoteDecideForm(token=request.args.get("token"))
    if form.validate_on_submit():
        token = form.token.data
        remote._remote_decide(token, current_user.id)
        flash(_("トークン%(token)sを承認しました。", token=token))
        current_user.add_le(LogEntry(renderer="remote", data=dict(token=token)))
        return redirect(url_for("silica.remote_decide"))
    return render_template("silica/remote_decide.html", form=form)


class ConfigProfileForm(FlaskForm):
    name = StringField(_l("名前"), validators=[InputRequired(), Length(min=1)])
    handle = StringField(_l("ハンドル"), validators=[InputRequired(), Length(min=1)])


@bp.route("/config", methods=("GET",))
@login_required
def config():
    form = ConfigProfileForm(name=current_user.name, handle=current_user.slug)
    return render_template("silica/config.html", form=form)


def check_freshness(ap, af):
    # Check the form is up-to-date, as old form ambiguous as to what happens
    # with AXs added after form made.
    if set(ap.keys()) - set(ap.id for ap in current_user.ap) != set():
        flash(_("フォームが入力中に無効になりました。再度保存してください。"), "error")
        return redirect(url_for("silica.config"))
    if set(af.keys()) - set(af.id for af in current_user.af) != set():
        flash(_("フォームが入力中に無効になりました。再度保存してください。"), "error")
        return redirect(url_for("silica.config"))


def apply_changes(ap, af):
    for afid, af in af.items():
        a = AF.query.filter_by(id=afid)
        if (b := a.first()) is not None:
            b.name = af["name"]
        else:
            db.session.add(AF(name=af["name"]))
    for apid, ap in ap.items():
        a = AP.query.filter_by(id=apid)
        reqs = [AF.query.filter_by(id=afid).first() for afid in ap["reqs"]]
        if (b := a.first()) is not None:
            b.name = ap["name"]
            b.reqs = reqs
        else:
            db.session.add(AP(name=ap["name"], reqs=reqs))
    db.session.commit()
    flash(_("認証設定を保存しました。"))
    return redirect(url_for("silica.config"))


@bp.route("/config/ax", methods=("POST",))
@login_required
def config_ax():
    ap = defaultdict(lambda: dict(name="", reqs=[]))
    af = defaultdict(dict)
    for key in request.form.keys():
        tokens = key.split("_")
        if tokens[0] == "ap":
            apid = tokens[1]
            if tokens[2] == "name":
                ap[apid]["name"] = request.form[key]
            elif tokens[2] == "req":
                ap[apid]["reqs"].append(request.form[key])
        elif tokens[0] == "af":
            afid = tokens[1]
            if tokens[2] == "name":
                af[afid]["name"] = request.form[key]
    ap = dict(ap)
    af = dict(af)
    if (s := check_freshness(ap, af)) is not None:
        return s
    # NOTE: do AFs first as APs might have integrity issues with noexistent reqs
    return apply_changes(ap, af)


@bp.route("/config/profile", methods=("POST",))
@login_required
def config_profile():
    form = ConfigProfileForm(name=current_user.name, handle=current_user.slug)
    if form.validate_on_submit():
        current_user.name = form.name.data
        current_user.slug = form.handle.data
        db.session.commit()
        return redirect(url_for("silica.config"))


@bp.context_processor
def verifier_names():
    return VERIFIER_NAMES
