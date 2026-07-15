import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useHealth } from "../hooks/queries";

function BackendStatus() {
  const { data: healthy, isLoading } = useHealth();
  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-mono text-faint">
        <Loader2 size={13} className="animate-spin" /> checking backend…
      </span>
    );
  }
  return healthy ? (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-mono text-accent">
      <CheckCircle2 size={13} /> backend online
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-mono text-danger">
      <XCircle size={13} /> backend offline
    </span>
  );
}

export function Topbar() {
  return (
    <header className="flex items-center justify-between gap-3.5 px-8 py-3.5 border-b border-border bg-elev sticky top-0 z-10">
      <BackendStatus />
      <div className="w-[38px] h-[38px] rounded-[10px] bg-gradient-to-br from-accent to-purple grid place-items-center font-mono font-bold text-bg text-[13px]">
        MR
      </div>
    </header>
  );
}
