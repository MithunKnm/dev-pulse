"""AI Report Generator — uses OpenAI to produce a Technical Excellence Report."""

from __future__ import annotations

import logging

import openai
from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI
from tenacity import (
    before_sleep_log,
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from ..core.config import settings
from ..core.models import AIReport, MetricsResult

logger = logging.getLogger(__name__)


@retry(
    retry=retry_if_exception_type(openai.RateLimitError),
    wait=wait_exponential(multiplier=30, min=30, max=300),
    stop=stop_after_attempt(5),
    before_sleep=before_sleep_log(logger, logging.WARNING),
    reraise=True,
)
async def generate_report(
    developer_name: str,
    score: int,
    grade: str,
    metrics: MetricsResult,
    repo_name: str,
) -> AIReport:
    """Call the LLM and return a structured AIReport."""

    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.3,
        api_key=settings.openai_api_key,
        max_retries=0,
    )

    structured_llm = llm.with_structured_output(AIReport)

    prompt = (
        "You are a senior Engineering Manager evaluating a developer's technical excellence.\n"
        "Based on the data below, produce a Technical Excellence Report.\n\n"
        f"Developer: {developer_name}\n"
        f"Repository: {repo_name}\n"
        f"Technical Score: {score}/100 (Grade {grade})\n"
        f"Metrics Breakdown:\n"
        f"  - Commit Frequency:        {metrics.commit_frequency}/100 (weight 20%)\n"
        f"  - PR Participation:         {metrics.pr_participation}/100 (weight 20%)\n"
        f"  - Code Review Participation: {metrics.code_review_participation}/100 (weight 15%)\n"
        f"  - Documentation:            {metrics.documentation_contribution}/100 (weight 15%)\n"
        f"  - Branch Hygiene:           {metrics.branch_hygiene}/100 (weight 15%)\n"
        f"  - Repository Contribution:  {metrics.repository_contribution}/100 (weight 15%)\n\n"
        "Return a JSON object with:\n"
        '  "strengths": list of 2-4 strengths\n'
        '  "weaknesses": list of 2-3 areas for improvement\n'
        '  "recommendations": list of 2-3 actionable recommendations\n'
        '  "learning": list of 2-3 learning resources or topics\n'
    )

    logger.info("Generating AI report for %s (score=%d, grade=%s)", developer_name, score, grade)
    report: AIReport = await structured_llm.ainvoke([SystemMessage(content=prompt)])
    logger.info("AI report generated: %s", report.model_dump())
    return report
