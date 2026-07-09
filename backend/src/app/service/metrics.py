"""Metrics Extraction Engine — calculates 6 Phase-1 KPIs from normalised activities."""

from __future__ import annotations

import logging
from typing import List

from ..core.models import ActivityType, GenericActivity, MetricsResult

logger = logging.getLogger(__name__)

# Baselines used to normalise raw counts into a 0–100 scale.
# These are intentionally conservative so that even small repos produce
# meaningful scores.  Tune for production.
_COMMIT_BASELINE = 30        # 30 commits → 100
_PR_BASELINE = 10            # 10 PRs → 100
_REVIEW_BASELINE = 10        # 10 reviews → 100
_DOC_CHAR_BASELINE = 2_000   # 2 000 chars of PR body → 100
_BRANCH_STALE_RATIO = 0.3    # ≤30 % stale branches → 100


def _clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, value))


def extract_metrics(activities: List[GenericActivity]) -> MetricsResult:
    """Derive the six Phase-1 KPIs from *activities*."""

    commits = [a for a in activities if a.activity_type == ActivityType.COMMIT]
    prs = [a for a in activities if a.activity_type == ActivityType.PULL_REQUEST]
    reviews = [a for a in activities if a.activity_type == ActivityType.REVIEW]
    branches = [a for a in activities if a.activity_type == ActivityType.BRANCH]

    # 1. Commit Frequency — raw count normalised against baseline
    commit_frequency = _clamp((len(commits) / _COMMIT_BASELINE) * 100)

    # 2. PR Participation — PRs opened
    pr_participation = _clamp((len(prs) / _PR_BASELINE) * 100)

    # 3. Code Review Participation — reviews given
    code_review = _clamp((len(reviews) / _REVIEW_BASELINE) * 100)

    # 4. Documentation Contribution — total PR body length as proxy
    total_doc_chars = sum(len(pr.metadata.get("body", "") or "") for pr in prs)
    documentation = _clamp((total_doc_chars / _DOC_CHAR_BASELINE) * 100)

    # 5. Branch Hygiene — ratio of protected/well-named branches
    if branches:
        well_named = sum(
            1
            for b in branches
            if _is_well_named_branch(b.metadata.get("name", ""))
        )
        branch_hygiene = _clamp((well_named / len(branches)) * 100)
    else:
        branch_hygiene = 50.0  # neutral when no branch data

    # 6. Repository Contribution — file diversity across PRs
    total_changed = sum(pr.metadata.get("changed_files", 0) or 0 for pr in prs)
    repo_contribution = _clamp((total_changed / max(len(prs), 1)) * 20)  # avg files × 20

    result = MetricsResult(
        commit_frequency=round(commit_frequency, 1),
        pr_participation=round(pr_participation, 1),
        code_review_participation=round(code_review, 1),
        documentation_contribution=round(documentation, 1),
        branch_hygiene=round(branch_hygiene, 1),
        repository_contribution=round(repo_contribution, 1),
    )

    logger.info("Extracted metrics: %s", result.model_dump())
    return result


def _is_well_named_branch(name: str) -> bool:
    """Heuristic: branches following common conventions score as 'well-named'."""
    prefixes = ("main", "master", "develop", "feature/", "fix/", "hotfix/", "release/", "chore/", "docs/")
    return any(name.startswith(p) or name == p for p in prefixes)
