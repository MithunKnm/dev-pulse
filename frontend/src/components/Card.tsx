import type { ReactNode, HTMLAttributes } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { initialsOf } from "../lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export function Card({ children, hover, className = "", ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={[
        "bg-surface border border-border rounded-2xl p-[22px] transition",
        hover ? "hover:border-borderHi hover:-translate-y-0.5 cursor-pointer" : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono text-[11px] tracking-[1.4px] uppercase text-faint">
      {children}
    </div>
  );
}

export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <div
      className="shrink-0 grid place-items-center font-mono font-bold text-bg bg-gradient-to-br from-accent to-purple"
      style={{ width: size, height: size, borderRadius: size * 0.28, fontSize: size * 0.36 }}
    >
      {initialsOf(name)}
    </div>
  );
}

export function DeltaBadge({ value }: { value: number }) {
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={[
        "inline-flex items-center gap-1 font-mono text-xs font-semibold rounded-md px-2 py-[3px] border",
        up
          ? "text-accent bg-accent/10 border-accent/25"
          : "text-danger bg-danger/10 border-danger/25",
      ].join(" ")}
    >
      <Icon size={12} /> {up ? "+" : ""}{value}%
    </span>
  );
}
