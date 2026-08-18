from django.db import migrations, models

REMOVED_KINDS = ("CONSULTATION", "PETITION", "SURVEY", "ORGANIZATION")


def assign_initial_event_formats(apps, schema_editor):
    Opportunity = apps.get_model("opportunities", "Opportunity")
    Opportunity.objects.filter(kind="EVENT").update(event_format="OTHER_EVENT")
    Opportunity.objects.filter(kind__in=REMOVED_KINDS).update(
        kind="OTHER", event_format=None
    )


def clear_event_formats(apps, schema_editor):
    Opportunity = apps.get_model("opportunities", "Opportunity")
    Opportunity.objects.update(event_format=None)


class Migration(migrations.Migration):
    dependencies = [("opportunities", "0001_initial")]

    operations = [
        migrations.AddField(
            model_name="opportunity",
            name="event_format",
            field=models.CharField(
                blank=True,
                choices=[
                    ("DIALOGUE", "Dialogue"),
                    ("DEBATE", "Debate"),
                    ("TALK", "Talk"),
                    ("WORKSHOP", "Workshop"),
                    ("TRAINING", "Training"),
                    ("MEETUP", "Meetup"),
                    ("CONFERENCE", "Conference"),
                    ("INFO_SESSION", "Information session"),
                    ("CULTURAL_EVENT", "Cultural event"),
                    ("COMPETITION", "Competition"),
                    ("CEREMONY", "Ceremony"),
                    ("OTHER_EVENT", "Other event"),
                ],
                max_length=24,
                null=True,
            ),
        ),
        migrations.RunPython(assign_initial_event_formats, clear_event_formats),
        migrations.AlterField(
            model_name="opportunity",
            name="kind",
            field=models.CharField(
                choices=[
                    ("EVENT", "Event"),
                    ("VOLUNTEERING", "Volunteering"),
                    ("OTHER", "Other"),
                ],
                max_length=24,
            ),
        ),
        migrations.AddConstraint(
            model_name="opportunity",
            constraint=models.CheckConstraint(
                condition=(
                    models.Q(("event_format__isnull", False), ("kind", "EVENT"))
                    | (
                        ~models.Q(("kind", "EVENT"))
                        & models.Q(("event_format__isnull", True))
                    )
                ),
                name="opportunity_event_format_matches_kind",
            ),
        ),
        migrations.AddIndex(
            model_name="opportunity",
            index=models.Index(
                fields=["event_format"], name="opportunity_event_format_idx"
            ),
        ),
    ]
