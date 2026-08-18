from ingestion.adapters.eu_youth_events import EUYouthEventsImporter
from ingestion.adapters.eurodesk_learning import EurodeskLearningImporter

ADAPTER_REGISTRY = {
    "eu_youth_events.v1": EUYouthEventsImporter,
    "eurodesk_learning.v1": EurodeskLearningImporter,
}


def get_adapter(adapter_key: str):
    try:
        return ADAPTER_REGISTRY[adapter_key]
    except KeyError as exc:
        raise ValueError(f"Unknown source adapter: {adapter_key}") from exc
