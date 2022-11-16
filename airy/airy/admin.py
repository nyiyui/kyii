from urllib.parse import urlencode

from flask import current_app, redirect, request, url_for
from flask_admin import Admin, AdminIndexView, expose
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
        # TODO: secure admin
        return current_user.is_authenticated

    def inaccessible_callback(self, name, **kwargs):
        return redirect(
            url_for("silica.login", next=request.path, args=urlencode(request.args))
        )


class UserModelView(AiryModelView):
    column_searchable_list = ("slug", "name")


class GroupModelView(AiryModelView):
    column_searchable_list = ("slug", "name")


class UserLoginModelView(AiryModelView):
    column_excluded_columns = ("extra",)


class OAuth2ClientModelView(AiryModelView):
    column_searchable_list = ("client_id",)
    column_labels = dict(
        user=_l("管理者"),
    )
    column_list = ("client_name", "user", "client_id")
    form_extra_fields = dict(
        client_name=StringField(),
        client_uri=StringField(),
        grant_types=FieldList(SelectField(choices=GRANT_TYPE_CHOICES), min_entries=1),
        redirect_uris=FieldList(URLField(), min_entries=1),
        response_types=FieldList(
            SelectField(choices=RESPONSE_TYPE_CHOICES), min_entries=1
        ),
        scope=StringField(),
        token_endpoint_auth_method=SelectField(
            choices=TOKEN_ENDPOINT_AUTH_METHOD_CHOICES,
        ),
    )


admin = Admin(name=_l("二酸化ケイ素"), index_view=IndexView(), template_mode="bootstrap3")
admin.add_view(UserModelView(User, db.session))
admin.add_view(GroupModelView(Group, db.session))
admin.add_view(AiryModelView(Email, db.session))
admin.add_view(UserLoginModelView(UserLogin, db.session))
admin.add_view(AiryModelView(AP, db.session))
admin.add_view(AiryModelView(AF, db.session))
admin.add_view(OAuth2ClientModelView(OAuth2Client, db.session))
admin.add_view(AiryModelView(OAuth2AuthorizationCode, db.session))
admin.add_view(AiryModelView(OAuth2Token, db.session))
admin.add_view(AiryModelView(LogEntry, db.session))


def init_app(app):
    admin.init_app(app)
