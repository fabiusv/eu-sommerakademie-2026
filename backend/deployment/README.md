# Containerized development and production runbook

CivilEU uses one immutable application image in multiple isolated containers.
Web serving, migrations, and scheduled imports never share a process.

The package is host- and domain-agnostic. Public hosts, trusted origins,
database URLs, ports, credentials, and persistent volumes are runtime
configuration. Gunicorn uses `GUNICORN_BIND` when provided and otherwise
listens on `PORT` (default 8000). No hosting provider is part of this contract.

## Service topology

| Service | Image | Responsibility | Lifetime |
| --- | --- | --- | --- |
| `db` | CivilEU PostgreSQL image | PostgreSQL with PostGIS, pgvector, and pg_trgm | Long-running |
| `migrate` | CivilEU application image | Migrations and missing-source seeding | One-shot |
| `web` | CivilEU application image | Django API via runserver or Gunicorn | Long-running |
| `scheduler` | CivilEU application image | Due-source polling and imports | Long-running |

The database image extends `postgis/postgis:17-3.5` with the PostgreSQL 17
pgvector package; migrations enable the `postgis`, `vector`, and `pg_trgm`
extensions. `web` and `scheduler` wait for a successful `migrate` container.
`migrate` waits for the PostgreSQL health check. Both long-running application
services use the same code, dependencies, migrations, and environment contract.

The official PostGIS 17/3.5 base image is currently published for AMD64. The
Compose contract therefore defaults `CIVILEU_DATABASE_PLATFORM` to
`linux/amd64`; Docker runs it through standard emulation on ARM hosts. The
setting remains runtime-overridable when an approved base image supports the
host architecture directly.

The scheduler must have exactly one intended replica. PostgreSQL advisory locks
still protect individual sources if containers overlap during a deployment.

## Development environment

Create the ignored local environment file and start the development override:

```shell
cp .env.example .env
docker compose -f compose.yaml -f compose.dev.yaml up --build
```

Development differences are limited to:

- Source code is bind-mounted into the three application containers.
- `web` runs Django's development server without autoreload.
- Web port 8000 and PostgreSQL port 5432 are published to localhost.
- HTTPS redirect and secure cookies are disabled.

The database remains in the named `postgres-data` volume across restarts.

Useful commands:

```shell
docker compose -f compose.yaml -f compose.dev.yaml ps
docker compose -f compose.yaml -f compose.dev.yaml logs -f web scheduler
docker compose -f compose.yaml -f compose.dev.yaml run --rm web python manage.py check
docker compose -f compose.yaml -f compose.dev.yaml run --rm web python manage.py sync_opportunities
docker compose -f compose.yaml -f compose.dev.yaml run --rm web python manage.py recheck_opportunity_duplicates
docker compose -f compose.yaml -f compose.dev.yaml down
```

Use `down --volumes` only when intentionally discarding the development
database.

## Production environment on one Docker host

The production override is suitable for a single shared Docker host. It runs
Gunicorn, requires explicit secrets, does not expose PostgreSQL, and binds the
web port to `127.0.0.1` by default for an HTTPS reverse proxy.

Create a private production environment file:

```shell
cp .env.production.example .env.production
chmod 600 .env.production
```

Replace every placeholder. `POSTGRES_PASSWORD` and the password embedded in
`CONTAINER_DATABASE_URL` must match. `OPENAI_API_KEY` is consumed only by the
scheduler/import process through the shared application configuration. The
caller-selected opportunity-kind classifier defaults to `gpt-5.4-nano`, and
the duplicate-detection embedding model defaults to
`text-embedding-3-small`. Without credentials, imports still complete with
classification fallback and without semantic duplicate evidence. Validate the
fully merged configuration:

```shell
docker compose --env-file .env.production \
  -f compose.yaml -f compose.prod.yaml config
```

Build and start the services:

```shell
docker compose --env-file .env.production \
  -f compose.yaml -f compose.prod.yaml up --build -d
```

Inspect readiness and logs:

```shell
docker compose --env-file .env.production \
  -f compose.yaml -f compose.prod.yaml ps
docker compose --env-file .env.production \
  -f compose.yaml -f compose.prod.yaml logs -f web scheduler migrate
curl --fail http://127.0.0.1:8000/health/ready
```

An external reverse proxy or load balancer must provide HTTPS and forward
`X-Forwarded-Proto`. Only the proxy should be publicly reachable. Increase HSTS
gradually after confirming the real domain is HTTPS-only.

## Scheduled imports

The scheduler container runs `python manage.py run_import_scheduler`. It:

1. Polls immediately after the migration service succeeds.
2. Repeats every `IMPORT_SCHEDULER_POLL_SECONDS` (60 seconds by default).
3. Imports only sources whose database-backed `sync_interval` has elapsed.
4. Uses the latest attempt time as well as the latest success time, preventing
   a failing source from being retried on every poll.
5. Preserves importer advisory locks and `ImportRun` records and continues
   after an individual failed cycle.

The current European Youth Portal Events row has a six-hour interval. Future
sources can use different intervals without changing Docker configuration or
adding scheduler containers. Keep exactly one intended scheduler replica. On
container shutdown, the scheduler finishes its current poll/import and exits
before starting another; Compose allows up to 30 minutes before forcing it.

Its Docker health check runs `python manage.py check_import_health`. The service
becomes unhealthy when any enabled source has no success within its own
`sync_interval` plus `IMPORT_HEALTH_GRACE_SECONDS` (six hours by default).
For the current source, that is a twelve-hour freshness window. Production
monitoring must alert on an unhealthy scheduler or web container.

Run a manual cycle without disturbing the scheduler:

```shell
docker compose --env-file .env.production \
  -f compose.yaml -f compose.prod.yaml run --rm web \
  python manage.py sync_opportunities
```

## Releases

Build a new immutable image tag, update `CIVILEU_IMAGE`, then run `up -d` again.
Compose creates a fresh `migrate` container before replacing or starting the web
and scheduler services. Migrations and source seeding are idempotent.

For more than one web replica, place the containers behind a reverse proxy and
keep a single scheduler replica. Do not run migrations independently in every
web process.

## Database durability

The `postgres-data` volume provides persistence, not backup. MVP databases are
disposable. Encrypted backups, restoration tests, retention, host and storage
failure recovery, monitoring, and production service objectives belong to MVP
V9.

The supported package includes the `db` container. An operator may substitute a
compatible PostgreSQL service without changing application code if it supplies
PostGIS, pgvector, and pg_trgm and permits the migration role to enable them.
That substitution is runtime configuration, not a provider-specific CivilEU
deployment mode.

## Required production values

- Generated `SECRET_KEY`.
- Rotated `OPENCAGE_API_KEY`.
- `OPENAI_API_KEY` and the reviewed task models in
  `OPPORTUNITY_KIND_CLASSIFIER_MODEL` and
  `OPPORTUNITY_DEDUPLICATION_EMBEDDING_MODEL`.
- Long random `POSTGRES_PASSWORD` and matching `CONTAINER_DATABASE_URL`.
- Real API hostname in `ALLOWED_HOSTS`.
- Real API hostname in `HEALTHCHECK_HOST` for internal readiness requests.
- Exact HTTPS frontend/API origins in the CSRF and CORS allowlists.
- `SESSION_COOKIE_SECURE=true` and `SECURE_SSL_REDIRECT=true`.
- Approved database-backed source endpoint and attribution configuration.

Eurodesk Learning reuse is approved and fresh databases seed it enabled with
plain Eurodesk attribution. Because source seeding never overwrites operator
configuration, databases seeded before approval must be enabled and updated
through restricted administration.

## Host-agnostic deployment contract

The supported deployable is the complete Docker/Compose topology in this
repository: database, one-shot migration/seeding, web, and scheduler. A host
needs a compatible Docker engine and Compose implementation, durable volume
storage, and an HTTPS reverse proxy or load balancer. The scheduler remains a
long-running container and migrations remain a one-shot service.

Do not add vendor-specific manifests, scheduled triggers, identity coupling, or
runtime APIs to the application package. Hosting resilience and recovery are
implemented in MVP V9 while preserving these service boundaries.

Never commit `.env`, `.env.production`, database dumps, or Docker volume data.
