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

export type Grade = "A" | "B" | "C" | "D";

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
