from __future__ import annotations

import logging
from dataclasses import dataclass

from pydantic import ValidationError

from ingestion.classifiers import (
    OpportunityKindClassificationInput,
    OpportunityKindClassifier,
)
from ingestion.schemas import OpportunityCandidate

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class ImportBatch:
    expected: int
    candidates: list[OpportunityCandidate]
    seen_ids: set[str]
    rejected: int
    classifications_succeeded: int
    classifications_cached: int
    classifications_failed: int


class GenericImporter:
    """Shared source-record orchestration before transactional persistence."""

    def __init__(self, source_adapter, *, opportunity_kind_classifier=None):
        self.source_adapter = source_adapter
        self.opportunity_kind_classifier = (
            OpportunityKindClassifier()
            if opportunity_kind_classifier is None
            else opportunity_kind_classifier
        )

    def fetch_candidates(self) -> ImportBatch:
        expected, records = self.source_adapter.fetch_records()
        candidates: list[OpportunityCandidate] = []
        seen_ids: set[str] = set()
        rejected = 0
        classifications_succeeded = 0
        classifications_cached = 0
        classifications_failed = 0

        for record in records:
            external_id = self.source_adapter.external_id(record)
            if external_id:
                seen_ids.add(external_id)
            try:
                candidate = self.source_adapter.to_candidate(record)
                if self.opportunity_kind_classifier is not False:
                    decision = self.opportunity_kind_classifier.classify(
                        OpportunityKindClassificationInput(
                            title=candidate.title,
                            summary=candidate.summary,
                            description=candidate.description,
                            language=candidate.language,
                        )
                    )
                    candidate = candidate.model_copy(
                        update={
                            "kind": decision.output.kind,
                            "kind_classification_id": (
                                decision.result.pk if decision.result else None
                            ),
                        }
                    )
                    classifications_cached += int(decision.cached)
                    classifications_failed += int(decision.failed)
                    classifications_succeeded += int(not decision.cached and not decision.failed)
                candidates.append(candidate)
            except (ValidationError, ValueError) as exc:
                rejected += 1
                logger.warning(
                    "Rejected source record %s from %s: %s",
                    external_id or "<unknown>",
                    getattr(
                        getattr(self.source_adapter, "source", None),
                        "adapter_key",
                        type(self.source_adapter).__name__,
                    ),
                    exc,
                )

        return ImportBatch(
            expected=expected,
            candidates=candidates,
            seen_ids=seen_ids,
            rejected=rejected,
            classifications_succeeded=classifications_succeeded,
            classifications_cached=classifications_cached,
            classifications_failed=classifications_failed,
        )
