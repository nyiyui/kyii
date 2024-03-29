from flask import abort, redirect, render_template, request, url_for

from .bp import bp
from ...db import db
from ...db import OAuth2Token, OAuth2Client
from .etc import paginate
from ...oauth2 import authorization
from ...ul import current_user, login_required


@bp.route("/grants", methods=("GET",))
@login_required
@paginate
def grants():
    q = OAuth2Token.query.filter_by(user=current_user)
    return q, "silica/grants.html", {}


@bp.route("/grants/revoke", methods=("POST",))
@login_required
def grant_revoke():
    grid = request.form["grid"]
    gr = OAuth2Token.query.get(grid)
    if gr.user != current_user:
        abort(403)
    gr.revoke()
    db.session.commit()
    return redirect(url_for("silica.grants"))


@bp.route("/grants/delete", methods=("POST",))
@login_required
def grant_delete():
    grid = request.form["grid"]
    gr = OAuth2Token.query.get(grid)
    if gr.user != current_user:
        abort(403)
    db.session.delete(gr)
    db.session.commit()
    return redirect(url_for("silica.grants"))


@bp.route("/clients/<client_id>", methods=("GET",))
def client(client_id):
    client = OAuth2Client.query.filter_by(client_id=client_id).first_or_404()
    return render_template("silica/oauth/client.html", client=client)
