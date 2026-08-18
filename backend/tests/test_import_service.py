from datetime import UTC, datetime
from types import SimpleNamespace

import pytest
from pydantic import ValidationError

from ingestion.classifiers import (
    OpportunityKindClassificationOutput,
    OpportunityKindClassifier,
)
from ingestion.models import ImportRunStatus
from ingestion.schemas import OpportunityCandidate
from ingestion.services import RunSourceImport
from llm import LLMProvider, LLMProviderError, LLMResponse, LLMUsage
from opportunities.models import (
    ActionKind,
    Opportunity,
    OpportunityKind,
    ParticipationMode,
    PublicationStatus,
)

pytestmark = pytest.mark.django_db(transaction=True)


def candidate(
    external_id="imported-1",
    title="Imported event",
    kind=OpportunityKind.OTHER,
):
    return OpportunityCandidate(
        external_id=external_id,
        kind=kind,
        title=title,
        summary="Summary",
        description="<p>Body</p>",
        language="en",
        starts_at=datetime(2026, 9, 1, 10, tzinfo=UTC),
        ends_at=datetime(2026, 9, 1, 12, tzinfo=UTC),
        participation_mode=ParticipationMode.IN_PERSON,
        country_code="BE",
        city="Brussels",
        address="Brussels, Belgium",
        action_kind=ActionKind.LEARN_MORE,
        action_url="https://example.test/action",
        source_url="https://example.test/source",
        raw_payload={"uuid": external_id, "title": title},
    )


class FakeAdapter:
    def __init__(self, candidates=None, error=None):
        self.candidates = candidates or []
        self.error = error
        self.records = [
            SimpleNamespace(source=SimpleNamespace(uuid=item.external_id))
            for item in self.candidates
        ]

    def fetch_records(self):
        if self.error:
            raise self.error
        return len(self.records), self.records

    def to_candidate(self, record):
        return next(item for item in self.candidates if item.external_id == record.source.uuid)

    def external_id(self, record):
        return record.source.uuid


class FakeClassificationProvider(LLMProvider):
    key = "fake"

    def __init__(self, *, fail=False):
        self.calls = 0
        self.fail = fail

    def generate_structured(
        self,
        *,
        model,
        system_prompt,
        user_prompt,
        output_model,
        schema_name,
    ):
        self.calls += 1
        if self.fail:
            raise LLMProviderError("temporary classification outage")
        return LLMResponse(
            output=OpportunityKindClassificationOutput(
                kind=OpportunityKind.DEBATE,
                confidence=0.96,
                reason_codes=["explicit_debate"],
            ),
            provider_key=self.key,
            model=model,
            response_id=f"fake-{self.calls}",
            usage=LLMUsage(input_tokens=10, output_tokens=4),
        )


def execute(source, adapter):
    return (
        RunSourceImport(
            source,
            adapter=adapter,
            geocoder=False,
            opportunity_kind_classifier=False,
        )
        .execute()
        .run
    )


def test_generic_candidate_may_use_a_deadline_without_occurrence_times():
    values = candidate(kind=OpportunityKind.PROGRAMME).model_dump()
    values.update(
        starts_at=None,
        ends_at=None,
        application_deadline_at=datetime(2026, 10, 1, tzinfo=UTC),
    )

    result = OpportunityCandidate.model_validate(values)

    assert result.starts_at is None
    assert result.application_deadline_at == datetime(2026, 10, 1, tzinfo=UTC)


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("city", "x" * 256),
        ("organizer_name", "x" * 256),
        ("action_url", f"https://example.test/{'x' * 1_000}"),
    ],
)
def test_generic_candidate_rejects_values_wider_than_catalog_storage(field, value):
    values = candidate().model_dump()
    values[field] = value

    with pytest.raises(ValidationError):
        OpportunityCandidate.model_validate(values)


def test_import_is_idempotent_and_updates_without_duplication(source):
    run = execute(source, FakeAdapter([candidate()]))
    assert run.opportunities_created == 1

    run = execute(source, FakeAdapter([candidate()]))
    assert run.records_unchanged == 1
    assert Opportunity.objects.count() == 1

    run = execute(source, FakeAdapter([candidate(title="Changed title")]))
    assert run.opportunities_updated == 1
    assert Opportunity.objects.get().title == "Changed title"


def test_generic_importer_classifies_opportunities_and_reuses_cached_result(source):
    provider = FakeClassificationProvider()
    classifier = OpportunityKindClassifier(
        provider=provider,
        model="caller-selected-model",
    )
    service_options = {
        "adapter": FakeAdapter([candidate()]),
        "geocoder": False,
        "opportunity_kind_classifier": classifier,
    }

    first = RunSourceImport(source, **service_options).execute().run
    opportunity = Opportunity.objects.get()

    assert opportunity.kind == OpportunityKind.DEBATE
    assert opportunity.kind_classification is not None
    assert opportunity.kind_classification.model_key == "caller-selected-model"
    assert first.classifications_succeeded == 1
    assert first.classifications_cached == 0
    assert first.classifications_failed == 0

    second = RunSourceImport(source, **service_options).execute().run

    assert provider.calls == 1
    assert second.classifications_succeeded == 0
    assert second.classifications_cached == 1


def test_classification_failure_keeps_import_successful_with_fallback(source):
    classifier = OpportunityKindClassifier(
        provider=FakeClassificationProvider(fail=True),
        model="caller-selected-model",
    )

    run = (
        RunSourceImport(
            source,
            adapter=FakeAdapter([candidate()]),
            geocoder=False,
            opportunity_kind_classifier=classifier,
        )
        .execute()
        .run
    )

    opportunity = Opportunity.objects.get()
    assert run.status == ImportRunStatus.SUCCEEDED
    assert run.classifications_failed == 1
    assert opportunity.kind == OpportunityKind.OTHER
    assert opportunity.kind_classification is None


def test_failed_fetch_does_not_increment_missing_counter(source, opportunity):
    with pytest.raises(RuntimeError, match="upstream unavailable"):
        execute(source, FakeAdapter(error=RuntimeError("upstream unavailable")))
    opportunity.refresh_from_db()
    assert opportunity.consecutive_missing_syncs == 0
    assert source.import_runs.latest("started_at").status == ImportRunStatus.FAILED


def test_withdraws_only_after_three_complete_misses(source, opportunity):
    for expected_missing in (1, 2):
        execute(source, FakeAdapter())
        opportunity.refresh_from_db()
        assert opportunity.consecutive_missing_syncs == expected_missing
        assert opportunity.status == PublicationStatus.PUBLISHED
    execute(source, FakeAdapter())
    opportunity.refresh_from_db()
    assert opportunity.consecutive_missing_syncs == 3
    assert opportunity.status == PublicationStatus.WITHDRAWN


def test_overlapping_import_is_skipped(source, monkeypatch):
    service = RunSourceImport(source, adapter=FakeAdapter(), geocoder=False)
    monkeypatch.setattr(service, "_acquire_lock", lambda: False)
    outcome = service.execute()
    assert outcome.skipped is True
    assert outcome.run.status == ImportRunStatus.SKIPPED


def test_rejected_seen_record_is_not_marked_missing(source, opportunity):
    class RejectingAdapter(FakeAdapter):
        def __init__(self):
            self.records = [SimpleNamespace(source=SimpleNamespace(uuid=opportunity.external_id))]
            self.candidates = []
            self.error = None

        def to_candidate(self, record):
            raise ValueError("invalid changed payload")

        def external_id(self, record):
            return record.source.uuid

    run = execute(source, RejectingAdapter())
    opportunity.refresh_from_db()
    assert run.records_rejected == 1
    assert opportunity.consecutive_missing_syncs == 0
