import { C } from "../lib/utils";

interface Props {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
}

export function ScoreRing({ value, size = 150, stroke = 11, label = "Excellence" }: Props) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const gid = `ring-${label.replace(/\s+/g, "")}`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={C.accent} />
            <stop offset="100%" stopColor={C.purple} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.border} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-mono font-bold text-ink leading-none" style={{ fontSize: size * 0.3 }}>
            {value}
          </div>
          <div className="font-mono text-[10.5px] tracking-[1.5px] uppercase text-faint mt-1.5">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}
