import { Link, useParams } from "react-router-dom";
import { Loader2, AlertTriangle, Shuffle, GitCommit, GitPullRequest, MessageSquare, Activity, GitMerge, Ruler } from "lucide-react";
import { Card, Eyebrow, Avatar } from "../components/Card";
import { ScoreRing } from "../components/ScoreRing";
import { TrendChart } from "../components/TrendChart";
import { useDeveloper } from "../hooks/queries";
import { C, gradeColor } from "../lib/utils";

export default function DeveloperDetails() {
  const { username = "" } = useParams();
  const { data, isLoading, isError } = useDeveloper(username);

  if (isLoading) {
    return <div className="flex items-center gap-2 text-sm text-mute"><Loader2 size={16} className="animate-spin" /> Loading developer…</div>;
  }
  if (isError || !data) {
    return <div className="flex items-center gap-2 text-sm text-danger"><AlertTriangle size={16} /> Couldn't load this developer.</div>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3.5">
          <Avatar name={data.name} size={50} />
          <div>
            <h1 className="text-[24px] text-ink font-bold m-0">{data.name}</h1>
            <div className="text-[12.5px] text-faint font-mono">@{data.username}</div>
          </div>
        </div>
        <Link
          to={`/developers/compare?a=${encodeURIComponent(data.username)}`}
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink bg-elev border border-border rounded-lg px-4 py-2.5 no-underline hover:border-borderHi transition-colors"
        >
          <Shuffle size={15} /> Compare this developer
        </Link>
      </div>

      {/* Overview */}
      <Card>
        <div className="flex gap-7 items-center flex-wrap">
          <ScoreRing value={data.technicalExcellenceScore} size={130} label="Excellence" />
          <div className="flex-1 min-w-[240px] grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(130px,1fr))]">
            <Stat icon={GitCommit} label="Commits" value={data.commits} />
            <Stat icon={GitPullRequest} label="PRs" value={data.prs} />
            <Stat icon={MessageSquare} label="Reviews" value={data.reviews} />
            <Stat icon={Activity} label="Activity" value={data.activityScore} colorize />
          </div>
        </div>
      </Card>

      {/* Experience trend + weekly activity */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <Eyebrow>Experience Trend</Eyebrow>
          <TrendChart data={data.experienceTrend} color={C.purple} />
        </Card>
        <Card>
          <Eyebrow>Weekly Activity</Eyebrow>
          <TrendChart data={data.weeklyActivity} color={C.accent} />
        </Card>
      </div>

      {/* Coding consistency, review participation, avg PR size, merge success */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <Eyebrow>Coding Consistency</Eyebrow>
          <MeterRow value={data.codingConsistency} />
        </Card>
        <Card>
          <Eyebrow>Review Participation</Eyebrow>
          <MeterRow value={data.reviewParticipation} />
        </Card>
        <Card className="flex items-center gap-3.5">
          <Ruler size={20} className="text-info shrink-0" />
          <div>
            <Eyebrow>Average PR Size</Eyebrow>
            <div className="text-[15px] text-ink font-bold mt-0.5">{data.avgPrSize}</div>
          </div>
        </Card>
        <Card className="flex items-center gap-3.5">
          <GitMerge size={20} className="text-accent shrink-0" />
          <div>
            <Eyebrow>Merge Success</Eyebrow>
            <div className="text-[15px] text-ink font-bold mt-0.5">{data.mergeSuccessRate}%</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, colorize }: {
  icon: typeof GitCommit; label: string; value: number; colorize?: boolean;
}) {
  return (
    <div className="bg-elev border border-border rounded-lg px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-faint font-mono text-[10.5px] tracking-wide uppercase">
        <Icon size={12} /> {label}
      </div>
      <div className="text-[18px] font-bold mt-1" style={{ color: colorize ? gradeColor(value) : C.ink }}>
        {value}
      </div>
    </div>
  );
}

function MeterRow({ value }: { value: number }) {
  const color = gradeColor(value);
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[13px] font-bold" style={{ color }}>{value}/100</span>
      </div>
      <div className="h-1.5 bg-elev rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}
