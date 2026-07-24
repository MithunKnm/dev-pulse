import { Shuffle } from "lucide-react";

export interface PickerOption {
  value: string;
  label: string;
}

export function ComparePicker({
  options,
  valueA,
  valueB,
  onChangeA,
  onChangeB,
  labelA = "Item A",
  labelB = "Item B",
}: {
  options: PickerOption[];
  valueA: string;
  valueB: string;
  onChangeA: (v: string) => void;
  onChangeB: (v: string) => void;
  labelA?: string;
  labelB?: string;
}) {
  return (
    <div className="flex items-end gap-4 flex-wrap">
      <label className="flex flex-col gap-1.5 min-w-[200px]">
        <span className="font-mono text-[11px] tracking-wide uppercase text-faint">{labelA}</span>
        <select
          value={valueA}
          onChange={(e) => onChangeA(e.target.value)}
          className="bg-elev border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none focus:border-accent transition-colors"
        >
          <option value="" disabled>Select…</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>

      <div className="pb-3 text-faint">
        <Shuffle size={16} />
      </div>

      <label className="flex flex-col gap-1.5 min-w-[200px]">
        <span className="font-mono text-[11px] tracking-wide uppercase text-faint">{labelB}</span>
        <select
          value={valueB}
          onChange={(e) => onChangeB(e.target.value)}
          className="bg-elev border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none focus:border-accent transition-colors"
        >
          <option value="" disabled>Select…</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
