import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface PuzzleEanStats {
  collectorCount: number;
  avgRating: number | null;
  avgDifficulty: number | null;
  avgMinutes: number | null;
}

// Mirrors the DB-side threshold in get_puzzle_ean_stats (which already nulls
// everything out below it) — checked again here since a null collector_count
// alone wouldn't tell us whether that's "below threshold" or "no data yet".
const MIN_COLLECTORS = 3;

/** Community stats for a puzzle's EAN, across every user who has it — null until there's enough data (or no EAN to look up). */
export function usePuzzleEanStats(ean: string) {
  const [stats, setStats] = useState<PuzzleEanStats | null>(null);

  useEffect(() => {
    if (!ean) {
      setStats(null);
      return;
    }
    let cancelled = false;
    supabase
      .rpc('get_puzzle_ean_stats', { p_ean: ean })
      .then(({ data, error }) => {
        if (cancelled || error || !data?.[0]) return;
        const row = data[0] as Record<string, unknown>;
        const collectorCount = Number(row.collector_count) || 0;
        if (collectorCount < MIN_COLLECTORS) {
          setStats(null);
          return;
        }
        setStats({
          collectorCount,
          avgRating: row.avg_rating === null ? null : Number(row.avg_rating),
          avgDifficulty: row.avg_difficulty === null ? null : Number(row.avg_difficulty),
          avgMinutes: row.avg_minutes === null ? null : Number(row.avg_minutes),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [ean]);

  return stats;
}
