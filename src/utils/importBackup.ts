import type { Puzzle, WishlistItem } from '../types';
import { toPuzzle, toWishlistItem } from '../lib/legacyImport';

export interface ImportBackupResult {
  puzzles: number;
  wishlistItems: number;
}

export async function importBackupFile(
  file: File,
  addPuzzle: (item: Puzzle) => Promise<boolean>,
  addWishlistItem: (item: WishlistItem) => Promise<boolean>,
): Promise<ImportBackupResult> {
  const parsed = JSON.parse(await file.text());
  const rawCollection = Array.isArray(parsed?.collection) ? parsed.collection : [];
  const rawWishlist = Array.isArray(parsed?.wishlist) ? parsed.wishlist : [];

  const result: ImportBackupResult = { puzzles: 0, wishlistItems: 0 };
  for (const p of rawCollection) {
    const ok = await addPuzzle(toPuzzle(p, crypto.randomUUID()));
    if (ok) result.puzzles += 1;
  }
  for (const w of rawWishlist) {
    const ok = await addWishlistItem(toWishlistItem(w, crypto.randomUUID()));
    if (ok) result.wishlistItems += 1;
  }
  return result;
}
