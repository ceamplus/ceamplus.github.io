# CEAM+ website update review

Prepared September 14, 2026. Status: local changes prepared for review; no deployment performed.

## Assessment Center completion — September 16, 2026

The site now communicates **Surveys → Assessment → Dashboard → Action**, while keeping the Marketing Analytics Lab distinct as the place for business and numerical analysis.

### Existing files preserved

- `script.js` is unchanged. All five original human-adaptation contexts, questions, nine CEAM+ dimensions, scoring, uncertainty, recommendations, safeguards, download, and optional Zapier submission behavior remain intact.
- `assessments.html` remains a working compatibility route. It was not replaced with a redirect.
- Existing research, framework, consulting, marketing, AI, sustainability, authentication, dashboard demonstration, and analytics content remains available.
- No existing page was deleted or renamed.

### New files and routes

- `surveys.html` presents the existing instruments as CEAM+ Surveys and accurately distinguishes their self-report purpose.
- `assessment-center.html` provides the new catalogue, recommendation wizard, guided assessments, evidence capture, result reports, action plans, retakes, local history, and export tools.
- `js/assessments/definitions.mjs` contains all 12 requested assessments: 192 dimensions and 385 focused base prompts.
- `js/assessments/scoring.mjs`, `storage.mjs`, `personalization.mjs`, `app.mjs`, and `dashboard.mjs` separate deterministic scoring, optional local persistence, contextual tailoring, UI, and dashboard aggregation.
- `styles-assessments.css` and `styles-dashboard-local.css` add scoped responsive and print presentation.
- Architecture, content, scoring, personalization, survey-preservation, and progressive-disclosure documentation is in `docs/`.

### Navigation and progressive disclosure

The primary navigation now includes Home, Dashboard, Surveys, Assessment Center, Marketing Analytics Lab, Research, AI, Consulting, and About. A compact evidence journey appears on the homepage and survey experience. Information-heavy content on nine pages is grouped into 57 native, keyboard-operable disclosures with concise summaries. Direct hash links open their enclosing disclosure; print expands content; primary calls to action, survey selectors, safeguards, and privacy disclosures remain visible.

### Assessment and personalization architecture

The centre groups assessments into Marketing & Customer, Organization & Change, Data & Technology, and Personal categories. It supports all 12 requested assessment types, a 3-question recommendation wizard, and fictional demo mode.

Organizational assessments ask for a configurable profile near the start: 15 industry/organization types, five size contexts, ten departments/functions, and dynamic business objectives. Marketing includes the requested objective set and concrete restaurant, retail, construction/trades, and corporate variants. Tailoring changes questions, examples, evidence suggestions, actions, KPIs, and follow-up questions. It retains the base CEAM+ dimensions and maps added prompts to shared constructs. Size changes practical scope but never contributes score points.

### Scoring and evidence confidence

- Question and dimension weights are explicit and documented per assessment; a single universal weighting profile is not used.
- Maturity and agreement values map to 0, 25, 50, 75, and 100. Other types use declared mappings. Unknown and valid not-applicable responses are excluded and counted separately, never imputed as zero.
- The overall score is the weighted mean of scored dimensions. Partial coverage is labeled and cannot establish whole-assessment readiness.
- The evidence-support index combines the user's declared evidence quality with response coverage and a contradiction adjustment. It is labeled as user-declared, unverified, and not statistical confidence.
- CEAM+ Planning Priority transparently combines gap, importance, risk, evidence uncertainty, and user priority. Missing evidence produces an investigation priority rather than a stronger performance conclusion.
- Financial performance calculations are kept separate from the assessment of measurement capability.

### Results, integrations, privacy, and follow-up

Reports include the overall result, accessible dimension bars and table, strengths, planning priorities, meaning, recommended actions, investigation questions, evidence notes, assumptions, the CEAM+ Decision Lens, related surveys and analytics, action plans, scoring details, and retake guidance. Details that would otherwise create long pages start collapsed, while concise conclusions remain visible.

Survey links select only an existing survey context. Analytics links select an existing calculator, strategy worksheet, or forecast tool and transfer no assessment evidence. The dashboard reads results the visitor explicitly saved in the same browser and shows priorities, action status, metrics, and baseline/follow-up comparisons.

Assessment responses remain in memory until the visitor explicitly enables browser saving. The Assessment Center sends no response data to servers or external APIs. JSON export, clipboard summary, and print/save-as-PDF are local browser operations. The existing Surveys page separately discloses its optional submission workflow. Saved local data is not encrypted or synchronized and can be accessed by other users of that browser profile.

### Verification completed

- 12 cards and definitions; all required dimensions; content/schema and link integrity.
- All supported response types, unknown, N/A, invalid values, weighting, partial coverage, evidence support, contradictions, patterns, priorities, and all financial formulas.
- 15 industries, five sizes, ten departments, dynamic objectives, modular prompts, contextual recommendations, and no size-based pre-scoring.
- Catalogue filters, wizard, start/resume, demo isolation, optional saving, action-plan upserts, reset, comparable retakes, exports, printing, dashboard handoff, storage denial, escaped evidence notes, and no external Assessment Center requests.
- Existing five-context survey flow and legacy URL, intercepted submission test, analytics deep links, progressive disclosures, direct hash routes, keyboard use, print behavior, and responsive layouts at 320, 390, 768, and 1440 pixels.
- Existing research-integrity, registered-access, imagery, AI consultation, navigation, analytics calculation, data-quality, Analytics Lab, and strategy-workbook checks.

### Known limitations and Phase 2 recommendations

- Assessment content and weights are transparent planning judgments, not validated psychometric scales or scientifically calibrated readiness thresholds.
- Evidence quality and contradictions are declared by the user; documents are not independently reviewed or verified.
- Local storage is device/browser specific, unencrypted, without authentication, backup, collaboration, or cross-device sync.
- Action-plan editing and longitudinal comparison are designed for one browser profile. Multi-role respondent management and permissions need a governed server-side design.
- Industry and objective modules need subject-matter review, usability testing, pilot feedback, and measurement-invariance analysis before consequential use.
- Phase 2 should add controlled evidence provenance, respondent/cohort metadata, accessible usability studies, calibration and sensitivity analysis, optional authenticated history with retention controls, role-based review, richer progress visualization, and pilot evaluation against real decision outcomes.

The website now introduces CEAM+ as an evolving marketing intelligence and decision-support platform, with the CEAM+ Marketing Intelligence Dashboard as its first major practical application and the client-side Marketing Analytics Lab as an applied teaching and analysis workflow. The existing research framework remains the intellectual foundation. The implementation extends the existing static HTML, shared CSS, and JavaScript architecture.

## Changed files

The shared navigation update uses Home, Dashboard, CEAM+ Adoption Model, Research, AI, Consulting, and About. The existing Consulting Process header action remains. An Explore CEAM+ directory keeps Change Consulting, Marketing, Sustainability & Flourishing, CEAM+ Framework, Applications, Guides, AI Tools, Mission/Values/Philosophy, and Contact reachable. Updated HTML pages request the new shared stylesheet version.

| File | Status | Purpose |
| --- | --- | --- |
| `index.html` | Updated | Introduces the new headline and platform definition; adds Dashboard and Framework calls to action, the five-stage development path, Describe/Diagnose/Predict/Prescribe questions, and More Than Reporting. Retains the broader human-adaptation, research, consulting, AI, sustainability, and agency context. Includes the shared navigation update. |
| `dashboard.html` | New | Adds the flagship dashboard page with a labeled fictional example, metric cards, revenue visualization and accessible data table, all seven requested analytics areas, contextual CEAM+ signals, More Than Reporting, the six-step pilot approach, research links, and human oversight. |
| `about.html` | Updated | Adds Building CEAM+ Through Applied Research with all nine requested fields, explains the research program and applied analytics project, and links the dashboard and framework. Preserves the existing origin story and biography. Updates metadata and makes the page title an `h1`. Includes the shared navigation update. |
| `research.html` | Updated | Adds an `evidence` section anchor so the dashboard can link directly to Evidence. Preserves research text and Research Architecture. Includes the shared navigation update. |
| `framework.html` | Updated | Applies the shared navigation update; preserves framework content. |
| `assessments.html` | Updated | Applies the shared navigation update, using CEAM+ Adoption Model for the assessments destination; preserves assessment content and controls. |
| `ai-solutions.html` | Updated | Applies the shared navigation update; preserves AI tools and registered-access content. |
| `ai-technology.html` | Updated | Applies the shared navigation update; preserves AI application and human-oversight content. |
| `applications.html` | Updated | Applies the shared navigation update; preserves existing application areas. |
| `auth.html` | Updated | Applies the shared navigation update; preserves sign-in and access-request content. |
| `change-consulting.html` | Updated | Applies the shared navigation update; preserves change-consulting positioning. |
| `consulting.html` | Updated | Applies the shared navigation update; preserves the existing consulting process and service areas. |
| `contact.html` | Updated | Applies the shared navigation update; preserves the contact form and consultant route. |
| `marketing.html` | Updated | Applies the shared navigation update; preserves marketing research and customer-insight content. |
| `mission.html` | Updated | Applies the shared navigation update; preserves the existing route to the combined mission, values, and philosophy page. |
| `philosophy.html` | Updated | Applies the shared navigation update; preserves the existing route to the combined mission, values, and philosophy page. |
| `sustainability.html` | Updated | Applies the shared navigation update; preserves sustainability and flourishing content. |
| `values.html` | Updated | Applies the shared navigation update; preserves mission, values, philosophy, and scientific-learning content. |
| `workflow.html` | Updated | Applies the shared navigation update; preserves guides and registered-access content. |
| `styles.css` | Updated | Extends the existing palette and typography with metric cards, analytics sections, the chart, pilot and signal layouts, the page directory, responsive rules, visible keyboard focus, and reduced-motion handling. |
| `tests/site-navigation.test.ps1` | Updated | Updates the existing navigation regression check for the seven primary links and their order, Dashboard availability, active-page states, the homepage calls to action, and coverage of all public HTML pages. |
| `README.md` | Updated | Aligns the repository introduction with the new positioning; documents static demonstration data, pilot status, and the review and migration documents. |
| `docs/gpt-6-astra-migration-plan.md` | New | Documents the repository's current lack of a runtime OpenAI integration and proposes an optional, human-reviewed GPT-6 Astra capability for a future pilot, with implementation, evaluation, and rollout steps. No API implementation is included in this website update. |
| `docs/website-update-review.md` | New | Records the changes, positioning edits, content preservation, verification status, and Phase 2 recommendations for review. |

## Marketing Analytics Lab

The new `analytics-lab.html` page is functional in the static site and processes files locally in a Web Worker. `js/analytics/parser-worker.js` and `js/analytics/parser.mjs` enforce the 10 MB, 20,000-row, 100-column, 1-million-cell, and 20-sheet limits for CSV, XLSX, and XLS input. `assets/vendor/xlsx.full.min.js` is vendored for offline browser parsing and accompanied by `assets/vendor/SHEETJS-LICENSE.txt`; spreadsheet formulas and macros are not executed.

The Lab separates data, calculations, interpretation, and decision support. `js/analytics/data-quality.mjs` performs preview checks, type and missing-value notes, duplicate detection, outlier prompts, and mapping suggestions. `js/analytics/metrics.mjs` contains the deterministic metric registry (market, customer, campaign, pricing, financial, and advanced financial measures), while `js/analytics/statistics.mjs` contains descriptive statistics, confidence intervals, correlation, regression, t-tests, and forecasts. `js/analytics/charts.mjs` produces bounded bar, line, donut, scatter, and histogram views with an underlying accessible table. `js/analytics/calculators.mjs` provides the required market-growth example, manual and mapped inputs, scenarios, and history. `js/analytics/interpretations.mjs` renders the required Business Question → Method → Why This Method Fits → Formula → Calculation → Interpretation → Marketing / Managerial Meaning → Decision Questions sequence.

`js/analytics/strategy.mjs` powers Case Analysis Mode. It keeps user-entered evidence, source, origin, confidence, assumptions, and open questions explicit across SWOT/TOWS, Porter’s Five Forces, STP and target evaluation, positioning, 4P/7P, PESTEL, Ansoff, product/lifecycle, benchmarking and perceptual mapping, root-cause questions, problem prioritization, weighted decisions, risk matrices, recommendations, KPIs, SMART objectives, and executive synthesis. It does not call an AI service or create automatic conclusions. `styles-analytics.css` and `styles-analytics-strategy.css` provide the responsive and print layouts.

No existing files were removed. New files are `dashboard.html`, `analytics-lab.html`, the `js/analytics/` modules, `styles-analytics.css`, `styles-analytics-strategy.css`, the vendored SheetJS files in `assets/vendor/`, the analytics and link tests in `tests/`, `docs/gpt-6-astra-migration-plan.md`, and this review document.

## Positioning and language changes

The public HTML audit found no existing claims that CEAM+ was a completed SaaS product. The changes clarify the practical product direction and preserve possible future SaaS development.

| Location | Previous language | Updated language or treatment |
| --- | --- | --- |
| Homepage title | “CEAM+ \| Change, Marketing, and Human Adaptation” | “CEAM+ \| Marketing Intelligence for Better Decisions” |
| Homepage headline | “CEAM+ helps organizations understand why people adopt, resist, sustain, and respond to change.” | “Marketing Intelligence for Better Decisions.” The original adoption-and-change statement remains in the broader framework explanation. |
| Homepage definition | “CEAM+ is a consulting and research platform for change, marketing, human behavior, organizational adaptation, sustainability, and resilience.” | “CEAM+ is a marketing intelligence and decision-support platform that helps organizations understand what is happening, why it is happening, what may happen next, and what actions may improve performance.” |
| Homepage primary actions | “Explore Consulting” and “Start With Marketing” | “Explore the Dashboard” and “Explore the CEAM+ Framework.” Consulting and Marketing remain accessible. |
| Homepage development path | Understand, Design, Measure, Adapt | Framework → Dashboard → Business insights and decision support → Pilot implementations → Future productized services, including possible SaaS capabilities. The existing consulting process remains on `consulting.html`. |
| About metadata | “the lived experience and research behind human adaptation, better decisions, AI literacy, and sustainable change” | “the research and applied analytics behind an evolving marketing intelligence platform, human adaptation, and sustainable change.” The personal background and origin story remain in the page body. |
| Navigation | “Assessments” and “AI & Technology” | “CEAM+ Adoption Model” and “AI,” pointing to the same existing destinations. Other former primary destinations remain in the page directory. |
| README introduction | “CEAM+ is a human-centered framework that helps individuals and small businesses understand complexity, make better decisions, adopt useful technology, and turn awareness into sustainable action.” | Uses the new marketing intelligence and decision-support definition, followed by an explicit statement that the research-informed framework remains the foundation. |

The new copy treats predictive outputs as estimates, diagnostic relationships as possible explanations, and prescriptive outputs as options for human review. CEAM+ signals are contextual indicators. The dashboard's displayed values are labeled Demonstration Data; the page does not claim live analytics or real client outcomes.

## Preserved content and behavior

- Research Architecture, Evidence, research limitations, counterevidence, and contextual variation remain. The Evidence section gains only a linkable identifier within its existing content.
- The main content of the framework and assessment pages remains. Assessment scoring, interpretation logic, forms, authentication scripts, AI resources, and Supabase files are unchanged.
- Existing consulting, marketing, sustainability, AI, applications, and guides remain available through primary navigation or the page directory. No existing useful page was deleted.
- The broader framework still considers agency, resilience, ethical judgment, trust, sustainability, adaptive capacity, human value, willingness, resistance, and visible and less visible indicators. Marketing is presented as the first major practical application.
- The existing logo, palette, typography, shared scripts, and static hosting architecture remain. New styles extend existing components and adapt dashboard content across screen widths.

## Verification

Source diffs were reviewed to check the intended scope and preservation of existing content. The SaaS-language audit found no completed-product claims requiring removal.

Final verification completed locally:

- `powershell -NoProfile -ExecutionPolicy Bypass -File tests/site-navigation.test.ps1`
- `powershell -NoProfile -ExecutionPolicy Bypass -File tests/research-integrity.test.ps1`
- `powershell -NoProfile -ExecutionPolicy Bypass -File tests/registered-access.test.ps1`
- `powershell -NoProfile -ExecutionPolicy Bypass -File tests/layer-images.test.ps1`
- `powershell -NoProfile -ExecutionPolicy Bypass -File tests/ai-tools-consultation.test.ps1`
- `node --test tests/analytics-math.test.mjs tests/analytics-data.test.mjs tests/internal-links.test.mjs` (22 tests passed)
- `node tests/analytics-lab-browser.test.cjs` (CSV/XLSX local loading, preview and mapping, charts and tables, calculator, downloads, retained case state, responsive widths, and skip-link focus)
- `node tests/strategy-browser-check.cjs` (Case Analysis Mode worksheets, evidence and confidence handling, matrices, report safety, reset, and 1440/390/320 layouts)

The checks used a local Python HTTP server and bundled Playwright with Microsoft Edge. No deployment, model request, live data connection, or production configuration change was performed for this update.

No deployment, model request, live data connection, or production configuration change was performed for this update.

## Phase 2 recommendations

1. Define one pilot with an organization, a specific decision question, agreed data sources, and a measurable outcome. Specify units, time windows, denominators, attribution, and data quality before connecting live metrics.
2. Build a small data-import and validation workflow. Keep demonstration and pilot data clearly distinguished, and add filters or comparisons only where the available data supports them.
3. Validate diagnostic and forecasting methods against suitable baselines. Report assumptions, uncertainty, and changes in performance; keep correlation distinct from causal evidence.
4. Develop contextual CEAM+ signal measures with consent, appropriate access controls, and research-informed interpretation. Evaluate alternative explanations and avoid treating people as deterministic scores.
5. Publish a concise pilot case study using approved evidence: the decision question, data and methods, insights, tested action, observed result, limitations, and lessons. This can strengthen the portfolio dimension without changing the site into a resume.
6. If AI interpretation becomes useful, follow the separate GPT-6 Astra migration plan. Keep metric calculations deterministic, requests behind an authorized server endpoint, and consequential decisions under human review.
7. Consider productized services or SaaS capabilities after pilots establish repeatable value, support requirements, and reliable measurement.
