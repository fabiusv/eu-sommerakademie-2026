from __future__ import annotations

import hashlib
import json
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass

from django.db import IntegrityError, transaction
from pydantic import BaseModel, ValidationError

from ingestion.models import ClassificationResult
from llm import LLMProvider, LLMProviderError

logger = logging.getLogger(__name__)

@dataclass(frozen=True)
class ClassificationDecision[OutputT: BaseModel]:
    output: OutputT
    result: ClassificationResult | None
    cached: bool
    failed: bool


class GenericLLMClassifier[InputT: BaseModel, OutputT: BaseModel](ABC):
    classifier_key: str
    classifier_version: str
    schema_name: str
    output_model: type[OutputT]

    def __init__(self, *, provider: LLMProvider | None, model: str):
        self.provider = provider
        self.model = model

    @property
    @abstractmethod
    def system_prompt(self) -> str:
        raise NotImplementedError

    @abstractmethod
    def user_prompt(self, classifier_input: InputT) -> str:
        raise NotImplementedError

    @abstractmethod
    def fallback_output(self, reason: str) -> OutputT:
        raise NotImplementedError

    def normalize_output(self, output: OutputT) -> OutputT:
        return output

    def classify(self, classifier_input: InputT) -> ClassificationDecision[OutputT]:
        input_hash = deterministic_input_hash(classifier_input)
        cached = ClassificationResult.objects.filter(
            classifier_key=self.classifier_key,
            classifier_version=self.classifier_version,
            input_hash=input_hash,
        ).first()
        if cached is not None:
            try:
                output = self.output_model.model_validate(cached.output)
                return ClassificationDecision(
                    output=output,
                    result=cached,
                    cached=True,
                    failed=False,
                )
            except ValidationError:
                logger.exception("Ignoring invalid cached result %s", cached.pk)

        if self.provider is None:
            return ClassificationDecision(
                output=self.fallback_output("provider_not_configured"),
                result=None,
                cached=False,
                failed=True,
            )

        try:
            response = self.provider.generate_structured(
                model=self.model,
                system_prompt=self.system_prompt,
                user_prompt=self.user_prompt(classifier_input),
                output_model=self.output_model,
                schema_name=self.schema_name,
            )
            output = self.normalize_output(response.output)
            result = self._store_result(input_hash, output, response)
            return ClassificationDecision(
                output=output,
                result=result,
                cached=False,
                failed=False,
            )
        except (LLMProviderError, ValidationError, ValueError) as exc:
            logger.warning("Classifier %s failed: %s", self.classifier_key, exc)
            return ClassificationDecision(
                output=self.fallback_output("provider_error"),
                result=None,
                cached=False,
                failed=True,
            )

    def _store_result(self, input_hash, output, response) -> ClassificationResult:
        values = {
            "provider_key": response.provider_key,
            "model_key": response.model,
            "provider_response_id": response.response_id,
            "output": output.model_dump(mode="json"),
            "input_tokens": response.usage.input_tokens,
            "output_tokens": response.usage.output_tokens,
        }
        try:
            with transaction.atomic():
                result, _created = ClassificationResult.objects.get_or_create(
                    classifier_key=self.classifier_key,
                    classifier_version=self.classifier_version,
                    input_hash=input_hash,
                    defaults=values,
                )
                return result
        except IntegrityError:
            return ClassificationResult.objects.get(
                classifier_key=self.classifier_key,
                classifier_version=self.classifier_version,
                input_hash=input_hash,
            )


def deterministic_input_hash(classifier_input: BaseModel) -> str:
    serialized = json.dumps(
        classifier_input.model_dump(mode="json"),
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    )
    return hashlib.sha256(serialized.encode()).hexdigest()
