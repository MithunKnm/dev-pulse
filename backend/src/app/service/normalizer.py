"""Data Normalizer — converts raw GitHub MCP responses into GenericActivity list."""

from __future__ import annotations

import logging
from typing import Any, Dict, List

from ..core.models import ActivityType, GenericActivity

logger = logging.getLogger(__name__)


def normalize(
    raw_data: Dict[str, Any],
    employee_id: str,
    github_username: str,
) -> List[GenericActivity]:
    """Transform raw GitHub data into a flat list of GenericActivity records."""

    activities: List[GenericActivity] = []

    # --- Commits ---
    for c in raw_data.get("commits", []):
        commit_info = c.get("commit", {})
        activities.append(
            GenericActivity(
                employee_id=employee_id,
                github_username=github_username,
                activity_type=ActivityType.COMMIT,
                timestamp=commit_info.get("author", {}).get("date", ""),
                metadata={
                    "sha": c.get("sha", ""),
                    "message": commit_info.get("message", ""),
                    "url": c.get("html_url", ""),
                },
            )
        )

    # --- Pull Requests ---
    for pr in raw_data.get("pull_requests", []):
        activities.append(
            GenericActivity(
                employee_id=employee_id,
                github_username=github_username,
                activity_type=ActivityType.PULL_REQUEST,
                timestamp=pr.get("created_at", ""),
                metadata={
                    "number": pr.get("number"),
                    "title": pr.get("title", ""),
                    "state": pr.get("state", ""),
                    "body": pr.get("body", ""),
                    "merged": pr.get("merged", False),
                    "additions": pr.get("additions", 0),
                    "deletions": pr.get("deletions", 0),
                    "changed_files": pr.get("changed_files", 0),
                    "url": pr.get("html_url", ""),
                },
            )
        )

    # --- Reviews ---
    for r in raw_data.get("reviews", []):
        activities.append(
            GenericActivity(
                employee_id=employee_id,
                github_username=github_username,
                activity_type=ActivityType.REVIEW,
                timestamp=r.get("submitted_at", ""),
                metadata={
                    "state": r.get("state", ""),
                    "body": r.get("body", ""),
                    "pr_url": r.get("pull_request_url", ""),
                },
            )
        )

    # --- Branches ---
    for b in raw_data.get("branches", []):
        activities.append(
            GenericActivity(
                employee_id=employee_id,
                github_username=github_username,
                activity_type=ActivityType.BRANCH,
                timestamp="",  # branches don't have timestamps
                metadata={
                    "name": b.get("name", ""),
                    "protected": b.get("protected", False),
                },
            )
        )

    logger.info(
        "Normalized %d activities (commits=%d, prs=%d, reviews=%d, branches=%d)",
        len(activities),
        len(raw_data.get("commits", [])),
        len(raw_data.get("pull_requests", [])),
        len(raw_data.get("reviews", [])),
        len(raw_data.get("branches", [])),
    )
    return activities
