from datetime import timedelta

# Bootstrap values are used only when a Source row does not exist yet. Runtime
# imports always read the persisted row, and seeding never overwrites operator
# changes made through the admin or database.
DEFAULT_SOURCES = (
    {
        "adapter_key": "eu_youth_events.v1",
        "name": "European Youth Portal Events",
        "configuration": {
            "api_base_url": "https://youth.europa.eu/api/rest/eyp/v1",
            "search_path": "search_en",
            "portal_base_url": "https://youth.europa.eu",
        },
        "sync_interval": timedelta(hours=6),
        "enabled": True,
        "attribution_name": "European Youth Portal",
        "attribution_text": "European Youth Portal",
        "attribution_url": "https://youth.europa.eu/events_en",
    },
    {
        "adapter_key": "eurodesk_learning.v1",
        "name": "Eurodesk Opportunity Finder — Learning",
        "configuration": {
            "page_url": "https://programmes.eurodesk.eu/learning",
            "search_url": "https://programmes.eurodesk.eu/search",
            "subcategories": [
                "scholarships",
                "youth exchanges",
                "training courses",
                "travel grants",
            ],
        },
        "sync_interval": timedelta(hours=6),
        "enabled": True,
        "attribution_name": "Eurodesk",
        "attribution_text": "Source: Eurodesk",
        "attribution_url": "https://programmes.eurodesk.eu/learning",
    },
)
