import type { Lang } from '../i18n';
import type { PieceBucket, Puzzle } from '../types';
import { PIECE_BUCKETS, pieceBucketOf } from './filters';
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

/** The puzzles finished in a given year/month (`month` is 0-11, matching `MonthlyCount`). */
export function puzzlesFinishedInMonth(puzzles: Puzzle[], year: number, month: number): Puzzle[] {
  return puzzles.filter((p) => {
    if (p.status !== 'done' || !ISO_DATE.test(p.date)) return false;
    const [y, m] = p.date.split('-').map(Number);
    return y === year && m - 1 === month;
  });
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

/** Average minutes spent per finished puzzle, across those with a recorded time (0 if none). */
export function computeAverageMinutesPerPuzzle(puzzles: Puzzle[]): number {
  const timed = puzzles.filter((p) => p.status === 'done' && parseTimeToMinutes(p.time) > 0);
  if (timed.length === 0) return 0;
  return timed.reduce((sum, p) => sum + parseTimeToMinutes(p.time), 0) / timed.length;
}

export interface PieceBucketPace {
  bucket: PieceBucket;
  averageMinutes: number;
  count: number;
}

/** Average time spent per finished puzzle, broken down by the same piece-count buckets used in filters. */
export function computeAverageMinutesByPieceBucket(puzzles: Puzzle[]): PieceBucketPace[] {
  const sums = new Map<PieceBucket, { totalMinutes: number; count: number }>(
    PIECE_BUCKETS.map((b) => [b, { totalMinutes: 0, count: 0 }]),
  );
  for (const p of puzzles) {
    if (p.status !== 'done') continue;
    const minutes = parseTimeToMinutes(p.time);
    if (minutes <= 0) continue;
    const entry = sums.get(pieceBucketOf(p.pieces))!;
    entry.totalMinutes += minutes;
    entry.count += 1;
  }
  return PIECE_BUCKETS.map((bucket) => {
    const { totalMinutes, count } = sums.get(bucket)!;
    return { bucket, averageMinutes: count > 0 ? totalMinutes / count : 0, count };
  });
}

export interface Recap {
  finishedCount: number;
  totalPieces: number;
  totalMinutes: number;
}

/** `year: null` covers every finished puzzle regardless of when. */
export function computeRecap(puzzles: Puzzle[], year: number | null): Recap {
  const finished = puzzles.filter((p) => p.status === 'done' && (year === null || p.date.startsWith(`${year}-`)));
  return {
    finishedCount: finished.length,
    totalPieces: finished.reduce((sum, p) => sum + p.pieces, 0),
    totalMinutes: finished.reduce((sum, p) => sum + parseTimeToMinutes(p.time), 0),
  };
}
