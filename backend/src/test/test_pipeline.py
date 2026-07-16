#!/usr/bin/env python3
"""End-to-end test — runs the full DEV-PULSE pipeline against a public GitHub repo.

Usage:
    cd backend
    python -m src.test.test_pipeline
"""

from __future__ import annotations

import asyncio
import json
import logging
import sys
from pathlib import Path

# Ensure the project root's .env is loaded before anything else
from dotenv import load_dotenv

_ROOT = Path(__file__).resolve().parents[3]
load_dotenv(_ROOT / ".env")

from src.app.core.models import Employee  # noqa: E402
from src.app.core.workflow import run_pipeline  # noqa: E402
from src.app.core.config import settings  # noqa: E402

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger("test_pipeline")


def _separator(title: str) -> None:
    print(f"\n{'=' * 60}")
    print(f"  {title}")
    print(f"{'=' * 60}")


async def main() -> None:
    # Parse repo owner/name from settings
    parts = settings.test_repo.split("/")
    if len(parts) != 2:
        logger.error("TEST_GITHUB_REPO must be 'owner/repo', got: %s", settings.test_repo)
        sys.exit(1)

    owner, repo = parts
    username = settings.test_username

    _separator("DEV-PULSE E2E Pipeline Test")
    print(f"  Repo     : {owner}/{repo}")
    print(f"  Username : {username}")
    print(f"  HF Token : {'set' if settings.huggingface_api_token else 'MISSING'}")
    print(f"  GH Token : {'set' if settings.github_token else 'MISSING'}")

    if not settings.github_token:
        logger.error("GITHUB_PERSONAL_ACCESS_TOKEN is not set. Aborting.")
        sys.exit(1)

    employee = Employee(
        employee_id="TEST-001",
        github_username=username,
        name=username.capitalize(),
    )

    _separator("Running pipeline")
    final_state = await run_pipeline(owner, repo, employee)

    # --- Report results ---
    if final_state.get("error"):
        _separator("PIPELINE FAILED")
        print(f"Error: {final_state['error']}")
        sys.exit(1)

    _separator("Raw GitHub Data Summary")
    raw = final_state.get("raw_github_data", {})
    for key in ("commits", "pull_requests", "reviews", "branches"):
        items = raw.get(key, [])
        print(f"  {key:20s} : {len(items)} items")

    _separator("Normalized Activities")
    activities = final_state.get("normalized_activities", [])
    print(f"  Total activities: {len(activities)}")
    from collections import Counter
    counts = Counter(a.activity_type.value for a in activities)
    for atype, count in counts.items():
        print(f"    {atype:20s} : {count}")

    _separator("Metrics")
    metrics = final_state["metrics"]
    for k, v in metrics.model_dump().items():
        print(f"  {k:35s} : {v:6.1f} / 100")

    _separator("Technical Score")
    print(f"  Score : {final_state['technical_score']} / 100")
    print(f"  Grade : {final_state['grade']}")

    _separator("AI Report")
    report = final_state["ai_report"]
    report_dict = report.model_dump()
    print(json.dumps(report_dict, indent=2))

    _separator("ALL CHECKS PASSED")


if __name__ == "__main__":
    asyncio.run(main())
