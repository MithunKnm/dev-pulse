# DEV-PULSE — Frontend

React dashboard for the DEV-PULSE Technical Excellence Intelligence Platform.

**Stack:** React 18 · TypeScript · Tailwind CSS · React Query (TanStack Query) · React Router · Vite
Charts via recharts, icons via lucide-react.

Currently runs on **mock data** served through an async API layer, so loading states,
caching and the data flow all behave like the real backend is connected. Swapping to the
FastAPI backend is a one-file change (see below).

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
    ├── router.tsx
    ├── App.tsx               # layout: sidebar + topbar + <Outlet/>
    ├── index.css             # Tailwind directives + Inter font
    ├── lib/
    │   ├── types.ts          # Engineer, Repo, OrgData, Signal …
    │   ├── api.ts            # async data layer  ← swap for fetch() here
    │   └── utils.ts          # colors, grade helpers
    ├── data/
    │   └── mock.ts           # the mock dataset (6-person team)
    ├── hooks/
    │   └── queries.ts        # useOrg / useEngineers / useEngineer / useRepos / useSignals
    ├── components/           # Sidebar, Topbar, Card, ScoreRing, CategoryBar, State
    └── routes/               # Overview, Engineers, EngineerReport, Repositories, Insights, Reports
```

---

## Connecting the FastAPI backend

The UI never touches mock data directly — every page reads through a **React Query hook**
(`src/hooks/queries.ts`), which calls a function in `src/lib/api.ts`. To go live, edit only
`api.ts`: replace each function body with a `fetch()` to the matching endpoint. The return
types are unchanged, so pages, caching and loading states keep working.

```ts
// src/lib/api.ts
const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

export async function fetchEngineers(): Promise<Engineer[]> {
  const res = await fetch(`${API_BASE}/employees`);
  if (!res.ok) throw new Error("Failed to load engineers");
  return res.json();
}
```

Suggested endpoint mapping (services per HLD §3–4):

| Hook | Function | Endpoint | Service |
|------|----------|----------|---------|
| `useOrg` | `fetchOrg` | `GET /dashboard/overview` | Dashboard Service |
| `useEngineers` | `fetchEngineers` | `GET /employees` | Dashboard Service |
| `useEngineer` | `fetchEngineer` | `GET /employees/:id/report` | Report Service |
| `useRepos` | `fetchRepos` | `GET /repositories` | GitHub MCP Client |
| `useSignals` | `fetchSignals` | `GET /insights/org` | Technical Analysis Service |

Set `VITE_API_BASE` in a `.env` file (e.g. `VITE_API_BASE=http://localhost:8000`) to point at
the running FastAPI server.

## Scoring model (HLD §4 — Phase 1)

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

## Data shapes (align with HLD DB model)

`Engineer` mirrors Employee + TechnicalScore + AIReport:

```ts
{
  id, employeeId, githubUsername, name, email, role, team,
  score, grade, delta, commits, prs, reviews,
  cats: { commit, pr, review, docs, branch, repo },   // 0–100 each
  strengths: [], weaknesses: [], recommendation: "", learning: []
}
```

`Repo` mirrors Repository: `{ repositoryId, name, lang, visibility, updated, health, commits, prs, devs }`.

> The scores and AI text in `data/mock.ts` are placeholder values, not real GitHub analysis.
> The scoring engine and AI recommendation engine produce the real numbers.
