// Raw hex values for use in places Tailwind classes can't reach:
// recharts props and inline SVG gradients. Kept in sync with tailwind.config.js.
export const C = {
  bg: "#090C0B",
  elev: "#0E1312",
  surface: "#121917",
  surfaceHi: "#18211F",
  border: "#1D2926",
  borderHi: "#294039",
  ink: "#EAF2EE",
  mute: "#8CA097",
  faint: "#586B63",
  accent: "#35D9A2",
  purple: "#A78BFA",
  amber: "#F5B544",
  danger: "#F2726B",
  info: "#5AB0E0",
} as const;

export const gradeColor = (s: number): string =>
  s >= 70 ? C.accent : s >= 55 ? C.amber : C.danger;

export const gradeLabel = (s: number): string =>
  s >= 85 ? "Exemplary" : s >= 70 ? "Strong" : s >= 55 ? "Developing" : "At Risk";

// HLD §4: Technical Scoring Engine emits a letter grade alongside the score
// (e.g. "84/100, Grade B"). Matches backend/app/analytics/scoring_engine.py:
// A ≥90, B ≥80, C ≥70, D ≥60, else F.
export const gradeLetter = (s: number): "A" | "B" | "C" | "D" | "F" =>
  s >= 90 ? "A" : s >= 80 ? "B" : s >= 70 ? "C" : s >= 60 ? "D" : "F";

export const initialsOf = (name: string): string =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

export const LANG_COLOR: Record<string, string> = {
  TypeScript: "#3B82F6",
  Python: "#A78BFA",
  "Node.js": "#22C55E",
  Java: "#F59E0B",
};
