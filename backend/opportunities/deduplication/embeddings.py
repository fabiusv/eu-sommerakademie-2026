from __future__ import annotations

import hashlib
import logging
from dataclasses import dataclass

from django.conf import settings
from django.db import IntegrityError, transaction

from ingestion.models import EmbeddingResult
from llm import EmbeddingProvider, EmbeddingProviderError, configured_embedding_provider
from opportunities.deduplication.normalization import deduplication_document

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class EmbeddedOpportunity:
    result: EmbeddingResult | None
    cached: bool = False
    failed: bool = False


@dataclass(frozen=True)
class EmbeddingBatch:
    results: tuple[EmbeddedOpportunity, ...]
    succeeded: int
    cached: int
    failed: int


class OpportunityDeduplicationEmbedder:
    embedder_key = "opportunity_deduplication"
    embedder_version = "1"
    max_batch_size = 64

    def __init__(
        self,
        *,
        provider: EmbeddingProvider | None = None,
        model: str | None = None,
    ):
        self.provider = provider if provider is not None else configured_embedding_provider()
        self.model = model or settings.OPPORTUNITY_DEDUPLICATION_EMBEDDING_MODEL

    def embed_candidates(self, candidates) -> EmbeddingBatch:
        prepared = [self._prepare(candidate) for candidate in candidates]
        hashes = {input_hash for _document, input_hash in prepared}
        provider_key = self.provider.key if self.provider is not None else "openai"
        cached_results = {
            result.input_hash: result
            for result in EmbeddingResult.objects.filter(
                embedder_key=self.embedder_key,
                embedder_version=self.embedder_version,
                provider_key=provider_key,
                model_key=self.model,
                input_hash__in=hashes,
            )
        }

        missing_by_hash: dict[str, str] = {}
        for document, input_hash in prepared:
            if input_hash not in cached_results:
                missing_by_hash[input_hash] = document

        if missing_by_hash and self.provider is not None:
            pending = list(missing_by_hash.items())
            for offset in range(0, len(pending), self.max_batch_size):
                batch = pending[offset : offset + self.max_batch_size]
                try:
                    response = self.provider.embed(
                        model=self.model,
                        inputs=[document for _input_hash, document in batch],
                    )
                    for (input_hash, _document), vector in zip(
                        batch, response.embeddings, strict=True
                    ):
                        result = self._store_result(input_hash, vector, response)
                        cached_results[input_hash] = result
                except (EmbeddingProviderError, IntegrityError, ValueError) as exc:
                    logger.warning("Opportunity embedding batch failed: %s", exc)

        decisions = []
        succeeded = cached = failed = 0
        initially_cached = hashes - set(missing_by_hash)
        for _document, input_hash in prepared:
            result = cached_results.get(input_hash)
            was_cached = input_hash in initially_cached
            did_fail = result is None
            decisions.append(
                EmbeddedOpportunity(
                    result=result,
                    cached=was_cached,
                    failed=did_fail,
                )
            )
            cached += int(was_cached)
            succeeded += int(result is not None and not was_cached)
            failed += int(did_fail)

        return EmbeddingBatch(
            results=tuple(decisions),
            succeeded=succeeded,
            cached=cached,
            failed=failed,
        )

    @staticmethod
    def _prepare(candidate) -> tuple[str, str]:
        document = deduplication_document(candidate)
        return document, hashlib.sha256(document.encode()).hexdigest()

    def _store_result(self, input_hash, vector, response) -> EmbeddingResult:
        values = {
            "provider_response_id": response.response_id,
            "dimensions": len(vector),
            "embedding": list(vector),
            "input_tokens": response.usage.input_tokens,
        }
        try:
            with transaction.atomic():
                result, _created = EmbeddingResult.objects.get_or_create(
                    embedder_key=self.embedder_key,
                    embedder_version=self.embedder_version,
                    provider_key=response.provider_key,
                    model_key=self.model,
                    input_hash=input_hash,
                    defaults=values,
                )
                return result
        except IntegrityError:
            return EmbeddingResult.objects.get(
                embedder_key=self.embedder_key,
                embedder_version=self.embedder_version,
                provider_key=response.provider_key,
                model_key=self.model,
                input_hash=input_hash,
            )
