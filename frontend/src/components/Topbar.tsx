import { Search, Bell } from "lucide-react";

export function Topbar() {
  return (
    <header className="flex items-center gap-3.5 px-8 py-3.5 border-b border-border bg-elev sticky top-0 z-10">
      <div className="flex items-center gap-2.5 bg-surface border border-border rounded-[10px] px-3 py-2 w-[320px] max-w-[42vw] mr-auto">
        <Search size={15} className="text-faint" />
        <span className="text-[13px] text-faint">Search engineers, repos…</span>
      </div>
      <button className="w-[38px] h-[38px] rounded-[10px] bg-surface border border-border grid place-items-center">
        <Bell size={16} className="text-mute" />
      </button>
      <div className="w-[38px] h-[38px] rounded-[10px] bg-gradient-to-br from-accent to-purple grid place-items-center font-mono font-bold text-bg text-[13px]">
        MR
      </div>
    </header>
  );
}
