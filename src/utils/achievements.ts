import { DEFAULT_GENRES } from '../data';
import type { Puzzle } from '../types';
import { parseTimeToMinutes } from './format';

export type Tier = 'bronze' | 'silver' | 'gold' | 'platinum';

export type AchievementId = 'collector' | 'marathon' | 'dedicated' | 'superfan' | 'eclectic' | 'demanding';

export interface TierDef {
  tier: Tier;
  target: number;
}

export interface Achievement {
  id: AchievementId;
  icon: string;
  current: number;
  tiers: TierDef[];
  /** Index into `tiers` of the highest tier reached, or -1 if none yet. */
  tierIndex: number;
  /** The target of the next not-yet-reached tier, or null once maxed out. */
  nextTarget: number | null;
  unlocked: boolean;
}

const DEFS: Array<{ id: AchievementId; icon: string; tiers: TierDef[] }> = [
  {
    id: 'collector',
    icon: '📦',
    tiers: [
      { tier: 'bronze', target: 1 },
      { tier: 'silver', target: 10 },
      { tier: 'gold', target: 50 },
      { tier: 'platinum', target: 150 },
    ],
  },
  {
    id: 'marathon',
    icon: '🌍',
    tiers: [
      { tier: 'bronze', target: 1000 },
      { tier: 'silver', target: 5000 },
      { tier: 'gold', target: 15000 },
      { tier: 'platinum', target: 40000 },
    ],
  },
  {
    id: 'dedicated',
    icon: '⏱️',
    tiers: [
      { tier: 'bronze', target: 120 },
      { tier: 'silver', target: 600 },
      { tier: 'gold', target: 1800 },
      { tier: 'platinum', target: 6000 },
    ],
  },
  {
    id: 'superfan',
    icon: '🎨',
    tiers: [
      { tier: 'bronze', target: 3 },
      { tier: 'silver', target: 5 },
      { tier: 'gold', target: 10 },
      { tier: 'platinum', target: 20 },
    ],
  },
  {
    id: 'eclectic',
    icon: '🌈',
    tiers: [
      { tier: 'bronze', target: 2 },
      { tier: 'silver', target: 3 },
      { tier: 'gold', target: 4 },
      { tier: 'platinum', target: DEFAULT_GENRES.length },
    ],
  },
  {
    id: 'demanding',
    icon: '⭐',
    tiers: [
      { tier: 'bronze', target: 3 },
      { tier: 'silver', target: 10 },
      { tier: 'gold', target: 25 },
      { tier: 'platinum', target: 50 },
    ],
  },
];

function computeCurrent(id: AchievementId, puzzles: Puzzle[]): number {
  const done = puzzles.filter((p) => p.status === 'done');
  switch (id) {
    case 'collector':
      return done.length;
    case 'marathon':
      return done.reduce((sum, p) => sum + p.pieces, 0);
    case 'dedicated':
      return done.reduce((sum, p) => sum + parseTimeToMinutes(p.time), 0);
    case 'superfan': {
      const counts = new Map<string, number>();
      for (const p of puzzles) {
        if (!p.artist) continue;
        counts.set(p.artist, (counts.get(p.artist) ?? 0) + 1);
      }
      return Math.max(0, ...counts.values());
    }
    case 'eclectic': {
      const genres = new Set(done.flatMap((p) => p.genres));
      return DEFAULT_GENRES.filter((g) => genres.has(g)).length;
    }
    case 'demanding':
      return done.filter((p) => p.rating === 5).length;
  }
}

/** Badge progress computed from a user's own puzzles, as multi-tier tracks (bronze/silver/gold/platinum). */
export function computeAchievements(puzzles: Puzzle[]): Achievement[] {
  return DEFS.map((def) => {
    const current = computeCurrent(def.id, puzzles);
    let tierIndex = -1;
    for (let i = 0; i < def.tiers.length; i++) {
      if (current >= def.tiers[i].target) tierIndex = i;
    }
    const nextTarget = tierIndex + 1 < def.tiers.length ? def.tiers[tierIndex + 1].target : null;
    return { id: def.id, icon: def.icon, current, tiers: def.tiers, tierIndex, nextTarget, unlocked: tierIndex >= 0 };
  });
}
