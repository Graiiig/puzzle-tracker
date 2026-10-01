import { useCallback, useState } from 'react';

const STORAGE_PREFIX = 'puzzle-tracker:dismissed-live-banner:';

function readDismissed(userId: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_PREFIX + userId) ?? '[]');
  } catch {
    return [];
  }
}

/**
 * Tracks which championship ids a user has dismissed the home "live now"
 * banner for, so it stays hidden for that one event but comes back for the
 * next one that goes live.
 */
export function useDismissedLiveBanner(userId: string) {
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => readDismissed(userId));

  const dismiss = useCallback(
    (championshipId: string) => {
      setDismissedIds((prev) => {
        if (prev.includes(championshipId)) return prev;
        const next = [...prev, championshipId];
        localStorage.setItem(STORAGE_PREFIX + userId, JSON.stringify(next));
        return next;
      });
    },
    [userId],
  );

  return { dismissedIds, dismiss };
}
