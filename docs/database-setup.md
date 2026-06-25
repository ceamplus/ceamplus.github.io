# CEAM+ Database Setup

The current CEAM+ website is a static GitHub Pages site. GitHub Pages can show the assessment and send data to Zapier, but it cannot safely store database credentials or run private database writes by itself.

Use this architecture for secure storage:

1. Keep the GitHub Pages frontend public.
2. Send assessment results to a protected backend endpoint on Vercel, Netlify Functions, Supabase Edge Functions, or another Node.js server.
3. Store submissions in Supabase/PostgreSQL using server-side environment variables.
4. Let Zapier handle client/admin email, Google Sheets copies, and follow-up tasks.

## Database Structure

Run `database/schema.sql` in Supabase SQL Editor. It creates:

- `clients`: name, email, phone, organization, and client ID.
- `assessment_submissions`: one row per completed assessment, score, profile, timestamps, and raw result JSON.
- `assessment_responses`: every question, answer, follow-up answer, phase, note, and indicator.
- `assessment_results`: layer scores, selected tasks, observations, barriers, recommendations, AI tools, and implementation plan.
- `workflow_analytics`: incomplete assessment events, drop-off points, skipped questions, and timing events.
- `email_events`: client/admin email status and timestamps.

## Environment Variables

Copy `.env.example` to `.env.local` in the backend project and fill in real values.

Never put these values in `script.js`, `index.html`, or any public GitHub Pages file:

- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_AUTH_SECRET`
- private email provider keys

## Local Development

Recommended future backend:

```txt
frontend: current GitHub Pages files or a future React/Next.js app
backend: Vercel/Netlify/Supabase Edge Function
database: Supabase Postgres
automation: Zapier webhook
```

The current frontend already builds a structured `result` object with:

- participant information
- assessment ID and version
- all responses
- selected tasks
- readiness profile
- layer scores
- indicators
- personalized recommendations
- AI tool suggestions
- implementation plan

That same object should be posted to the backend, saved to Supabase, then forwarded to Zapier.

## Admin Dashboard Plan

A future admin dashboard should use a protected backend login and read from Supabase. It should support:

- client search
- filtering by assessment type
- filtering by readiness profile
- viewing timestamps
- viewing repeat assessments
- viewing recommendation summaries
- export-ready result data

Do not build admin access directly into GitHub Pages unless the data is public. Client assessment data should stay behind authentication.

## Deployment Options

GitHub Pages:
- Can host the current static site.
- Can send results to Zapier.
- Cannot securely write to Supabase with private keys.

Vercel or Netlify:
- Can host a future React/Next.js version.
- Can run protected API routes.
- Can store environment variables securely.
- Best next step for the database-backed version.

Supabase Edge Functions:
- Can receive assessment submissions.
- Can write to Supabase securely.
- Can forward email payloads to Zapier or another email service.
