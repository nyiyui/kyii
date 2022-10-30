#!/bin/env sh

cd /opt/kyii-airy-home/airy

/opt/kyii-airy-home/.local/bin/pipenv run uwsgi --ini /opt/kyii-airy-home/uwsgi.ini
