// Domain types shared across the app.

// Phase-1 Technical Excellence metrics (per HLD §4 Technical Scoring Engine).
// Test Coverage / Build Quality / Sonar Issues are Phase-2 metrics and are
// intentionally NOT scored here.
export interface CategoryScores {
  commit: number; // Commit Frequency        20%
  pr: number;     // PR Participation         20%
  review: number; // Reviews                  15%
  docs: number;   // Documentation            15%
  branch: number; // Branch Hygiene           15%
  repo: number;   // Repository Contribution  15%
}

export type Grade = "A" | "B" | "C" | "D" | "F";

export type CategoryKey = keyof CategoryScores;

export interface Category {
  key: CategoryKey;
  label: string;
  weight: number;
}

// ---------------------------------------------------------------------------
// Live backend integration — POST /api/v1/analyze
// ---------------------------------------------------------------------------

// What the user fills in to run the real DEV-PULSE pipeline on a developer+repo.
export interface AnalyzeInput {
  owner: string;           // GitHub org/user that owns the repo
  repo: string;            // repository name
  githubUsername: string;  // the developer to analyze
  employeeId?: string;     // optional Tricon employee id (backend defaults to EMP-001)
  name?: string;           // optional display name
}

// Raw response shape from the FastAPI backend (snake_case, as-is).
export interface AnalyzeApiResponse {
  status: string;
  technical_score: number | null;
  grade: string | null;
  metrics: {
    commit_frequency: number;
    pr_participation: number;
    code_review_participation: number;
    documentation_contribution: number;
    branch_hygiene: number;
    repository_contribution: number;
  } | null;
  ai_report: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    learning: string[];
  } | null;
  error?: string | null;
}

// Normalized shape the UI consumes (camelCase, cats keyed like CategoryScores).
export interface LiveReport {
  score: number;
  grade: Grade;
  cats: CategoryScores;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  learning: string[];
}

// ---------------------------------------------------------------------------
// Phase 2 — Repositories & Developers (list, details, compare)
//
// Backed by GET /repos, GET /repos/{repo}, POST /repos/compare,
// GET /users, GET /users/{user}, POST /users/compare (see lib/api.ts).
// Until those endpoints ship, lib/mock.ts supplies this same shape so the
// screens below work end-to-end today.
// ---------------------------------------------------------------------------

export type RepoStatus = "healthy" | "attention" | "critical";

export interface RepoSummary {
  id: string; // "owner/repo"
  owner: string;
  repo: string;
  healthScore: number;
  stars: number;
  openPRs: number;
  openIssues: number;
  lastCommit: string;
  contributors: number;
  language: string;
  status: RepoStatus;
}

export interface TrendPoint {
  label: string;
  value: number;
}

export interface Contributor {
  username: string;
  name: string;
  commits: number;
}

export interface Release {
  tag: string;
  date: string;
  title: string;
}

export interface RepoDetails extends RepoSummary {
  commitTrend: TrendPoint[];
  prTrend: TrendPoint[];
  issueTrend: TrendPoint[];
  branchProtection: boolean;
  avgReviewTimeHours: number;
  topContributors: Contributor[];
  recentReleases: Release[];
}

export interface RepoCompareResult {
  a: RepoDetails;
  b: RepoDetails;
  aiSummary: string;
}

export interface DeveloperSummary {
  id: string; // github username
  username: string;
  name: string;
  commits: number;
  prs: number;
  reviews: number;
  activityScore: number;
}

export interface DeveloperDetails extends DeveloperSummary {
  experienceTrend: TrendPoint[];
  weeklyActivity: TrendPoint[];
  codingConsistency: number;
  reviewParticipation: number;
  avgPrSize: "Small" | "Medium" | "Large";
  mergeSuccessRate: number;
  technicalExcellenceScore: number;
}

export interface DeveloperCompareResult {
  a: DeveloperDetails;
  b: DeveloperDetails;
  aiSummary: string;
}
