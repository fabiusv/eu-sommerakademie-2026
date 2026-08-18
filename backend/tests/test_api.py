from datetime import timedelta

import pytest
from django.conf import settings
from django.contrib.gis.geos import Point
from django.middleware.csrf import get_token
from django.test import Client, RequestFactory
from django.utils import timezone

from accounts.models import UserProfile
from interactions.models import Bookmark, Interaction, InteractionType
from opportunities.models import (
    ActionKind,
    Opportunity,
    OpportunityKind,
    ParticipationMode,
    PublicationStatus,
)

pytestmark = pytest.mark.django_db


def clone_opportunity(opportunity, **changes):
    values = {
        field.name: getattr(opportunity, field.name)
        for field in Opportunity._meta.fields
        if field.name
        not in {
            "id",
            "created_at",
            "updated_at",
        }
    }
    values.update(changes)
    return Opportunity.objects.create(**values)


def test_catalog_defaults_to_current_and_excludes_withdrawn(client, opportunity):
    now = timezone.now()
    clone_opportunity(
        opportunity,
        external_id="ended",
        title="Ended",
        starts_at=now - timedelta(days=2),
        ends_at=now - timedelta(days=1),
    )
    clone_opportunity(
        opportunity,
        external_id="withdrawn",
        title="Withdrawn",
        status=PublicationStatus.WITHDRAWN,
    )

    response = client.get("/v1/opportunities")
    assert response.status_code == 200
    assert [item["title"] for item in response.json()["items"]] == ["Current civic event"]

    response = client.get("/v1/opportunities", {"temporal_status": "ended"})
    assert response.json()["items"][0]["title"] == "Ended"


def test_catalog_uses_application_deadlines_for_non_events(client, opportunity):
    now = timezone.now()
    clone_opportunity(
        opportunity,
        external_id="open-programme",
        kind=OpportunityKind.PROGRAMME,
        kind_classification=None,
        title="Open programme",
        starts_at=None,
        ends_at=None,
        application_deadline_at=now + timedelta(days=7),
    )
    clone_opportunity(
        opportunity,
        external_id="closed-programme",
        kind=OpportunityKind.PROGRAMME,
        kind_classification=None,
        title="Closed programme",
        starts_at=None,
        ends_at=None,
        application_deadline_at=now - timedelta(days=1),
    )

    response = client.get("/v1/opportunities")
    titles = {item["title"] for item in response.json()["items"]}
    assert "Open programme" in titles
    assert "Closed programme" not in titles
    open_programme = next(
        item for item in response.json()["items"] if item["title"] == "Open programme"
    )
    assert open_programme["starts_at"] is None
    assert open_programme["application_deadline_at"].endswith(("Z", "+00:00"))

    response = client.get("/v1/opportunities", {"temporal_status": "ended"})
    assert "Closed programme" in {item["title"] for item in response.json()["items"]}


def test_catalog_filters_by_presence_of_any_date(client, opportunity):
    now = timezone.now()
    clone_opportunity(
        opportunity,
        external_id="dated-programme",
        title="Dated programme",
        starts_at=None,
        ends_at=None,
        application_deadline_at=now + timedelta(days=7),
    )
    clone_opportunity(
        opportunity,
        external_id="undated-programme",
        title="Undated programme",
        starts_at=None,
        ends_at=None,
        application_deadline_at=None,
    )

    response = client.get("/v1/opportunities", {"has_date": "true"})
    assert response.status_code == 200
    assert {item["title"] for item in response.json()["items"]} == {
        "Current civic event",
        "Dated programme",
    }

    response = client.get("/v1/opportunities", {"has_date": "false"})
    assert response.status_code == 200
    assert [item["title"] for item in response.json()["items"]] == ["Undated programme"]


def test_catalog_filters_language_and_returns_explicit_utc(client, opportunity):
    response = client.get("/v1/opportunities", {"language": "en"})
    assert response.status_code == 200
    item = response.json()["items"][0]
    assert item["language"] == "en"
    assert item["kind"] == OpportunityKind.DIALOGUE
    assert item["starts_at"].endswith(("Z", "+00:00"))
    assert item["attribution"]["source_key"] == "eu_youth_events.v1"
    assert item["attribution"]["name"] == "European Youth Portal"


def test_catalog_filters_flat_kind_and_rejects_removed_kinds(client, opportunity):
    clone_opportunity(
        opportunity,
        external_id="debate",
        title="Policy debate",
        kind=OpportunityKind.DEBATE,
    )
    response = client.get("/v1/opportunities", {"kind": OpportunityKind.DEBATE})
    assert response.status_code == 200
    assert [item["title"] for item in response.json()["items"]] == ["Policy debate"]

    assert client.get("/v1/opportunities", {"kind": "EVENT"}).status_code == 422
    assert client.get("/v1/opportunities", {"kind": "PETITION"}).status_code == 422


def test_catalog_filters_existing_useful_properties(client, opportunity):
    opportunity.city = "Brussels"
    opportunity.action_kind = ActionKind.APPLY
    opportunity.save(update_fields=("city", "action_kind", "updated_at"))

    matching_filters = (
        {"city": "brussels"},
        {"source": "eu_youth_events.v1"},
        {"action_kind": ActionKind.APPLY},
        {"query": "civic event"},
        {"ends_after": (timezone.now() - timedelta(days=1)).isoformat()},
    )
    for filters in matching_filters:
        response = client.get("/v1/opportunities", filters)
        assert response.status_code == 200
        assert response.json()["count"] == 1

    assert client.get("/v1/opportunities", {"query": "x"}).status_code == 422
    assert client.get("/v1/opportunities", {"action_kind": "INVALID"}).status_code == 422


def test_radius_includes_nearby_and_online_but_not_ungeocoded_in_person(client, opportunity):
    opportunity.location = Point(4.3517, 50.8503, srid=4326)
    opportunity.save(update_fields=("location", "updated_at"))
    clone_opportunity(
        opportunity,
        external_id="ungeocoded",
        title="Ungeocoded",
        location=None,
    )
    clone_opportunity(
        opportunity,
        external_id="online",
        title="Online",
        location=None,
        participation_mode=ParticipationMode.ONLINE,
    )
    response = client.get(
        "/v1/opportunities",
        {"latitude": 50.8503, "longitude": 4.3517, "radius": 1_000},
    )
    assert response.status_code == 200
    assert {item["title"] for item in response.json()["items"]} == {
        "Current civic event",
        "Online",
    }


def test_radius_parameters_are_all_or_nothing(client):
    response = client.get("/v1/opportunities", {"latitude": 50.0})
    assert response.status_code == 422


def test_radius_rejects_non_finite_coordinates(client):
    response = client.get(
        "/v1/opportunities",
        {"latitude": "nan", "longitude": 4.0, "radius": 1_000},
    )
    assert response.status_code == 422


def test_preferences_require_auth_and_validate_timezone(client, user):
    assert client.get("/v1/users/me/preferences").status_code == 401
    client.force_login(user)
    response = client.patch(
        "/v1/users/me/preferences",
        data={"timezone": "Europe/Berlin", "latitude": 52.52, "longitude": 13.405},
        content_type="application/json",
    )
    assert response.status_code == 200
    assert response.json()["timezone"] == "Europe/Berlin"
    assert UserProfile.objects.get(user=user).location.x == pytest.approx(13.405)

    response = client.patch(
        "/v1/users/me/preferences",
        data={"timezone": "Not/AZone"},
        content_type="application/json",
    )
    assert response.status_code == 422


def test_bookmarks_are_idempotent_and_record_save_unsave(client, user, opportunity):
    client.force_login(user)
    path = f"/v1/bookmarks/{opportunity.pk}"
    assert client.put(path, data={}, content_type="application/json").status_code == 201
    assert client.put(path, data={}, content_type="application/json").status_code == 200
    assert Bookmark.objects.count() == 1
    assert Interaction.objects.filter(interaction_type=InteractionType.SAVE).count() == 1

    assert client.delete(path).status_code == 204
    assert client.delete(path).status_code == 204
    assert Interaction.objects.filter(interaction_type=InteractionType.UNSAVE).count() == 1


def test_bookmarks_retain_withdrawn_opportunities(client, user, opportunity):
    client.force_login(user)
    path = f"/v1/bookmarks/{opportunity.pk}"
    assert client.put(path, data={}, content_type="application/json").status_code == 201

    opportunity.status = PublicationStatus.WITHDRAWN
    opportunity.save(update_fields=("status", "updated_at"))

    response = client.get("/v1/bookmarks")

    assert response.status_code == 200
    assert response.json()["count"] == 1
    assert response.json()["items"][0]["opportunity"]["status"] == PublicationStatus.WITHDRAWN
    assert client.get(f"/v1/opportunities/{opportunity.pk}").status_code == 404
    assert client.delete(path).status_code == 204


def test_interactions_accept_anonymous_batches(client, opportunity):
    response = client.post(
        "/v1/interactions",
        data={
            "events": [
                {
                    "opportunity_id": opportunity.pk,
                    "interaction_type": "IMPRESSION",
                    "context": {"position": 1, "algorithm": "mvp-deterministic-v1"},
                },
                {
                    "opportunity_id": opportunity.pk,
                    "interaction_type": "OPEN",
                    "context": {},
                },
            ]
        },
        content_type="application/json",
    )
    assert response.status_code == 201
    assert response.json() == {"created": 2}
    assert Interaction.objects.filter(user=None).count() == 2


def test_authenticated_interactions_require_csrf(user, opportunity):
    client = Client(enforce_csrf_checks=True)
    client.force_login(user)

    response = client.post(
        "/v1/interactions",
        data={
            "events": [
                {
                    "opportunity_id": opportunity.pk,
                    "interaction_type": "OPEN",
                    "context": {},
                }
            ]
        },
        content_type="application/json",
    )

    assert response.status_code == 403
    assert not Interaction.objects.exists()

    csrf_request = RequestFactory().get("/")
    csrf_token = get_token(csrf_request)
    client.cookies[settings.CSRF_COOKIE_NAME] = csrf_request.META["CSRF_COOKIE"]
    response = client.post(
        "/v1/interactions",
        data={
            "events": [
                {
                    "opportunity_id": opportunity.pk,
                    "interaction_type": "OPEN",
                    "context": {},
                }
            ]
        },
        content_type="application/json",
        headers={"X-CSRFToken": csrf_token},
    )

    assert response.status_code == 201
    assert Interaction.objects.filter(user=user).count() == 1


def test_withdrawn_detail_is_not_public(client, opportunity):
    opportunity.status = PublicationStatus.WITHDRAWN
    opportunity.save(update_fields=("status", "updated_at"))
    assert client.get(f"/v1/opportunities/{opportunity.pk}").status_code == 404
