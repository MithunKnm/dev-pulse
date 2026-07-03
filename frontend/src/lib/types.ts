// Domain types shared across the app.

export interface CategoryScores {
  commit: number;
  pr: number;
  review: number;
  docs: number;
  testing: number;
  hygiene: number;
}

export type CategoryKey = keyof CategoryScores;

export interface Category {
  key: CategoryKey;
  label: string;
  weight: number;
}

export interface Engineer {
  id: string;
  name: string;
  role: string;
  team: string;
  score: number;
  delta: number;
  commits: number;
  prs: number;
  reviews: number;
  cats: CategoryScores;
  strengths: string[];
  improvements: string[];
  recommendation: string;
  learning: string[];
}

export interface Repo {
  name: string;
  lang: string;
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
