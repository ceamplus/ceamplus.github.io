import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (request) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const siteUrl = Deno.env.get("SITE_URL") || "https://ceamplus.github.io/auth.html";

  if (!token || !supabaseUrl || !serviceRoleKey) {
    return new Response("Approval link is missing configuration.", { status: 400 });
  }

  const tokenBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  const tokenHash = Array.from(new Uint8Array(tokenBuffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: tokenRow, error } = await supabase
    .from("approval_tokens")
    .select("id, user_id, used_at, expires_at")
    .eq("token_hash", tokenHash)
    .single();

  if (error || !tokenRow) {
    return new Response("Approval link is invalid.", { status: 404 });
  }

  if (tokenRow.used_at) {
    return Response.redirect(`${siteUrl}?access=already-approved`, 302);
  }

  if (new Date(tokenRow.expires_at).getTime() < Date.now()) {
    return new Response("Approval link has expired.", { status: 410 });
  }

  await supabase
    .from("profiles")
    .update({ approval_status: "approved", approved_at: new Date().toISOString() })
    .eq("id", tokenRow.user_id);

  await supabase
    .from("access_requests")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("user_id", tokenRow.user_id)
    .eq("status", "pending");

  await supabase
    .from("approval_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("id", tokenRow.id);

  return Response.redirect(`${siteUrl}?access=approved`, 302);
});
