import { Loader2, AlertTriangle } from "lucide-react";

export function PageHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-[26px] font-bold text-ink m-0">{title}</h1>
      <p className="text-sm text-mute mt-1">{sub}</p>
    </div>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-24 text-mute">
      <Loader2 size={18} className="animate-spin text-accent" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorState({ message = "Something went wrong." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-24 text-danger">
      <AlertTriangle size={18} />
      <span className="text-sm">{message}</span>
    </div>
  );
}
