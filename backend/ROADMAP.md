# CivilEU roadmap to the first release candidate

- **Status:** Accepted sequence; later-stage scope is defined at stage entry
- **Last updated:** 2026-08-17

## Delivery principles

- The deployable product remains a host-agnostic package of cooperating Docker
  containers. No hosting vendor is part of the application architecture.
- Every MVP stage begins with a short decision gate. Models, providers,
  operational thresholds, and acceptance measures owned by that stage are
  selected then, using the evidence available at that time.
- A stage is complete only when its implementation, deterministic tests,
  operational path, and documentation agree.
- The first release candidate follows MVP V9. It is not another feature stage.
- The first RC starts from a fresh database for every table, including users.
  MVP data and credentials are not migrated into it.

## Release sequence

### MVP V2 — ingestion and duplicate-detection foundation

**Status:** Complete

The implemented package provides the modular Django backend, two source
adapters, canonical candidate validation, source-independent kind
classification, duplicate detection, geocoding, catalog APIs, local accounts,
preferences, bookmarks, interactions, and the Docker Compose service topology.
See the [MVP status](MVP_STATUS.md) for the verified implementation inventory.

### MVP V3 — generic importing, new sources, and coherent inputs

**Status:** Next stage

V3 evolves the V2 generic-import foundation into a two-stage path for
implementing, validating, and operating additional approved sources. A parsing
stage turns source formats such as websites, APIs, RSS, ICS, and email into a
readable, provenance-preserving source document. A separate LLM-assisted
normalization stage maps that document into CivilEU's strict canonical input
contract. V3 owns these importer boundaries and contracts, source provenance,
canonical input rules, source-record representation, field-level merging,
multi-source attribution, duplicate-row lifecycle, retention, review ownership,
and duplicate-policy calibration against real multilingual source data. Target
group is an opportunity property in the canonical contract; it is not merely a
recommendation-specific label.

At the V3 entry gate, use the observed V2 catalog and source behavior to
select the additional sources, confirm their reuse and attribution requirements,
and choose the parser/normalizer contracts, source/canonical data model,
translation policy, permitted date inference, confidence and review rules, and
measurable quality thresholds. This includes defining how explicit and inferred
target-group values are represented, validated, and traced to their sources.
Also decide whether the measured import workload justifies a task broker.

### MVP V4 — recommendations

**Status:** Scope boundary accepted; detailed decisions deferred to V4 entry

V4 implements recommendation as one coherent feature: multi-label
topic/interest tagging, recommendation-specific opportunity and user
representations, candidate filtering, ranking, reason codes, and versioned feed
context. Deduplication embeddings remain a separate ingestion concern.

At the V4 entry gate, decide the interest vocabulary, multilingual evaluation
set, embedding model, ranking/evaluation criteria, cold-start behavior, and
whether recommendation workloads require additional task infrastructure. These
choices are not fixed prematurely by the current architecture.

### MVP V5 — OpenID Connect authentication

**Status:** Scope boundary accepted; detailed decisions deferred to V5 entry

V5 replaces disposable local password authentication with OIDC while keeping
CivilEU domain code dependent on local user IDs and Django sessions rather than
provider identifiers.

At the V5 entry gate, select the provider and custom authentication domain and
define issuer/subject mapping, passkeys, MFA, recovery, account linking,
session behavior, and browser/native-client requirements.

### MVP V6–V8 — to be defined

These stages are intentionally unassigned. Their scope will be decided at each
stage's entry gate from product evidence and the state of V3–V5. Placeholder
features and speculative data models must not be added merely to fill them.

### MVP V9 — operational hardening and hosting resilience

**Status:** Scope boundary accepted; detailed decisions deferred to V9 entry

V9 makes the host-agnostic container package production-resilient. It owns
encrypted backups and restoration testing, persistent-volume and host failure
recovery, privacy and retention operations, ingress rate limiting,
monitoring/alerting, capacity checks, service objectives, and documented
operator recovery procedures.

At the V9 entry gate, define the concrete RPO/RTO, retention periods, alert
ownership, rate limits, service objectives, and failure scenarios. The
implementation must remain provider-neutral.

### First release candidate

The first RC is cut only after MVP V9 is accepted. Its release process creates
a fresh database, runs all migrations and source seeding once, and creates new
users through the V5 identity path. No MVP database, account, password, session,
or behavioral history is carried forward.

RC acceptance covers a clean container deployment, restoration and rollback,
source synchronization, recommendation behavior, authentication, catalog and
bookmark contracts, privacy operations, monitoring, and the full automated and
end-to-end verification suite.

## Canonical supporting documents

- [Architecture](ARCHITECTURE.md) — accepted technical boundaries and
  current/future design constraints.
- [MVP status](MVP_STATUS.md) — concise inventory of the currently implemented
  release.
- [Deployment runbook](deployment/README.md) — provider-neutral Docker/Compose
  operating contract.
- [Duplicate detection](DUPLICATE_DETECTION.md) — current V2 matching policy and
  V3 decision inputs.
- [Decision records](docs/decisions/README.md) — accepted cross-stage decisions
  and their consequences.
