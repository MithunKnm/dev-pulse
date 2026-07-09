"""LangGraph workflow — orchestrates the DEV-PULSE pipeline."""

from __future__ import annotations

import logging
import uuid

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, StateGraph

from tenacity import RetryError

from .mcp_client import GitHubMCPClient
from .models import DevPulseState, Employee
from ..db.repository import DevPulseRepository
from ..service.ai_report import generate_report
from ..service.metrics import extract_metrics
from ..service.normalizer import normalize
from ..service.scoring import calculate_score

logger = logging.getLogger(__name__)

# Shared placeholder DB
_db = DevPulseRepository()


# ---------------------------------------------------------------------------
# Node implementations
# ---------------------------------------------------------------------------

async def fetch_github_data_node(state: DevPulseState) -> dict:
    """Node 1 — Fetch raw data via GitHub MCP Server."""
    try:
        employee: Employee = state["employee"]
        owner: str = state["owner"]
        repo: str = state["repo"]

        client = GitHubMCPClient()
        raw_data = await client.fetch_developer_activity(owner, repo, employee.github_username)
        logger.info(
            "Fetched raw data: %d commits, %d PRs, %d reviews, %d branches",
            len(raw_data.get("commits", [])),
            len(raw_data.get("pull_requests", [])),
            len(raw_data.get("reviews", [])),
            len(raw_data.get("branches", [])),
        )
        return {"raw_github_data": raw_data}
    except BaseException as e:
        # Unwrap ExceptionGroup (raised by anyio TaskGroup inside MCP stdio_client)
        cause = e
        if isinstance(e, BaseExceptionGroup):
            cause = e.exceptions[0]
        logger.error("MCP fetch failed: %s", cause, exc_info=cause)
        return {"error": f"MCP Fetch Failed: {cause}"}


async def normalize_data_node(state: DevPulseState) -> dict:
    """Node 2 — Convert raw GitHub data into GenericActivity list."""
    employee: Employee = state["employee"]
    raw_data = state.get("raw_github_data", {})
    activities = normalize(raw_data, employee.employee_id, employee.github_username)
    return {"normalized_activities": activities}


async def extract_metrics_node(state: DevPulseState) -> dict:
    """Node 3 — Calculate 6 KPIs from normalised activities."""
    activities = state.get("normalized_activities", [])
    metrics = extract_metrics(activities)
    return {"metrics": metrics}


async def calculate_score_node(state: DevPulseState) -> dict:
    """Node 4 — Apply HLD weights to produce a score and grade."""
    metrics = state["metrics"]
    score, grade = calculate_score(metrics)
    return {"technical_score": score, "grade": grade}


async def generate_ai_report_node(state: DevPulseState) -> dict:
    """Node 5 — Call OpenAI to generate the Technical Excellence Report."""
    employee: Employee = state["employee"]
    try:
        report = await generate_report(
            developer_name=employee.name,
            score=state["technical_score"],
            grade=state["grade"],
            metrics=state["metrics"],
            repo_name=f"{state['owner']}/{state['repo']}",
        )
        return {"ai_report": report}
    except RetryError:
        logger.error("OpenAI rate limit exceeded after all retries for %s", employee.name)
        return {"error": "OpenAI rate limit exceeded after retries"}


async def persist_to_db_node(state: DevPulseState) -> dict:
    """Node 6 — Persist results (placeholder — just logs)."""
    employee: Employee = state["employee"]
    await _db.save_employee(employee)
    await _db.save_score(employee.employee_id, state["technical_score"], state["grade"])
    await _db.save_report(employee.employee_id, state["ai_report"])
    return {}


# ---------------------------------------------------------------------------
# Graph construction
# ---------------------------------------------------------------------------

def build_graph() -> StateGraph:
    """Construct and return the compiled DEV-PULSE LangGraph."""

    workflow = StateGraph(DevPulseState)

    workflow.add_node("fetch_github_data", fetch_github_data_node)
    workflow.add_node("normalize_data", normalize_data_node)
    workflow.add_node("extract_metrics", extract_metrics_node)
    workflow.add_node("calculate_score", calculate_score_node)
    workflow.add_node("generate_ai_report", generate_ai_report_node)
    workflow.add_node("persist_to_db", persist_to_db_node)

    workflow.set_entry_point("fetch_github_data")

    # Conditional: abort on error after fetch
    workflow.add_conditional_edges(
        "fetch_github_data",
        lambda s: "end" if s.get("error") else "continue",
        {"continue": "normalize_data", "end": END},
    )

    workflow.add_edge("normalize_data", "extract_metrics")
    workflow.add_edge("extract_metrics", "calculate_score")
    workflow.add_edge("calculate_score", "generate_ai_report")

    # Conditional: abort on error after AI report (e.g. rate-limit exhausted)
    workflow.add_conditional_edges(
        "generate_ai_report",
        lambda s: "end" if s.get("error") else "continue",
        {"continue": "persist_to_db", "end": END},
    )

    workflow.add_edge("persist_to_db", END)

    memory = MemorySaver()
    return workflow.compile(checkpointer=memory)


# Module-level compiled graph (singleton)
dev_pulse_graph = build_graph()


async def run_pipeline(owner: str, repo: str, employee: Employee) -> DevPulseState:
    """Execute the full pipeline and return the final state."""
    initial_state: DevPulseState = {
        "employee": employee,
        "owner": owner,
        "repo": repo,
    }
    config = {"configurable": {"thread_id": str(uuid.uuid4())}}
    final_state = await dev_pulse_graph.ainvoke(initial_state, config)
    return final_state
