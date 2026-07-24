import { Link } from "react-router-dom";
import { Loader2, AlertTriangle, Shuffle, Star, GitPullRequest, CircleDot, Users } from "lucide-react";
import { Card, Eyebrow } from "../components/Card";
import { StatusPill } from "../components/StatusPill";
import { useRepos } from "../hooks/queries";
import { gradeColor } from "../lib/utils";

export default function Repositories() {
  const { data: repos, isLoading, isError } = useRepos();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[26px] text-ink font-bold m-0">Repositories</h1>
          <p className="text-sm text-mute mt-1">
            All repositories accessible through GitHub MCP, with technical health at a glance.
          </p>
        </div>
        <Link
          to="/repositories/compare"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink bg-elev border border-border rounded-lg px-4 py-2.5 no-underline hover:border-borderHi transition-colors"
        >
          <Shuffle size={15} /> Compare repositories
        </Link>
      </div>

      <Card className="!p-0 overflow-hidden">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-mute p-6">
            <Loader2 size={16} className="animate-spin" /> Loading repositories…
          </div>
        )}
        {isError && (
          <div className="flex items-center gap-2 text-sm text-danger p-6">
            <AlertTriangle size={16} /> Couldn't load repositories.
          </div>
        )}
        {repos && (
          <table className="w-full border-collapse text-[13.5px]">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="px-5 py-3 font-mono text-[11px] tracking-wide uppercase text-faint font-medium">Repository</th>
                <th className="px-5 py-3 font-mono text-[11px] tracking-wide uppercase text-faint font-medium">Health</th>
                <th className="px-5 py-3 font-mono text-[11px] tracking-wide uppercase text-faint font-medium">Stars</th>
                <th className="px-5 py-3 font-mono text-[11px] tracking-wide uppercase text-faint font-medium">Open PRs</th>
                <th className="px-5 py-3 font-mono text-[11px] tracking-wide uppercase text-faint font-medium">Open Issues</th>
                <th className="px-5 py-3 font-mono text-[11px] tracking-wide uppercase text-faint font-medium">Last Commit</th>
                <th className="px-5 py-3 font-mono text-[11px] tracking-wide uppercase text-faint font-medium">Contributors</th>
                <th className="px-5 py-3 font-mono text-[11px] tracking-wide uppercase text-faint font-medium">Language</th>
                <th className="px-5 py-3 font-mono text-[11px] tracking-wide uppercase text-faint font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {repos.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-surfaceHi transition-colors">
                  <td className="px-5 py-3.5">
                    <Link to={`/repositories/${r.owner}/${r.repo}`} className="text-ink font-semibold no-underline hover:text-accent">
                      {r.owner}/{r.repo}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold" style={{ color: gradeColor(r.healthScore) }}>
                    {r.healthScore}
                  </td>
                  <td className="px-5 py-3.5 text-mute">
                    <span className="inline-flex items-center gap-1"><Star size={13} /> {r.stars}</span>
                  </td>
                  <td className="px-5 py-3.5 text-mute">
                    <span className="inline-flex items-center gap-1"><GitPullRequest size={13} /> {r.openPRs}</span>
                  </td>
                  <td className="px-5 py-3.5 text-mute">
                    <span className="inline-flex items-center gap-1"><CircleDot size={13} /> {r.openIssues}</span>
                  </td>
                  <td className="px-5 py-3.5 text-mute font-mono text-[12.5px]">{r.lastCommit}</td>
                  <td className="px-5 py-3.5 text-mute">
                    <span className="inline-flex items-center gap-1"><Users size={13} /> {r.contributors}</span>
                  </td>
                  <td className="px-5 py-3.5 text-mute">{r.language}</td>
                  <td className="px-5 py-3.5"><StatusPill status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {repos && (
        <p className="text-[11.5px] text-faint font-mono">{repos.length} repositories</p>
      )}
    </div>
  );
}
