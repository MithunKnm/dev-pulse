"""Technical Scoring Engine — weighted scoring + grade assignment (HLD §4)."""

from __future__ import annotations

import logging

from ..core.models import MetricsResult

logger = logging.getLogger(__name__)

# HLD weights — must sum to 100.
WEIGHTS = {
    "commit_frequency": 20,
    "pr_participation": 20,
    "code_review_participation": 15,
    "documentation_contribution": 15,
    "branch_hygiene": 15,
    "repository_contribution": 15,
}


def calculate_score(metrics: MetricsResult) -> tuple[int, str]:
    """Return (technical_score 0–100, grade letter)."""

    metrics_dict = metrics.model_dump()
    weighted_sum = sum(
        metrics_dict[key] * (weight / 100)
        for key, weight in WEIGHTS.items()
    )
    score = max(0, min(100, round(weighted_sum)))
    grade = _grade_letter(score)

    logger.info("Score: %d / 100  →  Grade %s", score, grade)
    return score, grade


def _grade_letter(score: int) -> str:
    if score >= 85:
        return "A"
    if score >= 70:
        return "B"
    if score >= 55:
        return "C"
    return "D"
