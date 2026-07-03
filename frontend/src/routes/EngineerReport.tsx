import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  ChevronLeft, GitCommit, GitPullRequest, MessageSquare, TrendingUp, TrendingDown,
  Award, AlertTriangle, Sparkles, Lightbulb, Circle,
} from "lucide-react";
import { Card, Eyebrow } from "../components/Card";
import { ScoreRing } from "../components/ScoreRing";
import { CategoryBar } from "../components/CategoryBar";
import { Loading, ErrorState } from "../components/State";
import { useEngineer } from "../hooks/queries";
import { CATEGORIES } from "../data/mock";
import { C } from "../lib/utils";

export default function EngineerReport() {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const { data: e, isPending, isError } = useEngineer(id);

  const activity = useMemo(
    () =>
      ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"].map((w) => ({
        w,
        commits: Math.round(((e?.commits ?? 0) / 8) * (0.6 + Math.random() * 0.8)),
        prs: Math.round(((e?.prs ?? 0) / 8) * (0.5 + Math.random())),
      })),
    [id, e?.commits, e?.prs]
  );

  if (isPending) return <Loading label="Generating report…" />;
  if (isError || !e) return <ErrorState message="Engineer not found." />;

  const TrendIcon = e.delta >= 0 ? TrendingUp : TrendingDown;
  const stats = [
    { i: GitCommit, l: "Commits", v: String(e.commits), c: C.ink },
    { i: GitPullRequest, l: "Pull Requests", v: String(e.prs), c: C.ink },
    { i: MessageSquare, l: "Reviews", v: String(e.reviews), c: C.ink },
    { i: TrendIcon, l: "Trend", v: `${e.delta >= 0 ? "+" : ""}${e.delta}%`, c: e.delta >= 0 ? C.accent : C.danger },
  ];

  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => nav("/engineers")} className="flex items-center gap-1.5 bg-transparent border-0 text-mute cursor-pointer text-[13px] p-0">
        <ChevronLeft size={16} /> Back to scorecards
      </button>

      {/* Header */}
      <Card>
        <div className="flex gap-7 items-center flex-wrap">
          <ScoreRing value={e.score} size={140} label={e.name.split(" ")[0]} />
          <div className="flex-1 min-w-[240px]">
            <Eyebrow>Technical Excellence Report</Eyebrow>
            <h1 className="text-[30px] text-ink font-extrabold mt-1 mb-1">{e.name}</h1>
            <div className="text-sm text-mute mb-[18px]">{e.role} · {e.team}</div>
            <div className="flex gap-[26px] flex-wrap">
              {stats.map((s) => (
                <div key={s.l}>
                  <div className="flex items-center gap-1.5 text-faint text-[11px] font-mono uppercase tracking-wide">
                    <s.i size={13} /> {s.l}
                  </div>
                  <div className="font-mono text-[21px] font-bold mt-1" style={{ color: s.c }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <Eyebrow>Category Breakdown</Eyebrow>
          <div className="text-base text-ink font-bold mt-1 mb-5">Weighted excellence dimensions</div>
          {CATEGORIES.map((c) => <CategoryBar key={c.key} cat={c} value={e.cats[c.key]} />)}
        </Card>

        <Card>
          <Eyebrow>Contribution Activity</Eyebrow>
          <div className="text-base text-ink font-bold mt-1 mb-3.5">Commits &amp; PRs · last 8 weeks</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activity} margin={{ left: -24, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="w" stroke={C.faint} tick={{ fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
              <YAxis stroke={C.faint} tick={{ fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: C.elev, border: `1px solid ${C.borderHi}`, borderRadius: 10, color: C.ink }} cursor={{ fill: C.surfaceHi }} />
              <Bar dataKey="commits" fill={C.accent} radius={[3, 3, 0, 0]} />
              <Bar dataKey="prs" fill={C.purple} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-[18px] justify-center font-mono text-xs text-mute">
            <span><Circle size={9} fill={C.accent} color={C.accent} className="inline -mb-px" /> Commits</span>
            <span><Circle size={9} fill={C.purple} color={C.purple} className="inline -mb-px" /> PRs</span>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card className="!border-accent/30">
          <div className="flex items-center gap-2 mb-3.5">
            <Award size={17} className="text-accent" /><span className="text-base text-ink font-bold">Strengths</span>
          </div>
          {e.strengths.map((s) => (
            <div key={s} className="flex gap-[9px] py-[7px] text-[13.5px] text-ink"><span className="text-accent">✓</span> {s}</div>
          ))}
        </Card>
        <Card className="!border-amber/30">
          <div className="flex items-center gap-2 mb-3.5">
            <AlertTriangle size={17} className="text-amber" /><span className="text-base text-ink font-bold">Improvement Areas</span>
          </div>
          {e.improvements.map((s) => (
            <div key={s} className="flex gap-[9px] py-[7px] text-[13.5px] text-ink"><span className="text-amber">△</span> {s}</div>
          ))}
        </Card>
      </div>

      <Card className="!border-borderHi bg-gradient-to-br from-surface to-elev">
        <div className="flex gap-3.5">
          <div className="shrink-0 w-10 h-10 rounded-[11px] bg-gradient-to-br from-accent to-purple grid place-items-center">
            <Sparkles size={20} className="text-bg" />
          </div>
          <div>
            <Eyebrow>AI Recommendation</Eyebrow>
            <p className="text-[14.5px] text-ink leading-relaxed mt-1">{e.recommendation}</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-3.5">
          <Lightbulb size={17} className="text-purple" /><span className="text-base text-ink font-bold">Recommended Learning</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {e.learning.map((l) => (
            <span key={l} className="text-[13px] text-ink bg-elev border border-border rounded-lg px-[13px] py-2">{l}</span>
          ))}
        </div>
      </Card>
    </div>
  );
}
