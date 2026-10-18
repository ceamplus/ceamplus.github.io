/** Deterministic illustration only; no storage, scoring, fitting, or uncertainty estimation. */
export function finiteInput(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function exploreScenario({ revenue, cost, growth, costGrowth, investment } = {}) {
  const values = [revenue, cost, growth, costGrowth, investment].map(finiteInput);
  if (values.some(value => value === null)) return { ok: false, message: 'Additional evidence needed: enter both baseline amounts and all three assumptions. Missing information is not zero.' };
  const [r, c, g, cg, i] = values;
  if ([r, c, i].some(value => value < 0 || value > 1e12) || [g, cg].some(value => value < -100 || value > 100)) return { ok: false, message: 'Use amounts from 0 to 1 trillion and quarterly growth from −100% to 100%. These are calculator limits, not validated thresholds.' };
  const rows = Array.from({ length: 4 }, (_, index) => {
    const quarter = index + 1;
    const scenarioRevenue = r * (1 + g / 100) ** quarter;
    const scenarioCost = c * (1 + cg / 100) ** quarter;
    const spend = index === 0 ? i : 0;
    return { quarter, baseline: r - c, revenue: scenarioRevenue, cost: scenarioCost, investment: spend, remainder: scenarioRevenue - scenarioCost - spend };
  });
  const baselineTotal = (r - c) * 4;
  const total = rows.reduce((sum, row) => sum + row.remainder, 0);
  return { ok: true, rows, baselineTotal, total, difference: total - baselineTotal };
}
