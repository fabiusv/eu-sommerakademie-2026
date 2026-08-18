from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("ingestion", "0003_source_sync_interval_positive"),
    ]

    operations = [
        migrations.CreateModel(
            name="ClassificationResult",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("classifier_key", models.CharField(max_length=100)),
                ("classifier_version", models.CharField(max_length=100)),
                ("input_hash", models.CharField(max_length=64)),
                ("provider_key", models.CharField(max_length=64)),
                ("model_key", models.CharField(max_length=100)),
                ("provider_response_id", models.CharField(blank=True, max_length=255)),
                ("output", models.JSONField()),
                ("input_tokens", models.PositiveIntegerField(default=0)),
                ("output_tokens", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.AddConstraint(
            model_name="classificationresult",
            constraint=models.UniqueConstraint(
                fields=("classifier_key", "classifier_version", "input_hash"),
                name="unique_classifier_version_input",
            ),
        ),
        migrations.AddIndex(
            model_name="classificationresult",
            index=models.Index(
                fields=["classifier_key", "classifier_version", "input_hash"],
                name="classification_cache_idx",
            ),
        ),
    ]
