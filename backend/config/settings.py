from __future__ import annotations

from pathlib import Path
from typing import Annotated
from urllib.parse import unquote, urlparse

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Environment(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = "postgresql://civileu:civileu@localhost:5432/civileu"
    secret_key: str = "unsafe-local-development-key"
    debug: bool = False
    allowed_hosts: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["localhost", "127.0.0.1"]
    )
    csrf_trusted_origins: Annotated[list[str], NoDecode] = Field(default_factory=list)
    cors_allowed_origins: Annotated[list[str], NoDecode] = Field(default_factory=list)
    session_cookie_secure: bool = True
    secure_ssl_redirect: bool = False
    secure_hsts_seconds: int = 0
    opencage_api_key: str = ""
    opencage_api_url: str = "https://api.opencagedata.com/geocode/v1/json"
    geocoding_provider: str = "opencage"
    llm_provider: str = "openai"
    openai_api_key: str = ""
    openai_api_url: str = "https://api.openai.com/v1"
    opportunity_kind_classifier_model: str = "gpt-5.4-nano"
    opportunity_kind_classifier_min_confidence: float = Field(default=0.75, ge=0, le=1)
    opportunity_deduplication_embedding_model: str = "text-embedding-3-small"
    import_scheduler_poll_seconds: int = Field(default=60, ge=10)
    import_health_grace_seconds: int = Field(default=21_600, ge=60)
    gdal_library_path: str = ""
    geos_library_path: str = ""

    @field_validator("allowed_hosts", "csrf_trusted_origins", "cors_allowed_origins", mode="before")
    @classmethod
    def split_csv(cls, value: object) -> object:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value


ENV = Environment()


def database_config(url: str) -> dict[str, object]:
    parsed = urlparse(url)
    if parsed.scheme not in {"postgres", "postgresql"}:
        raise ValueError("CivilEU requires a PostgreSQL/PostGIS DATABASE_URL")
    return {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "NAME": unquote(parsed.path.lstrip("/")),
        "USER": unquote(parsed.username or ""),
        "PASSWORD": unquote(parsed.password or ""),
        "HOST": parsed.hostname or "",
        "PORT": parsed.port or 5432,
        "CONN_MAX_AGE": 60,
        "CONN_HEALTH_CHECKS": True,
    }


SECRET_KEY = ENV.secret_key
DEBUG = ENV.debug
ALLOWED_HOSTS = ENV.allowed_hosts

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.gis",
    "django.contrib.postgres",
    "corsheaders",
    "allauth",
    "allauth.account",
    "allauth.headless",
    "accounts",
    "ingestion",
    "opportunities",
    "interactions",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "allauth.account.middleware.AccountMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    }
]

DATABASES = {"default": database_config(ENV.database_url)}

AUTH_USER_MODEL = "accounts.User"
AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]

ACCOUNT_LOGIN_METHODS = {"email"}
ACCOUNT_SIGNUP_FIELDS = ["email*", "password1*", "password2*"]
ACCOUNT_EMAIL_VERIFICATION = "none"
HEADLESS_ONLY = True
HEADLESS_CLIENTS = ("browser",)

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CSRF_TRUSTED_ORIGINS = ENV.csrf_trusted_origins
CORS_ALLOWED_ORIGINS = ENV.cors_allowed_origins
CORS_ALLOW_CREDENTIALS = True
SESSION_COOKIE_SECURE = ENV.session_cookie_secure
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SECURE = ENV.session_cookie_secure
CSRF_COOKIE_SAMESITE = "Lax"
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = ENV.secure_ssl_redirect
SECURE_HSTS_SECONDS = ENV.secure_hsts_seconds
SECURE_HSTS_INCLUDE_SUBDOMAINS = False

OPENCAGE_API_KEY = ENV.opencage_api_key
OPENCAGE_API_URL = ENV.opencage_api_url
GEOCODING_PROVIDER = ENV.geocoding_provider
LLM_PROVIDER = ENV.llm_provider
OPENAI_API_KEY = ENV.openai_api_key
OPENAI_API_URL = ENV.openai_api_url
OPPORTUNITY_KIND_CLASSIFIER_MODEL = ENV.opportunity_kind_classifier_model
OPPORTUNITY_KIND_CLASSIFIER_MIN_CONFIDENCE = ENV.opportunity_kind_classifier_min_confidence
OPPORTUNITY_DEDUPLICATION_EMBEDDING_MODEL = ENV.opportunity_deduplication_embedding_model
IMPORT_SCHEDULER_POLL_SECONDS = ENV.import_scheduler_poll_seconds
IMPORT_HEALTH_GRACE_SECONDS = ENV.import_health_grace_seconds

_homebrew_gdal = Path("/opt/homebrew/opt/gdal/lib/libgdal.dylib")
_homebrew_geos = Path("/opt/homebrew/opt/geos/lib/libgeos_c.dylib")
if ENV.gdal_library_path:
    GDAL_LIBRARY_PATH = ENV.gdal_library_path
elif _homebrew_gdal.exists():
    GDAL_LIBRARY_PATH = str(_homebrew_gdal)
if ENV.geos_library_path:
    GEOS_LIBRARY_PATH = ENV.geos_library_path
elif _homebrew_geos.exists():
    GEOS_LIBRARY_PATH = str(_homebrew_geos)

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "structured": {
            "format": "{asctime} {levelname} {name} {message}",
            "style": "{",
        }
    },
    "handlers": {"console": {"class": "logging.StreamHandler", "formatter": "structured"}},
    "loggers": {
        # httpx includes the full request URL in INFO logs. Provider API keys can
        # be query parameters, so keep request logging at WARNING and above.
        "httpx": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": False,
        }
    },
    "root": {"handlers": ["console"], "level": "INFO"},
}
