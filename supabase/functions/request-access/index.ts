import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return Response.json({ error: "Missing authorization header" }, { status: 401, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const zapierWebhookUrl = Deno.env.get("ZAPIER_ACCESS_WEBHOOK_URL");
  const siteUrl = Deno.env.get("SITE_URL") || "https://ceamplus.github.io";
  const approvalSecret = Deno.env.get("APPROVAL_SECRET");

  if (!supabaseUrl || !serviceRoleKey || !zapierWebhookUrl || !approvalSecret) {
    return Response.json({ error: "Function secrets are not configured" }, { status: 500, headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return Response.json({ error: "Invalid user session" }, { status: 401, headers: corsHeaders });
  }

  const body = await request.json().catch(() => ({}));
  const fullName = String(body.fullName || userData.user.user_metadata?.full_name || "");
  const requestedSections = Array.isArray(body.requestedSections) && body.requestedSections.length
    ? body.requestedSections
    : ["Guides", "AI Tools"];

  const { error: requestError } = await supabase.from("access_requests").insert({
    user_id: userData.user.id,
    email: userData.user.email,
    full_name: fullName,
    requested_sections: requestedSections,
  });

  if (requestError) {
    return Response.json({ error: requestError.message }, { status: 400, headers: corsHeaders });
  }

  const tokenSource = crypto.randomUUID() + approvalSecret;
  const tokenBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(tokenSource));
  const tokenHash = Array.from(new Uint8Array(tokenBuffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");

  const { error: tokenError } = await supabase.from("approval_tokens").insert({
    user_id: userData.user.id,
    token_hash: tokenHash,
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
  });

  if (tokenError) {
    return Response.json({ error: tokenError.message }, { status: 400, headers: corsHeaders });
  }

  const approvalUrl = `${supabaseUrl}/functions/v1/approve-access?token=${encodeURIComponent(tokenSource)}`;

  await fetch(zapierWebhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requestType: "registered-access-request",
      clientEmail: userData.user.email,
      clientName: fullName,
      supabaseUserId: userData.user.id,
      requestedSections: requestedSections.join(", "),
      approvalStatus: "pending",
      approvalUrl,
      siteUrl,
      adminEmailSubject: "CEAM+ access request needs approval",
      adminEmailBody: `Approve CEAM+ access for ${fullName || userData.user.email}: ${approvalUrl}`,
    }),
  });

  return Response.json({ ok: true }, { headers: corsHeaders });
});
