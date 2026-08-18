# ADR 0002: Release sequence and fresh RC data

- **Status:** Accepted
- **Date:** 2026-08-17

## Decision

The first release candidate follows MVP V9. MVP V3 through MVP V9 are completed
before the RC is cut.

The first RC starts with a fresh database for all tables, including users. MVP
catalog data, source rows, accounts, credentials, sessions, preferences,
bookmarks, interactions, classifier results, embeddings, and audit records are
not migrated into the RC database.

## Consequences

- MVP migrations support development of the staged product, not preservation of
  disposable MVP data into the RC.
- The RC process must prove clean migration, source seeding, initial imports,
  and user creation against an empty database.
- Any production data model required by V3–V9 can be designed without a legacy
  MVP data-migration constraint.
