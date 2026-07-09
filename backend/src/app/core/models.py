"""Pydantic models and LangGraph state definition for DEV-PULSE."""

from __future__ import annotations

from enum import Enum
from typing import Any, Dict, List, Optional, TypedDict

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Domain models (HLD §2 – Data Models)
# ---------------------------------------------------------------------------

class Employee(BaseModel):
    employee_id: str
    github_username: str
    name: str
    email: str = ""
    role: str = ""
    team: str = ""


class ActivityType(str, Enum):
    COMMIT = "COMMIT"
    PULL_REQUEST = "PULL_REQUEST"
    REVIEW = "REVIEW"
    BRANCH = "BRANCH"


class GenericActivity(BaseModel):
    """Normalised activity – the 'Generic Activity Model' from the HLD."""

    employee_id: str
    github_username: str
    activity_type: ActivityType
    timestamp: str = ""
    metadata: Dict[str, Any] = Field(default_factory=dict)


class MetricsResult(BaseModel):
    """The six Phase-1 KPIs, each scored 0–100."""

    commit_frequency: float = 0.0
    pr_participation: float = 0.0
    code_review_participation: float = 0.0
    documentation_contribution: float = 0.0
    branch_hygiene: float = 0.0
    repository_contribution: float = 0.0


class AIReport(BaseModel):
    """AI-generated Technical Excellence Report."""

    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    learning: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# LangGraph shared state
# ---------------------------------------------------------------------------

class DevPulseState(TypedDict, total=False):
    # Inputs
    employee: Employee
    owner: str
    repo: str

    # Pipeline stages
    raw_github_data: Optional[Dict[str, Any]]
    normalized_activities: Optional[List[GenericActivity]]
    metrics: Optional[MetricsResult]
    technical_score: Optional[int]
    grade: Optional[str]
    ai_report: Optional[AIReport]

    # Error channel
    error: Optional[str]
