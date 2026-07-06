import { GitCommit, GitPullRequest, MessageSquare, BookOpen, GitBranch, FolderGit2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Category, CategoryKey } from "../lib/types";
import { C, gradeColor } from "../lib/utils";

const ICONS: Record<CategoryKey, LucideIcon> = {
  commit: GitCommit,
  pr: GitPullRequest,
  review: MessageSquare,
  docs: BookOpen,
  branch: GitBranch,
  repo: FolderGit2,
};

export function CategoryBar({ cat, value }: { cat: Category; value: number }) {
  const color = gradeColor(value);
  const Icon = ICONS[cat.key];
  return (
    <div className="mb-[18px]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-[9px]">
          <Icon size={15} color={C.mute} />
          <span className="text-[13.5px] text-ink">{cat.label}</span>
          <span className="font-mono text-[10.5px] text-faint border border-border rounded px-[5px] py-px">
            {cat.weight}%
          </span>
        </div>
        <span className="font-mono text-[13px] font-bold" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="h-1.5 bg-elev rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}
