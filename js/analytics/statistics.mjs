/**
 * Dependency-free educational statistics. Pure functions: no network, storage or
 * DOM. Caller must select numeric data, preserve row pairing, and assess design
 * assumptions; invalid/missing values are rejected, never silently discarded.
 * Percentiles use linear interpolation at (n−1)p (Excel PERCENTILE.INC / type 7).
 * Student t probabilities use a regularized incomplete beta continued fraction;
 * inverse probabilities use a bounded monotonic bisection, not a normal shortcut.
 * Method references:
 * https://www.itl.nist.gov/div898/handbook/eda/section3/eda352.htm
 * https://www.itl.nist.gov/div898/handbook/eda/section3/eda353.htm
 */

const fmt = (n) => new Intl.NumberFormat("en", { maximumFractionDigits: 6 }).format(n);
const detail = (label, value, unit = "") => ({ label, value, unit });
function ensure(condition, message) { if (!condition) throw new Error(message); }
function finite(value, label) { ensure(typeof value === "number" && Number.isFinite(value), `${label} must be a finite number.`); return value; }
function series(values, min = 1, label = "Sample") {
  ensure(Array.isArray(values), `${label} must be an array of numeric observations.`);
  ensure(values.length >= min, `${label} requires at least ${min} numeric observation${min === 1 ? "" : "s"}.`);
  ensure(values.length <= 100000, `${label} exceeds the 100,000-observation calculation limit.`);
  values.forEach((value, i) => finite(value, `${label} observation ${i + 1}`));
  return values;
}
function paired(x, y, min = 2) {
  series(x, min, "First series"); series(y, min, "Second series");
  ensure(x.length === y.length, "Paired series must have the same number of observations. Match rows before calculating.");
}
function probability(p, label = "Probability") {
  finite(p, label); ensure(p > 0 && p < 1, `${label} must be between 0 and 1, excluding the endpoints.`); return p;
}
function safe(value) { ensure(Number.isFinite(value), "The calculation exceeded the numeric range. Rescale very large values before analysis."); return value; }
function sum(values) {
  let total = 0, correction = 0;
  for (const value of values) { const adjusted = value - correction, next = total + adjusted; correction = (next - total) - adjusted; total = next; }
  return safe(total);
}
function summarize(values) {
  const count = values.length, total = sum(values), mean = total / count;
  const ss = sum(values.map((value) => (value - mean) ** 2));
  return { count, sum: total, mean, ss, populationVariance: ss / count, sampleVariance: count > 1 ? ss / (count - 1) : null };
}
function teaching(definition, data) {
  return {
    assumptions: "Sampling and variable definitions must fit the method. Review missing data and the study design before interpreting results.",
    limitations: "Statistical association or significance does not establish causation, representativeness or practical importance.",
    managerial: "Compare the effect size with a meaningful business threshold and investigate alternative explanations.",
    commonMistake: "Treating a numerical result as a causal or automatic management recommendation.",
    questions: ["Do the sampling and independence assumptions fit?", "Is the effect large enough to matter in practice?", "Could bias or another explanation account for the pattern?"],
    unit: "", details: [], ...definition, ...data,
  };
}

/** Percentile for finite observations; p is a ratio from 0 through 1. */
export function percentile(values, p) {
  series(values); finite(p, "Percentile"); ensure(p >= 0 && p <= 1, "Percentile must be between 0 and 1.");
  const sorted = [...values].sort((a, b) => a - b), index = (sorted.length - 1) * p, lower = Math.floor(index), weight = index - lower;
  return safe(sorted[lower] * (1 - weight) + sorted[Math.ceil(index)] * weight);
}

/** Describes values; sample variance/SD are null for a single observation. */
export function descriptiveStats(values) {
  series(values);
  const s = summarize(values), sorted = [...values].sort((a, b) => a - b);
  const at = (p) => { const k = (sorted.length - 1) * p, lo = Math.floor(k), weight = k - lo; return safe(sorted[lo] * (1 - weight) + sorted[Math.ceil(k)] * weight); };
  const counts = new Map(); for (const x of sorted) counts.set(x, (counts.get(x) || 0) + 1);
  let highest = 1; for (const n of counts.values()) highest = Math.max(highest, n);
  const mode = highest > 1 ? [...counts.entries()].filter(([, n]) => n === highest).map(([x]) => x) : [];
  const q1 = at(.25), median = at(.5), q3 = at(.75);
  const sampleStdDev = s.sampleVariance === null ? null : Math.sqrt(s.sampleVariance), populationStdDev = Math.sqrt(s.populationVariance);
  const min = sorted[0], max = sorted.at(-1), range = safe(max - min);
  const data = { ...s, n: s.count, median, mode, modes: mode, min, max, range, q1, q3, iqr: safe(q3 - q1),
    quartiles: { q1, q2: median, q3 }, percentiles: { p10: at(.1), p25: q1, p50: median, p75: q3, p90: at(.9) },
    variance: s.sampleVariance, sampleStdDev, populationStdDev, sampleStandardDeviation: sampleStdDev, populationStandardDeviation: populationStdDev };
  return teaching({ id: "descriptive", label: "Descriptive statistics", question: "What is typical and how much do observations vary?",
    why: "A numeric variable can be summarized by its center, spread and distribution without choosing an inferential test.",
    formula: "Mean = Σx/n; sample variance = Σ(x − mean)²/(n−1); population variance = Σ(x − mean)²/n",
    assumptions: "Each row is the intended observation unit. Sample variance uses n−1; population variance uses n. Percentiles use inclusive linear interpolation.",
    limitations: "Averages can conceal subgroups and outliers. These summaries alone do not justify inference to a larger population.",
    excel: "=COUNT(A2:A100); =SUM(A2:A100); =AVERAGE(A2:A100); =MEDIAN(A2:A100); =MODE.MULT(A2:A100); =VAR.S(A2:A100); =VAR.P(A2:A100); =STDEV.S(A2:A100); =STDEV.P(A2:A100); =PERCENTILE.INC(A2:A100,0.25)",
    commonMistake: "Treating missing values as zero or using population standard deviation to estimate sampling uncertainty." }, {
    ...data, result: s.mean, calculation: `${fmt(s.sum)} / ${s.count} = ${fmt(s.mean)} (mean)`,
    interpretation: `The ${s.count} observations have mean ${fmt(s.mean)}, median ${fmt(median)}, and range ${fmt(min)} to ${fmt(max)}. ${mode.length ? `Most frequent value${mode.length > 1 ? "s" : ""}: ${mode.slice(0, 8).map(fmt).join(", ")}${mode.length > 8 ? " …" : ""}.` : "No repeated mode occurs."}`,
    details: [detail("Count", s.count), detail("Sum", s.sum), detail("Median", median), detail("Minimum", min), detail("Maximum", max), detail("Range", range), detail("Sample variance", s.sampleVariance ?? "Needs at least 2 observations"), detail("Population variance", s.populationVariance), detail("Sample standard deviation", sampleStdDev ?? "Needs at least 2 observations"), detail("Population standard deviation", populationStdDev), detail("First quartile", q1), detail("Third quartile", q3), detail("10th percentile", at(.1)), detail("90th percentile", at(.9))],
  });
}

// Lanczos approximation to log Γ(z), z > 0. The beta implementation below uses
// the log scale to keep small tail probabilities from overflowing intermediate Γ.
function logGamma(z) {
  const coefficients = [676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < .5) return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
  z -= 1; let x = .99999999999980993;
  for (let i = 0; i < coefficients.length; i++) x += coefficients[i] / (z + i + 1);
  const t = z + coefficients.length - .5;
  return .5 * Math.log(2 * Math.PI) + (z + .5) * Math.log(t) - t + Math.log(x);
}
function betaFraction(a, b, x) {
  const tiny = 1e-300, eps = 3e-14;
  const floor = (v) => Math.abs(v) < tiny ? (v < 0 ? -tiny : tiny) : v;
  let c = 1, d = 1 / floor(1 - (a + b) * x / (a + 1)), h = d;
  for (let m = 1; m <= 400; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((a - 1 + m2) * (a + m2));
    d = 1 / floor(1 + aa * d); c = floor(1 + aa / c); h *= d * c;
    aa = -(a + m) * (a + b + m) * x / ((a + m2) * (a + 1 + m2));
    d = 1 / floor(1 + aa * d); c = floor(1 + aa / c); const delta = d * c; h *= delta;
    if (Math.abs(delta - 1) < eps) return h;
  }
  throw new Error("The probability calculation did not converge. Check the sample scale and test settings.");
}
function betaRegularized(x, a, b) {
  if (x <= 0) return 0; if (x >= 1) return 1;
  const front = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log1p(-x));
  const p = x < (a + 1) / (a + b + 2) ? front * betaFraction(a, b, x) / a : 1 - front * betaFraction(b, a, 1 - x) / b;
  return Math.min(1, Math.max(0, p));
}

/** Student t cumulative probability for real t and positive (possibly fractional) df. */
export function studentTCdf(t, df) {
  finite(t, "t statistic"); finite(df, "Degrees of freedom"); ensure(df > 0, "Degrees of freedom must be positive.");
  if (t === 0) return .5;
  const tail = .5 * betaRegularized(df / (df + t * t), df / 2, .5);
  return t > 0 ? 1 - tail : tail;
}
function twoSidedP(t, df) { return betaRegularized(df / (df + t * t), df / 2, .5); }

/** Student t inverse CDF; p must be strictly between 0 and 1. */
export function studentTQuantile(p, df) {
  probability(p); finite(df, "Degrees of freedom"); ensure(df > 0, "Degrees of freedom must be positive.");
  if (p === .5) return 0;
  if (p < .5) return -studentTQuantile(1 - p, df);
  const targetTail = 2 * (1 - p);
  let lo = 0, hi = 1;
  while (twoSidedP(hi, df) > targetTail && hi < 1e16) hi *= 2;
  ensure(hi < 1e16, "The requested t percentile is too extreme. Use a less extreme confidence level.");
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (twoSidedP(mid, df) > targetTail) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Two-sided Student t confidence interval for a population mean; confidence=.95. */
export function confidenceInterval(values, confidence = .95) {
  series(values, 2); probability(confidence, "Confidence level");
  const s = summarize(values), df = s.count - 1, standardError = Math.sqrt(s.sampleVariance / s.count), criticalValue = studentTQuantile((1 + confidence) / 2, df), margin = safe(criticalValue * standardError);
  const lower = safe(s.mean - margin), upper = safe(s.mean + margin);
  return teaching({ id: "confidence_interval", label: "Confidence interval for the mean", question: "How precisely does the sample estimate a population mean?",
    why: "For independent numeric observations with unknown population variability, a Student t interval reflects sampling uncertainty in the mean.",
    formula: "Sample mean ± t(1−α/2, n−1) × sample standard deviation / √n",
    assumptions: "Independent, representative observations; approximately normal data for small samples, or enough data without dominating outliers for a mean approximation.",
    limitations: "This interval does not address selection bias, dependence or data errors. It is not an interval for individual future observations.",
    excel: "=AVERAGE(A2:A100) ± CONFIDENCE.T(0.05,STDEV.S(A2:A100),COUNT(A2:A100)) for 95% confidence",
    commonMistake: "Saying there is a 95% probability that this fixed interval contains the fixed population mean." }, {
    n: s.count, mean: s.mean, confidence, df, standardError, criticalValue, margin, marginOfError: margin, lower, upper, result: s.mean,
    calculation: `${fmt(s.mean)} ± ${fmt(criticalValue)} × ${fmt(standardError)} = [${fmt(lower)}, ${fmt(upper)}]`,
    interpretation: `The ${fmt(confidence * 100)}% interval for the population mean is ${fmt(lower)} to ${fmt(upper)} under the sampling assumptions. Across repeated comparable samples, this method covers the population mean approximately ${fmt(confidence * 100)}% of the time.${standardError === 0 ? " All sample values are identical; the zero width reflects no observed variation and should not be taken as certainty." : ""}`,
    details: [detail("Lower bound", lower), detail("Upper bound", upper), detail("Margin of error", margin), detail("Standard error", standardError), detail("Degrees of freedom", df), detail("Confidence level", confidence * 100, "%")],
  });
}

function covarianceParts(x, y) {
  const sx = summarize(x), sy = summarize(y), cross = sum(x.map((v, i) => (v - sx.mean) * (y[i] - sy.mean)));
  return { sx, sy, cross };
}

/** Pearson r for row-aligned numeric pairs; constant variables are rejected. */
export function correlation(x, y) {
  paired(x, y);
  const { sx, sy, cross } = covarianceParts(x, y);
  ensure(sx.ss > 0 && sy.ss > 0, "Correlation requires variation in both variables; a constant column has undefined correlation.");
  const r = Math.max(-1, Math.min(1, cross / Math.sqrt(sx.ss) / Math.sqrt(sy.ss))), df = x.length - 2;
  const tStatistic = df > 0 && Math.abs(r) < 1 ? r * Math.sqrt(df / (1 - r * r)) : null;
  const pValue = df > 0 ? Math.abs(r) === 1 ? 0 : twoSidedP(tStatistic, df) : null;
  return teaching({ id: "correlation", label: "Pearson correlation", question: "Are two numeric variables linearly related?",
    why: "Matched numeric pairs allow a standardized measure of linear association.",
    formula: "r = Σ[(x−x̄)(y−ȳ)] / √[Σ(x−x̄)² × Σ(y−ȳ)²]",
    assumptions: "Rows are meaningfully paired. Pearson r describes linear association; its optional two-sided p-value assumes independent pairs and a suitable bivariate-normal model.",
    limitations: "Outliers, hidden groups, nonlinearity and selection can distort correlation. Two points alone always fit a line and do not support a t test.",
    excel: "=CORREL(A2:A100,B2:B100)", commonMistake: "Inferring causation from correlation or independently filtering columns and breaking row pairs." }, {
    n: x.length, r, df, tStatistic, pValue, result: r,
    calculation: `${fmt(cross)} / (√${fmt(sx.ss)} × √${fmt(sy.ss)}) = ${fmt(r)}`,
    interpretation: `Pearson r is ${fmt(r)}, indicating ${r > 0 ? "a positive" : r < 0 ? "a negative" : "no measured"} linear association. This does not establish causation.`,
    details: [detail("Paired observations", x.length), detail("Pearson r", r), detail("Two-sided p-value", pValue ?? "Requires at least 3 pairs")],
  });
}

/** OLS y = intercept + slope*x with residual diagnostics; requires at least 3 pairs. */
export function regression(x, y) {
  paired(x, y, 3);
  const { sx, sy, cross } = covarianceParts(x, y);
  ensure(sx.ss > 0, "Regression requires variation in the predictor (X) column.");
  const slope = safe(cross / sx.ss), intercept = safe(sy.mean - slope * sx.mean), fitted = x.map((value) => safe(intercept + slope * value)), residuals = y.map((value, i) => safe(value - fitted[i]));
  const sse = sum(residuals.map((value) => value * value)), df = x.length - 2, residualStdError = Math.sqrt(sse / df), slopeStdError = residualStdError / Math.sqrt(sx.ss);
  const rSquared = sy.ss > 0 ? Math.max(0, Math.min(1, 1 - sse / sy.ss)) : null;
  const r = sy.ss > 0 ? Math.max(-1, Math.min(1, cross / Math.sqrt(sx.ss) / Math.sqrt(sy.ss))) : null;
  const tStatistic = slopeStdError > 0 ? safe(slope / slopeStdError) : null;
  const pValue = tStatistic !== null ? twoSidedP(tStatistic, df) : slope !== 0 ? 0 : null;
  return teaching({ id: "regression", label: "Simple linear regression", question: "How does the average outcome vary with a numeric predictor?",
    why: "Matched numeric pairs allow an ordinary least-squares line describing a linear relationship.",
    formula: "Slope = Σ[(x−x̄)(y−ȳ)] / Σ(x−x̄)²; intercept = ȳ − slope×x̄; fitted y = intercept + slope×x",
    assumptions: "Linearity and independent observations; residual-based inference additionally assumes constant residual variance and approximately normal errors. Inspect a scatter plot and residuals.",
    limitations: "The fitted association does not establish a causal effect. Extrapolation, omitted variables, small samples and outliers can make predictions unreliable. R² is undefined for a constant outcome.",
    excel: "=SLOPE(B2:B100,A2:A100); =INTERCEPT(B2:B100,A2:A100); =RSQ(B2:B100,A2:A100)",
    commonMistake: "Interpreting the fitted slope as a causal treatment effect or treating R² as forecast accuracy." }, {
    n: x.length, slope, intercept, r, rSquared, r2: rSquared, fitted, residuals, sse, df, residualStdError, slopeStdError, tStatistic, pValue, result: slope,
    calculation: `Slope = ${fmt(cross)} / ${fmt(sx.ss)} = ${fmt(slope)}; fitted y = ${fmt(intercept)} + (${fmt(slope)} × x)`,
    interpretation: `A one-unit higher X is associated with ${fmt(slope)} units of fitted Y change. ${rSquared === null ? "The outcome is constant, so R² is undefined." : `The line accounts for ${fmt(rSquared * 100)}% of the observed outcome variation in this sample.`} The relationship does not establish causation.`,
    details: [detail("Slope", slope), detail("Intercept", intercept), detail("R²", rSquared ?? "Undefined for constant outcome"), detail("Residual standard error", residualStdError), detail("Two-sided slope p-value", pValue ?? "Undefined with zero residual variation and zero slope")],
  });
}

function tResult({ estimate, nullValue, standardError, df, alpha, ...extra }) {
  ensure(standardError > 0, "A t test requires positive estimated sampling variation. Constant samples or identical paired differences do not support this t test.");
  const tStatistic = safe((estimate - nullValue) / standardError), pValue = twoSidedP(tStatistic, df), criticalValue = studentTQuantile(1 - alpha / 2, df), margin = safe(criticalValue * standardError);
  return { ...extra, estimate, nullValue, standardError, df, alpha, tStatistic, t: tStatistic, pValue, criticalValue, lower: safe(estimate - margin), upper: safe(estimate + margin),
    rejectNull: pValue < alpha, result: tStatistic,
    calculation: `(${fmt(estimate)} − ${fmt(nullValue)}) / ${fmt(standardError)} = ${fmt(tStatistic)}; two-sided p = ${fmt(pValue)}`,
    interpretation: `The estimated value is ${fmt(estimate)}; the two-sided p-value is ${fmt(pValue)}. At α = ${fmt(alpha)}, ${pValue < alpha ? "the data provide evidence against the stated null under the test assumptions" : "the data do not provide sufficient evidence to reject the stated null"}. This does not determine whether the difference is important for management.`,
    details: [detail("Estimate", estimate), detail("t statistic", tStatistic), detail("Degrees of freedom", df), detail("Two-sided p-value", pValue), detail(`${fmt((1 - alpha) * 100)}% interval lower`, estimate - margin), detail(`${fmt((1 - alpha) * 100)}% interval upper`, estimate + margin)],
  };
}
const testCaution = "Specify the question and significance threshold before inspecting results. A p-value is not the probability the null is true. Repeated exploratory tests increase false-positive risk; lack of significance does not prove equality.";

/** Two-sided one-sample t test, H0: population mean = nullMean (default 0). */
export function oneSampleT(values, nullMean = 0, alpha = .05) {
  series(values, 2); finite(nullMean, "Null mean"); probability(alpha, "Significance level");
  const s = summarize(values);
  return teaching({ id: "one_sample_t", label: "One-sample t test", question: "Does a population mean differ from a stated benchmark?",
    why: "One numeric sample and a prespecified benchmark fit a two-sided comparison with an unknown population variance.",
    formula: "t = (sample mean − benchmark) / (sample SD / √n); df = n−1",
    assumptions: "Independent, representative observations; approximate normality for small samples or adequate sample size without dominating outliers.",
    limitations: testCaution, excel: "t =(AVERAGE(A2:A100)-D2)/(STDEV.S(A2:A100)/SQRT(COUNT(A2:A100))); p =T.DIST.2T(ABS(t),COUNT(A2:A100)-1)" },
    tResult({ estimate: s.mean, nullValue: nullMean, standardError: Math.sqrt(s.sampleVariance / s.count), df: s.count - 1, alpha, n: s.count, mean: s.mean }));
}

/** Welch two-sided independent-sample test, H0: mean(A)−mean(B)=0. Unequal sizes allowed. */
export function twoSampleT(a, b, alpha = .05) {
  series(a, 2, "Group A"); series(b, 2, "Group B"); probability(alpha, "Significance level");
  const sa = summarize(a), sb = summarize(b), va = sa.sampleVariance / sa.count, vb = sb.sampleVariance / sb.count, variance = safe(va + vb);
  ensure(variance > 0, "A Welch t test requires positive sampling variation in at least one group.");
  // Normalized weights avoid squaring large variances in Welch's df formula.
  const wa = va / variance, wb = vb / variance, df = 1 / (wa * wa / (sa.count - 1) + wb * wb / (sb.count - 1));
  return teaching({ id: "two_sample_t", label: "Welch two-sample t test", question: "Do two independent groups have different mean outcomes?",
    why: "Two independent numeric samples fit Welch's comparison, which does not require equal variances or equal sample sizes.",
    formula: "t = (mean A − mean B) / √(sA²/nA + sB²/nB); Welch–Satterthwaite degrees of freedom",
    assumptions: "Independent groups and observations; approximately normal within-group data for small samples or adequate samples without dominating outliers. Use paired testing for matched people or repeated measurements.",
    limitations: testCaution, excel: "=T.TEST(A2:A100,B2:B100,2,3) returns the two-sided Welch p-value (ranges may differ in length)." },
    tResult({ estimate: safe(sa.mean - sb.mean), nullValue: 0, standardError: Math.sqrt(variance), df, alpha, nA: sa.count, nB: sb.count, meanA: sa.mean, meanB: sb.mean, difference: sa.mean - sb.mean }));
}

/** Paired two-sided t test: differences are AFTER minus BEFORE, matched by row. */
export function pairedT(before, after, alpha = .05) {
  paired(before, after); probability(alpha, "Significance level");
  const differences = after.map((value, i) => safe(value - before[i])), s = summarize(differences);
  return teaching({ id: "paired_t", label: "Paired t test (after − before)", question: "Did the average outcome change for the same matched units?",
    why: "Matched before/after measurements isolate each unit's change before comparing the average change with zero.",
    formula: "d = after − before; t = mean(d) / (SD(d)/√n); df = n−1",
    assumptions: "Rows represent the same units in the same order. Pairs are independent; differences should be approximately normal for a small sample.",
    limitations: `${testCaution} A before/after change may reflect time trends or other influences, rather than the intervention alone.`,
    excel: "=T.TEST(A2:A100,B2:B100,2,1); use B-A for the signed change (A before, B after).",
    commonMistake: "Pairing different individuals or independently sorting/filtering before and after values." },
    tResult({ estimate: s.mean, nullValue: 0, standardError: Math.sqrt(s.sampleVariance / s.count), df: s.count - 1, alpha, n: s.count, differences, meanDifference: s.mean }));
}

/**
 * Simple equal-period forecast. options: method='average'|'moving_average'|
 * 'growth'|'trend'; periods=3 (1–60); window=3 for moving average;
 * growthRate is REQUIRED for growth and is a ratio >=−1; scenarioRate=.1 is
 * an explicitly labelled illustrative ±10% range, never a confidence interval.
 * Returns forecasts: [{period,base,conservative,optimistic}], values:[base...].
 */
export function forecast(values, options = {}) {
  series(values, 2, "Historical series");
  const { method = "average", periods = 3, window = 3, growthRate, scenarioRate = .1 } = options;
  ensure(["average", "moving_average", "growth", "trend"].includes(method), "Choose average, moving_average, growth, or trend forecasting.");
  ensure(Number.isInteger(periods) && periods >= 1 && periods <= 60, "Forecast horizon must be 1–60 whole periods.");
  finite(scenarioRate, "Scenario spread"); ensure(scenarioRate >= 0 && scenarioRate <= 1, "Scenario spread must be between 0 and 1 (0%–100%).");
  if (method === "moving_average") ensure(Number.isInteger(window) && window >= 1 && window <= values.length, "Moving-average window must be a whole number from 1 through the historical observation count.");
  if (method === "growth") { finite(growthRate, "Assumed growth rate"); ensure(growthRate >= -1, "Assumed growth rate cannot be below −100%."); }
  const selected = method === "moving_average" ? values.slice(-window) : values, average = sum(selected) / selected.length;
  const x = values.map((_, i) => i + 1);
  // A trend line is still calculable with two periods, but inference is unavailable.
  const { sx, sy, cross } = covarianceParts(x, values), slope = cross / sx.ss, intercept = sy.mean - slope * sx.mean;
  const forecasts = Array.from({ length: periods }, (_, i) => {
    const period = values.length + i + 1;
    const base = safe(method === "growth" ? values.at(-1) * (1 + growthRate) ** (i + 1) : method === "trend" ? intercept + slope * period : average);
    const delta = safe(Math.abs(base) * scenarioRate);
    return { period, base, conservative: safe(base - delta), optimistic: safe(base + delta) };
  });
  const name = { average: "Historical-average forecast", moving_average: "Trailing moving-average forecast", growth: "Growth-rate projection", trend: "Linear-trend projection" }[method];
  const formula = { average: "Each future period = mean of observed history", moving_average: "Each future period = mean of the most recent selected window", growth: "Future period h = latest observed value × (1 + assumed growth rate)^h", trend: "Future value = fitted intercept + fitted slope × period number" }[method];
  return teaching({ id: "forecast", label: name, question: "What could future sales look like under a simple stated model?",
    why: "Ordered observations at equal time intervals permit a transparent baseline projection for discussion.", formula,
    assumptions: `Observations are ordered at equally spaced periods with no missing periods. ${method === "moving_average" ? `The last ${window} observations define a fixed forecast level.` : method === "growth" ? `The user-assumed ${fmt(growthRate * 100)}% growth rate repeats each period.` : method === "trend" ? "The historical linear trend continues." : "The historical mean remains relevant."} Conservative and optimistic scenarios use a user-adjustable ±${fmt(scenarioRate * 100)}% spread around each base estimate.`,
    limitations: "These are conditional estimates, not guarantees or statistical prediction intervals. No automatic seasonality, causal mechanism or forecast accuracy has been established. Back-test before using for spending decisions.",
    excel: { average: "=AVERAGE(B2:B13)", moving_average: "=AVERAGE(B11:B13) for a trailing window of 3", growth: "=B13*(1+$D$2)^h where D2 is the assumed rate and h is the future period", trend: "=FORECAST.LINEAR(future_period,B2:B13,A2:A13)" }[method],
    commonMistake: "Calling a user-defined optimistic/conservative range a confidence interval or assuming trend extrapolation is reliable." }, {
    method, forecasts, values: forecasts.map((row) => row.base), horizon: periods, window: method === "moving_average" ? window : null,
    growthRate: method === "growth" ? growthRate : null, scenarioRate, slope: method === "trend" ? slope : null, intercept: method === "trend" ? intercept : null,
    result: forecasts[0].base, calculation: `${formula}. First future period = ${fmt(forecasts[0].base)}; scenario range = ${fmt(forecasts[0].conservative)} to ${fmt(forecasts[0].optimistic)}.`,
    interpretation: `The first future period is estimated at ${fmt(forecasts[0].base)} under the ${name.toLowerCase()} assumptions.${forecasts.some((row) => row.base < 0) ? " This model produces a negative value; assess whether that is meaningful for the variable before using it." : ""} The scenario spread is a planning assumption, not a statistical uncertainty estimate.`,
    managerial: "Compare the simple baseline with known demand drivers and back-test on held-out periods. Test capacity, cash needs and downside risk before committing.",
    details: forecasts.flatMap((row) => [detail(`Period ${row.period}: base`, row.base), detail(`Period ${row.period}: conservative`, row.conservative), detail(`Period ${row.period}: optimistic`, row.optimistic)]),
  });
}
