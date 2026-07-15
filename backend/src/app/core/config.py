"""Application settings loaded from .env."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# Walk up from this file to find .env at the project root
_ENV_PATH = Path(__file__).resolve().parents[4] / ".env"
load_dotenv(_ENV_PATH)


class Settings:
    huggingface_api_token: str = os.getenv("HUGGINGFACEHUB_API_TOKEN", "")
    huggingface_model: str = os.getenv(
        "HUGGINGFACE_MODEL", "Qwen/Qwen2.5-7B-Instruct"
    )
    github_token: str = os.getenv("GITHUB_PERSONAL_ACCESS_TOKEN", "")
    test_repo: str = os.getenv("TEST_GITHUB_REPO", "octocat/Hello-World")
    test_username: str = os.getenv("TEST_GITHUB_USERNAME", "octocat")


settings = Settings()
