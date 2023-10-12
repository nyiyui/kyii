import dataclasses
from typing import Tuple, Optional, Literal
from functools import wraps

from flask import session, abort, render_template, flash
from sqlalchemy import column, or_
from flask_babel import lazy_gettext as _l
from flask_babel import _

from .ax_forms import *
from ...db import gen_id, User, AF, AP, ap_reqs, LogEntry, UserLogin, db
from ...ul import current_user, login_required, setup_pre_login_ul, get_extra, login_user
from .bp import bp
from ... import verifiers
from ...verifiers import VerificationError, remote, VERIFIER_NAMES, VERIFIER_CHOICES
from ...session import SILICA_ULIDS, SILICA_CURRENT_ULID, SILICA_UL_MAP


# Session Keys
SOLVED_PREFIX = "ax_login_solved_" # actual is "ax_login_solved_" + ul.id
LOGIN_LEVEL_PREFIX = "ax_login_level_" # actual is "ax_login_level_" + ul.id
UAF_TMP_AFS = "ax_uaf_tmp_afs" # Dict[str, UAF]
UAF_AIDS = "ax_uaf_aids" # Dict[str, Aid]


@dataclass
class Aid:
    """
    Has provider info and an AFID for that provider.
    (Aid is separated from UAF so UAF can be directly stored and serialized to session and db.)
    """
    provider_kind: Literal["session", "database"]
    afid: str
    context: Literal["login", "config"]
    uid: str

    id: Optional[str] = None
    ulid: str = ""
    solved: bool = False

    @property
    def provider(self):
        return dict(session=SessionUAFProvider, database=DatabaseUAFProvider)[self.provider_kind]

    @property
    def ul(self):
        return UserLogin.query.get(self.ulid)

    @property
    def af(self):
        self.provider.get(self.afid)

    @af.setter
    def af(self, af):
        assert af.id == self.afid
        self.provider.set(af)

    def set_solved(self):
        self.solved = True
        self.update()
        if self.ulid:
            session[SOLVED_PREFIX + self.ulid] = session[SOLVED_PREFIX + self.ulid] | {self.afid}

    def update(self):
        Aid.add(self)

    @classmethod
    def get(cls, aidid: str):
        return session[UAF_AIDS][aidid]

    @classmethod
    def add(cls, aid: "Aid") -> "Aid":
        if not aid.id:
            aid.id = gen_id()
        aids = session.get(UAF_AIDS, {})
        aids[aid.id] = aid
        session[UAF_AIDS] = aids
        return aid


@dataclass
class UAF:
    id: str
    name: str
    user: User
    verifier: str

    params: Optional[dict] = None
    state: Optional[dict] = None
    gen_done: Optional[bool] = None

    def reset_state(self) -> None:
        self.state = None

    def gen(self, gen_params: dict, **kwargs) -> Optional[dict]:
        self.params, self.state, feedback, self.gen_done = verifiers.gen(
            self.verifier, gen_params, self.state
        )
        return feedback

    def verify(self, attempt: str, **kwargs) -> Tuple[Optional[dict], bool]:
        self.params, self.state, feedback, done = verifiers.verify(
            self.verifier, attempt, self.params, self.state, **kwargs
        )
        return feedback, done


class UAFProvider:
    @classmethod
    def get(cls, afid: str) -> UAF:
        """
        Raises KeyError if specified UAF doesn't exist.
        """
        raise NotImplementedError()

    @classmethod
    def set(cls, uaf: UAF) -> None:
        raise NotImplementedError()


class SessionUAFProvider:
    @classmethod
    def get(cls, afid: str) -> UAF:
        return session[UAF_TMP_AFS][afid]

    @classmethod
    def set(cls, uaf: UAF) -> None:
        session[UAF_TMP_AFS][uaf.id] = uaf


class DatabaseUAFProvider:
    @classmethod
    def get(cls, afid: str) -> UAF:
        af = AF.query.get(afid)
        kwargs = {}
        for key in [field.name for field in dataclasses.fields(UAF)]:
            kwargs[key] = getattr(af, key)
        return UAF(**kwargs)

    @classmethod
    def set(cls, uaf: UAF) -> None:
        if uaf.id:
            af = AF.query.get(uaf.id)
        else:
            af = AF()
        for key in [field.name for field in dataclasses.fields(UAF)]:
            setattr(af, key, getattr(uaf, key))
        if not uaf.id:
            db.session.add(af)


def ul_goodies(f):
    @wraps(f)
    def inner(ulid):
        ul = UserLogin.query.get(ulid)
        if ul.logged_in:
            flash(_("既にログインしています。"), "error")
            abort(422)
        if ul is None:
            abort(400)
        return f(ul)
    return inner


@bp.route("/ax/login/start", methods=("GET", "POST"))
def login_start():
    form = LoginStartForm()
    if form.validate_on_submit():
        target = User.query.filter_by(slug=form.slug.data, is_active=True).one()
        # TODO: don't implement next for now (while reimplementing login etc)
        ul = setup_pre_login_ul(target)
        db.session.commit()
        return redirect(url_for("silica.login_choose", ulid=ul.id))
    return render_template("silica/login/start.html", form=form)


@bp.route("/ax/login/<ulid>/stop", methods=("GET", "POST"))
@ul_goodies
def login_stop(ul):
    form = LoginStopForm()
    if form.validate_on_submit():
        u.add_le(LogEntry(renderer="login_stop", data=dict(ulid=ul.id)))
        flash(_("ログイン手続きを停止しました。"))
        # TODO: delete UserLogin?
        return redirect(url_for("silica.login_start"))
    return render_template("silica/login/stop.html", form=form, ul=ul)


@bp.route("/ax/login/<ulid>/choose", methods=("GET", "POST"))
@ul_goodies
def login_choose(ul):
    form = LoginChooseForm()
    # TODO: UserLogins need to be deleted if a user is deleted
    u = ul.user
    if not ul.user.is_active:
        flash(_("無効なユーザIDが使われました。ログインを停止しました。"), "error")
        abort(400)
    aps = list(ul.user.ap)
    u.add_le(LogEntry(renderer="login_start", data=dict(extra=get_extra())))
    if len(aps) == 1:
        ul.against_id = aps[0].id
        db.session.commit()
        return redirect(url_for("silica.login_list", ulid=ul.id))
    form.apid.choices = [(ap.id, ap.name) for ap in aps]
    if form.validate_on_submit():
        ul.against_id = form.apid.data
        session[SOLVED_PREFIX + ul.id] = set()
        session[LOGIN_LEVEL_PREFIX + ul.id] = 1
        u.add_le(LogEntry(renderer="login_choose", data=dict(apid=form.apid.data)))
        if AP.query.get(form.apid.data).afs(user_id=u.id).count() == 0:
            raise RuntimeError("not allowing zero-length AP")
        return redirect(url_for("silica.login_list", ulid=ul.id))
    return render_template("silica/login/choose.html", form=form, u=u, ulid=ul.id)


@bp.route("/ax/login/<ulid>/list", methods=("GET",))
@ul_goodies
def login_list(ul):
    LOGIN_LEVEL = LOGIN_LEVEL_PREFIX + ul.id
    SOLVED = SOLVED_PREFIX + ul.id
    ap = ul.against
    afs = ap.afs(user_id=ul.user.id).filter(
        or_(column("level") == session[LOGIN_LEVEL], column("level") is None)
    )
    afids = set(a[0] for a in afs.with_entities(AF.id).all())
    missing = afids - session[SOLVED]
    if len(missing) == 0:
        next_afs = (
            ap.afs(user_id=ul.user.id)
            .filter(column("level") > session[LOGIN_LEVEL])
            .order_by(column("level").desc())
            .all()
        )
        if len(next_afs) != 0:
            # go to next level
            session[LOGIN_LEVEL] = (
                db.session.query(ap_reqs)
                .filter_by(ap_id=ap.id, af_id=next_afs[0].id)
                .first()
                .level
            )
            afs = ap.afs(user_id=ul.user.id).filter(
                column("level") == session[LOGIN_LEVEL]
            )
            afids = set(a[0] for a in afs.with_entities(AF.id).all())
            missing = afids - session[SOLVED]
        else:
            flash(_("全ての認証が完了しました。%(name)sとしてログインしました。", name=ul.user.name), "success")
            ul, _token = login_user(ul.user, ap.id)
            ul.user.add_le(
                LogEntry(
                    renderer="login_done",
                    data=dict(
                        ulid=ul.id,
                    ),
                )
            )
            ul.logged_in = True
            db.session.commit()
            session[SILICA_ULIDS] = session.get(SILICA_ULIDS, set()) | {ul.id}
            session[SILICA_CURRENT_ULID] = ul.id
            session[SILICA_UL_MAP] = session.get(SILICA_UL_MAP, {})
            i = max([0] + list(session[SILICA_UL_MAP].keys())) + 1
            session[SILICA_UL_MAP][i] = ul.id
            # handle next= and friends
            return redirect(url_for("silica.index"))
    if len(missing) == 1:
        afid = list(missing)[0]
        if afid not in session[SOLVED]:
            aid = Aid.add(Aid(
                provider_kind="database",
                afid=afid,
                context="login",
                uid=ul.user_id,
                ulid=ul.id,
            ))
            return redirect(url_for("silica.uaf_verify", aidid=aid.id, afid=afid))
    return render_template(
        "silica/login/list.html",
        ul=ul,
        solved_afs=session[SOLVED],
        level=session[LOGIN_LEVEL],
    )


@bp.route("/ax/uaf/<aidid>/create", methods=("GET", "POST"))
@login_required
def uaf_init():
    raise NotImplementedError()


@bp.route("/ax/uaf/<aidid>/<afid>/gen", methods=("GET", "POST"))
def uaf_gen(aidid: str, afid: str):
    aid = Aid.get(aidid)
    try:
        af = Aid.get(aidid).provider.get(afid)
    except KeyError:
        flash(_("AFIDが存在していないのに参照しています。"), "error")
        return redirect(default_url)
    default_url = get_default_url(aid)
    template_kwargs = {}
    form = GEN_FORMS[af.verifier]()
    if af.verifier == "oauth":
        form.choices = [
            (handle, client["name"])
            for handle, client in current_app.config.OAUTH2_CLIENTS.items()
        ]
        # TODO: pre-fill settings for existing (t)af
    elif af.verifier == "webauthn" and (not af.state or af.state.get('state') != '2_verify'):
        # do the 1st step w/o a round trip
        af.params, af.state, af.feedback, af.gen_done = verifiers.gen("webauthn", dict(
            state="1_generate",
        ), {})
        session[SILICA_TAF] = af
        template_kwargs['create_options_json'] = af.feedback['options']
    if form.validate_on_submit():
        try:
            af.params, af.state, af.feedback, af.gen_done = verifiers.gen(
                af.verifier, form.gen_params, af.state
            )
        except VerificationError as e:
            flash(_("認証方法生成：%(err)s", err=e), "error")
        session[SILICA_TAF] = af
        if aid.context == "config" and af.gen_done:
            return redirect(url_for("silica.uaf_verify", aidid=aidid, afid=afid))
    if af.verifier not in VERIFIER_NAMES:
        abort(422)
    return render_template(f"silica/ax/gen_{af.verifier}.html", form=form, af=af, **template_kwargs)


VERIFY_FORMS = dict(
    pw=ConfigTAFPwForm,
    otp_totp=ConfigTAFTOTPVerifyForm,
    webauthn=ConfigTAFWebAuthnVerifyForm,
)

AUTOMATIC_VERIFIERS = {"limited"}

DEFAULT_ROUTE = dict(
    login="silica.login_list",
    config="silica.config",
)

def get_default_url(aid) -> str:
    if aid.context == "login":
        return url_for(DEFAULT_ROUTE[aid.context], ulid=aid.ul.id)
    raise NotImplementedError()


@bp.route("/ax/uaf/<aidid>/<afid>/verify", methods=("GET", "POST"))
def uaf_verify(aidid: str, afid: str):
    aid = Aid.get(aidid)
    try:
        af = Aid.get(aidid).provider.get(afid)
    except KeyError:
        flash(_("AFIDが存在していないのに参照しています。"), "error")
        abort(404)
    default_url = get_default_url(aid)
    level: Optional[int] = None
    if aid.ulid:
        level = session[LOGIN_LEVEL_PREFIX + aid.ulid]
    u = User.query.get(aid.uid)
    if aid.solved:
        flash(_("「%(af_name)s」認証要素は既に解決されています。", af_name=af.name), "caution")
        return redirect(default_url)
    if af.verifier == "limited":
        feedback, cur_done = af.verify(None, target_id=u.id)
        if not cur_done:
            raise RuntimeError("limited must not not cur_done")
        flash(_("「%(af_name)s」認証要素を解きました。", af_name=af.name))
        aid.set_solved()
        return redirect(default_url)

    template_kwargs = {}
    form = VERIFY_FORMS[af.verifier]()
    if af.verifier not in VERIFIER_NAMES:
        abort(422)
        assert False
    if af.verifier == "otp_totp":
        digits = af.params["digits"]
        form.code.validators += (Length(min=digits, max=digits),)
    elif af.verifier == "webauthn" and (not af.state or af.state.get('state') != '2_verify'):
        # do the 1st step w/o a round trip
        af.verify(json.dumps(dict(state="1_generate")))
        aid.provider.set(af)
        template_kwargs['get_options_json'] = af.feedback['options']
    elif af.verifier == "remote":
        form = LoginAttemptRemoteForm()
        if form.validate_on_submit():
            aid.set_solved()
            return redirect(default_url)
        else:
            feedback, done = af.verify(
                json.dumps(dict(state="1_generate")), target_id=u.id
            )
            if done:
                raise RuntimeError(
                    "remote 1_generate expected not to finish with done"
                )
            return render_template(
                "silica/uaf/attempt_remote.html",
                context=aid.context,
                u=u,
                ap=ul.against,
                af=af,
                feedback=feedback,
                timeout=remote.TIMEOUT,
                form=form,
            )
    if form.validate_on_submit():
        try:
            feedback, cur_done = af.verify(form.attempt)
        except VerificationError as e:
            flash(_("認証要素を解けません：%(error)s", error=str(e)), "error")
        u.add_le(
            LogEntry(
                renderer="login_attempt",
                data=dict(
                    afid=af.id, cur_done=cur_done, level=level,
                ),
            )
        )
        aid.provider.set(af)
        if cur_done:
            flash(_("認証要素を解きました。", af_name=af.name))
            aid.set_solved()
            return redirect(default_url)
    return render_template(
        f"silica/ax/verify_{af.verifier}.html",
        context=aid.context,
        form=form,
        af=af,
        aid=aid,
        **template_kwargs,
        **(dict(ul=UserLogin.query.get(aid.ulid)) if aid.ulid else {}),
    )


GEN_FORMS = dict(
    pw=ConfigTAFPwForm,
    otp_totp=ConfigTAFTOTPGenForm,
    webauthn=ConfigTAFWebAuthnGenForm,
    limited=ConfigTAFLimitedGenForm,
    oauth=ConfigTAFOAuthGenForm,
)


@bp.context_processor
def verifier_names():
    return VERIFIER_NAMES
