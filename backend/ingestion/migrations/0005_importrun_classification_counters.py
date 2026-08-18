from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("ingestion", "0004_classification_result"),
    ]

    operations = [
        migrations.AddField(
            model_name="importrun",
            name="classifications_cached",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="importrun",
            name="classifications_failed",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="importrun",
            name="classifications_succeeded",
            field=models.PositiveIntegerField(default=0),
        ),
    ]
