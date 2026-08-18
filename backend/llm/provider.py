from __future__ import annotations

import json
from abc import ABC, abstractmethod
from dataclasses import dataclass

import httpx
from django.conf import settings
from pydantic import BaseModel, ValidationError


class LLMProviderError(RuntimeError):
    pass


@dataclass(frozen=True)
class LLMUsage:
    input_tokens: int = 0
    output_tokens: int = 0


@dataclass(frozen=True)
class LLMResponse[OutputT: BaseModel]:
    output: OutputT
    provider_key: str
    model: str
    response_id: str
    usage: LLMUsage


class LLMProvider(ABC):
    """Application-facing provider contract for typed LLM responses."""

    key: str

    @abstractmethod
    def generate_structured[OutputT: BaseModel](
        self,
        *,
        model: str,
        system_prompt: str,
        user_prompt: str,
        output_model: type[OutputT],
        schema_name: str,
    ) -> LLMResponse[OutputT]:
        raise NotImplementedError


class OpenAIProvider(LLMProvider):
    key = "openai"

    def __init__(
        self,
        *,
        api_key: str,
        api_base_url: str = "https://api.openai.com/v1",
        client: httpx.Client | None = None,
    ):
        if not api_key:
            raise ValueError("OpenAI API key is required")
        self.client = client or httpx.Client(
            base_url=api_base_url.rstrip("/") + "/",
            timeout=httpx.Timeout(60.0, connect=10.0),
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": "CivilEU/0.2 (LLM provider)",
            },
        )

    def generate_structured[OutputT: BaseModel](
        self,
        *,
        model: str,
        system_prompt: str,
        user_prompt: str,
        output_model: type[OutputT],
        schema_name: str,
    ) -> LLMResponse[OutputT]:
        try:
            response = self.client.post(
                "responses",
                json={
                    "model": model,
                    "input": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "text": {
                        "format": {
                            "type": "json_schema",
                            "name": schema_name,
                            "strict": True,
                            "schema": output_model.model_json_schema(),
                        }
                    },
                },
            )
            response.raise_for_status()
            payload = response.json()
            output_text = _response_output_text(payload)
            parsed = output_model.model_validate(json.loads(output_text))
        except (httpx.HTTPError, KeyError, TypeError, ValueError, ValidationError) as exc:
            raise LLMProviderError(f"OpenAI structured response failed: {exc}") from exc

        usage = payload.get("usage") or {}
        return LLMResponse(
            output=parsed,
            provider_key=self.key,
            model=str(payload.get("model") or model),
            response_id=str(payload.get("id") or ""),
            usage=LLMUsage(
                input_tokens=int(usage.get("input_tokens") or 0),
                output_tokens=int(usage.get("output_tokens") or 0),
            ),
        )


def _response_output_text(payload: dict[str, object]) -> str:
    for item in payload.get("output") or []:
        if not isinstance(item, dict) or item.get("type") != "message":
            continue
        for content in item.get("content") or []:
            if isinstance(content, dict) and content.get("type") == "output_text":
                text = content.get("text")
                if isinstance(text, str) and text:
                    return text
    raise LLMProviderError("OpenAI response contained no structured output text")


def configured_llm_provider() -> LLMProvider | None:
    provider_key = settings.LLM_PROVIDER
    if provider_key == "openai":
        if not settings.OPENAI_API_KEY:
            return None
        return OpenAIProvider(
            api_key=settings.OPENAI_API_KEY,
            api_base_url=settings.OPENAI_API_URL,
        )
    raise ValueError(f"Unknown LLM provider: {provider_key}")
