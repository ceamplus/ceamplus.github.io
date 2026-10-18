# CEAM+ assessment scoring and local history

## Status and interpretation

The version 1.0 assessments are transparent, provisional decision-support instruments. Their question weights, bands, evidence-support indicators, pattern thresholds and planning-priority formula have not been validated as scientific benchmarks. They do not diagnose people, predict adoption, determine financial health or authorize a high-stakes decision.

An assessment score describes the conditions reported in its answered questions. The score is not the conclusion: use the dimension-level evidence, uncertainty, investigation questions, suggested actions and structural context. Numeric business performance is calculated separately from the capability to measure it. Good measurement capability can coexist with weak financial performance.

## Modules and contracts

- `js/assessments/definitions.mjs` owns the versioned content, question and dimension weights, importance, risk, evidence guidance, actions, KPI suggestions, and survey/analytics links. Content and weights can change without editing the engine; publish a new assessment version whenever comparability changes.
- `js/assessments/scoring.mjs` exports `scoreAssessment(definition, response)`, `scoreBand(score, optionalBands)`, `MATURITY_BANDS`, `FINANCIAL_FIELDS`, and `financialMetrics(inputs)`. It imports the existing, pure Analytics Lab metric calculations. It has no browser state, network calls or side effects.
- `js/assessments/storage.mjs` exports explicit browser-storage operations. Importing it or calculating a result does not save anything.

Responses contain `answers` keyed by globally unique question ID, `evidence` keyed by dimension ID, a dimension-ID array `priorities`, `context`, `initiative`, and optional numeric `metrics`. Evidence objects contain declared `quality` (`none`, `anecdotal`, `some`, `strong`), free-text `note` and `source`, and boolean `contradiction`. Notes and sources are preserved for interpretation; the engine does not read documents or verify their content.

## Question scores

| Question type | Values and scoring |
| --- | --- |
| Maturity | `1, 2, 3, 4, 5` map to `0, 25, 50, 75, 100` |
| Agreement | `1, 2, 3, 4, 5` map to `0, 25, 50, 75, 100`; this remains a reported perception |
| Yes / Partly / No | `yes=100`, `partly=50`, `no=0` |
| Evidence availability | `available=100`, `unavailable=0`; the question measures evidence availability, not business performance |
| Choice | Each configured option supplies an explicit score from 0 to 100 |
| Numeric | An explicit `numericScore: {min,max,reverse?}` converts `(value − min)/(max − min) × 100`, bounded to 0–100; optional question `min/max` limits validate allowed inputs |
| Not sure | `unsure` records uncertainty and is excluded from score calculations |
| Not applicable | `na` is accepted only when `allowNA=true`, then excluded from score calculations and the applicable-question coverage denominator |

Optional question `reverse=true` reverses the resulting 0–100 score. Numeric reverse mapping and question-level reverse should not both be used unless the double reversal is intentional. Invalid choices, invalid numbers and disallowed N/A values are excluded and counted separately. Empty values remain unanswered. Zero is a valid numeric value when the question allows it; blank values never become zero. A numeric question without an explicit score mapping is not silently graded.

Every question and dimension has a relative positive `weight`. Missing or invalid weights fall back to 1. Current content declares weights rather than relying on that fallback. Content conventions give a maturity/choice prompt weight 2 and agreement, yes/partly/no, or evidence-availability prompts weight 1. Dimension weights vary by assessment to express its particular managerial emphasis. These are planning judgments, not factor loadings or empirically fitted coefficients. The content documentation and definitions provide the per-dimension register.

## Dimension and overall calculations

For a dimension with interpretable responses:

`dimension score = Σ(question score × question weight) / Σ(answered question weights)`

For an assessment with at least one scored dimension:

`overall score = Σ(dimension score × dimension weight) / Σ(scored dimension weights)`

Both calculations retain full precision until display values are rounded to one decimal place. Unanswered dimensions are omitted from the overall score denominator, not assigned zero. If no question is interpretable, the dimension and overall scores are `null`, with “Insufficient responses.” A definition can disable aggregation with `overallEnabled=false` or `overallLabel=null`; dimension profiles remain available.

This exclusion means a high partial score cannot establish overall readiness. For example, answering one item with the highest score and leaving nine unknown gives 100 on the answered item, with 10% applicable-question coverage. `scoreScope`, `scopeNote` and the coverage/uncertainty indicators must accompany that score.

### Coverage

`dimension coverage = Σ(answered question weights) / Σ(applicable question weights) × 100`

Permitted N/A is removed from the applicable denominator; unknown, invalid and unanswered items remain in it. If every question is N/A, coverage is 0 because there is no interpretable covered area. Overall coverage is the weighted mean of coverage across **all** dimensions, using dimension weights. Thus a dimension with no applicable responses still lowers the whole-profile coverage indicator: an excluded area cannot establish whole-assessment readiness.

`scoreScope` is `none` with no scored dimension, `partial` with incomplete coverage or any N/A, and `complete` otherwise. “Complete” describes response coverage and does not mean verified evidence, validated conclusions or operational readiness.

### Descriptive bands

| Unrounded score | Band |
| --- | --- |
| 0 to below 40 | Early / Significant Gaps |
| 40 to below 60 | Developing |
| 60 to below 75 | Moderate / Emerging Capability |
| 75 to below 90 | Established |
| 90 to 100 | Advanced |

A definition may replace these through `bands: [{min,label}, ...]`. Labels are reading aids. Crossing a threshold does not establish a meaningful scientific difference, and rounded display values near boundaries should be interpreted cautiously. In particular, a one-point difference should not drive a decision.

## User-declared evidence support

The interface calls this **Evidence confidence**, with a visible qualifier: **user-declared evidence support; not verified or statistical confidence**.

| Declared quality | Support factor |
| --- | --- |
| No evidence available | 0 |
| Anecdotal | 25 |
| Some documented evidence | 60 |
| Strong documented evidence | 100 |

`dimension confidence = support factor × (dimension coverage / 100) × contradiction adjustment`

The adjustment is 0.5 when the user flags contradictory evidence and 1 otherwise. Overall confidence is the dimension-weighted mean across all dimensions. No automatic document verification, contradiction detection, calibration study or statistical confidence interval is implied. A strong declaration is only the user's appraisal of the evidence; multiple records can still repeat the same underlying source.

`uncertainty` separately counts unknown, N/A, unanswered, invalid and unsupported items. `unsupported` counts scored questions in dimensions with no evidence or anecdotal evidence, identifying the lack of declared documented support. `contradictions` counts dimensions whose evidence was flagged as contradictory. These categories overlap; they must not be summed into a number of unique problematic questions. `total` counts all configured questions.

## CEAM+ Planning Priority

The score is a transparent planning aid, not a scientifically proven ranking:

`priority = 0.40 × gap + 0.20 × importance + 0.15 × risk + 0.15 × evidence uncertainty + 0.10 × selected priority`

- `gap = 100 − dimension score`. If there is no interpretable score, a neutral planning value of 50 is used only in this priority calculation; it is never imputed as a dimension score.
- Importance and risk are each declared on a 1–5 scale and mapped to 20–100. Missing values use 3/5.
- `evidence uncertainty = 100 − dimension confidence`.
- Selected priority is 100 for a user-selected dimension and 0 otherwise, adding at most 10 points.

Priority labels are High at 65 and above, Medium at 40 to below 65, and Lower below 40. Missing evidence can increase the need to investigate, which is why evidence uncertainty increases priority. It does not make a self-reported performance gap more certain.

`priorityType='investigate'` if no score exists, confidence is below 40, coverage is below 60, or a contradiction is flagged; otherwise the type is `act`. Every priority includes plain-language reasons. An entirely N/A dimension receives 0 and `priorityType='not-applicable'` and should be excluded from action lists. Structural barriers, constrained resources, access and authority remain legitimate explanations to investigate.

Configured cross-dimension patterns require every named dimension to have at least 60% applicable-question coverage. High means score ≥75 and low means score <60. These are tentative patterns in the supplied responses, not causal findings. Missing scores cannot trigger a high/low pattern.

## Financial metrics

`FINANCIAL_FIELDS` supplies UI labels, groups and the canonical input keys. `financialMetrics(response.metrics)` returns rows `{id,label,value,unit,formula,note,error?}`. Missing/invalid inputs yield `value:null`; a formula-specific error explains unavailable calculations. Business values never feed into the capability score automatically.

Most formulas reuse `js/analytics/metrics.mjs`, preserving the Lab's validation and conventions. Inputs must have matching periods, populations, market boundaries, accounting scope, currency and units. Strict numeric strings are accepted; comma-formatted amounts, booleans, blank values and non-finite values are rejected. Zero numerators are valid; zero denominators and impossible cohort relationships are rejected.

| Output | Formula / scope |
| --- | --- |
| Revenue growth | `(revenue − previousRevenue) / previousRevenue × 100` |
| Gross profit / margin | `revenue − cogs`; divide by revenue for margin |
| Contribution / margin | `revenue − variableCosts`; divide by revenue for margin |
| Simplified operating profit / margin | `revenue − variableCosts − fixedCosts`; divide by revenue for margin |
| Revenue market share | `revenue / marketRevenue × 100` |
| CAC | `acquisitionCost / newCustomers` using the chosen acquisition-cost scope |
| Simple revenue CLV estimate | `averagePurchase × frequency × lifespan` |
| Revenue CLV:CAC (illustrative) | The simple revenue CLV estimate divided by calculated CAC |
| Retention | `(ending − newCustomers) / beginning × 100` with reconciled cohort definitions |
| Churn | `lost / beginning × 100` |
| Conversion | `conversions / opportunities × 100` |
| Average order value | `revenue / purchases` |
| Break-even units | `fixedCosts / (price − unitCost)` with positive unit contribution |
| Contribution-based ROMI | `(incrementalContribution − marketingCost) / marketingCost × 100` |
| Revenue ROAS | `attributedRevenue / adSpend` |
| CAC payback | Calculated CAC divided by `monthlyContribution` |
| Simple investment payback | `investment / periodBenefit` |
| Budget variance | `actual − budget`, where these are comparable costs |
| Forecast error | `revenue − forecast`, a single-period signed error |
| Absolute percentage forecast error | `abs(revenue − forecast) / revenue × 100`, requiring positive actual revenue |

Revenue CLV is explicitly distinguished from contribution CLV: revenue-based CLV:CAC must not use contribution-based benchmark ratios. It omits lifetime costs, discounting and model uncertainty. Use the Analytics Lab's margin-based CLV model for a contribution convention. ROMI needs an incrementality assumption; ad attribution alone does not establish causation. A single-period forecast error is not MAPE or evidence of general forecasting skill. No performance benchmark or financial recommendation is inferred from a calculated value.

## Explicit local saving and comparison

The storage key is `ceamplus.assessment-center.v1`. Its JSON state is:

```js
{
  schemaVersion: 1,
  drafts: { [partitionKey]: { assessmentId, version, context, initiative, response, updatedAt } },
  results: { [partitionKey]: [{ assessmentId, version, context, initiative, id,
    createdAt, updatedAt, response, result }] }
}
```

`partitionKey = JSON.stringify([assessmentId, version, trimmedContext, trimmedInitiative])`. Comparison is case-sensitive and requires the same assessment, version, context and initiative. Different versions and scopes are not silently compared. Context identity alone cannot establish that respondents, populations, evidence or interpretation remained the same; the UI must retain the score-change warning.

| API | Behavior |
| --- | --- |
| `loadState(storage?)` | Read only; returns `{ok,state,error?}`. An unavailable/corrupt store gives `ok:false` and an empty display state, without rewriting the original. |
| `saveDraft(def,response,storage?)` | Explicitly writes a draft for this partition. |
| `loadDraft(def,scope,storage?)` | Returns `{ok,draft,error?}` for this partition. |
| `deleteDraft(def,scope,storage?)` | Explicitly removes the specified draft. |
| `saveResult(def,response,result,storage?)` | Saves a completed record and removes the same partition's draft only after preparing the combined update. |
| `getHistory(def,scope,storage?)` | Returns `{ok,history,baseline,followUp,comparison,error?}` for comparable saved administrations. |
| `clearAssessment(def,storage?)` | Explicit reset of that assessment's drafts/results across versions and scopes; leaves other assessments intact. |

Writes and deletes return `{ok,...,error?}`. The optional injected storage object is used for tests; normal operation uses browser `localStorage`. If browser access or quota fails, the UI can keep the in-memory result and offer export. Corrupt/unsupported existing state blocks writes so a failed read cannot erase it. No automatic pruning or migration is performed.

The caller should create `response.resultId` once per completed administration, with `response.completedAt`. Saving action-plan edits with that same ID updates the existing record and preserves its completion date, preventing fictional retakes. Without an ID, the storage layer generates one and returns it as `record.id`. Responses can include an `actionPlan`; it remains in the saved record. A new retake needs a fresh result ID.

Baseline is the earliest comparable saved result; follow-up is the latest when at least two exist. Dimension changes use the same dimension ID and require finite numeric scores on both sides. Missing values never become a zero baseline. Sorting uses completion dates, even when records are saved out of sequence. A change can reflect different respondents, interpretation, evidence, actual conditions or measurement variation and is never automatically attributed to an intervention.

Demo responses (`demo`, `isDemo`, or `mode:'demo'`) and demo results are rejected by saving methods. These methods do not infer a privacy opt-in: the UI invokes writes only after explicit user choice. Saving locally is persistence on that device/browser, not anonymization, encryption, backup or cross-device synchronization. Nothing in the scoring/storage modules transmits assessment responses externally.

## Verification

Run `node --test tests/assessment-scoring.test.mjs`. Tests cover nested weights, all question types, reversed numeric scales, unknown/N/A/invalid responses, no-score results, partial coverage, declared evidence and contradictions, priority calibration, pattern guards, complete metric fixtures, valid zeros, invalid denominators/cohorts, non-mutating inputs, capability/performance separation, storage partitions, plan upserts, earliest/latest comparison, absent baseline values, demo exclusion, corrupt data, quota/access errors, and assessment-specific reset.

Phase 2 should add expert review and pilot studies of content and weights, criterion-linked calibration, respondent/cohort metadata, evidence provenance and review, sensitivity analysis, measurement invariance and accessibility research, and opt-in longitudinal workflows with an explicit data-governance model before supporting higher-stakes use.
