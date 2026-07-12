import { DEFAULT_GENRES } from '../data';
import type { Genre } from '../types';

export function collectGenres(...itemLists: Array<Array<{ genres: Genre[] }>>): Genre[] {
  const seen = new Set<Genre>(DEFAULT_GENRES);
  const extra: Genre[] = [];
  for (const items of itemLists) {
    for (const item of items) {
      for (const g of item.genres) {
        if (g && !seen.has(g)) {
          seen.add(g);
          extra.push(g);
        }
      }
    }
  }
  return [...DEFAULT_GENRES, ...extra];
}
