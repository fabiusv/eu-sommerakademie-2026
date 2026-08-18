from datetime import datetime

from django.http import Http404
from ninja import Router

from opportunities.schemas import OpportunityOut, OpportunityPage, serialize_opportunity
from opportunities.services import CatalogFilters, find_public_opportunity, query_catalog

router = Router(tags=["opportunities"])


@router.get("/opportunities", response=OpportunityPage)
def list_opportunities(
    request,
    kind: str | None = None,
    country: str | None = None,
    city: str | None = None,
    language: str | None = None,
    source: str | None = None,
    action_kind: str | None = None,
    query: str | None = None,
    latitude: float | None = None,
    longitude: float | None = None,
    radius: int | None = None,
    participation_mode: str | None = None,
    starts_after: datetime | None = None,
    starts_before: datetime | None = None,
    ends_after: datetime | None = None,
    ends_before: datetime | None = None,
    deadline_after: datetime | None = None,
    deadline_before: datetime | None = None,
    temporal_status: str | None = None,
    has_date: bool | None = None,
    limit: int = 20,
    offset: int = 0,
):
    page = query_catalog(
        CatalogFilters(
            kind=kind,
            country=country,
            city=city,
            language=language,
            source=source,
            action_kind=action_kind,
            query=query,
            latitude=latitude,
            longitude=longitude,
            radius=radius,
            participation_mode=participation_mode,
            starts_after=starts_after,
            starts_before=starts_before,
            ends_after=ends_after,
            ends_before=ends_before,
            deadline_after=deadline_after,
            deadline_before=deadline_before,
            temporal_status=temporal_status,
            has_date=has_date,
            limit=limit,
            offset=offset,
        )
    )
    return {
        "items": [serialize_opportunity(item) for item in page.items],
        "count": page.count,
        "limit": page.limit,
        "offset": page.offset,
    }


@router.get("/opportunities/{opportunity_id}", response=OpportunityOut)
def get_opportunity(request, opportunity_id: int):
    opportunity = find_public_opportunity(opportunity_id)
    if opportunity is None:
        raise Http404
    return serialize_opportunity(opportunity)
