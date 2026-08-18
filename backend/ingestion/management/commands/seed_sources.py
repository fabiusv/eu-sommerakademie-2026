from copy import deepcopy

from django.core.management.base import BaseCommand

from ingestion.models import Source
from ingestion.source_defaults import DEFAULT_SOURCES


class Command(BaseCommand):
    help = "Create missing source rows without overwriting database configuration"

    def handle(self, *args, **options):
        for definition in DEFAULT_SOURCES:
            values = deepcopy(definition)
            adapter_key = values.pop("adapter_key")
            source, created = Source.objects.get_or_create(
                adapter_key=adapter_key,
                defaults=values,
            )
            action = "Created" if created else "Kept existing"
            self.stdout.write(self.style.SUCCESS(f"{action} source {source.adapter_key}"))
