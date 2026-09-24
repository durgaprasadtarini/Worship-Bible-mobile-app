// @ts-nocheck — this runs in Supabase's Deno runtime, not this project's
// Node/TypeScript setup, so the editor can't resolve Deno globals or the
// https:// import below. That's expected; it doesn't affect deployment or
// how this file actually runs.
//
// Edge Function: reset-password
//
// The ONLY place in this project allowed to hold the service_role key —
// it never ships inside the app. Supabase auto-injects SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY as secrets for every Edge Function, so nothing
// extra needs to be configured for those two.
//
// Deliberately has NO verification step (no emailed code, no password
// check) before changing the password — see the project conversation for
// why that's a real security tradeoff. Deployed with --no-verify-jwt so a
// not-yet-signed-in user (mid "forgot password") can call it.
//
// Body: { email: string, newPassword: string }
// Response: { success: boolean, message?: string }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let email: string | undefined;
  let newPassword: string | undefined;
  try {
    const body = await req.json();
    email = body.email;
    newPassword = body.newPassword;
  } catch {
    return json({ success: false, message: 'Invalid request body.' }, 400);
  }

  if (!email || !newPassword || newPassword.length < 8) {
    return json({ success: false, message: 'Email and a password of at least 8 characters are required.' }, 400);
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // get_user_id_by_email is a SECURITY DEFINER SQL function (see
  // SUPABASE.md) — it's the only way to look an email up in auth.users,
  // which isn't exposed over the normal REST API even to the service role.
  const { data: userId, error: lookupError } = await supabaseAdmin.rpc('get_user_id_by_email', {
    p_email: email,
  });

  if (lookupError || !userId) {
    return json({ success: false, message: 'No account found with that email.' });
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (updateError) {
    return json({ success: false, message: updateError.message });
  }

  return json({ success: true });
});
