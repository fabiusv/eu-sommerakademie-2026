FROM python:3.12-slim-bookworm AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update \
    && apt-get install --yes --no-install-recommends gdal-bin libgdal32 \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system civileu \
    && adduser --system --ingroup civileu --home /home/civileu civileu

WORKDIR /app
COPY pyproject.toml requirements.lock ./
RUN python -m pip install --upgrade pip \
    && python -m pip install --require-hashes -r requirements.lock

COPY --chown=civileu:civileu . .
RUN python manage.py collectstatic --noinput

USER civileu

EXPOSE 8000
CMD ["gunicorn", "config.wsgi:application", "--config", "deployment/gunicorn.conf.py"]
