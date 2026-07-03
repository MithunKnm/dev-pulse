import { GitBranch, GitCommit, GitPullRequest, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "../components/Card";
import { PageHeader, Loading, ErrorState } from "../components/State";
import { useRepos } from "../hooks/queries";
import { gradeColor, LANG_COLOR } from "../lib/utils";

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="flex-1">
      <div className="flex items-center gap-1.5 font-mono text-[10.5px] tracking-wide text-faint uppercase">
        <Icon size={12} /> {label}
      </div>
      <div className="font-mono text-lg font-bold text-ink mt-[5px]">{value}</div>
    </div>
  );
}

export default function Repositories() {
  const { data: repos, isPending, isError } = useRepos();

  if (isPending) return <Loading label="Loading repositories…" />;
  if (isError || !repos) return <ErrorState message="Couldn't load repositories." />;

  return (
    <>
      <PageHeader title="Repositories" sub="Health, activity and contributor analytics" />
      <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fill,minmax(340px,1fr))]">
        {repos.map((r) => (
          <Card key={r.name} hover>
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <div className="w-[38px] h-[38px] rounded-[10px] bg-surfaceHi grid place-items-center shrink-0">
                  <GitBranch size={17} className="text-accent" />
                </div>
                <div>
                  <div className="font-mono text-[15px] text-ink font-semibold">{r.name}</div>
                  <div className="flex items-center gap-1.5 text-[12.5px] text-mute mt-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: LANG_COLOR[r.lang] ?? "#8CA097" }} />
                    {r.lang} · {r.updated}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-2xl font-bold" style={{ color: gradeColor(r.health) }}>{r.health}</div>
                <div className="font-mono text-[9.5px] tracking-wide text-faint">HEALTH</div>
              </div>
            </div>

            <div className="h-1.5 bg-elev rounded-full overflow-hidden mb-[18px]">
              <div className="h-full rounded-full bg-gradient-to-r from-accent to-purple" style={{ width: `${r.health}%` }} />
            </div>

            <div className="flex border-t border-border pt-4">
              <Stat icon={GitCommit} label="Commits" value={r.commits} />
              <Stat icon={GitPullRequest} label="PRs" value={r.prs} />
              <Stat icon={Users} label="Devs" value={r.devs} />
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
