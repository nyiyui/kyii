from flask import Blueprint, redirect, render_template, url_for
from flask_wtf import FlaskForm
from wtforms import RadioField, StringField
from wtforms.validators import DataRequired

from ..db import User

rika = Blueprint("rika", __name__)


def init_app(app):
    app.register_blueprint(rika)


class LoginStartForm(FlaskForm):
    slug = StringField("Slug", validators=[DataRequired()])


@rika.route("/authn/login")
def login():
    return redirect("/authn/login/start")


@rika.route("/authn/login/start", methods=("GET", "POST"))
def login_start():
    form = LoginStartForm()
    if form.validate_on_submit():
        return redirect(url_for("rika.login_choose", slug=form.slug))
    return render_template("authn/login.html", form=form)


class LoginChooseForm(FlaskForm):
    ap = RadioField("AP", validators=[DataRequired()])


@rika.route("/authn/login/choose", methods=("GET", "POST"))
def login_choose():
    form = LoginChooseForm()
    slug = request.args["slug"]
    u = User.query.filter_by(slug=slug).one()
    aps = u.aps
    if form.validate_on_submit():
        return redirect(url_for("rika.login_choose", slug=form.slug))
    return render_template("authn/login_choose.html", form=form)
