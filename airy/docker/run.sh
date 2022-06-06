#!/usr/bin/env bash

set -eux

cd /opt/kyii-airy

/opt/venv/bin/python3 -m flask db upgrade
#runuser -u kyii-airy /opt/venv/bin/python3 -m flask db upgrade

/opt/venv/bin/uwsgi --ini /opt/kyii-airy-etc/uwsgi.ini
