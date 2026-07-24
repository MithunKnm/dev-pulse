// -----------------------------------------------------------------------------
// Deterministic mock data for the Phase-2 surfaces (repository & developer
// lists, details, and comparisons).
//
// The Phase-2 backend endpoints described in the design doc
// (GET /repos, GET /repos/{repo}, POST /repos/compare, GET /users,
// GET /users/{user}, POST /users/compare, POST /ai/repository-summary,
// POST /ai/user-summary) don't exist yet — only /health and /analyze are
// live (see lib/api.ts). Rather than block the UI on that backend work,
// every Phase-2 API function below calls the real endpoint first and, only
// if it 404s / errors / isn't reachable, falls back to this seeded mock
// generator so the screens are fully navigable and demoable now. Swapping
// in the real endpoints later requires no frontend changes — the mock
// path simply stops firing.
//
// "Seeded" means the numbers are stable across reloads for a given
// owner/repo or username (hash the id -> mulberry32 PRNG), not random
// noise each time.
import type {
  RepoSummary,
  RepoDetails,
  DeveloperSummary,
  DeveloperDetails,
  TrendPoint,
  Contributor,
  Release,
  RepoStatus,
} from "./types";

function hashStr(s: string): number {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rngFor(id: string) {
  return mulberry32(hashStr(id));
}

const LANGUAGES = ["TypeScript", "Python", "Go", "Java", "Rust"];
const REPO_NAMES = [
  "checkout-service", "design-system", "auth-gateway", "data-pipeline",
  "mobile-app", "infra-terraform", "notification-worker", "billing-api",
  "search-indexer", "admin-console",
];
const OWNER = "tricon-labs";
const DEV_NAMES = [
  ["Priya Nair", "priyan"], ["John Alvarez", "jalvarez"], ["Alice Chen", "achen"],
  ["Marcus Idowu", "midowu"], ["Sofia Rossi", "srossi"], ["Ken Watanabe", "kwatanabe"],
  ["Fatima Al-Sayed", "falsayed"], ["Diego Ramirez", "dramirez"],
];

function trend(id: string, points = 8, base = 50, spread = 40): TrendPoint[] {
  const rng = rngFor(id);
  const out: TrendPoint[] = [];
  let v = base + (rng() - 0.5) * spread * 0.5;
  for (let i = points; i > 0; i--) {
    v = Math.min(100, Math.max(0, v + (rng() - 0.45) * (spread / points) * 2));
    out.push({ label: `W-${i}`, value: Math.round(v) });
  }
  return out;
}

function statusFor(healthScore: number): RepoStatus {
  return healthScore >= 80 ? "healthy" : healthScore >= 60 ? "attention" : "critical";
}

export function mockRepoList(): RepoSummary[] {
  return REPO_NAMES.map((repo) => mockRepoSummary(`${OWNER}/${repo}`));
}

export function mockRepoSummary(id: string): RepoSummary {
  const [owner, repo] = id.includes("/") ? id.split("/") : [OWNER, id];
  const rng = rngFor(id);
  const healthScore = Math.round(40 + rng() * 58);
  return {
    id: `${owner}/${repo}`,
    owner,
    repo,
    healthScore,
    stars: Math.round(rng() * 900),
    openPRs: Math.round(rng() * 24),
    openIssues: Math.round(rng() * 60),
    lastCommit: `${1 + Math.round(rng() * 13)}d ago`,
    contributors: 3 + Math.round(rng() * 14),
    language: LANGUAGES[Math.floor(rng() * LANGUAGES.length)],
    status: statusFor(healthScore),
  };
}

export function mockRepoDetails(id: string): RepoDetails {
  const summary = mockRepoSummary(id);
  const rng = rngFor(id + ":details");
  const topContributors: Contributor[] = DEV_NAMES.slice(0, 5).map(([name, username]) => ({
    name,
    username,
    commits: 8 + Math.round(rng() * 140),
  })).sort((a, b) => b.commits - a.commits);

  const releases: Release[] = Array.from({ length: 3 }).map((_, i) => ({
    tag: `v1.${3 - i}.0`,
    date: `${(i + 1) * 3}w ago`,
    title: i === 0 ? "Latest stable release" : "Maintenance release",
  }));

  return {
    ...summary,
    commitTrend: trend(id + ":commit", 8, 55, 45),
    prTrend: trend(id + ":pr", 8, 45, 40),
    issueTrend: trend(id + ":issue", 8, 35, 50),
    branchProtection: rng() > 0.35,
    avgReviewTimeHours: Math.round((2 + rng() * 16) * 10) / 10,
    topContributors,
    recentReleases: releases,
  };
}

export function mockRepoCompareSummary(a: RepoDetails, b: RepoDetails): string {
  const healthier = a.healthScore >= b.healthScore ? a : b;
  const weaker = healthier === a ? b : a;
  return (
    `${healthier.repo} is healthier, with a ${healthier.healthScore}/100 score driven by faster ` +
    `reviews (${healthier.avgReviewTimeHours}h) and ${healthier.openIssues} open issues. ` +
    `${weaker.repo} trails at ${weaker.healthScore}/100 with ${weaker.openIssues} open issues and a ` +
    `${weaker.avgReviewTimeHours}h average review time — closing that gap would raise its score fastest.`
  );
}

export function mockDeveloperList(): DeveloperSummary[] {
  return DEV_NAMES.map(([, username]) => mockDeveloperSummary(username));
}

export function mockDeveloperSummary(username: string): DeveloperSummary {
  const found = DEV_NAMES.find(([, u]) => u === username);
  const name = found ? found[0] : username;
  const rng = rngFor(username);
  return {
    id: username,
    username,
    name,
    commits: 20 + Math.round(rng() * 160),
    prs: 4 + Math.round(rng() * 34),
    reviews: 2 + Math.round(rng() * 90),
    activityScore: Math.round(40 + rng() * 58),
  };
}

export function mockDeveloperDetails(username: string): DeveloperDetails {
  const summary = mockDeveloperSummary(username);
  const rng = rngFor(username + ":details");
  const sizes: DeveloperDetails["avgPrSize"][] = ["Small", "Medium", "Large"];
  return {
    ...summary,
    experienceTrend: trend(username + ":exp", 6, 55, 30),
    weeklyActivity: trend(username + ":week", 8, 50, 60),
    codingConsistency: Math.round(40 + rng() * 58),
    reviewParticipation: Math.round(30 + rng() * 65),
    avgPrSize: sizes[Math.floor(rng() * sizes.length)],
    mergeSuccessRate: Math.round(75 + rng() * 24),
    technicalExcellenceScore: Math.round(50 + rng() * 45),
  };
}

export function mockDeveloperCompareSummary(a: DeveloperDetails, b: DeveloperDetails): string {
  const busier = a.commits >= b.commits ? a : b;
  const reviewer = a.reviewParticipation >= b.reviewParticipation ? a : b;
  return (
    `${busier.name} contributes more implementation work (${busier.commits} commits) while ` +
    `${reviewer.name} is more active in reviews (${reviewer.reviewParticipation}% participation). ` +
    `${reviewer === busier ? busier.name : busier.name}'s pace pairs well with more review time from ` +
    `${reviewer.name === busier.name ? "their teammate" : reviewer.name} to keep merge cycles fast.`
  );
}
