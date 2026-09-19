import type { Lang } from '../i18n';
import type { Puzzle } from '../types';
import { parseTimeToMinutes } from './format';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export interface MonthlyCount {
  year: number;
  month: number;
  label: string;
  count: number;
}

/** Puzzles finished per month for the last `months` months (oldest first), based on `date` — only meaningful once a puzzle is marked done. */
export function computeMonthlyFinished(puzzles: Puzzle[], lang: Lang, months = 12, now = new Date()): MonthlyCount[] {
  const formatter = new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'short' });
  const buckets: MonthlyCount[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ year: d.getFullYear(), month: d.getMonth(), label: formatter.format(d), count: 0 });
  }
  const indexOf = new Map(buckets.map((b, i) => [`${b.year}-${b.month}`, i]));
  for (const p of puzzles) {
    if (p.status !== 'done' || !ISO_DATE.test(p.date)) continue;
    const [y, m] = p.date.split('-').map(Number);
    const idx = indexOf.get(`${y}-${m - 1}`);
    if (idx !== undefined) buckets[idx].count++;
  }
  return buckets;
}

export interface BrandCount {
  brand: string;
  count: number;
}

/** Top brands by puzzle count, with everything past `topN` folded into a single `otherLabel` row. */
export function computeBrandCounts(puzzles: Puzzle[], topN: number, otherLabel: string): BrandCount[] {
  const counts = new Map<string, number>();
  for (const p of puzzles) {
    if (!p.brand) continue;
    counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
  }
  const sorted = [...counts.entries()]
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => b.count - a.count);
  if (sorted.length <= topN) return sorted;
  const top = sorted.slice(0, topN);
  const otherCount = sorted.slice(topN).reduce((sum, b) => sum + b.count, 0);
  return [...top, { brand: otherLabel, count: otherCount }];
}

/** Puzzle counts by difficulty level 1-5 — index 0 is difficulty 1. */
export function computeDifficultyCounts(puzzles: Puzzle[]): number[] {
  const buckets = [0, 0, 0, 0, 0];
  for (const p of puzzles) {
    const d = Math.round(p.difficulty);
    if (d >= 1 && d <= 5) buckets[d - 1]++;
  }
  return buckets;
}

export interface YearRecap {
  finishedCount: number;
  totalPieces: number;
  totalMinutes: number;
}

export function computeYearRecap(puzzles: Puzzle[], year: number): YearRecap {
  const finished = puzzles.filter((p) => p.status === 'done' && p.date.startsWith(`${year}-`));
  return {
    finishedCount: finished.length,
    totalPieces: finished.reduce((sum, p) => sum + p.pieces, 0),
    totalMinutes: finished.reduce((sum, p) => sum + parseTimeToMinutes(p.time), 0),
  };
}
