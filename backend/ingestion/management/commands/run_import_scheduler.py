from __future__ import annotations

import signal
import threading
import time

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Poll for database-configured sources whose sync interval is due"

    def add_arguments(self, parser):
        parser.add_argument(
            "--poll-seconds",
            type=int,
            default=settings.IMPORT_SCHEDULER_POLL_SECONDS,
        )
        parser.add_argument(
            "--max-cycles",
            type=int,
            default=None,
            help="Stop after this many cycles; intended for verification",
        )

    def handle(self, *args, **options):
        poll_seconds = options["poll_seconds"]
        max_cycles = options["max_cycles"]
        if poll_seconds < 1:
            raise CommandError("poll-seconds must be positive")
        if max_cycles is not None and max_cycles < 1:
            raise CommandError("max-cycles must be positive")

        stop_event = threading.Event()
        watched_signals = (signal.SIGINT, signal.SIGTERM)
        previous_handlers = {value: signal.getsignal(value) for value in watched_signals}

        def request_stop(signum, _frame):
            self.stdout.write(
                f"Received {signal.Signals(signum).name}; stopping after the current poll"
            )
            stop_event.set()

        for value in watched_signals:
            signal.signal(value, request_stop)

        try:
            cycle = 0
            next_run = time.monotonic()
            while not stop_event.is_set() and (max_cycles is None or cycle < max_cycles):
                self.stdout.write(f"Starting scheduler poll {cycle + 1}")
                try:
                    call_command(
                        "sync_opportunities",
                        due_only=True,
                        stdout=self.stdout,
                        stderr=self.stderr,
                    )
                except CommandError as exc:
                    self.stderr.write(self.style.ERROR(f"Scheduled import failed: {exc}"))

                cycle += 1
                if stop_event.is_set() or (max_cycles is not None and cycle >= max_cycles):
                    break

                next_run += poll_seconds
                delay = max(0.0, next_run - time.monotonic())
                self.stdout.write(f"Next scheduler poll in {delay:.0f} seconds")
                stop_event.wait(delay)
        finally:
            for value, handler in previous_handlers.items():
                signal.signal(value, handler)
