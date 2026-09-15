import type { PieceBucket, Puzzle, Status } from '../types';

export const PIECE_BUCKETS: PieceBucket[] = ['lt500', '500-999', '1000-1999', 'gte2000'];

export function pieceBucketOf(pieces: number): PieceBucket {
  if (pieces < 500) return 'lt500';
  if (pieces < 1000) return '500-999';
  if (pieces < 2000) return '1000-1999';
  return 'gte2000';
}

export interface PuzzleFilters {
  genres: string[];
  statuses: Set<Status>;
  brands: Set<string>;
  pieceBuckets: Set<PieceBucket>;
  minRating: number;
  search: string;
}

export function matchesFilters(p: Puzzle, f: PuzzleFilters): boolean {
  const q = f.search.trim().toLowerCase();
  return (
    (f.genres.length === 0 || p.genres.some((g) => f.genres.includes(g))) &&
    (!q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)) &&
    (f.statuses.size === 0 || f.statuses.has(p.status)) &&
    (f.brands.size === 0 || f.brands.has(p.brand)) &&
    (f.pieceBuckets.size === 0 || f.pieceBuckets.has(pieceBucketOf(p.pieces))) &&
    (f.minRating === 0 || p.rating >= f.minRating)
  );
}
