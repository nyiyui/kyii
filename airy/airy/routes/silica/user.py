import json
import os
from flask import (
    redirect,
    render_template,
    url_for,
    session,
    flash,
    request,
    abort,
    current_app,
    send_file,
)
from collections import defaultdict
from dataclasses import dataclass
from typing import Optional

from werkzeug.utils import secure_filename
from sqlalchemy import column, or_
from server_timing import Timing as t
from flask_babel import lazy_gettext as _l
from flask_babel import _
from flask_wtf import FlaskForm
from wtforms import validators, StringField, RadioField, PasswordField, IntegerField, EmailField, HiddenField
from wtforms.validators import InputRequired, Length, ValidationError, NumberRange
from flask_wtf.file import FileField
from ..util import conv_to_webp
from ...db import User, AF, AP, ap_reqs, LogEntry, UserLogin, db
from ...session import (
    API_V1_UID,
    API_V1_APID,
    API_V1_SOLVED,
    SILICA_ULIDS,
    SILICA_CURRENT_ULID,
    SILICA_UL_MAP,
    SILICA_NEXT,
    SILICA_LOGIN_LEVEL,
    SILICA_TAF,
)
from ...util import flip
from ...ul import (
    get_extra,
    setup_pre_login_ul,
    login_user,
    current_user,
    login_required,
)
from ...verifiers import VerificationError, remote, VERIFIER_NAMES, VERIFIER_CHOICES
from ... import verifiers
from .bp import bp
from .etc import int_or_abort


#@bp.route("/login/choose", methods=("GET", "POST"))
def login_choose():
    if API_V1_UID not in session:
        raise RuntimeError("start login first")  # TODO: nicer UX
    form = LoginChooseForm()
    with t.time("db"):
        u = User.query.get(session[API_V1_UID])
        if not u:
            flash(_("無効なユーザIDが使われました。ログインを停止しました。"), "error")
            session.pop(API_V1_UID)
            abort(400)
        aps = list(AP.query.filter_by(user=u))
        u.add_le(LogEntry(renderer="login_start", data=dict(extra=get_extra())))
    if len(aps) == 1:
        ap = aps[0]
        session[API_V1_APID] = ap.id
        session[API_V1_SOLVED] = set()
        return redirect(url_for("silica.login_list"))
    if API_V1_APID in session and API_V1_APID not in session:
        return redirect(url_for("silica.login_list"))
    form.apid.choices = [(ap.id, ap.name) for ap in aps]
    if form.validate_on_submit():
        session[API_V1_APID] = form.apid.data
        session[API_V1_SOLVED] = set()
        session[SILICA_LOGIN_LEVEL] = 1
        u.add_le(LogEntry(renderer="login_choose", data=dict(apid=form.apid.data)))
        if AP.query.get(form.apid.data).afs(user_id=u.id).count() == 0:
            raise RuntimeError("not allowing zero-length AP")
        return redirect(url_for("silica.login_list"))
    return render_template("silica/login/choose.html", form=form, u=u)


class LoginChooseForm(FlaskForm):
    apid = RadioField(
        _l("認証パス"), validators=[InputRequired()], render_kw=dict(autofocus=True)
    )


#@bp.route("/login/list", methods=("GET",))
def login_list():
    if (
        API_V1_UID not in session
        or API_V1_APID not in session
        or API_V1_SOLVED not in session
    ):
        return redirect(url_for("silica.login_start"))
    with t.time("db"):
        u = User.query.get(session[API_V1_UID])
        ap = AP.query.get(session[API_V1_APID])
    afs = ap.afs(user_id=u.id).filter(
        or_(column("level") == session[SILICA_LOGIN_LEVEL], column("level") is None)
    )
    afids = set(a[0] for a in afs.with_entities(AF.id).all())
    missing = afids - session[API_V1_SOLVED]
    if len(missing) == 0:
        all_afs = (
            ap.afs(user_id=u.id)
            .filter(column("level") > session[SILICA_LOGIN_LEVEL])
            .order_by(column("level").desc())
            .all()
        )
        if len(all_afs) != 0:
            session[SILICA_LOGIN_LEVEL] = (
                db.session.query(ap_reqs)
                .filter_by(ap_id=ap.id, af_id=all_afs[0].id)
                .first()
                .level
            )
            afs = ap.afs(user_id=u.id).filter(
                column("level") == session[SILICA_LOGIN_LEVEL]
            )
            afids = set(a[0] for a in afs.with_entities(AF.id).all())
            missing = afids - session[API_V1_SOLVED]
        else:
            flash(_("全ての認証が完了しました。%(name)sとしてログインしました。", name=u.name), "success")
            ul, _token = login_user(u, ap.id)
            u.add_le(
                LogEntry(
                    renderer="login_done",
                    data=dict(
                        ulid=ul.id,
                    ),
                )
            )
            session.pop(API_V1_UID)
            session.pop(API_V1_APID)
            session.pop(API_V1_SOLVED)
            session[SILICA_ULIDS] = session.get(SILICA_ULIDS, set()) | {ul.id}
            session[SILICA_CURRENT_ULID] = ul.id
            session[SILICA_UL_MAP] = session.get(SILICA_UL_MAP, {})
            i = max([0] + list(session[SILICA_UL_MAP].keys())) + 1
            session[SILICA_UL_MAP][i] = ul.id
            if (next_ := session.get(SILICA_NEXT, None)) is not None:
                if next_[0] is not None and next_[1] is not None:
                    return redirect(next_[0] + "?" + next_[1])
            return redirect(url_for("silica.index"))
    if len(missing) == 1:
        afid = list(missing)[0]
        if afid not in session[API_V1_SOLVED]:
            return redirect(url_for("silica.login_attempt", afid=afid))
    return render_template(
        "silica/login/list.html",
        u=u,
        ap=ap,
        afs=afs,
        solved_afs=session[API_V1_SOLVED],
        level=session[SILICA_LOGIN_LEVEL],
    )


class LoginAttemptRemoteForm(FlaskForm):
    pass


class LoginAttemptPwForm(FlaskForm):
    password = PasswordField(
        _l("パスワード"), validators=[InputRequired()], render_kw=dict(autofocus=True)
    )

    @property
    def attempt(self):
        return self.password


class LoginAttemptOtpTotpForm(FlaskForm):
    code = StringField(
        _l("コード"), validators=[InputRequired()], render_kw=dict(autofocus=True)
    )

    @property
    def attempt(self):
        return self.code


class SignupForm(FlaskForm):
    email = EmailField(
        _l("Eメール"),
        validators=[validators.Email(check_deliverability=True)],
    )


@bp.route("/signup", methods=("GET",))
def signup():
    form = SignupForm()
    if form.validate_on_submit():
        raise NotImplemented
    return render_template("silica/signup.html", form=form)


@bp.route("/iori", methods=("GET",))
@login_required
def iori():
    if (
        SILICA_ULIDS not in session
        or SILICA_UL_MAP not in session
        or SILICA_CURRENT_ULID not in session
    ):
        return redirect(url_for("silica.login_start"))
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
        return redirect(url_for("silica.login_start"))
    ul = UserLogin.query.get(ulid)
    if ulid not in session[SILICA_ULIDS] and ul.user != current_user:
        abort(403)
        return
    if session.get(SILICA_CURRENT_ULID) == ul.id:
        del session[SILICA_CURRENT_ULID]
        del session[SILICA_UL_MAP][flip(session[SILICA_UL_MAP])[ul.id]]
        flash(_("現ログインをログアウトしました。"), "caution")
    else:
        flash(_("他ログインをログアウトしました。"), "message")
    ul.revoke("revoke")
    db.session.commit()
    return redirect(url_for("silica.uls" if request.args.get("uls") else "silica.iori"))


@bp.route("/iori/rename", methods=("POST",))
@login_required
def iori_rename():
    ulid = request.form["ulid"]
    name = request.form["name"]
    ul = UserLogin.query.get(ulid)
    if ulid not in session[SILICA_ULIDS]:
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


@bp.route("/user/<uid>", methods=("GET",))
@login_required
def user(uid):
    u = User.query.get_or_404(uid)
    return render_template("silica/user.html", user=u)


class ConfigProfileForm(FlaskForm):
    name = StringField(_l("名前"), validators=[InputRequired(), Length(min=1)])
    handle = StringField(_l("ハンドル"), validators=[InputRequired(), Length(min=1)])
    image = FileField(_l("プロファイル画像"))


@bp.route("/config", methods=("GET", "POST"))
@login_required
def config():
    profile_form = ConfigProfileForm(name=current_user.name, handle=current_user.slug)
    if profile_form.validate_on_submit():
        current_user.name = profile_form.name.data
        current_user.slug = profile_form.handle.data
        if profile_form.image.data:
            f = profile_form.image.data
            fn = secure_filename(f.filename)
            f.save(
                tmp_path := os.path.join(
                    current_app.config["SILICA_IMAGES_TMP_PATH"],
                    f"{current_user.id}_{fn}",
                )
            )
            dest_path = os.path.join(
                current_app.config["SILICA_IMAGES_PATH"], f"{current_user.id}.webp"
            )
            conv_to_webp(tmp_path, dest_path)
            os.remove(tmp_path)
        db.session.commit()
    return render_template("silica/config.html", form=profile_form)


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
    # NOTE: list of all AFs somehow contains a None value?
    for apid, ap in ap.items():
        a = AP.query.filter_by(id=apid)
        reqs = [AF.query.filter_by(id=afid).first() for afid in ap["reqs"].keys()]
        if (b := a.first()) is not None:
            b.name = ap["name"]
            b.reqs = reqs
            for afid, level in ap["reqs"].items():
                db.session.query(ap_reqs).filter_by(ap_id=apid, af_id=afid).update(
                    dict(level=level)
                )
        else:
            db.session.add(AP(name=ap["name"], reqs=reqs))
    db.session.commit()
    flash(_("認証設定を保存しました。"))
    return redirect(url_for("silica.config"))


@bp.route("/config/ax", methods=("POST",))
@login_required
def config_ax():
    ap = defaultdict(lambda: dict(name="", reqs={}))
    af = defaultdict(dict)
    for key, value in request.form.items():
        tokens = key.split("/")
        if tokens[0] == "ap":
            apid = tokens[1]
            if tokens[2] == "name":
                ap[apid]["name"] = value
            elif tokens[2] == "req":
                if value:
                    ap[apid]["reqs"][tokens[3]] = 1
            elif tokens[2] == "reqlevel":
                if tokens[3] in ap[apid]["reqs"]:
                    if value == "":
                        ap[apid]["reqs"][tokens[3]] = 1
                    else:
                        ap[apid]["reqs"][tokens[3]] = int_or_abort(value, 422)
        elif tokens[0] == "af":
            afid = tokens[1]
            if tokens[2] == "name":
                af[afid]["name"] = value
    ap = dict(ap)
    af = dict(af)
    if (s := check_freshness(ap, af)) is not None:
        return s
    # NOTE: do AFs first as APs might have integrity issues with noexistent reqs
    return apply_changes(ap, af)


@bp.route("/config/af/<afid>/delete", methods=("POST",))
@login_required
def config_af_delete(afid):
    af = AF.query.get(afid)
    if af.user != current_user:
        abort(403)
    AF.query.filter_by(id=afid).delete()
    db.session.commit()
    flash(_("認証方法「%(af_name)s」を削除しました。", af_name=af.name))
    return redirect(url_for("silica.config"))


class ConfigTAFForm(FlaskForm):
    name = StringField(_l("名前"), validators=[InputRequired(), Length(min=1)])
    verifier = RadioField(_l("型"), choices=VERIFIER_CHOICES)


@dataclass
class TAF:
    id: str
    name: str
    verifier: str

    params: Optional[dict] = None
    state: Optional[dict] = None
    feedback: Optional[dict] = None
    gen_done: Optional[bool] = None
    verify_done: bool = False

    def save(self):
        if self.id:
            af = AF.query.get(self.id)
        else:
            af = AF()
        af.name = self.name
        af.user = current_user
        af.verifier = self.verifier
        af.params = self.params
        af.state = self.state
        af.gen_done = self.gen_done
        if not self.id:
            db.session.add(af)
        db.session.commit()
        del session[SILICA_TAF]
        flash(_("認証方法「%(af_name)s」を生成および確認、保存しました。", af_name=af.name), "success")
        return redirect(url_for("silica.config"))


@bp.route("/config/taf", methods=("GET", "POST"))
@login_required
def config_taf():
    id = request.args.get("id", "")
    step = request.args.get("step", "gen")
    if step not in ("gen", "verify"):
        step = "gen"
    form = ConfigTAFForm(request.args)
    if id:
        af = AF.query.get_or_404(id)
        if af.user != current_user:
            abort(403)
        form.name.data = af.name
        form.verifier.data = af.verifier
        form.verifier.render_kw = dict(disabled=True)  # TODO: is this correct?
    if form.validate_on_submit():
        if form.verifier.data == "remote":
            if step == "verify":
                raise NotImplementedError("verifying remote not implemented")
            af = AF(verifier="remote", user=current_user, name=form.name.data)
            af.regen({})
            db.session.add(af)
            db.session.commit()
            flash(_("認証方法「%(af_name)s」を生成および確認、保存しました。", af_name=af.name), "success")
            return redirect(url_for("silica.config"))
        session[SILICA_TAF] = TAF(
            id=id, name=form.name.data, verifier=form.verifier.data
        )
        raise RuntimeError()
        return redirect(url_for("silica.config_taf_gen"))
    print('a')
    return render_template("silica/config_taf.html", form=form)


@bp.route("/config/af/<afid>/regen", methods=("POST",))
@login_required
def config_af_regen(afid):
    return redirect(url_for("silica.config_taf", id=afid))


@bp.route("/config/af/<afid>/verify", methods=("POST",))
@login_required
def config_af_verify(afid):
    return redirect(url_for("silica.config_taf", id=afid, step="verify"))


@bp.route("/user/<uid>/pfp.webp")
@login_required
def user_pfp(uid):
    u = User.query.get_or_404(uid)
    path = os.path.join(
        os.path.abspath(current_app.config["SILICA_IMAGES_PATH"]), f"{u.id}.webp"
    )
    try:
        return send_file(path, download_name=f"{u.id}.webp", mimetype="image/webp")
    except FileNotFoundError:
        abort(404)
