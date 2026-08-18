from __future__ import annotations

import logging
import random
import time
from collections.abc import Callable
from datetime import UTC, datetime
from urllib.parse import urljoin

import httpx
from pydantic import (
    AnyHttpUrl,
    BaseModel,
    ConfigDict,
    Field,
    ValidationError,
    field_validator,
)

from ingestion.html import plain_text, sanitize_html
from ingestion.schemas import OpportunityCandidate
from opportunities.models import (
    ActionKind,
    OpportunityKind,
    ParticipationMode,
    TemporalPrecision,
)

logger = logging.getLogger(__name__)


class UpstreamError(RuntimeError):
    pass


class FlexibleModel(BaseModel):
    model_config = ConfigDict(extra="allow")


class VenueCountry(FlexibleModel):
    name: str | None = None
    iso: str | None = None


class Venue(FlexibleModel):
    name: str | None = None
    region: str | None = None
    street1: str | None = None
    street2: str | None = None
    city: str | None = None
    postal_code: str | None = None
    country: VenueCountry | None = None


class OnlineLocation(FlexibleModel):
    title: str | None = None
    url: str | None = None


class EypEvent(FlexibleModel):
    uuid: str | None = None
    identifier: int | None = None
    visible: bool | None = None
    moderation: str | None = None
    language: str | None = None
    title: str | None = None
    summary: str | None = None
    body: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    online: bool = False
    online_location: OnlineLocation | None = None
    venues: list[Venue] | None = None
    url: str | None = None
    updated: int | None = None
    styled_images: dict[str, str] = Field(default_factory=dict)


class EventHit(FlexibleModel):
    id: str | None = Field(default=None, alias="_id")
    source: EypEvent = Field(alias="_source")


class HitTotal(FlexibleModel):
    value: int
    relation: str


class Hits(FlexibleModel):
    total: HitTotal
    hits: list[EventHit]


class SearchResponse(FlexibleModel):
    timed_out: bool
    hits: Hits


class EUYouthEventsConfiguration(BaseModel):
    """Database-owned endpoint configuration for this adapter version."""

    model_config = ConfigDict(extra="forbid")

    api_base_url: AnyHttpUrl
    search_path: str
    portal_base_url: AnyHttpUrl

    @field_validator("search_path")
    @classmethod
    def validate_search_path(cls, value: str) -> str:
        path = value.strip().strip("/")
        if not path or "://" in path or "?" in path or "#" in path:
            raise ValueError("search_path must be a non-empty relative URL path")
        return path


class EUYouthEventsImporter:
    configuration_model = EUYouthEventsConfiguration
    MAX_RECORDS = 1_000
    MAX_ATTEMPTS = 3
    MIN_REQUEST_INTERVAL_SECONDS = 1.0

    def __init__(
        self,
        source,
        *,
        client: httpx.Client | None = None,
        sleep: Callable[[float], None] = time.sleep,
    ):
        self.source = source
        self.client = client or httpx.Client(
            timeout=httpx.Timeout(30.0, connect=10.0),
            headers={"User-Agent": "CivilEU/0.1 (opportunity catalog importer)"},
        )
        self.sleep = sleep
        configuration = self.validate_configuration(source.configuration)
        self.api_base_url = str(configuration.api_base_url).rstrip("/")
        self.search_path = configuration.search_path
        self.portal_base_url = str(configuration.portal_base_url).rstrip("/")

    @classmethod
    def validate_configuration(cls, raw_configuration) -> EUYouthEventsConfiguration:
        try:
            return cls.configuration_model.model_validate(raw_configuration)
        except ValidationError as exc:
            raise ValueError(f"Invalid source configuration: {exc}") from exc

    def _base_params(self) -> dict[str, str | int | bool]:
        return {
            "type": "Content",
            "no_score": True,
            "sort[start_date]": "asc",
            "sort[end_date]": "asc",
            "raw[query][bool][must][0][term][type]": "eyp_event",
            "raw[query][bool][must][1][match][visible]": True,
            "raw[query][bool][must][2][bool][should][0][term][language]": "en",
            "raw[query][bool][must][2][bool][should][1][term][is_fallback_for]": "en",
        }

    def _request(self, *, offset: int, size: int) -> SearchResponse:
        params = {**self._base_params(), "from": offset, "size": size}
        last_error: Exception | None = None
        for attempt in range(self.MAX_ATTEMPTS):
            retry_after = 0.0
            try:
                response = self.client.get(f"{self.api_base_url}/{self.search_path}", params=params)
                if response.status_code == 429:
                    try:
                        retry_after = float(response.headers.get("Retry-After", "0"))
                    except ValueError:
                        retry_after = 0.0
                response.raise_for_status()
                payload = SearchResponse.model_validate(response.json())
                if payload.timed_out:
                    raise UpstreamError("European Youth Portal search timed out")
                if payload.hits.total.relation != "eq":
                    raise UpstreamError("European Youth Portal returned an inexact total")
                return payload
            except (httpx.HTTPError, ValueError, UpstreamError) as exc:
                last_error = exc
                if attempt + 1 < self.MAX_ATTEMPTS:
                    backoff = (2**attempt) + random.uniform(0, 0.25)
                    self.sleep(max(backoff, retry_after))
        raise UpstreamError(f"European Youth Portal request failed: {last_error}") from last_error

    def fetch_records(self) -> tuple[int, list[EventHit]]:
        count_response = self._request(offset=0, size=0)
        expected = count_response.hits.total.value
        if expected > self.MAX_RECORDS:
            raise UpstreamError(
                f"Source contains {expected} records, exceeding the safe cap of {self.MAX_RECORDS}"
            )
        records: list[EventHit] = []
        if expected:
            # The source only sorts by dates. Offset pages can overlap when dates tie,
            # so fetch the counted dataset in one request under a strict upper bound.
            self.sleep(self.MIN_REQUEST_INTERVAL_SECONDS)
            page = self._request(offset=0, size=expected)
            if page.hits.total.value != expected:
                raise UpstreamError("Source total changed during fetch")
            records = page.hits.hits
        if len(records) != expected:
            raise UpstreamError(f"Expected {expected} source records, received {len(records)}")
        identities = [self.external_id(record) for record in records]
        if any(not record.source.uuid for record in records):
            raise UpstreamError("At least one source record has no stable UUID")
        if len(set(identities)) != len(identities):
            raise UpstreamError("Source response contains duplicate UUID/language identities")
        return expected, records

    @staticmethod
    def external_id(hit: EventHit) -> str:
        event = hit.source
        return f"{event.uuid}:{(event.language or 'und').strip().lower()}"

    def to_candidate(self, hit: EventHit) -> OpportunityCandidate:
        event = hit.source
        if event.visible is not True:
            raise ValueError("source record is not public")
        if not event.uuid or not (event.title or "").strip():
            raise ValueError("source record is missing UUID or title")
        if not event.start_date or not event.end_date:
            raise ValueError("source record is missing dates")
        if not event.url:
            raise ValueError("source record is missing its portal URL")

        venues = event.venues or []
        venue = venues[0] if venues else None
        country_code = None
        city = None
        address = None
        if venue:
            country_code = (venue.country.iso if venue.country else None) or None
            if country_code == "EL":
                country_code = "GR"
            if country_code:
                country_code = country_code.upper()
            city = (venue.city or "").strip() or None
            address_parts = [
                venue.name,
                venue.street1,
                venue.street2,
                venue.postal_code,
                venue.city,
                venue.country.name if venue.country else None,
            ]
            address = (
                ", ".join(part.strip() for part in address_parts if part and part.strip()) or None
            )

        if event.online and venues:
            mode = ParticipationMode.HYBRID
        elif event.online:
            mode = ParticipationMode.ONLINE
        elif venues:
            mode = ParticipationMode.IN_PERSON
        else:
            mode = ParticipationMode.UNSPECIFIED

        source_url = urljoin(f"{self.portal_base_url}/", event.url)
        action_url = source_url
        if event.online and event.online_location and event.online_location.url:
            action_url = urljoin(f"{self.portal_base_url}/", event.online_location.url)

        image_url = None
        for image_style in ("1260x630", "400x220", "eyp_large", "large"):
            if event.styled_images.get(image_style):
                image_url = urljoin(f"{self.portal_base_url}/", event.styled_images[image_style])
                break

        return OpportunityCandidate(
            external_id=self.external_id(hit),
            source_entity_id=event.uuid,
            kind=OpportunityKind.OTHER,
            title=event.title.strip(),
            summary=plain_text(event.summary),
            description=sanitize_html(event.body),
            language=(event.language or "und").strip().lower(),
            organizer_name=None,
            starts_at=self._parse_utc(event.start_date),
            starts_at_precision=TemporalPrecision.DATETIME,
            ends_at=self._parse_utc(event.end_date),
            temporal_timezone="UTC",
            participation_mode=mode,
            country_code=country_code,
            city=city,
            address=address,
            action_kind=ActionKind.LEARN_MORE,
            action_url=action_url,
            source_url=source_url,
            image_url=image_url,
            source_updated_at=(
                datetime.fromtimestamp(event.updated, tz=UTC) if event.updated else None
            ),
            raw_payload=hit.model_dump(mode="json", by_alias=True),
        )

    @staticmethod
    def _parse_utc(value: str) -> datetime:
        parsed = datetime.fromisoformat(value.removesuffix("Z"))
        if parsed.tzinfo is not None:
            return parsed.astimezone(UTC)
        return parsed.replace(tzinfo=UTC)
