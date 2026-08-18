from datetime import datetime

from ninja import Schema

from opportunities.models import Opportunity


class AttributionOut(Schema):
    source_key: str
    name: str
    text: str
    url: str


class LocationOut(Schema):
    latitude: float
    longitude: float


class OpportunityOut(Schema):
    id: int
    status: str
    kind: str
    title: str
    summary: str
    description: str
    language: str
    organizer_name: str | None
    starts_at: datetime | None
    ends_at: datetime | None
    application_deadline_at: datetime | None
    participation_mode: str
    country_code: str | None
    city: str | None
    address: str | None
    location: LocationOut | None
    action_kind: str
    action_url: str
    source_url: str
    image_url: str | None
    attribution: AttributionOut


class OpportunityPage(Schema):
    items: list[OpportunityOut]
    count: int
    limit: int
    offset: int


def serialize_opportunity(opportunity: Opportunity) -> dict[str, object]:
    point = opportunity.location
    return {
        "id": opportunity.pk,
        "status": opportunity.status,
        "kind": opportunity.kind,
        "title": opportunity.title,
        "summary": opportunity.summary,
        "description": opportunity.description,
        "language": opportunity.language,
        "organizer_name": opportunity.organizer_name,
        "starts_at": opportunity.starts_at,
        "ends_at": opportunity.ends_at,
        "application_deadline_at": opportunity.application_deadline_at,
        "participation_mode": opportunity.participation_mode,
        "country_code": opportunity.country_code,
        "city": opportunity.city,
        "address": opportunity.address,
        "location": {"latitude": point.y, "longitude": point.x} if point else None,
        "action_kind": opportunity.action_kind,
        "action_url": opportunity.action_url,
        "source_url": opportunity.source_url,
        "image_url": opportunity.image_url,
        "attribution": {
            "source_key": opportunity.source.adapter_key,
            "name": opportunity.source.attribution_name,
            "text": opportunity.source.attribution_text,
            "url": opportunity.source.attribution_url,
        },
    }
