import django.db.models.deletion
from django.db import migrations, models
from django.db.models import Q


class Migration(migrations.Migration):
    dependencies = [
        ("ingestion", "0004_classification_result"),
        ("opportunities", "0002_event_format"),
    ]

    operations = [
        migrations.AddField(
            model_name="opportunity",
            name="event_format_classification",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="opportunities",
                to="ingestion.classificationresult",
            ),
        ),
        migrations.RemoveConstraint(
            model_name="opportunity",
            name="opportunity_event_format_matches_kind",
        ),
        migrations.AddConstraint(
            model_name="opportunity",
            constraint=models.CheckConstraint(
                condition=(
                    Q(kind="EVENT", event_format__isnull=False)
                    | (
                        ~Q(kind="EVENT")
                        & Q(event_format__isnull=True)
                        & Q(event_format_classification__isnull=True)
                    )
                ),
                name="opportunity_event_format_matches_kind",
            ),
        ),
    ]
