from functools import wraps
from typing import Callable, Any, Union, List
from flask import request, render_template
import jinja2


__ALL__ = ['int_or_abort', 'paginate']


def int_or_abort(s: str) -> int:
    try:
        return int(s)
    except ValueError:
        abort(400)


def paginate(f: Callable) -> Callable:
    """
    paginate wraps a function which returns a query object and returns a
    paginated result with the specified template.
    :param f: the function to wrap; returns (query, per_page, template_name_or_list, context)
    TODO: change f to return a dataclass
    """
    @wraps(f)
    def inner():
        page = int_or_abort(request.args.get("page", 1))
        query, per_page, template_name_or_list, context = f()
        query = query.paginate(page, per_page, True)
        return render_template(template_name_or_list, **context, query=query)
    return inner
