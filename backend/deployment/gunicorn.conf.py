import os

bind = os.getenv("GUNICORN_BIND") or f"0.0.0.0:{os.getenv('PORT', '8000')}"
workers = int(os.getenv("WEB_CONCURRENCY", "2"))
threads = int(os.getenv("WEB_THREADS", "2"))
timeout = int(os.getenv("WEB_TIMEOUT_SECONDS", "60"))
graceful_timeout = 30
keepalive = 5
accesslog = "-"
errorlog = "-"
capture_output = True
