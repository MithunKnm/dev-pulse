// -----------------------------------------------------------------------------
// API layer.
//
// The FastAPI backend currently exposes exactly two endpoints, and both are
// wired here:
//   GET  /api/v1/health   -> { status: "ok" }
//   POST /api/v1/analyze  -> runs the GitHub-MCP pipeline for ONE developer on
//                            ONE repo and returns a live score + grade + the six
//                            0-100 metrics + an AI report.
//
// There is NO persistence and NO list/aggregate endpoints, so the app has no
// stored developers, repositories, insights, or reports to show — only the
// live, on-demand analysis below.
// -----------------------------------------------------------------------------
import type { AnalyzeInput, AnalyzeApiResponse, LiveReport, Grade } from "./types";

// Point this at the running FastAPI server. Override with VITE_API_BASE in .env.
export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/health`);
    if (!res.ok) return false;
    const data = await res.json();
    return data?.status === "ok";
  } catch {
    return false;
  }
}

function toGrade(g: string | null, score?: number | null): Grade {
  if (g === "A" || g === "B" || g === "C" || g === "D" || g === "F") return g;
  // Backend didn't send a recognized letter — derive one from the score
  // instead of guessing, so a low score never gets mislabeled as "D".
  if (typeof score === "number") {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  }
  return "F";
}

/** Run the live DEV-PULSE pipeline for a developer on a repository. */
export async function analyzeDeveloper(input: AnalyzeInput): Promise<LiveReport> {
  const res = await fetch(`${API_BASE}/api/v1/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner: input.owner.trim(),
      repo: input.repo.trim(),
      github_username: input.githubUsername.trim(),
      employee_id: input.employeeId?.trim() || "EMP-001",
      name: input.name?.trim() || "",
    }),
  });

  if (!res.ok) {
    // FastAPI returns { detail: "..." } for HTTPException (e.g. 502 pipeline error)
    let detail = `Analyze failed (HTTP ${res.status})`;
    try {
      const err = await res.json();
      if (err?.detail) detail = typeof err.detail === "string" ? err.detail : JSON.stringify(err.detail);
    } catch { /* ignore parse error */ }
    throw new Error(detail);
  }

  const data: AnalyzeApiResponse = await res.json();
  if (data.error) throw new Error(data.error);
  if (!data.metrics || !data.ai_report || data.technical_score == null) {
    throw new Error("Backend returned an incomplete analysis.");
  }

  const m = data.metrics;
  // Map backend snake_case metrics -> frontend CategoryScores keys (both 0-100).
  return {
    score: Math.round(data.technical_score),
    grade: toGrade(data.grade, data.technical_score),
    cats: {
      commit: Math.round(m.commit_frequency),
      pr: Math.round(m.pr_participation),
      review: Math.round(m.code_review_participation),
      docs: Math.round(m.documentation_contribution),
      branch: Math.round(m.branch_hygiene),
      repo: Math.round(m.repository_contribution),
    },
    strengths: data.ai_report.strengths ?? [],
    weaknesses: data.ai_report.weaknesses ?? [],
    recommendations: data.ai_report.recommendations ?? [],
    learning: data.ai_report.learning ?? [],
  };
}
