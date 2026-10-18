import test from 'node:test';
import assert from 'node:assert/strict';
import { descriptiveStats, percentile, confidenceInterval, correlation, regression, oneSampleT, twoSampleT, pairedT, forecast } from '../js/analytics/statistics.mjs';
import { samples } from '../js/analytics/samples.mjs';
import { parseNumber } from '../js/analytics/data-quality.mjs';
import { teachingHTML } from '../js/analytics/interpretations.mjs';

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `Expected ${actual} to be close to ${expected}`);
const variabilityKeys = ['sampleVariance', 'populationVariance', 'variance', 'sampleStdDev', 'populationStdDev', 'sampleStandardDeviation', 'populationStandardDeviation'];

test('zero observations cannot produce descriptive summaries, percentiles, or inference', () => {
  for (const calculate of [descriptiveStats, values => percentile(values, .5), confidenceInterval, values => oneSampleT(values, 0), forecast]) {
    assert.throws(() => calculate([]), /at least \d numeric observation/);
  }
  for (const calculate of [correlation, regression, twoSampleT, pairedT]) {
    assert.throws(() => calculate([], []), /at least \d numeric observation/);
  }
});

test('one observation preserves its values while every variance and standard deviation output is insufficient', () => {
  const result = descriptiveStats([9]);
  assert.equal(result.count, 1);
  for (const key of ['sum', 'mean', 'median', 'min', 'max', 'q1', 'q3']) assert.equal(result[key], 9, key);
  assert.equal(percentile([9], .95), 9);
  for (const key of variabilityKeys) assert.equal(result[key], null, key);
  const variabilityDetails = result.details.filter(row => /variance|standard deviation/i.test(row.label));
  assert.equal(variabilityDetails.length, 4);
  for (const row of variabilityDetails) assert.match(row.value, /Insufficient evidence: needs at least 2 observations/);
  assert.match(result.interpretation, /cannot establish an absence of variation/);
  assert.match(result.interpretation, /one-member population has mathematical variance zero/);
  const rendered = teachingHTML(result);
  assert.equal((rendered.match(/Insufficient evidence: needs at least 2 observations/g) || []).length, 4);
});

test('two observations retain distinct sample and population denominators with valid minimum-size safeguards', () => {
  const result = descriptiveStats([2, 4]);
  assert.equal(result.count, 2);
  assert.equal(result.mean, 3);
  assert.equal(result.sampleVariance, 2);
  assert.equal(result.populationVariance, 1);
  near(result.sampleStdDev, Math.sqrt(2));
  assert.equal(result.populationStdDev, 1);
  assert.equal(result.q1, 2.5);
  assert.equal(result.q3, 3.5);
  const interval = confidenceInterval([2, 4]);
  assert.equal(interval.df, 1);
  assert.equal(interval.standardError, 1);
  assert.ok(interval.lower < 2 && interval.upper > 4);
  const paired = correlation([2, 4], [3, 7]);
  near(paired.r, 1);
  assert.equal(paired.pValue, null);
  assert.throws(() => regression([2, 4], [3, 7]), /at least 3/);
});

test('larger valid datasets preserve known population and sample variation without changing the inputs', () => {
  const observations = [9, 4, 2, 7, 5, 4, 5, 4];
  const original = [...observations];
  const result = descriptiveStats(observations);
  assert.equal(result.count, 8);
  assert.equal(result.mean, 5);
  assert.equal(result.populationVariance, 4);
  assert.equal(result.populationStdDev, 2);
  near(result.sampleVariance, 32 / 7);
  near(result.sampleStdDev, Math.sqrt(32 / 7));
  assert.deepEqual(result.mode, [4]);
  assert.deepEqual(observations, original);
});

test('repeated equal observations retain zero observed variation and the uncertainty caveat', () => {
  for (const values of [[4, 4], [4, 4, 4, 4]]) {
    const result = descriptiveStats(values);
    for (const key of variabilityKeys) assert.equal(result[key], 0, key);
    assert.match(confidenceInterval(values).interpretation, /zero width.*should not be taken as certainty/);
    assert.throws(() => oneSampleT(values, 4), /positive estimated sampling variation/);
  }
});

test('missing and invalid values are rejected consistently by pure statistics instead of becoming zero', () => {
  for (const bad of [null, undefined, '', '3', true, NaN, Infinity, -Infinity]) {
    const values = [1, bad, 3];
    for (const calculate of [descriptiveStats, input => percentile(input, .5), confidenceInterval, input => oneSampleT(input, 0), forecast]) {
      assert.throws(() => calculate(values), /finite number/);
    }
    for (const calculate of [correlation, regression, twoSampleT, pairedT]) {
      assert.throws(() => calculate([1, 2, 3], values), /finite number/);
    }
  }
  for (const calculate of [confidenceInterval, values => oneSampleT(values, 0), forecast]) assert.throws(() => calculate([9]), /at least 2/);
});

test('market and quarterly demonstration datasets keep their intended descriptive meaning', () => {
  assert.equal(samples.market.rows.length, 1);
  assert.equal(Object.keys(samples.market.rows[0]).length, 3);
  for (const value of Object.values(samples.market.rows[0])) {
    const result = descriptiveStats([parseNumber(value)]);
    for (const key of variabilityKeys) assert.equal(result[key], null, key);
  }
  const revenue = samples.quarters.rows.map(row => row.Revenue);
  const result = descriptiveStats(revenue);
  assert.equal(result.count, 6);
  assert.equal(result.sum, 231000);
  assert.equal(result.mean, 38500);
  assert.equal(result.sampleVariance, 36700000);
  assert.ok(result.populationVariance > 0);
});

test('forecast scenario bounds remain assumptions and are never represented as predictive percentiles', () => {
  for (const method of ['average', 'moving_average', 'growth', 'trend']) {
    const result = forecast([100, 110, 105, 125, 120, 130], { method, growthRate: .05, scenarioRate: .1 });
    assert.match(result.interpretation, /not a statistical uncertainty estimate/);
    assert.match(result.interpretation, /base estimate is not a modeled median \(50th percentile\)/);
    assert.match(result.interpretation, /bounds are not 5th\/95th percentiles/);
    assert.match(result.interpretation, /probability model and validation of forecast errors/);
    for (const row of result.forecasts) {
      near(row.conservative, row.base - Math.abs(row.base) * .1);
      near(row.optimistic, row.base + Math.abs(row.base) * .1);
      assert.equal(row.p05, undefined);
      assert.equal(row.p50, undefined);
      assert.equal(row.p95, undefined);
    }
  }
});
