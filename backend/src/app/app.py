"""DEV-PULSE FastAPI application."""

from __future__ import annotations

import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .core.models import Employee
from .core.workflow import run_pipeline

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)

app = FastAPI(title="DEV-PULSE API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class AnalyzeRequest(BaseModel):
    owner: str
    repo: str
    github_username: str
    employee_id: str = "EMP-001"
    name: str = ""


class MetricsResponse(BaseModel):
    commit_frequency: float
    pr_participation: float
    code_review_participation: float
    documentation_contribution: float
    branch_hygiene: float
    repository_contribution: float


class ReportResponse(BaseModel):
    strengths: list[str]
    weaknesses: list[str]
    recommendations: list[str]
    learning: list[str]


class AnalyzeResponse(BaseModel):
    status: str
    technical_score: int | None = None
    grade: str | None = None
    metrics: MetricsResponse | None = None
    ai_report: ReportResponse | None = None
    error: str | None = None


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/api/v1/health")
async def health():
    return {"status": "ok"}


@app.post("/api/v1/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    """Run the full DEV-PULSE pipeline for a developer on a repository."""

    employee = Employee(
        employee_id=req.employee_id,
        github_username=req.github_username,
        name=req.name or req.github_username,
    )

    final = await run_pipeline(req.owner, req.repo, employee)

    if final.get("error"):
        raise HTTPException(status_code=502, detail=final["error"])

    metrics = final["metrics"]
    report = final["ai_report"]

    return AnalyzeResponse(
        status="success",
        technical_score=final["technical_score"],
        grade=final["grade"],
        metrics=MetricsResponse(**metrics.model_dump()),
        ai_report=ReportResponse(**report.model_dump()),
    )
