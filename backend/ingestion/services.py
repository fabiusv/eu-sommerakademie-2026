from __future__ import annotations

import logging
from dataclasses import dataclass

from django.db import connection, transaction
from django.db.models import Count, F
from django.utils import timezone

from ingestion.adapters import get_adapter
from ingestion.geocoding import configured_geocoder, enrich_opportunity
from ingestion.importer import GenericImporter
from ingestion.models import ImportRun, ImportRunStatus, Source
from opportunities.deduplication import DuplicateChecker, OpportunityDeduplicationEmbedder
from opportunities.deduplication.normalization import normalized_url_hash
from opportunities.models import (
    DuplicateDecision,
    DuplicateDecisionOutcome,
    DuplicateStatus,
    GeocodingStatus,
    Opportunity,
    PublicationStatus,
)

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class ImportOutcome:
    run: ImportRun
    skipped: bool = False


class RunSourceImport:
    def __init__(
        self,
        source: Source,
        *,
        adapter=None,
        geocoder=None,
        opportunity_kind_classifier=None,
        duplicate_checker=None,
        deduplication_embedder=None,
    ):
        self.source = source
        self.adapter = adapter
        self.geocoder = geocoder if geocoder is not None else configured_geocoder()
        self.opportunity_kind_classifier = opportunity_kind_classifier
        self.duplicate_checker = (
            DuplicateChecker() if duplicate_checker is None else duplicate_checker
        )
        self.deduplication_embedder = (
            OpportunityDeduplicationEmbedder()
            if deduplication_embedder is None and self.duplicate_checker is not False
            else deduplication_embedder
        )
        self.lock_key = f"civileu:source:{source.pk}"

    def execute(self) -> ImportOutcome:
        run = ImportRun.objects.create(
            source=self.source,
            status=ImportRunStatus.RUNNING,
            started_at=timezone.now(),
        )
        if not self._acquire_lock():
            run.status = ImportRunStatus.SKIPPED
            run.finished_at = timezone.now()
            run.error_summary = "Another import is already running for this source"
            run.save(update_fields=("status", "finished_at", "error_summary"))
            return ImportOutcome(run=run, skipped=True)

        try:
            if self.adapter is None:
                adapter_class = get_adapter(self.source.adapter_key)
                self.adapter = adapter_class(self.source)
            importer = GenericImporter(
                self.adapter,
                opportunity_kind_classifier=self.opportunity_kind_classifier,
            )
            batch = importer.fetch_candidates()
            run.records_received = batch.expected
            embedding_batch = None
            if self.deduplication_embedder is not False:
                embedding_batch = self.deduplication_embedder.embed_candidates(batch.candidates)
                run.embeddings_succeeded = embedding_batch.succeeded
                run.embeddings_cached = embedding_batch.cached
                run.embeddings_failed = embedding_batch.failed
            counters, opportunity_ids = self._apply(
                batch.candidates,
                batch.seen_ids,
                embeddings=(
                    {
                        candidate.external_id: embedded
                        for candidate, embedded in zip(
                            batch.candidates,
                            embedding_batch.results,
                            strict=True,
                        )
                    }
                    if embedding_batch
                    else {}
                ),
            )
            run.opportunities_created = counters["created"]
            run.opportunities_updated = counters["updated"]
            run.records_unchanged = counters["unchanged"]
            run.records_rejected = batch.rejected
            run.records_missing = counters["missing"]
            run.classifications_succeeded = batch.classifications_succeeded
            run.classifications_cached = batch.classifications_cached
            run.classifications_failed = batch.classifications_failed

            if self.geocoder:
                for opportunity in Opportunity.objects.filter(pk__in=opportunity_ids):
                    status = enrich_opportunity(opportunity, self.geocoder)
                    if status == GeocodingStatus.SUCCEEDED:
                        run.geocoding_succeeded += 1
                    elif status == GeocodingStatus.NO_MATCH:
                        run.geocoding_no_match += 1
                    elif status == GeocodingStatus.RETRYABLE_FAILURE:
                        run.geocoding_failed += 1
                    if status is not None and self.duplicate_checker is not False:
                        self.duplicate_checker.check_and_apply(opportunity)

            if self.duplicate_checker is not False:
                duplicate_counts = dict(
                    Opportunity.objects.filter(pk__in=opportunity_ids)
                    .values_list("duplicate_status")
                    .annotate(total=Count("pk"))
                )
                run.duplicates_linked = duplicate_counts.get(DuplicateStatus.DUPLICATE, 0)
                run.duplicates_uncertain = duplicate_counts.get(DuplicateStatus.UNCERTAIN, 0)

            run.status = ImportRunStatus.SUCCEEDED
            run.finished_at = timezone.now()
            run.save()
            return ImportOutcome(run=run)
        except Exception as exc:
            run.status = ImportRunStatus.FAILED
            run.finished_at = timezone.now()
            run.error_summary = str(exc)[:4000]
            run.save()
            logger.exception("Import failed for source %s", self.source.adapter_key)
            raise
        finally:
            self._release_lock()

    @transaction.atomic
    def _apply(self, candidates, seen_ids: set[str], *, embeddings):
        now = timezone.now()
        existing = {
            opportunity.external_id: opportunity
            for opportunity in Opportunity.objects.select_for_update().filter(source=self.source)
        }
        counters = {"created": 0, "updated": 0, "unchanged": 0, "missing": 0}
        touched_ids: list[int] = []
        canonical_fields = (
            "source_entity_id",
            "kind",
            "kind_classification_id",
            "title",
            "summary",
            "description",
            "language",
            "organizer_name",
            "starts_at",
            "starts_at_precision",
            "ends_at",
            "application_deadline_at",
            "application_deadline_at_precision",
            "temporal_timezone",
            "participation_mode",
            "country_code",
            "city",
            "address",
            "action_kind",
            "action_url",
            "source_url",
            "source_url_hash",
            "action_url_hash",
            "image_url",
            "source_updated_at",
            "raw_payload",
            "deduplication_embedding_id",
        )
        for candidate in candidates:
            values = candidate.model_dump(mode="python")
            values["action_url"] = str(values["action_url"])
            values["source_url"] = str(values["source_url"])
            values["image_url"] = str(values["image_url"]) if values["image_url"] else None
            external_id = values.pop("external_id")
            values["source_url_hash"] = normalized_url_hash(values["source_url"])
            values["action_url_hash"] = normalized_url_hash(values["action_url"])
            embedded = embeddings.get(external_id)
            values["deduplication_embedding_id"] = (
                embedded.result.pk if embedded and embedded.result else None
            )
            opportunity = existing.get(external_id)
            if opportunity is None:
                opportunity = Opportunity.objects.create(
                    source=self.source,
                    external_id=external_id,
                    last_seen_at=now,
                    **values,
                )
                counters["created"] += 1
                needs_duplicate_check = True
            else:
                changed = any(
                    getattr(opportunity, field) != values[field] for field in canonical_fields
                )
                for field in canonical_fields:
                    setattr(opportunity, field, values[field])
                opportunity.last_seen_at = now
                opportunity.consecutive_missing_syncs = 0
                opportunity.status = PublicationStatus.PUBLISHED
                opportunity.save(
                    update_fields=canonical_fields
                    + (
                        "last_seen_at",
                        "consecutive_missing_syncs",
                        "status",
                        "updated_at",
                    )
                )
                counters["updated" if changed else "unchanged"] += 1
                needs_duplicate_check = changed or not opportunity.duplicate_checked_at
            touched_ids.append(opportunity.pk)
            if needs_duplicate_check and self.duplicate_checker is not False:
                self.duplicate_checker.check_and_apply(opportunity)

        Opportunity.objects.filter(source=self.source, external_id__in=seen_ids).update(
            last_seen_at=now, consecutive_missing_syncs=0
        )
        missing = Opportunity.objects.filter(source=self.source).exclude(external_id__in=seen_ids)
        counters["missing"] = missing.count()
        missing.update(consecutive_missing_syncs=F("consecutive_missing_syncs") + 1)
        Opportunity.objects.filter(source=self.source, consecutive_missing_syncs__gte=3).update(
            status=PublicationStatus.WITHDRAWN
        )
        self._promote_active_duplicates()
        self.source.last_success_at = now
        self.source.save(update_fields=("last_success_at", "updated_at"))
        return counters, touched_ids

    def _promote_active_duplicates(self) -> None:
        withdrawn_roots = Opportunity.objects.filter(
            source=self.source,
            status=PublicationStatus.WITHDRAWN,
            duplicate_of__isnull=True,
        ).prefetch_related("duplicate_records")
        for root in withdrawn_roots:
            replacement = (
                root.duplicate_records.filter(status=PublicationStatus.PUBLISHED)
                .order_by("pk")
                .first()
            )
            if replacement is None:
                continue
            root.duplicate_records.exclude(pk=replacement.pk).update(duplicate_of=replacement)
            replacement.duplicate_of = None
            replacement.duplicate_status = DuplicateStatus.UNIQUE
            replacement.save(update_fields=("duplicate_of", "duplicate_status", "updated_at"))
            root.duplicate_of = replacement
            root.duplicate_status = DuplicateStatus.DUPLICATE
            root.duplicate_checked_at = timezone.now()
            root.save(
                update_fields=(
                    "duplicate_of",
                    "duplicate_status",
                    "duplicate_checked_at",
                    "updated_at",
                )
            )
            DuplicateDecision.objects.create(
                opportunity=root,
                matched_opportunity=replacement,
                algorithm_version=self.duplicate_checker.policy.algorithm_version,
                outcome=DuplicateDecisionOutcome.MATCHED,
                evidence_coverage=1,
                features={"reason": "active_duplicate_promoted_after_canonical_withdrawal"},
            )

    def _acquire_lock(self) -> bool:
        with connection.cursor() as cursor:
            cursor.execute("SELECT pg_try_advisory_lock(hashtext(%s))", [self.lock_key])
            return bool(cursor.fetchone()[0])

    def _release_lock(self) -> None:
        with connection.cursor() as cursor:
            cursor.execute("SELECT pg_advisory_unlock(hashtext(%s))", [self.lock_key])
