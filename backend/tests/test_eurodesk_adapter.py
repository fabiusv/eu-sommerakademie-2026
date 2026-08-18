import json
from pathlib import Path
from types import SimpleNamespace

import httpx
import pytest
from bs4 import BeautifulSoup

from ingestion.adapters.eurodesk_learning import (
    EurodeskLearningImporter,
    EurodeskUpstreamError,
    parse_programme,
)
from opportunities.models import ActionKind, OpportunityKind

FIXTURE = Path(__file__).parent / "fixtures" / "eurodesk_learning_search.json"
SOURCE_CONFIGURATION = {
    "page_url": "https://programmes.eurodesk.eu/learning",
    "search_url": "https://programmes.eurodesk.eu/search",
    "subcategories": [
        "scholarships",
        "youth exchanges",
        "training courses",
        "travel grants",
    ],
}


def fixture_payload():
    return json.loads(FIXTURE.read_text())


def importer(client=None, configuration=None):
    source = SimpleNamespace(
        adapter_key="eurodesk_learning.v1",
        configuration=configuration or SOURCE_CONFIGURATION,
    )
    return EurodeskLearningImporter(source, client=client, sleep=lambda _seconds: None)


def test_fetches_learning_filters_and_all_translations():
    calls = []

    def handler(request: httpx.Request):
        calls.append(request)
        if request.url.path == "/learning":
            return httpx.Response(200, text="<html>Learning</html>")
        assert request.url.path == "/search"
        assert request.headers["X-Requested-With"] == "XMLHttpRequest"
        params = request.url.params
        assert params["subcategories[scholarships]"] == "scholarships"
        assert params["subcategories[training courses]"] == "training courses"
        return httpx.Response(200, json=fixture_payload())

    client = httpx.Client(transport=httpx.MockTransport(handler))
    expected, records = importer(client).fetch_records()

    assert expected == 3
    assert len(records) == 3
    assert {record.programme_id for record in records} == {"20791", "20800"}
    assert len(calls) == 2


def test_maps_learning_programme_with_deadline_and_sanitized_html():
    payload = fixture_payload()
    client = httpx.Client(
        transport=httpx.MockTransport(
            lambda request: (
                httpx.Response(200, text="Learning")
                if request.url.path == "/learning"
                else httpx.Response(200, json=payload)
            )
        )
    )
    _expected, records = importer(client).fetch_records()
    programme = next(item for item in records if item.external_id == "20791-eu")
    candidate = importer().to_candidate(programme)

    assert candidate.external_id == "20791-eu"
    assert candidate.kind == OpportunityKind.OTHER
    assert candidate.language == "en"
    assert candidate.starts_at is None
    assert candidate.ends_at is None
    assert candidate.application_deadline_at.isoformat().startswith("2026-08-16T23:59:59")
    assert candidate.action_kind == ActionKind.APPLY
    assert candidate.organizer_name == "Eurodesk Brussels Link"
    assert "<script" not in candidate.description
    assert "<style" not in candidate.description
    assert "alert('unsafe')" not in candidate.description
    assert "color: red" not in candidate.description
    assert candidate.raw_payload["subcategory"] == "Training courses"
    assert "alert('unsafe')" in candidate.raw_payload["raw_html"]


def test_national_edition_codes_are_mapped_to_content_languages():
    template = BeautifulSoup(
        """
        <template id="programme" data-hash="100-ua">
          <div data-role="hero"></div>
          <div data-role="title"><div>Українська можливість</div></div>
          <div data-role="body"><p>Опис</p></div>
        </template>
        """,
        "html.parser",
    ).select_one("template")

    record = parse_programme(template, "https://programmes.eurodesk.eu/learning")

    assert record.language == "uk"


def test_rejects_incomplete_programme_count():
    payload = fixture_payload()
    payload["count"] = 3
    client = httpx.Client(
        transport=httpx.MockTransport(
            lambda request: (
                httpx.Response(200, text="Learning")
                if request.url.path == "/learning"
                else httpx.Response(200, json=payload)
            )
        )
    )

    with pytest.raises(EurodeskUpstreamError, match="Expected 3 programmes"):
        importer(client).fetch_records()


def test_requires_complete_database_configuration():
    with pytest.raises(ValueError, match="Invalid source configuration"):
        importer(configuration={"page_url": "https://programmes.eurodesk.eu/learning"})
