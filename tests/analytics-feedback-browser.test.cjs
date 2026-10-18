const { chromium } = require('C:/Users/brigg/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const generate = () => page.locator('#chart-form').getByRole('button', { name: 'Generate chart', exact: true }).click();
    const runStatistics = () => page.locator('#statistics-form').getByRole('button', { name: 'Run selected analysis' }).click();
    const loadSample = async key => { await page.locator('#sample-select').selectOption(key); await page.locator('#load-sample').click(); };
    const upload = async (name, csv) => {
      await page.locator('#data-file').setInputFiles({ name, mimeType: 'text/csv', buffer: Buffer.from(csv) });
      await page.waitForFunction(expected => document.querySelector('#dataset-name').textContent.startsWith(expected + ' ·'), name);
    };
    await page.goto('http://127.0.0.1:8765/analytics-lab.html', { waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('#sample-select').inputValue(), 'quarters');
    assert.equal(await page.locator('#chart-type').inputValue(), 'line');
    assert.match(await page.locator('#dataset-name').innerText(), /Demonstration Data.*Quarterly sales.*6 rows/);
    assert.equal(await page.locator('#sample-select option').count(), 4);
    assert.equal(await page.locator('#chart-output').isVisible(), true);
    assert.equal(await page.locator('#chart-legend').isVisible(), false);
    assert.equal(await page.locator('#chart-table tbody tr').count(), 6);
    assert.match(await page.locator('#chart-table').textContent(), /47000/);
    assert.equal(await page.evaluate(() => window.CEAMAnalyticsLab.state.analyses.length), 0, 'automatic demo does not add an unrequested saved analysis');
    assert.equal(await page.evaluate(() => localStorage.length), 0, 'demo stays in tab memory');
    assert.match(await page.locator('#analysis-chart').getAttribute('aria-describedby'), /chart-summary chart-table/);

    const screenshotDir = path.resolve('.cache/feedback-charts'); fs.mkdirSync(screenshotDir, { recursive: true });
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 950 });
      await page.waitForFunction(() => {
        const canvas = document.querySelector('#analysis-chart');
        return Math.abs(canvas.width / Math.min(devicePixelRatio || 1, 2) - canvas.getBoundingClientRect().width) <= 1;
      });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `page overflow at ${width}`);
      assert.match(await page.locator('#analysis-chart').getAttribute('aria-label'), /Exact values.*data table/);
      if (width === 320 || width === 1440) await page.locator('#chart-output').screenshot({ path: path.join(screenshotDir, `chart-${width}.png`) });
    }
    await page.locator('#chart-type').selectOption('bar');
    await page.locator('#chart-aggregation').selectOption('mean');
    await page.locator('#chart-name').fill('My quarterly comparison');
    await generate();
    await loadSample('quarters');
    assert.equal(await page.locator('#chart-type').inputValue(), 'bar');
    assert.equal(await page.locator('#chart-aggregation').inputValue(), 'mean');
    assert.equal(await page.locator('#chart-name').inputValue(), 'My quarterly comparison');
    assert.equal(await page.locator('#chart-output').isVisible(), false, 'new data never retains a stale chart');
    await page.locator('#use-chart-recommendation').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#chart-type').inputValue(), 'line');
    await page.locator('#stat-a').selectOption('Cost');
    await page.locator('#reset-chart').click();
    assert.equal(await page.locator('#stat-a').inputValue(), 'Cost', 'chart reset preserves the separate statistical selection');
    assert.equal(await page.locator('#chart-type').inputValue(), 'line');
    assert.equal(await page.locator('#chart-name').inputValue(), '');
    assert.equal(await page.locator('#chart-aggregation').inputValue(), 'sum');

    for (const type of ['bar', 'horizontalBar', 'line', 'donut', 'histogram', 'scatter']) {
      await page.locator('#chart-type').selectOption(type);
      await page.locator('#chart-x').selectOption(type === 'scatter' ? 'Cost' : 'Quarter');
      await generate();
      assert.equal(await page.locator('#lab-error').isVisible(), false, `${type} chart should render`);
      assert.equal(await page.locator('#chart-output').isVisible(), true);
      assert.equal(await page.locator('#chart-legend').isVisible(), type === 'donut', 'only categorical donut needs its singleton-series category legend');
      assert(await page.locator('#chart-table tbody tr').count() >= 3);
    }
    await loadSample('segments');
    await page.locator('#chart-type').selectOption('bar');
    await page.locator('#chart-group').selectOption('Segment');
    await generate();
    assert.equal(await page.locator('#chart-legend span').count(), 3);
    await loadSample('campaigns');
    await page.locator('#chart-type').selectOption('bar');
    await generate();
    assert.equal(await page.locator('#lab-error').isVisible(), false);
    await loadSample('market');
    await page.locator('#stat-method').selectOption('describe');
    await runStatistics();
    const singleton = await page.locator('#statistics-result').innerText();
    assert.equal((singleton.match(/Insufficient evidence: needs at least 2 observations/g) || []).length, 4);
    assert.equal(await page.evaluate(() => window.CEAMAnalyticsLab.state.analyses.at(-1).count), 1);

    await upload('precision.csv', 'Quarter,Revenue\n2026 Q1,1.23456789\n2026 Q2,2.987654321\n');
    await page.locator('#chart-group').selectOption('');
    await page.locator('#chart-type').selectOption('line');
    await generate();
    assert.match(await page.locator('#chart-table').textContent(), /1\.23456789/);
    assert.match(await page.locator('#chart-table').textContent(), /2\.987654321/);

    await upload('missing-period.csv', 'Quarter,A,B\n2026 Q1,2,10\n2026 Q2,,12\n2026 Q3,6,14\n2026 Q4,8,16\n');
    await page.locator('#stat-method').selectOption('forecast');
    await page.locator('#stat-assumptions').check();
    await runStatistics();
    assert.match(await page.locator('#lab-error').innerText(), /equally spaced observations with no missing periods/);
    assert.match(await page.locator('#stat-fit').innerText(), /not 5th\/95th percentiles/);
    await page.locator('#stat-method').selectOption('ci');
    await page.locator('#stat-assumptions').check();
    await runStatistics();
    assert.match(await page.locator('#statistics-result').innerText(), /1 missing or nonnumeric row/);

    await upload('independent-groups.csv', 'A,B,C\n2,10,0\n4,12,2\n6,,4\n8,,6\n');
    await page.locator('#stat-a').selectOption('A');
    await page.locator('#stat-b').selectOption('B');
    await page.locator('#stat-method').selectOption('two');
    await page.locator('#stat-assumptions').check();
    await runStatistics();
    const welch = await page.evaluate(() => { const result = window.CEAMAnalyticsLab.state.analyses.at(-1); return { nA: result.nA, nB: result.nB, difference: result.difference }; });
    assert.deepEqual(welch, { nA: 4, nB: 2, difference: -6 });
    assert.match(await page.locator('#statistics-result').innerText(), /group B uses 2 \(2 omitted\)/);
    await page.locator('#stat-b').selectOption('C');
    await runStatistics();
    assert.equal(await page.evaluate(() => window.CEAMAnalyticsLab.state.analyses.at(-1).difference), 2);
    await page.locator('#stat-b').selectOption('A');
    await runStatistics();
    assert.match(await page.locator('#lab-error').innerText(), /distinct columns/);

    await page.getByRole('button', { name: 'Choose a business question' }).click();
    await page.locator('#quick-example').click();
    await page.locator('#quick-form').getByRole('button', { name: 'Calculate market opportunity' }).click();
    assert.match(await page.locator('#quick-chart-table').textContent(), /5350/);
    await page.setViewportSize({ width: 320, height: 950 });
    await page.waitForFunction(() => {
      const canvas = document.querySelector('#quick-chart');
      return Math.abs(canvas.width / Math.min(devicePixelRatio || 1, 2) - canvas.getBoundingClientRect().width) <= 1;
    });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.equal(errors.length, 0, errors.join('\n'));
    console.log('PASS analytics feedback: quarterly default, all samples/chart types, override/reset, responsive canvases, exact accessible tables, singleton statistics, missing-period forecast rejection, Welch independent groups, keyboard recommendation, and local-only demo.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });