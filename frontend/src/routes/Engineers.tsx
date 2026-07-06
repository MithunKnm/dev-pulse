import { useNavigate } from "react-router-dom";
import { Card, Avatar, DeltaBadge } from "../components/Card";
import { PageHeader, Loading, ErrorState } from "../components/State";
import { useEngineers } from "../hooks/queries";
import { gradeColor } from "../lib/utils";

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center flex-1">
      <div className="font-mono text-lg font-bold text-ink">{value}</div>
      <div className="font-mono text-[10.5px] tracking-wide text-faint uppercase mt-[3px]">{label}</div>
    </div>
  );
}

export default function Engineers() {
  const nav = useNavigate();
  const { data: engineers, isPending, isError } = useEngineers();

  if (isPending) return <Loading label="Loading engineers…" />;
  if (isError || !engineers) return <ErrorState message="Couldn't load engineers." />;

  return (
    <>
      <PageHeader title="Engineers" sub="Technical excellence scorecards across the squad" />
      <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fill,minmax(340px,1fr))]">
        {engineers.map((e) => (
          <Card key={e.id} hover onClick={() => nav(`/engineers/${e.id}`)}>
            <div className="flex items-center gap-[13px] mb-[18px]">
              <Avatar name={e.name} size={46} />
              <div>
                <div className="text-base text-ink font-bold">{e.name}</div>
                <div className="text-[12.5px] text-mute mt-0.5">{e.role} · {e.team}</div>
              </div>
            </div>

            <div className="flex items-end justify-between mb-[18px]">
              <div>
                <div className="flex items-baseline gap-[3px]">
                  <span className="font-mono text-[40px] font-bold leading-none" style={{ color: gradeColor(e.score) }}>
                    {e.score}
                  </span>
                  <span className="font-mono text-[15px] text-faint">/100</span>
                  <span
                    className="font-mono text-[12px] font-bold rounded px-1.5 py-0.5 ml-1.5 self-center border"
                    style={{ color: gradeColor(e.score), borderColor: gradeColor(e.score) + "55", background: gradeColor(e.score) + "14" }}
                  >
                    {e.grade}
                  </span>
                </div>
                <div className="font-mono text-[10.5px] tracking-wide text-faint uppercase mt-1.5">Excellence Score</div>
              </div>
              <DeltaBadge value={e.delta} />
            </div>

            <div className="flex border-t border-border pt-4">
              <Stat value={e.commits} label="Commits" />
              <Stat value={e.prs} label="PRs" />
              <Stat value={e.reviews} label="Reviews" />
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
