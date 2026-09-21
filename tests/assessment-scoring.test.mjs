import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreAssessment, scoreBand, financialMetrics, FINANCIAL_FIELDS } from '../js/assessments/scoring.mjs';
import { STORAGE_KEY, assessmentKey, loadState, saveDraft, loadDraft, deleteDraft, saveResult, getHistory, clearAssessment } from '../js/assessments/storage.mjs';

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8 * Math.max(1, Math.abs(expected)), `${actual} should equal ${expected}`);
const question = (id, options = {}) => ({ id, type: 'maturity', weight: 1, allowNA: true, ...options });
const dimension = (id, questions, options = {}) => ({ id, title: id, weight: 1, importance: 3, risk: 3, questions, ...options });
const definition = (dimensions, options = {}) => ({ id: 'test-assessment', version: '1.0', overallLabel: 'Capability', dimensions, ...options });
const one = definition([dimension('first', [question('a'), question('b')])]);
const support = (quality = 'strong', contradiction = false) => ({ first: { quality, contradiction, source: 'Records', note: 'User-declared only.' } });
const metric = (inputs, id) => financialMetrics(inputs).find((value) => value.id === id);
function memoryStorage() {
  const data = new Map();
  return { data, getItem: (key) => data.has(key) ? data.get(key) : null, setItem: (key, value) => data.set(key, String(value)), removeItem: (key) => data.delete(key) };
}

test('weights work at both question and dimension levels without premature rounding', () => {
  const def = definition([dimension('first', [question('a'), question('b', { weight: 3 })]), dimension('second', [question('c')], { weight: 3 })]);
  const result = scoreAssessment(def, { answers: { a: '1', b: '5', c: '1' } });
  assert.equal(result.dimensions[0].score, 75);
  assert.equal(result.dimensions[1].score, 0);
  assert.equal(result.overall, 18.8);
  assert.equal(result.coverage, 100);
});

test('mixed supported question types use their declared scale and weights', () => {
  const def = definition([dimension('first', [question('a'), question('b', { type: 'agreement' }), question('c', { type: 'yes-partly-no' }), question('d', { type: 'evidence' }), question('e', { type: 'choice', options: [{ value: 'reviewed', score: 80 }] }), question('f', { type: 'numeric', min: 0, max: 10, numericScore: { min: 0, max: 10 } })])]);
  assert.equal(scoreAssessment(def, { answers: { a: '5', b: '4', c: 'partly', d: 'available', e: 'reviewed', f: '7' } }).overall, 79.2);
});

test('unknown and permitted not-applicable responses are excluded, never scored zero', () => {
  const result = scoreAssessment(definition([dimension('first', [question('a'), question('b'), question('c')])]), { answers: { a: '5', b: 'unsure', c: 'na' }, evidence: support() });
  assert.equal(result.overall, 100);
  assert.equal(result.coverage, 50);
  assert.equal(result.confidence, 50);
  assert.equal(result.scoreScope, 'partial');
  assert.equal(result.uncertainty.unknown, 1);
  assert.equal(result.uncertainty.notApplicable, 1);
  assert.match(result.scopeNote, /answered conditions only/);
});

test('all unknown, all N/A and empty response return no numeric readiness conclusion', () => {
  for (const answers of [{ a: 'unsure', b: 'unsure' }, { a: 'na', b: 'na' }, {}]) {
    const result = scoreAssessment(one, { answers });
    assert.equal(result.overall, null);
    assert.equal(result.dimensions[0].score, null);
    assert.equal(result.band, 'Insufficient responses');
    assert.equal(result.coverage, 0);
    assert.equal(result.confidence, 0);
    assert.equal(result.scoreScope, 'none');
  }
  const excluded = scoreAssessment(one, { answers: { a: 'na', b: 'na' } }).dimensions[0];
  assert.equal(excluded.priority, 0);
  assert.equal(excluded.priorityType, 'not-applicable');
  assert.equal(scoreAssessment(one).dimensions[0].priorityType, 'investigate');
});

test('blank numeric values, impossible options and disallowed N/A remain visible as uncertainty', () => {
  const def = definition([dimension('first', [question('a', { allowNA: false }), question('b', { type: 'numeric', min: 0, max: 5, numericScore: { min: 0, max: 5 } }), question('c', { type: 'choice', options: [{ value: 'valid', score: 50 }] })])]);
  const result = scoreAssessment(def, { answers: { a: 'na', b: '6', c: '__proto__' } });
  assert.equal(result.overall, null);
  assert.equal(result.uncertainty.invalid, 3);
  assert.equal(scoreAssessment(def, { answers: { b: '   ' } }).uncertainty.unanswered, 3);
  assert.equal(scoreAssessment(def, { answers: { b: '0' } }).dimensions[0].score, 0);
});

test('bounded numeric scoring and reversed scales use explicit definitions', () => {
  const def = definition([dimension('first', [question('a', { type: 'numeric', numericScore: { min: 0, max: 10, reverse: true } }), question('b', { reverse: true })])]);
  assert.equal(scoreAssessment(def, { answers: { a: '20', b: '1' } }).overall, 50);
  assert.equal(scoreAssessment(def, { answers: { a: '0', b: '5' } }).overall, 50);
});

test('high scores with weak evidence show unsupported counts and investigation priority', () => {
  const result = scoreAssessment(one, { answers: { a: '5', b: '5' }, evidence: support('none') });
  assert.equal(result.overall, 100);
  assert.equal(result.confidence, 0);
  assert.equal(result.uncertainty.unsupported, 2);
  assert.equal(result.dimensions[0].priorityType, 'investigate');
  assert.match(result.confidenceLabel, /not verified or statistical/);
});

test('declared quality, missing coverage and contradictions independently constrain confidence', () => {
  assert.equal(scoreAssessment(one, { answers: { a: '5', b: '5' }, evidence: support('some') }).confidence, 60);
  const result = scoreAssessment(one, { answers: { a: '5' }, evidence: support('strong', true) });
  assert.equal(result.coverage, 50);
  assert.equal(result.confidence, 25);
  assert.equal(result.uncertainty.contradictions, 1);
  assert.equal(result.uncertainty.unanswered, 1);
  assert.equal(result.dimensions[0].priorityType, 'investigate');
  assert.match(result.dimensions[0].priorityReasons.join(' '), /Contradictory evidence/);
});

test('planning priority reflects the published gap, importance, risk, evidence and user selection formula', () => {
  const def = definition([dimension('first', [question('a')], { importance: 5, risk: 5 })]);
  const base = { answers: { a: '1' }, evidence: support() };
  const result = scoreAssessment(def, base).dimensions[0];
  assert.equal(result.priority, 75); // .4*100 + .2*100 + .15*100 + .15*0
  assert.equal(result.priorityType, 'act');
  assert.equal(scoreAssessment(def, { ...base, priorities: ['first'] }).dimensions[0].priority, 85);
  const unsupported = scoreAssessment(def, { answers: base.answers }).dimensions[0];
  assert.equal(unsupported.priority, 90);
  assert.equal(unsupported.priorityType, 'investigate');
});

test('bands are descriptive, configurable, and overall aggregation can be disabled', () => {
  assert.equal(scoreBand(39.99), 'Early / Significant Gaps');
  assert.equal(scoreBand(40), 'Developing');
  assert.equal(scoreBand(79), scoreBand(80));
  const def = { ...one, bands: [{ min: 0, label: 'Exploratory' }, { min: 50, label: 'Supported' }] };
  assert.equal(scoreAssessment(def, { answers: { a: '3', b: '3' } }).band, 'Supported');
  assert.equal(scoreAssessment({ ...def, overallEnabled: false }, { answers: { a: '5' } }).overall, null);
});

test('patterns require actual interpretable high/low evidence from sufficiently answered dimensions', () => {
  const def = definition([dimension('first', [question('a')]), dimension('second', [question('b')])], { patterns: [{ label: 'High first / low second', high: ['first'], low: ['second'] }] });
  assert.deepEqual(scoreAssessment(def, { answers: { a: '5', b: '1' } }).patterns, ['High first / low second']);
  assert.deepEqual(scoreAssessment(def, { answers: { a: '5', b: 'unsure' } }).patterns, []);
  assert.deepEqual(scoreAssessment(def, { answers: { a: '5', b: '5' } }).patterns, []);
});

test('all financial calculations have consistent non-mutating known-answer fixtures', () => {
  const inputs = { revenue: 1000, previousRevenue: 800, cogs: 600, variableCosts: 400, fixedCosts: 300, marketRevenue: 10000, acquisitionCost: 600, newCustomers: 20, beginning: 100, ending: 110, lost: 10, conversions: 50, opportunities: 200, purchases: 40, averagePurchase: 25, frequency: 4, lifespan: 3, monthlyContribution: 10, price: 30, unitCost: 10, incrementalContribution: 1800, marketingCost: 1000, attributedRevenue: 5000, adSpend: 1000, investment: 1000, periodBenefit: 250, budget: 900, actual: 1000, forecast: 900 };
  const original = JSON.stringify(inputs);
  const values = Object.fromEntries(financialMetrics(inputs).map((row) => [row.id, row.value]));
  const expected = { revenue_growth: 25, gross_profit: 400, gross_margin: 40, contribution: 600, contribution_margin: 60, operating_profit: 300, operating_margin: 30, market_share: 10, cac: 30, clv: 300, retention: 90, churn: 10, conversion: 25, aov: 25, breakeven: 15, romi: 80, roas: 5, payback: 4, budget_variance: 100, clv_cac: 10, cac_payback: 3, forecast_error: 100, forecast_absolute_error: 10 };
  assert.equal(Object.keys(values).length, Object.keys(expected).length);
  for (const [id, value] of Object.entries(expected)) near(values[id], value);
  assert.equal(JSON.stringify(inputs), original);
  assert.equal(new Set(FINANCIAL_FIELDS.map((field) => field.key)).size, FINANCIAL_FIELDS.length);
  assert.match(metric(inputs, 'clv_cac').note, /not contribution CLV/);
});

test('financial missing values do not become zero, valid zero numerators calculate, invalid denominators are disclosed', () => {
  assert.ok(financialMetrics({}).every((value) => value.value === null));
  assert.equal(metric({ revenue: '', purchases: 2 }, 'aov').value, null);
  assert.equal(metric({ revenue: 0, purchases: 2 }, 'aov').value, 0);
  assert.equal(metric({ revenue: '0', previousRevenue: '100' }, 'revenue_growth').value, -100);
  assert.equal(metric({ conversions: 0, opportunities: 10 }, 'conversion').value, 0);
  assert.equal(metric({ revenue: 10, purchases: 0 }, 'aov').value, null);
  assert.match(metric({ revenue: 10, purchases: 0 }, 'aov').error, /greater than/);
  assert.equal(metric({ conversions: 20, opportunities: 10 }, 'conversion').value, null);
  assert.equal(metric({ ending: 90, newCustomers: 100, beginning: 100 }, 'retention').value, null);
  assert.equal(metric({ revenue: '1,000', purchases: 2 }, 'aov').value, null);
  assert.equal(metric({ revenue: true, purchases: 2 }, 'aov').value, null);
  assert.equal(metric({ revenue: 0, forecast: 0 }, 'forecast_error').value, 0);
  assert.equal(metric({ revenue: 0, forecast: 0 }, 'forecast_absolute_error').value, null);
  assert.ok(financialMetrics({ revenue: 1e-300, forecast: 1e308 }).every((row) => row.value === null || Number.isFinite(row.value)));
});

test('business performance does not change the separately calculated measurement-capability score', () => {
  const response = { answers: { a: '5', b: '5' }, metrics: { revenue: 100, previousRevenue: 200 } };
  const before = JSON.stringify(response);
  const result = scoreAssessment(one, response);
  assert.equal(result.overall, 100);
  assert.equal(metric(response.metrics, 'revenue_growth').value, -50);
  assert.equal(JSON.stringify(response), before);
});

test('storage reads are non-writing; drafts are partitioned by assessment, context, initiative and version', () => {
  const storage = memoryStorage();
  assert.equal(loadState(storage).ok, true);
  assert.equal(storage.data.size, 0);
  const response = { answers: { a: '3' }, context: 'Employee', initiative: 'CRM' };
  assert.equal(saveDraft(one, response, storage).ok, true);
  assert.deepEqual(loadDraft(one, response, storage).draft.response, response);
  assert.equal(loadDraft(one, { ...response, context: 'Customer' }, storage).draft, null);
  assert.equal(loadDraft(one, { ...response, initiative: 'AI' }, storage).draft, null);
  assert.equal(loadDraft({ ...one, version: '2.0' }, response, storage).draft, null);
  assert.equal(assessmentKey(one, { context: ' Employee ', initiative: ' CRM ' }), assessmentKey(one, response));
  assert.equal(deleteDraft(one, response, storage).ok, true);
  assert.equal(loadDraft(one, response, storage).draft, null);
});

test('saving a result clears its draft, upserts plan edits and compares earliest baseline to latest comparable follow-up', () => {
  const storage = memoryStorage();
  const baseline = { answers: { a: '1', b: '1' }, context: 'Employee', initiative: 'CRM', resultId: 'baseline', completedAt: '2026-01-01T00:00:00Z' };
  saveDraft(one, baseline, storage);
  assert.equal(saveResult(one, baseline, scoreAssessment(one, baseline), storage).ok, true);
  assert.equal(loadDraft(one, baseline, storage).draft, null);
  const updated = { ...baseline, actionPlan: [{ owner: 'Team', status: 'In Progress' }] };
  saveResult(one, updated, scoreAssessment(one, baseline), storage);
  assert.equal(getHistory(one, baseline, storage).history.length, 1);
  assert.equal(getHistory(one, baseline, storage).followUp, null);
  assert.equal(getHistory(one, baseline, storage).history[0].response.actionPlan[0].owner, 'Team');
  for (const [resultId, date, answer] of [['latest', '2026-03-01', '4'], ['middle', '2026-02-01', '3']]) {
    const response = { ...baseline, resultId, completedAt: date, answers: { a: answer, b: answer } };
    saveResult(one, response, scoreAssessment(one, response), storage);
  }
  const history = getHistory(one, baseline, storage);
  assert.equal(history.baseline.id, 'baseline');
  assert.equal(history.followUp.id, 'latest');
  assert.equal(history.comparison[0].baseline, 0);
  assert.equal(history.comparison[0].followUp, 75);
  assert.equal(history.comparison[0].change, 75);
  assert.equal(getHistory({ ...one, version: '2.0' }, baseline, storage).history.length, 0);
  assert.equal(getHistory(one, { ...baseline, initiative: 'AI' }, storage).history.length, 0);
});

test('missing baseline dimension values do not create fictional numeric improvement', () => {
  const storage = memoryStorage();
  const baseline = { resultId: 'a', completedAt: '2026-01-01', answers: { a: 'unsure', b: 'unsure' } };
  const followup = { resultId: 'b', completedAt: '2026-02-01', answers: { a: '5', b: '5' } };
  saveResult(one, baseline, scoreAssessment(one, baseline), storage);
  saveResult(one, followup, scoreAssessment(one, followup), storage);
  assert.equal(getHistory(one, {}, storage).comparison[0].change, null);
});

test('demo data cannot be saved into drafts or completed history', () => {
  const storage = memoryStorage();
  const response = { demo: true, answers: { a: '5' } };
  assert.equal(saveDraft(one, response, storage).ok, false);
  assert.equal(saveResult(one, response, scoreAssessment(one, response), storage).ok, false);
  assert.equal(storage.data.size, 0);
});

test('corrupt and unsupported saved data never gets overwritten by later saves', () => {
  for (const corrupt of ['{not json', JSON.stringify({ schemaVersion: 2, drafts: {}, results: {} }), JSON.stringify({ schemaVersion: 1, drafts: {}, results: { bad: [null] } })]) {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, corrupt);
    assert.equal(loadState(storage).ok, false);
    assert.equal(saveDraft(one, {}, storage).ok, false);
    assert.equal(saveResult(one, {}, scoreAssessment(one), storage).ok, false);
    assert.equal(storage.getItem(STORAGE_KEY), corrupt);
  }
});

test('storage access denial and quota failure are readable and do not destroy previously saved records', () => {
  const storage = memoryStorage();
  saveDraft(one, { answers: { a: '3' } }, storage);
  const before = storage.getItem(STORAGE_KEY);
  storage.setItem = () => { throw new Error('Quota exceeded'); };
  const result = saveResult(one, {}, scoreAssessment(one), storage);
  assert.equal(result.ok, false);
  assert.match(result.error, /Quota/);
  assert.equal(storage.getItem(STORAGE_KEY), before);
  assert.equal(loadState({ getItem: () => { throw new Error('Storage denied'); }, setItem() {} }).ok, false);
  assert.equal(loadState(null).ok, false);
});

test('explicit assessment reset preserves other assessments', () => {
  const storage = memoryStorage();
  const other = { ...one, id: 'other' };
  saveDraft(one, { answers: {} }, storage);
  saveDraft(other, { answers: {} }, storage);
  saveResult(one, {}, scoreAssessment(one), storage);
  saveResult(other, {}, scoreAssessment(other), storage);
  assert.equal(clearAssessment(one, storage).ok, true);
  assert.equal(getHistory(one, {}, storage).history.length, 0);
  assert.equal(getHistory(other, {}, storage).history.length, 1);
});
