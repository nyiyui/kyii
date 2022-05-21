#!/usr/bin/env bash

set -eux

cd /opt/kyii-senpai

runuser -u kyii-senpai /opt/venv/bin/python3 -- manage.py migrate

/opt/venv/bin/uwsgi --ini /opt/kyii-senpai-etc/uwsgi.ini
