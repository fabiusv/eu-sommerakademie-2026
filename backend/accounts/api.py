from typing import Literal
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from ninja import Router, Schema
from ninja.security import django_auth
from pydantic import Field, model_validator

from accounts.models import UserProfile
from accounts.services import get_user_preferences, update_user_preferences

router = Router(tags=["preferences"])

ParticipationModeValue = Literal["IN_PERSON", "ONLINE", "HYBRID", "UNSPECIFIED"]


class PreferencesPatch(Schema):
    timezone: str | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    travel_radius_meters: int | None = Field(default=None, ge=1, le=500_000)
    participation_modes: list[ParticipationModeValue] | None = None
    interest_codes: list[str] | None = None

    @model_validator(mode="after")
    def validate_patch(self):
        coordinate_fields = {"latitude", "longitude"} & self.model_fields_set
        if coordinate_fields and coordinate_fields != {"latitude", "longitude"}:
            raise ValueError("latitude and longitude must be supplied together")
        if self.timezone is not None:
            try:
                ZoneInfo(self.timezone)
            except ZoneInfoNotFoundError as exc:
                raise ValueError("timezone must be a valid IANA timezone") from exc
        if self.interest_codes is not None:
            if len(self.interest_codes) > 100:
                raise ValueError("at most 100 interest codes are allowed")
            if any(not value.strip() or len(value) > 64 for value in self.interest_codes):
                raise ValueError("interest codes must contain 1 to 64 characters")
        return self


class PreferencesOut(Schema):
    timezone: str
    latitude: float | None
    longitude: float | None
    travel_radius_meters: int | None
    participation_modes: list[str]
    interest_codes: list[str]


def serialize_preferences(profile: UserProfile | None) -> dict[str, object]:
    if profile is None:
        return {
            "timezone": "UTC",
            "latitude": None,
            "longitude": None,
            "travel_radius_meters": None,
            "participation_modes": [],
            "interest_codes": [],
        }
    return {
        "timezone": profile.timezone,
        "latitude": profile.location.y if profile.location else None,
        "longitude": profile.location.x if profile.location else None,
        "travel_radius_meters": profile.travel_radius_meters,
        "participation_modes": profile.participation_modes,
        "interest_codes": profile.interest_codes,
    }


@router.get("/users/me/preferences", auth=django_auth, response=PreferencesOut)
def get_preferences(request):
    profile = get_user_preferences(user=request.user)
    return serialize_preferences(profile)


@router.patch("/users/me/preferences", auth=django_auth, response=PreferencesOut)
def patch_preferences(request, payload: PreferencesPatch):
    profile = update_user_preferences(
        user=request.user,
        changes=payload.model_dump(exclude_unset=True),
    )
    return serialize_preferences(profile)
