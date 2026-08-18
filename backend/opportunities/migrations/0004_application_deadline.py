from django.db import migrations, models
from django.db.models import F, Q


class Migration(migrations.Migration):
    dependencies = [
        ("opportunities", "0003_event_format_classification"),
    ]

    operations = [
        migrations.AlterField(
            model_name="opportunity",
            name="starts_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="opportunity",
            name="ends_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="opportunity",
            name="application_deadline_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.RemoveConstraint(
            model_name="opportunity",
            name="opportunity_end_not_before_start",
        ),
        migrations.RemoveConstraint(
            model_name="opportunity",
            name="opportunity_event_format_matches_kind",
        ),
        migrations.AddConstraint(
            model_name="opportunity",
            constraint=models.CheckConstraint(
                condition=(
                    Q(starts_at__isnull=True, ends_at__isnull=True)
                    | Q(
                        starts_at__isnull=False,
                        ends_at__isnull=False,
                        ends_at__gte=F("starts_at"),
                    )
                ),
                name="opportunity_end_not_before_start",
            ),
        ),
        migrations.AddConstraint(
            model_name="opportunity",
            constraint=models.CheckConstraint(
                condition=(
                    Q(
                        kind="EVENT",
                        event_format__isnull=False,
                        starts_at__isnull=False,
                        ends_at__isnull=False,
                    )
                    | (
                        ~Q(kind="EVENT")
                        & Q(event_format__isnull=True)
                        & Q(event_format_classification__isnull=True)
                    )
                ),
                name="opportunity_event_format_matches_kind",
            ),
        ),
        migrations.AddIndex(
            model_name="opportunity",
            index=models.Index(
                fields=["status", "application_deadline_at"],
                name="opportunity_deadline_idx",
            ),
        ),
    ]
