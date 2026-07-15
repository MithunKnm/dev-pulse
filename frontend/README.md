# DEV-PULSE — Frontend

React dashboard for the DEV-PULSE Technical Excellence Intelligence Platform.

**Stack:** React 18 · TypeScript · Tailwind CSS · React Query (TanStack Query) · React Router · Vite
Icons via lucide-react.

The backend has **no database or persistence yet** — it only runs a live, on-demand
analysis of one developer on one repo. So this app has **no stored data to show**: no
organization dashboard, engineer directory, saved reports, or stored AI insights. It is
deliberately scoped to two pages:

- **Home** (`/`) — what DEV-PULSE does, the pipeline, and the scoring model (methodology only, no fabricated data).
- **Live Analysis** (`/analyze`) — the real feature: submit owner / repo / GitHub username, call the backend, render the live report.

When the backend adds persistence + list endpoints, the aggregate pages can come back
(they're in git history).

---

## Run

Requires Node.js 18+.

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # type-check + production build
npm run preview
```

---

## Structure

```
frontend/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js        # dark palette as named colors (bg, surface, accent…)
├── postcss.config.js
├── public/favicon.svg
└── src/
    ├── main.tsx              # QueryClientProvider + RouterProvider
    ├── router.tsx            # Home + Live Analysis
    ├── App.tsx               # layout: sidebar + topbar + <Outlet/>
    ├── index.css             # Tailwind directives + Inter font
    ├── lib/
    │   ├── types.ts          # CategoryScores, AnalyzeInput, LiveReport …
    │   ├── api.ts            # real backend calls: analyzeDeveloper(), checkHealth()
    │   ├── metrics.ts        # the six scoring metrics + weights (real methodology)
    │   └── utils.ts          # colors, grade helpers
    ├── hooks/
    │   └── queries.ts        # useAnalyze (mutation) + useHealth
    ├── components/           # Sidebar, Topbar (backend-status chip), Card, ScoreRing, CategoryBar
    └── routes/               # Home, Analyze
```

---

## Backend integration

Point the frontend at the FastAPI backend with `VITE_API_BASE` (see `.env.example`):

```
VITE_API_BASE=http://localhost:8000
```

The backend currently exposes two endpoints, and the **Live Analysis** page (`/analyze`)
is wired directly to them:

| Endpoint | Used by | Purpose |
|----------|---------|---------|
| `GET /api/v1/health` | `useHealth` → `checkHealth()` | backend-online chip on the Analyze page |
| `POST /api/v1/analyze` | `useAnalyze` → `analyzeDeveloper()` | runs the GitHub-MCP pipeline for one developer on one repo |

`POST /api/v1/analyze` request → `{ owner, repo, github_username, employee_id?, name? }`.
Response is mapped in `src/lib/api.ts` (snake_case → the UI's `CategoryScores` keys):

```
commit_frequency          -> cats.commit
pr_participation          -> cats.pr
code_review_participation -> cats.review
documentation_contribution-> cats.docs
branch_hygiene            -> cats.branch
repository_contribution   -> cats.repo
technical_score/grade     -> score/grade
ai_report.{strengths,weaknesses,recommendations,learning} -> report
```

### Still on mock data

### No stored data

There is intentionally **no mock dashboard** anymore. The backend has no database or
list endpoints, so there is nothing to list — the app shows the live analysis and the
methodology, and nothing that would fabricate developer counts, repositories, or saved
insights. When persistence lands on the backend, add the list endpoints, then reintroduce
the aggregate pages (they're preserved in git history) reading from new hooks in
`src/hooks/queries.ts`.

### Running both together

```bash
# terminal 1 — backend
cd backend && uvicorn src.app.app:app --reload    # serves http://localhost:8000

# terminal 2 — frontend
cd frontend && npm install && npm run dev          # serves http://localhost:5173
```

Then open the app, go to **Live Analysis**, and enter a repo owner / repo / GitHub username
(e.g. `octocat` / `Hello-World` / `octocat`). The backend needs
`GITHUB_PERSONAL_ACCESS_TOKEN` (and its LLM key) configured in its own `.env`.


## Scoring model (HLD §4 — Phase 1)

Defined in `src/lib/metrics.ts`:

| Metric | Weight |
|---|---|
| Commit Frequency | 20% |
| PR Participation | 20% |
| Reviews | 15% |
| Documentation | 15% |
| Branch Hygiene | 15% |
| Repository Contribution | 15% |

The engine emits a score `/100` plus a letter **Grade** (A ≥85, B ≥70, C ≥55, D below).
Test Coverage, Build Quality and Sonar Issues are **Phase 2** metrics and are not scored yet.

## `POST /api/v1/analyze` mapping

The backend response is normalized in `src/lib/api.ts` to the UI's `LiveReport` shape:

```
commit_frequency          -> cats.commit
pr_participation          -> cats.pr
code_review_participation -> cats.review
documentation_contribution-> cats.docs
branch_hygiene            -> cats.branch
repository_contribution   -> cats.repo
technical_score / grade   -> score / grade
ai_report.{strengths, weaknesses, recommendations, learning} -> report
```

