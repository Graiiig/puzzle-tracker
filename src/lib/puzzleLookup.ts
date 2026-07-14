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

const TIMEOUT_MS = 12000;

/** Never throws — any failure (network, timeout, bad response) degrades to "not found". */
export async function lookupEan(ean: string): Promise<LookupResult> {
  if (!BASE_URL || !API_KEY) return { found: false };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
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
