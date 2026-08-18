from django.contrib import admin

from opportunities.models import DuplicateDecision, Opportunity


@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "source",
        "kind",
        "language",
        "starts_at",
        "status",
        "duplicate_status",
        "geocoding_status",
    )
    list_filter = (
        "source",
        "status",
        "kind",
        "language",
        "participation_mode",
        "duplicate_status",
    )
    search_fields = ("title", "external_id", "city", "organizer_name")
    readonly_fields = tuple(field.name for field in Opportunity._meta.fields)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(DuplicateDecision)
class DuplicateDecisionAdmin(admin.ModelAdmin):
    list_display = (
        "opportunity",
        "outcome",
        "matched_opportunity",
        "score",
        "evidence_coverage",
        "algorithm_version",
        "created_at",
    )
    list_filter = ("outcome", "algorithm_version")
    search_fields = ("opportunity__title", "matched_opportunity__title")
    readonly_fields = tuple(field.name for field in DuplicateDecision._meta.fields)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
