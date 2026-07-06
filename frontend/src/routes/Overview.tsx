import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Sparkles, GitCommit, GitPullRequest, MessageSquare, Gauge } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, Eyebrow, DeltaBadge } from "../components/Card";
import { ScoreRing } from "../components/ScoreRing";
import { Loading, ErrorState } from "../components/State";
import { useOrg } from "../hooks/queries";
import { C } from "../lib/utils";

const KPI_ICON: Record<string, LucideIcon> = {
  score: Gauge, commits: GitCommit, prs: GitPullRequest, reviews: MessageSquare,
};

export default function Overview() {
  const { data: org, isPending, isError } = useOrg();

  if (isPending) return <Loading label="Loading organization overview…" />;
  if (isError || !org) return <ErrorState message="Couldn't load the overview." />;

  return (
    <div className="flex flex-col gap-5">
      {/* Hero */}
      <div>
        <div className="flex items-center gap-3 mb-[18px]">
          <span className="inline-flex items-center gap-[7px] font-mono text-[11px] tracking-wide text-accent bg-accentDim border border-borderHi rounded-full px-[11px] py-[5px]">
            <span className="w-[7px] h-[7px] rounded-full bg-accent" /> LIVE · DEV-PULSE
          </span>
          <span className="text-[13px] text-mute font-mono">
            {org.engineers} engineers · {org.repositories} repositories
          </span>
        </div>

        <h1 className="text-[44px] leading-[1.08] font-extrabold text-ink m-0 tracking-tight max-w-[900px]">
          Objective, AI-powered{" "}
          <span className="bg-gradient-to-br from-accent to-purple bg-clip-text text-transparent">
            technical excellence
          </span>{" "}
          for every engineer in the org.
        </h1>
        <p className="text-[15.5px] text-mute leading-relaxed mt-4 max-w-[720px]">
          DEV-PULSE analyzes commits, PRs, reviews and branch hygiene across your GitHub org
          through the Model Context Protocol (MCP), then generates Technical Excellence Reports
          and personalized recommendations backed by an LLM.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(210px,1fr))]">
        {org.kpis.map((k) => {
          const Icon = KPI_ICON[k.key];
          return (
            <Card key={k.key}>
              <div className="flex justify-between items-start mb-3.5">
                <Eyebrow>{k.label}</Eyebrow>
                {Icon && <Icon size={16} className="text-faint" />}
              </div>
              <div className="font-mono text-[38px] font-bold text-ink leading-none">{k.value}</div>
              <div className="flex items-center gap-2 mt-3">
                <DeltaBadge value={parseFloat(k.delta)} />
                <span className="text-xs text-mute">{k.note}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Trend + ring */}
      <div className="grid gap-4 grid-cols-1 lg:[grid-template-columns:1.7fr_1fr]">
        <Card>
          <div className="flex justify-between items-start mb-1.5">
            <div>
              <div className="text-base text-ink font-bold">Excellence Score Trend</div>
              <div className="text-[13px] text-mute mt-0.5">Weighted org average across 6 categories · last 7 weeks</div>
            </div>
            <div className="text-right">
              <span className="font-mono text-3xl font-bold text-ink">{org.score}</span>
              <span className="font-mono text-[13px] text-accent ml-2">+11 pts</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={org.trend} margin={{ left: -22, right: 8, top: 14 }}>
              <defs>
                <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.accent} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="stroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={C.accent} />
                  <stop offset="100%" stopColor={C.purple} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="w" stroke={C.faint} tick={{ fontSize: 12, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
              <YAxis domain={[65, 90]} stroke={C.faint} tick={{ fontSize: 12, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: C.elev, border: `1px solid ${C.borderHi}`, borderRadius: 10, color: C.ink }} />
              <Area type="monotone" dataKey="score" stroke="url(#stroke)" strokeWidth={3} fill="url(#area)"
                dot={{ fill: C.bg, stroke: C.accent, strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="flex flex-col items-center justify-center gap-3.5">
          <div className="self-start">
            <div className="text-base text-ink font-bold">Org Score</div>
            <div className="text-[13px] text-mute mt-0.5">Weighted composite</div>
          </div>
          <ScoreRing value={org.score} size={190} stroke={13} />
          <div className="flex items-center gap-[7px] text-[13px] text-mute">
            <Sparkles size={14} className="text-purple" /> AI-scored across the squad
          </div>
        </Card>
      </div>
    </div>
  );
}
