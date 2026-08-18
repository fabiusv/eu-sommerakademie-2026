from __future__ import annotations

import json

from django.conf import settings
from pydantic import BaseModel, ConfigDict, Field

from ingestion.classifiers.base import GenericLLMClassifier
from llm import LLMProvider, configured_llm_provider
from opportunities.models import OpportunityKind


class OpportunityKindClassificationInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str
    summary: str
    description: str
    language: str


class OpportunityKindClassificationOutput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    kind: OpportunityKind
    confidence: float = Field(ge=0, le=1)
    reason_codes: list[str] = Field(min_length=1, max_length=5)


class OpportunityKindClassifier(
    GenericLLMClassifier[
        OpportunityKindClassificationInput,
        OpportunityKindClassificationOutput,
    ]
):
    classifier_key = "opportunity_kind"
    classifier_version = "1"
    schema_name = "opportunity_kind_classification"
    output_model = OpportunityKindClassificationOutput

    def __init__(
        self,
        *,
        provider: LLMProvider | None = None,
        model: str | None = None,
        min_confidence: float | None = None,
    ):
        super().__init__(
            provider=provider if provider is not None else configured_llm_provider(),
            model=model or settings.OPPORTUNITY_KIND_CLASSIFIER_MODEL,
        )
        self.min_confidence = (
            settings.OPPORTUNITY_KIND_CLASSIFIER_MIN_CONFIDENCE
            if min_confidence is None
            else min_confidence
        )

    @property
    def system_prompt(self) -> str:
        definitions = {
            OpportunityKind.DIALOGUE: "A facilitated exchange centered on conversation.",
            OpportunityKind.DEBATE: "A structured discussion of opposing positions.",
            OpportunityKind.TALK: "A primarily speaker-led lecture, presentation, or panel.",
            OpportunityKind.WORKSHOP: "A participatory session for making or practising.",
            OpportunityKind.TRAINING: "Structured learning focused on developing skills.",
            OpportunityKind.MEETUP: "An informal community or networking gathering.",
            OpportunityKind.CONFERENCE: "A formal programme with multiple sessions or speakers.",
            OpportunityKind.INFO_SESSION: "A session primarily explaining a topic or process.",
            OpportunityKind.CULTURAL_EVENT: (
                "A performance, exhibition, festival, or cultural programme."
            ),
            OpportunityKind.COMPETITION: "An opportunity where entrants are judged or compete.",
            OpportunityKind.CEREMONY: "A formal observance, commemoration, or awards event.",
            OpportunityKind.RECRUITMENT: "A call to join a role, team, network, or cohort.",
            OpportunityKind.PROGRAMME: (
                "A structured ongoing opportunity not covered by a more specific kind."
            ),
            OpportunityKind.VOLUNTEERING: "An opportunity to contribute time without employment.",
            OpportunityKind.SCHOLARSHIP: "Financial support for study or structured learning.",
            OpportunityKind.GRANT: "Funding awarded for a project, activity, or travel.",
            OpportunityKind.EXCHANGE: "A mobility or reciprocal intercultural exchange.",
            OpportunityKind.OTHER: "No supported kind is sufficiently evidenced.",
        }
        return (
            "Classify the single primary kind of the opportunity. Classify what is offered, "
            "not the topic and not the action a user takes. Applying or registering is not "
            "itself an opportunity kind. Select exactly one canonical value. Use OTHER when "
            "evidence is missing, conflicting, or no kind is primary. Return a calibrated "
            "confidence from 0 to 1 and short snake_case reason codes. "
            f"Definitions: {json.dumps(definitions, ensure_ascii=False)}"
        )

    def user_prompt(self, classifier_input: OpportunityKindClassificationInput) -> str:
        return json.dumps(classifier_input.model_dump(mode="json"), ensure_ascii=False)

    def fallback_output(self, reason: str) -> OpportunityKindClassificationOutput:
        return OpportunityKindClassificationOutput(
            kind=OpportunityKind.OTHER,
            confidence=0,
            reason_codes=[reason],
        )

    def normalize_output(
        self, output: OpportunityKindClassificationOutput
    ) -> OpportunityKindClassificationOutput:
        if output.confidence >= self.min_confidence:
            return output
        return OpportunityKindClassificationOutput(
            kind=OpportunityKind.OTHER,
            confidence=output.confidence,
            reason_codes=[*output.reason_codes[:4], "below_confidence_threshold"],
        )
