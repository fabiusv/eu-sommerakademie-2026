from __future__ import annotations

import re
import time
from collections.abc import Callable
from datetime import UTC, datetime
from datetime import time as datetime_time
from urllib.parse import urljoin

import httpx
from bs4 import BeautifulSoup, Tag
from pydantic import AnyHttpUrl, BaseModel, ConfigDict, Field, ValidationError, field_validator

from ingestion.html import sanitize_html
from ingestion.schemas import OpportunityCandidate
from opportunities.models import (
    ActionKind,
    OpportunityKind,
    ParticipationMode,
    TemporalPrecision,
)

EDITION_LANGUAGES = {
    "be": "en",
    "bg": "bg",
    "ch": "en",
    "de": "de",
    "es": "es",
    "eu": "en",
    "fr": "fr",
    "hu": "hu",
    "it": "it",
    "lu": "fr",
    "nl": "nl",
    "pt": "pt",
    "ro": "ro",
    "si": "sl",
    "sk": "sk",
    "ua": "uk",
    "uk": "en",
}


class EurodeskUpstreamError(RuntimeError):
    pass


class EurodeskLearningConfiguration(BaseModel):
    model_config = ConfigDict(extra="forbid")

    page_url: AnyHttpUrl
    search_url: AnyHttpUrl
    subcategories: list[str] = Field(min_length=1)

    @field_validator("subcategories")
    @classmethod
    def normalize_subcategories(cls, values: list[str]) -> list[str]:
        normalized = [value.strip().lower() for value in values if value.strip()]
        if not normalized or len(normalized) != len(set(normalized)):
            raise ValueError("subcategories must be non-empty and unique")
        return normalized


class EurodeskSearchPayload(BaseModel):
    model_config = ConfigDict(extra="allow")

    count: int = Field(ge=0)
    open: str
    upcoming: str


class EurodeskProgramme(BaseModel):
    model_config = ConfigDict(extra="forbid")

    external_id: str
    programme_id: str
    language: str
    title: str
    summary: str
    description_html: str
    category: str
    subcategory: str
    target: str
    deadline_at: datetime | None
    organizer_name: str | None
    action_url: str
    source_url: str
    image_url: str | None
    raw_html: str


class EurodeskLearningImporter:
    configuration_model = EurodeskLearningConfiguration
    MAX_PROGRAMMES = 1_000
    MAX_ATTEMPTS = 3

    def __init__(
        self,
        source,
        *,
        client: httpx.Client | None = None,
        sleep: Callable[[float], None] = time.sleep,
    ):
        self.source = source
        self.client = client or httpx.Client(
            timeout=httpx.Timeout(60.0, connect=10.0),
            headers={"User-Agent": "CivilEU/0.2 (opportunity catalog importer)"},
            follow_redirects=True,
        )
        self.sleep = sleep
        configuration = self.validate_configuration(source.configuration)
        self.page_url = str(configuration.page_url)
        self.search_url = str(configuration.search_url)
        self.subcategories = configuration.subcategories

    @classmethod
    def validate_configuration(cls, raw_configuration) -> EurodeskLearningConfiguration:
        try:
            return cls.configuration_model.model_validate(raw_configuration)
        except ValidationError as exc:
            raise ValueError(f"Invalid source configuration: {exc}") from exc

    def fetch_records(self) -> tuple[int, list[EurodeskProgramme]]:
        self._request(self.page_url)
        params = [(f"subcategories[{value}]", value) for value in self.subcategories]
        response = self._request(
            self.search_url,
            params=params,
            headers={
                "Referer": self.page_url,
                "X-Requested-With": "XMLHttpRequest",
            },
        )
        try:
            payload = EurodeskSearchPayload.model_validate(response.json())
        except (ValueError, ValidationError) as exc:
            raise EurodeskUpstreamError(f"Invalid Eurodesk search response: {exc}") from exc
        if payload.count > self.MAX_PROGRAMMES:
            raise EurodeskUpstreamError(
                f"Source contains {payload.count} programmes, exceeding the safe cap"
            )

        records = parse_programmes(payload.open, payload.upcoming, self.page_url)
        programme_ids = {record.programme_id for record in records}
        if len(programme_ids) != payload.count:
            raise EurodeskUpstreamError(
                f"Expected {payload.count} programmes, received {len(programme_ids)}"
            )
        external_ids = [record.external_id for record in records]
        if len(external_ids) != len(set(external_ids)):
            raise EurodeskUpstreamError("Eurodesk response contains duplicate translations")
        return len(records), records

    def _request(self, url, **kwargs) -> httpx.Response:
        last_error = None
        for attempt in range(self.MAX_ATTEMPTS):
            try:
                response = self.client.get(url, **kwargs)
                response.raise_for_status()
                return response
            except httpx.HTTPError as exc:
                last_error = exc
                if attempt + 1 < self.MAX_ATTEMPTS:
                    self.sleep(2**attempt)
        raise EurodeskUpstreamError(f"Eurodesk request failed: {last_error}") from last_error

    @staticmethod
    def external_id(programme: EurodeskProgramme) -> str:
        return programme.external_id

    def to_candidate(self, programme: EurodeskProgramme) -> OpportunityCandidate:
        return OpportunityCandidate(
            external_id=programme.external_id,
            source_entity_id=programme.programme_id,
            kind=OpportunityKind.OTHER,
            title=programme.title,
            summary=programme.summary,
            description=programme.description_html,
            language=programme.language,
            organizer_name=programme.organizer_name,
            starts_at=None,
            ends_at=None,
            application_deadline_at=programme.deadline_at,
            application_deadline_at_precision=(
                TemporalPrecision.DATE if programme.deadline_at else TemporalPrecision.UNKNOWN
            ),
            temporal_timezone="UTC",
            participation_mode=ParticipationMode.UNSPECIFIED,
            country_code=None,
            city=None,
            address=None,
            action_kind=ActionKind.APPLY,
            action_url=programme.action_url,
            source_url=programme.source_url,
            image_url=programme.image_url,
            raw_payload={
                "programme_id": programme.programme_id,
                "external_id": programme.external_id,
                "language": programme.language,
                "category": programme.category,
                "subcategory": programme.subcategory,
                "target": programme.target,
                "deadline_at": (
                    programme.deadline_at.isoformat() if programme.deadline_at else None
                ),
                "raw_html": programme.raw_html,
            },
        )


def parse_programmes(*fragments: str) -> list[EurodeskProgramme]:
    *html_fragments, page_url = fragments
    records = []
    for fragment in html_fragments:
        soup = BeautifulSoup(fragment, "html.parser")
        for template in soup.select("template#programme[data-hash]"):
            records.append(parse_programme(template, page_url))
    return records


def parse_programme(template: Tag, page_url: str) -> EurodeskProgramme:
    raw_html = str(template)
    external_id = str(template.get("data-hash") or "").strip().lower()
    match = re.fullmatch(r"(?P<id>\d+)-(?P<language>[a-z]{2,3})", external_id)
    if not match:
        raise EurodeskUpstreamError(f"Invalid Eurodesk programme identity: {external_id}")

    # Beautiful Soup intentionally excludes TemplateString nodes from get_text().
    # Parse the template contents as an ordinary fragment so all visible text is
    # handled consistently across Beautiful Soup versions.
    content = BeautifulSoup(template.decode_contents(), "html.parser")
    title_block = content.select_one('[data-role="title"]')
    title_parts = title_block.find_all("div", recursive=False) if title_block else []
    title = _text(title_parts[0]) if title_parts else ""
    summary = _text(title_parts[1]) if len(title_parts) > 1 else ""
    if not title:
        raise EurodeskUpstreamError(f"Programme {external_id} has no title")

    body = content.select_one('[data-role="body"]')
    if body is None:
        raise EurodeskUpstreamError(f"Programme {external_id} has no description")
    organizer_name = _organizer_name(body)
    description_html = sanitize_html(body.decode_contents())

    additional = _text(content.select_one('[data-role="additional"]'))
    category, subcategory, target = _additional_fields(additional)
    deadline_at = _deadline(content)
    action = content.select_one('[data-role="footer"] a[data-role="button"][href]')
    source_url = f"{page_url}#{external_id}"
    action_url = urljoin(page_url, str(action.get("href"))) if action else source_url
    image = content.select_one('[data-role="hero"] img[src]')
    image_url = urljoin(page_url, str(image.get("src"))) if image else None
    edition = match.group("language")
    language = EDITION_LANGUAGES.get(edition, edition)

    return EurodeskProgramme(
        external_id=external_id,
        programme_id=match.group("id"),
        language=language,
        title=title,
        summary=summary,
        description_html=description_html,
        category=category,
        subcategory=subcategory,
        target=target,
        deadline_at=deadline_at,
        organizer_name=organizer_name,
        action_url=action_url,
        source_url=source_url,
        image_url=image_url,
        raw_html=raw_html,
    )


def _text(tag: Tag | None) -> str:
    return " ".join(tag.get_text(" ", strip=True).split()) if tag else ""


def _organizer_name(body: Tag) -> str | None:
    offered = body.find(string=re.compile(r"Opportunity offered by:", re.IGNORECASE))
    if offered is None:
        return None
    container = (
        offered.parent.parent if offered.parent and offered.parent.parent else offered.parent
    )
    text = _text(container)
    value = re.sub(r"^.*?Opportunity offered by:\s*", "", text, flags=re.IGNORECASE)
    return value.strip() or None


def _additional_fields(value: str) -> tuple[str, str, str]:
    category_text, _, target = value.partition("This opportunity is available for:")
    category_text = re.sub(r"^Category:\s*", "", category_text, flags=re.IGNORECASE)
    category, separator, subcategory = category_text.partition(" - ")
    return category.strip(), subcategory.strip() if separator else "", target.strip()


def _deadline(template: Tag) -> datetime | None:
    hero = _text(template.select_one('[data-role="hero"]'))
    match = re.search(r"\b(\d{2})/(\d{2})/(\d{4})\b", hero)
    if not match:
        return None
    day, month, year = (int(value) for value in match.groups())
    return datetime.combine(
        datetime(year, month, day, tzinfo=UTC).date(),
        datetime_time.max,
        tzinfo=UTC,
    )
