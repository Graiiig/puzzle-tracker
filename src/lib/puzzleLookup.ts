export interface LookupFound {
  found: true;
  source: 'puzzle.fr' | 'ean-search.org';
  brand?: string;
  name: string;
  pieces?: number;
  imageUrl?: string;
  vendorUrl?: string;
}

export interface LookupNotFound {
  found: false;
}

export type LookupResult = LookupFound | LookupNotFound;

const BASE_URL = import.meta.env.VITE_PUZZLE_LOOKUP_URL as string | undefined;
const API_KEY = import.meta.env.VITE_PUZZLE_LOOKUP_API_KEY as string | undefined;

/** Scan-to-prefill is an optional feature: unset env vars just disable it. */
export const isPuzzleLookupConfigured = Boolean(BASE_URL && API_KEY);

// puzzle-lookup tries up to two sources sequentially, each with its own
// SOURCE_TIMEOUT_MS budget (40s by default) before falling back/giving up —
// a "not found" that requires trying both can take close to twice that
// (80s), plus browser/context startup and network round-trip on top. This
// must stay comfortably above the backend's real worst case, or the backend
// timeout budget it's meant to accommodate is unreachable from this client.
const LOOKUP_TIMEOUT_MS = 105000;
const IMAGE_TIMEOUT_MS = 15000;

/** Never throws — any failure (network, timeout, bad response) degrades to "not found". */
export async function lookupEan(ean: string): Promise<LookupResult> {
  if (!BASE_URL || !API_KEY) return { found: false };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
  try {
    const response = await fetch(`${BASE_URL}/lookup?ean=${encodeURIComponent(ean)}`, {
      headers: { 'x-api-key': API_KEY },
      signal: controller.signal,
    });
    if (!response.ok) return { found: false };
    return (await response.json()) as LookupResult;
  } catch {
    return { found: false };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetches a lookup result's image through puzzle-lookup's own /image proxy
 * instead of the third-party host directly — that host generally won't send
 * CORS headers for this app's origin, so a direct fetch() would just fail.
 * Never throws — returns null on any failure.
 */
export async function fetchLookupImage(imageUrl: string): Promise<Blob | null> {
  if (!BASE_URL || !API_KEY) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS);
  try {
    const response = await fetch(`${BASE_URL}/image?url=${encodeURIComponent(imageUrl)}`, {
      headers: { 'x-api-key': API_KEY },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    return await response.blob();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
