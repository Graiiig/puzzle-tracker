// Receives RevenueCat purchase events and grants/revokes the premium
// entitlement in Supabase. Deploy with:
//   supabase functions deploy revenuecat-webhook --no-verify-jwt
// then set the shared secret this function checks against:
//   supabase secrets set REVENUECAT_WEBHOOK_SECRET=<a random string>
// and configure the same URL + "Authorization: Bearer <that secret>" header
// as this function's webhook in the RevenueCat dashboard (Project settings
// > Integrations > Webhooks).
//
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically by
// Supabase — the service role key is what lets this write bypass the
// guard_premium_column trigger, which only blocks the 'authenticated' role
// (see supabase/migrations/0009_premium_entitlement.sql).

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const WEBHOOK_SECRET = Deno.env.get('REVENUECAT_WEBHOOK_SECRET')!;

// INITIAL_PURCHASE/RENEWAL/UNCANCELLATION/PRODUCT_CHANGE cover subscriptions
// in case the product lineup ever grows beyond the current one-time unlock;
// NON_RENEWING_PURCHASE is the event type for that one-time purchase itself.
const GRANT_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'NON_RENEWING_PURCHASE',
  'RENEWAL',
  'UNCANCELLATION',
  'PRODUCT_CHANGE',
]);
const REVOKE_EVENTS = new Set(['CANCELLATION', 'EXPIRATION', 'REFUND']);

Deno.serve(async (req) => {
  if (req.headers.get('authorization') !== `Bearer ${WEBHOOK_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  let body: { event?: { app_user_id?: string; type?: string } };
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const userId = body.event?.app_user_id;
  const type = body.event?.type;
  if (!userId || !type) {
    return new Response('Missing app_user_id or type', { status: 400 });
  }

  if (!GRANT_EVENTS.has(type) && !REVOKE_EVENTS.has(type)) {
    // Events we don't act on (e.g. TRANSFER, BILLING_ISSUE informational pings).
    return new Response('Ignored', { status: 200 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { error } = await supabase
    .from('profiles')
    .update({ is_premium: GRANT_EVENTS.has(type) })
    .eq('user_id', userId);

  if (error) {
    return new Response(`Update failed: ${error.message}`, { status: 500 });
  }

  return new Response('OK', { status: 200 });
});
