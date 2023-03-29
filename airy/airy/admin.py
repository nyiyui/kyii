from urllib.parse import urlencode

from flask import redirect, request, url_for
from flask_admin import Admin, AdminIndexView, expose
from flask_admin.menu import MenuLink
from wtforms.fields import FieldList, SelectField, URLField, StringField
from flask_admin.contrib import sqla
from flask_babel import lazy_gettext as _l
from .ul import current_user

from .db import (
    AF,
    AP,
    OAuth2AuthorizationCode,
    OAuth2Client,
    OAuth2Token,
    User,
    Group,
    Email,
    UserLogin,
    LogEntry,
    db,
)


TOKEN_ENDPOINT_AUTH_METHOD_CHOICES = [
    (a, a)
    for a in (
        "client_secret_post",
        "client_secret_basic",
        "client_secret_jwt",
        "private_key_jwt",
    )
]
RESPONSE_TYPE_CHOICES = [(a, a) for a in ("code",)]
GRANT_TYPE_CHOICES = [(a, a) for a in ("authorization_code", "client_credentials")]


class IndexView(AdminIndexView):
    @expose("/")
    def index(self):
        return self.render("admin/index.html", current_user=current_user)


class AiryModelView(sqla.ModelView):
    def is_accessible(self):
        if current_user.is_anonymous:
            return False
        if not current_user.is_authenticated:
            return False
        if "admin" not in current_user.perms:
            return False
        return True

    def inaccessible_callback(self, name, **kwargs):
        return redirect(
            url_for("silica.login", next=request.path, args=urlencode(request.args))
        )


class UserModelView(AiryModelView):
    column_searchable_list = ("slug", "name")


class GroupModelView(AiryModelView):
    column_searchable_list = ("slug", "name")
    form_extra_fields = dict(
        perms=FieldList(StringField()),
    )


class UserLoginModelView(AiryModelView):
    column_excluded_columns = ("extra",)


class OAuth2ClientModelView(AiryModelView):
    column_searchable_list = ("client_id",)
    column_labels = dict(
        user=_l("管理者"),
    )
    column_list = ("client_name", "user", "client_id")
    form_extra_fields = dict(
        redirect_uris=FieldList(URLField(), min_entries=1),
        token_endpoint_auth_method=SelectField(
            choices=TOKEN_ENDPOINT_AUTH_METHOD_CHOICES,
        ),
        grant_types=FieldList(SelectField(choices=GRANT_TYPE_CHOICES), min_entries=1),
        response_types=FieldList(
            SelectField(choices=RESPONSE_TYPE_CHOICES), min_entries=1
        ),
        client_name=StringField(),
        client_uri=StringField(),
        logo_uri=StringField(),
        scope=StringField(),
        contacts=FieldList(StringField(), min_entries=1),
        tos_uri=StringField(),
        policy_uri=StringField(),
        jwks_uri=StringField(),
        jwks=FieldList(StringField(), min_entries=1),
        software_id=StringField(),
    )


admin = Admin(
    name=_l("二酸化ケイ素"), index_view=IndexView("ホーム"), template_mode="bootstrap3"
)
admin.add_view(UserModelView(User, db.session, _l("ユーザー")))
admin.add_view(GroupModelView(Group, db.session, _l("グループ")))
admin.add_view(AiryModelView(Email, db.session, _l("メール")))
admin.add_view(UserLoginModelView(UserLogin, db.session, _l("ログイン")))
admin.add_view(AiryModelView(AP, db.session, _l("認証パス")))
admin.add_view(AiryModelView(AF, db.session, _l("認証方法")))
admin.add_view(OAuth2ClientModelView(OAuth2Client, db.session, _l("クライアント")))
admin.add_view(AiryModelView(OAuth2AuthorizationCode, db.session, _l("認可")))
admin.add_view(AiryModelView(OAuth2Token, db.session, _l("トークン")))
admin.add_view(AiryModelView(LogEntry, db.session, _l("ログ")))


def init_app(app):
    with app.test_request_context():
        admin.add_link(MenuLink(name=_l("メインサイト"), url=url_for("silica.index")))
    admin.init_app(app)
