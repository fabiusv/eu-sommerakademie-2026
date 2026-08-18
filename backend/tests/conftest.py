from datetime import timedelta

import pytest
from django.utils import timezone

from accounts.models import User
from ingestion.models import Source
from opportunities.models import (
    ActionKind,
    Opportunity,
    OpportunityKind,
    ParticipationMode,
)


@pytest.fixture(autouse=True)
def disable_external_services(settings):
    """Tests opt into providers explicitly and never consume developer credentials."""

    settings.OPENAI_API_KEY = ""
    settings.OPENCAGE_API_KEY = ""


@pytest.fixture
def source(db):
    return Source.objects.create(
        name="European Youth Portal Events",
        adapter_key="eu_youth_events.v1",
        configuration={
            "api_base_url": "https://youth.europa.eu/api/rest/eyp/v1",
            "search_path": "search_en",
            "portal_base_url": "https://youth.europa.eu",
        },
        sync_interval=timedelta(hours=6),
        attribution_name="European Youth Portal",
        attribution_text="Test attribution",
        attribution_url="https://youth.europa.eu/events_en",
    )


@pytest.fixture
def user(db):
    return User.objects.create_user(email="person@example.test", password="test-password-123")


@pytest.fixture
def opportunity(source):
    now = timezone.now()
    return Opportunity.objects.create(
        source=source,
        external_id="fixture-opportunity",
        kind=OpportunityKind.DIALOGUE,
        title="Current civic event",
        summary="Summary",
        description="<p>Description</p>",
        language="en",
        starts_at=now - timedelta(hours=1),
        ends_at=now + timedelta(hours=2),
        participation_mode=ParticipationMode.IN_PERSON,
        country_code="BE",
        city="Brussels",
        address="Rue de la Loi, Brussels, Belgium",
        action_kind=ActionKind.LEARN_MORE,
        action_url="https://youth.europa.eu/events/current_en",
        source_url="https://youth.europa.eu/events/current_en",
        last_seen_at=now,
        raw_payload={"uuid": "fixture-opportunity"},
    )
