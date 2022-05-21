FROM python:bullseye

RUN ["useradd", "kyii-senpai"]
RUN ["passwd", "-d", "kyii-senpai"]

# =Virtualenv=
RUN ["mkdir", "/opt/venv"]
RUN ["python3", "-m", "venv", "/opt/venv"]
COPY . /opt/kyii-senpai
WORKDIR "/opt/kyii-senpai"
RUN ["/opt/venv/bin/python3", "-m", "pip", "install", "pipenv", "uwsgi==2.0.20"]
RUN ["/opt/venv/bin/python3", "-m", "pipenv", "install", "--deploy", "--system"]

RUN ["mkdir", "/opt/kyii-senpai-etc"]
COPY ./docker/local_settings.py /opt/kyii-senpai/senpai/local_settings.py
COPY ./docker/oidc-private.key /opt/kyii-senpai-etc/oidc-private.key
RUN ["chown", "kyii-senpai:kyii-senpai", "/opt/kyii-senpai-etc/oidc-private.key"]

RUN ["/opt/venv/bin/python3", "manage.py", "check"]

COPY ./docker/uwsgi.ini /opt/kyii-senpai-etc/uwsgi.ini
COPY ./docker/senpai.sh /opt/kyii-senpai-etc/run.sh
RUN ["chown", "kyii-senpai:kyii-senpai", "/opt/kyii-senpai-etc", "-R"]
RUN ["chmod", "u+x", "/opt/kyii-senpai-etc/run.sh"]
CMD ["/opt/kyii-senpai-etc/run.sh"]
