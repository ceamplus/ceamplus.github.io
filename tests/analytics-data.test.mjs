import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNumber, inspectData, suggestMappings } from '../js/analytics/data-quality.mjs';
import { buildChartData } from '../js/analytics/charts.mjs';

test('data quality parsing keeps explicit percentages and common currency formats precise', () => {
  assert.equal(parseNumber('$1,200.50'), 1200.5);
  assert.equal(parseNumber('(€75)'), -75);
  assert.equal(parseNumber('7%'), 0.07);
  assert.equal(parseNumber('7', 'percent'), 0.07);
  assert.equal(parseNumber('0.07', 'decimal'), 0.07);
  assert.equal(parseNumber('7'), 7);
  assert.equal(parseNumber('1,2'), null);
  assert.equal(parseNumber('not a number'), null);
});

test('quality inspection reports missing values, duplicates, types, and outliers', () => {
  const rows = [
    { Segment: 'A', Revenue: '100', Date: '2026-01-01' },
    { Segment: 'A', Revenue: '100', Date: '2026-01-01' },
    { Segment: 'B', Revenue: '', Date: '2026-01-03' },
    { Segment: 'C', Revenue: '10000', Date: '2026-01-04' },
    { Segment: 'D', Revenue: '100', Date: '2026-01-05' },
  ];
  const quality = inspectData(rows, ['Segment', 'Revenue', 'Date']);
  assert.equal(quality.duplicates, 1);
  assert.equal(quality.columns.find(c => c.name === 'Revenue').missing, 1);
  assert.equal(quality.columns.find(c => c.name === 'Revenue').type, 'Numeric');
  assert.equal(quality.columns.find(c => c.name === 'Revenue').outliers, 1);
  assert.equal(quality.columns.find(c => c.name === 'Date').type, 'Date/time');
});

test('mapping suggestions are exact after normalization and charts retain underlying rows', () => {
  const mapping = suggestMappings(['Revenue', 'Marketing Spend', 'Customer_ID']);
  assert.equal(mapping.Revenue, 'Revenue');
  assert.equal(mapping['Marketing spend'], 'Marketing Spend');
  assert.equal(mapping['Customer ID'], 'Customer_ID');
  const chart = buildChartData({
    rows: [{ Quarter: '2026 Q2', Revenue: 40 }, { Quarter: '2026 Q1', Revenue: 30 }],
    x: 'Quarter', y: 'Revenue', type: 'line', aggregation: 'sum',
  });
  assert.deepEqual(chart.labels, ['2026 Q1', '2026 Q2']);
  assert.deepEqual(chart.table.rows, [['2026 Q1', 30], ['2026 Q2', 40]]);
  assert.match(chart.summary, /does not establish seasonality or cause/);
});
