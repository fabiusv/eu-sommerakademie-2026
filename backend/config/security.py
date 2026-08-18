from django.conf import settings
from django.http import HttpRequest
from ninja.errors import HttpError
from ninja.security import APIKeyCookie
from ninja.utils import check_csrf


class OptionalSessionAuth(APIKeyCookie):
    """Allow anonymous calls while protecting authenticated cookies with CSRF."""

    param_name = settings.SESSION_COOKIE_NAME

    def _get_key(self, request: HttpRequest):
        key = request.COOKIES.get(self.param_name)
        if key and request.user.is_authenticated:
            error_response = check_csrf(request)
            if error_response:
                raise HttpError(403, "CSRF check failed")
        return key

    def authenticate(self, request: HttpRequest, key):
        return request.user if request.user.is_authenticated else "anonymous"
