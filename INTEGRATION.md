# DEV-PULSE — Frontend/Backend Integration Notes

## What the backend actually exposes

`backend/src/app/app.py` is the live FastAPI app (not `backend/app/`, which only
holds the analytics helper modules it imports from). Two endpoints:

```
GET  /api/v1/health
POST /api/v1/analyze
```

`AnalyzeResponse` (Pydantic, in `app.py`) fields, checked field-for-field
against `frontend/src/lib/types.ts::AnalyzeApiResponse`:

| field | backend type | frontend type | match |
|---|---|---|---|
| status | str | string | ✅ |
| technical_score | int \| None | number \| null | ✅ |
| grade | str \| None | string \| null | ✅ |
| metrics.* (6 keys) | float | number | ✅ (same 6 keys, same names) |
| ai_report.* (4 keys) | list[str] | string[] | ✅ (same 4 keys) |
| error | str \| None | not modeled, but read via `data.error` | ✅ |

No shape mismatch. The two endpoints and their schemas are unchanged from the
previous frontend build.

## The one real bug: grade scale mismatch

`backend/app/analytics/scoring_engine.py` (`TechnicalScorer`, used by
`backend/src/app/service/scoring.py` whenever the import succeeds) emits
**A / B / C / D / F**:

```
A: 90-100   B: 80-89.99   C: 70-79.99   D: 60-69.99   F: 0-59.99
```

The frontend only knew **A-D** and silently mapped any other letter (i.e. any
`F`) to `"D"` in `lib/api.ts::toGrade`. That means every developer scoring
below 60 was shown as a "D" instead of an "F" — a real correctness bug, not
just a display nit.

### Fix applied (this build)
- `lib/types.ts` — `Grade` widened to `"A" | "B" | "C" | "D" | "F"`.
- `lib/api.ts` — `toGrade` now accepts `F`. If the backend ever sends an
  unrecognized string, it derives a grade from `technical_score` using the
  same thresholds as `scoring_engine.py`, instead of defaulting to `"D"`.
- `lib/utils.ts` — `gradeLetter()` was a second, unused, stale A-D helper
  whose comment cited the wrong thresholds; corrected to match
  `scoring_engine.py` for consistency (it's currently dead code — nothing
  calls it — but left correct rather than removed, in case it's wired up
  later).
- `gradeColor` / `gradeLabel` (score-based, not letter-based) needed no
  change — they already operate on the 0-100 score.

Type-checks clean (`tsc --noEmit`) after the change.

## Backend packaging: two requirements files, only one is right

- `backend/requirements.txt` — legacy: pins `fastapi==0.104.1`, and includes
  `psycopg2-binary` / `sqlalchemy` for a Postgres layer that Phase 1 doesn't
  use (`db/repository.py` is a stub that only logs). It's missing everything
  `service/ai_report.py`, `core/mcp_client.py`, and `core/workflow.py`
  actually import: `mcp`, `langgraph`, `langchain-core`,
  `langchain-huggingface`, `huggingface_hub`, `tenacity`.
- `backend/requirments.txt` (note the typo — missing the second "e") — this
  one **does** list everything the real `src/app` code imports: `fastapi`,
  `uvicorn`, `mcp`, `langgraph`, `langchain-core`, `langchain-huggingface`,
  `huggingface_hub`, `pydantic`, `python-dotenv`, `httpx`, `tenacity` — and
  uses `fastapi>=0.111.0` instead of the pinned 0.104.1, which avoids the
  version conflict against `mcp` that the old pin caused.

**Fixed in this delivered copy:** `backend/requirements.txt` (legacy: pinned
`fastapi==0.104.1`, missing `mcp`/`langgraph`/`langchain-huggingface`/etc.,
had unused Postgres deps) and `backend/requirments.txt` (typo'd filename,
missing an "e" — but had the correct runtime deps) have been merged into a
single, correct `backend/requirements.txt` with `fastapi>=0.111.0` (avoids
the version conflict against `mcp` that the old pin caused), plus
`pytest`/`pytest-cov` for the test suite. `backend/requirements-test.txt`
(a redundant subset) was removed. There is now exactly one requirements
file, and it's right.

## Run recipe

```bash
# backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env            # fill in HUGGINGFACEHUB_API_TOKEN and
                                       # GITHUB_PERSONAL_ACCESS_TOKEN
uvicorn src.app.app:app --reload --port 8000

# frontend
cd frontend
npm install
npm run dev     # reads VITE_API_BASE, defaults to http://localhost:8000
```

## Env vars actually read by the backend (`core/config.py`)

- `HUGGINGFACEHUB_API_TOKEN` — required, HF inference token (`hf_...`)
- `HUGGINGFACE_MODEL` — optional, defaults to `Qwen/Qwen2.5-7B-Instruct`
- `GITHUB_PERSONAL_ACCESS_TOKEN` — required, needs `public_repo` scope
- `TEST_GITHUB_REPO`, `TEST_GITHUB_USERNAME` — only used by
  `backend/src/test/test_pipeline.py`

## What's still open (not a frontend fix)

- `list_pull_requests` in `core/mcp_client.py` can fail Zod validation on PRs
  whose `head.repo` is null (deleted forks); it retries at smaller page
  sizes and falls back to an empty list. That silently drops PR data rather
  than surfacing an error — worth flagging to whoever owns the MCP client if
  scores look artificially low for repos with deleted-fork PRs.
- Not verified with a live network call in this environment (no
  GitHub/Hugging Face tokens, no egress) — verification here was contract-
  level (Pydantic ⇄ TypeScript field matching) plus a clean `tsc` build, not
  an end-to-end HTTP round trip.
