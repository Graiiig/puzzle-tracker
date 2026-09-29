import { DEFAULT_GENRES } from '../data';
import type { Puzzle } from '../types';
import { parseTimeToMinutes } from './format';

export type AchievementId =
  | 'firstStep'
  | 'collector'
  | 'expert'
  | 'marathon'
  | 'dedicated'
  | 'superfan'
  | 'eclectic'
  | 'demanding';

export interface Achievement {
  id: AchievementId;
  icon: string;
  current: number;
  target: number;
  unlocked: boolean;
}

/** Badge progress computed from a user's own puzzles (finished-only, except where noted). */
export function computeAchievements(puzzles: Puzzle[]): Achievement[] {
  const done = puzzles.filter((p) => p.status === 'done');
  const totalPieces = done.reduce((sum, p) => sum + p.pieces, 0);
  const totalMinutes = done.reduce((sum, p) => sum + parseTimeToMinutes(p.time), 0);

  const artistCounts = new Map<string, number>();
  for (const p of puzzles) {
    if (!p.artist) continue;
    artistCounts.set(p.artist, (artistCounts.get(p.artist) ?? 0) + 1);
  }
  const maxArtistCount = Math.max(0, ...artistCounts.values());

  const doneGenres = new Set(done.flatMap((p) => p.genres));
  const eclecticCount = DEFAULT_GENRES.filter((g) => doneGenres.has(g)).length;

  const fiveStarCount = done.filter((p) => p.rating === 5).length;

  const defs: Array<{ id: AchievementId; icon: string; current: number; target: number }> = [
    { id: 'firstStep', icon: '🧩', current: done.length, target: 1 },
    { id: 'collector', icon: '📦', current: done.length, target: 10 },
    { id: 'expert', icon: '🏆', current: done.length, target: 50 },
    { id: 'marathon', icon: '🌍', current: totalPieces, target: 5000 },
    { id: 'dedicated', icon: '⏱️', current: totalMinutes, target: 600 },
    { id: 'superfan', icon: '🎨', current: maxArtistCount, target: 5 },
    { id: 'eclectic', icon: '🌈', current: eclecticCount, target: DEFAULT_GENRES.length },
    { id: 'demanding', icon: '⭐', current: fiveStarCount, target: 10 },
  ];

  return defs.map((d) => ({ ...d, current: Math.min(d.current, d.target), unlocked: d.current >= d.target }));
}
