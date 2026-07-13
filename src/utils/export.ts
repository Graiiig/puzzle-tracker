import type { Puzzle, WishlistItem } from '../types';

function photoIdsFor(collection: Puzzle[], wishlist: WishlistItem[]): string[] {
  return [
    ...collection.flatMap((p) => [
      'puzzle-img-' + p.id,
      'gallery-' + p.id + '-before',
      'gallery-' + p.id + '-during',
      'gallery-' + p.id + '-after',
    ]),
    ...wishlist.map((w) => 'wish-img-' + w.id),
  ];
}

export async function exportDataAsJson(
  collection: Puzzle[],
  wishlist: WishlistItem[],
  downloadImage: (id: string) => Promise<string | null>,
) {
  const ids = photoIdsFor(collection, wishlist);
  const entries = await Promise.all(ids.map(async (id) => [id, await downloadImage(id)] as const));
  const photos: Record<string, string> = {};
  for (const [id, dataUrl] of entries) {
    if (dataUrl) photos[id] = dataUrl;
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    collection,
    wishlist,
    photos,
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
