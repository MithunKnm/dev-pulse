import { Link } from "react-router-dom";
import { Loader2, AlertTriangle, Shuffle, GitCommit, GitPullRequest, MessageSquare } from "lucide-react";
import { Card, Avatar } from "../components/Card";
import { useDevelopers } from "../hooks/queries";
import { gradeColor } from "../lib/utils";

export default function Developers() {
  const { data: devs, isLoading, isError } = useDevelopers();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[26px] text-ink font-bold m-0">Developers</h1>
          <p className="text-sm text-mute mt-1">All contributors/users visible through GitHub MCP.</p>
        </div>
        <Link
          to="/developers/compare"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink bg-elev border border-border rounded-lg px-4 py-2.5 no-underline hover:border-borderHi transition-colors"
        >
          <Shuffle size={15} /> Compare developers
        </Link>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-mute"><Loader2 size={16} className="animate-spin" /> Loading developers…</div>
      )}
      {isError && (
        <div className="flex items-center gap-2 text-sm text-danger"><AlertTriangle size={16} /> Couldn't load developers.</div>
      )}

      {devs && (
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
          {devs.map((d) => (
            <Link key={d.id} to={`/developers/${d.username}`} className="no-underline">
              <Card hover className="h-full">
                <div className="flex items-center gap-3">
                  <Avatar name={d.name} size={42} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14.5px] text-ink font-bold truncate">{d.name}</div>
                    <div className="text-[11.5px] text-faint font-mono">@{d.username}</div>
                  </div>
                  <div className="font-mono text-[15px] font-bold" style={{ color: gradeColor(d.activityScore) }}>
                    {d.activityScore}
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3.5 text-[12.5px] text-mute">
                  <span className="inline-flex items-center gap-1"><GitCommit size={13} /> {d.commits}</span>
                  <span className="inline-flex items-center gap-1"><GitPullRequest size={13} /> {d.prs}</span>
                  <span className="inline-flex items-center gap-1"><MessageSquare size={13} /> {d.reviews}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
