from django.contrib import admin
from django.urls import include, path

from config.api import api
from config.health import live, ready

urlpatterns = [
    path("admin/", admin.site.urls),
    path("_allauth/", include("allauth.headless.urls")),
    path("v1/", api.urls),
    path("health/live", live, name="health-live"),
    path("health/ready", ready, name="health-ready"),
]
