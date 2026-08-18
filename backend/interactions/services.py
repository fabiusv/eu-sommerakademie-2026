from dataclasses import dataclass

from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from interactions.models import Bookmark, Interaction, InteractionType
from opportunities.models import Opportunity, PublicationStatus


@dataclass(frozen=True)
class CanonicalBookmark:
    bookmark: Bookmark
    opportunity: Opportunity


@dataclass(frozen=True)
class InteractionEvent:
    opportunity_id: int
    interaction_type: str
    context: dict[str, object]


def list_canonical_bookmarks(*, user) -> list[CanonicalBookmark]:
    queryset = Bookmark.objects.filter(user=user).select_related(
        "opportunity",
        "opportunity__source",
        "opportunity__duplicate_of",
        "opportunity__duplicate_of__source",
    )
    canonical_bookmarks: dict[int, CanonicalBookmark] = {}
    for bookmark in queryset:
        canonical = bookmark.opportunity.canonical_opportunity
        canonical_bookmarks.setdefault(
            canonical.pk,
            CanonicalBookmark(bookmark=bookmark, opportunity=canonical),
        )
    return list(canonical_bookmarks.values())


@transaction.atomic
def save_bookmark(*, user, opportunity: Opportunity) -> tuple[Bookmark, bool]:
    opportunity = opportunity.canonical_opportunity
    bookmark = Bookmark.objects.filter(user=user, opportunity=opportunity).first()
    if bookmark is None:
        bookmark = (
            Bookmark.objects.filter(
                user=user,
                opportunity__duplicate_of=opportunity,
            )
            .order_by("pk")
            .first()
        )
    if bookmark is None:
        bookmark, created = Bookmark.objects.get_or_create(user=user, opportunity=opportunity)
    else:
        created = False
        if bookmark.opportunity_id != opportunity.pk:
            bookmark.opportunity = opportunity
            bookmark.save(update_fields=("opportunity",))
    if created:
        Interaction.objects.create(
            user=user,
            opportunity=opportunity,
            interaction_type=InteractionType.SAVE,
            occurred_at=timezone.now(),
            context={},
        )
    return bookmark, created


@transaction.atomic
def remove_bookmark(*, user, opportunity: Opportunity) -> bool:
    opportunity = opportunity.canonical_opportunity
    deleted, _ = (
        Bookmark.objects.filter(user=user)
        .filter(Q(opportunity=opportunity) | Q(opportunity__duplicate_of=opportunity))
        .delete()
    )
    if deleted:
        Interaction.objects.create(
            user=user,
            opportunity=opportunity,
            interaction_type=InteractionType.UNSAVE,
            occurred_at=timezone.now(),
            context={},
        )
    return bool(deleted)


def record_interactions(
    *,
    user,
    events: list[InteractionEvent],
) -> int:
    opportunity_ids = {event.opportunity_id for event in events}
    opportunities = {
        opportunity.pk: opportunity
        for opportunity in Opportunity.objects.filter(
            pk__in=opportunity_ids,
            status=PublicationStatus.PUBLISHED,
            duplicate_of__isnull=True,
        )
    }
    missing = opportunity_ids - opportunities.keys()
    if missing:
        raise ValueError(f"unknown or unavailable opportunity IDs: {sorted(missing)}")
    occurred_at = timezone.now()
    Interaction.objects.bulk_create(
        [
            Interaction(
                user=user,
                opportunity=opportunities[event.opportunity_id],
                interaction_type=event.interaction_type,
                occurred_at=occurred_at,
                context=event.context,
            )
            for event in events
        ]
    )
    return len(events)
