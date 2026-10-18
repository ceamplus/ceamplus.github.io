# CEAM+ layered scoring reports — October 18, 2026

Expand what CEAM+ can responsibly interpret from existing assessment data without expanding the assessments, inventing evidence, or increasing respondent burden.

## Audit before modification

See [the pre-change audit](scoring-audit-october-2026.md) and [complete base question map](scoring-question-map.json). The audit located 14 definitions with 449 base questions, including the seven requested assessments and all other registered assessments. Existing tailoring remains unchanged. The original scoring/storage suite passed 21 tests before changes. Fifty-six complete scoring outputs and SHA-256 hashes protect existing numerical results, question wording, choices, order, weights, metadata, and tailoring logic.

No verified substantive arithmetic defect was found. Existing core weighted means, marketing equal-item 1–5 reporting, AI practice dimensions without an overall score, evidence indices, thresholds, reverse scoring, financial metrics, and missing-data behavior are retained. Explicit metadata is the only addition to core scorer outputs.

## New result layers

The Dashboard and assessment reports now expose the main score, existing dimension breakdown, usable completion counts, separate evidence-confidence label, scoring status, important response drivers, uncertainties, Signals to examine, stakeholder availability, historical comparability, and a practical next evidence/action step.

Counts distinguish usable answers, applicable questions, skipped answers, unknown responses, invalid inputs, and permitted N/A responses. No missing category is scored as zero. Count-based completion is labeled separately from the existing weighted coverage index.

The new summary presentation uses an explicitly provisional 60% usable-applicable-response rule, reusing the existing investigation convention rather than asserting a validated cutoff. Below that threshold, the summary says Insufficient evidence; the original numeric calculation remains unchanged and available in the version record. All-N/A and empty responses produce no new numeric summary.

Evidence labels follow a disclosed provisional rubric: Insufficient when usable response coverage is too low; Stronger when responses are complete and every applicable dimension declares strong support with a source/note and no conflict; Moderate when at least half declare some/strong documentary support and no conflict; Limited otherwise. These labels are not statistical confidence or verification. Existing evidence indices remain visible separately. Human baseline availability, dates/recency, gaps, and conflicts are disclosed without invented numerical weights.

Drivers rank the influence of existing usable responses under the preserved formula. They name reported conditions and the need to check evidence; they do not propose advantageous answer changes. Existing patterns and gaps become calmly labeled Signals to examine. No demographic characteristic or persona contributes to scoring or evidence-confidence arithmetic.

## Dimension status and intentionally withheld scoring

The existing source explicitly calls these instruments provisional. Dimensions are therefore labeled Provisional, or Insufficient evidence when appropriate. “Established” in a pre-existing maturity band is not scientific validation. Existing legacy membership is retained to preserve scores; no new provisional or research-only construct is added to them. Promoting current constructs to empirically Established, or deleting them from the legacy calculation, would be unjustified. A new validated official score is intentionally withheld.

No adoption stage is assigned: current questions do not adequately distinguish awareness, interest, trial, repeated use, workflow integration, delegation, and sustained use. Continued use is not treated as willingness or success.

Stakeholder comparisons are explicitly unavailable because current records lack standardized comparable role cohorts, independent sample sizes, and administration periods. Context labels, case-text mentions, demographic segments, and the number of saved records cannot establish those samples. The view lists missing perspectives, unknown sample size, and the evidence needed. It does not invent owner/employee differences or average disagreement away.

No new probabilistic forecasts, demographic weights, psychometric validation claims, causal conclusions, or evidence-expiry thresholds were added. Human-baseline prose is not automatically treated as verified evidence. Existing AI claim classifications remain separate from practice ratings and the new reporting rubric.

## Historical safeguards

- New calculated results explicitly carry `ceam-core-1.0` or `ceam-ai-profile-1.0`. These version the existing algorithms; they do not certify validity.
- Explicit saves add assessment identifier/version, scoring version, completion date, original calculation (including original response), applicable count, evidence-confidence method, interpretation version, and a reporting snapshot. The storage namespace and schema remain compatible.
- Legacy records are read without writes or migration. Their scoring version is `legacy-unversioned`; no historical version is invented. Opening a result does not recalculate its official score.
- Existing marketing snapshots are reused for display instead of rebuilding historical scores from responses. A legacy result without a marketing snapshot retains its stored core result rather than silently substituting a newly computed display. The equal-item marketing mean and core dimension-weighted mean can differ with unequal missingness; the audit documents this existing distinction.
- Same-version edits keep the initial calculation and retain prior calculated payloads when the result changes. Action-plan edits still update the same administration and do not create false follow-ups.
- A changed scoring version or assessment scope/version is saved as a distinct linked record. The earlier record remains intact. Repeated saves of that branch do not duplicate it.
- Historical comparison uses stored values only. It reports previous/current score, difference, days, versions, dimension changes, and recorded confidence labels. Different/unknown scoring versions, assessment versions, profiles, display methods, or definition snapshots suppress differences and show warnings. Legacy baseline tables use the same guard.
- Reviewers can inspect retained original versus current calculations; no new scoring model is automatically executed or applied. No new model was introduced, so a separate model-recalculation interface was intentionally withheld.
- Dashboard JSON exports include the version record and retained original/revisions. Assessment reports expose version details, and their result exports retain scoring metadata. Browser storage denial remains a truthful failure with current-tab use and downloads available.

## Files changed for scoring

New: `js/assessments/scoring-versions.mjs`, `result-layers.mjs`, `result-layers-view.mjs`, `styles-result-layers.css`, `tests/result-layers.test.mjs`, `tests/result-layers-browser.test.cjs`, two fixture files under `tests/fixtures/`, `docs/scoring-question-map.json`, the pre-change audit, and this report.

Updated: `scoring.mjs` (version metadata only), `ai-analysis.mjs` (version metadata only), `storage.mjs` (retained originals/version-aware history), `app.mjs` (report mounting and frozen marketing display), `ai-analysis-view.mjs` (report mounting), `dashboard.mjs` (layers, stored displays, metadata export), Dashboard and Assessment Center stylesheet links. README links both reports. No question or choice source was edited.

## Verification

Fifteen new unit tests cover original arithmetic, unchanged content hashes, all missing-answer categories, insufficient-evidence summaries, separate confidence, recency/baseline disclosures, version storage, original/revision preservation, material-version branching, unknown legacy versions, assessment-version changes, comparable change, missing stakeholder data, identity isolation, and blocked storage. The new browser suite tests Dashboard/report layers, keyboard explanations, responsive layouts, version exports, sparse results, historical comparison, and byte-for-byte legacy preservation.

Final verification on October 18, 2026: the complete Node suite passed **143/143 tests**. Syntax checks passed for **53 JavaScript files**. All **five PowerShell suites** and **19 browser scripts** pass. The browser run initially passed 18 scripts; the remaining survey integration script passed after updating its obsolete navigation count for Personas. The result-layers browser script also passed again after the final insufficient-evidence presentation changes. Logs and the initial browser manifest are under `.cache/personas-scoring-checks/` and `.cache/personas-scoring-final/`; the corrected survey run is recorded separately in `survey-integration-rerun.log`. Browser coverage uses Microsoft Edge/Chromium; no full cross-browser or screen-reader certification is claimed. This static site has no build/bundling step.

Everything remains local. No push, merge, deployment, migration, or external data submission was performed.
