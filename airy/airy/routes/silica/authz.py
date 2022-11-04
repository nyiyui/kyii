from .bp import bp
from ...oauth2 import authorization


@bp.route("/authz", methods=("GET",))
def authz():
    pass
