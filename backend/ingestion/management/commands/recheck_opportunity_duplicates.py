from django.core.management.base import BaseCommand, CommandError
from django.db.models import Q

from opportunities.deduplication import DuplicateChecker, OpportunityDeduplicationEmbedder
from opportunities.deduplication.normalization import normalized_url_hash
from opportunities.models import DuplicateStatus, Opportunity, PublicationStatus


class Command(BaseCommand):
    help = "Embed and duplicate-check stored opportunities in stable identity order"

    def add_arguments(self, parser):
        parser.add_argument(
            "--all",
            action="store_true",
            help="Recheck records that already have a current decision",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=None,
            help="Maximum number of source records to process",
        )

    def handle(self, *args, **options):
        limit = options["limit"]
        if limit is not None and limit < 1:
            raise CommandError("limit must be positive")

        checker = DuplicateChecker()
        queryset = Opportunity.objects.filter(status=PublicationStatus.PUBLISHED).order_by("pk")
        if not options["all"]:
            queryset = queryset.filter(
                Q(duplicate_status=DuplicateStatus.NOT_CHECKED)
                | ~Q(duplicate_algorithm_version=checker.policy.algorithm_version)
            )
        opportunities = list(queryset[:limit] if limit else queryset)
        embedder = OpportunityDeduplicationEmbedder()
        embedded = embedder.embed_candidates(opportunities)

        matched = uncertain = distinct = 0
        for opportunity, embedded_opportunity in zip(opportunities, embedded.results, strict=True):
            embedding = embedded_opportunity.result
            opportunity.deduplication_embedding = embedding
            opportunity.source_url_hash = normalized_url_hash(opportunity.source_url)
            opportunity.action_url_hash = normalized_url_hash(opportunity.action_url)
            opportunity.save(
                update_fields=(
                    "deduplication_embedding",
                    "source_url_hash",
                    "action_url_hash",
                    "updated_at",
                )
            )
            result = checker.check_and_apply(opportunity)
            if result.outcome == "MATCHED":
                matched += 1
            elif result.outcome == "UNCERTAIN":
                uncertain += 1
            else:
                distinct += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Checked {len(opportunities)} records: {matched} linked, "
                f"{uncertain} uncertain/published, {distinct} distinct; "
                f"embeddings {embedded.succeeded} new, {embedded.cached} cached, "
                f"{embedded.failed} unavailable"
            )
        )
