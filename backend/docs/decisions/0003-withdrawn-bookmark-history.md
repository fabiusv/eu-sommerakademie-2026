# ADR 0003: Withdrawn opportunities in bookmark history

- **Status:** Accepted
- **Date:** 2026-08-17

## Decision

Withdrawn opportunities remain excluded from the public catalog and public
detail endpoint. If a user bookmarked an opportunity before it was withdrawn,
the authenticated bookmarks response may continue to include it.

The frontend decides whether to hide it, display it as unavailable, or prompt
the user to remove it. The backend continues to permit bookmark removal.

## Consequences

- “Not public” means absent from catalog discovery and direct public detail, not
  erased from an authenticated user's saved history.
- Opportunity responses expose publication `status`, allowing the frontend to
  make that presentation decision for bookmark history.
- Source withdrawal does not silently delete user bookmarks.
