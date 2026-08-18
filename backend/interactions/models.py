from django.conf import settings
from django.db import models


class Bookmark(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    opportunity = models.ForeignKey(
        "opportunities.Opportunity", on_delete=models.CASCADE, related_name="bookmarks"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("user", "opportunity"), name="unique_user_opportunity_bookmark"
            )
        ]
        ordering = ("-created_at",)


class InteractionType(models.TextChoices):
    IMPRESSION = "IMPRESSION", "Impression"
    OPEN = "OPEN", "Open"
    SAVE = "SAVE", "Save"
    UNSAVE = "UNSAVE", "Unsave"
    EXTERNAL_ACTION_CLICK = "EXTERNAL_ACTION_CLICK", "External action click"


class Interaction(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
    )
    opportunity = models.ForeignKey(
        "opportunities.Opportunity", on_delete=models.CASCADE, related_name="interactions"
    )
    interaction_type = models.CharField(max_length=32, choices=InteractionType.choices)
    occurred_at = models.DateTimeField()
    context = models.JSONField(default=dict, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=("opportunity", "interaction_type", "occurred_at")),
            models.Index(fields=("user", "occurred_at")),
        ]
