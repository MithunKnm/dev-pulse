import type { Engineer, Repo, OrgData, Signal, Category } from "../lib/types";
import { gradeLetter } from "../lib/utils";

// Phase-1 metrics & weights — HLD §4 (Technical Scoring Engine). Total = 100.
export const CATEGORIES: Category[] = [
  { key: "commit", label: "Commit Frequency",        weight: 20 },
  { key: "pr",     label: "PR Participation",         weight: 20 },
  { key: "review", label: "Reviews",                  weight: 15 },
  { key: "docs",   label: "Documentation",            weight: 15 },
  { key: "branch", label: "Branch Hygiene",           weight: 15 },
  { key: "repo",   label: "Repository Contribution",  weight: 15 },
];

// Team of 6. Fields mirror the HLD DB model (Employee + TechnicalScore + AIReport).
// githubUsername values are what the Employee Mapping Service resolves to a Tricon employee.
const RAW: Omit<Engineer, "grade">[] = [
  {
    id: "raman", employeeId: "1023", githubUsername: "ramankishore", email: "raman.kishore@tricon.com",
    name: "Raman Kishore", role: "Backend Lead", team: "Platform",
    score: 91, delta: 2.1, commits: 312, prs: 74, reviews: 118,
    cats: { commit: 92, pr: 90, review: 88, docs: 84, branch: 96, repo: 90 },
    strengths: ["Excellent API design discipline", "Thorough PR descriptions", "Strong service test coverage"],
    weaknesses: ["Break down large PRs", "Spread reviews across the squad"],
    recommendation:
      "Introduce a Playwright-driven integration test suite for the GitHub webhook pipeline and require test evidence in the PR template.",
    learning: ["Trunk-based development", "PR sizing best practices", "Playwright integration testing"],
  },
  {
    id: "gauri", employeeId: "1041", githubUsername: "gauri-s", email: "gauri.s@tricon.com",
    name: "Gauri S", role: "Data Intelligence", team: "Analytics",
    score: 87, delta: 6.4, commits: 221, prs: 48, reviews: 72,
    cats: { commit: 88, pr: 84, review: 74, docs: 76, branch: 86, repo: 88 },
    strengths: ["Robust scoring-engine logic", "Clear analytics pipelines", "Reliable delivery cadence"],
    weaknesses: ["Review PRs outside the analytics repo", "Document scoring weights via an ADR"],
    recommendation:
      "Rotate onto 1–2 PRs per week outside the analytics repo. Draft an ADR for the Technical Excellence scoring weights before the Sprint 3 review.",
    learning: ["Effective code-review techniques", "Architecture Decision Records (ADRs)"],
  },
  {
    id: "akanksha", employeeId: "1055", githubUsername: "akanksha-d", email: "akanksha.d@tricon.com",
    name: "Akanksha D", role: "AI Engineer", team: "AI",
    score: 84, delta: 3.8, commits: 176, prs: 41, reviews: 58,
    cats: { commit: 84, pr: 82, review: 76, docs: 86, branch: 88, repo: 80 },
    strengths: ["Strong prompt engineering", "Well-documented report generator", "Clean module structure"],
    weaknesses: ["Add tests for LLM output parsing", "Increase review participation"],
    recommendation:
      "Great work on the recommendation engine and report generator; documentation is a standout. Prioritize automated tests around LLM output parsing to guard against regressions.",
    learning: ["Testing async / LLM code", "Prompt evaluation frameworks"],
  },
  {
    id: "mithun", employeeId: "1023-po", githubUsername: "mithunmani", email: "mithun.r@tricon.com",
    name: "Mithun R", role: "Product Owner", team: "Core",
    score: 82, delta: 4.2, commits: 148, prs: 32, reviews: 61,
    cats: { commit: 88, pr: 84, review: 90, docs: 68, branch: 86, repo: 78 },
    strengths: ["Consistent commit activity", "High code review participation", "Good branch naming standards"],
    weaknesses: ["Improve documentation contribution", "Raise commit message quality"],
    recommendation:
      "Adopt Conventional Commits and pair with Akanksha on ADR-style documentation for the scoring engine. Focus the next sprint on lifting documentation contribution, the lowest metric.",
    learning: ["Conventional Commits spec", "Writing ADRs", "Technical documentation practices"],
  },
  {
    id: "yasir", employeeId: "1067", githubUsername: "yasir-07", email: "mohammed.yasir@tricon.com",
    name: "Yasir A", role: "Frontend Engineer", team: "Frontend",
    score: 79, delta: 5.6, commits: 189, prs: 39, reviews: 44,
    cats: { commit: 82, pr: 76, review: 66, docs: 64, branch: 88, repo: 84 },
    strengths: ["Polished dashboard UI", "Consistent component patterns", "Good branch hygiene"],
    weaknesses: ["Improve documentation coverage", "Engage more in code reviews"],
    recommendation:
      "The dashboard experience is clean and consistent. To reach the next grade, document reusable UI patterns and take on more review participation across the frontend repo.",
    learning: ["Component documentation with Storybook", "Reviewing frontend PRs effectively"],
  },
  {
    id: "abhishek", employeeId: "1072", githubUsername: "abhishek-k", email: "abhishek.k@tricon.com",
    name: "Abhishek K", role: "AI Engineer", team: "Integration",
    score: 76, delta: -1.2, commits: 143, prs: 35, reviews: 40,
    cats: { commit: 80, pr: 78, review: 72, docs: 64, branch: 76, repo: 82 },
    strengths: ["Strong integration work", "Balanced full-stack contributions", "Good PR turnaround"],
    weaknesses: ["Raise documentation standards", "Improve branch hygiene on feature work"],
    recommendation:
      "Reliable contributor bridging the AI services and the app. Document integration contracts and tidy feature-branch hygiene to reverse the recent score dip.",
    learning: ["API documentation with OpenAPI", "Git branching strategy"],
  },
];

export const ENGINEERS: Engineer[] = RAW.map((e) => ({ ...e, grade: gradeLetter(e.score) }));

const avg = Math.round(ENGINEERS.reduce((a, e) => a + e.score, 0) / ENGINEERS.length);
const sum = (k: "commits" | "prs" | "reviews") => ENGINEERS.reduce((a, e) => a + e[k], 0);

export const ORG: OrgData = {
  score: avg, // 83
  engineers: ENGINEERS.length,
  repositories: 6,
  kpis: [
    { key: "score",   label: "Excellence Score", value: String(avg),                     delta: "+3.4%",  note: "vs last sprint" },
    { key: "commits", label: "Commits",          value: sum("commits").toLocaleString(), delta: "+12.1%", note: "last 30d" },
    { key: "prs",     label: "Pull Requests",    value: String(sum("prs")),              delta: "+5.8%",  note: "opened" },
    { key: "reviews", label: "Code Reviews",     value: String(sum("reviews")),          delta: "+9.2%",  note: "completed" },
  ],
  trend: [
    { w: "W1", score: 72 }, { w: "W2", score: 74 }, { w: "W3", score: 76 },
    { w: "W4", score: 78 }, { w: "W5", score: 80 }, { w: "W6", score: 82 },
    { w: "W7", score: avg },
  ],
};

export const REPOS: Repo[] = [
  { repositoryId: "R-01", name: "dev-pulse-frontend",   lang: "TypeScript", visibility: "private", updated: "15m ago", health: 82, commits: 720, prs: 148, devs: 2 },
  { repositoryId: "R-02", name: "dev-pulse-api",        lang: "Python",     visibility: "private", updated: "40m ago", health: 88, commits: 611, prs: 132, devs: 2 },
  { repositoryId: "R-03", name: "dev-pulse-scoring",    lang: "Python",     visibility: "private", updated: "3h ago",  health: 86, commits: 312, prs: 71,  devs: 1 },
  { repositoryId: "R-04", name: "dev-pulse-ai",         lang: "Python",     visibility: "private", updated: "1d ago",  health: 84, commits: 274, prs: 58,  devs: 2 },
  { repositoryId: "R-05", name: "dev-pulse-mcp-client", lang: "Python",     visibility: "private", updated: "6h ago",  health: 89, commits: 188, prs: 44,  devs: 1 },
  { repositoryId: "R-06", name: "dev-pulse-metrics",    lang: "Python",     visibility: "private", updated: "5h ago",  health: 90, commits: 498, prs: 96,  devs: 2 },
];

export const ORG_SIGNALS: Signal[] = [
  {
    kind: "success", title: "Commit frequency trending up",
    body: "Team-wide commit frequency improved by 8 points over the last 3 sprints, led by Gauri and Raman.",
  },
  {
    kind: "warning", title: "Documentation gap on architectural changes",
    body: "3 of 6 engineers show documentation scores below 75. Consider adopting ADRs for the scoring engine.",
  },
  {
    kind: "info", title: "Cross-team review opportunity",
    body: "Frontend reviews backend PRs 40% less than the org median. A review rotation could help.",
  },
];
