from django.contrib import admin

from ingestion.models import ClassificationResult, EmbeddingResult, ImportRun, Source


@admin.register(Source)
class SourceAdmin(admin.ModelAdmin):
    list_display = ("name", "adapter_key", "enabled", "sync_interval", "last_success_at")
    list_filter = ("enabled",)
    search_fields = ("name", "adapter_key")
    readonly_fields = ("created_at", "updated_at", "last_success_at")


@admin.register(ImportRun)
class ImportRunAdmin(admin.ModelAdmin):
    list_display = (
        "source",
        "status",
        "started_at",
        "finished_at",
        "records_received",
        "opportunities_created",
        "opportunities_updated",
        "classifications_succeeded",
        "classifications_cached",
        "classifications_failed",
    )
    list_filter = ("source", "status")
    readonly_fields = tuple(field.name for field in ImportRun._meta.fields)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(ClassificationResult)
class ClassificationResultAdmin(admin.ModelAdmin):
    list_display = (
        "classifier_key",
        "classifier_version",
        "provider_key",
        "model_key",
        "created_at",
    )
    list_filter = ("classifier_key", "classifier_version", "provider_key", "model_key")
    search_fields = ("input_hash", "provider_response_id")
    readonly_fields = tuple(field.name for field in ClassificationResult._meta.fields)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(EmbeddingResult)
class EmbeddingResultAdmin(admin.ModelAdmin):
    list_display = (
        "embedder_key",
        "embedder_version",
        "provider_key",
        "model_key",
        "dimensions",
        "created_at",
    )
    list_filter = ("embedder_key", "embedder_version", "provider_key", "model_key")
    search_fields = ("input_hash", "provider_response_id")
    readonly_fields = tuple(field.name for field in EmbeddingResult._meta.fields)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
