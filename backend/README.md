# CivilEU backend

CivilEU aggregates democratic participation opportunities behind a typed,
mobile-client-friendly API. This repository contains the disposable backend
MVP described in `ARCHITECTURE.md`.

Project documentation has one responsibility per file:

- [Architecture](ARCHITECTURE.md) defines technical boundaries.
- [MVP status](MVP_STATUS.md) records the currently implemented release.
- [Roadmap](ROADMAP.md) orders MVP V3 through the first release candidate.
- [Deployment runbook](deployment/README.md) defines the host-agnostic
  Docker/Compose operating contract.
- [Duplicate detection](DUPLICATE_DETECTION.md) specifies the current matching
  policy.
- [Decision records](docs/decisions/README.md) capture accepted cross-stage
  decisions.

## Local development

Requirements are Python 3.12, PostgreSQL with PostGIS, pgvector, and pg_trgm,
GDAL/GEOS, and the dependencies pinned in `uv.lock` and `requirements.lock`.

1. Copy `.env.example` to `.env` and set a development secret.
2. Create a Python 3.12 virtual environment and install `.[dev]`.
3. Start PostgreSQL with the three extensions available, then run
   `python manage.py migrate`.
4. Run `python manage.py seed_sources`.
5. Start the API with `python manage.py runserver`.

Set `OPENAI_API_KEY` in the ignored `.env` file to enable opportunity-kind
classification and duplicate-detection embeddings during imports.
`OPPORTUNITY_KIND_CLASSIFIER_MODEL` selects the classification model and
defaults to `gpt-5.4-nano`;
`OPPORTUNITY_DEDUPLICATION_EMBEDDING_MODEL` defaults to
`text-embedding-3-small`. The importer remains available without a key:
classification falls back to `OTHER`, while duplicate matching continues
without semantic evidence. Both failures are counted and retried on a future
import. Successful classifications and embeddings are content-addressed and
cached.

Source endpoints and paths live in `Source.configuration` in PostgreSQL. The
bootstrap command creates missing rows but never overwrites operator changes.
Each enabled row selects its importer through `adapter_key`; source-specific
URLs are intentionally not environment variables.

For the containerized development environment, use:

```shell
cp .env.example .env
docker compose -f compose.yaml -f compose.dev.yaml up --build
```

This starts four isolated services: PostgreSQL with PostGIS and pgvector, a
one-shot migration/seed service, the Django development web server, and the
importer scheduler. The scheduler
polls immediately and then once per minute by default. Each database-backed
source decides whether it is due through its own `sync_interval` (currently six
hours for European Youth Portal Events). The Eurodesk Learning source is seeded
enabled with approved `Source: Eurodesk` attribution. The API is available on
`http://localhost:8000` and PostgreSQL on `localhost:5432`.

Production uses the same application image and service boundaries with the
production override:

```shell
cp .env.production.example .env.production
docker compose --env-file .env.production \
  -f compose.yaml -f compose.prod.yaml up --build -d
```

Production runs Gunicorn, requires explicit secrets and origins, keeps
PostgreSQL on the internal Docker network, and publishes the web service only
to the configured host interface for an HTTPS reverse proxy. See
`deployment/README.md` before using it on a shared host.

The images contain no production domain. Hosts, trusted origins, database URLs,
ports, and secrets are runtime configuration. Gunicorn honors an explicit
`GUNICORN_BIND` or a platform-provided `PORT`, keeping the application image
portable across container hosts. CivilEU does not define a preferred hosting
vendor; the supported deployable is the cooperating Docker/Compose service
package.

The API schema and interactive documentation are exposed at
`/v1/openapi.json` and `/v1/docs`. Authentication endpoints are provided below
`/_allauth/`; product routes use the resulting secure Django session rather
than bearer tokens.

## Operations

- Synchronize all enabled sources: `python manage.py sync_opportunities`
- Synchronize one adapter: `python manage.py sync_opportunities --source eu_youth_events.v1`
- Run the long-lived scheduler: `python manage.py run_import_scheduler`
- Check scheduler freshness: `python manage.py check_import_health`
- Inspect or edit source endpoints: Django admin → Sources
- Inspect classifier outputs and import classification counters: Django admin
  → Classification results / Import runs
- Recheck stale/unchecked duplicate decisions:
  `python manage.py recheck_opportunity_duplicates`
- Recheck every published source row:
  `python manage.py recheck_opportunity_duplicates --all`
- Inspect duplicate evidence and import counters: Django admin → Duplicate
  decisions / Import runs
- Retry pending/failed geocoding: `python manage.py geocode_opportunities`
- Run verification: `ruff check . && pytest`

The import command exits non-zero on terminal failure and records every run in
the database. A successful source import is not made dependent on OpenCage
availability. See `deployment/README.md` for the provider-neutral staging
contract, `DUPLICATE_DETECTION.md` for the current matching policy, and
`ROADMAP.md` for the staged decisions leading to the first RC.

## MVP API

- `GET /v1/opportunities`
- `GET /v1/opportunities/{id}`
- `GET|PUT|DELETE /v1/bookmarks...`
- `GET|PATCH /v1/users/me/preferences`
- `POST /v1/interactions`
- `GET /health/live` and `GET /health/ready`

Catalog query parameters are documented in OpenAPI. Distance filtering requires
latitude, longitude, and a radius in metres together. It includes geocoded
nearby opportunities plus online/hybrid opportunities. The flat `kind` filter
covers events, programmes, recruitment, volunteering, funding, and exchanges;
there is no separate event-format dimension. Opportunity responses include
publication `status`; authenticated bookmark history may retain a withdrawn
opportunity even though catalog and public detail routes exclude it.
