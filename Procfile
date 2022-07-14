release: cd ./airy && pipenv install --system
web: cd ./airy && pipenv run bash -c "gunicorn --bind :$PORT airy.wsgi:app"
