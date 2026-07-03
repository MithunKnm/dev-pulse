import { Link } from "react-router-dom";
import { Sparkles, TrendingUp, AlertTriangle, Info, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, Avatar } from "../components/Card";
import { Loading, ErrorState } from "../components/State";
import { useSignals, useEngineers } from "../hooks/queries";
import type { SignalKind } from "../lib/types";

const SIGNAL: Record<SignalKind, { icon: LucideIcon; text: string; border: string; label: string }> = {
  success: { icon: TrendingUp, text: "text-accent", border: "!border-accent/35", label: "Success" },
  warning: { icon: AlertTriangle, text: "text-amber", border: "!border-amber/35", label: "Warning" },
  info: { icon: Info, text: "text-info", border: "!border-info/35", label: "Info" },
};

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-[9px] mt-1.5 mb-4">
      <Sparkles size={17} className="text-purple" />
      <span className="text-[17px] text-ink font-bold">{children}</span>
    </div>
  );
}

export default function Insights() {
  const signals = useSignals();
  const engineers = useEngineers();

  if (signals.isPending || engineers.isPending) return <Loading label="Loading AI insights…" />;
  if (signals.isError || engineers.isError || !signals.data || !engineers.data)
    return <ErrorState message="Couldn't load insights." />;

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-3">
        <h1 className="text-[26px] text-ink font-bold m-0">AI Insights</h1>
        <p className="text-sm text-mute mt-1">LLM-generated engineering signal across the squad</p>
      </div>

      <SectionLabel>Organization signal</SectionLabel>
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))] mb-3.5">
        {signals.data.map((s) => {
          const cfg = SIGNAL[s.kind];
          const Icon = cfg.icon;
          return (
            <Card key={s.title} className={cfg.border}>
              <div className="flex items-center gap-[7px] mb-3">
                <Icon size={15} className={cfg.text} />
                <span className={`font-mono text-[11px] tracking-wide uppercase font-semibold ${cfg.text}`}>{cfg.label}</span>
              </div>
              <div className="text-[15.5px] text-ink font-bold mb-2">{s.title}</div>
              <p className="text-[13.5px] text-mute leading-relaxed m-0">{s.body}</p>
            </Card>
          );
        })}
      </div>

      <SectionLabel>Per-engineer AI recommendations</SectionLabel>
      <div className="flex flex-col gap-3">
        {engineers.data.map((e) => (
          <Card key={e.id}>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-[13px]">
                <Avatar name={e.name} size={40} />
                <div>
                  <div className="text-[15px] text-ink font-bold">{e.name}</div>
                  <div className="text-[12.5px] text-mute">{e.role} · Score {e.score}</div>
                </div>
              </div>
              <Link to={`/engineers/${e.id}`} className="inline-flex items-center gap-1.5 text-[12.5px] text-ink no-underline bg-surfaceHi border border-border rounded-lg px-3 py-[7px]">
                Full report <ArrowUpRight size={13} />
              </Link>
            </div>
            <div className="border-l-2 border-borderHi pl-3.5">
              <p className="text-sm text-ink leading-relaxed m-0">{e.recommendation}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
