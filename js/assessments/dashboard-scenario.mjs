import { exploreScenario } from '../analytics/scenario.mjs';
import { samples } from '../analytics/samples.mjs';

// This workspace intentionally has no dependency on assessment storage or scoring.
const el = id => document.getElementById(`scenario-${id}`);
const source = el('source');
const history = samples.quarters.rows;
const latest = history.at(-1);
const format = value => value.toLocaleString(undefined, { maximumFractionDigits: 2 });
const fields = ['revenue', 'cost', 'period', 'growth', 'cost-growth', 'investment'];
const names = { revenue: 'Baseline revenue', cost: 'Baseline cost', period: 'Baseline period', growth: 'Revenue growth assumption', 'cost-growth': 'Cost growth assumption', investment: 'Implementation investment assumption' };
let previous = Object.fromEntries(fields.map(id => [id, el(id).value]));
let current = null;

function chart(model, demo) {
  const svg = el('chart');
  const width = Math.max(250, svg.parentElement.clientWidth);
  const height = 280, left = 58, right = width - 18, top = 20, bottom = 235;
  const observed = demo ? history.map(row => row.Revenue - row.Cost) : [model.rows[0].baseline];
  const count = observed.length + model.rows.length;
  const values = [...observed, ...model.rows.flatMap(row => [row.baseline, row.remainder]), 0];
  let min = Math.min(...values), max = Math.max(...values);
  if (min === max) max = min + 1;
  const padding = (max - min) * 0.08;
  if (min < 0) min -= padding;
  max += padding;
  const x = index => left + index * (right - left) / (count - 1);
  const y = value => bottom - (value - min) / (max - min) * (bottom - top);
  const path = (data, start = 0) => data.map((value, index) => `${index ? 'L' : 'M'}${x(index + start)},${y(value)}`).join(' ');
  const compact = value => new Intl.NumberFormat('en', { notation: 'compact', maximumSignificantDigits: 3 }).format(value);
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('aria-label', `${demo ? 'Six fictional observed quarters, solid line' : 'User-provided current baseline, single point'}; constant baseline, dotted line; four illustrative scenario quarters, dashed line. Exact values follow.`);
  svg.replaceChildren();
  const add = (tag, attributes, text) => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    if (text !== undefined) node.textContent = text;
    svg.append(node);
    return node;
  };
  for (let tick = 0; tick <= 4; tick++) {
    const value = min + (max - min) * tick / 4;
    add('path', { d: `M${left},${y(value)}H${right}`, stroke: '#e0e5e5', fill: 'none' });
    add('text', { x: left - 8, y: y(value) + 4, 'text-anchor': 'end', 'font-size': 11 }, compact(value));
  }
  const boundary = x(observed.length - 1);
  add('path', { d: `M${boundary},${top}V${bottom}`, stroke: '#707b80', 'stroke-dasharray': '2 4' });
  add('path', { d: path(observed), stroke: '#263e48', 'stroke-width': 3, fill: 'none' });
  observed.forEach((value, index) => add('circle', { cx: x(index), cy: y(value), r: 3, fill: '#263e48' }));
  add('path', { d: path([observed.at(-1), ...model.rows.map(row => row.baseline)], observed.length - 1), stroke: '#687278', 'stroke-width': 3, 'stroke-dasharray': '2 5', fill: 'none' });
  add('path', { d: path([observed.at(-1), ...model.rows.map(row => row.remainder)], observed.length - 1), stroke: '#28685e', 'stroke-width': 3, 'stroke-dasharray': '9 5', fill: 'none' });
  const labels = width < 440 ? [[0, demo ? 'History' : 'Start'], [count - 1, '+4Q']] : [[0, demo ? '2025 Q1' : 'Start'], [observed.length - 1, demo ? '2026 Q2' : 'Baseline'], [count - 1, '+4 quarters']];
  for (const [index, label] of labels) add('text', { x: x(index), y: 260, 'text-anchor': index === count - 1 ? 'end' : 'start', 'font-size': 12 }, label);
}

function update() {
  const demo = source.value === 'demo';
  el('manual').hidden = demo;
  const period = demo ? latest.Quarter : el('period').value.trim();
  const inputs = { revenue: demo ? latest.Revenue : el('revenue').value, cost: demo ? latest.Cost : el('cost').value, growth: el('growth').value, costGrowth: el('cost-growth').value, investment: el('investment').value };
  const model = exploreScenario(inputs);
  if (!period) { model.ok = false; model.message = 'Additional evidence needed: identify the baseline period. Dates are not inferred.'; }
  current = model.ok ? { model, demo } : null;
  el('output').hidden = !model.ok;
  el('source-note').textContent = demo ? `Demonstration Data · Fictional. Six quarters, ${history[0].Quarter}–${latest.Quarter}. Starting revenue ${format(latest.Revenue)}; cost ${format(latest.Cost)}. Separate from saved results.` : `User-provided information · ${period || 'Period unknown'}. Unverified quarterly baseline; no historical trend is inferred. Separate from saved results.`;
  el('evidence').textContent = demo ? 'Source: CEAM+ bundled quarterly-sales demonstration. All six observations are fictional. They demonstrate arithmetic and provide no evidence about any organization.' : 'Source: quarterly amounts and period entered by you in this tab. CEAM+ has not verified their completeness, accuracy, comparability, or relevance to future periods.';
  const method = [
    ['Data source', demo ? 'Bundled CEAM+ quarterly-sales demo; fictional observations.' : 'User-entered quarterly baseline; unverified.'],
    ['Period covered', `${period || 'Unknown'} baseline; illustrative quarters +1 through +4. Demo history: 2025 Q1–2026 Q2. Manual mode uses only one baseline point.`],
    ['Formula / method', 'For quarter t = 1…4: revenue = starting revenue × (1 + revenue growth / 100)^t; cost = starting cost × (1 + cost growth / 100)^t; remainder = revenue − cost − investment (investment only in quarter 1). Constant baseline = starting revenue − starting cost each quarter. Difference = sum of scenario remainders − 4 × baseline remainder.'],
    ['User-supplied assumptions / editable inputs', `Starting revenue: ${inputs.revenue === '' ? 'Unknown' : inputs.revenue}; starting cost: ${inputs.cost === '' ? 'Unknown' : inputs.cost}. Revenue growth: ${inputs.growth === '' ? 'Unknown' : inputs.growth}%; cost growth: ${inputs.costGrowth === '' ? 'Unknown' : inputs.costGrowth}%; investment: ${inputs.investment === '' ? 'Unknown' : inputs.investment}. ${demo ? 'Starting amounts are system-supplied fictional data.' : 'Starting amounts are user-provided information.'}`],
    ['System-supplied assumptions', 'Four equal quarterly periods; constant reference baseline; growth compounds at each quarter end; one-time investment in quarter 1; no later investment. Editable inputs start at 0% growth and 0 investment for comparison only. No currency conversion.'],
    ['Known limitations', 'Simplified revenue less cost, not verified profit or cash flow. No causal model, seasonality, capacity constraint, inflation, financing, tax, or fitted predictive model. Calculator input limits are numerical guardrails, not validated thresholds.'],
    ['Missing information', 'Adoption, customer response, employee support, data quality, human review resources, implementation timing, and comparable outcome evidence are unknown. Blank required inputs stop calculation; unknown contextual factors are not treated as zero effects.'],
    ['Evidence-confidence level', 'Not established for projection. No calibrated probabilities or confidence intervals.'],
    ['Result type', 'Exploratory illustrative projection; not predictive. Historical demonstration values are descriptive and fictional. Research context and opinions do not modify organizational scoring.']
  ];
  el('method').replaceChildren();
  for (const [term, value] of method) {
    const dt = document.createElement('dt'), dd = document.createElement('dd');
    dt.textContent = term; dd.textContent = value; el('method').append(dt, dd);
  }
  if (!model.ok) {
    el('status').textContent = model.message;
    el('meaning').textContent = 'No scenario is calculated until the required baseline, period, and assumptions are supplied. Missing information remains unknown.';
    el('chart').replaceChildren(); el('table').replaceChildren();
    return;
  }
  const direction = model.difference < 0 ? 'lower' : model.difference > 0 ? 'higher' : 'unchanged';
  const interpretation = model.difference === 0 ? 'The four-quarter remainder is unchanged from the constant baseline.' : `The four-quarter remainder is ${format(Math.abs(model.difference))} ${direction} than the constant baseline under these assumptions.`;
  el('status').textContent = `${interpretation} Illustrative projection, not a forecast.`;
  el('baseline-total').textContent = format(model.baselineTotal);
  el('total').textContent = format(model.total);
  el('difference').textContent = `${interpretation} Values displayed to at most two decimal places.`;
  el('meaning').textContent = `${interpretation} This difference follows only from the assumptions you entered; it does not establish what will happen.`;
  el('table').replaceChildren();
  for (const row of model.rows) {
    const tr = document.createElement('tr');
    for (const [index, value] of [`Illustrative quarter +${row.quarter}`, row.baseline, row.revenue, row.cost, row.investment, row.remainder].entries()) {
      const td = document.createElement(index === 0 ? 'th' : 'td');
      if (index === 0) td.scope = 'row';
      td.textContent = String(value); tr.append(td);
    }
    el('table').append(tr);
  }
  chart(model, demo);
}

el('workspace').hidden = false;
el('controls').addEventListener('submit', event => event.preventDefault());
for (const id of fields) el(id).addEventListener('input', () => {
  el('change').textContent = `${names[id]} changed from ${previous[id] || 'Unknown'} to ${el(id).value || 'Unknown'}. Other inputs remain as set; compare the resulting totals with the constant baseline.`;
  previous[id] = el(id).value; update();
});
source.addEventListener('change', () => { el('change').textContent = 'Starting data changed. Both the constant baseline and the scenario now use the selected source; saved assessments are unchanged.'; update(); });
el('reset').addEventListener('click', () => {
  for (const id of ['growth', 'cost-growth', 'investment']) { el(id).value = '0'; previous[id] = '0'; }
  el('change').textContent = 'Reset revenue growth, cost growth, and investment to zero. Starting data and your evidence notes are unchanged.';
  update();
});
let frame;
const resize = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { if (current) chart(current.model, current.demo); }); };
if (typeof ResizeObserver === 'function') new ResizeObserver(resize).observe(el('chart').parentElement);
else window.addEventListener('resize', resize);
update();
