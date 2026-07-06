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

export interface Engineer {
  id: string;
  employeeId: string;      // HLD: Employee.employeeId (Tricon internal ID)
  githubUsername: string;  // HLD: Employee.githubUsername (mapped by Employee Mapping Service)
  name: string;
  email: string;           // HLD: Employee.email
  role: string;
  team: string;
  score: number;
  grade: Grade;            // HLD: TechnicalScore.grade
  delta: number;
  commits: number;
  prs: number;
  reviews: number;
  cats: CategoryScores;
  strengths: string[];     // HLD AI Report: strengths
  weaknesses: string[];    // HLD AI Report: weaknesses
  recommendation: string;  // HLD AI Report: recommendations / improvement plan
  learning: string[];      // HLD AI Report: learning recommendations
}

export interface Repo {
  repositoryId: string;                 // HLD: Repository.repositoryId
  name: string;                         // HLD: Repository.repositoryName
  lang: string;                         // HLD: Repository.language
  visibility: "public" | "private";     // HLD: Repository.visibility
  updated: string;
  health: number;
  commits: number;
  prs: number;
  devs: number;
}

export interface Kpi {
  key: string;
  label: string;
  value: string;
  delta: string;
  note: string;
}

export interface TrendPoint {
  w: string;
  score: number;
}

export interface OrgData {
  score: number;
  engineers: number;
  repositories: number;
  kpis: Kpi[];
  trend: TrendPoint[];
}

export type SignalKind = "success" | "warning" | "info";

export interface Signal {
  kind: SignalKind;
  title: string;
  body: string;
}
