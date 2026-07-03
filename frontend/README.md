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

Suggested endpoint mapping:

| Hook | Function | Endpoint |
|------|----------|----------|
| `useOrg` | `fetchOrg` | `GET /org/overview` |
| `useEngineers` | `fetchEngineers` | `GET /employees` |
| `useEngineer` | `fetchEngineer` | `GET /employees/:id` |
| `useRepos` | `fetchRepos` | `GET /repositories` |
| `useSignals` | `fetchSignals` | `GET /insights/org` |

Set `VITE_API_BASE` in a `.env` file (e.g. `VITE_API_BASE=http://localhost:8000`) to point at
the running FastAPI server.

> The scores and AI text in `data/mock.ts` are placeholder values, not real GitHub analysis.
> The scoring engine and recommendation service produce the real numbers.
