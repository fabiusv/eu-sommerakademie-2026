from django.core.management.base import BaseCommand, CommandError
from django.db.models import DateTimeField, OuterRef, Subquery
from django.utils import timezone

from ingestion.models import ImportRun, Source
from ingestion.services import RunSourceImport


class Command(BaseCommand):
    help = "Synchronize all enabled opportunity sources or one adapter key"

    def add_arguments(self, parser):
        parser.add_argument("--source", dest="source_key")
        parser.add_argument(
            "--due-only",
            action="store_true",
            help="Import only sources whose database sync interval has elapsed",
        )

    def handle(self, *args, **options):
        latest_attempt = (
            ImportRun.objects.filter(source=OuterRef("pk"))
            .order_by("-started_at")
            .values("started_at")[:1]
        )
        sources = (
            Source.objects.filter(enabled=True)
            .annotate(
                latest_attempt_at=Subquery(latest_attempt, output_field=DateTimeField())
            )
            .order_by("pk")
        )
        if options["source_key"]:
            sources = sources.filter(adapter_key=options["source_key"])
        configured_sources = list(sources)
        if not configured_sources:
            raise CommandError("No matching enabled source is configured; run seed_sources first")
        if options["due_only"]:
            now = timezone.now()
            configured_sources = [
                source for source in configured_sources if source_is_due(source, now)
            ]
            if not configured_sources:
                self.stdout.write("No enabled sources are due")
                return
        failures = []
        for source in configured_sources:
            try:
                outcome = RunSourceImport(source).execute()
                self.stdout.write(
                    self.style.SUCCESS(
                        f"{source.adapter_key}: {outcome.run.status} "
                        f"({outcome.run.records_received} received)"
                    )
                )
            except Exception as exc:
                failures.append(f"{source.adapter_key}: {exc}")
        if failures:
            raise CommandError("; ".join(failures))


def source_is_due(source, now) -> bool:
    reference_times = [
        value
        for value in (source.last_success_at, source.latest_attempt_at)
        if value is not None
    ]
    if not reference_times:
        return True
    return now >= max(reference_times) + source.sync_interval
