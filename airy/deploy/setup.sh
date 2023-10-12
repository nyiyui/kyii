#!/bin/env bash

cd /opt/kankin-airy-home/airy
python3 -m pip install --user pipenv
/opt/kankin-airy-home/.local/bin/pipenv install --skip-lock
/opt/kankin-airy-home/.local/bin/pipenv install --skip-lock uwsgi
