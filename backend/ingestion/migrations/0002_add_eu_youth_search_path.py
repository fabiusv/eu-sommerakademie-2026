from django.db import migrations


def add_eu_youth_search_path(apps, schema_editor):
    Source = apps.get_model("ingestion", "Source")
    for source in Source.objects.filter(adapter_key="eu_youth_events.v1"):
        configuration = dict(source.configuration or {})
        if "search_path" not in configuration:
            configuration["search_path"] = "search_en"
            source.configuration = configuration
            source.save(update_fields=("configuration",))


class Migration(migrations.Migration):
    dependencies = [("ingestion", "0001_initial")]

    operations = [migrations.RunPython(add_eu_youth_search_path, migrations.RunPython.noop)]
