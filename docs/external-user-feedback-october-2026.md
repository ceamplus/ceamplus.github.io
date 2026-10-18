# CEAM+ External User Feedback and Improvement Log — October 2026

Work dates: October 9–12, 2026. Scope: local implementation and verification in the existing GitHub Pages repository. Nothing was deployed, pushed, or merged.

## Owner's clarified direction

The Dashboard is the primary CEAM+ product experience. The Analytics Lab supports deeper analysis; it does not replace the Dashboard or become the main destination. Assessments, evidence, visualizations, interpretation, limitations, and potential decisions should become understandable together in the Dashboard. The owner also requested assessment saving and result downloads. The October 12 completion adds bounded changes in that direction while leaving a larger shared-workspace architecture for separate evaluation.

## Original external feedback

The following observations and suggestions came from the student's evaluation, as supplied by the repository owner. They are distinct from the technical findings below.

- Navigation had nine items across three rows, using about 200 vertical pixels.
- An empty Dashboard made it difficult to discover demonstrations and working capabilities.
- The “Market growth & purchase penetration” sample contained one row and three columns. Sample variance and standard deviation indicated insufficient observations, but population versions returned zero.
- The six-row Quarterly sales example would make a better starting point. A recommended line chart should be selected initially.
- Chart typography, large captions, irregular axis intervals, missing quarterly labels, absent value labels, and unnecessary single-series legends reduced readability.
- The Dashboard appeared more like a research proposal than a practical workspace; the Analytics Lab's functioning capabilities deserved greater visibility.
- Forecasts might be more useful with 5th, 50th, and 95th percentiles.
- Methodological discipline was a strength to preserve: association is not causation; descriptions do not explain causes; predictions are uncertain; assumptions, sample size, data quality, context, and human judgment matter.

## Repository audit and baseline

The repository is a buildless HTML/CSS/JavaScript site published through GitHub Pages. There is no `package.json`, package-manager build command, bundler, or production compilation step. The vendored SheetJS library supports local file parsing. No new runtime or test dependencies were installed.

The checkout already contained extensive modified and untracked work. It was preserved. Before source edits, a SHA-256 inventory and copies of existing source/tests were captured under ignored `.cache/feedback-baseline/`. Changes in this log are relative to that starting state, not relative to Git HEAD.

### Components and shared dependencies

| Area | Existing implementation | Impact boundary |
| --- | --- | --- |
| Navigation | Repeated header markup in all 22 root HTML pages; `styles-header.css` | Shared layout and current-section markers on every route; native secondary disclosure with a small keyboard enhancement |
| Saved Dashboard | `dashboard.html`, `js/assessments/dashboard.mjs`, `storage.mjs` | Saved-report rendering and storage remain intact; separate in-memory demo added |
| Assessment Center | `assessment-center.html`, `js/assessments/app.mjs`, definitions/scoring/personalization/interpretation modules | Existing fictional demo gains a direct URL; scoring and persistence contracts unchanged |
| Analytics Lab | `analytics-lab.html`, `js/analytics/app.mjs`, `samples.mjs`, parser/data-quality modules | Default sample, chart controls, statistics input wiring; parser/data definitions retained |
| Charts | `js/analytics/charts.mjs`, `calculators.mjs`, `styles-analytics.css` | Shared canvas rendering used by Lab, quick calculator, and new Dashboard demo |
| Statistics/forecasts | `js/analytics/statistics.mjs` plus Lab form handler | Singleton variability treatment, scenario wording, independent-group wiring and missing-period safeguards |
| Research safeguards | Assessment/survey engines, evidence reviews, AI baseline and comparison modules, research pages | Protected by existing unit, browser, and PowerShell preservation checks |

### Verified findings

- The nine-link header was a three-column grid at every width: measured 223px tall at 900/1440px, about 224px at 320/456px. Several research subpages lacked the expected current-section marker.
- Without saved results, the Dashboard offered only an assessment-start action. Its fictional business example and proposed pilot context were inside a collapsed disclosure.
- The Lab loaded no dataset on entry. The example selector started with the one-row market sample. Loading the quarterly sample produced a line recommendation while the chart control retained its default bar selection.
- `descriptiveStats([9])` returned null sample variance/SD and zero population variance/SD. Empty input was already rejected. Pure statistical functions already rejected missing, nonfinite, or invalid observations.
- The first chart was drawn before its container was visible, using a narrow fallback canvas then stretching it. Resizing did not redraw it. Font selection was hard-coded, axis increments followed arbitrary fractions of the maximum, narrow charts skipped alternate quarterly labels, and single-series legends repeated the measure name. The chart table rounded numeric results through a shared display formatter.
- Forecasts provided deterministic average, moving-average, user-assumed growth, or linear-trend projections with illustrative ±10% scenarios. They did not provide predictive distributions. The Lab also silently omitted nonnumeric forecast observations, potentially compressing missing periods.
- During the related statistical review, the Welch form handler was found to ignore Variable B and split Variable A into halves. The pure Welch implementation was correct; the UI supplied the wrong samples.

### Baseline checks actually executed

- All 101 existing Node unit tests passed.
- Four of five PowerShell suites passed. `site-navigation.test.ps1` failed on `applications.html` having no current-page marker; subsequent inspection found other research subpages with the same omission.
- All 12 existing browser scripts were attempted. Nine passed directly. The Analytics Lab and strategy scripts referenced a removed Edge 153 executable; both passed when rerun with an in-memory launcher substitution selecting the installed `msedge` channel, without changing their assertions. The disclosure script failed because “Start Survey” now matched 14 buttons; its intended legacy survey control needed an explicit selector.
- No production build command existed to run. Static source is the production artifact.

## Changes implemented

### Navigation and discoverability

- Keep Dashboard, Marketing Analytics Lab, and Assessment Center visible as primary task links. Group Home, Surveys, Research, AI, Consulting, and About in a native **Explore** disclosure. The brand still links Home, and the full page directory remains available.
- Use a horizontal desktop header, a compact tablet layout, and a readable two-column mobile layout. All primary targets remain at least 44px high. The desktop header measures 69px; tablet 123px; mobile about 171–179px at the tested widths.
- Retain native Enter/Space disclosure behavior and no-JavaScript access. Add Escape-to-close with focus return, outside-click closing, visible focus, and a current-secondary-section indicator.
- Repair missing current-section markers without removing destination or research content checks.

### Dashboard and assessment demo

- Add prominent **Load Demo Data**, **Try a Demo Assessment**, and **Open Analytics Lab** actions.
- Load an interactive six-quarter Revenue/Cost example in a separate panel, using the same sample and renderer as the Lab. Include exact table values, keyboard focus handling, responsive redraw, a fictional-data badge, and interpretation cautions.
- Demo code never reads or writes assessment storage. Existing saved results remain visible and are never replaced. Closing the demo returns focus to its entry button. Because demo loading has no overwrite operation, there is no confirmation step or opportunity to replace saved history.
- First-time visitors see the working demo automatically without focus being moved. Returning visitors with saved results see their assessments first; the demo stays available on demand. The demo presents a calculated descriptive comparison, evidence limitations, and a reversible decision to investigate together on the Dashboard.
- Add `assessment-center.html?demo=true` to launch the existing fictional assessment flow. It retains the existing demo flag and persistence rejection. A requested saved report takes precedence over the demo query.
- Clarify currently available capabilities and the assess → analyze → interpret → decide path. Retain the original business example and every research/pilot section under a clearly labeled research-framework disclosure.

### Saving and downloads

- Add a prominent **Save to Dashboard** button to readiness, Marketing Assessment, and AI analysis reports. It explicitly enables browser-local saving through the existing storage module; it does not silently opt visitors in or change the storage schema.
- Keep draft saving, action-plan updates, stable report IDs, and baseline/follow-up history. Repeated saves update the same report rather than creating duplicate follow-ups. AI human-baseline locking and scoring are unchanged.
- Preserve existing JSON downloads and PDF printing; add **Download Selected Result JSON** on the Dashboard for the selected saved report. Exports include the original response, evidence, action plan, result, and limitations. No network upload is introduced.
- Keep demo results excluded from saving. A demo download remains marked fictional. Storage failure is reported honestly beside the new button, and downloading the current report remains possible.

### Statistical behavior and rationale

- At **n = 0**, descriptive analysis remains unavailable with the existing minimum-observation error.
- At **n = 1**, all sample/population variance and standard-deviation fields return null, and all four displayed summaries say **Insufficient evidence: needs at least 2 observations**. Count, sum, mean, median, min/max, and empirical percentiles still describe the observed value.
- A fully enumerated one-member population mathematically has variance zero; sample variance with denominator n−1 is undefined. The interface explicitly explains that distinction and withholds both forms because one observation does not establish absence of variability for exploratory decisions.
- At **n ≥ 2**, retain sample denominator n−1 and population denominator n. Repeated equal observations still have zero observed variation; existing inferential caveats remain.
- Missing or invalid observations are rejected by pure functions. The Lab explicitly reports exclusions in descriptive, mean-CI, one-sample, and independent-group analyses; paired methods preserve row alignment. Forecasts reject missing/nonnumeric rows instead of silently closing time gaps.
- Correct the Welch form to compare Variable A with Variable B as independent samples, with independent missing-value handling. This preserves the existing validated calculation rather than changing its formula.

### Lab defaults and chart presentation

- Load the fictional six-row Quarterly sales sample and a line chart on entry. Keep all four existing samples (market, segments, quarters, campaigns).
- Recommendations consider the selected X/Y variables. Preserve manual chart-type choices and compatible selected columns; an explicit **Use recommended chart** action restores the suggested type. Reset is explicit.
- Measure after revealing the canvas and redraw on resize using the configuration that produced the displayed chart. Pending control edits do not silently change an already generated chart.
- Inherit site typography; use compact captions, outward rounded axis intervals including zero and every plotted value, identifiable quarterly labels, and selective value labels. Rounded value labels are marked where needed; exact calculated table values retain browser numeric precision.
- Remove redundant one-series legends while retaining category/group keys where they communicate information. Keep meaningful canvas accessible names, narrative cautions, and a data-table alternative.
- Invalidate a current chart when replacing/clearing its dataset so old plots cannot appear under new data. Explicitly saved analysis history remains available.

## Forecast uncertainty decision

**No 5th/50th/95th forecast percentiles were added.** None of the existing methods defines a defensible predictive distribution. A historical-average forecast is not automatically a predictive median, and assumed ±10% scenarios are not 5th/95th percentiles or confidence/prediction intervals. The UI and result interpretation now make this explicit.

A future implementation would require:

1. A defined forecast target, horizon, sampling/time unit, and sufficient representative history. Six fictional quarterly observations are not evidence of real-world forecast calibration.
2. A justified stochastic model or simulation/resampling procedure that accounts for residual uncertainty and, where relevant, parameter uncertainty, dependence, seasonality, structural changes, and realistic outcome constraints.
3. Forecast-error evaluation on held-out or rolling-origin data at each intended horizon. Validate quantile calibration/coverage and compare performance against simple baselines; assess whether behavior changes across groups or regimes.
4. Explicit definitions separating predictive quantiles for future observations from confidence intervals for a conditional mean and from user-authored scenarios.
5. Transparent assumptions, sensitivity checks, model limitations, and human review before consequential use. A model choice and its validation criteria should be reviewed before this larger feature is implemented.

The existing forecast caveats and deterministic methods are retained. Observed-data percentiles in descriptive analysis remain available and are labeled separately from forecast uncertainty.

## Verification after implementation

The October 12 final verification passed **113/113 Node tests**, **16/16 browser scripts**, and all **five PowerShell suites**. Syntax checks passed for **43 JavaScript files**. The expanded browser suite includes assessment saving, actual JSON downloads, reopening saved results, storage failures, demo isolation, and the existing assessment flows. Browser results are recorded in `.cache/feedback-final/browser-results.json`; Node, PowerShell, and syntax logs are in `.cache/feedback-final-checks`. Desktop and mobile Dashboard screenshots were also reviewed. Browser coverage used Microsoft Edge (Chromium); this is not a complete cross-browser or WCAG certification.

New regression files:

- `tests/analytics-statistics-edge.test.mjs`: eight tests covering n = 0/1/2/larger samples, constant values, missing/invalid inputs, both reported samples, unchanged inferential safeguards, and honest forecast scenario labels.
- `tests/analytics-charts.test.mjs`: four tests covering outward scales, extreme-range rejection, exact numeric tables, distinct tiny histogram intervals, six quarterly markers, inherited fonts, and value labels.
- `tests/analytics-feedback-browser.test.cjs`: all four samples and six chart types, initial line demo, manual overrides/reset, responsive redraw, exact tables, single-observation UI, missing-period rejection, and correct independent Welch samples.
- `tests/navigation-accessibility-browser.test.cjs`: keyboard order, Enter/Space/Escape, focus return, outside-click close, current section, and no-JavaScript disclosure behavior.
- `tests/dashboard-demo-browser.test.cjs`: automatic first-visit example, explicit load/close, interpretation, saved-results priority, exact table values, responsive rendering, demo assessment link, storage denial, no external requests, and byte-for-byte preservation of saved reports and drafts.
- `tests/assessment-saving-browser.test.cjs`: explicit keyboard saving for readiness, marketing, and AI reports; duplicate prevention; JSON export from reports and Dashboard; reload/reopen; mobile widths; saving failure with successful download; fictional demo exclusion.

Updated existing tests: `tests/analytics-math.test.mjs` (correct singleton expectation), `tests/shared-header-browser.test.cjs` and `tests/site-navigation.test.ps1` (new layout and retained destinations), `tests/analytics-lab-browser.test.cjs` and `tests/strategy-browser-check.cjs` (installed Edge channel; the Lab upload wait now distinguishes `.xls` from `.xlsx`), and `tests/site-disclosure-browser.test.cjs` (specific legacy survey selector). Existing assertions about research, survey, assessment, and AI safeguards are retained.

Test commands, with a local static server on port 8765:

```powershell
node --test tests/*.test.mjs
Get-ChildItem tests/*.test.ps1 | ForEach-Object { & pwsh -NoProfile -File $_.FullName }
$env:CEAM_TEST_URL = 'http://127.0.0.1:8765'
Get-ChildItem tests/*.cjs | ForEach-Object { & node $_.FullName }
```

Browser coverage includes 320/390/768/1440px content layouts, all-page navigation at 320/456/900/1440px, keyboard controls, actual downloads, consent, saved reports, action plans, follow-up comparisons, and human-baseline preservation. Desktop/mobile Dashboard and Lab screenshots were visually inspected. Logs and screenshots are in ignored `.cache/feedback-final*`, `.cache/feedback-verification/`, and `.cache/feedback-charts/`.

Production build: **not applicable**. There is no configured compilation/build command; these static files are served directly by GitHub Pages. Internal asset/link checks, local HTTP browser tests, and JavaScript syntax checks validate the production source. No production deployment was attempted.

## Files changed in this task

All 22 root HTML pages have bounded shared-header markup/script updates: `about.html`, `ai-solutions.html`, `ai-technology.html`, `analytics-lab.html`, `applications.html`, `assessment-center.html`, `assessments.html`, `auth.html`, `change-consulting.html`, `consulting.html`, `contact.html`, `dashboard.html`, `framework.html`, `index.html`, `marketing.html`, `mission.html`, `philosophy.html`, `research.html`, `surveys.html`, `sustainability.html`, `values.html`, and `workflow.html`. Dashboard and Lab also contain the feature-specific changes described above; other page bodies are retained.

Implementation and documentation:

- `styles-header.css`; new `js/header-navigation.js`.
- `styles-dashboard-local.css`; new `js/assessments/dashboard-demo.mjs`; `js/assessments/dashboard.mjs` (selected-result download and saved-state marker); `js/assessments/app.mjs` (demo URL and explicit save button); `js/assessments/ai-analysis-view.mjs` (explicit save button).
- `styles-analytics.css`; `js/analytics/app.mjs`, `charts.mjs`, `calculators.mjs`, and `statistics.mjs`.
- `README.md`; this development log.

Tests are enumerated in the verification section above. Local logs, baseline copies, and screenshots are kept under ignored `.cache/` and are not publication assets.

## Remaining limitations and recommendations

- Forecast time ordering and equal spacing still depend on correct source preparation and explicit assumption review. Rejecting missing values cannot detect an entirely absent calendar row or a mislabeled interval.
- Browser number precision still applies. Showing unrounded calculated table values does not create arbitrary-precision arithmetic or increase the precision of source measurements.
- Browser tests and visual checks cover the installed Edge/Chromium engine, selected desktop/mobile widths, keyboard flows, and semantic alternatives; they are not a complete WCAG conformance or assistive-technology certification. A manual screen-reader review and additional browser/device coverage remain useful.
- The legacy Dashboard monthly example and proposed pilot measures are still illustrative. There is no live business-data backend or validated predictive percentile model.
- The nine header links are still repeated in static HTML. A later templating/build migration could reduce maintenance duplication, but is not needed for this update.
- Keep the Dashboard as the primary experience. A future shared evidence workspace could attach selected Lab analyses, source metadata, and decision notes to Dashboard initiatives. Define consent, persistence/versioning, evidence provenance, and uncertainty presentation before implementing that larger integration. The current update does not automatically transfer uploaded Lab files or claim to provide a unified saved-analysis workspace.
- Introducing a probabilistic forecasting model, changing persistence architecture, removing research capabilities, and deployment/push/merge are outside this local change and require explicit approval. No approval is needed merely to review these local edits.

Research integrity is preserved through separate fictional/user data, unchanged assessment scoring and human-baseline architecture, explicit missing-data and sample-size limits, honest forecast wording, exact tables alongside visual summaries, and continued human responsibility for interpretation and action.
