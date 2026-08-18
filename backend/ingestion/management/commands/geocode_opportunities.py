from django.core.management.base import BaseCommand, CommandError

from ingestion.geocoding import configured_geocoder, enrich_opportunity
from opportunities.models import Opportunity, PublicationStatus


class Command(BaseCommand):
    help = "Geocode published opportunities that have usable venue data"

    def handle(self, *args, **options):
        geocoder = configured_geocoder()
        if geocoder is None:
            raise CommandError("No geocoder is configured; set OPENCAGE_API_KEY")
        attempted = 0
        for opportunity in Opportunity.objects.filter(status=PublicationStatus.PUBLISHED):
            if enrich_opportunity(opportunity, geocoder) is not None:
                attempted += 1
        self.stdout.write(self.style.SUCCESS(f"Geocoding attempts: {attempted}"))
