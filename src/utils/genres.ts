import { DEFAULT_GENRES } from '../data';
import type { Genre } from '../types';

export function collectGenres(...itemLists: Array<Array<{ genre: Genre }>>): Genre[] {
  const seen = new Set<Genre>(DEFAULT_GENRES);
  const extra: Genre[] = [];
  for (const items of itemLists) {
    for (const item of items) {
      if (item.genre && !seen.has(item.genre)) {
        seen.add(item.genre);
        extra.push(item.genre);
      }
    }
  }
  return [...DEFAULT_GENRES, ...extra];
}
