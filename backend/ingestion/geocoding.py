from __future__ import annotations

import hashlib
import logging
from dataclasses import dataclass
from typing import Protocol

import httpx
from django.conf import settings
from django.contrib.gis.geos import Point
from django.utils import timezone

from opportunities.models import GeocodingStatus, Opportunity

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class GeocodingResult:
    latitude: float
    longitude: float
    confidence: int
    country_code: str | None
    formatted: str | None


class Geocoder(Protocol):
    key: str

    def geocode(self, query: str, *, country_code: str) -> GeocodingResult | None: ...


class OpenCageGeocoder:
    key = "opencage.v1"

    def __init__(self, api_key: str, *, client: httpx.Client | None = None):
        self.api_key = api_key
        self.client = client or httpx.Client(timeout=httpx.Timeout(20.0, connect=5.0))

    def geocode(self, query: str, *, country_code: str) -> GeocodingResult | None:
        response = self.client.get(
            settings.OPENCAGE_API_URL,
            params={
                "key": self.api_key,
                "q": query,
                "countrycode": country_code.lower(),
                "limit": 1,
                "no_annotations": 1,
                "language": "en",
            },
        )
        response.raise_for_status()
        results = response.json().get("results", [])
        if not results:
            return None
        result = results[0]
        geometry = result.get("geometry") or {}
        components = result.get("components") or {}
        return GeocodingResult(
            latitude=float(geometry["lat"]),
            longitude=float(geometry["lng"]),
            confidence=int(result.get("confidence", 0)),
            country_code=(components.get("country_code") or "").upper() or None,
            formatted=result.get("formatted"),
        )


def configured_geocoder() -> Geocoder | None:
    if settings.GEOCODING_PROVIDER != "opencage":
        raise ValueError(f"Unsupported geocoding provider: {settings.GEOCODING_PROVIDER}")
    if not settings.OPENCAGE_API_KEY:
        return None
    return OpenCageGeocoder(settings.OPENCAGE_API_KEY)


def normalized_geocoding_input(opportunity: Opportunity) -> str | None:
    if not opportunity.country_code or not (opportunity.city or opportunity.address):
        return None
    parts = [opportunity.address, opportunity.city, opportunity.country_code]
    normalized_parts = [" ".join(value.lower().split()) for value in parts if value]
    return ", ".join(dict.fromkeys(normalized_parts))


def enrich_opportunity(opportunity: Opportunity, geocoder: Geocoder) -> GeocodingStatus | None:
    query = normalized_geocoding_input(opportunity)
    if not query or not opportunity.country_code:
        return None
    input_hash = hashlib.sha256(f"{geocoder.key}\0{query}".encode()).hexdigest()
    terminal_statuses = {GeocodingStatus.SUCCEEDED, GeocodingStatus.NO_MATCH}
    if (
        opportunity.geocoding_input_hash == input_hash
        and opportunity.geocoding_provider == geocoder.key
        and opportunity.geocoding_status in terminal_statuses
    ):
        return None

    attempted_at = timezone.now()
    opportunity.geocoding_provider = geocoder.key
    opportunity.geocoding_input_hash = input_hash
    opportunity.geocoding_last_attempt_at = attempted_at
    try:
        result = geocoder.geocode(query, country_code=opportunity.country_code)
    except (httpx.HTTPError, KeyError, TypeError, ValueError) as exc:
        opportunity.geocoding_status = GeocodingStatus.RETRYABLE_FAILURE
        opportunity.geocoding_metadata = {"error": str(exc)[:500]}
        opportunity.save(
            update_fields=(
                "geocoding_provider",
                "geocoding_input_hash",
                "geocoding_last_attempt_at",
                "geocoding_status",
                "geocoding_metadata",
                "updated_at",
            )
        )
        logger.warning("Geocoding failed for opportunity %s: %s", opportunity.pk, exc)
        return GeocodingStatus.RETRYABLE_FAILURE

    if (
        result is None
        or result.confidence < 7
        or result.country_code != opportunity.country_code.upper()
    ):
        opportunity.location = None
        opportunity.geocoded_at = None
        opportunity.geocoding_status = GeocodingStatus.NO_MATCH
        opportunity.geocoding_metadata = {
            "reason": "no_result"
            if result is None
            else "confidence_or_country_mismatch",
            "confidence": result.confidence if result else None,
            "result_country_code": result.country_code if result else None,
        }
    else:
        opportunity.location = Point(result.longitude, result.latitude, srid=4326)
        opportunity.geocoded_at = attempted_at
        opportunity.geocoding_status = GeocodingStatus.SUCCEEDED
        opportunity.geocoding_metadata = {
            "confidence": result.confidence,
            "formatted": result.formatted,
        }
    opportunity.save(
        update_fields=(
            "location",
            "geocoding_provider",
            "geocoding_input_hash",
            "geocoding_status",
            "geocoding_metadata",
            "geocoding_last_attempt_at",
            "geocoded_at",
            "updated_at",
        )
    )
    return GeocodingStatus(opportunity.geocoding_status)
