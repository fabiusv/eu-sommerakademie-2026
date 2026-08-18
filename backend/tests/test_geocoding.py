import httpx
import pytest

from ingestion.geocoding import GeocodingResult, enrich_opportunity
from opportunities.models import GeocodingStatus

pytestmark = pytest.mark.django_db


class FakeGeocoder:
    key = "fake.v1"

    def __init__(self, result=None, error=None):
        self.result = result
        self.error = error
        self.calls = 0

    def geocode(self, query, *, country_code):
        self.calls += 1
        if self.error:
            raise self.error
        return self.result


def test_successful_geocode_is_cached(opportunity):
    provider = FakeGeocoder(
        GeocodingResult(50.8503, 4.3517, 9, "BE", "Brussels, Belgium")
    )
    assert enrich_opportunity(opportunity, provider) == GeocodingStatus.SUCCEEDED
    opportunity.refresh_from_db()
    assert opportunity.location.y == pytest.approx(50.8503)
    assert enrich_opportunity(opportunity, provider) is None
    assert provider.calls == 1


def test_low_confidence_or_country_mismatch_is_terminal_no_match(opportunity):
    provider = FakeGeocoder(GeocodingResult(50.0, 4.0, 6, "FR", "Wrong result"))
    assert enrich_opportunity(opportunity, provider) == GeocodingStatus.NO_MATCH
    opportunity.refresh_from_db()
    assert opportunity.location is None


def test_transient_failure_remains_retryable(opportunity):
    provider = FakeGeocoder(error=httpx.ConnectError("offline"))
    assert enrich_opportunity(opportunity, provider) == GeocodingStatus.RETRYABLE_FAILURE
    opportunity.refresh_from_db()
    assert opportunity.geocoding_status == GeocodingStatus.RETRYABLE_FAILURE


def test_provider_change_recomputes_cached_location(opportunity):
    first = FakeGeocoder(GeocodingResult(50.8503, 4.3517, 9, "BE", "Brussels"))
    enrich_opportunity(opportunity, first)
    opportunity.refresh_from_db()
    second = FakeGeocoder(GeocodingResult(50.851, 4.352, 9, "BE", "Brussels"))
    second.key = "fake.v2"
    assert enrich_opportunity(opportunity, second) == GeocodingStatus.SUCCEEDED
    assert second.calls == 1
