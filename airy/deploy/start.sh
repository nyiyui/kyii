#!/bin/env sh

cd /opt/kankin-airy-home/airy

/opt/kankin-airy-home/.local/bin/pipenv run uwsgi --ini /opt/kankin-airy-home/uwsgi.ini
