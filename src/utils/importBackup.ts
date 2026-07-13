import type { Puzzle, WishlistItem } from '../types';
import { toPuzzle, toWishlistItem } from '../lib/legacyImport';

export interface ImportBackupResult {
  puzzles: number;
  wishlistItems: number;
  photos: number;
}

export async function importBackupFile(
  file: File,
  addPuzzle: (item: Puzzle) => Promise<boolean>,
  addWishlistItem: (item: WishlistItem) => Promise<boolean>,
  setImage: (id: string, dataUrl: string) => Promise<boolean>,
): Promise<ImportBackupResult> {
  const parsed = JSON.parse(await file.text());
  const rawCollection = Array.isArray(parsed?.collection) ? parsed.collection : [];
  const rawWishlist = Array.isArray(parsed?.wishlist) ? parsed.wishlist : [];
  const photos: Record<string, string> = parsed?.photos && typeof parsed.photos === 'object' ? parsed.photos : {};

  const result: ImportBackupResult = { puzzles: 0, wishlistItems: 0, photos: 0 };

  async function migratePhoto(oldId: string, newId: string) {
    const dataUrl = photos[oldId];
    if (!dataUrl) return;
    const ok = await setImage(newId, dataUrl);
    if (ok) result.photos += 1;
  }

  for (const p of rawCollection) {
    const oldId = String((p as Record<string, unknown>)?.id ?? '');
    const newId = crypto.randomUUID();
    const ok = await addPuzzle(toPuzzle(p, newId));
    if (ok) {
      result.puzzles += 1;
      await migratePhoto('puzzle-img-' + oldId, 'puzzle-img-' + newId);
      await migratePhoto('gallery-' + oldId + '-before', 'gallery-' + newId + '-before');
      await migratePhoto('gallery-' + oldId + '-during', 'gallery-' + newId + '-during');
      await migratePhoto('gallery-' + oldId + '-after', 'gallery-' + newId + '-after');
    }
  }
  for (const w of rawWishlist) {
    const oldId = String((w as Record<string, unknown>)?.id ?? '');
    const newId = crypto.randomUUID();
    const ok = await addWishlistItem(toWishlistItem(w, newId));
    if (ok) {
      result.wishlistItems += 1;
      await migratePhoto('wish-img-' + oldId, 'wish-img-' + newId);
    }
  }
  return result;
}
