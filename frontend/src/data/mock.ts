import type { Engineer, Repo, OrgData, Signal, Category } from "../lib/types";

export const CATEGORIES: Category[] = [
  { key: "commit",  label: "Commit Consistency",   weight: 20 },
  { key: "pr",      label: "PR Quality",           weight: 20 },
  { key: "review",  label: "Review Participation", weight: 15 },
  { key: "docs",    label: "Documentation",        weight: 15 },
  { key: "testing", label: "Testing Practices",    weight: 15 },
  { key: "hygiene", label: "Repository Hygiene",   weight: 15 },
];

// Team of 6 — roles per the DEV-PULSE README.
export const ENGINEERS: Engineer[] = [
  {
    id: "raman", name: "Raman Kishore", role: "Backend Lead", team: "Platform",
    score: 91, delta: 2.1, commits: 312, prs: 74, reviews: 118,
    cats: { commit: 92, pr: 90, review: 88, docs: 84, testing: 90, hygiene: 96 },
    strengths: ["Excellent API design discipline", "Thorough PR descriptions", "Strong service test coverage"],
    improvements: ["Break down large PRs", "Spread reviews across the squad"],
    recommendation:
      "Introduce a Playwright-driven integration test suite for the GitHub webhook pipeline and require test evidence in the PR template.",
    learning: ["Trunk-based development", "PR sizing best practices", "Playwright integration testing"],
  },
  {
    id: "gauri", name: "Gauri S", role: "Data Intelligence", team: "Analytics",
    score: 87, delta: 6.4, commits: 221, prs: 48, reviews: 72,
    cats: { commit: 88, pr: 84, review: 74, docs: 76, testing: 90, hygiene: 86 },
    strengths: ["Robust scoring-engine test suite", "Clear analytics logic", "Reliable delivery cadence"],
    improvements: ["Review PRs outside the analytics repo", "Document scoring weights via an ADR"],
    recommendation:
      "Rotate onto 1–2 PRs per week outside the analytics repo. Draft an ADR for the Technical Excellence scoring weights before the Sprint 3 review.",
    learning: ["Effective code-review techniques", "Architecture Decision Records (ADRs)"],
  },
  {
    id: "akanksha", name: "Akanksha D", role: "AI Engineer", team: "AI",
    score: 84, delta: 3.8, commits: 176, prs: 41, reviews: 58,
    cats: { commit: 84, pr: 82, review: 76, docs: 86, testing: 66, hygiene: 88 },
    strengths: ["Strong prompt engineering", "Well-documented report generator", "Clean module structure"],
    improvements: ["Add tests for LLM output parsing", "Increase review participation"],
    recommendation:
      "Great work on the recommendation engine and report generator; documentation is a standout. Prioritize automated tests around LLM output parsing to guard against regressions.",
    learning: ["Testing async / LLM code", "Prompt evaluation frameworks"],
  },
  {
    id: "mithun", name: "Mithun R", role: "Product Owner", team: "Core",
    score: 82, delta: 4.2, commits: 148, prs: 32, reviews: 61,
    cats: { commit: 88, pr: 84, review: 90, docs: 68, testing: 54, hygiene: 86 },
    strengths: ["Consistent commit activity", "High code review participation", "Good branch naming standards"],
    improvements: ["Increase unit test coverage", "Improve commit message quality"],
    recommendation:
      "Focus the next sprint on raising unit test coverage from ~54% to 70%+ on the analytics service. Adopt Conventional Commits and pair with Akanksha on ADR-style documentation for the scoring engine.",
    learning: ["Conventional Commits spec", "Unit testing with pytest", "Writing ADRs"],
  },
  {
    id: "yasir", name: "Yasir A", role: "Frontend Engineer", team: "Frontend",
    score: 79, delta: 5.6, commits: 189, prs: 39, reviews: 44,
    cats: { commit: 82, pr: 76, review: 66, docs: 64, testing: 60, hygiene: 88 },
    strengths: ["Polished dashboard UI", "Consistent component patterns", "Good repository hygiene"],
    improvements: ["Add component tests", "Improve documentation coverage", "Engage more in reviews"],
    recommendation:
      "The dashboard experience is clean and consistent. To reach the next tier, invest in component-level testing and document reusable UI patterns.",
    learning: ["Component testing with Vitest", "Storybook for UI docs"],
  },
  {
    id: "abhishek", name: "Abhishek K", role: "AI Engineer", team: "Integration",
    score: 76, delta: -1.2, commits: 143, prs: 35, reviews: 40,
    cats: { commit: 80, pr: 78, review: 72, docs: 64, testing: 66, hygiene: 76 },
    strengths: ["Strong integration work", "Balanced full-stack contributions", "Good PR turnaround"],
    improvements: ["Raise documentation standards", "Add tests on the integration layer"],
    recommendation:
      "Reliable contributor bridging the AI services and the app. Focus on documenting integration contracts and adding tests around the end-to-end flow to reverse the recent dip.",
    learning: ["Integration / contract testing", "API documentation with OpenAPI"],
  },
];

const avg = Math.round(ENGINEERS.reduce((a, e) => a + e.score, 0) / ENGINEERS.length);
const sum = (k: "commits" | "prs" | "reviews") => ENGINEERS.reduce((a, e) => a + e[k], 0);

export const ORG: OrgData = {
  score: avg, // 83
  engineers: ENGINEERS.length,
  repositories: 6,
  kpis: [
    { key: "score",   label: "Excellence Score", value: String(avg),                 delta: "+3.4%",  note: "vs last sprint" },
    { key: "commits", label: "Commits",          value: sum("commits").toLocaleString(), delta: "+12.1%", note: "last 30d" },
    { key: "prs",     label: "Pull Requests",    value: String(sum("prs")),           delta: "+5.8%",  note: "opened" },
    { key: "reviews", label: "Code Reviews",     value: String(sum("reviews")),       delta: "+9.2%",  note: "completed" },
  ],
  trend: [
    { w: "W1", score: 72 }, { w: "W2", score: 74 }, { w: "W3", score: 76 },
    { w: "W4", score: 78 }, { w: "W5", score: 80 }, { w: "W6", score: 82 },
    { w: "W7", score: avg },
  ],
};

export const REPOS: Repo[] = [
  { name: "dev-pulse-frontend",   lang: "TypeScript", updated: "15m ago", health: 82, commits: 720, prs: 148, devs: 2 },
  { name: "dev-pulse-api",        lang: "Python",     updated: "40m ago", health: 88, commits: 611, prs: 132, devs: 2 },
  { name: "dev-pulse-scoring",    lang: "Python",     updated: "3h ago",  health: 86, commits: 312, prs: 71,  devs: 1 },
  { name: "dev-pulse-ai",         lang: "Python",     updated: "1d ago",  health: 84, commits: 274, prs: 58,  devs: 2 },
  { name: "dev-pulse-github-svc", lang: "Python",     updated: "6h ago",  health: 89, commits: 188, prs: 44,  devs: 1 },
  { name: "dev-pulse-metrics",    lang: "Python",     updated: "5h ago",  health: 90, commits: 498, prs: 96,  devs: 2 },
];

export const ORG_SIGNALS: Signal[] = [
  {
    kind: "success", title: "Testing practices trending up",
    body: "Team-wide testing score improved by 8 points over the last 3 sprints, led by Gauri and Raman.",
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
