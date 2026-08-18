from django.contrib.gis.db import models as gis_models
from django.contrib.postgres.indexes import GistIndex, OpClass
from django.db import models
from django.db.models import Q


class OpportunityKind(models.TextChoices):
    DIALOGUE = "DIALOGUE", "Dialogue"
    DEBATE = "DEBATE", "Debate"
    TALK = "TALK", "Talk"
    WORKSHOP = "WORKSHOP", "Workshop"
    TRAINING = "TRAINING", "Training"
    MEETUP = "MEETUP", "Meetup"
    CONFERENCE = "CONFERENCE", "Conference"
    INFO_SESSION = "INFO_SESSION", "Information session"
    CULTURAL_EVENT = "CULTURAL_EVENT", "Cultural event"
    COMPETITION = "COMPETITION", "Competition"
    CEREMONY = "CEREMONY", "Ceremony"
    RECRUITMENT = "RECRUITMENT", "Recruitment"
    PROGRAMME = "PROGRAMME", "Programme"
    VOLUNTEERING = "VOLUNTEERING", "Volunteering"
    SCHOLARSHIP = "SCHOLARSHIP", "Scholarship"
    GRANT = "GRANT", "Grant"
    EXCHANGE = "EXCHANGE", "Exchange"
    OTHER = "OTHER", "Other"


class ParticipationMode(models.TextChoices):
    IN_PERSON = "IN_PERSON", "In person"
    ONLINE = "ONLINE", "Online"
    HYBRID = "HYBRID", "Hybrid"
    UNSPECIFIED = "UNSPECIFIED", "Unspecified"


class ActionKind(models.TextChoices):
    REGISTER = "REGISTER", "Register"
    APPLY = "APPLY", "Apply"
    SIGN = "SIGN", "Sign"
    RESPOND = "RESPOND", "Respond"
    JOIN = "JOIN", "Join"
    LEARN_MORE = "LEARN_MORE", "Learn more"


class PublicationStatus(models.TextChoices):
    PUBLISHED = "PUBLISHED", "Published"
    WITHDRAWN = "WITHDRAWN", "Withdrawn"


class GeocodingStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    SUCCEEDED = "SUCCEEDED", "Succeeded"
    NO_MATCH = "NO_MATCH", "No match"
    RETRYABLE_FAILURE = "RETRYABLE_FAILURE", "Retryable failure"


class TemporalPrecision(models.TextChoices):
    UNKNOWN = "UNKNOWN", "Unknown"
    DATE = "DATE", "Date only"
    DATETIME = "DATETIME", "Date and time"


class DuplicateStatus(models.TextChoices):
    NOT_CHECKED = "NOT_CHECKED", "Not checked"
    UNIQUE = "UNIQUE", "No duplicate found"
    DUPLICATE = "DUPLICATE", "Linked duplicate"
    UNCERTAIN = "UNCERTAIN", "Published uncertain match"


class DuplicateDecisionOutcome(models.TextChoices):
    DISTINCT = "DISTINCT", "Distinct"
    MATCHED = "MATCHED", "Matched"
    UNCERTAIN = "UNCERTAIN", "Uncertain"


class Opportunity(models.Model):
    source = models.ForeignKey(
        "ingestion.Source", on_delete=models.PROTECT, related_name="opportunities"
    )
    external_id = models.CharField(max_length=255)
    source_entity_id = models.CharField(max_length=255, null=True, blank=True)
    kind = models.CharField(max_length=24, choices=OpportunityKind.choices)
    kind_classification = models.ForeignKey(
        "ingestion.ClassificationResult",
        on_delete=models.SET_NULL,
        related_name="opportunities",
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=500)
    summary = models.TextField(blank=True)
    description = models.TextField(blank=True)
    language = models.CharField(max_length=16)
    organizer_name = models.CharField(max_length=255, null=True, blank=True)
    starts_at = models.DateTimeField(null=True, blank=True)
    starts_at_precision = models.CharField(
        max_length=16,
        choices=TemporalPrecision.choices,
        default=TemporalPrecision.UNKNOWN,
    )
    ends_at = models.DateTimeField(null=True, blank=True)
    application_deadline_at = models.DateTimeField(null=True, blank=True)
    application_deadline_at_precision = models.CharField(
        max_length=16,
        choices=TemporalPrecision.choices,
        default=TemporalPrecision.UNKNOWN,
    )
    temporal_timezone = models.CharField(max_length=64, default="UTC")
    participation_mode = models.CharField(max_length=16, choices=ParticipationMode.choices)
    country_code = models.CharField(max_length=2, null=True, blank=True)
    city = models.CharField(max_length=255, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    location = gis_models.PointField(geography=True, srid=4326, null=True, blank=True)
    action_kind = models.CharField(max_length=20, choices=ActionKind.choices)
    action_url = models.URLField(max_length=1000)
    source_url = models.URLField(max_length=1000)
    source_url_hash = models.CharField(max_length=64, blank=True, db_index=True)
    action_url_hash = models.CharField(max_length=64, blank=True, db_index=True)
    image_url = models.URLField(max_length=1000, null=True, blank=True)
    status = models.CharField(
        max_length=16, choices=PublicationStatus.choices, default=PublicationStatus.PUBLISHED
    )
    source_updated_at = models.DateTimeField(null=True, blank=True)
    last_seen_at = models.DateTimeField()
    consecutive_missing_syncs = models.PositiveSmallIntegerField(default=0)
    geocoding_provider = models.CharField(max_length=64, blank=True)
    geocoding_input_hash = models.CharField(max_length=64, blank=True)
    geocoding_status = models.CharField(
        max_length=24, choices=GeocodingStatus.choices, default=GeocodingStatus.PENDING
    )
    geocoding_metadata = models.JSONField(default=dict, blank=True)
    geocoding_last_attempt_at = models.DateTimeField(null=True, blank=True)
    geocoded_at = models.DateTimeField(null=True, blank=True)
    deduplication_embedding = models.ForeignKey(
        "ingestion.EmbeddingResult",
        on_delete=models.SET_NULL,
        related_name="opportunities",
        null=True,
        blank=True,
    )
    duplicate_of = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        related_name="duplicate_records",
        null=True,
        blank=True,
    )
    duplicate_status = models.CharField(
        max_length=16,
        choices=DuplicateStatus.choices,
        default=DuplicateStatus.NOT_CHECKED,
    )
    duplicate_algorithm_version = models.CharField(max_length=100, blank=True)
    duplicate_input_hash = models.CharField(max_length=64, blank=True)
    duplicate_checked_at = models.DateTimeField(null=True, blank=True)
    raw_payload = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("source", "external_id"), name="unique_source_external_id"
            ),
            models.CheckConstraint(
                condition=(
                    Q(starts_at__isnull=True, ends_at__isnull=True)
                    | Q(
                        starts_at__isnull=False,
                        ends_at__isnull=False,
                        ends_at__gte=models.F("starts_at"),
                    )
                ),
                name="opportunity_end_not_before_start",
            ),
            models.CheckConstraint(
                condition=~Q(pk=models.F("duplicate_of")),
                name="opportunity_not_duplicate_of_self",
            ),
        ]
        indexes = [
            models.Index(fields=("status", "starts_at", "ends_at")),
            models.Index(
                fields=("status", "application_deadline_at"),
                name="opportunity_deadline_idx",
            ),
            models.Index(fields=("country_code",)),
            models.Index(fields=("language",)),
            models.Index(fields=("participation_mode",)),
            models.Index(fields=("kind",), name="opportunity_kind_idx"),
            models.Index(fields=("action_kind",), name="opportunity_action_idx"),
            GistIndex(fields=("location",), name="opportunity_location_gist"),
            GistIndex(
                OpClass("title", name="gist_trgm_ops"),
                name="opportunity_title_trgm",
            ),
            models.Index(
                fields=("status", "duplicate_of"),
                name="opportunity_public_idx",
            ),
            models.Index(
                fields=("source", "source_entity_id"),
                name="opportunity_source_entity_idx",
            ),
        ]

    def __str__(self) -> str:
        return self.title

    @property
    def canonical_opportunity(self) -> "Opportunity":
        return self.duplicate_of or self


class DuplicateDecision(models.Model):
    opportunity = models.ForeignKey(
        Opportunity,
        on_delete=models.CASCADE,
        related_name="duplicate_decisions",
    )
    matched_opportunity = models.ForeignKey(
        Opportunity,
        on_delete=models.SET_NULL,
        related_name="incoming_duplicate_decisions",
        null=True,
        blank=True,
    )
    algorithm_version = models.CharField(max_length=100)
    outcome = models.CharField(max_length=16, choices=DuplicateDecisionOutcome.choices)
    score = models.FloatField(null=True, blank=True)
    evidence_coverage = models.FloatField(default=0)
    features = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(
                fields=("outcome", "created_at"),
                name="duplicate_decision_outcome_idx",
            )
        ]

    def __str__(self) -> str:
        return f"{self.opportunity_id}:{self.outcome}@{self.algorithm_version}"
