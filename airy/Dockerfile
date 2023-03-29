FROM python:3.10.10-slim@sha256:f3be7f3778b538bdaa97a5dbb09c7427bdb3ac85e40aaa32eb4d9b3d66320e47

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
    mkdir /var/kyii-upload -p && \
    chown app:app /var/kyii-upload && \
    chmod 770 /var/kyii-upload
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
