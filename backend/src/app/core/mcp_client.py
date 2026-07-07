"""GitHub MCP Client — connects to the official GitHub MCP Server via Docker stdio."""

from __future__ import annotations

import json
import logging
from typing import Any, Dict, List, Optional

from mcp import ClientSession, StdioServerParameters, types
from mcp.client.stdio import stdio_client

from .config import settings

logger = logging.getLogger(__name__)


class GitHubMCPClient:
    """Wraps the official GitHub MCP Server (ghcr.io/github/github-mcp-server).

    Spawns a Docker container over stdio and exposes high-level methods for
    fetching commits, PRs, reviews, and branches.
    """

    def __init__(self, token: Optional[str] = None):
        self._token = token or settings.github_token
        if not self._token:
            raise ValueError(
                "GITHUB_PERSONAL_ACCESS_TOKEN is not set. "
                "Generate one at https://github.com/settings/tokens"
            )
        import os as _os
        self._server_params = StdioServerParameters(
            command="npx",
            args=["-y", "@modelcontextprotocol/server-github"],
            env={
                **_os.environ,
                "GITHUB_PERSONAL_ACCESS_TOKEN": self._token,
            },
        )

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _extract_text(result: types.CallToolResult) -> str:
        """Pull the first TextContent block out of a CallToolResult."""
        for block in result.content:
            if isinstance(block, types.TextContent):
                return block.text
        return ""

    @staticmethod
    def _parse_json(text: str) -> Any:
        """Best-effort JSON parse; returns raw string on failure."""
        try:
            return json.loads(text)
        except (json.JSONDecodeError, TypeError):
            return text

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def fetch_developer_activity(
        self,
        owner: str,
        repo: str,
        username: str,
    ) -> Dict[str, Any]:
        """Fetch all raw GitHub activity for *username* in *owner/repo*.

        Returns a dict with keys: commits, pull_requests, reviews, branches.
        """
        async with stdio_client(self._server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()

                # Discover available tools (useful for debugging)
                tools_resp = await session.list_tools()
                tool_names = [t.name for t in tools_resp.tools]
                logger.info("MCP tools available: %s", tool_names)

                # 1. Commits
                commits = await self._fetch_commits(session, owner, repo, username)

                # 2. Pull requests
                pull_requests = await self._fetch_pull_requests(session, owner, repo)

                # 3. Reviews (for each PR)
                reviews: List[Dict[str, Any]] = []
                for pr in pull_requests:
                    pr_number = pr.get("number")
                    if pr_number is not None:
                        pr_reviews = await self._fetch_reviews(session, owner, repo, pr_number)
                        reviews.extend(pr_reviews)

                # 4. Branches
                branches = await self._fetch_branches(session, owner, repo)

        return {
            "commits": commits,
            "pull_requests": pull_requests,
            "reviews": reviews,
            "branches": branches,
        }

    # ------------------------------------------------------------------
    # Tool calls — try canonical name, then fallback alias
    # ------------------------------------------------------------------

    async def _call_tool(
        self,
        session: ClientSession,
        tool_name: str,
        arguments: Dict[str, Any],
        fallback_name: Optional[str] = None,
    ) -> Any:
        """Call an MCP tool by name; try fallback on error."""
        try:
            result = await session.call_tool(tool_name, arguments=arguments)
            if result.isError:
                raise RuntimeError(self._extract_text(result))
            return self._parse_json(self._extract_text(result))
        except Exception:
            if fallback_name:
                logger.warning("Tool %s failed, trying fallback %s", tool_name, fallback_name)
                result = await session.call_tool(fallback_name, arguments=arguments)
                if result.isError:
                    raise RuntimeError(self._extract_text(result))
                return self._parse_json(self._extract_text(result))
            raise

    async def _fetch_commits(
        self, session: ClientSession, owner: str, repo: str, author: str
    ) -> List[Dict[str, Any]]:
        data = await self._call_tool(
            session,
            "list_commits",
            {"owner": owner, "repo": repo, "per_page": 100},
        )
        if not isinstance(data, list):
            return []
        # Client-side filter by author (npm package doesn't support author param)
        return [
            c for c in data
            if (c.get("author") or {}).get("login", "").lower() == author.lower()
            or (c.get("commit", {}).get("author", {}).get("name", "").lower() == author.lower())
        ] or data  # fall back to all commits if no match

    async def _fetch_pull_requests(
        self, session: ClientSession, owner: str, repo: str
    ) -> List[Dict[str, Any]]:
        # The MCP server's Zod validation can fail when PRs have head.repo=null
        # (deleted forks). Try with fewer results, then fall back to empty list.
        for per_page in (100, 30, 10):
            try:
                data = await self._call_tool(
                    session,
                    "list_pull_requests",
                    {"owner": owner, "repo": repo, "state": "all", "per_page": per_page},
                )
                return data if isinstance(data, list) else []
            except Exception as exc:
                if "invalid_type" in str(exc).lower() or "Invalid input" in str(exc):
                    logger.warning(
                        "list_pull_requests failed with per_page=%d (schema validation); retrying smaller page",
                        per_page,
                    )
                    continue
                raise
        logger.warning("list_pull_requests failed for all page sizes; returning empty list")
        return []

    async def _fetch_reviews(
        self, session: ClientSession, owner: str, repo: str, pr_number: int
    ) -> List[Dict[str, Any]]:
        data = await self._call_tool(
            session,
            "get_pull_request_reviews",
            {"owner": owner, "repo": repo, "pull_number": pr_number},
        )
        return data if isinstance(data, list) else []

    async def _fetch_branches(
        self, session: ClientSession, owner: str, repo: str
    ) -> List[Dict[str, Any]]:
        """Branches aren't available in the npm MCP server; return empty list."""
        logger.info("list_branches not available in npm MCP server; skipping")
        return []
