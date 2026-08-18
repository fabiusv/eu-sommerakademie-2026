from collections.abc import Mapping

from django.contrib.gis.geos import Point

from accounts.models import UserProfile


def get_user_preferences(*, user) -> UserProfile | None:
    return UserProfile.objects.filter(user=user).first()


def update_user_preferences(*, user, changes: Mapping[str, object]) -> UserProfile:
    profile, _ = UserProfile.objects.get_or_create(user=user)
    if changes.get("timezone") is not None:
        profile.timezone = changes["timezone"]
    if {"latitude", "longitude"}.issubset(changes):
        latitude = changes["latitude"]
        longitude = changes["longitude"]
        if latitude is None and longitude is None:
            profile.location = None
        elif latitude is not None and longitude is not None:
            profile.location = Point(longitude, latitude, srid=4326)
    if "travel_radius_meters" in changes:
        profile.travel_radius_meters = changes["travel_radius_meters"]
    if "participation_modes" in changes:
        profile.participation_modes = changes["participation_modes"] or []
    if "interest_codes" in changes:
        profile.interest_codes = [value.strip() for value in changes["interest_codes"] or []]
    profile.full_clean()
    profile.save()
    return profile
