# flake8: noqa
from . import etc, main, oauth, remote, user, uaf

from .bp import init_app

__ALL__ = ["init_app"]
