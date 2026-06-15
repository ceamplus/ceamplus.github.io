# CEAM+ Website

CEAM+ is a human-centered framework that helps individuals and small businesses understand complexity, make better decisions, adopt useful technology, and turn awareness into sustainable action.

This repository publishes the static CEAM+ website through GitHub Pages. The existing HTML, CSS, and JavaScript site does not require Supabase to keep working.

## Supabase Preparation

The repository now includes a local `supabase/` folder created by the official Supabase CLI. This prepares the project for future database migrations, authentication, client assessment history, personalized guides, and implementation plans.

This setup does **not** connect to a live database or change the current website.

### Files

- `supabase/config.toml`: Local Supabase CLI configuration.
- `supabase/migrations/`: Future version-controlled database changes belong here.
- `.env.example`: Safe, empty examples of the required environment variables.
- `.env`: Your private local values. This file is ignored by Git and must not be committed.

## Add Your Supabase Project Details

### 1. Find the project URL and key

1. Sign in at [Supabase](https://supabase.com/dashboard).
2. Open the Supabase project you authorized for CEAM+.
3. Open the project's **Connect** dialog or go to **Project Settings > API**.
4. Copy the **Project URL**.
5. Copy the **anon key** or newer **publishable key** intended for browser applications.

Do not copy the `service_role` key, a secret key, the database password, or a personal access token into this repository or browser code.

### 2. Create your private local environment file

Make a local copy of `.env.example` named `.env`:

```powershell
Copy-Item .env.example .env
```

Open `.env` and paste your values after the equals signs:

```dotenv
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
```

Keep `.env.example` empty. Only your untracked `.env` file should contain the real values.

You can confirm that Git ignores the private file:

```powershell
git check-ignore .env
```

The command should print `.env`.

## Link This Repository to Supabase

Linking allows future Supabase CLI commands to target the correct hosted project. It does not publish or modify the current GitHub Pages website.

1. Install or run the current [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started).
2. Sign in:

   ```powershell
   supabase login
   ```

3. Find the project reference in the Supabase dashboard URL. It is the value after `/project/`.
4. Link the repository:

   ```powershell
   supabase link --project-ref YOUR_PROJECT_REF
   ```

5. Check the local project:

   ```powershell
   supabase status
   ```

`supabase status` requires local Supabase services and Docker. Linking the hosted project does not require changing the website files.

If Node.js and npm are installed but the standalone CLI is not, the same commands can be run as `npx supabase login`, `npx supabase link`, and `npx supabase status`.

## Connect Supabase to GitHub Safely

Do not place real keys in a committed file.

If a future GitHub Actions workflow needs Supabase:

1. Open the GitHub repository.
2. Select **Settings > Secrets and variables > Actions**.
3. Choose **New repository secret**.
4. Add `SUPABASE_URL`.
5. Add `SUPABASE_ANON_KEY`.

GitHub Pages is a static website and cannot read GitHub Actions secrets directly in a visitor's browser. A future portal will need a deliberate configuration or build step. A browser-safe anon or publishable key may be used by a public client only after Row Level Security policies are in place. Never expose a `service_role` or secret key.

## Planned CEAM+ Data Areas

Future migrations can introduce these data areas without changing the current assessment forms all at once:

- **Profiles:** Authenticated client identity, preferences, and account settings.
- **Assessment submissions:** Assessment type, complete responses, scores, recommendations, and submission dates.
- **Tool recommendations:** Suggested AI categories, benefits, limitations, costs, skill levels, and human-oversight requirements.
- **User submissions:** Support requests, personalized-guide requests, and follow-up status.
- **Implementation plans:** Goals, recommended steps, assigned guides, progress updates, and review dates.

Suggested table names are:

```text
profiles
assessment_submissions
tool_recommendations
support_requests
guide_requests
implementation_plans
```

No live tables have been created yet.

## Database Security Requirements

Before website forms or a client portal write to Supabase:

1. Enable Row Level Security on every exposed table.
2. Link client-owned records to the authenticated user's `auth.uid()`.
3. Allow clients to read only their own assessments, guides, and plans.
4. Use explicit database grants for tables that need Data API access.
5. Keep administrative authorization in trusted app metadata or secured database records, not editable user metadata.
6. Keep privileged operations on a server or Supabase Edge Function.
7. Never send a service-role key to GitHub Pages.

The generated Supabase configuration uses the current safer default where newly created public tables are not automatically exposed to Data API roles.

## Current Publishing

Continue publishing the existing website through GitHub Pages as before. The new Supabase preparation files do not alter:

- `index.html`
- `styles.css`
- `script.js`
- Any existing assessment page
- The GitHub Pages publishing source

Supabase integration with website forms and the future client portal should be completed as a separate, tested update.

## Official References

- [Supabase CLI local development](https://supabase.com/docs/guides/local-development/cli/getting-started)
- [Supabase API keys](https://supabase.com/docs/guides/api/api-keys)
- [Securing the Data API](https://supabase.com/docs/guides/api/securing-your-api)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
