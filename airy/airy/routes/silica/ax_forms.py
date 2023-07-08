from dataclasses import dataclass

from flask import redirect, url_for
from flask_wtf import FlaskForm
from wtforms import validators, StringField, RadioField, PasswordField, IntegerField, EmailField, HiddenField
from wtforms.validators import InputRequired, Length, ValidationError, NumberRange
from flask_babel import lazy_gettext as _l
from flask_babel import _

from ...db import User


class LoginStartForm(FlaskForm):
    slug = StringField(
        _l("ハンドル"),
        validators=[InputRequired(), Length(min=1, max=128)],
        render_kw=dict(autofocus=True),
    )

    def validate_slug(form, field):
        if not User.query.filter_by(slug=field.data, is_active=True).count():
            raise ValidationError("Invalid slug")


class LoginStopForm(FlaskForm):
    pass


class LoginChooseForm(FlaskForm):
    apid = RadioField(
        _l("認証パス"), validators=[InputRequired()], render_kw=dict(autofocus=True)
    )


class ConfigTAFPwForm(FlaskForm):
    password = PasswordField(_l("パスワード"), validators=[InputRequired(), Length(min=1)])

    @property
    def gen_params(self):
        return dict(password=self.password.data)

    @property
    def attempt(self):
        return self.password.data


class ConfigTAFTOTPGenForm(FlaskForm):
    digits = IntegerField(_l("桁"), default=6, validators=[NumberRange(min=6, max=8)])
    algorithm = RadioField(
        _l("ハッシュ関数"),
        default="SHA1",
        choices=list(
            {
                "SHA1": _l("SHA-1"),
                "SHA256": _l("SHA-256"),
                "SHA512": _l("SHA-512"),
            }.items()
        ),
    )

    @property
    def gen_params(self):
        return dict(digits=self.digits.data, algorithm=self.algorithm.data)


class ConfigTAFTOTPVerifyForm(FlaskForm):
    code = StringField(_l("コード"))

    @property
    def attempt(self):
        return self.code.data


class ConfigTAFWebAuthnGenForm(FlaskForm):
    pkc = HiddenField("PublicKeyCredential (JSON)", id="js-pkc-field")

    @property
    def gen_params(self) -> dict:
        return dict(state="2_verify", require_user_verification=False, credential=self.pkc.data)


class ConfigTAFWebAuthnVerifyForm(FlaskForm):
    pkc = HiddenField("PublicKeyCredential (JSON)", id="js-pkc-field")

    @property
    def attempt(self) -> str:
        print('VERIFY-pkc', self.pkc.data)
        return json.dumps(dict(state="2_verify", pkc_json=self.pkc.data))


class ConfigTAFLimitedGenForm(FlaskForm):
    times = IntegerField(_l("回数"), validators=[NumberRange(min=0)])

    @property
    def gen_params(self) -> dict:
        return dict(times=self.times.data)


class ConfigTAFOAuthGenForm(FlaskForm):
    provider = RadioField(_l("プロバイダ"), validators=[InputRequired()])


class ConfigTAFRedoForm(FlaskForm):
    pass
