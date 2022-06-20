from urllib.parse import urlencode, urljoin

from flask import current_app, redirect, request, url_for
from flask_admin import Admin
from flask_admin.contrib import sqla
from flask_login import current_user

from .db import (
    AF,
    AP,
    OAuth2AuthorizationCode,
    OAuth2Client,
    OAuth2Token,
    User,
    UserLogin,
    db,
)


class AiryModelView(sqla.ModelView):
    def is_accessible(self):
        return current_user.is_authenticated

    def inaccessible_callback(self, name, **kwargs):
        base = urljoin(current_app.config["KYII_YUUI_ORIGIN"], "/closet")
        query = urlencode({"next": request.path, "args": urlencode(request.args)})
        return redirect(f"{base}?{query}")


admin = Admin(name="Kyii Airy", template_mode="bootstrap3")
admin.add_view(AiryModelView(User, db.session))
admin.add_view(AiryModelView(UserLogin, db.session))
admin.add_view(AiryModelView(AP, db.session))
admin.add_view(AiryModelView(AF, db.session))
admin.add_view(AiryModelView(OAuth2Client, db.session))
admin.add_view(AiryModelView(OAuth2AuthorizationCode, db.session))
admin.add_view(AiryModelView(OAuth2Token, db.session))


def init_app(app):
    admin.init_app(app)
