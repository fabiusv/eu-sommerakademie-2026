from __future__ import annotations

import json

import httpx
import pytest

from ingestion.classifiers import (
    OpportunityKindClassificationInput,
    OpportunityKindClassificationOutput,
    OpportunityKindClassifier,
)
from ingestion.classifiers.base import deterministic_input_hash
from ingestion.models import ClassificationResult
from llm import LLMProvider, LLMProviderError, LLMResponse, LLMUsage, OpenAIProvider
from opportunities.models import OpportunityKind

pytestmark = pytest.mark.django_db


class FakeProvider(LLMProvider):
    key = "fake"

    def __init__(self, outputs=None, error=None):
        self.outputs = list(outputs or [])
        self.error = error
        self.calls = []

    def generate_structured(
        self,
        *,
        model,
        system_prompt,
        user_prompt,
        output_model,
        schema_name,
    ):
        self.calls.append(
            {
                "model": model,
                "system_prompt": system_prompt,
                "user_prompt": user_prompt,
                "output_model": output_model,
                "schema_name": schema_name,
            }
        )
        if self.error:
            raise self.error
        return LLMResponse(
            output=self.outputs.pop(0),
            provider_key=self.key,
            model=model,
            response_id=f"response-{len(self.calls)}",
            usage=LLMUsage(input_tokens=12, output_tokens=4),
        )


def classifier_input(title="A public debate"):
    return OpportunityKindClassificationInput(
        title=title,
        summary="Citizens discuss two opposing proposals.",
        description="A moderated debate with arguments from both sides.",
        language="en",
    )


def classifier_output(kind=OpportunityKind.DEBATE, confidence=0.95):
    return OpportunityKindClassificationOutput(
        kind=kind,
        confidence=confidence,
        reason_codes=["explicit_debate_format"],
    )


def test_openai_provider_uses_caller_model_and_structured_schema():
    captured = {}

    def handler(request: httpx.Request):
        captured.update(json.loads(request.content))
        return httpx.Response(
            200,
            json={
                "id": "resp_123",
                "model": "gpt-5.4-nano-2026-03-17",
                "output": [
                    {
                        "type": "message",
                        "content": [
                            {
                                "type": "output_text",
                                "text": json.dumps(
                                    {
                                        "kind": "DEBATE",
                                        "confidence": 0.91,
                                        "reason_codes": ["structured_exchange"],
                                    }
                                ),
                            }
                        ],
                    }
                ],
                "usage": {"input_tokens": 20, "output_tokens": 7},
            },
        )

    provider = OpenAIProvider(
        api_key="test-key",
        api_base_url="https://api.openai.test/v1",
        client=httpx.Client(
            base_url="https://api.openai.test/v1/",
            transport=httpx.MockTransport(handler),
        ),
    )
    response = provider.generate_structured(
        model="gpt-5.4-nano",
        system_prompt="Classify the event.",
        user_prompt='{"title":"Debate"}',
        output_model=OpportunityKindClassificationOutput,
        schema_name="opportunity_kind_classification",
    )

    assert captured["model"] == "gpt-5.4-nano"
    assert captured["text"]["format"]["type"] == "json_schema"
    assert captured["text"]["format"]["strict"] is True
    assert response.output.kind == OpportunityKind.DEBATE
    assert response.model == "gpt-5.4-nano-2026-03-17"
    assert response.usage.output_tokens == 7


def test_classification_cache_is_based_only_on_deterministic_input():
    source_input = classifier_input()
    first_provider = FakeProvider([classifier_output()])
    first = OpportunityKindClassifier(
        provider=first_provider,
        model="first-model",
        min_confidence=0.75,
    ).classify(source_input)

    second_provider = FakeProvider([classifier_output(OpportunityKind.TALK)])
    second = OpportunityKindClassifier(
        provider=second_provider,
        model="different-provider-model",
        min_confidence=0.75,
    ).classify(source_input)

    assert first.cached is False
    assert second.cached is True
    assert second.output.kind == OpportunityKind.DEBATE
    assert second_provider.calls == []
    assert ClassificationResult.objects.count() == 1
    result = ClassificationResult.objects.get()
    assert result.input_hash == deterministic_input_hash(source_input)
    assert result.provider_key == "fake"
    assert result.model_key == "first-model"


def test_changed_source_input_gets_a_new_classification():
    provider = FakeProvider(
        [
            classifier_output(OpportunityKind.DEBATE),
            classifier_output(OpportunityKind.WORKSHOP),
        ]
    )
    classifier = OpportunityKindClassifier(provider=provider, model="test-model")

    classifier.classify(classifier_input("Debate"))
    classifier.classify(classifier_input("Hands-on workshop"))

    assert len(provider.calls) == 2
    assert ClassificationResult.objects.count() == 2


def test_provider_failure_falls_back_without_caching():
    provider = FakeProvider(error=LLMProviderError("temporarily unavailable"))
    classifier = OpportunityKindClassifier(provider=provider, model="test-model")

    first = classifier.classify(classifier_input())
    second = classifier.classify(classifier_input())

    assert first.failed is True
    assert second.output.kind == OpportunityKind.OTHER
    assert len(provider.calls) == 2
    assert ClassificationResult.objects.count() == 0


def test_low_confidence_result_is_cached_as_other():
    provider = FakeProvider([classifier_output(OpportunityKind.DEBATE, confidence=0.4)])
    decision = OpportunityKindClassifier(
        provider=provider,
        model="test-model",
        min_confidence=0.75,
    ).classify(classifier_input())

    assert decision.output.kind == OpportunityKind.OTHER
    assert "below_confidence_threshold" in decision.output.reason_codes
    assert ClassificationResult.objects.get().output["kind"] == "OTHER"
