from __future__ import annotations

import hashlib
import json
import re
import unicodedata
from difflib import SequenceMatcher
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from ingestion.html import plain_text

TRACKING_QUERY_PARAMETERS = {"fbclid", "gclid", "mc_cid", "mc_eid"}
YEAR_PATTERN = re.compile(r"(?<!\d)(?:19|20)\d{2}(?!\d)")
NON_WORD_PATTERN = re.compile(r"[^\w]+", re.UNICODE)


def normalize_text(value: str | None) -> str:
    normalized = unicodedata.normalize("NFKC", value or "").casefold()
    return " ".join(NON_WORD_PATTERN.sub(" ", normalized).split())


def normalize_url(value: str | None) -> str:
    if not value:
        return ""
    parsed = urlsplit(value.strip())
    query = urlencode(
        sorted(
            (key, item)
            for key, item in parse_qsl(parsed.query, keep_blank_values=True)
            if not key.lower().startswith("utm_") and key.lower() not in TRACKING_QUERY_PARAMETERS
        )
    )
    return urlunsplit(
        (
            parsed.scheme.lower(),
            parsed.netloc.lower(),
            parsed.path.rstrip("/") or "/",
            query,
            parsed.fragment,
        )
    )


def normalized_url_hash(value: str | None) -> str:
    normalized = normalize_url(value)
    return hashlib.sha256(normalized.encode()).hexdigest() if normalized else ""


def text_similarity(left: str | None, right: str | None) -> float | None:
    normalized_left = normalize_text(left)
    normalized_right = normalize_text(right)
    if not normalized_left or not normalized_right:
        return None
    if normalized_left == normalized_right:
        return 1.0
    left_tokens = set(normalized_left.split())
    right_tokens = set(normalized_right.split())
    token_similarity = len(left_tokens & right_tokens) / len(left_tokens | right_tokens)
    sequence_similarity = SequenceMatcher(None, normalized_left, normalized_right).ratio()
    return max(token_similarity, sequence_similarity)


def title_years(value: str | None) -> set[str]:
    return set(YEAR_PATTERN.findall(value or ""))


def deduplication_document(record) -> str:
    body = plain_text(record.description)[:6000]
    summary = plain_text(record.summary)[:1500]
    return "\n".join(
        part
        for part in (
            f"Title: {record.title.strip()}",
            f"Summary: {summary}" if summary else "",
            f"Description: {body}" if body else "",
        )
        if part
    )


def deduplication_input_hash(record) -> str:
    values = {
        "source_entity_id": record.source_entity_id,
        "title": normalize_text(record.title),
        "summary": normalize_text(plain_text(record.summary)),
        "description": normalize_text(plain_text(record.description)),
        "organizer_name": normalize_text(record.organizer_name),
        "starts_at": record.starts_at.isoformat() if record.starts_at else None,
        "starts_at_precision": str(record.starts_at_precision),
        "ends_at": record.ends_at.isoformat() if record.ends_at else None,
        "application_deadline_at": (
            record.application_deadline_at.isoformat() if record.application_deadline_at else None
        ),
        "application_deadline_at_precision": str(record.application_deadline_at_precision),
        "temporal_timezone": record.temporal_timezone,
        "participation_mode": str(record.participation_mode),
        "country_code": record.country_code,
        "city": normalize_text(record.city),
        "address": normalize_text(record.address),
        "source_url": normalize_url(str(record.source_url)),
        "action_url": normalize_url(str(record.action_url)),
    }
    serialized = json.dumps(
        values,
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    )
    return hashlib.sha256(serialized.encode()).hexdigest()
