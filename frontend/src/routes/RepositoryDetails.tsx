import { Link, useParams } from "react-router-dom";
import {
  Loader2, AlertTriangle, Shuffle, ShieldCheck, ShieldOff, Clock, Star,
  GitPullRequest, CircleDot, Users, Tag,
} from "lucide-react";
import { Card, Eyebrow, Avatar } from "../components/Card";
import { ScoreRing } from "../components/ScoreRing";
import { StatusPill } from "../components/StatusPill";
import { TrendChart } from "../components/TrendChart";
import { useRepo } from "../hooks/queries";
import { C } from "../lib/utils";

export default function RepositoryDetails() {
  const { owner = "", repo = "" } = useParams();
  const id = `${owner}/${repo}`;
  const { data, isLoading, isError } = useRepo(id);

  if (isLoading) {
    return <div className="flex items-center gap-2 text-sm text-mute"><Loader2 size={16} className="animate-spin" /> Loading repository…</div>;
  }
  if (isError || !data) {
    return <div className="flex items-center gap-2 text-sm text-danger"><AlertTriangle size={16} /> Couldn't load this repository.</div>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[12px] font-mono text-faint">Repository Details</div>
          <h1 className="text-[26px] text-ink font-bold m-0">{data.owner}/{data.repo}</h1>
        </div>
        <Link
          to={`/repositories/compare?a=${encodeURIComponent(id)}`}
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink bg-elev border border-border rounded-lg px-4 py-2.5 no-underline hover:border-borderHi transition-colors"
        >
          <Shuffle size={15} /> Compare this repo
        </Link>
      </div>

      {/* Overview */}
      <Card>
        <div className="flex gap-7 items-center flex-wrap">
          <ScoreRing value={data.healthScore} size={130} label="Health" />
          <div className="flex-1 min-w-[240px] flex flex-col gap-2.5">
            <StatusPill status={data.status} />
            <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
              <Stat icon={Star} label="Stars" value={data.stars} />
              <Stat icon={GitPullRequest} label="Open PRs" value={data.openPRs} />
              <Stat icon={CircleDot} label="Open Issues" value={data.openIssues} />
              <Stat icon={Users} label="Contributors" value={data.contributors} />
            </div>
            <div className="text-[12.5px] text-mute mt-1">
              {data.language} · last commit {data.lastCommit}
            </div>
          </div>
        </div>
      </Card>

      {/* Technical health trends */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card>
          <Eyebrow>Commit Trend</Eyebrow>
          <TrendChart data={data.commitTrend} color={C.accent} />
        </Card>
        <Card>
          <Eyebrow>PR Trend</Eyebrow>
          <TrendChart data={data.prTrend} color={C.purple} />
        </Card>
        <Card>
          <Eyebrow>Issue Trend</Eyebrow>
          <TrendChart data={data.issueTrend} color={C.amber} />
        </Card>
      </div>

      {/* Branch protection + review time */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card className="flex items-center gap-3.5">
          {data.branchProtection ? (
            <ShieldCheck size={22} className="text-accent shrink-0" />
          ) : (
            <ShieldOff size={22} className="text-danger shrink-0" />
          )}
          <div>
            <Eyebrow>Branch Protection</Eyebrow>
            <div className="text-[15px] text-ink font-bold mt-0.5">
              {data.branchProtection ? "Enabled on default branch" : "Not enabled"}
            </div>
          </div>
        </Card>
        <Card className="flex items-center gap-3.5">
          <Clock size={22} className="text-info shrink-0" />
          <div>
            <Eyebrow>Review Time</Eyebrow>
            <div className="text-[15px] text-ink font-bold mt-0.5">{data.avgReviewTimeHours}h average</div>
          </div>
        </Card>
      </div>

      {/* Top contributors + recent releases */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <Eyebrow>Top Contributors</Eyebrow>
          <div className="flex flex-col gap-3 mt-3">
            {data.topContributors.map((c) => (
              <div key={c.username} className="flex items-center gap-3">
                <Avatar name={c.name} size={34} />
                <div className="flex-1">
                  <div className="text-[13.5px] text-ink font-semibold">{c.name}</div>
                  <div className="text-[11.5px] text-faint font-mono">@{c.username}</div>
                </div>
                <div className="font-mono text-[13px] text-mute">{c.commits} commits</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <Eyebrow>Recent Releases</Eyebrow>
          <div className="flex flex-col gap-3 mt-3">
            {data.recentReleases.map((r) => (
              <div key={r.tag} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surfaceHi grid place-items-center shrink-0">
                  <Tag size={14} className="text-purple" />
                </div>
                <div className="flex-1">
                  <div className="text-[13.5px] text-ink font-semibold">{r.tag}</div>
                  <div className="text-[11.5px] text-faint">{r.title}</div>
                </div>
                <div className="font-mono text-[12px] text-faint">{r.date}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: number }) {
  return (
    <div className="bg-elev border border-border rounded-lg px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-faint font-mono text-[10.5px] tracking-wide uppercase">
        <Icon size={12} /> {label}
      </div>
      <div className="text-[18px] text-ink font-bold mt-1">{value}</div>
    </div>
  );
}
