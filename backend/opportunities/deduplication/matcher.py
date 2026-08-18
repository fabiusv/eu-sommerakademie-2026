from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from django.contrib.postgres.search import TrigramSimilarity
from django.db import connection, transaction
from django.db.models import Q
from django.utils import timezone

from opportunities.deduplication.normalization import (
    deduplication_input_hash,
    normalize_text,
    text_similarity,
    title_years,
)
from opportunities.models import (
    DuplicateDecision,
    DuplicateDecisionOutcome,
    DuplicateStatus,
    Opportunity,
    ParticipationMode,
    PublicationStatus,
    TemporalPrecision,
)


@dataclass(frozen=True)
class DuplicateCheckerPolicy:
    algorithm_version: str = "opportunity_duplicate.v1"
    temporal_block_tolerance: timedelta = timedelta(days=1)
    title_candidate_threshold: float = 0.45
    candidate_limit: int = 250
    auto_match_threshold: float = 0.88
    uncertain_threshold: float = 0.72
    minimum_auto_coverage: float = 0.65


@dataclass(frozen=True)
class CandidateMatch:
    opportunity: Opportunity
    score: float
    evidence_coverage: float
    features: dict[str, object]
    deterministic: bool = False
    contradiction: bool = False


@dataclass(frozen=True)
class DuplicateCheckResult:
    outcome: DuplicateDecisionOutcome
    matched_opportunity: Opportunity | None
    score: float | None
    evidence_coverage: float
    features: dict[str, object]


@dataclass(frozen=True)
class TemporalAnchor:
    kind: str
    value: object
    precision: str
    end: object | None = None


class DuplicateChecker:
    """Explainable duplicate matching over a union of cheap candidate blocks."""

    feature_weights = {
        "title": 0.28,
        "semantic": 0.24,
        "temporal": 0.23,
        "location": 0.15,
        "organizer": 0.10,
    }

    def __init__(self, *, policy: DuplicateCheckerPolicy | None = None):
        self.policy = policy or DuplicateCheckerPolicy()

    @transaction.atomic
    def check_and_apply(self, opportunity: Opportunity) -> DuplicateCheckResult:
        self._acquire_serialization_lock()
        opportunity = (
            Opportunity.objects.select_for_update(of=("self",))
            .select_related("source", "deduplication_embedding", "duplicate_of")
            .get(pk=opportunity.pk)
        )
        candidates, blocks, truncated = self._candidate_pool(opportunity)
        matches = [
            self._score(opportunity, candidate, blocks.get(candidate.pk, set()))
            for candidate in candidates
        ]
        matches.sort(
            key=lambda match: (
                match.deterministic and not match.contradiction,
                not match.contradiction,
                match.score,
                match.evidence_coverage,
                -match.opportunity.pk,
            ),
            reverse=True,
        )
        best = matches[0] if matches else None
        result = self._decide(
            best,
            candidate_count=len(candidates),
            candidate_pool_truncated=truncated,
        )

        duplicate_of = (
            result.matched_opportunity
            if result.outcome == DuplicateDecisionOutcome.MATCHED
            else None
        )
        if duplicate_of is not None:
            duplicate_of = duplicate_of.canonical_opportunity
            Opportunity.objects.filter(duplicate_of=opportunity).exclude(pk=duplicate_of.pk).update(
                duplicate_of=duplicate_of
            )
            duplicate_status = DuplicateStatus.DUPLICATE
        elif result.outcome == DuplicateDecisionOutcome.UNCERTAIN:
            duplicate_status = DuplicateStatus.UNCERTAIN
        else:
            duplicate_status = DuplicateStatus.UNIQUE

        checked_at = timezone.now()
        opportunity.duplicate_of = duplicate_of
        opportunity.duplicate_status = duplicate_status
        opportunity.duplicate_algorithm_version = self.policy.algorithm_version
        opportunity.duplicate_input_hash = deduplication_input_hash(opportunity)
        opportunity.duplicate_checked_at = checked_at
        opportunity.save(
            update_fields=(
                "duplicate_of",
                "duplicate_status",
                "duplicate_algorithm_version",
                "duplicate_input_hash",
                "duplicate_checked_at",
                "updated_at",
            )
        )
        DuplicateDecision.objects.create(
            opportunity=opportunity,
            matched_opportunity=duplicate_of or result.matched_opportunity,
            algorithm_version=self.policy.algorithm_version,
            outcome=result.outcome,
            score=result.score,
            evidence_coverage=result.evidence_coverage,
            features=result.features,
        )
        return DuplicateCheckResult(
            outcome=result.outcome,
            matched_opportunity=duplicate_of or result.matched_opportunity,
            score=result.score,
            evidence_coverage=result.evidence_coverage,
            features=result.features,
        )

    def _candidate_pool(
        self, opportunity: Opportunity
    ) -> tuple[list[Opportunity], dict[int, set[str]], bool]:
        eligible = (
            Opportunity.objects.filter(
                status=PublicationStatus.PUBLISHED,
                duplicate_of__isnull=True,
            )
            .filter(Q(pk__lt=opportunity.pk) | Q(pk=opportunity.duplicate_of_id))
            .exclude(pk=opportunity.pk)
            .select_related("source", "deduplication_embedding")
        )
        blocks: dict[int, set[str]] = {}
        truncated = False

        def add(queryset, block: str):
            nonlocal truncated
            ids = list(queryset.values_list("pk", flat=True)[: self.policy.candidate_limit + 1])
            if len(ids) > self.policy.candidate_limit:
                truncated = True
                ids = ids[: self.policy.candidate_limit]
            for pk in ids:
                blocks.setdefault(pk, set()).add(block)

        if opportunity.source_entity_id:
            add(
                eligible.filter(
                    source=opportunity.source,
                    source_entity_id=opportunity.source_entity_id,
                ),
                "source_entity",
            )

        url_hashes = {
            value for value in (opportunity.source_url_hash, opportunity.action_url_hash) if value
        }
        if url_hashes:
            add(
                eligible.filter(
                    Q(source_url_hash__in=url_hashes) | Q(action_url_hash__in=url_hashes)
                ),
                "url",
            )

        temporal_filter = self._temporal_block_filter(opportunity)
        if temporal_filter:
            add(eligible.filter(temporal_filter).order_by("pk"), "temporal")

        add(
            eligible.annotate(
                candidate_title_similarity=TrigramSimilarity("title", opportunity.title)
            )
            .filter(candidate_title_similarity__gte=self.policy.title_candidate_threshold)
            .order_by("-candidate_title_similarity", "pk"),
            "title",
        )

        candidates = list(eligible.filter(pk__in=blocks).order_by("pk"))
        return candidates, blocks, truncated

    def _temporal_block_filter(self, opportunity: Opportunity) -> Q | None:
        windows = []
        tolerance = self.policy.temporal_block_tolerance
        if opportunity.starts_at:
            windows.append(
                (
                    opportunity.starts_at - tolerance,
                    (opportunity.ends_at or opportunity.starts_at) + tolerance,
                )
            )
        if opportunity.application_deadline_at:
            windows.append(
                (
                    opportunity.application_deadline_at - tolerance,
                    opportunity.application_deadline_at + tolerance,
                )
            )
        if not windows:
            return None

        query = Q()
        for starts_at, ends_at in windows:
            query |= Q(starts_at__lte=ends_at, ends_at__gte=starts_at)
            query |= Q(application_deadline_at__range=(starts_at, ends_at))
        return query

    def _score(
        self,
        opportunity: Opportunity,
        candidate: Opportunity,
        blocks: set[str],
    ) -> CandidateMatch:
        title_score = text_similarity(opportunity.title, candidate.title)
        semantic_score = self._semantic_similarity(opportunity, candidate)
        temporal_score, temporal_conflict, temporal_details = self._temporal_similarity(
            opportunity, candidate
        )
        location_score, location_conflict, location_details = self._location_similarity(
            opportunity, candidate
        )
        organizer_score = text_similarity(opportunity.organizer_name, candidate.organizer_name)
        url_identity = bool(
            {value for value in (opportunity.source_url_hash, opportunity.action_url_hash) if value}
            & {value for value in (candidate.source_url_hash, candidate.action_url_hash) if value}
        )
        source_entity_identity = bool(
            opportunity.source_id == candidate.source_id
            and opportunity.source_entity_id
            and opportunity.source_entity_id == candidate.source_entity_id
        )
        years_left = title_years(opportunity.title)
        years_right = title_years(candidate.title)
        year_conflict = bool(years_left and years_right and years_left.isdisjoint(years_right))
        contradiction = temporal_conflict or location_conflict or year_conflict

        values = {
            "title": title_score,
            "semantic": semantic_score,
            "temporal": temporal_score,
            "location": location_score,
            "organizer": organizer_score,
        }
        coverage = sum(
            self.feature_weights[name] for name, value in values.items() if value is not None
        )
        weighted_score = sum(
            self.feature_weights[name] * value
            for name, value in values.items()
            if value is not None
        )
        score = weighted_score / coverage if coverage else 0.0
        deterministic = source_entity_identity and not contradiction

        features = {
            "candidate_id": candidate.pk,
            "candidate_blocks": sorted(blocks),
            "title_similarity": self._rounded(title_score),
            "semantic_similarity": self._rounded(semantic_score),
            "temporal_similarity": self._rounded(temporal_score),
            "location_similarity": self._rounded(location_score),
            "organizer_similarity": self._rounded(organizer_score),
            "url_identity": url_identity,
            "source_entity_identity": source_entity_identity,
            "year_conflict": year_conflict,
            "temporal_conflict": temporal_conflict,
            "location_conflict": location_conflict,
            **temporal_details,
            **location_details,
        }
        return CandidateMatch(
            opportunity=candidate,
            score=score,
            evidence_coverage=coverage,
            features=features,
            deterministic=deterministic,
            contradiction=contradiction,
        )

    def _decide(
        self,
        best: CandidateMatch | None,
        *,
        candidate_count: int,
        candidate_pool_truncated: bool,
    ) -> DuplicateCheckResult:
        if best is None:
            return DuplicateCheckResult(
                outcome=(
                    DuplicateDecisionOutcome.UNCERTAIN
                    if candidate_pool_truncated
                    else DuplicateDecisionOutcome.DISTINCT
                ),
                matched_opportunity=None,
                score=None,
                evidence_coverage=0,
                features={
                    "candidate_count": candidate_count,
                    "candidate_pool_truncated": candidate_pool_truncated,
                },
            )

        features = {
            **best.features,
            "candidate_count": candidate_count,
            "candidate_pool_truncated": candidate_pool_truncated,
        }
        title_score = best.features["title_similarity"]
        semantic_score = best.features["semantic_similarity"]
        temporal_score = best.features["temporal_similarity"]
        location_score = best.features["location_similarity"]
        organizer_score = best.features["organizer_similarity"]
        strong_content = (title_score or 0) >= 0.86 or (semantic_score or 0) >= 0.90
        corroborated = (
            best.features["url_identity"]
            or (location_score or 0) >= 0.80
            or (organizer_score or 0) >= 0.85
            or ((title_score or 0) >= 0.92 and (semantic_score or 0) >= 0.90)
        )
        temporal_compatible = temporal_score is None or temporal_score >= 0.50
        url_rule = bool(
            best.features["url_identity"]
            and (title_score or 0) >= 0.80
            and temporal_compatible
            and (
                temporal_score is not None
                or (location_score or 0) >= 0.80
                or (organizer_score or 0) >= 0.85
            )
        )
        automatic = not best.contradiction and (
            best.deterministic
            or (
                not candidate_pool_truncated
                and (
                    url_rule
                    or (
                        best.score >= self.policy.auto_match_threshold
                        and best.evidence_coverage >= self.policy.minimum_auto_coverage
                        and strong_content
                        and corroborated
                        and temporal_compatible
                    )
                )
            )
        )
        if automatic:
            outcome = DuplicateDecisionOutcome.MATCHED
        elif candidate_pool_truncated and not best.contradiction:
            outcome = DuplicateDecisionOutcome.UNCERTAIN
        elif not best.contradiction and best.score >= self.policy.uncertain_threshold:
            outcome = DuplicateDecisionOutcome.UNCERTAIN
        else:
            outcome = DuplicateDecisionOutcome.DISTINCT
        return DuplicateCheckResult(
            outcome=outcome,
            matched_opportunity=best.opportunity,
            score=best.score,
            evidence_coverage=best.evidence_coverage,
            features=features,
        )

    @staticmethod
    def _semantic_similarity(opportunity: Opportunity, candidate: Opportunity) -> float | None:
        left = opportunity.deduplication_embedding
        right = candidate.deduplication_embedding
        if (
            left is None
            or right is None
            or left.provider_key != right.provider_key
            or left.model_key != right.model_key
            or left.dimensions != right.dimensions
        ):
            return None
        left_vector = list(left.embedding)
        right_vector = list(right.embedding)
        denominator = math.sqrt(sum(value * value for value in left_vector)) * math.sqrt(
            sum(value * value for value in right_vector)
        )
        if denominator == 0:
            return None
        similarity = (
            sum(
                left_value * right_value
                for left_value, right_value in zip(left_vector, right_vector, strict=True)
            )
            / denominator
        )
        return max(0.0, min(1.0, similarity))

    def _temporal_similarity(
        self, left: Opportunity, right: Opportunity
    ) -> tuple[float | None, bool, dict[str, object]]:
        left_anchors = self._temporal_anchors(left)
        right_anchors = self._temporal_anchors(right)
        same_kind_scores = []
        cross_kind_scores = []
        for left_anchor in left_anchors:
            for right_anchor in right_anchors:
                score = self._anchor_similarity(left, left_anchor, right, right_anchor)
                if left_anchor.kind == right_anchor.kind:
                    same_kind_scores.append(score)
                elif score >= 0.50:
                    cross_kind_scores.append(score * 0.60)

        if same_kind_scores:
            score = max(same_kind_scores)
            conflict = score == 0
            comparison = "same_anchor_kind"
        elif cross_kind_scores:
            score = max(cross_kind_scores)
            conflict = False
            comparison = "cross_anchor_kind"
        else:
            score = None
            conflict = False
            comparison = "no_comparable_anchors"
        return score, conflict, {"temporal_comparison": comparison}

    @staticmethod
    def _temporal_anchors(opportunity: Opportunity) -> list[TemporalAnchor]:
        anchors = []
        if opportunity.starts_at:
            anchors.append(
                TemporalAnchor(
                    kind="occurrence",
                    value=opportunity.starts_at,
                    precision=opportunity.starts_at_precision,
                    end=opportunity.ends_at,
                )
            )
        if opportunity.application_deadline_at:
            anchors.append(
                TemporalAnchor(
                    kind="deadline",
                    value=opportunity.application_deadline_at,
                    precision=opportunity.application_deadline_at_precision,
                )
            )
        return anchors

    def _anchor_similarity(
        self,
        left: Opportunity,
        left_anchor: TemporalAnchor,
        right: Opportunity,
        right_anchor: TemporalAnchor,
    ) -> float:
        left_value = self._localize(left_anchor.value, left.temporal_timezone)
        right_value = self._localize(right_anchor.value, right.temporal_timezone)
        left_end = self._localize(left_anchor.end or left_anchor.value, left.temporal_timezone)
        right_end = self._localize(right_anchor.end or right_anchor.value, right.temporal_timezone)
        if left_value <= right_end and right_value <= left_end:
            return 1.0

        day_difference = abs((left_value.date() - right_value.date()).days)
        date_only = TemporalPrecision.DATE in {
            left_anchor.precision,
            right_anchor.precision,
        }
        if date_only:
            if day_difference == 0:
                return 1.0
            if day_difference == 1:
                return 0.70
            return 0.0

        difference = abs((left_value - right_value).total_seconds())
        if difference <= 15 * 60:
            return 1.0
        if difference <= 2 * 60 * 60:
            return 0.90
        if difference <= 6 * 60 * 60:
            return 0.65
        if day_difference == 0:
            return 0.45
        if day_difference == 1:
            return 0.15
        return 0.0

    @staticmethod
    def _localize(value, timezone_name: str):
        try:
            zone = ZoneInfo(timezone_name)
        except ZoneInfoNotFoundError:
            zone = ZoneInfo("UTC")
        return value.astimezone(zone)

    def _location_similarity(
        self, left: Opportunity, right: Opportunity
    ) -> tuple[float | None, bool, dict[str, object]]:
        both_in_person = left.participation_mode != ParticipationMode.ONLINE and (
            right.participation_mode != ParticipationMode.ONLINE
        )
        country_conflict = bool(
            both_in_person
            and left.country_code
            and right.country_code
            and left.country_code.upper() != right.country_code.upper()
        )
        if left.location and right.location:
            distance_km = self._haversine_km(
                left.location.y,
                left.location.x,
                right.location.y,
                right.location.x,
            )
            if distance_km <= 0.25:
                score = 1.0
            elif distance_km <= 1:
                score = 0.90
            elif distance_km <= 5:
                score = 0.65
            elif distance_km <= 25:
                score = 0.25
            else:
                score = 0.0
            distance_conflict = bool(
                both_in_person
                and distance_km > 50
                and normalize_text(left.city) != normalize_text(right.city)
            )
            return (
                score,
                country_conflict or distance_conflict,
                {"location_distance_km": round(distance_km, 3)},
            )

        address_score = text_similarity(left.address, right.address)
        if address_score is not None and address_score >= 0.85:
            return 0.85, country_conflict, {"location_comparison": "address"}
        same_city = bool(
            left.city
            and right.city
            and left.country_code
            and right.country_code
            and normalize_text(left.city) == normalize_text(right.city)
            and left.country_code.upper() == right.country_code.upper()
        )
        if same_city:
            return 0.55, False, {"location_comparison": "city"}
        return None, country_conflict, {"location_comparison": "unavailable"}

    @staticmethod
    def _haversine_km(lat1, lon1, lat2, lon2) -> float:
        radius_km = 6371.0088
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        value = (
            math.sin(delta_phi / 2) ** 2
            + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
        )
        return radius_km * 2 * math.atan2(math.sqrt(value), math.sqrt(1 - value))

    @staticmethod
    def _rounded(value: float | None) -> float | None:
        return round(value, 6) if value is not None else None

    @staticmethod
    def _acquire_serialization_lock() -> None:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT pg_advisory_xact_lock(hashtext(%s))",
                ["civileu:opportunity-duplicate-checker"],
            )
