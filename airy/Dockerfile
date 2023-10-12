FROM python:3.11.5-slim@sha256:3542a2fcc89c24f7f4ed6fa6b1892175452cf8b612cc86168bd849b48b092a95

RUN adduser --system --home /app --gecos "Airy" app && \
    groupadd app && \
    usermod -g app app && \
    apt-get update && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
USER app
RUN python -m pip install --no-cache-dir poetry

COPY poetry.lock pyproject.toml /app/
RUN python -m poetry config virtualenvs.in-project true && \
    python -m poetry install --no-root
USER root
RUN rm -rf /var/cache/* && \
    mkdir /var/kankin-upload -p && \
    chown app:app /var/kankin-upload && \
    chmod 770 /var/kankin-upload
USER app

COPY . /app/
COPY ./airy/docker_config.py /app/local_config.py

USER root
EXPOSE 28910
CMD /app/.venv/bin/gunicorn \
      --bind :28910 \
      --error-logfile - \
      --config /app/container/gunicorn.py \
      airy.wsgi:application
