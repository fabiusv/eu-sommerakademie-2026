from datetime import timedelta
from io import StringIO
from types import SimpleNamespace

import pytest
from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.core.management.base import CommandError
from django.utils import timezone

from ingestion.models import ImportRun, ImportRunStatus, Source
from ingestion.services import RunSourceImport

pytestmark = pytest.mark.django_db


def test_seed_sources_creates_defaults_without_overwriting_database_edits():
    call_command("seed_sources", stdout=StringIO())
    source = Source.objects.get(adapter_key="eu_youth_events.v1")
    assert source.configuration == {
        "api_base_url": "https://youth.europa.eu/api/rest/eyp/v1",
        "search_path": "search_en",
        "portal_base_url": "https://youth.europa.eu",
    }
    eurodesk = Source.objects.get(adapter_key="eurodesk_learning.v1")
    assert eurodesk.enabled is True
    assert eurodesk.configuration["page_url"] == "https://programmes.eurodesk.eu/learning"
    assert eurodesk.attribution_name == "Eurodesk"
    assert eurodesk.attribution_text == "Source: Eurodesk"
    assert eurodesk.attribution_url == "https://programmes.eurodesk.eu/learning"

    source.configuration["search_path"] = "operator/selected/path"
    source.attribution_text = "Operator-approved attribution"
    source.save(update_fields=("configuration", "attribution_text", "updated_at"))

    call_command("seed_sources", stdout=StringIO())
    source.refresh_from_db()
    assert source.configuration["search_path"] == "operator/selected/path"
    assert source.attribution_text == "Operator-approved attribution"


def test_sync_command_loops_over_enabled_source_rows_in_order(monkeypatch):
    first = Source.objects.create(
        name="First",
        adapter_key="first.v1",
        configuration={},
        sync_interval=timedelta(hours=6),
        attribution_name="First",
        attribution_text="First",
        attribution_url="https://first.example.test",
    )
    Source.objects.create(
        name="Disabled",
        adapter_key="disabled.v1",
        configuration={},
        sync_interval=timedelta(hours=6),
        enabled=False,
        attribution_name="Disabled",
        attribution_text="Disabled",
        attribution_url="https://disabled.example.test",
    )
    second = Source.objects.create(
        name="Second",
        adapter_key="second.v1",
        configuration={},
        sync_interval=timedelta(hours=6),
        attribution_name="Second",
        attribution_text="Second",
        attribution_url="https://second.example.test",
    )
    imported = []

    class FakeRunSourceImport:
        def __init__(self, source):
            imported.append(source.pk)

        def execute(self):
            run = SimpleNamespace(status="SUCCEEDED", records_received=0)
            return SimpleNamespace(run=run)

    monkeypatch.setattr(
        "ingestion.management.commands.sync_opportunities.RunSourceImport",
        FakeRunSourceImport,
    )
    call_command("sync_opportunities", stdout=StringIO())

    assert imported == [first.pk, second.pk]


def test_invalid_source_configuration_is_rejected_and_records_failed_import(source):
    source.configuration = {}
    with pytest.raises(ValidationError):
        source.full_clean()
    source.save(update_fields=("configuration", "updated_at"))

    with pytest.raises(ValueError, match="Invalid source configuration"):
        RunSourceImport(source, geocoder=False).execute()

    assert source.import_runs.latest("started_at").status == ImportRunStatus.FAILED


def test_source_sync_interval_must_be_positive(source):
    source.sync_interval = timedelta(0)

    with pytest.raises(ValidationError):
        source.full_clean()


def test_scheduler_runs_immediately_and_repeats_on_interval(monkeypatch):
    import ingestion.management.commands.run_import_scheduler as scheduler_module

    calls = []
    sleeps = []

    class FakeEvent:
        def __init__(self):
            self.stopped = False

        def is_set(self):
            return self.stopped

        def set(self):
            self.stopped = True

        def wait(self, delay):
            sleeps.append(delay)
            return self.stopped

    monkeypatch.setattr(
        scheduler_module,
        "call_command",
        lambda name, **kwargs: calls.append((name, kwargs.get("due_only"))),
    )
    monkeypatch.setattr(scheduler_module.time, "monotonic", lambda: 0.0)
    monkeypatch.setattr(scheduler_module.threading, "Event", FakeEvent)

    call_command(
        "run_import_scheduler",
        poll_seconds=10,
        max_cycles=2,
        stdout=StringIO(),
    )

    assert calls == [
        ("sync_opportunities", True),
        ("sync_opportunities", True),
    ]
    assert sleeps == [10.0]


def test_due_only_sync_respects_source_interval_and_latest_attempt(source, monkeypatch):
    imported = []

    class FakeRunSourceImport:
        def __init__(self, configured_source):
            imported.append(configured_source.pk)

        def execute(self):
            run = SimpleNamespace(status="SUCCEEDED", records_received=0)
            return SimpleNamespace(run=run)

    monkeypatch.setattr(
        "ingestion.management.commands.sync_opportunities.RunSourceImport",
        FakeRunSourceImport,
    )
    source.last_success_at = timezone.now()
    source.save(update_fields=("last_success_at", "updated_at"))
    call_command("sync_opportunities", due_only=True, stdout=StringIO())
    assert imported == []

    source.last_success_at = timezone.now() - timedelta(hours=7)
    source.save(update_fields=("last_success_at", "updated_at"))
    call_command("sync_opportunities", due_only=True, stdout=StringIO())
    assert imported == [source.pk]

    imported.clear()
    ImportRun.objects.create(
        source=source,
        status=ImportRunStatus.FAILED,
        started_at=timezone.now(),
        finished_at=timezone.now(),
        error_summary="temporary failure",
    )
    call_command("sync_opportunities", due_only=True, stdout=StringIO())
    assert imported == []


def test_import_health_requires_recent_success(source):
    with pytest.raises(CommandError, match="without a recent successful import"):
        call_command("check_import_health", grace_seconds=60, stdout=StringIO())

    source.last_success_at = timezone.now()
    source.save(update_fields=("last_success_at", "updated_at"))
    call_command("check_import_health", grace_seconds=60, stdout=StringIO())

    source.last_success_at = timezone.now() - source.sync_interval - timedelta(seconds=61)
    source.save(update_fields=("last_success_at", "updated_at"))
    with pytest.raises(CommandError, match=source.adapter_key):
        call_command("check_import_health", grace_seconds=60, stdout=StringIO())
