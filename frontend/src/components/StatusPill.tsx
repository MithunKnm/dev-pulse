import type { RepoStatus } from "../lib/types";
import { C } from "../lib/utils";

const CONFIG: Record<RepoStatus, { label: string; color: string }> = {
  healthy: { label: "Healthy", color: C.accent },
  attention: { label: "Needs Attention", color: C.amber },
  critical: { label: "Critical", color: C.danger },
};

export function StatusPill({ status }: { status: RepoStatus }) {
  const { label, color } = CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold rounded-md px-2 py-[3px] border"
      style={{ color, borderColor: color + "40", background: color + "14" }}
    >
      <span className="w-[6px] h-[6px] rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
