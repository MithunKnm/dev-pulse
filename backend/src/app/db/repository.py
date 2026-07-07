"""DB Repository — placeholder classes (no real persistence in Phase 1)."""

from __future__ import annotations

import logging
from typing import Optional

from ..core.models import AIReport, Employee

logger = logging.getLogger(__name__)


class DevPulseRepository:
    """Stub repository that logs instead of persisting to PostgreSQL."""

    async def save_employee(self, employee: Employee) -> None:
        logger.info("[DB PLACEHOLDER] save_employee: %s (%s)", employee.name, employee.employee_id)

    async def save_score(self, employee_id: str, score: int, grade: str) -> None:
        logger.info("[DB PLACEHOLDER] save_score: employee=%s score=%d grade=%s", employee_id, score, grade)

    async def save_report(self, employee_id: str, report: AIReport) -> None:
        logger.info("[DB PLACEHOLDER] save_report: employee=%s strengths=%d weaknesses=%d",
                     employee_id, len(report.strengths), len(report.weaknesses))

    async def get_employee(self, employee_id: str) -> Optional[Employee]:
        logger.info("[DB PLACEHOLDER] get_employee: %s → None", employee_id)
        return None
