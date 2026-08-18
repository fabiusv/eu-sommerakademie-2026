from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from ingestion.models import Source


class Command(BaseCommand):
    help = "Fail when an enabled source has no sufficiently recent successful import"

    def add_arguments(self, parser):
        parser.add_argument(
            "--grace-seconds",
            type=int,
            default=settings.IMPORT_HEALTH_GRACE_SECONDS,
        )

    def handle(self, *args, **options):
        grace_seconds = options["grace_seconds"]
        if grace_seconds < 1:
            raise CommandError("grace-seconds must be positive")

        sources = list(Source.objects.filter(enabled=True).order_by("pk"))
        if not sources:
            raise CommandError("No enabled sources are configured")

        now = timezone.now()
        grace = timedelta(seconds=grace_seconds)
        unhealthy = [
            source.adapter_key
            for source in sources
            if source.last_success_at is None
            or source.last_success_at < now - source.sync_interval - grace
        ]
        if unhealthy:
            raise CommandError(
                "Sources without a recent successful import: " + ", ".join(unhealthy)
            )

        self.stdout.write(self.style.SUCCESS(f"{len(sources)} source(s) healthy"))
