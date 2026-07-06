import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, GitBranch, Sparkles, FileText, Activity } from "lucide-react";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/engineers", label: "Engineers", icon: Users },
  { to: "/repositories", label: "Repositories", icon: GitBranch },
  { to: "/insights", label: "AI Insights", icon: Sparkles },
  { to: "/reports", label: "Reports", icon: FileText },
];

export function Sidebar() {
  return (
    <aside className="w-[236px] shrink-0 bg-elev border-r border-border p-4 pt-[22px] flex flex-col sticky top-0 h-screen">
      {/* Brand */}
      <div className="flex items-center gap-[11px] px-1.5 pb-[26px]">
        <div className="w-[38px] h-[38px] rounded-[10px] bg-gradient-to-br from-accent to-purple grid place-items-center">
          <Activity size={20} className="text-bg" strokeWidth={2.4} />
        </div>
        <div>
          <div className="text-[15px] font-extrabold text-ink leading-none tracking-tight">DEV-PULSE</div>
          <div className="font-mono text-[9.5px] text-faint tracking-[2px] mt-[3px]">TECHNICAL EXCELLENCE</div>
        </div>
      </div>

      <div className="font-mono text-[10px] tracking-[1.5px] text-faint px-3 pb-2.5">WORKSPACE</div>

      <nav className="flex flex-col gap-[3px] flex-1">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13.5px] no-underline border-l-2 transition-colors",
                isActive
                  ? "bg-surfaceHi text-ink border-accent"
                  : "text-mute border-transparent hover:bg-surface",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <n.icon size={17} className={isActive ? "text-accent" : "text-mute"} />
                <span className="flex-1">{n.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex gap-2.5 p-3.5 rounded-xl bg-surface border border-border mt-2">
        <Sparkles size={16} className="text-purple shrink-0 mt-0.5" />
        <div>
          <div className="text-[12.5px] text-ink font-semibold">DEV-PULSE · Sprint 3</div>
          <div className="text-[11.5px] text-mute mt-[3px] leading-snug">
            Connect the GitHub MCP server to replace mock data with live analytics.
          </div>
        </div>
      </div>
    </aside>
  );
}
