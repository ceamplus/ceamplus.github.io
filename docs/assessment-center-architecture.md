# Assessment Center architecture

## Repository inspection and preservation plan

The site is static HTML/CSS/JavaScript published by GitHub Pages. `script.js` owns the existing human-adaptation instruments, their context-sensitive questions, scoring, recommendations, safeguards, and optional submission workflow. `assessments.html` is their current entry point. The Marketing Analytics Lab has separate modules under `js/analytics/` and runs calculations locally. Existing uncommitted website changes are retained.

The new center is independent of `script.js`. `surveys.html` exposes the existing instruments with survey terminology; `assessments.html` remains a working compatibility route. Both preserve instrument logic and identifiers. The new center never imports the legacy submission code.

## Implementation boundaries

- `assessment-center.html`: accessible static landing shell and local-only content policy.
- `js/assessments/definitions.mjs`: versioned assessment metadata, dimensions, questions, weights, evidence guidance, actions, and links. Content can evolve independently of rendering.
- `js/assessments/personalization.mjs`: configurable industry, size, department, and objective layers that tailor language, evidence, metrics, and actions while retaining common constructs.
- `js/assessments/scoring.mjs`: pure scoring, uncertainty, planning priorities, patterns, and separate financial calculations.
- `js/assessments/storage.mjs`: explicit local saving, drafts, results, and comparable history.
- `js/assessments/app.mjs`: catalogue, recommendation wizard, guided dimensions, evidence notes, results, action plans, retakes, print/copy/JSON export.
- `js/assessments/dashboard.mjs`: read-only aggregation of explicitly saved local results into priorities, action status, metrics, and comparable progress.
- `styles-assessments.css`: scoped responsive presentation and print layout.

No server, login, API keys, AI service, external fonts, analytics, or response uploads are required by the center. Its response state starts in memory. Visitors can explicitly enable browser saving; local storage may be shared with other users of that browser. Demo data remains separate from real saved history. Navigation to supporting surveys or analytics passes tool/context identifiers only, never responses.

## Evidence model

Surveys describe what people report. Assessments combine reported conditions with user-described supporting evidence. Analytics separately calculates what supplied numbers show. Decisions require human interpretation; follow-up compares like contexts and versions without attributing change to an intervention.

Unknown and not-applicable responses are recorded separately from scores. Evidence strength is declared by the respondent and is not verification or a statistical confidence interval. Contradictions are explicit investigation signals. Financial measurement capability scores are separate from calculated business performance.

## Verification

Pure Node tests check weighted scores, uncertainty, priority logic, financial calculations, definition completeness, and storage comparison. Existing site checks and browser flows cover survey preservation, both routes, all twelve entries, navigation, keyboard/mobile use, evidence entry, demo, saving/resuming, retaking, exports, charts, and console/network behavior. Detailed formulas and implementation results are documented alongside this file.
