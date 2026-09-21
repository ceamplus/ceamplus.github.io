import test from "node:test";
import assert from "node:assert/strict";
import { metricDefinitions, calculateMetric } from "../js/analytics/metrics.mjs";
import { descriptiveStats, percentile, confidenceInterval, correlation, regression, oneSampleT, twoSampleT, pairedT, forecast, studentTCdf, studentTQuantile } from "../js/analytics/statistics.mjs";

const near = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `Expected ${actual} ≈ ${expected}`);
const fixtures = {
  growth: [{ market: 5000, growthRate: .07 }, 350],
  purchasers: [{ market: 5000, purchaseRate: .11 }, 550],
  growth_rate: [{ previous: 200, current: 250 }, 25],
  penetration: [{ purchasers: 550, market: 5000 }, 11],
  unit_share: [{ companyUnits: 200, marketUnits: 1000 }, 20],
  revenue_share: [{ companyRevenue: 300, marketRevenue: 2000 }, 15],
  conversion: [{ conversions: 50, opportunities: 200 }, 25],
  churn: [{ lost: 15, beginning: 100 }, 15],
  ctr: [{ clicks: 200, impressions: 10000 }, 2],
  retention: [{ ending: 120, newCustomers: 30, beginning: 100 }, 90],
  avg_purchase: [{ revenue: 1200, purchases: 30 }, 40],
  cac: [{ acquisitionCost: 1800, newCustomers: 60 }, 30],
  cpc: [{ spend: 1000, clicks: 400 }, 2.5],
  cpl: [{ spend: 1000, leads: 100 }, 10],
  clv: [{ averagePurchase: 50, frequency: 4, lifespan: 3 }, 600],
  clv_margin: [{ periodRevenue: 200, marginRate: .4, lifespan: 3 }, 240],
  clv_cac: [{ clv: 240, cac: 30 }, 8],
  cac_payback: [{ cac: 120, monthlyContribution: 30 }, 4],
  romi_revenue: [{ incrementalRevenue: 5000, marketingCost: 1000 }, 400],
  romi_contribution: [{ incrementalContribution: 1800, marketingCost: 1000 }, 80],
  roi: [{ totalReturn: 1200, investment: 1000 }, 20],
  roas: [{ attributedRevenue: 5000, adSpend: 1000 }, 5],
  gross_profit: [{ revenue: 1000, cogs: 600 }, 400],
  gross_margin: [{ revenue: 1000, cogs: 600 }, 40],
  contribution: [{ revenue: 1000, variableCosts: 400 }, 600],
  contribution_margin: [{ revenue: 1000, variableCosts: 400 }, 60],
  operating_profit: [{ revenue: 1000, variableCosts: 400, fixedCosts: 300 }, 300],
  operating_margin: [{ revenue: 1000, variableCosts: 400, fixedCosts: 300 }, 30],
  margin: [{ price: 100, unitCost: 29 }, 71],
  markup: [{ price: 150, unitCost: 100 }, 50],
  breakeven: [{ fixedCosts: 1000, price: 30, unitCost: 10 }, 50],
  price_scenario: [{ currentPrice: 100, proposedPrice: 110, unitCost: 29, volume: 100, volumeChange: -.1, fixedCosts: 1000 }, 190],
  elasticity: [{ oldPrice: 100, newPrice: 120, oldQuantity: 100, newQuantity: 80 }, -11 / 9],
  budget_variance: [{ budget: 1000, actual: 1100 }, 100],
  payback: [{ investment: 1000, periodBenefit: 250 }, 4],
  npv: [{ investment: 1000, discountRate: .1, cashFlow1: 500, cashFlow2: 500, cashFlow3: 500 }, 243.4259954921108],
  operating_leverage: [{ revenue: 1000, variableCosts: 400, fixedCosts: 300 }, 2],
  nps: [{ promoters: .6, detractors: .2 }, 40],
};

test("required classroom example distinguishes growth amount, projected market and purchasers", () => {
  const growth = calculateMetric("growth", { market: 5000, growthRate: .07 });
  near(growth.result, 350);
  near(growth.details.find((row) => row.label === "Projected market size").value, 5350);
  near(calculateMetric("purchasers", { market: 5000, purchaseRate: .11 }).result, 550);
  assert.match(growth.calculation, /5,000 × 0\.07 = 350/);
  assert.match(calculateMetric("purchasers", fixtures.purchasers[0]).assumptions, /unique purchasers/);
});

test("every published calculator has a known-answer fixture and a complete teaching contract", () => {
  assert.equal(new Set(metricDefinitions.map((d) => d.id)).size, metricDefinitions.length);
  assert.equal(metricDefinitions.length, Object.keys(fixtures).length);
  for (const definition of metricDefinitions) {
    const fixture = fixtures[definition.id]; assert.ok(fixture, `Missing fixture: ${definition.id}`);
    const value = calculateMetric(definition.id, fixture[0]); near(value.result, fixture[1]);
    for (const field of ["id", "label", "question", "why", "formula", "calculation", "interpretation", "managerial", "assumptions", "limitations", "excel", "commonMistake"]) {
      assert.ok(typeof value[field] === "string" && value[field].length, `${definition.id}: missing ${field}`);
    }
    assert.ok(value.questions.length >= 2);
  }
});

test("required inputs do not silently become zero and numeric parsing stays outside calculators", () => {
  for (const definition of metricDefinitions) {
    for (const field of definition.fields) {
      const input = { ...fixtures[definition.id][0] }; delete input[field.key];
      assert.throws(() => calculateMetric(definition.id, input), /required/);
    }
  }
  for (const bad of [null, "", "5000", NaN, Infinity, -Infinity, true]) {
    assert.throws(() => calculateMetric("growth", { market: bad, growthRate: .07 }));
  }
  assert.throws(() => calculateMetric("not_a_metric", {}), /Unknown metric/);
  assert.throws(() => calculateMetric("growth", null), /required input/);
});

test("zero denominators, impossible cohort totals and unnormalized bounded percentages are rejected", () => {
  for (const [id, input] of Object.entries(fixtures)) {
    const definition = metricDefinitions.find((d) => d.id === id);
    for (const field of definition.fields.filter((f) => f.exclusiveMin === 0)) {
      assert.throws(() => calculateMetric(id, { ...input[0], [field.key]: 0 }), /greater than/);
    }
  }
  assert.throws(() => calculateMetric("purchasers", { market: 5000, purchaseRate: 11 }), /100%/);
  assert.throws(() => calculateMetric("retention", { ending: 20, newCustomers: 30, beginning: 100 }), /New customers cannot exceed/);
  assert.throws(() => calculateMetric("retention", { ending: 150, newCustomers: 20, beginning: 100 }), /cannot exceed/);
  assert.throws(() => calculateMetric("penetration", { purchasers: 110, market: 100 }), /cannot exceed/);
  assert.throws(() => calculateMetric("conversion", { conversions: 11, opportunities: 10 }), /cannot exceed/);
  assert.throws(() => calculateMetric("nps", { promoters: .8, detractors: .4 }), /cannot together exceed/);
  assert.throws(() => calculateMetric("growth", { market: -5, growthRate: .1 }), /at least 0/);
  assert.throws(() => calculateMetric("growth", { market: 5000, growthRate: -1.1 }), /at least -100%/);
});

test("valid declines, losses and zero numerators remain meaningful", () => {
  near(calculateMetric("growth", { market: 5000, growthRate: -.1 }).result, -500);
  near(calculateMetric("growth", { market: 0, growthRate: .07 }).result, 0);
  near(calculateMetric("gross_margin", { revenue: 100, cogs: 150 }).result, -50);
  near(calculateMetric("romi_contribution", { incrementalContribution: -500, marketingCost: 1000 }).result, -150);
  near(calculateMetric("clv_margin", { periodRevenue: 100, marginRate: -.5, lifespan: 2 }).result, -100);
  near(calculateMetric("conversion", { conversions: 0, opportunities: 10 }).result, 0);
  near(calculateMetric("clv_cac", { clv: -100, cac: 20 }).result, -5);
});

test("revenue, contribution, markup, margin and ROAS conventions remain distinct", () => {
  near(calculateMetric("margin", { price: 150, unitCost: 100 }).result, 100 / 3);
  near(calculateMetric("markup", { price: 150, unitCost: 100 }).result, 50);
  near(calculateMetric("roas", fixtures.roas[0]).result, 5);
  near(calculateMetric("romi_revenue", fixtures.romi_revenue[0]).result, 400);
  assert.match(calculateMetric("romi_contribution", fixtures.romi_contribution[0]).assumptions, /does not subtract this marketing cost/);
  assert.match(calculateMetric("clv", fixtures.clv[0]).limitations, /Revenue CLV excludes/);
});

test("break-even rejects nonpositive unit contribution and rounds whole units upward", () => {
  for (const unitCost of [30, 40]) assert.throws(() => calculateMetric("breakeven", { fixedCosts: 1000, price: 30, unitCost }), /greater than variable cost/);
  const value = calculateMetric("breakeven", { fixedCosts: 1001, price: 30, unitCost: 10 });
  near(value.result, 50.05); near(value.details.find((x) => x.label === "Whole units required").value, 51);
  assert.throws(() => calculateMetric("operating_leverage", { revenue: 100, variableCosts: 50, fixedCosts: 50 }), /positive operating profit/);
});

test("price scenario covers revenue, contribution, profit; elasticity uses symmetric midpoint bases", () => {
  const scenario = calculateMetric("price_scenario", fixtures.price_scenario[0]);
  near(scenario.details.find((x) => x.label === "Proposed revenue").value, 9900);
  near(scenario.details.find((x) => x.label === "Proposed operating profit").value, 6290);
  const reversed = { oldPrice: 120, newPrice: 100, oldQuantity: 80, newQuantity: 100 };
  near(calculateMetric("elasticity", reversed).result, fixtures.elasticity[1]);
  assert.throws(() => calculateMetric("elasticity", { ...reversed, oldPrice: 100 }), /prices must differ/);
  assert.throws(() => calculateMetric("elasticity", { ...reversed, oldQuantity: 0, newQuantity: 0 }), /quantity must be positive/);
});

test("NPV respects time zero and signed cash flows; numeric overflow fails visibly", () => {
  near(calculateMetric("npv", { investment: 100, discountRate: 0, cashFlow1: 50, cashFlow2: -20, cashFlow3: 80 }).result, 10);
  assert.throws(() => calculateMetric("npv", { ...fixtures.npv[0], discountRate: -1 }), /greater than -1/);
  assert.throws(() => calculateMetric("growth", { market: Number.MAX_VALUE, growthRate: 2 }), /numeric range/);
});

test("descriptive statistics distinguish sample and population variation and inclusive percentiles", () => {
  const s = descriptiveStats([1, 2, 2, 3, 7]);
  assert.equal(s.count, 5); near(s.sum, 15); near(s.mean, 3); near(s.median, 2);
  assert.deepEqual(s.mode, [2]); near(s.sampleVariance, 5.5); near(s.populationVariance, 4.4);
  near(s.sampleStdDev, Math.sqrt(5.5)); near(s.populationStdDev, Math.sqrt(4.4));
  near(s.q1, 2); near(s.q3, 3); near(s.range, 6); near(percentile([0, 10, 20, 30], .25), 7.5);
  assert.deepEqual(descriptiveStats([1, 2, 3]).mode, []);
  assert.deepEqual(descriptiveStats([1, 1, 2, 2]).mode, [1, 2]);
  const singleton = descriptiveStats([9]); assert.equal(singleton.sampleVariance, null); near(singleton.populationVariance, 0);
  assert.throws(() => percentile([1, 2], 1.1), /between 0 and 1/);
});

test("t probability matches exact Cauchy and df=2 identities plus tabulated critical values", () => {
  for (const t of [-10, -1, 0, .5, 1, 4]) near(studentTCdf(t, 1), .5 + Math.atan(t) / Math.PI, 1e-11);
  near(studentTCdf(1, 2), .5 + 1 / (2 * Math.sqrt(3)), 1e-11);
  near(studentTQuantile(.975, 1), 12.706204736432095, 1e-9);
  near(studentTQuantile(.975, 4), 2.7764451051977987, 1e-9);
  near(studentTQuantile(.975, 10), 2.2281388519649385, 1e-9);
  near(studentTQuantile(.975, 30), 2.0422724563012373, 1e-9);
  near(studentTQuantile(.025, 10), -2.2281388519649385, 1e-9);
  assert.throws(() => studentTQuantile(1, 10), /excluding/);
  assert.throws(() => studentTCdf(1, 0), /positive/);
});

test("Student t interval uses sample variation and preserves frequentist interpretation", () => {
  const c = confidenceInterval([1, 2, 3, 4, 5]);
  near(c.mean, 3); near(c.standardError, Math.sqrt(.5)); near(c.lower, 1.036756838522439); near(c.upper, 4.963243161477561);
  assert.match(c.interpretation, /Across repeated comparable samples/);
  assert.ok(confidenceInterval([1, 2, 3, 4, 5], .99).margin > c.margin);
  const constant = confidenceInterval([4, 4, 4]); near(constant.lower, 4); near(constant.upper, 4); assert.match(constant.interpretation, /not be taken as certainty/);
  assert.throws(() => confidenceInterval([1]), /at least 2/);
});

test("correlation and regression match independently worked least-squares example", () => {
  const x = [1, 2, 3, 4, 5], y = [2, 4, 5, 4, 5];
  // x̄=3, ȳ=4, Sxx=10, Syy=6, Sxy=6 → slope=.6, intercept=2.2, R²=.6.
  near(correlation(x, y).r, 6 / Math.sqrt(60));
  const r = regression(x, y); near(r.slope, .6); near(r.intercept, 2.2); near(r.rSquared, .6); near(r.sse, 2.4); near(r.residualStdError, Math.sqrt(.8));
  near(r.residuals.reduce((a, b) => a + b, 0), 0);
  near(correlation(x, y).r, correlation(y, x).r);
  assert.match(r.interpretation, /does not establish causation/);
  assert.equal(regression([1, 2, 3], [5, 5, 5]).rSquared, null);
  assert.throws(() => correlation([1, 1, 1], [2, 3, 4]), /variation in both/);
  assert.throws(() => regression([1, 1, 1], [2, 3, 4]), /variation in the predictor/);
  assert.throws(() => correlation([1, 2], [1, 2, 3]), /same number/);
});

test("one-sample test matches exact df=4 tail and distinguishes non-rejection from equality", () => {
  const t = oneSampleT([1, 2, 3, 4, 5], 0);
  near(t.tStatistic, 3 * Math.sqrt(2)); near(t.df, 4);
  const u = 3 / Math.sqrt(11); // Exact two-sided Student t tail at df=4.
  near(t.pValue, 1 - 1.5 * u + .5 * u ** 3, 1e-11);
  assert.equal(t.rejectNull, true);
  const centered = oneSampleT([1, 2, 3, 4, 5], 3); near(centered.pValue, 1);
  assert.match(centered.interpretation, /do not provide sufficient evidence/);
  assert.throws(() => oneSampleT([1, 1, 1], 0), /positive estimated sampling variation/);
});

test("Welch handles unequal groups and fractional degrees of freedom; reversing groups preserves p", () => {
  const a = [1, 2, 3, 4, 5], b = [2, 4, 6, 8];
  const t = twoSampleT(a, b), reverse = twoSampleT(b, a);
  near(t.difference, -2); near(t.standardError, Math.sqrt(13 / 6)); near(t.tStatistic, -2 / Math.sqrt(13 / 6)); near(t.df, 2028 / 427);
  near(t.pValue, reverse.pValue); near(t.tStatistic, -reverse.tStatistic); near(t.lower, -reverse.upper);
  assert.equal(t.nA, 5); assert.equal(t.nB, 4); assert.ok(t.pValue > .2 && t.pValue < .3);
  assert.ok(Number.isFinite(twoSampleT([1, 1, 1], [1, 2, 3, 4]).pValue));
  assert.throws(() => twoSampleT([1, 1], [2, 2]), /positive sampling variation/);
});

test("paired test keeps rows aligned and defines change as after minus before", () => {
  const before = [10, 12, 13, 15, 16], after = [11, 14, 14, 18, 18];
  const t = pairedT(before, after);
  assert.deepEqual(t.differences, [1, 2, 1, 3, 2]); near(t.meanDifference, 1.8); near(t.tStatistic, 1.8 / Math.sqrt(.14)); near(t.df, 4);
  near(pairedT(after, before).tStatistic, -t.tStatistic);
  assert.throws(() => pairedT([1, 2], [2]), /at least 2/);
  assert.throws(() => pairedT([1, 2, 3], [2, 3, 4]), /positive estimated sampling variation/);
});

test("statistical calculations reject missing values rather than breaking pairing or treating blanks as zero", () => {
  for (const bad of [null, "", NaN, Infinity, "3"]) {
    assert.throws(() => descriptiveStats([1, bad, 3]), /finite number/);
    assert.throws(() => correlation([1, 2, 3], [1, bad, 3]), /finite number/);
  }
  assert.throws(() => descriptiveStats([]), /at least 1/);
  assert.throws(() => descriptiveStats([1e200, -1e200]), /numeric range/);
  assert.throws(() => oneSampleT([1, 2, 3], 0, 0), /excluding/);
});

test("forecasts expose assumptions and use genuine historical, moving, growth and trend calculations", () => {
  const values = [100, 110, 120, 130];
  assert.deepEqual(forecast(values, { method: "average", periods: 2 }).values, [115, 115]);
  assert.deepEqual(forecast(values, { method: "moving_average", window: 2, periods: 2 }).values, [125, 125]);
  assert.deepEqual(forecast(values, { method: "trend", periods: 2 }).values, [140, 150]);
  const g = forecast(values, { method: "growth", growthRate: .1, periods: 2, scenarioRate: .2 });
  near(g.values[0], 143); near(g.values[1], 157.3); near(g.forecasts[0].conservative, 114.4); near(g.forecasts[0].optimistic, 171.6);
  assert.match(g.interpretation, /not a statistical uncertainty estimate/);
  assert.throws(() => forecast(values, { method: "growth" }), /Assumed growth rate/);
  assert.throws(() => forecast(values, { method: "moving_average", window: 5 }), /window/);
  assert.throws(() => forecast(values, { periods: 10000 }), /1–60/);
  assert.throws(() => forecast(values, { method: "unknown" }), /Choose/);
});
