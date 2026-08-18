from datetime import timedelta

from django.db import migrations, models
from django.db.models import Q


class Migration(migrations.Migration):
    dependencies = [
        ("ingestion", "0002_add_eu_youth_search_path"),
    ]

    operations = [
        migrations.AddConstraint(
            model_name="source",
            constraint=models.CheckConstraint(
                condition=Q(("sync_interval__gt", timedelta(0))),
                name="source_sync_interval_positive",
            ),
        ),
    ]
