import { useState, type FormEvent } from "react";
import { Play, Loader2, AlertTriangle, Sparkles, Award, Lightbulb, Github } from "lucide-react";
import { Card, Eyebrow } from "../components/Card";
import { ScoreRing } from "../components/ScoreRing";
import { CategoryBar } from "../components/CategoryBar";
import { useAnalyze } from "../hooks/queries";
import { CATEGORIES } from "../lib/metrics";
import { gradeColor } from "../lib/utils";

function Field({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[11px] tracking-wide uppercase text-faint">
        {label}{required && <span className="text-accent"> *</span>}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-elev border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none focus:border-accent transition-colors"
      />
    </label>
  );
}

export default function Analyze() {
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");

  const analyze = useAnalyze();
  const report = analyze.data;
  const canSubmit = owner.trim() && repo.trim() && githubUsername.trim() && !analyze.isPending;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    analyze.mutate({ owner, repo, githubUsername, employeeId, name });
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] text-ink font-bold m-0">Live Analysis</h1>
        <p className="text-sm text-mute mt-1">
          Run the real DEV-PULSE pipeline against GitHub via the backend (POST&nbsp;/api/v1/analyze).
        </p>
      </div>

      {/* Input form */}
      <Card>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
            <Field label="Repo owner" value={owner} onChange={setOwner} placeholder="e.g. octocat" required />
            <Field label="Repository" value={repo} onChange={setRepo} placeholder="e.g. Hello-World" required />
            <Field label="GitHub username" value={githubUsername} onChange={setGithubUsername} placeholder="e.g. octocat" required />
            <Field label="Employee ID" value={employeeId} onChange={setEmployeeId} placeholder="EMP-001 (optional)" />
            <Field label="Display name" value={name} onChange={setName} placeholder="optional" />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-bg bg-accent rounded-lg px-4 py-2.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {analyze.isPending ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
              {analyze.isPending ? "Analyzing…" : "Run analysis"}
            </button>
            <span className="text-[12px] text-faint font-mono flex items-center gap-1.5">
              <Github size={13} /> analyzes one developer on one repo
            </span>
          </div>
        </form>
      </Card>

      {/* Error */}
      {analyze.isError && (
        <Card className="!border-danger/40">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-danger shrink-0 mt-0.5" />
            <div>
              <div className="text-sm text-ink font-semibold">Analysis failed</div>
              <p className="text-[13px] text-mute mt-1 m-0">{(analyze.error as Error)?.message}</p>
              <p className="text-[12px] text-faint mt-2 m-0">
                Check the backend is running and that GITHUB_PERSONAL_ACCESS_TOKEN is configured on the server.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Live report */}
      {report && (
        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex gap-7 items-center flex-wrap">
              <ScoreRing value={report.score} size={140} label="Technical" />
              <div className="flex-1 min-w-[240px]">
                <Eyebrow>Live Technical Excellence Report</Eyebrow>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <h2 className="text-[24px] text-ink font-extrabold">
                    {name || githubUsername}
                  </h2>
                  <span
                    className="font-mono text-[13px] font-bold rounded-md px-2.5 py-1 border"
                    style={{ color: gradeColor(report.score), borderColor: gradeColor(report.score) + "55", background: gradeColor(report.score) + "14" }}
                  >
                    Grade {report.grade}
                  </span>
                </div>
                <div className="text-sm text-mute mt-1">
                  <span className="font-mono text-faint">@{githubUsername}</span> · {owner}/{repo}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <Eyebrow>Metric Breakdown</Eyebrow>
            <div className="text-base text-ink font-bold mt-1 mb-5">Weighted excellence dimensions</div>
            {CATEGORIES.map((c) => <CategoryBar key={c.key} cat={c} value={report.cats[c.key]} />)}
          </Card>

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card className="!border-accent/30">
              <div className="flex items-center gap-2 mb-3.5">
                <Award size={17} className="text-accent" /><span className="text-base text-ink font-bold">Strengths</span>
              </div>
              {report.strengths.length ? report.strengths.map((s) => (
                <div key={s} className="flex gap-[9px] py-[7px] text-[13.5px] text-ink"><span className="text-accent">✓</span> {s}</div>
              )) : <div className="text-[13px] text-faint">None returned.</div>}
            </Card>
            <Card className="!border-amber/30">
              <div className="flex items-center gap-2 mb-3.5">
                <AlertTriangle size={17} className="text-amber" /><span className="text-base text-ink font-bold">Weaknesses</span>
              </div>
              {report.weaknesses.length ? report.weaknesses.map((s) => (
                <div key={s} className="flex gap-[9px] py-[7px] text-[13.5px] text-ink"><span className="text-amber">△</span> {s}</div>
              )) : <div className="text-[13px] text-faint">None returned.</div>}
            </Card>
          </div>

          <Card className="!border-borderHi bg-gradient-to-br from-surface to-elev">
            <div className="flex gap-3.5">
              <div className="shrink-0 w-10 h-10 rounded-[11px] bg-gradient-to-br from-accent to-purple grid place-items-center">
                <Sparkles size={20} className="text-bg" />
              </div>
              <div>
                <Eyebrow>AI Recommendations</Eyebrow>
                {report.recommendations.length ? (
                  <ul className="mt-2 mb-0 pl-4 flex flex-col gap-2">
                    {report.recommendations.map((r) => (
                      <li key={r} className="text-[14px] text-ink leading-relaxed">{r}</li>
                    ))}
                  </ul>
                ) : <p className="text-[13px] text-faint mt-2 m-0">None returned.</p>}
              </div>
            </div>
          </Card>

          {report.learning.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-3.5">
                <Lightbulb size={17} className="text-purple" /><span className="text-base text-ink font-bold">Recommended Learning</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {report.learning.map((l) => (
                  <span key={l} className="text-[13px] text-ink bg-elev border border-border rounded-lg px-[13px] py-2">{l}</span>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
