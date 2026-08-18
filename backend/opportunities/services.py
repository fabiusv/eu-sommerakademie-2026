from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import datetime

from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from django.db.models import Case, DateTimeField, IntegerField, Q, Value, When
from django.db.models.functions import Coalesce
from django.utils import timezone

from opportunities.models import (
    ActionKind,
    Opportunity,
    OpportunityKind,
    ParticipationMode,
    PublicationStatus,
)


@dataclass(frozen=True)
class CatalogFilters:
    kind: str | None = None
    country: str | None = None
    city: str | None = None
    language: str | None = None
    source: str | None = None
    action_kind: str | None = None
    query: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    radius: int | None = None
    participation_mode: str | None = None
    starts_after: datetime | None = None
    starts_before: datetime | None = None
    ends_after: datetime | None = None
    ends_before: datetime | None = None
    deadline_after: datetime | None = None
    deadline_before: datetime | None = None
    temporal_status: str | None = None
    has_date: bool | None = None
    limit: int = 20
    offset: int = 0


@dataclass(frozen=True)
class CatalogPage:
    items: tuple[Opportunity, ...]
    count: int
    limit: int
    offset: int


def query_catalog(filters: CatalogFilters) -> CatalogPage:
    _validate_filters(filters)
    now = timezone.now()
    queryset = public_opportunities()
    current_without_window = Q(
        ends_at__isnull=True,
        application_deadline_at__gte=now,
    ) | Q(
        ends_at__isnull=True,
        application_deadline_at__isnull=True,
    )
    if filters.temporal_status is None:
        queryset = queryset.filter(Q(ends_at__gte=now) | current_without_window)
    elif filters.temporal_status == "ongoing":
        queryset = queryset.filter(Q(starts_at__lte=now, ends_at__gte=now) | current_without_window)
    elif filters.temporal_status == "upcoming":
        queryset = queryset.filter(starts_at__gt=now)
    elif filters.temporal_status == "ended":
        queryset = queryset.filter(
            Q(ends_at__lt=now)
            | Q(
                ends_at__isnull=True,
                application_deadline_at__lt=now,
            )
        )

    dated = (
        Q(starts_at__isnull=False)
        | Q(ends_at__isnull=False)
        | Q(application_deadline_at__isnull=False)
    )
    if filters.has_date is True:
        queryset = queryset.filter(dated)
    elif filters.has_date is False:
        queryset = queryset.exclude(dated)

    field_filters = {
        "kind": filters.kind or None,
        "country_code": filters.country.upper() if filters.country else None,
        "city__iexact": filters.city.strip() if filters.city else None,
        "language__iexact": filters.language or None,
        "source__adapter_key": filters.source or None,
        "action_kind": filters.action_kind or None,
        "participation_mode": filters.participation_mode or None,
        "starts_at__gte": filters.starts_after,
        "starts_at__lte": filters.starts_before,
        "ends_at__gte": filters.ends_after,
        "ends_at__lte": filters.ends_before,
        "application_deadline_at__gte": filters.deadline_after,
        "application_deadline_at__lte": filters.deadline_before,
    }
    queryset = queryset.filter(
        **{field: value for field, value in field_filters.items() if value is not None}
    )
    if filters.query:
        search_term = filters.query.strip()
        queryset = queryset.filter(
            Q(title__icontains=search_term)
            | Q(summary__icontains=search_term)
            | Q(description__icontains=search_term)
            | Q(organizer_name__icontains=search_term)
            | Q(city__icontains=search_term)
        )

    ordering = ["temporal_order", "sort_at", "id"]
    if filters.latitude is not None:
        origin = Point(filters.longitude, filters.latitude, srid=4326)
        online_modes = [ParticipationMode.ONLINE, ParticipationMode.HYBRID]
        queryset = queryset.filter(
            Q(location__distance_lte=(origin, D(m=filters.radius)))
            | Q(participation_mode__in=online_modes)
        ).annotate(distance=Distance("location", origin))
        ordering = ["temporal_order", "sort_at", "distance", "id"]

    queryset = queryset.annotate(
        temporal_order=Case(
            When(starts_at__lte=now, ends_at__gte=now, then=Value(0)),
            When(current_without_window, then=Value(0)),
            default=Value(1),
            output_field=IntegerField(),
        ),
        sort_at=Coalesce(
            "starts_at",
            "application_deadline_at",
            Value(datetime.max.replace(tzinfo=timezone.get_current_timezone())),
            output_field=DateTimeField(),
        ),
    ).order_by(*ordering)
    count = queryset.count()
    items = tuple(queryset[filters.offset : filters.offset + filters.limit])
    return CatalogPage(
        items=items,
        count=count,
        limit=filters.limit,
        offset=filters.offset,
    )


def public_opportunities():
    return Opportunity.objects.select_related("source").filter(
        status=PublicationStatus.PUBLISHED,
        duplicate_of__isnull=True,
    )


def find_public_opportunity(opportunity_id: int) -> Opportunity | None:
    return public_opportunities().filter(pk=opportunity_id).first()


def find_opportunity(opportunity_id: int) -> Opportunity | None:
    return Opportunity.objects.filter(pk=opportunity_id).first()


def _validate_filters(filters: CatalogFilters) -> None:
    if not 1 <= filters.limit <= 100:
        raise ValueError("limit must be between 1 and 100")
    if not 0 <= filters.offset <= 10_000:
        raise ValueError("offset must be between 0 and 10000")
    geo_values = (filters.latitude, filters.longitude, filters.radius)
    if any(value is not None for value in geo_values) and not all(
        value is not None for value in geo_values
    ):
        raise ValueError("latitude, longitude, and radius must be supplied together")
    if filters.latitude is not None and (
        not math.isfinite(filters.latitude) or not -90 <= filters.latitude <= 90
    ):
        raise ValueError("latitude must be between -90 and 90")
    if filters.longitude is not None and (
        not math.isfinite(filters.longitude) or not -180 <= filters.longitude <= 180
    ):
        raise ValueError("longitude must be between -180 and 180")
    if filters.radius is not None and not 1 <= filters.radius <= 500_000:
        raise ValueError("radius must be between 1 and 500000 metres")
    if filters.kind and filters.kind not in OpportunityKind.values:
        raise ValueError("invalid opportunity kind")
    if filters.country and len(filters.country) != 2:
        raise ValueError("country must be a two-letter code")
    if filters.action_kind and filters.action_kind not in ActionKind.values:
        raise ValueError("invalid action kind")
    if filters.participation_mode and filters.participation_mode not in ParticipationMode.values:
        raise ValueError("invalid participation mode")
    if filters.query and not 2 <= len(filters.query.strip()) <= 200:
        raise ValueError("query must contain between 2 and 200 characters")
    if filters.temporal_status not in {None, "ongoing", "upcoming", "ended"}:
        raise ValueError("temporal_status must be ongoing, upcoming, or ended")
