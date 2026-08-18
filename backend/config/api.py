from ninja import NinjaAPI

api = NinjaAPI(
    title="CivilEU API",
    version="1.0.0",
    urls_namespace="civileu-v1",
)


@api.exception_handler(ValueError)
def value_error_handler(request, exc: ValueError):
    return api.create_response(request, {"detail": str(exc)}, status=422)


from accounts.api import router as accounts_router  # noqa: E402
from interactions.api import router as interactions_router  # noqa: E402
from opportunities.api import router as opportunities_router  # noqa: E402

api.add_router("", opportunities_router)
api.add_router("", accounts_router)
api.add_router("", interactions_router)
