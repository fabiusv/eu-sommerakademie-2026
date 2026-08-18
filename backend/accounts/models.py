from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from django.contrib.auth.models import AbstractUser
from django.contrib.gis.db import models as gis_models
from django.contrib.postgres.fields import ArrayField
from django.core.exceptions import ValidationError
from django.db import models

from accounts.managers import UserManager


class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    objects = UserManager()


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    timezone = models.CharField(max_length=64, default="UTC")
    location = gis_models.PointField(geography=True, srid=4326, null=True, blank=True)
    travel_radius_meters = models.PositiveIntegerField(null=True, blank=True)
    participation_modes = ArrayField(
        models.CharField(max_length=16), default=list, blank=True
    )
    interest_codes = ArrayField(models.CharField(max_length=64), default=list, blank=True)

    def __str__(self) -> str:
        return f"Preferences for {self.user.email}"

    def clean(self) -> None:
        super().clean()
        try:
            ZoneInfo(self.timezone)
        except ZoneInfoNotFoundError as exc:
            raise ValidationError({"timezone": "Use a valid IANA timezone"}) from exc
