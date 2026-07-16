// Client-side PDF export for a completed LiveReport.
//
// Why PDF and not CSV: this report is mostly narrative (strengths /
// weaknesses / recommendations / learning are free-text lists), which
// flattens awkwardly into rows-and-columns. PDF renders it as an actual
// shareable document — same shape as the on-screen report — with no
// backend involvement.

import { jsPDF } from "jspdf";
import type { LiveReport, CategoryKey } from "./types";
import { CATEGORIES } from "./metrics";

export interface ReportMeta {
  name: string;
  githubUsername: string;
  owner: string;
  repo: string;
}

const LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label])) as Record<CategoryKey, string>;
const WEIGHTS = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.weight])) as Record<CategoryKey, number>;

const MARGIN_X = 18;
const PAGE_BOTTOM = 280;

// jsPDF's built-in "helvetica" font only supports the WinAnsi (Windows-1252)
// character set. Any character outside that set — including the ✓ △ →
// bullets this file used to draw directly, and any smart quotes / emoji /
// other Unicode punctuation the AI-generated report text (strengths,
// weaknesses, recommendations, learning) can contain — gets silently
// mapped to the wrong glyph instead of erroring, which is what produced
// the garbled/unreadable PDF. Route every string through this before
// calling doc.text() / splitTextToSize().
const SYMBOL_MAP: Record<string, string> = {
  "\u2713": "+", // ✓
  "\u2714": "+", // ✔
  "\u2717": "x", // ✗
  "\u2718": "x", // ✘
  "\u25B3": "-", // △
  "\u25B2": "-", // ▲
  "\u25CF": "-", // ●
  "\u2192": "->", // →
  "\u2190": "<-", // ←
  "\u21D2": "=>", // ⇒
  "\u2606": "*", // ☆
  "\u2605": "*", // ★
  "\u26A0": "!", // ⚠
  "\u2139": "i", // ℹ
  "\u2018": "'",
  "\u2019": "'",
  "\u201C": '"',
  "\u201D": '"',
  "\u2013": "-",
  "\u2014": "-",
  "\u2026": "...",
  "\u00A0": " ",
};

function sanitizeForPdf(input: string | null | undefined): string {
  if (!input) return "";
  let out = "";
  for (const ch of input) {
    const code = ch.codePointAt(0) ?? 0;
    if (SYMBOL_MAP[ch]) {
      out += SYMBOL_MAP[ch];
    } else if (code <= 0xff) {
      // Latin-1 range: safe for the standard PDF fonts.
      out += ch;
    }
    // else: drop unsupported character (emoji, CJK, misc symbols, etc.)
  }
  return out.replace(/[ \t]{2,}/g, " ").trim();
}

function ensureRoom(doc: jsPDF, y: number, needed = 10): number {
  if (y + needed <= PAGE_BOTTOM) return y;
  doc.addPage();
  return 20;
}

function wrapped(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight = 5.2): number {
  const lines: string[] = doc.splitTextToSize(text, maxWidth);
  let cursor = y;
  for (const line of lines) {
    cursor = ensureRoom(doc, cursor, lineHeight);
    doc.text(line, x, cursor);
    cursor += lineHeight;
  }
  return cursor;
}

export function downloadReportPdf(report: LiveReport, meta: ReportMeta): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - MARGIN_X * 2;
  let y = 20;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(20);
  doc.text(sanitizeForPdf("DEV-PULSE — Technical Excellence Report"), MARGIN_X, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(sanitizeForPdf(`Generated ${new Date().toLocaleString()}`), MARGIN_X, y);
  y += 7;

  doc.setDrawColor(210);
  doc.line(MARGIN_X, y, pageWidth - MARGIN_X, y);
  y += 9;

  // Identity
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20);
  doc.text(sanitizeForPdf(meta.name || meta.githubUsername), MARGIN_X, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(100);
  doc.text(sanitizeForPdf(`@${meta.githubUsername}  ·  ${meta.owner}/${meta.repo}`), MARGIN_X, y);
  y += 11;

  // Score + grade
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(20);
  doc.text(`${report.score}/100`, MARGIN_X, y + 7);

  doc.setFontSize(13);
  doc.text(`Grade ${report.grade}`, MARGIN_X + 48, y + 6);
  y += 18;

  doc.setDrawColor(230);
  doc.line(MARGIN_X, y, pageWidth - MARGIN_X, y);
  y += 9;

  // Metric breakdown
  y = ensureRoom(doc, y, 14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20);
  doc.text("Metric Breakdown", MARGIN_X, y);
  y += 7;

  doc.setFontSize(10);
  (Object.keys(report.cats) as CategoryKey[]).forEach((key) => {
    y = ensureRoom(doc, y, 7);
    const label = LABELS[key] ?? key;
    const weight = WEIGHTS[key];
    doc.setFont("helvetica", "normal");
    doc.setTextColor(70);
    doc.text(sanitizeForPdf(`${label}  (${weight}%)`), MARGIN_X, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20);
    doc.text(`${report.cats[key]}/100`, pageWidth - MARGIN_X - 16, y, { align: "right" });
    y += 6;
  });
  y += 6;

  const section = (title: string, items: string[], bullet: string) => {
    y = ensureRoom(doc, y, 14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20);
    doc.text(sanitizeForPdf(title), MARGIN_X, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60);

    if (!items.length) {
      doc.text("None returned.", MARGIN_X, y);
      y += 9;
      return;
    }

    const safeBullet = sanitizeForPdf(bullet) || "-";
    items.forEach((item) => {
      y = ensureRoom(doc, y, 6);
      y = wrapped(doc, `${safeBullet} ${sanitizeForPdf(item)}`, MARGIN_X, y, contentWidth);
      y += 2;
    });
    y += 6;
  };

  section("Strengths", report.strengths, "+");
  section("Weaknesses", report.weaknesses, "-");
  section("AI Recommendations", report.recommendations, "->");
  if (report.learning.length) section("Recommended Learning", report.learning, "-");

  const safeName = (meta.name || meta.githubUsername || "report")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "_");
  doc.save(`dev-pulse-report-${safeName}.pdf`);
}
