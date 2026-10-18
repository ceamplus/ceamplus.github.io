import test from 'node:test';
import assert from 'node:assert/strict';
import { exploreScenario, finiteInput } from '../js/analytics/scenario.mjs';
const base = { revenue: 47000, cost: 31000, growth: 0, costGrowth: 0, investment: 0 };
test('constant scenario matches the four-quarter original baseline', () => {
  const result = exploreScenario(base);
  assert.equal(result.baselineTotal, 64000); assert.equal(result.total, 64000); assert.equal(result.difference, 0);
});
test('quarterly growth compounds and investment is subtracted once', () => {
  const result = exploreScenario({ revenue: 100, cost: 40, growth: 10, costGrowth: 0, investment: 20 });
  assert(Math.abs(result.rows[0].remainder - 50) < 1e-10);
  assert(Math.abs(result.rows[3].revenue - 146.41) < 1e-10);
  assert.equal(result.rows.reduce((sum, row) => sum + row.investment, 0), 20);
  assert(Math.abs(result.total - 330.51) < 1e-10);
});
test('cost assumptions change the scenario without mutating baseline inputs', () => {
  const inputs = { ...base, costGrowth: 10 };
  const result = exploreScenario(inputs);
  assert.equal(result.baselineTotal, 64000); assert(result.difference < 0);
  assert.deepEqual(inputs, { ...base, costGrowth: 10 });
});
test('unknown, blank, nonnumeric, nonfinite, and non-scalar values are not zero', () => {
  for (const value of ['', ' ', null, undefined, NaN, Infinity, 'unknown', false, [], {}]) {
    assert.equal(finiteInput(value), null);
    for (const key of Object.keys(base)) assert.equal(exploreScenario({ ...base, [key]: value }).ok, false);
  }
});
test('explicit zero, losses, and full contraction remain valid', () => {
  assert.equal(exploreScenario({ ...base, revenue: 0 }).total, -124000);
  assert.equal(exploreScenario({ ...base, growth: -100 }).rows[3].revenue, 0);
  assert.equal(exploreScenario({ ...base, revenue: 0, cost: 0 }).total, 0);
});
test('numerical bounds reject unsupported values without clipping them', () => {
  for (const [key, value] of [['revenue', -1], ['cost', 1e13], ['investment', -20], ['growth', 101], ['costGrowth', -101]]) assert.equal(exploreScenario({ ...base, [key]: value }).ok, false);
});
test('scenario returns no statistical or predictive confidence claims', () => {
  const result = exploreScenario(base);
  assert.deepEqual(Object.keys(result).sort(), ['ok', 'rows', 'baselineTotal', 'total', 'difference'].sort());
  for (const row of result.rows) assert.deepEqual(Object.keys(row).sort(), ['quarter', 'baseline', 'revenue', 'cost', 'investment', 'remainder'].sort());
});
