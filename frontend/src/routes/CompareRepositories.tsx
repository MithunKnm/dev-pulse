import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, AlertTriangle, Sparkles } from "lucide-react";
import { Card, Eyebrow } from "../components/Card";
import { ComparePicker } from "../components/ComparePicker";
import { useRepos, useCompareRepos } from "../hooks/queries";
import { gradeColor } from "../lib/utils";

export default function CompareRepositories() {
  const [params] = useSearchParams();
  const { data: repos } = useRepos();
  const [idA, setIdA] = useState(params.get("a") ?? "");
  const [idB, setIdB] = useState(params.get("b") ?? "");

  const compare = useCompareRepos(idA || undefined, idB || undefined);

  const options = (repos ?? []).map((r) => ({ value: r.id, label: `${r.owner}/${r.repo}` }));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] text-ink font-bold m-0">Compare Repositories</h1>
        <p className="text-sm text-mute mt-1">Pick two repositories to compare technical health side by side.</p>
      </div>

      <Card>
        <ComparePicker
          options={options}
          valueA={idA}
          valueB={idB}
          onChangeA={setIdA}
          onChangeB={setIdB}
          labelA="Repo A"
          labelB="Repo B"
        />
      </Card>

      {idA && idB && idA === idB && (
        <Card className="!border-amber/40">
          <div className="flex items-center gap-2 text-[13.5px] text-ink">
            <AlertTriangle size={16} className="text-amber" /> Pick two different repositories.
          </div>
        </Card>
      )}

      {compare.isLoading && idA && idB && idA !== idB && (
        <div className="flex items-center gap-2 text-sm text-mute"><Loader2 size={16} className="animate-spin" /> Comparing…</div>
      )}

      {compare.isError && (
        <div className="flex items-center gap-2 text-sm text-danger"><AlertTriangle size={16} /> Couldn't compare these repositories.</div>
      )}

      {compare.data && (
        <>
          <Card className="!p-0 overflow-hidden">
            <table className="w-full border-collapse text-[13.5px]">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="px-5 py-3 font-mono text-[11px] tracking-wide uppercase text-faint font-medium">Metric</th>
                  <th className="px-5 py-3 font-mono text-[11px] tracking-wide uppercase text-faint font-medium">{compare.data.a.owner}/{compare.data.a.repo}</th>
                  <th className="px-5 py-3 font-mono text-[11px] tracking-wide uppercase text-faint font-medium">{compare.data.b.owner}/{compare.data.b.repo}</th>
                </tr>
              </thead>
              <tbody>
                <Row label="Health Score" a={compare.data.a.healthScore} b={compare.data.b.healthScore} colorize />
                <Row label="Review Time" a={`${compare.data.a.avgReviewTimeHours}h`} b={`${compare.data.b.avgReviewTimeHours}h`} />
                <Row label="Open Issues" a={compare.data.a.openIssues} b={compare.data.b.openIssues} />
                <Row label="Open PRs" a={compare.data.a.openPRs} b={compare.data.b.openPRs} />
                <Row label="Contributors" a={compare.data.a.contributors} b={compare.data.b.contributors} />
                <Row label="Stars" a={compare.data.a.stars} b={compare.data.b.stars} />
              </tbody>
            </table>
          </Card>

          <Card className="!border-borderHi bg-gradient-to-br from-surface to-elev">
            <div className="flex gap-3.5">
              <div className="shrink-0 w-10 h-10 rounded-[11px] bg-gradient-to-br from-accent to-purple grid place-items-center">
                <Sparkles size={20} className="text-bg" />
              </div>
              <div>
                <Eyebrow>AI Summary</Eyebrow>
                <p className="text-[14px] text-ink leading-relaxed mt-2 mb-0">{compare.data.aiSummary}</p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function Row({ label, a, b, colorize }: { label: string; a: number | string; b: number | string; colorize?: boolean }) {
  const styleA = colorize && typeof a === "number" ? { color: gradeColor(a) } : undefined;
  const styleB = colorize && typeof b === "number" ? { color: gradeColor(b as number) } : undefined;
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-5 py-3 text-mute">{label}</td>
      <td className="px-5 py-3 font-mono font-bold text-ink" style={styleA}>{a}</td>
      <td className="px-5 py-3 font-mono font-bold text-ink" style={styleB}>{b}</td>
    </tr>
  );
}
