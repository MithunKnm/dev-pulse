"""Data Normalizer — converts raw GitHub MCP responses into GenericActivity list.

This implementation delegates normalization to the analytics DataNormalizer
and maps analytics Activity objects to core.GenericActivity.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List

from ..core.models import ActivityType, GenericActivity
from app.analytics.normalizer import DataNormalizer

logger = logging.getLogger(__name__)


def _map_activity_type(analytics_type: str) -> ActivityType:
    """Map analytics activity type string to core ActivityType."""
    mapping = {
        "COMMIT": ActivityType.COMMIT,
        "PULL_REQUEST": ActivityType.PULL_REQUEST,
        "REVIEW": ActivityType.REVIEW,
        # Analytics uses REPOSITORY for repository metadata — map to BRANCH for compatibility
        "REPOSITORY": ActivityType.BRANCH,
        "BRANCH": ActivityType.BRANCH,
    }
    return mapping.get(analytics_type.upper(), ActivityType.BRANCH)


def normalize(
    raw_data: Dict[str, Any],
    employee_id: str,
    github_username: str,
) -> List[GenericActivity]:
    """Transform raw GitHub data into a flat list of core.GenericActivity records.

    Steps:
    1. Flatten raw_data payloads into one list
    2. Use app.analytics.normalizer.DataNormalizer.normalize_batch to obtain
       typed Activity objects
    3. Map each Activity into core.GenericActivity
    """

    activities: List[GenericActivity] = []

    # Build a single payloads list from whatever MCP returned
    payloads: List[Dict[str, Any]] = []
    for key in ("commits", "pull_requests", "reviews", "branches", "repositories"):
        items = raw_data.get(key)
        if isinstance(items, list):
            payloads.extend(items)

    # Delegate normalization to analytics module (employee as github_username)
    analytics_activities = DataNormalizer.normalize_batch(payloads, employee=github_username)

    for a in analytics_activities:
        # Extract timestamp (ensure string) — analytics uses datetime objects
        ts = a.timestamp.isoformat() if hasattr(a.timestamp, "isoformat") else str(a.timestamp)

        # Map activity type
        atype = _map_activity_type(a.activity_type.value if hasattr(a.activity_type, "value") else str(a.activity_type))

        ga = GenericActivity(
            employee_id=employee_id,
            github_username=github_username,
            activity_type=atype,
            timestamp=ts,
            metadata=a.metadata or {},
        )
        activities.append(ga)

    logger.info(
        "Normalized %d activities via analytics normalizer (payloads=%d)",
        len(activities),
        len(payloads),
    )
    return activities
