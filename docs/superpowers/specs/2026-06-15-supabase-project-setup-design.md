# CEAM+ Supabase Project Setup Design

## Goal

Prepare the CEAM+ GitHub Pages repository for a future Supabase backend without changing the current website, connecting to a live database, or committing credentials.

## Scope

This setup will:

- Create the standard local `supabase/` project structure.
- Add `.env.example` with empty `SUPABASE_URL` and `SUPABASE_ANON_KEY` placeholders.
- Keep all real `.env` files ignored by Git.
- Explain how a beginner can find the Supabase project URL and anon or publishable key.
- Explain how to connect the local repository to a Supabase project and how to use GitHub encrypted secrets later.
- Document future data areas for assessments, tool recommendations, user submissions, and implementation plans.

This setup will not:

- Modify existing HTML, CSS, or JavaScript.
- Create or alter live database tables.
- Enable client login.
- Add a real Supabase key to the repository.
- Push, commit, deploy, or change GitHub Pages settings.

## Structure

`supabase/config.toml` will hold local Supabase CLI configuration. Future migrations will live in `supabase/migrations/`, and future Edge Functions can live in `supabase/functions/`.

`.env.example` will document required variable names without values. A developer will create a local `.env` file and paste the real project URL and anon or publishable key there. The existing `.gitignore` rules will continue to exclude real environment files.

## Future Data Model

Future migrations may add:

- `profiles` for authenticated client identity and preferences.
- `assessment_submissions` for complete assessment responses and calculated results.
- `tool_recommendations` for personalized tool choices and human-oversight notes.
- `implementation_plans` for practical next steps, progress, and guide assignments.

Every future table exposed through the Supabase Data API must use Row Level Security. Client records should be linked to `auth.uid()` so users can access only their own data. Administrative access must not depend on editable user metadata.

## Verification

The setup is complete when:

- `supabase/config.toml` exists.
- `.env.example` contains placeholders only.
- `.env` remains ignored by Git.
- README instructions identify where credentials belong and warn against service-role keys.
- No existing website file is changed by the Supabase setup.
- Git contains no Supabase URL, JWT, service-role key, or other secret.

