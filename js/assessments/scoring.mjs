/** Pure, provisional assessment indicators. No DOM, network or persistence. */
import { calculateMetric, metricDefinitions } from '../analytics/metrics.mjs';

const bounded = (value, low = 0, high = 100) => Math.min(high, Math.max(low, value));
const rounded = (value) => Math.round(value * 10) / 10;
const weightOf = (value) => Number.isFinite(value) && value > 0 ? value : 1;
const evidenceWeights = { none: 0, anecdotal: 25, some: 60, strong: 100 };
const emptyUncertainty = () => ({ unknown: 0, notApplicable: 0, unanswered: 0, invalid: 0, unsupported: 0, contradictions: 0, total: 0 });

export const MATURITY_BANDS = [
  { min: 0, label: 'Early / Significant Gaps' },
  { min: 40, label: 'Developing' },
  { min: 60, label: 'Moderate / Emerging Capability' },
  { min: 75, label: 'Established' },
  { min: 90, label: 'Advanced' },
];

export function scoreBand(score, bands = MATURITY_BANDS) {
  if (score === null || !Number.isFinite(score)) return 'Insufficient responses';
  return [...bands].sort((a, b) => b.min - a.min).find((band) => score >= band.min)?.label || 'Unclassified';
}

/** Numeric strings only: blank, booleans, comma formatting and infinity are not zero. */
function numeric(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim())) return null;
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function questionScore(question, raw) {
  if (raw === undefined || raw === null || raw === '') return { status: 'unanswered' };
  const value = String(raw).trim();
  if (!value) return { status: 'unanswered' };
  if (value === 'unsure') return { status: 'unknown' };
  if (value === 'na') return { status: question.allowNA ? 'notApplicable' : 'invalid' };
  let score;
  if (question.type === 'maturity' || question.type === 'agreement') {
    if (/^[1-5]$/.test(value)) score = (Number(value) - 1) * 25;
  } else if (question.type === 'yes-partly-no') {
    score = ({ yes: 100, partly: 50, no: 0 })[value];
  } else if (question.type === 'evidence') {
    score = ({ available: 100, unavailable: 0 })[value];
  } else if (question.type === 'choice') {
    score = question.options?.find((option) => String(option.value) === value)?.score;
  } else if (question.type === 'numeric') {
    const amount = numeric(raw);
    const scale = question.numericScore;
    if (amount !== null && scale && Number.isFinite(scale.min) && Number.isFinite(scale.max) && scale.max > scale.min &&
        (question.min === undefined || amount >= question.min) && (question.max === undefined || amount <= question.max)) {
      score = bounded((amount - scale.min) / (scale.max - scale.min) * 100);
      if (scale.reverse) score = 100 - score;
    }
  }
  if (!Number.isFinite(score) || score < 0 || score > 100) return { status: 'invalid' };
  return { status: 'scored', score: question.reverse ? 100 - score : score };
}

// Public read-only access for explainability and supported counterfactuals.
// The assessment scorer continues to use the same implementation and formulas.
export function scoreQuestion(question, raw) {
  return questionScore(question, raw);
}

/**
 * Score only interpretable responses; never impute unknown or N/A as zero.
 * Coverage uses eligible question weights (permitted N/A excluded). Confidence
 * is an evidence-support indicator, not statistical confidence or verification.
 */
export function scoreAssessment(definition, response = {}) {
  const answers = response.answers || {};
  const allUncertainty = emptyUncertainty();
  const dimensions = (definition.dimensions || []).map((dimension) => {
    const uncertainty = emptyUncertainty();
    const evidence = response.evidence?.[dimension.id] || {};
    const quality = Object.hasOwn(evidenceWeights, evidence.quality) ? evidence.quality : 'none';
    let eligibleWeight = 0, answeredWeight = 0, totalWeight = 0, weightedScore = 0;
    for (const question of dimension.questions || []) {
      const weight = weightOf(question.weight);
      const answer = questionScore(question, answers[question.id]);
      totalWeight += weight;
      uncertainty.total++;
      if (answer.status !== 'notApplicable') eligibleWeight += weight;
      if (answer.status === 'scored') {
        answeredWeight += weight;
        weightedScore += answer.score * weight;
        if (quality === 'none' || quality === 'anecdotal') uncertainty.unsupported++;
      } else uncertainty[answer.status]++;
    }
    if (evidence.contradiction === true) uncertainty.contradictions = 1;
    for (const key of Object.keys(uncertainty)) allUncertainty[key] += uncertainty[key];
    const score = answeredWeight ? weightedScore / answeredWeight : null;
    const coverage = eligibleWeight ? answeredWeight / eligibleWeight * 100 : 0;
    const confidence = evidenceWeights[quality] * coverage / 100 * (uncertainty.contradictions ? 0.5 : 1);
    const importance = bounded(numeric(dimension.importance) ?? 3, 1, 5) / 5 * 100;
    const risk = bounded(numeric(dimension.risk) ?? 3, 1, 5) / 5 * 100;
    const selected = (response.priorities || []).includes(dimension.id);
    const gap = score === null ? 50 : 100 - score;
    // An explicit planning heuristic; evidence gaps raise investigation priority.
    const allNotApplicable = uncertainty.total > 0 && uncertainty.notApplicable === uncertainty.total;
    const priority = allNotApplicable ? 0 : .4 * gap + .2 * importance + .15 * risk + .15 * (100 - confidence) + (selected ? 10 : 0);
    const priorityType = allNotApplicable ? 'not-applicable' : score === null || confidence < 40 || coverage < 60 || uncertainty.contradictions ? 'investigate' : 'act';
    const priorityReasons = [
      score === null ? 'No interpretable score: establish the current conditions first.' : `Observed gap: ${rounded(gap)} points below 100 in answered items.`,
      `Strategic importance: ${importance / 20}/5; risk: ${risk / 20}/5.`,
      `Declared evidence support: ${rounded(confidence)}%; ${rounded(coverage)}% applicable-question coverage.`,
    ];
    if (selected) priorityReasons.push('Selected as a priority for the current objective.');
    if (quality === 'none' || quality === 'anecdotal') priorityReasons.push('Documented support is missing: investigate before treating the gap as established.');
    if (uncertainty.contradictions) priorityReasons.push('Contradictory evidence was flagged: investigate context and explanations.');
    if (coverage < 100) priorityReasons.push('Unanswered, unknown or invalid responses limit the profile.');
    if (allNotApplicable) priorityReasons.splice(0, priorityReasons.length, 'All questions were marked not applicable. This dimension is outside the selected scope.');
    return {
      id: dimension.id, title: dimension.title, score: score === null ? null : rounded(score),
      band: scoreBand(score, definition.bands), weight: weightOf(dimension.weight),
      coverage: rounded(coverage), confidence: rounded(confidence), evidenceQuality: quality,
      priority: rounded(priority), priorityType,
      priorityLabel: allNotApplicable ? 'Excluded from this scope' : `${priority >= 65 ? 'High' : priority >= 40 ? 'Medium' : 'Lower'} ${priorityType === 'investigate' ? 'investigation' : 'action'} priority`,
      priorityReasons, uncertainty, answeredWeight, eligibleWeight, totalWeight,
      // Keep full precision internally for accurate multi-stage weighting.
      _score: score, _coverage: coverage, _confidence: confidence,
    };
  });
  const scored = dimensions.filter((dimension) => dimension._score !== null);
  const allWeight = dimensions.reduce((sum, dimension) => sum + dimension.weight, 0);
  const scoredWeight = scored.reduce((sum, dimension) => sum + dimension.weight, 0);
  const rawOverall = scoredWeight ? scored.reduce((sum, dimension) => sum + dimension._score * dimension.weight, 0) / scoredWeight : null;
  const overall = definition.overallEnabled === false || definition.overallLabel === null ? null : rawOverall;
  const coverage = allWeight ? dimensions.reduce((sum, dimension) => sum + dimension._coverage * dimension.weight, 0) / allWeight : 0;
  const confidence = allWeight ? dimensions.reduce((sum, dimension) => sum + dimension._confidence * dimension.weight, 0) / allWeight : 0;
  const byId = new Map(dimensions.map((dimension) => [dimension.id, dimension]));
  const patterns = (definition.patterns || []).filter((pattern) => {
    const ids = [...(pattern.high || []), ...(pattern.low || [])];
    if (!ids.length || !ids.every((id) => byId.has(id) && byId.get(id)._score !== null && byId.get(id)._coverage >= 60)) return false;
    return (pattern.high || []).every((id) => byId.get(id)._score >= 75) && (pattern.low || []).every((id) => byId.get(id)._score < 60);
  }).map((pattern) => pattern.label);
  const scoreScope = !scored.length ? 'none' : coverage < 100 || allUncertainty.notApplicable > 0 ? 'partial' : 'complete';
  return {
    assessmentId: definition.id, version: definition.version, overall: overall === null ? null : rounded(overall),
    band: scoreBand(overall, definition.bands), scoreScope, coverage: rounded(coverage), confidence: rounded(confidence),
    dimensions: dimensions.map(({ _score, _coverage, _confidence, ...dimension }) => dimension),
    uncertainty: allUncertainty, patterns,
    confidenceLabel: 'User-declared evidence support; not verified or statistical confidence',
    scopeNote: !scored.length ? 'No interpretable answers: no readiness conclusion can be drawn.' : scoreScope === 'partial' ?
      'This score describes answered conditions only. Missing and not-applicable areas cannot be assumed ready.' :
      'This profile covers the supplied answers. Evidence remains user-declared and conclusions are provisional.',
  };
}

const field = (key, label, group, hint = '') => ({ key, label, group, min: 0, step: 'any', hint });
export const FINANCIAL_FIELDS = [
  field('revenue', 'Current-period revenue', 'Revenue & costs'),
  field('previousRevenue', 'Comparable previous-period revenue', 'Revenue & costs'),
  field('cogs', 'Cost of goods/services sold', 'Revenue & costs'),
  field('variableCosts', 'Total variable costs', 'Revenue & costs'),
  field('fixedCosts', 'Total fixed costs', 'Revenue & costs'),
  field('marketRevenue', 'Total comparable market revenue', 'Revenue & costs'),
  field('acquisitionCost', 'Total selected customer acquisition costs', 'Customers', 'Use a consistent marketing-only or fully loaded cost definition.'),
  field('newCustomers', 'New customers acquired', 'Customers'),
  field('beginning', 'Customers at period start', 'Customers'),
  field('ending', 'Customers at period end', 'Customers'),
  field('lost', 'Starting-cohort customers lost', 'Customers'),
  field('conversions', 'Conversions', 'Customers'),
  field('opportunities', 'Eligible conversion opportunities', 'Customers'),
  field('purchases', 'Number of purchases', 'Customers'),
  field('averagePurchase', 'Average purchase value for CLV', 'Customer value', 'Use the same cohort and currency; a model input, not a verified lifetime outcome.'),
  field('frequency', 'Purchases per customer per period', 'Customer value'),
  field('lifespan', 'Expected customer lifespan in periods', 'Customer value'),
  field('monthlyContribution', 'Monthly contribution per acquired customer', 'Customer value'),
  field('price', 'Selling price per unit', 'Break-even'),
  field('unitCost', 'Variable cost per unit', 'Break-even'),
  field('incrementalContribution', 'Estimated incremental contribution before marketing cost', 'Campaigns', 'ROMI needs an incrementality assumption; attributed revenue alone is not causal evidence.'),
  field('marketingCost', 'Marketing cost for ROMI', 'Campaigns'),
  field('attributedRevenue', 'Ad-attributed revenue', 'Campaigns'),
  field('adSpend', 'Advertising spend', 'Campaigns'),
  field('investment', 'Initial investment', 'Planning'),
  field('periodBenefit', 'Net cash benefit per period', 'Planning'),
  field('budget', 'Budgeted cost', 'Planning'),
  field('actual', 'Actual cost', 'Planning'),
  field('forecast', 'Forecast revenue for the current period', 'Planning'),
];

const metricMappings = [
  ['revenue_growth', 'Revenue growth', 'growth_rate', { previous: 'previousRevenue', current: 'revenue' }],
  ['gross_profit', 'Gross profit', 'gross_profit', { revenue: 'revenue', cogs: 'cogs' }],
  ['gross_margin', 'Gross margin', 'gross_margin', { revenue: 'revenue', cogs: 'cogs' }],
  ['contribution', 'Contribution', 'contribution', { revenue: 'revenue', variableCosts: 'variableCosts' }],
  ['contribution_margin', 'Contribution margin', 'contribution_margin', { revenue: 'revenue', variableCosts: 'variableCosts' }],
  ['operating_profit', 'Operating profit (simplified)', 'operating_profit', { revenue: 'revenue', variableCosts: 'variableCosts', fixedCosts: 'fixedCosts' }],
  ['operating_margin', 'Operating margin (simplified)', 'operating_margin', { revenue: 'revenue', variableCosts: 'variableCosts', fixedCosts: 'fixedCosts' }],
  ['market_share', 'Revenue market share', 'revenue_share', { companyRevenue: 'revenue', marketRevenue: 'marketRevenue' }],
  ['cac', 'Customer acquisition cost', 'cac', { acquisitionCost: 'acquisitionCost', newCustomers: 'newCustomers' }],
  ['clv', 'Simple revenue CLV estimate', 'clv', { averagePurchase: 'averagePurchase', frequency: 'frequency', lifespan: 'lifespan' }],
  ['retention', 'Customer retention', 'retention', { beginning: 'beginning', ending: 'ending', newCustomers: 'newCustomers' }],
  ['churn', 'Customer churn', 'churn', { beginning: 'beginning', lost: 'lost' }],
  ['conversion', 'Conversion rate', 'conversion', { conversions: 'conversions', opportunities: 'opportunities' }],
  ['aov', 'Average order value', 'avg_purchase', { revenue: 'revenue', purchases: 'purchases' }],
  ['breakeven', 'Break-even units', 'breakeven', { fixedCosts: 'fixedCosts', price: 'price', unitCost: 'unitCost' }],
  ['romi', 'Contribution-based ROMI', 'romi_contribution', { incrementalContribution: 'incrementalContribution', marketingCost: 'marketingCost' }],
  ['roas', 'Revenue ROAS', 'roas', { attributedRevenue: 'attributedRevenue', adSpend: 'adSpend' }],
  ['payback', 'Simple investment payback', 'payback', { investment: 'investment', periodBenefit: 'periodBenefit' }],
  ['budget_variance', 'Budget variance (actual cost minus budget)', 'budget_variance', { budget: 'budget', actual: 'actual' }],
];

function runMetric(id, label, labId, values, addedNote = '') {
  const definition = metricDefinitions.find((metric) => metric.id === labId);
  try {
    const result = calculateMetric(labId, values);
    return { id, label, value: result.result, unit: result.unit, formula: result.formula, note: [addedNote, result.assumptions, result.limitations].filter(Boolean).join(' ') };
  } catch (error) {
    return { id, label, value: null, unit: '', formula: definition.formula, note: addedNote || 'Supply valid, comparable inputs to calculate this metric.', error: error.message };
  }
}

/** Business values stay separate from measurement capability scores. No grading. */
export function financialMetrics(inputs = {}) {
  const parsed = Object.fromEntries(FINANCIAL_FIELDS.map(({ key }) => [key, numeric(inputs[key])]));
  const metrics = metricMappings.map(([id, label, labId, mapping]) => runMetric(id, label, labId,
    Object.fromEntries(Object.entries(mapping).map(([key, source]) => [key, parsed[source]]))));
  const cac = metrics.find((metric) => metric.id === 'cac').value;
  const revenueCLV = metrics.find((metric) => metric.id === 'clv').value;
  metrics.push(runMetric('clv_cac', 'Revenue CLV:CAC (illustrative)', 'clv_cac', { clv: revenueCLV, cac },
    'This uses simple revenue CLV, not contribution CLV. Do not apply contribution-based benchmark ratios; lifetime costs, discounting and uncertainty are excluded.'));
  metrics.push(runMetric('cac_payback', 'CAC payback', 'cac_payback', { cac, monthlyContribution: parsed.monthlyContribution }));
  const actual = parsed.revenue, forecast = parsed.forecast;
  const rawError = actual !== null && actual >= 0 && forecast !== null && forecast >= 0 ? actual - forecast : null;
  const errorValue = Number.isFinite(rawError) ? rawError : null;
  const absoluteError = errorValue === null ? null : Math.abs(errorValue);
  const percentageError = absoluteError !== null && actual > 0 ? absoluteError / actual * 100 : null;
  metrics.push({ id: 'forecast_error', label: 'Forecast error (actual revenue minus forecast)', value: errorValue, unit: 'currency', formula: 'Actual revenue − forecast revenue', note: 'A single-period signed error; positive means revenue exceeded forecast. This is not multi-period forecast accuracy.' });
  metrics.push({ id: 'forecast_absolute_error', label: 'Absolute percentage forecast error', value: Number.isFinite(percentageError) ? percentageError : null, unit: '%', formula: '|Actual revenue − forecast revenue| / actual revenue × 100', note: 'Requires positive actual revenue. One observation is not MAPE or evidence of general forecasting skill.' });
  return metrics;
}
