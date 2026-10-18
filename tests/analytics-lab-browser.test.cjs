const { chromium } = require('C:/Users/brigg/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const XLSX = require('../assets/vendor/xlsx.full.min.js');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:8765/analytics-lab.html', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Try an example').selectOption('quarters');
  await page.getByRole('button', { name: 'Load Sample Data' }).click();
  await page.waitForFunction(() => document.querySelector('#dataset-name').textContent.includes('Quarterly sales'));
  assert((await page.locator('#dataset-name').innerText()).includes('Quarterly sales'));
  assert((await page.locator('#data-preview').innerText()).includes('2025 Q1'));
  assert((await page.locator('#data-quality').innerText()).includes('Revenue'));
  assert(await page.locator('#variable-mapping [data-mapping-role="Revenue"]').count());

  await page.locator('#data-file').setInputFiles({
    name: 'local-test.csv', mimeType: 'text/csv',
    buffer: Buffer.from('Quarter,Revenue,Segment\n2026 Q1,"1,200",A\n2026 Q2,1400,B\n'),
  });
  await page.waitForFunction(() => document.querySelector('#dataset-name').textContent.includes('local-test.csv'));
  assert((await page.locator('#data-preview').innerText()).includes('1,200'));
  assert((await page.locator('#dataset-name').innerText()).includes('local-test.csv'));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
    ['Quarter', 'Revenue', 'Segment'], ['2026 Q1', 1200, 'A'], ['2026 Q2', 1400, 'B'],
  ]), 'Sales');
  await page.locator('#data-file').setInputFiles({
    name: 'local-test.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: Buffer.from(XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })),
  });
  await page.waitForFunction(() => document.querySelector('#dataset-name').textContent.includes('local-test.xlsx'));
  assert((await page.locator('#data-preview').innerText()).includes('2026 Q2'));

  await page.locator('#data-file').setInputFiles({
    name: 'local-test.xls', mimeType: 'application/vnd.ms-excel',
    buffer: Buffer.from(XLSX.write(workbook, { bookType: 'xls', type: 'buffer' })),
  });
  await page.waitForFunction(() => document.querySelector('#dataset-name').textContent.startsWith('local-test.xls ·'));
  assert((await page.locator('#data-preview').innerText()).includes('2026 Q1'));

  await page.locator('#chart-form').getByRole('button', { name: 'Generate chart' }).click();
  assert.equal(await page.locator('#chart-output').getAttribute('hidden'), null);
  assert((await page.locator('#chart-summary').innerText()).length > 20);
  await page.getByText('Accessible chart data table', { exact: true }).click();
  assert((await page.locator('#chart-table').innerText()).includes('2026 Q1'));
  const chartDownload = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download chart PNG' }).click(),
  ]);
  assert.equal(chartDownload[0].suggestedFilename(), 'ceam-chart.png');

  await page.getByRole('button', { name: 'Choose a business question' }).click();
  await page.getByRole('button', { name: 'Use 5,000 / 7% / 11% example' }).click();
  await page.getByRole('button', { name: 'Calculate market opportunity' }).click();
  assert((await page.locator('#quick-result').innerText()).includes('5,000'));
  const csvDownload = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export results CSV' }).click(),
  ]);
  assert.equal(csvDownload[0].suggestedFilename(), 'ceam-analysis-results.csv');
  await page.locator('details').filter({ hasText: 'Analysis history · This tab only' }).evaluate(node => { node.open = true; });
  assert((await page.locator('#analysis-history').innerHTML()).includes('Projected market growth'));

  await page.getByRole('button', { name: 'Case Analysis Mode' }).click();
  await page.getByLabel('Business / case name', { exact: true }).fill('App persistence check');
  await page.getByRole('button', { name: 'Data & visualizations' }).click();
  await page.getByRole('button', { name: 'Case Analysis Mode' }).click();
  assert.equal(await page.getByLabel('Business / case name', { exact: true }).inputValue(), 'App persistence check');

  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `horizontal overflow at ${width}px`);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('.skip-link').focus();
  assert((await page.locator(':focus').innerText()).includes('Skip to content'));
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log('PASS analytics lab: local sample load, preview/quality/mapping, chart/table, quick calculator, retained case state, responsive widths, and skip link.');
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
