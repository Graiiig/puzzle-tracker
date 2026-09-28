import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import type { Puzzle, WishlistItem } from '../types';

function photoIdsFor(collection: Puzzle[], wishlist: WishlistItem[]): string[] {
  return [
    ...collection.map((p) => 'puzzle-img-' + p.id),
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
  const json = JSON.stringify(payload, null, 2);
  const filename = `mes-puzzles-export-${new Date().toISOString().slice(0, 10)}.json`;

  // A plain <a download> click is a no-op inside the Android WebView (no
  // Downloads-folder integration there), so on native we write the file to
  // the app's cache dir and hand it to the OS share sheet instead — the
  // web build keeps the classic blob-download link.
  if (Capacitor.isNativePlatform()) {
    const written = await Filesystem.writeFile({
      path: filename,
      data: json,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });
    await Share.share({ files: [written.uri], dialogTitle: filename });
    return;
  }

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
