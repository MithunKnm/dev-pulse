import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, AlertTriangle, Sparkles } from "lucide-react";
import { Card, Eyebrow } from "../components/Card";
import { ComparePicker } from "../components/ComparePicker";
import { useDevelopers, useCompareDevelopers } from "../hooks/queries";
import { gradeColor } from "../lib/utils";

export default function CompareDevelopers() {
  const [params] = useSearchParams();
  const { data: devs } = useDevelopers();
  const [userA, setUserA] = useState(params.get("a") ?? "");
  const [userB, setUserB] = useState(params.get("b") ?? "");

  const compare = useCompareDevelopers(userA || undefined, userB || undefined);

  const options = (devs ?? []).map((d) => ({ value: d.username, label: `${d.name} (@${d.username})` }));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] text-ink font-bold m-0">Compare Developers</h1>
        <p className="text-sm text-mute mt-1">Pick two developers to compare technical excellence side by side.</p>
      </div>

      <Card>
        <ComparePicker
          options={options}
          valueA={userA}
          valueB={userB}
          onChangeA={setUserA}
          onChangeB={setUserB}
          labelA="Developer A"
          labelB="Developer B"
        />
      </Card>

      {userA && userB && userA === userB && (
        <Card className="!border-amber/40">
          <div className="flex items-center gap-2 text-[13.5px] text-ink">
            <AlertTriangle size={16} className="text-amber" /> Pick two different developers.
          </div>
        </Card>
      )}

      {compare.isLoading && userA && userB && userA !== userB && (
        <div className="flex items-center gap-2 text-sm text-mute"><Loader2 size={16} className="animate-spin" /> Comparing…</div>
      )}

      {compare.isError && (
        <div className="flex items-center gap-2 text-sm text-danger"><AlertTriangle size={16} /> Couldn't compare these developers.</div>
      )}

      {compare.data && (
        <>
          <Card className="!p-0 overflow-hidden">
            <table className="w-full border-collapse text-[13.5px]">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="px-5 py-3 font-mono text-[11px] tracking-wide uppercase text-faint font-medium">Metric</th>
                  <th className="px-5 py-3 font-mono text-[11px] tracking-wide uppercase text-faint font-medium">{compare.data.a.name}</th>
                  <th className="px-5 py-3 font-mono text-[11px] tracking-wide uppercase text-faint font-medium">{compare.data.b.name}</th>
                </tr>
              </thead>
              <tbody>
                <Row label="Commits" a={compare.data.a.commits} b={compare.data.b.commits} />
                <Row label="PRs" a={compare.data.a.prs} b={compare.data.b.prs} />
                <Row label="Reviews" a={compare.data.a.reviews} b={compare.data.b.reviews} />
                <Row label="Merge Rate" a={`${compare.data.a.mergeSuccessRate}%`} b={`${compare.data.b.mergeSuccessRate}%`} />
                <Row label="Avg PR Size" a={compare.data.a.avgPrSize} b={compare.data.b.avgPrSize} />
                <Row label="Technical Excellence" a={compare.data.a.technicalExcellenceScore} b={compare.data.b.technicalExcellenceScore} colorize />
              </tbody>
            </table>
          </Card>

          <Card className="!border-borderHi bg-gradient-to-br from-surface to-elev">
            <div className="flex gap-3.5">
              <div className="shrink-0 w-10 h-10 rounded-[11px] bg-gradient-to-br from-accent to-purple grid place-items-center">
                <Sparkles size={20} className="text-bg" />
              </div>
              <div>
                <Eyebrow>AI Says</Eyebrow>
                <p className="text-[14px] text-ink leading-relaxed mt-2 mb-0">{compare.data.aiSummary}</p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function Row({ label, a, b, colorize }: {
  label: string; a: number | string; b: number | string; colorize?: boolean;
}) {
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
