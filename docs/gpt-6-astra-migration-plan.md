# CEAM+ GPT-6 Astra migration plan

Prepared September 11, 2026. Scope: repository audit and implementation plan only.

The repository currently has no runtime OpenAI integration to migrate. Adding GPT-6 Astra would introduce a new backend capability. The recommended first use is an optional, human-reviewed interpretation of approved dashboard metrics and context, consistent with CEAM+'s marketing intelligence and pilot positioning. The website can continue to operate as a static site while this capability is developed separately.

## Current project evidence

| Area | Observed implementation | Consequence for the plan |
| --- | --- | --- |
| Website | Static HTML pages, shared `styles.css`, `script.js`, and `ai-solutions.js`; README describes GitHub Pages hosting. No application package manifest was found. | Keep the existing frontend architecture. Introduce a server endpoint for model requests. |
| Assessments | `script.js` calculates scores and builds results with functions including `calculateScore`, `calculatePhaseScores`, and `buildAssessmentResult`. | Preserve these calculations and research definitions. Model output should be additional interpretation, never the source of assessment scores. |
| AI content | `ai-solutions.js` and `script.js` contain curated tool descriptions and rules for matching tools to needs. | These references are educational content, not model configuration. They should remain provider-neutral. |
| OpenAI configuration | `supabase/config.toml` contains `openai_api_key` under `[studio]`, explicitly described as a key for Supabase Studio's AI. | This setting does not power the website and is not a migration target. |
| Identity | `auth.js` reads Supabase sessions and `profiles.approval_status`; committed `auth-config.js` has empty Supabase placeholders. | Confirm working hosted authentication before enabling paid AI access. Repository configuration alone does not establish deployment status. |
| Backend | `request-access` and `approve-access` Edge Function templates support access requests and approval; the SQL migration defines profiles, requests, tokens, and row-level security. | A separate Supabase Edge Function fits the existing backend direction. It must enforce authorization independently of browser visibility. |
| Checks | Five existing PowerShell tests cover navigation, research integrity, registered-access markup, layer images, and AI consultation content. | Retain these checks and add targeted runtime checks when implementing the new endpoint. They do not currently evaluate model responses or prove live authorization. |

The audit found no active model ID, OpenAI SDK import, Responses call, Chat Completions call, model router, or existing model evaluation baseline in application code.

## Astra compatibility requirements

Use the exact requested API model ID, `gpt-6-astra`. Prefer Responses for this new integration; Astra tool calling requires Responses. Preserve existing effective reasoning effort when migrating a workload; replace `none` or `minimal` with `low`. For this new workload, start at `low` and evaluate. Remove `temperature`, `top_p`, and `top_logprobs`; omit Chat Completions `logprobs` and Responses `include: ["message.output_text.logprobs"]`. These requirements come from the [official OpenAI Astra migration guidance](https://developers.openai.com/api/docs/guides/latest-model).

Astra supports Structured Outputs, which can provide a stable shape for the dashboard interpretation. Its published standard rates are $10 per million input tokens and $50 per million output tokens, with separate cache pricing. Confirm current account access, limits, and pricing before implementation; this audit made no authenticated model request. See the [official GPT-6 Astra model page](https://developers.openai.com/api/docs/models/gpt-6-astra).

## Implementation sequence

1. **Define one pilot contract.** Begin with an explicitly requested narrative for the Marketing Intelligence Dashboard. Inputs should be a validated metric snapshot, period, metric definitions, provenance, and user-supplied business context. Output should separate observations, possible explanations, missing evidence, and actions worth testing. Label demonstration inputs and derived outputs consistently. Do not introduce automatic forecasts or invent customer performance data.

2. **Establish the server boundary.** Add a dedicated function such as `supabase/functions/dashboard-insight/index.ts` and a small shared OpenAI adapter under `supabase/functions/_shared/`. Before implementation or live API testing, use the OpenAI platform API key setup workflow. Store the OpenAI key only in backend secrets. Verify the Supabase bearer token, confirmed identity, and trusted approval status on every request. Restrict each data query to that user's permitted pilot data. Browser `data-auth-approved` flags and hidden HTML are display controls, not authorization. Add input-size limits, per-user quotas, request timeouts, and a server-side feature flag.

3. **Make one bounded model request.** Use Responses with `model: "gpt-6-astra"`, a measured output limit, and a validated Structured Output contract. Pin a compatible SDK version in the backend if an SDK is chosen. Keep model ID and reasoning configuration in the server adapter so they can be adjusted without editing site copy. Start without tools, multi-agent orchestration, background execution, or new data connectors; the supplied metric snapshot is sufficient for this pilot. Handle refused, incomplete, empty, invalid, rate-limited, and timed-out responses explicitly.

4. **Keep interpretation grounded.** Compute business metrics in deterministic application or database code. Pass those computed values to Astra with their definitions, units, dates, and limitations. Require every numerical claim to correspond to supplied data. Treat imported text as data, not instructions. Prompt the model to distinguish correlation from a possible causal explanation and to preserve uncertainty, agency, contextual variation, and human decision authority. Exclude names, contact details, and raw assessment answers unless a defined pilot purpose requires them.

5. **Add the optional frontend flow.** Extend `dashboard.html` with a clearly labeled request for AI interpretation and a small dedicated client module, proposed as `dashboard-insight.js`. Reuse the existing visual styles. Present loading, cancellation, error, quota, and unavailable states accessibly. Render returned text safely rather than inserting model-generated HTML. Keep metric cards and deterministic results available when the service is disabled or fails. Any later assessment interpretation should be a separate opt-in feature and preserve the existing calculation functions and result contract.

6. **Evaluate before enabling pilot access.** Build a small reviewed dataset covering falling sales, changing retention, missing denominators, conflicting signals, insufficient data, uncertain forecasts, and instruction-like text inside imported records. Include pending and denied users, expired sessions, attempts to request another user's data, duplicate submission, service timeout, and malformed model output. Record groundedness, correct calculations, useful decision options, human-oversight language, latency, token usage, and cost. Require zero invented metrics and zero unauthorized data access in the release set. Agree on acceptable latency and spend from measured pilot runs rather than assuming model limits are product targets.

7. **Review, pilot, and retain a rollback.** Run the existing PowerShell regression tests plus the new endpoint and frontend checks. Review desktop and mobile flows, keyboard operation, safe rendering, and the disabled-service state. Document configuration, limits, evaluation results, and data retention in the README. After the changes have been reviewed, enable a small approved pilot cohort. Roll back by disabling the server flag and frontend entry point; the existing dashboard, research pages, assessments, and consulting flows remain available.

## Proposed implementation files

| File or area | Planned change |
| --- | --- |
| `supabase/functions/dashboard-insight/index.ts` | New authenticated, quota-controlled interpretation endpoint. |
| `supabase/functions/_shared/` | New model adapter, request validation, and output contract. |
| `dashboard.html`, `dashboard-insight.js`, `styles.css` | Optional interpretation UI and accessible states. |
| `auth.js` | Expose a narrow authenticated request helper if necessary; retain existing access behavior. |
| `supabase/migrations/` | Add a new versioned migration only if pilot data, durable quotas, or interpretation history need persistence; specify ownership policies. |
| `tests/` and a backend evaluation fixture directory | Add endpoint authorization, failure handling, UI, and response-quality checks. |
| `.env.example`, `supabase/functions/README.md`, `README.md` | Document empty secret names, operational setup, evaluation commands, feature flag, and rollback. |

This plan does not change runtime API code, add credentials, call a paid model, alter assessment scoring, or deploy the site. Hosted Supabase readiness, the approved pilot dataset, retention requirements, and actual account access remain implementation prerequisites.
