# CEAM+ scoring audit — October 18, 2026 (before changes)

## Inventory and preservation baseline

Audited all 13 registered assessments plus the separate AI Use & Adoption Analysis definition: 14 definitions, 449 base questions. `scoring-question-map.json` records every base question, dimension membership, question and dimension weights, reverse flag, choices, N/A permission, and numeric scoring scale. `definitions.mjs`, `marketing-assessment.mjs`, `ai-analysis-definition.mjs`, `personalization.mjs`, and `ceam-metadata.mjs` are protected by SHA-256 fixtures. Existing tailoring in `personalization.mjs` adds context questions; that pre-existing behavior is preserved, not expanded by this update. Its full source is hash-protected along with all base definitions and metadata.

Before changing scoring or storage, captured 56 complete original outputs (empty/mixed/complete/N/A for each definition) in `tests/fixtures/scoring-original.json`. The existing scoring/storage suite passed 21/21 tests. No assessment question, response choice, ordering, or respondent workflow will be expanded.

## Existing arithmetic and missing data

`scoring.mjs`: maturity/agreement 1–5 maps to 0/25/50/75/100; yes/partly/no maps 100/50/0; evidence available/unavailable maps 100/0; choice uses explicit option scores; numeric items use bounded linear normalization and declared reversals. `question.reverse` reverses the final item score. Invalid values are rejected. Blank/null/absent responses are unanswered, `unsure` is unknown, allowed `na` is excluded from applicable weight, disallowed `na` is invalid. None becomes zero. Positive weights default to 1 when invalid.

Dimension score is the answered-question weighted mean. Overall score is the scored-dimension weighted mean, unless the definition disables the overall. Raw precision is retained during aggregation; output rounds to one decimal. A single usable answer can generate a partial numeric result; there is no calibrated minimum-sample rule. Overall coverage and evidence indices are dimension-weighted averages. All-N/A dimensions have zero coverage and remain in that aggregate denominator, so it differs from a simple count-based applicable completion percentage.

Evidence quality weights: none=0, anecdotal=25, some=60, strong=100. Dimension evidence index = quality × applicable weighted coverage × 0.5 if a contradiction is explicitly flagged. Overall evidence is a dimension-weighted average. Notes are not verified; absence of a conflict flag does not prove agreement.

Bands: 0 Early / Significant Gaps; 40 Developing; 60 Moderate / Emerging Capability; 75 Established; 90 Advanced, unless definition supplies bands. These are planning conventions, not validated clinical or psychometric thresholds.

Planning priority = .4 × gap + .2 × importance + .15 × risk + .15 × (100 − evidence index) + 10 if selected. Importance/risk use 1–5 scaled to 0–100. No usable score uses a planning gap of 50, never a substantive imputed score. All-N/A dimensions get priority 0. Investigation applies when score absent, confidence<40, coverage<60, or conflict flagged. Priority labels use 40 and 65. Patterns require every relevant dimension to have usable answers and ≥60% coverage, with high≥75 and low<60. These rules remain unchanged.

## Other calculation and interpretation paths

- `marketing-diagnostics.mjs` displays the dedicated 40-item Marketing Assessment in 1–5 units. Overall is an equal mean of all answered items; each five-item dimension is its own answered mean. The shared scorer's raw 0–100 overall instead weights scored dimensions equally, which can differ under unequal missingness. This is an existing adapter distinction, not a newly verified formula defect. Preserve both and store the displayed marketing calculation separately; never substitute one for the other silently. Marketing confidence also caps self-report support separately. Maturity cutoffs are 2,3,4,4.6 on the displayed one-decimal scale. Existing diagnostic patterns and priorities are provisional interpretations.
- `ai-analysis.mjs` uses the core scorer for practice items, converts dimensions to 1–5, disables the overall, and adds separate categorical claim-evidence confidence. `ai-analysis-definition.mjs` explicitly identifies proposed constructs and unvalidated diagnostics. Human baseline text comparison uses topic matching, not verified semantic agreement. Task, outcome, and human-contribution rules are preserved.
- `interpretation.mjs` aggregates question metadata into variables and C/E/A/M/+ views, applies provisional planning gates, and calculates one-step sensitivity examples. These are not new validated official dimensions. This update will not add any construct to the official score or promote research-only groupings.
- `personalization.mjs` already changes context prompts, weights, and actions under an explicit tailoring signature. Comparisons must retain that signature and exact question/scale compatibility. Organization size itself is not a score.
- Financial metrics call `analytics/metrics.mjs` and remain separate from capability scoring. Persona modules have no scoring dependency and do not supply answers.

## Persistence and historical behavior found

`storage.mjs` uses schema 1 under `ceamplus.assessment-center.v1`. Partitions include assessment ID/version/context/initiative/tailoring signature. Read operations do not write; corrupt and blocked storage fail safely. Demos are rejected on saves. Results store assessment version and completion date, response data and calculated result, but no explicit scoring or interpretation version. An existing result ID is upserted, losing the previous calculated payload if inputs or formulas change. `getHistory` compares earliest/latest within a partition but does not check scoring version.

Assessment report reopening loads the stored result rather than calling the core scorer. Marketing report/Dashboard adapters rebuild their display from stored answers, however, so a future adapter change could silently change an old presentation. The existing Dashboard does not provide all requested reporting layers.

There is no reliable respondent identity, cohort size, or standardized stakeholder-role metadata collected across current assessments. Context words, case prose, demographics, and numbers of records do not establish independent stakeholder samples. Do not infer group scores or stage of adoption from general readiness ratings. Repeated use cannot establish willingness or benefit.

## Change decision

No substantive arithmetic defect has been verified. Preserve all official formulas and original results. Add transparent reporting, explicit version records, frozen original calculation snapshots, and comparability guards. Do not silently migrate records. Legacy versions must remain explicitly unknown.

All current constructs are empirically provisional. Therefore the request to allow only established constructs into an official score cannot be used to relabel these as scientifically established or remove them from the legacy score without violating score preservation. The new layer labels dimensions Provisional (or Insufficient evidence), identifies their existing legacy membership, and admits no new provisional/research-only dimension into that score. No validated official score is asserted. A separately validated scoring model is withheld.

For very sparse inputs, an explicitly provisional presentation rule may suppress a new summary conclusion while retaining the original numeric calculation for audit. It must not rewrite the stored numerical result or claim to be a validated evidence threshold. Evidence support labels must describe an auditable rubric separately from substantive scores and statistical confidence.
