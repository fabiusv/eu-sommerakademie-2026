# Opportunity duplicate detection

**Status:** Implemented for MVP V2
**Algorithm version:** `opportunity_duplicate.v1`
**Last updated:** 2026-08-17

## Purpose and product behavior

CivilEU imports the same real-world opportunity from sources that may disagree
on its title, description, language, precision, location, or opportunity kind.
The duplicate checker therefore combines deterministic evidence, field-level
similarity, and semantic similarity. It deliberately uses one policy for every
opportunity kind: `kind` is neither a candidate filter nor a scoring feature.

The current outcomes are:

| Outcome | Stored state | Public behavior |
| --- | --- | --- |
| `MATCHED` | The source-owned row points to an earlier canonical row through `duplicate_of` | Only the canonical row is returned |
| `UNCERTAIN` | The row remains a root with `duplicate_status=UNCERTAIN` | The row is published normally |
| `DISTINCT` | The row remains a root with `duplicate_status=UNIQUE` | The row is published normally |

There is no human review queue in MVP V2. The automatic-match bar is
intentionally high so that uncertain cases should be exceptional and false
merges are less likely than visible duplicates. Every decision and its feature
values are retained in `DuplicateDecision` for diagnosis and later threshold
calibration.

Duplicate source rows are retained for now. This preserves source identity,
withdrawal tracking, auditability, and a fallback when the canonical source is
withdrawn. Their longer-term source/canonical representation is an MVP V3 entry
decision listed below.

## Processing flow

For each new or materially changed source record, the shared importer:

1. Normalizes and validates the source-specific record into an
   `OpportunityCandidate`.
2. Creates or reuses a content-addressed embedding for title, summary, and
   sanitized description.
3. Upserts the source-owned `Opportunity` row and its normalized URL hashes.
4. Builds a bounded candidate pool from indexed, inexpensive database blocks.
5. Scores the candidate roots, applies contradiction rules, and records the
   decision.
6. Rechecks after successful geocoding so coordinates can improve the decision.

A database transaction-level advisory lock serializes duplicate decisions
across sources. This prevents two concurrent imports from independently
publishing both sides of the same new duplicate pair. Existing per-source locks
continue to protect source synchronization itself.

## Candidate generation

Candidate blocks are combined as a **union**, not an intersection. A record can
enter the pool through any available block, so missing or differently modelled
fields do not prevent comparison.

| Block | Query | Reason |
| --- | --- | --- |
| Source entity | Same source and `source_entity_id` | Joins localized editions or variants that share a source entity |
| URL | Same normalized source or action URL hash | Catches shared landing pages while removing common tracking parameters |
| Time | Occurrence window or application deadline within a one-day tolerance | Treats occurrence and deadline anchors as one expanded pool and supports date-only versus exact times |
| Title | PostgreSQL trigram similarity of at least `0.45` | Recovers candidates when identifiers, URLs, and times differ or are absent |

The temporal block compares each incoming occurrence or deadline window with
both stored occurrence windows and stored deadlines. The results are unioned.
This is the key type-independent behavior: a programme with only a deadline can
still be compared with an event-like record, while monthly or yearly
occurrences outside the one-day window are not pulled in by time alone.

Only published canonical roots are candidates. Each block contributes at most
250 rows. Exact scoring therefore remains bounded as the catalog grows; if any
block is truncated, the checker refuses an otherwise non-deterministic automatic
match and records an uncertain outcome. The database supports the blocks with
B-tree indexes, a title trigram GiST index, and the existing PostGIS index.

## Scoring and safeguards

Available evidence is combined with these weights:

| Feature | Weight | Main behavior |
| --- | ---: | --- |
| Normalized title | 0.28 | Token and sequence similarity after Unicode/case/punctuation normalization |
| Semantic content | 0.24 | Cosine similarity of compatible stored embeddings |
| Time | 0.23 | Occurrence/deadline comparison respecting date-only precision and timezone |
| Location | 0.15 | Coordinate distance, then normalized address or same-city fallback |
| Organizer | 0.10 | Normalized text similarity |

The score is divided by the weight of available evidence, and that available
weight is stored separately as `evidence_coverage`. Missing data is neutral; it
does not count as either agreement or disagreement.

An ordinary automatic match requires all of the following:

- Score at least `0.88` and evidence coverage at least `0.65`.
- Strong title (`>= 0.86`) or semantic (`>= 0.90`) evidence.
- Corroboration from URL, location (`>= 0.80`), organizer (`>= 0.85`), or
  exceptionally strong title and semantic agreement together.
- Compatible temporal evidence when comparable times are available.
- No hard contradiction.

Two conservative identity shortcuts exist. A shared source entity is
deterministic unless contradicted. A shared normalized URL can match only with
title similarity of at least `0.80`, compatible time, and another usable
temporal, location, or organizer signal. A score of at least `0.72` that does
not satisfy the automatic rules is uncertain and remains public.

Hard contradictions veto an automatic match:

- Comparable occurrence-to-occurrence or deadline-to-deadline dates outside
  the tolerated range.
- Different countries for two opportunities that are not online.
- In-person locations more than 50 km apart when their cities also differ.
- Disjoint explicit years in both titles, such as `Forum 2025` and
  `Forum 2026`.

Cross-kind temporal comparisons, such as one source providing an occurrence
and another only a deadline, can add reduced positive evidence when close.
Their distance is not treated as a contradiction because those fields may
describe different parts of the same opportunity.

Coordinate scoring is `1.0` within 250 m, `0.90` within 1 km, `0.65` within
5 km, and `0.25` within 25 km. Date-only values match anywhere on the same
local calendar day and retain reduced evidence one day apart. Exact times use
15-minute, two-hour, six-hour, same-day, and adjacent-day bands.

## Embeddings

`OpportunityDeduplicationEmbedder` depends on the provider-neutral
`EmbeddingProvider` interface. The OpenAI implementation uses
`OPPORTUNITY_DEDUPLICATION_EMBEDDING_MODEL`, which defaults to
`text-embedding-3-small`, and sends batches of at most 64 documents.

The deterministic document contains the title, up to 1,500 characters of plain
summary, and up to 6,000 characters of plain description. Results are cached by
embedder key/version, provider, model, and SHA-256 input hash in
`EmbeddingResult`; identical content reuses one pgvector value.

Vector comparison is exact cosine similarity in application code over the
bounded candidate pool. There is intentionally no approximate vector index:
pgvector stores and validates versioned vectors, while deterministic database
blocks keep the number of comparisons small. Vectors from different providers,
models, or dimensions are never compared.

Missing credentials or an embedding-provider failure leaves semantic evidence
unavailable. It does not fail or delay the source import, and the deterministic
features can still reach a decision. Import runs report new, cached, and failed
embeddings separately.

## Persistence and lifecycle

The oldest suitable public root becomes canonical; duplicates link directly to
that root. Public catalog and detail queries return only rows with
`duplicate_of IS NULL`. Creating a bookmark for a linked duplicate is
canonicalized to the root as well.

The source-owned rows remain independently updated and withdrawn. If a
canonical root is withdrawn but one of its linked rows is still published, the
oldest active duplicate is promoted and the remaining links are repointed.
This avoids removing a real opportunity merely because its first source stops
listing it.

The denormalized decision state on `Opportunity` includes status, algorithm
version, normalized-input hash, and check time. `DuplicateDecision` is the
append-only explanation trail, including the selected candidate, block names,
individual similarities, contradictions, score, coverage, and truncation
state. Increment `DuplicateCheckerPolicy.algorithm_version` whenever a policy
change should make stored decisions stale.

## Operations

New and changed records are checked automatically during imports. To process
unchecked records or records evaluated by an older algorithm version:

```shell
python manage.py recheck_opportunity_duplicates
```

Use `--all` to reevaluate every published source record and `--limit N` for a
bounded operational batch. The command also refreshes normalized URL hashes
and embedding links, and reports linked, uncertain, distinct, new/cached
embedding, and unavailable-embedding counts.

The database must provide PostgreSQL 17 with `postgis`, `vector`, and `pg_trgm`.
The repository's database image installs pgvector; migrations enable all three
extensions. A managed database must make the extensions available and allow
the migration role to create them before deployment.

## MVP V3 entry decisions

The following work belongs to the broader MVP V3 scope, which evolves the
generic source importer, adds approved sources, and establishes coherent inputs:

1. Build a labelled multilingual evaluation set from real cross-source data,
   measure false-merge and uncertain rates, and calibrate weights/thresholds.
   Automatic matching should continue to optimize for precision.
2. Add a review workflow only if operational ownership and observed volume make
   it viable. Until then, uncertain opportunities remain public.
3. Decide whether duplicate source rows remain in `Opportunity`, move to a
   separate `SourceRecord`/canonical-opportunity model, or are compacted after a
   retention period. This addresses table growth without losing provenance or
   withdrawal recovery.
4. Define field-level merge and source-attribution policy. MVP V2 selects one
   source row as the public representation; it does not synthesize the best
   title, description, image, time, or location across sources.
5. Evaluate the embedding model against the catalog's actual languages and
   replace or version it if multilingual recall is insufficient.

These decisions do not require opportunity-type-specific matching. Recurrence
and future occurrence modelling can add better temporal evidence to the same
candidate and scoring interfaces.
