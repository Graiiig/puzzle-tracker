/**
 * Retries a Supabase query a few times before giving up. On cold app start
 * (especially native), the very first request can land before the session
 * token or network is fully ready and fail silently — a bare retry clears
 * that up without the user having to pull-to-refresh.
 */
export async function withRetry<T>(
  query: () => PromiseLike<{ data: T | null; error: unknown }>,
  attempts = 3,
  delayMs = 700,
): Promise<{ data: T | null; error: unknown }> {
  let result = await query();
  for (let i = 1; i < attempts && result.error; i++) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    result = await query();
  }
  return result;
}
