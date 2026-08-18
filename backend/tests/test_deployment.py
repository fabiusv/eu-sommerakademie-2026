import runpy
from pathlib import Path

CONFIG = Path(__file__).parents[1] / "deployment" / "gunicorn.conf.py"


def test_gunicorn_uses_platform_port_when_bind_is_not_explicit(monkeypatch):
    monkeypatch.delenv("GUNICORN_BIND", raising=False)
    monkeypatch.setenv("PORT", "4321")

    assert runpy.run_path(str(CONFIG))["bind"] == "0.0.0.0:4321"


def test_gunicorn_explicit_bind_takes_precedence(monkeypatch):
    monkeypatch.setenv("GUNICORN_BIND", "127.0.0.1:9876")
    monkeypatch.setenv("PORT", "4321")

    assert runpy.run_path(str(CONFIG))["bind"] == "127.0.0.1:9876"
