import test from 'node:test';
import assert from 'node:assert/strict';
import { chartScale, buildChartData, drawChart } from '../js/analytics/charts.mjs';
import { samples } from '../js/analytics/samples.mjs';

test('quarterly chart uses readable outward ticks without changing the six observations', () => {
  const chart = buildChartData({ rows: samples.quarters.rows, x: 'Quarter', y: 'Revenue', type: 'line' });
  assert.deepEqual(chart.labels, ['2025 Q1', '2025 Q2', '2025 Q3', '2025 Q4', '2026 Q1', '2026 Q2']);
  assert.deepEqual(chart.table.rows.map(row => row[1]), [32000, 35000, 33000, 41000, 43000, 47000]);
  assert.deepEqual(chartScale(chart.series[0].values), { min: 0, max: 50000, step: 10000, ticks: [0, 10000, 20000, 30000, 40000, 50000] });
});

test('chart scales include zero and all positive, negative, fractional, and constant values', () => {
  for (const values of [[0], [5, 5], [-5, -5], [-17, 35], [.0012, .0027], [-.3, .6], [1e10, 1.3e10]]) {
    const scale = chartScale(values);
    assert(scale.min <= Math.min(0, ...values));
    assert(scale.max >= Math.max(0, ...values));
    assert(scale.step > 0 && scale.ticks.length <= 8);
    assert(scale.ticks.every(Number.isFinite));
  }
  for (const values of [[Infinity], [NaN], [-1e308, 1e308], [Number.MIN_VALUE], [Number.MAX_VALUE]]) {
    assert.throws(() => chartScale(values), /numeric range|Rescale/);
  }
});

test('chart tables preserve precise numeric observations and missing combinations', () => {
  const chart = buildChartData({ rows: [{ Quarter: '2026 Q1', Revenue: 1.23456789, Group: 'A' }, { Quarter: '2026 Q2', Revenue: 2.987654321, Group: 'B' }], x: 'Quarter', y: 'Revenue', group: 'Group', type: 'line' });
  assert.deepEqual(chart.table.rows, [['2026 Q1', 1.23456789, null], ['2026 Q2', null, 2.987654321]]);
  assert.match(chart.summary, /gaps, not zero/);
  const histogram = buildChartData({ rows: [{ Value: .00001 }, { Value: .00002 }], y: 'Value', type: 'histogram' });
  assert.match(histogram.table.rows[0][0], /0\.00001/);
  assert.equal(new Set(histogram.labels).size, 2);
  assert(histogram.labels.every(label => label !== '0–0'));
  const narrow = buildChartData({ rows: [{ Value: 1.00001e-10 }, { Value: 1.00002e-10 }], y: 'Value', type: 'histogram' });
  assert.equal(new Set(narrow.labels).size, 2);
  assert(narrow.labels.every(label => { const [lower, upper] = label.split('–').map(Number); return lower < upper; }));
  assert.equal(histogram.table.rows.reduce((sum, row) => sum + row[1], 0), 2);
});

function mockCanvas(width) {
  const calls = [];
  const context = { font: '', fillStyle: '', textAlign: '', scale() {}, fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, arc() {}, closePath() {}, fill() {}, measureText(value) { return { width: String(value).length * 6 }; }, fillText(value, x, y) { calls.push({ value: String(value), x, y, font: this.font }); } };
  return { parentElement: { clientWidth: width }, style: {}, attributes: {}, getContext: () => context, setAttribute(name, value) { this.attributes[name] = value; }, calls };
}

test('mobile and desktop render every quarterly marker with inherited typography and useful values', () => {
  const previousWindow = globalThis.window;
  globalThis.window = { devicePixelRatio: 2, getComputedStyle: () => ({ paddingLeft: '10px', paddingRight: '10px', fontFamily: 'Test Site Font, system-ui' }) };
  try {
    for (const width of [244, 900]) {
      const canvas = mockCanvas(width);
      drawChart(canvas, { rows: samples.quarters.rows, x: 'Quarter', y: 'Revenue', type: 'line', title: 'Quarterly sales demonstration' });
      assert.equal(canvas.width, (width - 20) * 2);
      assert(canvas.calls.every(call => call.font.includes('Test Site Font')));
      const labels = canvas.calls.map(call => call.value);
      if (width < 500) {
        assert.equal(labels.filter(label => /^Q[1-4]$/.test(label)).length, 6);
        assert(labels.includes('2025') && labels.includes('2026'));
      } else for (const row of samples.quarters.rows) assert(labels.includes(row.Quarter));
      assert(labels.includes('32,000') && labels.includes('47,000'));
      assert.match(canvas.attributes['aria-label'], /does not establish seasonality or cause/);
      assert.match(canvas.attributes['aria-label'], /accompanying data table/);
    }
  } finally { globalThis.window = previousWindow; }
});