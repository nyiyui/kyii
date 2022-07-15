#!/bin/sh

set -eux

echo "$SECRET_JWT_PEM" > ./jwt.pem
echo "$SECRET_LOCAL_CONFIG" > ./local_config.py

# NOTE: at runtime because config vars aren't available at build time
pipenv run bash -c "flask db upgrade"

pipenv run bash -c "gunicorn --bind :$PORT airy.wsgi:app"
