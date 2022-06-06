FROM python:bullseye

# ==User==
RUN useradd kyii-airy && passwd -d kyii-airy && mkdir /home/kyii-airy && chown kyii-airy:kyii-airy /home/kyii-airy

# ==Python Deps==
RUN ["mkdir", "/opt/venv"]
RUN ["python3", "-m", "venv", "/opt/venv"]
RUN /opt/venv/bin/python3 -m pip install wheel && \
    /opt/venv/bin/python3 -m pip install pipenv==2022.5.2 uwsgi==2.0.20
COPY . /opt/kyii-airy
WORKDIR "/opt/kyii-airy"
RUN ["chown", "kyii-airy:kyii-airy", "-R", "/opt/kyii-airy"]
RUN ["/opt/venv/bin/python3", "-m", "pipenv", "install", "--deploy", "--system"]
#RUN ["chmod", "0400", "/opt/kyii-airy", "-R"]

# ==Uploads==
RUN mkdir /opt/kyii-airy-upload && chown kyii-airy:kyii-airy /opt/kyii-airy-upload

# ==Etc==
RUN ["mkdir", "/opt/kyii-airy-etc"]
COPY ./docker/key.pem /opt/kyii-airy-etc/key.pem
RUN ["chown", "kyii-airy:kyii-airy", "/opt/kyii-airy-etc/key.pem"]
RUN ["chmod", "0400", "/opt/kyii-airy-etc/key.pem"]
COPY ./docker/uwsgi.ini /opt/kyii-airy-etc/uwsgi.ini
COPY ./docker/run.sh /opt/kyii-airy-etc/run.sh
RUN ["chown", "kyii-airy:kyii-airy", "/opt/kyii-airy-etc", "-R"]
RUN ["chmod", "u+x", "/opt/kyii-airy-etc/run.sh"]

CMD ["/opt/kyii-airy-etc/run.sh"]
