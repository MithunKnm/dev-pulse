"""AI Report Generator — uses Hugging Face Inference to produce a Technical Excellence Report."""

from __future__ import annotations

import json
import logging

from huggingface_hub.errors import HfHubHTTPError
from langchain_core.messages import SystemMessage
from langchain_core.output_parsers import PydanticOutputParser
from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
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

_parser = PydanticOutputParser(pydantic_object=AIReport)


@retry(
    retry=retry_if_exception_type(HfHubHTTPError),
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
    """Call the Hugging Face-hosted LLM and return a structured AIReport."""

    endpoint = HuggingFaceEndpoint(
        repo_id=settings.huggingface_model,
        huggingfacehub_api_token=settings.huggingface_api_token,
        max_new_tokens=768,
        temperature=0.3,
    )
    llm = ChatHuggingFace(llm=endpoint)

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
        "Respond with ONLY a JSON object (no extra text) matching this schema:\n"
        f"{_parser.get_format_instructions()}\n"
    )

    logger.info("Generating AI report for %s (score=%d, grade=%s)", developer_name, score, grade)
    response = await llm.ainvoke([SystemMessage(content=prompt)])
    content = response.content if isinstance(response.content, str) else str(response.content)

    try:
        report = _parser.parse(content)
    except Exception:
        logger.warning("Structured parse failed; falling back to raw JSON extraction")
        start, end = content.find("{"), content.rfind("}") + 1
        report = AIReport.model_validate(json.loads(content[start:end]))

    logger.info("AI report generated: %s", report.model_dump())
    return report
