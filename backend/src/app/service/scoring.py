"""Technical Scoring Engine — weighted scoring + grade assignment (HLD §4)."""

from __future__ import annotations

import logging

from ..core.models import MetricsResult

# Import the new TechnicalScorer from analytics module
try:
    from ...app.analytics.scoring_engine import TechnicalScorer
    USE_NEW_SCORER = True
except ImportError:
    USE_NEW_SCORER = False

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
    """Return (technical_score 0–100, grade letter).
    
    Uses the new TechnicalScorer from analytics module if available,
    otherwise falls back to legacy scoring logic.
    """
    
    metrics_dict = metrics.model_dump()
    
    # Try to use new scorer first
    if USE_NEW_SCORER:
        try:
            scorer = TechnicalScorer(weights={k: v/100 for k, v in WEIGHTS.items()})
            result = scorer.score(metrics_dict)
            score = int(result['technical_score'])
            grade = result['grade']
            logger.info("Score: %d / 100  →  Grade %s (new scorer)", score, grade)
            return score, grade
        except Exception as e:
            logger.warning(f"New scorer failed, falling back to legacy: {e}")
    
    # Legacy scoring
    weighted_sum = sum(
        metrics_dict[key] * (weight / 100)
        for key, weight in WEIGHTS.items()
    )
    score = max(0, min(100, round(weighted_sum)))
    grade = _grade_letter(score)
    
    logger.info("Score: %d / 100  →  Grade %s (legacy)", score, grade)
    return score, grade


def _grade_letter(score: int) -> str:
    """Legacy grade assignment (A-D)."""
    if score >= 85:
        return "A"
    if score >= 70:
        return "B"
    if score >= 55:
        return "C"
    return "D"
