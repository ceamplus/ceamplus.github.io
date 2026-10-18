/** In-memory demonstration only. Never reads or writes assessment storage. */
import { samples } from '../analytics/samples.mjs';
import { drawChart } from '../analytics/charts.mjs';

const panel = document.querySelector('#dashboard-demo');
const load = document.querySelector('#load-dashboard-demo');
const close = document.querySelector('#close-dashboard-demo');
const metric = document.querySelector('#dashboard-demo-metric');
const canvas = document.querySelector('#dashboard-demo-chart');
const notice = document.querySelector('#dashboard-demo-status');
const rows = samples.quarters.rows;
let lastWidth = 0;
let resizeFrame = 0;

// Keep the original values available independently of canvas rendering.
const body = document.querySelector('#dashboard-demo-rows');
for (const row of rows) {
  const tr = document.createElement('tr');
  for (const key of ['Quarter', 'Revenue', 'Cost']) {
    const cell = document.createElement(key === 'Quarter' ? 'th' : 'td');
    if (key === 'Quarter') cell.scope = 'row';
    cell.textContent = String(row[key]);
    tr.append(cell);
  }
  body.append(tr);
}

function render() {
  if (panel.hidden) return;
  lastWidth = canvas.parentElement.clientWidth;
  try {
    drawChart(canvas, { rows, x: 'Quarter', y: metric.value, type: 'line', aggregation: 'sum', title: `${metric.value} by quarter · Fictional demonstration` });
    notice.textContent = `Showing ${metric.value.toLowerCase()} for six fictional quarters. Saved assessments are unchanged.`;
    const values = rows.map(row => row[metric.value]);
    const previous = values.at(-2), latest = values.at(-1);
    const change = (latest - previous) / previous * 100;
    document.querySelector('#dashboard-demo-observation').textContent = `${metric.value} moves from ${previous.toLocaleString()} in ${rows.at(-2).Quarter} to ${latest.toLocaleString()} in ${rows.at(-1).Quarter}: ${change.toFixed(1)}% higher in this fictional example. This is a descriptive comparison, not an explanation or forecast.`;
    document.querySelector('#dashboard-demo-decision').textContent = metric.value === 'Revenue' ? 'Before expanding a campaign, compare customer mix, prices, costs, and seasonal patterns. Consider a small, reversible test with a named owner and a success measure; the revenue trend alone cannot justify expansion.' : 'Before reducing spending, examine cost components, service quality, and workload. Consider testing a specific process change while tracking its effects on customers and staff; higher costs alone do not establish inefficiency.';
  } catch {
    notice.textContent = 'The chart is unavailable. All six fictional observations remain in the data table below.';
  }
}

load.hidden = false;
load.addEventListener('click', () => {
  panel.hidden = false;
  render();
  document.querySelector('#dashboard-demo-title').focus();
});
close.addEventListener('click', () => {
  panel.hidden = true;
  load.focus();
});
metric.addEventListener('change', render);
function resize() {
  if (panel.hidden || canvas.parentElement.clientWidth === lastWidth) return;
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(render);
}
if (typeof ResizeObserver === 'function') new ResizeObserver(resize).observe(canvas.parentElement);
else window.addEventListener('resize', resize);

// First-time visitors see the working example without losing focus or writing storage.
// Saved assessments keep priority for returning users; the demo remains available on demand.
if (document.querySelector('#saved-assessment-dashboard')?.dataset.hasSavedResults === 'false') {
  panel.hidden = false;
  render();
}
