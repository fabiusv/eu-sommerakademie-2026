from django.db import migrations, models

FLAT_KINDS = (
    "DIALOGUE",
    "DEBATE",
    "TALK",
    "WORKSHOP",
    "TRAINING",
    "MEETUP",
    "CONFERENCE",
    "INFO_SESSION",
    "CULTURAL_EVENT",
    "COMPETITION",
    "CEREMONY",
)


def flatten_kinds(apps, schema_editor):
    Opportunity = apps.get_model("opportunities", "Opportunity")
    for kind in FLAT_KINDS:
        Opportunity.objects.filter(kind="EVENT", event_format=kind).update(
            kind=kind,
            kind_classification=None,
        )
    Opportunity.objects.filter(kind="EVENT").update(
        kind="OTHER",
        kind_classification=None,
    )


def restore_event_dimension(apps, schema_editor):
    Opportunity = apps.get_model("opportunities", "Opportunity")
    for kind in FLAT_KINDS:
        Opportunity.objects.filter(kind=kind).update(
            kind="EVENT",
            event_format=kind,
            kind_classification=None,
        )
    Opportunity.objects.exclude(kind__in=("EVENT", "VOLUNTEERING", "OTHER")).update(
        kind="OTHER",
        event_format=None,
        kind_classification=None,
    )
    Opportunity.objects.filter(kind="OTHER").update(event_format=None)


class Migration(migrations.Migration):
    dependencies = [
        ("opportunities", "0004_application_deadline"),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name="opportunity",
            name="opportunity_event_format_matches_kind",
        ),
        migrations.RenameField(
            model_name="opportunity",
            old_name="event_format_classification",
            new_name="kind_classification",
        ),
        migrations.RunPython(flatten_kinds, restore_event_dimension),
        migrations.RemoveIndex(
            model_name="opportunity",
            name="opportunity_event_format_idx",
        ),
        migrations.RemoveField(
            model_name="opportunity",
            name="event_format",
        ),
        migrations.AlterField(
            model_name="opportunity",
            name="kind",
            field=models.CharField(
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
                    ("RECRUITMENT", "Recruitment"),
                    ("PROGRAMME", "Programme"),
                    ("VOLUNTEERING", "Volunteering"),
                    ("SCHOLARSHIP", "Scholarship"),
                    ("GRANT", "Grant"),
                    ("EXCHANGE", "Exchange"),
                    ("OTHER", "Other"),
                ],
                max_length=24,
            ),
        ),
        migrations.AddIndex(
            model_name="opportunity",
            index=models.Index(fields=["kind"], name="opportunity_kind_idx"),
        ),
        migrations.AddIndex(
            model_name="opportunity",
            index=models.Index(fields=["action_kind"], name="opportunity_action_idx"),
        ),
    ]
