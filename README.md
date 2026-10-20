# CEAM+ Website

## October 20, 2026 update

[Scenario Studio Preview](scenario-studio-preview.html) presents fictional marketing and research examples for the planned platform. [Assessment Center](assessment-center.html) now also contains eighteen self-report assessments adapted from the original survey questionnaires. Existing evidence-led assessments and historical survey records are preserved. See [Preview implementation](docs/scenario-studio-preview-release.md) and [assessment integration](docs/self-report-assessment-integration.md).

CEAM+ is a marketing intelligence and decision-support platform that helps organizations understand what is happening, why it is happening, what may happen next, and what actions may improve performance. Its research-informed framework remains the foundation for understanding how people, organizations, customers, and markets adopt, resist, sustain, and adapt to change.

This repository publishes the static CEAM+ website through GitHub Pages. The existing HTML, CSS, and JavaScript site does not require Supabase to keep working.

## Surveys, Assessments, Dashboard, and Action

The evidence journey now separates four jobs:

- [`assessment-center.html#self-report-assessments`](assessment-center.html#self-report-assessments) contains the original survey questionnaires as eighteen self-report assessments. The old `surveys.html` and `assessments.html` URLs preserve read-only legacy history and downloads without rescoring.
- [`assessment-center.html`](assessment-center.html) contains thirteen evidence-led readiness, maturity, capability, strategy, and performance-system assessments. Questions and recommendations can be tailored through configuration for 15 organization types, five size contexts, ten business functions, and dynamic objectives while retaining common CEAM+ constructs.
- [`dashboard.html`](dashboard.html) reads assessment results that a visitor explicitly saved in the same browser. It presents priorities, evidence gaps, action status, follow-up comparisons, and links back to the complete report.
- The result action plan assigns owners, dates, KPIs, evidence needs, status, and reassessment dates. Data remains local unless a separate feature explicitly says otherwise.

Assessment definitions, rendering, scoring, personalization, and storage are separate modules under `js/assessments/`. Unknown and not-applicable answers are never scored as zero. Evidence confidence is a user-declared support indicator, not independent verification or statistical confidence. Financial calculations remain separate from the score for financial measurement capability.

## Marketing and AI assessment update (2026-09-21)

The dedicated **Marketing Assessment** is available at `assessment-center.html?assessment=marketing-assessment`. It keeps the 40 supplied statements, eight scored screening dimensions and the 1–5 scale. Fourteen separate construct evidence reviews distinguish beliefs, practices, data and outcomes. Scores are provisional self-report indicators, not validated measures or observed business performance.

The existing **AI Adoption Assessment** keeps its original readiness mode. Choose **AI Use & Case Analysis** or open `assessment-center.html?assessment=ai-adoption&mode=analysis` for evidence classification, human task allocation/necessity, customer journey, governance, assumption stress tests and a locked pre-analysis human baseline. Analysis runs locally with transparent rules; it does not call an AI model or send case text to a server. Case and baseline uploads support plain `.txt` and `.md` files.

Both use the existing opt-in local storage and Dashboard. AI analysis results are version-separated from earlier readiness results. These changes are **local and not deployed**. See the [implementation report](docs/marketing-ai-update-report.md) and [measurement dictionary](docs/measurement-dictionary.md) for files, tests, conceptual sources and limitations.

## Marketing Intelligence Dashboard

[`dashboard.html`](dashboard.html) presents the first major practical application of the CEAM+ framework. The page includes executive, customer, and marketing measures; diagnostic and predictive analytics concepts; prescriptive decision support; and contextual CEAM+ signals. The displayed metric cards, chart, and accessible data table use explicitly labeled **Demonstration Data** from a fictional retail example. They are static examples, with no live company data, analytics service, or model connection.

The **Dashboard is CEAM+'s primary product experience**. It brings together saved assessment priorities, evidence, interpretation, and next steps; the Marketing Analytics Lab supports deeper analysis. First-time visitors immediately see an interactive, clearly fictional six-quarter Revenue / Cost example with observations, limitations, and decision questions. **Load Demo Data** and **Try a Demo Assessment** remain available without replacing saved results or drafts. The older static business example and potential measures remain under the labeled research-framework disclosure.

Completed readiness, marketing, and AI reports include an explicit **Save to Dashboard** action. Saving remains opt-in and browser-local; repeated saves update the same report. **Download Result JSON** / **Download Analysis JSON** and PDF printing remain available, and saved reports can also be downloaded directly from the Dashboard. Downloads retain answers, evidence, limitations, and action plans. Fictional demos can be downloaded but cannot enter real assessment history.

CEAM+ is an evolving platform developed through practical pilots: Assess, Measure, Analyze, Interpret, Test, and Learn. Pilot work would define data sources, metric definitions, appropriate analytical methods, and human review. Future productized services or SaaS capabilities remain part of the longer-term development path.

See the [website update review](docs/website-update-review.md) for the file-by-file changes and verification status, and the [GPT-6 Astra migration plan](docs/gpt-6-astra-migration-plan.md) for the proposed future AI integration. The migration document is a plan; this website update does not add an OpenAI runtime integration. Changes remain local for review and have not been deployed.

## Marketing Analytics Lab

[`analytics-lab.html`](analytics-lab.html) is a client-side, no-login teaching and decision-support workspace. It accepts local CSV, XLSX, and XLS files (up to 10 MB, 20,000 rows, 100 columns, and 1 million cells per sheet), shows a preview and data-quality notes, and keeps uploaded contents in the current browser tab. The vendored SheetJS parser runs in a Web Worker; formulas and macros are not executed, and no file contents are sent to a server.

The Lab includes sample datasets, variable mapping, chart and accessible-table output, descriptive statistics, confidence intervals, correlation, regression, t-tests, forecasts, funnel and group comparisons, RFM/cohort starting points, customer and campaign measures, pricing and profitability scenarios, CAC/CLV/ROMI/ROI/ROAS, break-even, payback, NPV, operating leverage, NPS, an in-tab history, print/report export, and a CEAM+ Decision Lens. Every result follows the teaching sequence Business Question → Method → Why it fits → Formula → Calculation → Interpretation → Marketing / Managerial Meaning → Decision Questions. Case Analysis Mode adds evidence-led SWOT/TOWS, Porter’s Five Forces, STP, 4P/7P, PESTEL, Ansoff, lifecycle, benchmarking, perceptual mapping, root-cause questions, prioritization, decision and risk matrices, recommendations, KPIs, SMART objectives, and an executive synthesis. The worksheets do not generate automatic AI conclusions or replace customer research and management judgment.

The Lab now opens with the six-row **Quarterly sales** demonstration and its recommended line chart. All four samples remain available, and manual chart choices are preserved. A single observation is reported as insufficient evidence for every variance and standard-deviation summary, including the population forms. Forecast scenarios remain user-assumed ranges, not predictive percentiles. See [CEAM+ External User Feedback and Improvement Log — October 2026](docs/external-user-feedback-october-2026.md) for the audit, rationale, changed files, verification, and limitations.

Pure calculation and data-quality checks can be run with:

```powershell
node --test tests/analytics-math.test.mjs tests/analytics-data.test.mjs tests/internal-links.test.mjs
```

Assessment and preservation checks can be run with:

```powershell
node --test tests/assessment-definitions.test.mjs tests/assessment-personalization.test.mjs tests/assessment-scoring.test.mjs tests/survey-preservation.test.mjs
```

With a local server running at `http://127.0.0.1:8765`, the browser checks are:

```powershell
node tests/analytics-lab-browser.test.cjs
node tests/strategy-browser-check.cjs
node tests/assessment-center-browser.test.cjs
node tests/site-disclosure-browser.test.cjs
node tests/survey-integration-browser.test.cjs
```

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

## Registered Guides and AI Tools Access

The Guides and AI Tools pages now include a public preview and a registered
access gate. Full page content is hidden until Supabase confirms that the signed
in user's `profiles.approval_status` is `approved`.

### Website files

- `auth.html`: Client sign-in and account request page.
- `auth.js`: Browser-side email/password login, registration, approval status
  checks, and Zapier access request notification.
- `auth-config.js`: Public browser configuration. This file is committed with
  empty Supabase placeholders.
- `auth-config.example.js`: Example values and field names.

To connect the live site:

1. Open your Supabase project dashboard.
2. Copy the Project URL.
3. Copy the browser-safe anon or publishable key.
4. Paste those values into `auth-config.js`.
5. Do not paste the service role key, secret key, database password, or personal
   access token into website files.

### Supabase setup

The migration `supabase/migrations/202606150001_registered_access.sql` prepares:

- `profiles`
- `access_requests`
- `approval_tokens`
- Row Level Security for client-owned reads
- A pending profile record when a user signs up

Apply it after linking the project:

```powershell
supabase db push
```

### Zapier approval email

The website can send Zapier a `registered-access-request` payload when a visitor
creates an account. Zapier can add a Google Sheets row and email you the request.

For the secure email-button approval flow, deploy these Supabase Edge Function
templates:

- `supabase/functions/request-access`
- `supabase/functions/approve-access`

Set the required function secrets in Supabase:

```text
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_URL
ZAPIER_ACCESS_WEBHOOK_URL
APPROVAL_SECRET
SITE_URL
```

The email approval button should use the `approvalUrl` field from the Zapier
payload. Clicking that link marks the user approved through the server-side
function, not through public website JavaScript.

## Dashboard scenario update

The October 18 updates add [Personas and their methodology](docs/personas-methodology.md) and [layered scoring reports with historical safeguards](docs/scoring-layers-implementation-october-2026.md). The [pre-change scoring audit](docs/scoring-audit-october-2026.md) documents existing formulas; assessment questions and substantive formulas are preserved.

The October 17 Dashboard scenario explorer, methods, design influences, preservation safeguards, and verification results are documented in [Dashboard Interaction and Transparency Update](docs/dashboard-scenario-update-october-2026.md).

## Official References

- [Supabase CLI local development](https://supabase.com/docs/guides/local-development/cli/getting-started)
- [Supabase API keys](https://supabase.com/docs/guides/api/api-keys)
- [Securing the Data API](https://supabase.com/docs/guides/api/securing-your-api)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
