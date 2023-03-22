from functools import wraps
from typing import Callable, Tuple
from flask import abort, request, render_template
from sqlalchemy.orm import Query


__ALL__ = ["int_or_abort", "paginate"]


def int_or_abort(s: str, code: int = 400) -> int:
    try:
        return int(s)
    except ValueError:
        abort(code)


def paginate(f: Callable[[], Tuple[Query, int, str, dict]]) -> Callable:
    """
    paginate wraps a function which returns a query object and returns a
    paginated result with the specified template.
    :param f: wrapped func; returns (query, per_page, template_name_or_list, context)
    TODO: change f to return a dataclass
    """

    @wraps(f)
    def inner():
        page = int_or_abort(request.args.get("page", 1))
        per_page = min(max(int_or_abort(request.args.get("per_page", 20)), 0), 100)
        query, template_name_or_list, context = f()
        query = query.paginate(page=page, per_page=per_page)
        return render_template(template_name_or_list, **context, query=query)

    return inner
