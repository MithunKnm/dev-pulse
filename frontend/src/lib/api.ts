// -----------------------------------------------------------------------------
// API layer. Right now these return mock data after a small delay so the app
// behaves like it's talking to a real backend (loading states work, React Query
// caches, etc). When the FastAPI backend is ready, replace each body with a
// fetch() call to the matching endpoint — the return types stay the same, so
// nothing else in the app has to change.
//
//   export async function fetchEngineers() {
//     const res = await fetch(`${API_BASE}/employees`);
//     if (!res.ok) throw new Error("Failed to load engineers");
//     return res.json() as Promise<Engineer[]>;
//   }
// -----------------------------------------------------------------------------
import type { Engineer, Repo, OrgData, Signal } from "./types";
import { ENGINEERS, REPOS, ORG, ORG_SIGNALS } from "../data/mock";

// export const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchOrg(): Promise<OrgData> {
  await delay(250);
  return ORG;
}

export async function fetchEngineers(): Promise<Engineer[]> {
  await delay(350);
  return ENGINEERS;
}

export async function fetchEngineer(id: string): Promise<Engineer> {
  await delay(300);
  const found = ENGINEERS.find((e) => e.id === id);
  if (!found) throw new Error(`Engineer "${id}" not found`);
  return found;
}

export async function fetchRepos(): Promise<Repo[]> {
  await delay(350);
  return REPOS;
}

export async function fetchSignals(): Promise<Signal[]> {
  await delay(300);
  return ORG_SIGNALS;
}
