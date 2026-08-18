from __future__ import annotations

import math
from abc import ABC, abstractmethod
from dataclasses import dataclass

import httpx
from django.conf import settings


class EmbeddingProviderError(RuntimeError):
    pass


@dataclass(frozen=True)
class EmbeddingUsage:
    input_tokens: int = 0


@dataclass(frozen=True)
class EmbeddingResponse:
    embeddings: tuple[tuple[float, ...], ...]
    provider_key: str
    model: str
    response_id: str
    usage: EmbeddingUsage


class EmbeddingProvider(ABC):
    """Provider-neutral contract for ordered embedding batches."""

    key: str

    @abstractmethod
    def embed(self, *, model: str, inputs: list[str]) -> EmbeddingResponse:
        raise NotImplementedError


class OpenAIEmbeddingProvider(EmbeddingProvider):
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
                "User-Agent": "CivilEU/0.2 (embedding provider)",
            },
        )

    def embed(self, *, model: str, inputs: list[str]) -> EmbeddingResponse:
        if not inputs:
            return EmbeddingResponse(
                embeddings=(),
                provider_key=self.key,
                model=model,
                response_id="",
                usage=EmbeddingUsage(),
            )
        try:
            response = self.client.post(
                "embeddings",
                json={"model": model, "input": inputs, "encoding_format": "float"},
            )
            response.raise_for_status()
            payload = response.json()
            data = sorted(payload["data"], key=lambda item: int(item["index"]))
            embeddings = tuple(tuple(float(value) for value in item["embedding"]) for item in data)
            if len(embeddings) != len(inputs):
                raise ValueError("embedding response count did not match input count")
            if not embeddings or any(
                not vector or not all(math.isfinite(value) for value in vector)
                for vector in embeddings
            ):
                raise ValueError("embedding response contained an invalid vector")
            dimensions = {len(vector) for vector in embeddings}
            if len(dimensions) != 1:
                raise ValueError("embedding response contained mixed dimensions")
        except (httpx.HTTPError, KeyError, TypeError, ValueError) as exc:
            raise EmbeddingProviderError(f"OpenAI embedding request failed: {exc}") from exc

        usage = payload.get("usage") or {}
        return EmbeddingResponse(
            embeddings=embeddings,
            provider_key=self.key,
            model=str(payload.get("model") or model),
            response_id=str(payload.get("id") or ""),
            usage=EmbeddingUsage(
                input_tokens=int(usage.get("prompt_tokens") or usage.get("total_tokens") or 0)
            ),
        )


def configured_embedding_provider() -> EmbeddingProvider | None:
    provider_key = settings.LLM_PROVIDER
    if provider_key == "openai":
        if not settings.OPENAI_API_KEY:
            return None
        return OpenAIEmbeddingProvider(
            api_key=settings.OPENAI_API_KEY,
            api_base_url=settings.OPENAI_API_URL,
        )
    raise ValueError(f"Unknown embedding provider: {provider_key}")
