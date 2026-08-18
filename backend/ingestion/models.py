from datetime import timedelta

from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q
from pgvector.django import VectorField


class Source(models.Model):
    name = models.CharField(max_length=255)
    adapter_key = models.CharField(max_length=100, unique=True)
    configuration = models.JSONField(default=dict, blank=True)
    sync_interval = models.DurationField()
    enabled = models.BooleanField(default=True)
    attribution_name = models.CharField(max_length=255)
    attribution_text = models.TextField()
    attribution_url = models.URLField(max_length=1000)
    last_success_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=Q(sync_interval__gt=timedelta(0)),
                name="source_sync_interval_positive",
            )
        ]

    def __str__(self) -> str:
        return self.name

    def clean(self):
        super().clean()
        from ingestion.adapters import get_adapter

        try:
            adapter_class = get_adapter(self.adapter_key)
            adapter_class.validate_configuration(self.configuration)
        except ValueError as exc:
            field = "adapter_key" if "Unknown source adapter" in str(exc) else "configuration"
            raise ValidationError({field: str(exc)}) from exc


class ClassificationResult(models.Model):
    classifier_key = models.CharField(max_length=100)
    classifier_version = models.CharField(max_length=100)
    input_hash = models.CharField(max_length=64)
    provider_key = models.CharField(max_length=64)
    model_key = models.CharField(max_length=100)
    provider_response_id = models.CharField(max_length=255, blank=True)
    output = models.JSONField()
    input_tokens = models.PositiveIntegerField(default=0)
    output_tokens = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("classifier_key", "classifier_version", "input_hash"),
                name="unique_classifier_version_input",
            )
        ]
        indexes = [
            models.Index(
                fields=("classifier_key", "classifier_version", "input_hash"),
                name="classification_cache_idx",
            )
        ]

    def __str__(self) -> str:
        return f"{self.classifier_key}@{self.classifier_version}:{self.input_hash[:12]}"


class EmbeddingResult(models.Model):
    """Versioned, content-addressed embedding shared by matching records."""

    embedder_key = models.CharField(max_length=100)
    embedder_version = models.CharField(max_length=100)
    input_hash = models.CharField(max_length=64)
    provider_key = models.CharField(max_length=64)
    model_key = models.CharField(max_length=100)
    provider_response_id = models.CharField(max_length=255, blank=True)
    dimensions = models.PositiveIntegerField()
    embedding = VectorField()
    input_tokens = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=(
                    "embedder_key",
                    "embedder_version",
                    "provider_key",
                    "model_key",
                    "input_hash",
                ),
                name="unique_embedding_version_input",
            )
        ]
        indexes = [
            models.Index(
                fields=(
                    "embedder_key",
                    "embedder_version",
                    "provider_key",
                    "model_key",
                    "input_hash",
                ),
                name="embedding_cache_idx",
            )
        ]

    def __str__(self) -> str:
        return f"{self.embedder_key}@{self.embedder_version}:{self.input_hash[:12]}"


class ImportRunStatus(models.TextChoices):
    RUNNING = "RUNNING", "Running"
    SUCCEEDED = "SUCCEEDED", "Succeeded"
    FAILED = "FAILED", "Failed"
    SKIPPED = "SKIPPED", "Skipped"


class ImportRun(models.Model):
    source = models.ForeignKey(Source, on_delete=models.PROTECT, related_name="import_runs")
    status = models.CharField(
        max_length=16, choices=ImportRunStatus.choices, default=ImportRunStatus.RUNNING
    )
    started_at = models.DateTimeField()
    finished_at = models.DateTimeField(null=True, blank=True)
    records_received = models.PositiveIntegerField(default=0)
    opportunities_created = models.PositiveIntegerField(default=0)
    opportunities_updated = models.PositiveIntegerField(default=0)
    records_unchanged = models.PositiveIntegerField(default=0)
    records_ignored = models.PositiveIntegerField(default=0)
    records_rejected = models.PositiveIntegerField(default=0)
    records_missing = models.PositiveIntegerField(default=0)
    classifications_succeeded = models.PositiveIntegerField(default=0)
    classifications_cached = models.PositiveIntegerField(default=0)
    classifications_failed = models.PositiveIntegerField(default=0)
    embeddings_succeeded = models.PositiveIntegerField(default=0)
    embeddings_cached = models.PositiveIntegerField(default=0)
    embeddings_failed = models.PositiveIntegerField(default=0)
    duplicates_linked = models.PositiveIntegerField(default=0)
    duplicates_uncertain = models.PositiveIntegerField(default=0)
    geocoding_succeeded = models.PositiveIntegerField(default=0)
    geocoding_no_match = models.PositiveIntegerField(default=0)
    geocoding_failed = models.PositiveIntegerField(default=0)
    error_summary = models.TextField(blank=True)

    class Meta:
        ordering = ("-started_at",)

    def __str__(self) -> str:
        return f"{self.source.name}: {self.status} at {self.started_at.isoformat()}"
