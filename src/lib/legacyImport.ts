import type { Genre, Puzzle, WishlistItem } from '../types';

const OLD_COLLECTION_KEY = 'puzzle-tracker:collection';
const OLD_WISHLIST_KEY = 'puzzle-tracker:wishlist';
const IMPORTED_FLAG = 'puzzle-tracker:legacy-imported';
const OLD_DB_NAME = 'puzzle-tracker';
const OLD_STORE_NAME = 'images';

function parseArray(raw: string | null): Record<string, unknown>[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Record<string, unknown>[]) : [];
  } catch {
    return [];
  }
}

// Older exports stored a single `genre: string` instead of `genres: string[]`.
function normalizeGenres(record: Record<string, unknown>): Genre[] {
  if (Array.isArray(record.genres)) return record.genres as Genre[];
  if (typeof record.genre === 'string' && record.genre) return [record.genre];
  return [];
}

function str(record: Record<string, unknown>, key: string, fallback = ''): string {
  const v = record[key];
  return typeof v === 'string' ? v : fallback;
}

function num(record: Record<string, unknown>, key: string, fallback = 0): number {
  const v = record[key];
  return typeof v === 'number' ? v : fallback;
}

export function toPuzzle(record: Record<string, unknown>, id: string): Puzzle {
  return {
    id,
    name: str(record, 'name'),
    brand: str(record, 'brand'),
    genres: normalizeGenres(record),
    pieces: num(record, 'pieces'),
    status: str(record, 'status', 'À faire') as Puzzle['status'],
    rating: num(record, 'rating'),
    difficulty: num(record, 'difficulty', 3),
    date: str(record, 'date'),
    time: str(record, 'time'),
    notes: str(record, 'notes'),
  };
}

export function toWishlistItem(record: Record<string, unknown>, id: string): WishlistItem {
  return {
    id,
    name: str(record, 'name'),
    brand: str(record, 'brand'),
    genres: normalizeGenres(record),
    pieces: num(record, 'pieces'),
    priority: str(record, 'priority', 'Moyenne') as WishlistItem['priority'],
    notes: str(record, 'notes'),
  };
}

export function hasLegacyData(): boolean {
  if (localStorage.getItem(IMPORTED_FLAG)) return false;
  const collection = parseArray(localStorage.getItem(OLD_COLLECTION_KEY));
  const wishlist = parseArray(localStorage.getItem(OLD_WISHLIST_KEY));
  return collection.length > 0 || wishlist.length > 0;
}

export function dismissLegacyImport(): void {
  localStorage.setItem(IMPORTED_FLAG, '1');
}

function readOldImages(): Promise<Record<string, string>> {
  return new Promise((resolve) => {
    const req = indexedDB.open(OLD_DB_NAME);
    req.onerror = () => resolve({});
    req.onsuccess = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(OLD_STORE_NAME)) {
        db.close();
        resolve({});
        return;
      }
      const tx = db.transaction(OLD_STORE_NAME, 'readonly');
      const store = tx.objectStore(OLD_STORE_NAME);
      const keysReq = store.getAllKeys();
      const valuesReq = store.getAll();
      tx.oncomplete = () => {
        const keys = keysReq.result as string[];
        const values = valuesReq.result as string[];
        const map: Record<string, string> = {};
        keys.forEach((k, i) => {
          map[k] = values[i];
        });
        db.close();
        resolve(map);
      };
      tx.onerror = () => {
        db.close();
        resolve({});
      };
    };
  });
}

export interface LegacyImportResult {
  puzzles: number;
  wishlistItems: number;
  photos: number;
}

export async function importLegacyData(options: {
  addPuzzle: (item: Puzzle) => Promise<boolean>;
  addWishlistItem: (item: WishlistItem) => Promise<boolean>;
  setImage: (id: string, dataUrl: string) => Promise<boolean>;
}): Promise<LegacyImportResult> {
  const result: LegacyImportResult = { puzzles: 0, wishlistItems: 0, photos: 0 };

  const oldCollection = parseArray(localStorage.getItem(OLD_COLLECTION_KEY));
  const oldWishlist = parseArray(localStorage.getItem(OLD_WISHLIST_KEY));
  const oldImages = await readOldImages();

  async function migrateImage(oldKey: string, newKey: string) {
    const dataUrl = oldImages[oldKey];
    if (!dataUrl) return;
    const ok = await options.setImage(newKey, dataUrl);
    if (ok) result.photos += 1;
  }

  for (const p of oldCollection) {
    const oldId = String(p.id);
    const newId = crypto.randomUUID();
    const ok = await options.addPuzzle(toPuzzle(p, newId));
    if (ok) {
      result.puzzles += 1;
      await migrateImage('puzzle-img-' + oldId, 'puzzle-img-' + newId);
      await migrateImage('gallery-' + oldId + '-before', 'gallery-' + newId + '-before');
      await migrateImage('gallery-' + oldId + '-during', 'gallery-' + newId + '-during');
      await migrateImage('gallery-' + oldId + '-after', 'gallery-' + newId + '-after');
    }
  }

  for (const w of oldWishlist) {
    const oldId = String(w.id);
    const newId = crypto.randomUUID();
    const ok = await options.addWishlistItem(toWishlistItem(w, newId));
    if (ok) {
      result.wishlistItems += 1;
      await migrateImage('wish-img-' + oldId, 'wish-img-' + newId);
    }
  }

  dismissLegacyImport();
  return result;
}
