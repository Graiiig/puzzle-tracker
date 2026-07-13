import type { Puzzle, WishlistItem } from '../types';

export function exportDataAsJson(collection: Puzzle[], wishlist: WishlistItem[]) {
  const payload = {
    exportedAt: new Date().toISOString(),
    collection,
    wishlist,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mes-puzzles-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
