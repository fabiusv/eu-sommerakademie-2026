FROM --platform=linux/amd64 postgis/postgis:17-3.5

RUN apt-get update \
    && apt-get install --yes --no-install-recommends postgresql-17-pgvector \
    && rm -rf /var/lib/apt/lists/*
