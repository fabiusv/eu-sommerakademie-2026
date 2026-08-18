# ADR 0001: Host-agnostic container delivery

- **Status:** Accepted
- **Date:** 2026-08-17

## Decision

CivilEU is delivered as a provider-neutral package of cooperating Docker
containers, composed from the same application image plus the required
PostgreSQL/PostGIS/pgvector database image. Runtime domains, ports, secrets,
origins, volumes, and image tags are configuration.

The repository will not contain a preferred hosting-vendor mapping or replace
the scheduler with a vendor-specific trigger. A compatible Docker/Compose host,
persistent storage, and an HTTPS reverse proxy are deployment concerns outside
the application boundary.

## Consequences

- Development and production use the same service boundaries: database,
  one-shot migration/seeding, web, and scheduler.
- Application behavior must not depend on a hosting provider's API, filesystem,
  scheduler, identity, or environment conventions.
- Hosting resilience is implemented in MVP V9 without making one provider part
  of the product architecture.
