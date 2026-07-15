import type { Category } from "./types";

// Phase-1 Technical Excellence metrics & weights — HLD §4 (Technical Scoring
// Engine). Total = 100. This is the real scoring model (methodology), not data.
export const CATEGORIES: Category[] = [
  { key: "commit", label: "Commit Frequency",        weight: 20 },
  { key: "pr",     label: "PR Participation",         weight: 20 },
  { key: "review", label: "Reviews",                  weight: 15 },
  { key: "docs",   label: "Documentation",            weight: 15 },
  { key: "branch", label: "Branch Hygiene",           weight: 15 },
  { key: "repo",   label: "Repository Contribution",  weight: 15 },
];
