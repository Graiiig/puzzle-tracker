import type { CSSProperties } from 'react';
import type { Dict, Lang } from '../i18n';
import type { Priority, Puzzle, SortMode, Status } from '../types';

export function starString(n: number): string {
  return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);
}

export function dotString(n: number): string {
  return '●●●●●'.slice(0, n) + '○○○○○'.slice(0, 5 - n);
}

const STATUS_COLORS: Record<Status, { background: string; color: string }> = {
  done: { background: 'oklch(90% 0.09 150)', color: 'oklch(38% 0.13 150)' },
  in_progress: { background: 'oklch(93% 0.08 350)', color: 'oklch(45% 0.2 350)' },
  todo: { background: 'oklch(92% 0.02 340)', color: 'oklch(50% 0.02 340)' },
};

export function statusStyle(status: Status): CSSProperties {
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.todo;
  return {
    ...colors,
    fontWeight: 800,
    fontSize: 11,
    padding: '5px 11px',
    borderRadius: 100,
  };
}

const PRIORITY_COLORS: Record<Priority, { background: string; color: string }> = {
  high: { background: 'oklch(93% 0.08 350)', color: 'oklch(45% 0.2 350)' },
  medium: { background: 'oklch(92% 0.05 300)', color: 'oklch(45% 0.16 300)' },
  low: { background: 'oklch(92% 0.02 340)', color: 'oklch(50% 0.02 340)' },
};

export function priorityStyle(p: Priority): CSSProperties {
  const colors = PRIORITY_COLORS[p] ?? PRIORITY_COLORS.medium;
  return {
    ...colors,
    fontWeight: 800,
    fontSize: 11,
    padding: '5px 11px',
    borderRadius: 100,
    display: 'inline-block',
    width: 'fit-content',
    marginTop: 4,
  };
}

export function chipStyle(active: boolean, hue: number): CSSProperties {
  return {
    background: active
      ? `linear-gradient(135deg, oklch(68% 0.22 ${hue}), oklch(60% 0.19 ${hue - 30}))`
      : 'white',
    color: active ? 'white' : 'oklch(45% 0.03 340)',
  };
}

export function sortList<T extends { name: string; pieces: number; difficulty?: number }>(
  list: T[],
  mode: SortMode,
): T[] {
  const arr = [...list];
  if (mode === 'alphabetical') arr.sort((a, b) => a.name.localeCompare(b.name));
  else if (mode === 'pieces') arr.sort((a, b) => b.pieces - a.pieces);
  else if (mode === 'difficulty') arr.sort((a, b) => (b.difficulty ?? 0) - (a.difficulty ?? 0));
  // 'recent': the list already arrives most-recent-first (fetched with
  // created_at descending), so no reordering is needed here.
  return arr;
}

export function ratingLabel(puzzle: Pick<Puzzle, 'rating'>, t: Dict): string {
  return puzzle.rating > 0 ? `${puzzle.rating}/5` : t.detail.notRatedYet;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DATE_LOCALE: Record<Lang, string> = { fr: 'fr-FR', en: 'en-US' };

export function formatDate(value: string, lang: Lang): string {
  if (!value) return '—';
  if (ISO_DATE.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return new Intl.DateTimeFormat(DATE_LOCALE[lang], { day: 'numeric', month: 'long', year: 'numeric' }).format(
      new Date(y, m - 1, d),
    );
  }
  return value;
}

export function parseTimeToMinutes(value: string): number {
  const match = value.match(/(\d+)\s*h\s*(\d{1,2})?/i);
  if (!match) return 0;
  const hours = Number(match[1]) || 0;
  const minutes = Number(match[2]) || 0;
  return hours * 60 + minutes;
}

export function formatMinutesAsHours(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h${String(minutes).padStart(2, '0')}`;
}
