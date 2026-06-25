// Example server-only API route for a future Vercel/Netlify/Node backend.
// Do not run this file from GitHub Pages. It needs private environment variables.

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const result = request.body;

  // Validate required fields before saving.
  if (!result?.participant?.email || !result?.assessmentId || !result?.responses) {
    response.status(400).json({ error: "Missing required assessment data" });
    return;
  }

  // Connect Supabase here using SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
  // Save:
  // 1. client record
  // 2. assessment_submissions row
  // 3. assessment_responses rows
  // 4. assessment_results row
  // 5. email_events rows after email/Zapier status is known

  // Forward the same result object to Zapier or an email provider from the server.
  response.status(202).json({
    saved: false,
    message: "Connect Supabase and Zapier environment variables in a secure backend before enabling live storage.",
  });
}
