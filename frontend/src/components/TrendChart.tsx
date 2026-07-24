import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { TrendPoint } from "../lib/types";
import { C } from "../lib/utils";

export function TrendChart({ data, color = C.accent, height = 110 }: {
  data: TrendPoint[];
  color?: string;
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke={C.border} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: C.faint, fontSize: 10 }} axisLine={{ stroke: C.border }} tickLine={false} />
          <YAxis tick={{ fill: C.faint, fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
          <Tooltip
            contentStyle={{ background: C.elev, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: C.mute }}
            itemStyle={{ color: C.ink }}
          />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
