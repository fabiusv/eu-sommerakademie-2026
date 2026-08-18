# CivilEU MVP status

- **Current release:** MVP V2 (`civileu 0.2.0`)
- **Status:** Implemented and verified locally
- **Last updated:** 2026-08-17

The ordered plan from MVP V3 through the first release candidate lives in the
[roadmap](ROADMAP.md). This file records only what the current package
implements.

## Application package

- Django 6 modular monolith with `accounts`, `opportunities`, `ingestion`, and
  `interactions` applications plus the provider-neutral `llm` package.
- Django Ninja API and OpenAPI schema, PostgreSQL with PostGIS, pgvector, and
  pg_trgm, and Django ORM migrations.
- Local email/password accounts through django-allauth and secure Django
  sessions. This identity mechanism is disposable and remains until MVP V5.
- Environment-based security settings, liveness/readiness endpoints,
  structured logs, exact dependency locks, CI, and an OCI-compatible image.
- Host-agnostic Docker Compose topology with database, one-shot
  migration/seeding, web, and scheduler services. No hosting provider is part
  of the application contract.

## Catalog and user behavior

- Public catalog and detail routes with kind, source, action, text, country,
  city, language, occurrence/deadline, participation-mode, and radius filters.
- Occurrence windows, application-deadline-only opportunities, and records
  without a known window, with explicit ended filtering.
- Nearby geocoded in-person results plus online/hybrid results under radius
  filtering.
- Preference endpoints, idempotent bookmarks, automatic save/unsave events,
  anonymous/authenticated interaction batches, attribution, and RFC 3339
  timestamps.
- Withdrawn opportunities are excluded from public catalog discovery and
  public detail. Existing authenticated bookmarks may retain them so the
  frontend can decide how to present unavailable saved items.
- One flat opportunity-kind taxonomy with no generic `EVENT` value and no
  separate event-format dimension.

## Source-owned ingestion

- Database-owned source endpoints, attribution, enablement, and schedules,
  resolved through versioned code-owned adapter keys.
- Non-overwriting source seeding and one scheduler that respects each enabled
  source's synchronization interval.
- European Youth Portal Events and approved Eurodesk Learning adapters behind
  one generic normalization, classification, and persistence flow.
- Complete-fetch validation, source identity protection, transactional
  idempotent upserts, advisory locking, bounded retry, three-complete-miss
  withdrawal, HTML sanitization, and raw-payload retention.
- Best-effort replaceable OpenCage geocoding; provider failure does not fail a
  complete source import.

## Classification and duplicate detection

- One provider-neutral structured-generation interface with OpenAI as the
  current implementation and caller-selected models.
- Source-independent opportunity-kind classification with deterministic input
  hashes, versioned cache results, audit metadata, confidence fallback to
  `OTHER`, and import counters.
- One type-independent duplicate checker using a bounded union of source
  identity, normalized URL, temporal/deadline, and similar-title candidates.
- Explainable weighted title, semantic, temporal, location, and organizer
  evidence with hard contradiction rules and a deliberately high automatic
  match threshold.
- Content-addressed, batched, versioned pgvector embeddings. Matching remains
  available without semantic evidence.
- Canonical-only public catalog behavior, retained source-owned duplicate rows,
  append-only decisions, and active duplicate promotion after canonical
  withdrawal.

The current matching policy is specified in
[Duplicate detection](DUPLICATE_DETECTION.md). Its source/canonical lifecycle
decisions belong to MVP V3.

## Verification

- Captured, sanitized fixtures cover both sources; deterministic tests make no
  live upstream calls.
- Tests cover APIs, authentication, preferences, bookmarks, interactions,
  canonical validation, imports, scheduling, geocoding, classification,
  embeddings, duplicate decisions, source lifecycle, and deployment contracts.
- A read-only Eurodesk smoke check on 2026-08-15 parsed 108 programmes into 276
  localized candidates without activating or persisting the source. These
  counts are observations, not acceptance criteria.
- Ruff, Django system checks, migration consistency, and the complete
  PostgreSQL/PostGIS/pgvector suite are green: **70 tests pass**.
- A clean production-style Compose smoke test builds both images, initializes a
  fresh database, applies every migration, seeds both sources, starts Gunicorn
  as the unprivileged `civileu` user, and returns readiness successfully.

## Repository notes

- `frontend.html` is a tracked reference artifact outside backend work.
- Real secrets remain only in ignored environment files.
- MVP databases and accounts are disposable. The first RC, after MVP V9,
  starts from a fresh database for every table, including users.
