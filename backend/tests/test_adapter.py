import json
from pathlib import Path
from types import SimpleNamespace
from urllib.parse import parse_qs

import httpx
import pytest

from ingestion.adapters.eu_youth_events import (
    EUYouthEventsImporter,
    EventHit,
    SearchResponse,
    UpstreamError,
)
from opportunities.models import OpportunityKind, ParticipationMode

FIXTURE = Path(__file__).parent / "fixtures" / "eu_events_page.json"
SOURCE_CONFIGURATION = {
    "api_base_url": "https://youth.europa.eu/api/rest/eyp/v1",
    "search_path": "search_en",
    "portal_base_url": "https://youth.europa.eu",
}


def fixture_payload():
    return json.loads(FIXTURE.read_text())


def importer(client=None, configuration=None):
    source = SimpleNamespace(
        adapter_key="eu_youth_events.v1",
        configuration=configuration or SOURCE_CONFIGURATION,
    )
    return EUYouthEventsImporter(source, client=client, sleep=lambda _seconds: None)


def test_maps_current_multilingual_event_and_sanitizes_html():
    payload = fixture_payload()
    hit = EventHit.model_validate(payload["hits"]["hits"][0])
    candidate = importer().to_candidate(hit)

    assert candidate.external_id == "11111111-1111-4111-8111-111111111111:en"
    assert candidate.kind == OpportunityKind.OTHER
    assert candidate.starts_at.isoformat() == "2026-09-01T12:00:00+00:00"
    assert candidate.participation_mode == ParticipationMode.IN_PERSON
    assert candidate.country_code == "BE"
    assert candidate.city == "Brussels"
    assert "Conference Hall" in candidate.address
    assert len(candidate.raw_payload["_source"]["venues"]) == 2
    assert "<script" not in candidate.description
    assert "alert('x')" not in candidate.description
    assert str(candidate.image_url).endswith("/images/event-400.jpg")


def test_removes_style_contents_from_public_description():
    raw = fixture_payload()["hits"]["hits"][0]
    raw["_source"]["body"] = (
        "a { text-decoration: none; color: red; }\n"
        "tr th, tr td { border: 1px solid grey; }\n"
        "<style>.card { color: red; }</style><p>Visible body</p>"
    )

    candidate = importer().to_candidate(EventHit.model_validate(raw))

    assert candidate.description == "<p>Visible body</p>"


def test_maps_online_fallback_language_without_discarding_it():
    payload = fixture_payload()
    hit = EventHit.model_validate(payload["hits"]["hits"][1])
    candidate = importer().to_candidate(hit)

    assert candidate.language == "pl"
    assert candidate.participation_mode == ParticipationMode.ONLINE
    assert str(candidate.action_url) == "https://example.test/join"


def test_normalizes_greek_country_code_and_hybrid_mode():
    raw = fixture_payload()["hits"]["hits"][0]
    raw["_source"]["uuid"] = "33333333-3333-4333-8333-333333333333"
    raw["_source"]["online"] = True
    raw["_source"]["venues"][0]["country"]["iso"] = "EL"
    candidate = importer().to_candidate(EventHit.model_validate(raw))
    assert candidate.country_code == "GR"
    assert candidate.participation_mode == ParticipationMode.HYBRID


def test_fetches_count_then_one_hard_bounded_page():
    payload = fixture_payload()

    def handler(request: httpx.Request):
        assert request.url.path == "/api/rest/eyp/v1/search_en"
        query = parse_qs(request.url.query.decode())
        size = int(query["size"][0])
        offset = int(query["from"][0])
        response_payload = fixture_payload()
        response_payload["hits"]["hits"] = (
            [] if size == 0 else payload["hits"]["hits"][offset : offset + size]
        )
        return httpx.Response(200, json=response_payload)

    client = httpx.Client(transport=httpx.MockTransport(handler))
    expected, records = importer(client).fetch_records()
    assert expected == 2
    assert len(records) == 2


def test_refuses_source_total_above_safety_cap():
    payload = fixture_payload()
    payload["hits"]["total"]["value"] = 1_001
    payload["hits"]["hits"] = []

    client = httpx.Client(
        transport=httpx.MockTransport(lambda request: httpx.Response(200, json=payload))
    )
    with pytest.raises(UpstreamError, match="safe cap"):
        importer(client).fetch_records()


def test_retries_transient_failure():
    calls = 0

    def handler(request: httpx.Request):
        nonlocal calls
        calls += 1
        if calls == 1:
            return httpx.Response(503, text="temporary")
        payload = fixture_payload()
        payload["hits"]["total"]["value"] = 0
        payload["hits"]["hits"] = []
        return httpx.Response(200, json=payload)

    client = httpx.Client(transport=httpx.MockTransport(handler))
    expected, records = importer(client).fetch_records()
    assert (expected, records) == (0, [])
    assert calls == 2


def test_duplicate_source_uuid_and_language_make_run_incomplete():
    payload = fixture_payload()
    payload["hits"]["hits"][1]["_source"]["uuid"] = payload["hits"]["hits"][0][
        "_source"
    ]["uuid"]
    payload["hits"]["hits"][1]["_source"]["language"] = "en"

    def handler(request: httpx.Request):
        query = parse_qs(request.url.query.decode())
        response_payload = json.loads(json.dumps(payload))
        if int(query["size"][0]) == 0:
            response_payload["hits"]["hits"] = []
        return httpx.Response(200, json=response_payload)

    client = httpx.Client(transport=httpx.MockTransport(handler))
    with pytest.raises(UpstreamError, match="duplicate UUID/language"):
        importer(client).fetch_records()


def test_contract_accepts_unknown_fields():
    SearchResponse.model_validate(fixture_payload())


def test_requires_complete_database_owned_configuration():
    with pytest.raises(ValueError, match="Invalid source configuration"):
        importer(configuration={"api_base_url": "https://example.test"})
