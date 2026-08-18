import json
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace

import httpx
import pytest
from django.contrib.gis.geos import Point
from django.utils import timezone

from ingestion.models import EmbeddingResult, Source
from ingestion.schemas import OpportunityCandidate
from ingestion.services import RunSourceImport
from llm import (
    EmbeddingProvider,
    EmbeddingProviderError,
    EmbeddingResponse,
    EmbeddingUsage,
    OpenAIEmbeddingProvider,
)
from opportunities.deduplication import DuplicateChecker, OpportunityDeduplicationEmbedder
from opportunities.deduplication.matcher import DuplicateCheckerPolicy
from opportunities.deduplication.normalization import normalized_url_hash
from opportunities.models import (
    ActionKind,
    DuplicateDecisionOutcome,
    DuplicateStatus,
    Opportunity,
    OpportunityKind,
    ParticipationMode,
    TemporalPrecision,
)

pytestmark = pytest.mark.django_db(transaction=True)

START = datetime(2026, 9, 1, 10, tzinfo=UTC)


class FakeEmbeddingProvider(EmbeddingProvider):
    key = "fake"

    def __init__(self, vector=(1.0, 0.0, 0.0), *, fail=False):
        self.vector = vector
        self.fail = fail
        self.calls = []

    def embed(self, *, model, inputs):
        self.calls.append((model, inputs))
        if self.fail:
            raise EmbeddingProviderError("temporary outage")
        return EmbeddingResponse(
            embeddings=tuple(self.vector for _input in inputs),
            provider_key=self.key,
            model=model,
            response_id=f"embedding-{len(self.calls)}",
            usage=EmbeddingUsage(input_tokens=len(inputs) * 10),
        )


class FakeAdapter:
    def __init__(self, candidates):
        self.candidates = candidates
        self.records = [SimpleNamespace(identity=item.external_id) for item in candidates]

    def fetch_records(self):
        return len(self.records), self.records

    def external_id(self, record):
        return record.identity

    def to_candidate(self, record):
        return next(item for item in self.candidates if item.external_id == record.identity)


def second_source(key="second_source.v1"):
    return Source.objects.create(
        name="Second source",
        adapter_key=key,
        configuration={},
        sync_interval=timedelta(hours=6),
        attribution_name="Second source",
        attribution_text="Second source",
        attribution_url="https://second.test",
    )


def stored_opportunity(
    source,
    external_id,
    *,
    title="Youth Democracy Workshop",
    source_entity_id=None,
    kind=OpportunityKind.WORKSHOP,
    starts_at=START,
    ends_at=START + timedelta(hours=2),
    deadline=None,
    start_precision=TemporalPrecision.DATETIME,
    deadline_precision=TemporalPrecision.UNKNOWN,
    organizer_name="European Civic Network",
    address="Rue de la Loi 1, Brussels, Belgium",
    city="Brussels",
    country_code="BE",
    location=None,
    action_url=None,
    source_url=None,
):
    action_url = action_url or f"https://actions.test/{external_id}"
    source_url = source_url or f"https://source.test/{external_id}"
    return Opportunity.objects.create(
        source=source,
        external_id=external_id,
        source_entity_id=source_entity_id,
        kind=kind,
        title=title,
        summary="Young people discuss democratic participation.",
        description="<p>A participatory session about local democracy.</p>",
        language="en",
        organizer_name=organizer_name,
        starts_at=starts_at,
        starts_at_precision=(
            start_precision if starts_at is not None else TemporalPrecision.UNKNOWN
        ),
        ends_at=ends_at if starts_at is not None else None,
        application_deadline_at=deadline,
        application_deadline_at_precision=(
            deadline_precision if deadline is not None else TemporalPrecision.UNKNOWN
        ),
        temporal_timezone="Europe/Brussels",
        participation_mode=ParticipationMode.IN_PERSON,
        country_code=country_code,
        city=city,
        address=address,
        location=location,
        action_kind=ActionKind.LEARN_MORE,
        action_url=action_url,
        action_url_hash=normalized_url_hash(action_url),
        source_url=source_url,
        source_url_hash=normalized_url_hash(source_url),
        last_seen_at=timezone.now(),
        raw_payload={"id": external_id},
    )


def attach_embedding(opportunity, vector):
    result = EmbeddingResult.objects.create(
        embedder_key="opportunity_deduplication",
        embedder_version="1",
        input_hash=f"{opportunity.pk:064x}",
        provider_key="fake",
        model_key="fake-model",
        dimensions=len(vector),
        embedding=vector,
    )
    opportunity.deduplication_embedding = result
    opportunity.save(update_fields=("deduplication_embedding", "updated_at"))


def candidate(external_id, *, title="Youth Democracy Workshop", entity_id=None):
    return OpportunityCandidate(
        external_id=external_id,
        source_entity_id=entity_id,
        kind=OpportunityKind.WORKSHOP,
        title=title,
        summary="Young people discuss democratic participation.",
        description="<p>A participatory session about local democracy.</p>",
        language="en",
        starts_at=START,
        starts_at_precision=TemporalPrecision.DATETIME,
        ends_at=START + timedelta(hours=2),
        temporal_timezone="Europe/Brussels",
        participation_mode=ParticipationMode.IN_PERSON,
        country_code="BE",
        city="Brussels",
        address="Rue de la Loi 1, Brussels, Belgium",
        action_kind=ActionKind.LEARN_MORE,
        action_url=f"https://actions.test/{external_id}",
        source_url=f"https://source.test/{external_id}",
        raw_payload={"id": external_id},
    )


def test_openai_embedding_provider_preserves_batch_order_and_usage():
    captured = {}

    def handler(request):
        captured.update(json.loads(request.content))
        return httpx.Response(
            200,
            json={
                "model": "text-embedding-3-small",
                "data": [
                    {"index": 1, "embedding": [0.0, 1.0]},
                    {"index": 0, "embedding": [1.0, 0.0]},
                ],
                "usage": {"prompt_tokens": 12, "total_tokens": 12},
            },
        )

    provider = OpenAIEmbeddingProvider(
        api_key="test-key",
        client=httpx.Client(
            base_url="https://api.openai.test/v1/",
            transport=httpx.MockTransport(handler),
        ),
    )
    response = provider.embed(model="text-embedding-3-small", inputs=["first", "second"])

    assert captured["input"] == ["first", "second"]
    assert response.embeddings == ((1.0, 0.0), (0.0, 1.0))
    assert response.usage.input_tokens == 12


def test_url_hash_ignores_tracking_but_preserves_identity_fragments():
    clean = "https://Events.Example/path/?event=42#english"
    tracked = "https://events.example/path?utm_source=newsletter&event=42#english"
    other_fragment = "https://events.example/path?event=42#french"

    assert normalized_url_hash(clean) == normalized_url_hash(tracked)
    assert normalized_url_hash(clean) != normalized_url_hash(other_fragment)


def test_source_entity_identity_links_localized_records_without_semantics(source):
    root = stored_opportunity(
        source,
        "shared-uuid:en",
        source_entity_id="shared-uuid",
        title="Youth Democracy Workshop",
    )
    translated = stored_opportunity(
        source,
        "shared-uuid:fr",
        source_entity_id="shared-uuid",
        title="Atelier sur la démocratie des jeunes",
    )

    result = DuplicateChecker().check_and_apply(translated)
    translated.refresh_from_db()

    assert result.outcome == DuplicateDecisionOutcome.MATCHED
    assert translated.duplicate_of == root
    assert result.features["source_entity_identity"] is True


def test_occurrence_and_deadline_blocks_are_unioned_across_kind_disagreement(source):
    root = stored_opportunity(source, "event", kind=OpportunityKind.CONFERENCE)
    other_source = second_source()
    deadline_record = stored_opportunity(
        other_source,
        "programme",
        kind=OpportunityKind.PROGRAMME,
        starts_at=None,
        ends_at=None,
        deadline=START,
        deadline_precision=TemporalPrecision.DATE,
    )
    attach_embedding(root, [1.0, 0.0, 0.0])
    attach_embedding(deadline_record, [1.0, 0.0, 0.0])

    result = DuplicateChecker().check_and_apply(deadline_record)

    assert result.outcome == DuplicateDecisionOutcome.MATCHED
    deadline_record.refresh_from_db()
    assert deadline_record.duplicate_of == root
    assert "temporal" in result.features["candidate_blocks"]
    assert result.features["temporal_comparison"] == "cross_anchor_kind"


def test_vector_evidence_promotes_an_ambiguous_pair_to_duplicate(source):
    root = stored_opportunity(
        source,
        "root",
        title="Youth Democracy Workshop",
        organizer_name=None,
    )
    other_source = second_source()
    possible_duplicate = stored_opportunity(
        other_source,
        "possible",
        title="Workshop for Youth Democracy",
        organizer_name=None,
    )
    checker = DuplicateChecker()

    uncertain = checker.check_and_apply(possible_duplicate)
    assert uncertain.outcome == DuplicateDecisionOutcome.UNCERTAIN

    attach_embedding(root, [1.0, 0.0, 0.0])
    attach_embedding(possible_duplicate, [1.0, 0.0, 0.0])
    matched = checker.check_and_apply(possible_duplicate)
    possible_duplicate.refresh_from_db()

    assert matched.outcome == DuplicateDecisionOutcome.MATCHED
    assert possible_duplicate.duplicate_of == root
    assert matched.features["semantic_similarity"] == 1.0


def test_recurring_event_on_a_different_day_is_not_linked(source):
    root = stored_opportunity(source, "september")
    attach_embedding(root, [1.0, 0.0, 0.0])
    other_source = second_source()
    recurrence = stored_opportunity(
        other_source,
        "october",
        starts_at=START + timedelta(days=30),
        ends_at=START + timedelta(days=30, hours=2),
    )
    attach_embedding(recurrence, [1.0, 0.0, 0.0])

    result = DuplicateChecker().check_and_apply(recurrence)
    recurrence.refresh_from_db()

    assert result.outcome == DuplicateDecisionOutcome.DISTINCT
    assert recurrence.duplicate_of is None
    assert result.features["temporal_conflict"] is True


def test_same_day_distinct_session_is_uncertain_and_stays_public(client, source):
    root = stored_opportunity(source, "morning")
    attach_embedding(root, [1.0, 0.0, 0.0])
    other_source = second_source()
    evening = stored_opportunity(
        other_source,
        "evening",
        starts_at=START + timedelta(hours=8),
        ends_at=START + timedelta(hours=10),
    )
    attach_embedding(evening, [1.0, 0.0, 0.0])

    result = DuplicateChecker().check_and_apply(evening)
    evening.refresh_from_db()

    assert result.outcome == DuplicateDecisionOutcome.UNCERTAIN
    assert evening.duplicate_status == DuplicateStatus.UNCERTAIN
    assert evening.duplicate_of is None
    assert client.get("/v1/opportunities").json()["count"] == 2


def test_truncated_candidate_pool_cannot_auto_link_a_scored_match(source):
    root = stored_opportunity(source, "first")
    other_root = stored_opportunity(second_source("third_source.v1"), "second")
    incoming = stored_opportunity(second_source(), "incoming")
    for opportunity in (root, other_root, incoming):
        attach_embedding(opportunity, [1.0, 0.0, 0.0])

    result = DuplicateChecker(
        policy=DuplicateCheckerPolicy(candidate_limit=1)
    ).check_and_apply(incoming)
    incoming.refresh_from_db()

    assert result.outcome == DuplicateDecisionOutcome.UNCERTAIN
    assert result.features["candidate_pool_truncated"] is True
    assert incoming.duplicate_status == DuplicateStatus.UNCERTAIN
    assert incoming.duplicate_of is None


def test_far_apart_in_person_locations_are_a_hard_contradiction(source):
    root = stored_opportunity(
        source,
        "brussels",
        location=Point(4.3517, 50.8503, srid=4326),
    )
    attach_embedding(root, [1.0, 0.0, 0.0])
    other_source = second_source()
    berlin = stored_opportunity(
        other_source,
        "berlin",
        city="Berlin",
        country_code="DE",
        address="Alexanderplatz, Berlin, Germany",
        location=Point(13.405, 52.52, srid=4326),
    )
    attach_embedding(berlin, [1.0, 0.0, 0.0])

    result = DuplicateChecker().check_and_apply(berlin)

    assert result.outcome == DuplicateDecisionOutcome.DISTINCT
    assert result.features["location_conflict"] is True


def test_import_persists_duplicate_record_but_only_one_public_card(source):
    other_source = second_source()
    provider = FakeEmbeddingProvider()
    embedder = OpportunityDeduplicationEmbedder(provider=provider, model="fake-model")

    first = RunSourceImport(
        source,
        adapter=FakeAdapter([candidate("first", entity_id="first-entity")]),
        geocoder=False,
        opportunity_kind_classifier=False,
        deduplication_embedder=embedder,
    ).execute()
    second = RunSourceImport(
        other_source,
        adapter=FakeAdapter([candidate("second", entity_id="second-entity")]),
        geocoder=False,
        opportunity_kind_classifier=False,
        deduplication_embedder=embedder,
    ).execute()

    assert first.run.duplicates_linked == 0
    assert first.run.embeddings_succeeded == 1
    assert second.run.duplicates_linked == 1
    assert second.run.embeddings_cached == 1
    assert len(provider.calls) == 1
    assert Opportunity.objects.count() == 2
    assert Opportunity.objects.filter(duplicate_of__isnull=True).count() == 1
    assert Opportunity.objects.get(external_id="second").duplicate_of_id == (
        Opportunity.objects.get(external_id="first").pk
    )


def test_embedding_outage_keeps_matching_available_without_vector(source):
    provider = FakeEmbeddingProvider(fail=True)
    embedder = OpportunityDeduplicationEmbedder(provider=provider, model="fake-model")

    batch = embedder.embed_candidates([candidate("one"), candidate("two")])

    assert batch.failed == 2
    assert batch.succeeded == 0
    assert all(result.result is None for result in batch.results)
