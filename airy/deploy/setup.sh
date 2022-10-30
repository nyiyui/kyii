#!/bin/env bash

cd /opt/kyii-airy-home/airy
python3 -m pip install --user pipenv
/opt/kyii-airy-home/.local/bin/pipenv install --skip-lock
/opt/kyii-airy-home/.local/bin/pipenv install --skip-lock uwsgi
