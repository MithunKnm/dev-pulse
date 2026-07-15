import { Link } from "react-router-dom";
import {
  Zap, ArrowRight, Github, Shuffle, Gauge, Sparkles, FileText, Database,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, Eyebrow } from "../components/Card";
import { CATEGORIES } from "../lib/metrics";
import { C } from "../lib/utils";

const PIPELINE: { icon: LucideIcon; label: string; note: string }[] = [
  { icon: Github, label: "GitHub (MCP)", note: "commits, PRs, reviews, branches" },
  { icon: Shuffle, label: "Normalize", note: "generic activity model" },
  { icon: Gauge, label: "Score", note: "6 weighted metrics → /100 + grade" },
  { icon: Sparkles, label: "AI Report", note: "strengths, weaknesses, learning" },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div>
        <div className="flex items-center gap-3 mb-[18px]">
          <span className="inline-flex items-center gap-[7px] font-mono text-[11px] tracking-wide text-accent bg-accentDim border border-borderHi rounded-full px-[11px] py-[5px]">
            <span className="w-[7px] h-[7px] rounded-full bg-accent" /> MVP · LIVE ANALYSIS
          </span>
          <span className="text-[13px] text-mute font-mono">on-demand · one developer at a time</span>
        </div>

        <h1 className="text-[44px] leading-[1.08] font-extrabold text-ink m-0 tracking-tight max-w-[900px]">
          Objective, AI-powered{" "}
          <span className="bg-gradient-to-br from-accent to-purple bg-clip-text text-transparent">
            technical excellence
          </span>{" "}
          from real GitHub activity.
        </h1>
        <p className="text-[15.5px] text-mute leading-relaxed mt-4 max-w-[720px]">
          DEV-PULSE analyzes a developer's contributions on a GitHub repository through the Model
          Context Protocol (MCP), scores them across six engineering metrics, and generates an
          AI-written Technical Excellence Report — on demand, in real time.
        </p>

        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 mt-6 text-[14px] font-semibold text-bg bg-accent rounded-lg px-5 py-3 no-underline"
        >
          <Zap size={16} /> Run a live analysis <ArrowRight size={16} />
        </Link>
      </div>

      {/* How it works */}
      <div>
        <Eyebrow>How it works</Eyebrow>
        <div className="grid gap-3 mt-3 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
          {PIPELINE.map((s, i) => (
            <Card key={s.label} className="relative">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-[10px] bg-surfaceHi grid place-items-center">
                  <s.icon size={17} className="text-accent" />
                </div>
                <span className="font-mono text-[11px] text-faint">STEP {i + 1}</span>
              </div>
              <div className="text-[15px] text-ink font-bold">{s.label}</div>
              <div className="text-[12.5px] text-mute mt-1">{s.note}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Scoring model (real methodology, not data) */}
      <Card>
        <Eyebrow>Scoring model</Eyebrow>
        <div className="text-base text-ink font-bold mt-1 mb-4">
          Six weighted metrics · total 100
        </div>
        <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {CATEGORIES.map((c) => (
            <div key={c.key} className="flex items-center justify-between bg-elev border border-border rounded-lg px-3.5 py-3">
              <span className="text-[13.5px] text-ink">{c.label}</span>
              <span className="font-mono text-[13px] font-bold" style={{ color: C.accent }}>{c.weight}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Honest roadmap note */}
      <Card className="!border-borderHi bg-gradient-to-br from-surface to-elev">
        <div className="flex gap-3.5">
          <div className="shrink-0 w-10 h-10 rounded-[11px] bg-surfaceHi grid place-items-center">
            <Database size={19} className="text-purple" />
          </div>
          <div>
            <Eyebrow>Not available yet</Eyebrow>
            <p className="text-[14px] text-ink leading-relaxed mt-1.5 mb-0">
              Aggregate views — an organization dashboard, an engineer directory, saved reports and
              historical trends — need a database and list endpoints on the backend. DEV-PULSE
              doesn't persist results yet, so today the app runs a fresh
              {" "}<Link to="/analyze" className="text-accent no-underline">live analysis</Link>{" "}
              each time instead of showing stored data.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
