import { useEffect } from 'react';
import type { Achievement } from '../utils/achievements';

const STORAGE_PREFIX = 'puzzle-tracker:achievements-seen:';

/**
 * Fires `onTierUp` for any achievement whose tier increased since the last
 * time this ran for this user, tracked in localStorage. The very first run
 * for a user (no stored baseline yet) only records the current state —
 * it never floods a long-time user with toasts for tiers they'd already
 * reached before this feature existed.
 *
 * `ready` must stay false until the collection has finished its initial
 * load: `usePuzzles` starts with an empty array while it fetches, and
 * writing a baseline from that transient empty state would make every
 * already-unlocked tier look "new" the moment the real data arrives.
 */
export function useAchievementNotifications(
  userId: string,
  achievements: Achievement[],
  onTierUp: (achievement: Achievement) => void,
  ready: boolean,
) {
  useEffect(() => {
    if (!ready || achievements.length === 0) return;
    const key = STORAGE_PREFIX + userId;
    const hasBaseline = localStorage.getItem(key) !== null;
    let stored: Record<string, number> = {};
    try {
      stored = JSON.parse(localStorage.getItem(key) ?? '{}');
    } catch {
      stored = {};
    }

    const next: Record<string, number> = {};
    for (const a of achievements) {
      next[a.id] = a.tierIndex;
      if (hasBaseline && a.tierIndex > (stored[a.id] ?? -1)) {
        onTierUp(a);
      }
    }
    localStorage.setItem(key, JSON.stringify(next));
  }, [userId, achievements, onTierUp, ready]);
}
