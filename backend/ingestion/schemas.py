from datetime import datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, model_validator

from opportunities.models import (
    ActionKind,
    OpportunityKind,
    ParticipationMode,
    TemporalPrecision,
)


class OpportunityCandidate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    external_id: str = Field(min_length=1, max_length=255)
    source_entity_id: str | None = Field(default=None, min_length=1, max_length=255)
    kind: OpportunityKind
    kind_classification_id: int | None = None
    title: str = Field(min_length=1, max_length=500)
    summary: str = ""
    description: str = ""
    language: str = Field(min_length=1, max_length=16)
    organizer_name: str | None = Field(default=None, max_length=255)
    starts_at: datetime | None = None
    starts_at_precision: TemporalPrecision = TemporalPrecision.UNKNOWN
    ends_at: datetime | None = None
    application_deadline_at: datetime | None = None
    application_deadline_at_precision: TemporalPrecision = TemporalPrecision.UNKNOWN
    temporal_timezone: str = Field(default="UTC", min_length=1, max_length=64)
    participation_mode: ParticipationMode
    country_code: str | None = Field(default=None, min_length=2, max_length=2)
    city: str | None = Field(default=None, max_length=255)
    address: str | None = None
    action_kind: ActionKind
    action_url: HttpUrl = Field(max_length=1000)
    source_url: HttpUrl = Field(max_length=1000)
    image_url: HttpUrl | None = Field(default=None, max_length=1000)
    source_updated_at: datetime | None = None
    raw_payload: dict[str, object]

    @model_validator(mode="after")
    def valid_time_window(self):
        if (self.starts_at is None) != (self.ends_at is None):
            raise ValueError("starts_at and ends_at must be supplied together")
        timestamps = (self.starts_at, self.ends_at, self.application_deadline_at)
        if any(value is not None and value.tzinfo is None for value in timestamps):
            raise ValueError("canonical timestamps must be timezone-aware")
        if self.starts_at is not None and self.ends_at < self.starts_at:
            raise ValueError("ends_at cannot be before starts_at")
        try:
            ZoneInfo(self.temporal_timezone)
        except ZoneInfoNotFoundError as exc:
            raise ValueError("temporal_timezone must be a valid IANA timezone") from exc
        if self.starts_at is None and self.starts_at_precision != TemporalPrecision.UNKNOWN:
            raise ValueError("starts_at_precision requires starts_at")
        if (
            self.application_deadline_at is None
            and self.application_deadline_at_precision != TemporalPrecision.UNKNOWN
        ):
            raise ValueError("application_deadline_at_precision requires application_deadline_at")
        return self
