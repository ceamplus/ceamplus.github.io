import test from 'node:test';
import assert from 'node:assert/strict';
import { marketingMaturity, buildMarketingProfile } from '../js/assessments/marketing-diagnostics.mjs';
import { scoreAssessment } from '../js/assessments/scoring.mjs';
import { saveResult, getHistory } from '../js/assessments/storage.mjs';

const names = ['Strategic Marketing (Big M)', 'Customer & Market Understanding', 'External Environment', 'Value Proposition & Differentiation', 'Marketing Execution (little m)', 'Customer Relationships', 'Marketing Information & Research', 'Analytics & Performance'];
const definition = {
  id: 'marketing-assessment', version: '1.0', overallEnabled: true,
  dimensions: names.map((title, d) => ({ id: `dimension-${d + 1}`, title, weight: 1,
    questions: Array.from({ length: 5 }, (_, q) => ({ id: `q${d * 5 + q + 1}`, text: `Marketing question ${d * 5 + q + 1}`, type: 'maturity', weight: 1, allowNA: false })),
  })),
};
const responseWith = (scores = Array(8).fill(3), extra = {}) => ({
  answers: Object.fromEntries(definition.dimensions.flatMap((dimension, d) => dimension.questions.map((question, q) => [question.id, String(Array.isArray(scores[d]) ? scores[d][q] : scores[d])]))),
  evidence: {}, ...extra,
});
const profileWith = (scores, extra) => { const response = responseWith(scores, extra); return buildMarketingProfile(definition, response, scoreAssessment(definition, response)); };
const near = (value, expected) => assert.ok(Math.abs(value - expected) < 1e-10, `${value} should equal ${expected}`);

test('all maturity edges and rounded display values are classified without gaps', () => {
  const cases = [[1, 'Foundational'], [1.9, 'Foundational'], [1.94, 'Foundational'], [1.95, 'Developing'], [2, 'Developing'], [2.9, 'Developing'], [2.95, 'Established'], [3, 'Established'], [3.9, 'Established'], [3.95, 'Advanced'], [4, 'Advanced'], [4.5, 'Advanced'], [4.54, 'Advanced'], [4.55, 'Integrated'], [4.6, 'Integrated'], [5, 'Integrated']];
  for (const [value, expected] of cases) assert.equal(marketingMaturity(value), expected, `boundary ${value}`);
  for (const invalid of [null, undefined, NaN, Infinity, 0, 5.1, '4']) assert.equal(marketingMaturity(invalid), 'Insufficient responses');
});

test('each dimension and overall use arithmetic means without prematurely rounding', () => {
  const profile = profileWith([[1, 2, 3, 4, 5], [5, 5, 4, 4, 4], 1, 2, 3, 4, 5, [4, 4, 4, 5, 5]]);
  assert.equal(profile.dimensions.length, 8);
  assert.equal(profile.dimensions.flatMap(dimension => dimension.items).length, 40);
  assert.deepEqual(profile.dimensions.map(dimension => dimension.rawScore), [3, 4.4, 1, 2, 3, 4, 5, 4.4]);
  near(profile.overallRaw, (3 + 4.4 + 1 + 2 + 3 + 4 + 5 + 4.4) / 8);
  assert.equal(profile.overall, 3.4);
  assert.equal(profile.maturity, 'Established');
  assert.equal(profile.coverage, 100);
});

test('one response change recalculates its dimension, overall, gap and action', () => {
  const response = responseWith();
  const before = buildMarketingProfile(definition, response);
  response.answers.q24 = '1';
  const after = buildMarketingProfile(definition, response);
  assert.equal(after.dimensions[4].rawScore, 2.6);
  near(after.overallRaw, before.overallRaw - 2 / 40);
  assert.match(after.dimensions[4].action, /accountable owner/);
  assert.notEqual(after.dimensions[4].action, before.dimensions[4].action);
  assert.match(after.dimensions[4].gap, /clear marketing responsibilities/);
});

test('unknown, invalid and missing values are excluded rather than coerced or set to zero', () => {
  const response = { answers: { q1: '5', q2: 'unsure', q3: '', q4: 'bad', q5: true, q6: '1', q7: '1', q8: '1', q9: 'na', q10: '6' } };
  const profile = buildMarketingProfile(definition, response);
  assert.equal(profile.dimensions[0].rawScore, 5);
  assert.equal(profile.dimensions[1].rawScore, 1);
  assert.equal(profile.dimensions[2].score, null);
  assert.equal(profile.overallRaw, 2, 'equal answered-question mean, not mean of two dimension means');
  assert.equal(profile.coverage, 10);
  assert.equal(profile.dimensions[0].coverage, 20);
  assert.equal(profile.dimensions[0].items[4].status, 'invalid');
  assert.match(profile.dimensions[0].currentState, /too incomplete/);
  assert.equal(profile.patterns.length, 0);
  assert.equal(profile.strengths.length, 1, 'only dimension with >=60% coverage may appear in ranking');
});

test('empty assessment produces no maturity or fabricated strengths, observations or orientation', () => {
  const profile = buildMarketingProfile(definition, {});
  assert.equal(profile.overall, null);
  assert.equal(profile.maturity, 'Insufficient responses');
  assert.equal(profile.confidence, 0);
  assert.deepEqual(profile.strengths, []);
  assert.deepEqual(profile.gaps, []);
  assert.deepEqual(profile.patterns, []);
  assert.equal(profile.orientation.label, 'Orientation is not established');
  assert.ok(profile.externalIndicators.every(entry => entry.score === null && /unknown/.test(entry.observation)));
  assert.ok(profile.priorities.every(priority => /unanswered/.test(priority.action)));
});

test('six specified cross-dimension patterns fire separately with strong versus weak responses', () => {
  const cases = [[0, 4, 'strategy-execution'], [1, 7, 'customer-analytics'], [7, 1, 'analytics-customer'], [4, 0, 'execution-strategy'], [3, 5, 'differentiation-relationships'], [6, 0, 'research-strategy']];
  for (const [high, low, id] of cases) {
    const scores = Array(8).fill(3); scores[high] = 4; scores[low] = 2;
    const profile = profileWith(scores);
    const pattern = profile.patterns.find(entry => entry.id === id);
    assert.ok(pattern, `${id} should fire`);
    assert.match(pattern.finding, /^Inferred pattern:/);
    assert.equal(pattern.evidence.verified, false);
    assert.deepEqual(pattern.dimensionIds, [`dimension-${high + 1}`, `dimension-${low + 1}`]);
    assert.ok(profile.priorities.some(priority => priority.action.startsWith(pattern.action)));
  }
});

test('cross-pattern thresholds use raw means and require >=60% coverage in both dimensions', () => {
  const response = responseWith([4, 3, 3, 3, 2, 3, 3, 3]);
  for (const id of ['q3', 'q4', 'q5']) response.answers[id] = 'unsure';
  assert.ok(!buildMarketingProfile(definition, response).patterns.some(pattern => pattern.id === 'strategy-execution'));
  response.answers.q3 = '4';
  assert.ok(buildMarketingProfile(definition, response).patterns.some(pattern => pattern.id === 'strategy-execution'));
  response.answers.q21 = '3'; response.answers.q22 = '3'; response.answers.q23 = '3'; response.answers.q24 = '3'; response.answers.q25 = '3';
  assert.ok(!buildMarketingProfile(definition, response).patterns.some(pattern => pattern.id === 'strategy-execution'), '3 is not low');
  assert.ok(!profileWith([3, 3, 3, 3, 2, 3, 3, 3]).patterns.some(pattern => pattern.id === 'strategy-execution'), '3 is not high');
});

test('opposite strategy/execution profiles generate different priorities and actions', () => {
  const strategy = profileWith([5, 3, 3, 3, 1, 3, 3, 3]);
  const execution = profileWith([1, 3, 3, 3, 5, 3, 3, 3]);
  assert.equal(strategy.priorities[0].dimensionId, 'dimension-5');
  assert.equal(execution.priorities[0].dimensionId, 'dimension-1');
  assert.notEqual(strategy.priorities[0].action, execution.priorities[0].action);
  assert.match(strategy.priorities[0].action, /weekly commitments/);
  assert.match(execution.priorities[0].action, /long-term objective/);
});

test('different weak items in the same dimension select different targeted actions and metrics', () => {
  const customerRecords = profileWith([4, 4, 4, 4, 4, [1, 4, 4, 4, 4], 4, 4]);
  const retention = profileWith([4, 4, 4, 4, 4, [4, 1, 4, 4, 4], 4, 4]);
  assert.match(customerRecords.dimensions[5].action, /Audit a small sample/);
  assert.match(retention.dimensions[5].action, /did not return/);
  assert.notEqual(customerRecords.dimensions[5].metric, retention.dimensions[5].metric);
  assert.equal(customerRecords.overallRaw, retention.overallRaw);
});

test('small, corporate and nonprofit contexts change action scope but never score', () => {
  const scores = [1, 2, 3, 4, 5, 3, 2, 1];
  const small = profileWith(scores, { marketingContext: { size: 'small', industry: 'restaurant', primaryCustomerType: 'local diners' } });
  const corporate = profileWith(scores, { marketingContext: { size: 'large', industry: 'corporate' } });
  const nonprofit = profileWith(scores, { marketingContext: { size: 'small', organizationType: 'nonprofit' } });
  assert.deepEqual(small.dimensions.map(d => d.rawScore), corporate.dimensions.map(d => d.rawScore));
  assert.equal(small.overallRaw, corporate.overallRaw);
  assert.equal(small.overallRaw, nonprofit.overallRaw);
  assert.match(small.priorities[0].action, /one owner/);
  assert.match(small.priorities[0].action, /dining occasion/);
  assert.match(small.priorities[0].action, /local diners/);
  assert.match(corporate.priorities[0].action, /across teams/);
  assert.match(nonprofit.priorities[0].action, /mission value/);
});

test('evidence type, self-declared quality, coverage and contradictions affect support, never scores', () => {
  const evidence = type => ({ 'dimension-1': { type, quality: 'strong', source: 'Records, Jan–Mar', note: 'Declared source only' } });
  const self = profileWith(undefined, { evidence: evidence('self-report') });
  const actual = profileWith(undefined, { evidence: evidence('organizational') });
  const external = profileWith(undefined, { evidence: evidence('external') });
  assert.equal(self.dimensions[0].confidence, 40);
  assert.equal(actual.dimensions[0].confidence, 80);
  assert.equal(external.dimensions[0].confidence, 75);
  assert.equal(self.overallRaw, actual.overallRaw);
  assert.equal(actual.dimensions[0].evidence.verified, false);
  assert.match(actual.dimensions[0].evidence.label, /user-declared/);
  const contradictionEvidence = evidence('self-report'); contradictionEvidence['dimension-1'].contradiction = true;
  const contradicted = profileWith(undefined, { evidence: contradictionEvidence });
  assert.equal(contradicted.dimensions[0].confidence, 20);
  const partial = responseWith(undefined, { evidence: evidence('organizational') });
  delete partial.answers.q4; delete partial.answers.q5;
  assert.equal(buildMarketingProfile(definition, partial).dimensions[0].confidence, 48);
  assert.equal(profileWith().dimensions[0].confidence, 0);
});

test('orientation distinguishes responding from shaping without treating either as superior', () => {
  const driven = profileWith([[4, 4, 4, 1, 4], 4, 4, 4, 4, 4, 4, 4]);
  const driving = profileWith(Array(8).fill(4));
  assert.equal(driven.orientation.label, 'Primarily market-driven');
  assert.equal(driving.orientation.label, 'Market-driving with market awareness');
  assert.match(driven.orientation.finding, /Neither orientation is universally superior/);
  assert.match(driven.dimensions[0].gap, /not automatically a problem/);
  assert.match(driven.dimensions[0].action, /only if that direction is useful/);
  assert.equal(driving.orientation.evidence.type, 'inferred');
});

test('external indicators describe scanning only and prompt contextual opportunity/threat investigation', () => {
  const profile = profileWith([3, 3, [1, 2, 3, 4, 5], 3, 3, 3, 3, 3]);
  assert.deepEqual(profile.externalIndicators.map(entry => entry.label), ['Competitive', 'Economic', 'Sociocultural', 'Technological', 'Political/legal']);
  assert.deepEqual(profile.externalIndicators.map(entry => entry.score), [1, 2, 3, 4, 5]);
  for (const indicator of profile.externalIndicators) {
    assert.equal(indicator.classification, 'Context required');
    assert.match(indicator.observation, /not an observed external change/);
    assert.match(indicator.opportunity, /^Investigate whether/);
    assert.match(indicator.threat, /^Investigate whether/);
    assert.match(indicator.action, /SWOT before classifying/);
  }
});

test('CRM recommendations prioritize retention, service and relationship value before acquisition', () => {
  const weak = profileWith([3, 3, 3, 3, 3, 1, 3, 3]);
  assert.deepEqual(weak.relationships.findings.map(finding => finding.id), ['retention-before-acquisition', 'relationship-profitability', 'customer-service']);
  assert.match(weak.relationships.findings[0].finding, /replace avoidable losses/);
  const strong = profileWith([3, 3, 3, 3, 3, 5, 3, 3]);
  assert.equal(strong.relationships.findings[0].id, 'acquisition-balance');
  assert.match(strong.relationships.findings[0].action, /service capacity/);
});

test('ROMI flag responds to imbalance and long-term metrics remain visible in every profile', () => {
  const shortTerm = profileWith([3, 3, 3, 3, 3, 3, 3, [4, 4, 4, 5, 1]]);
  const balanced = profileWith(Array(8).fill(4));
  assert.ok(shortTerm.performance.findings.some(finding => finding.id === 'short-term-romi'));
  assert.ok(!balanced.performance.findings.some(finding => finding.id === 'short-term-romi'));
  assert.match(shortTerm.performance.longTerm.join(' '), /loyalty.*retention.*equity.*lifetime value/);
  assert.match(shortTerm.performance.summary, /No financial return or brand valuation is calculated/);
});

test('4Ps diagnostics reuse relevant responses and do not introduce additional scored questions', () => {
  const profile = profileWith();
  assert.deepEqual(profile.marketingMix.map(entry => entry.label), ['Product', 'Price', 'Place / distribution', 'Promotion']);
  assert.deepEqual(profile.marketingMix[0].questionNumbers, [17, 29]);
  assert.equal(profile.dimensions.flatMap(d => d.items).length, 40);
  for (const mix of profile.marketingMix) assert.equal(mix.score, 3);
});

test('all-low and all-high profiles do not invent strengths or require equal maxima', () => {
  const low = profileWith(Array(8).fill(1));
  const high = profileWith(Array(8).fill(5));
  assert.ok(low.strengths.every(dimension => /not a demonstrated strength/.test(dimension.strength)));
  assert.ok(high.gaps.every(dimension => /No specific weakness is reported/.test(dimension.gap)));
  assert.deepEqual(high.largestGaps, []);
  assert.match(high.rankingNote, /no requirement to score equally high/);
  assert.ok(!high.priorities[0].action.startsWith(low.priorities[0].action));
});

test('results serialize without DOM or mutation and persist using existing result storage', () => {
  const response = responseWith([4, 3, 2, 5, 1, 3, 2, 4]);
  const original = JSON.stringify(response);
  const result = scoreAssessment(definition, response);
  result.marketingProfile = buildMarketingProfile(definition, response, result);
  assert.equal(JSON.stringify(response), original);
  assert.deepEqual(JSON.parse(JSON.stringify(result.marketingProfile)), result.marketingProfile);
  const memory = new Map();
  const storage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value), removeItem: key => memory.delete(key) };
  const saved = saveResult(definition, response, result, storage);
  assert.equal(saved.ok, true);
  const history = getHistory(definition, response, storage);
  assert.equal(history.ok, true);
  assert.equal(history.history[0].result.marketingProfile.overall, result.marketingProfile.overall);
  assert.deepEqual(history.history[0].result.marketingProfile.patterns, result.marketingProfile.patterns);
});

test('scope validation prevents misapplying marketing rules to other assessments', () => {
  assert.throws(() => buildMarketingProfile({ dimensions: [] }), /eight dimensions/);
  assert.throws(() => buildMarketingProfile({ dimensions: definition.dimensions.map(d => ({ ...d, questions: [] })) }), /five questions/);
});
