const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.CEAM_PLAYWRIGHT_PATH || 'C:/Users/brigg/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.CEAM_TEST_URL || 'http://127.0.0.1:8765';
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [], external = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => { if (!r.url().startsWith(base)) external.push(r.url()); });
    await page.goto(`${base}/dashboard.html`);
    await page.locator('#scenario-workspace:not([hidden])').waitFor();
    assert(await page.locator('#dashboard-demo').isVisible());
    assert.equal(await page.locator('#scenario-baseline-total').innerText(), '64,000');
    assert.equal(await page.locator('#scenario-total').innerText(), '64,000');
    const before = await page.locator('#scenario-chart').innerHTML();
    await page.getByLabel('Revenue growth per quarter (%)', { exact: true }).fill('10');
    assert.notEqual(await page.locator('#scenario-chart').innerHTML(), before);
    assert.match(await page.locator('#scenario-status').innerText(), /higher/);
    assert.equal(await page.locator('#scenario-baseline-total').innerText(), '64,000');
    assert.match(await page.locator('#scenario-change').textContent(), /Revenue growth assumption changed from 0 to 10/);
    await page.getByLabel('One-time implementation investment', { exact: true }).fill('10000');
    assert.equal(await page.locator('#scenario-table tr').first().locator('td').nth(3).textContent(), '10000');
    assert.equal(await page.locator('#scenario-table tr').last().locator('td').nth(3).textContent(), '0');
    await page.getByRole('button', { name: 'Reset scenario', exact: true }).focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#scenario-total').innerText(), '64,000');
    assert.equal(await page.locator('#scenario-investment').inputValue(), '0');
    for (const name of ['What this means', 'Why this changed', 'How this was calculated', 'What evidence supports this', 'What remains uncertain', 'What you can do next']) {
      const summary = page.locator('.scenario-explanations summary').filter({ hasText: new RegExp(`^${name}$`) });
      await summary.focus(); await page.keyboard.press('Enter');
      assert(await summary.evaluate(node => node.parentElement.open));
    }
    const method = await page.locator('#scenario-method').innerText();
    for (const label of ['Data source', 'Period covered', 'Formula / method', 'User-supplied', 'System-supplied', 'Known limitations', 'Missing information', 'Evidence-confidence level', 'Result type']) assert(method.includes(label));
    assert.match(method, /not predictive/);
    assert.match(await page.locator('#scenario-chart').getAttribute('aria-label'), /solid line.*dotted line.*dashed line/);
    assert(await page.locator('#scenario-chart path[stroke-dasharray="9 5"]').count());
    assert.match(await page.locator('.research-context-label').textContent(), /Research context, not an organizational diagnosis/);
    await page.getByLabel('Starting data', { exact: true }).selectOption('manual');
    assert(await page.locator('#scenario-output').isHidden());
    assert.match(await page.locator('#scenario-status').innerText(), /Additional evidence needed/);
    await page.getByLabel('Baseline quarterly revenue', { exact: true }).fill('100');
    await page.getByLabel('Baseline quarterly cost', { exact: true }).fill('40');
    await page.getByLabel('Baseline period (for example, 2026 Q2)', { exact: true }).fill('2026 Q2');
    assert.equal(await page.locator('#scenario-total').innerText(), '240');
    assert.match(await page.locator('#scenario-chart').getAttribute('aria-label'), /single point/);
    await page.locator('#scenario-growth').fill('');
    assert(await page.locator('#scenario-output').isHidden());
    assert.equal(await page.locator('#scenario-chart path').count(), 0, 'invalid inputs clear stale chart');
    await page.locator('#scenario-reset').click();
    assert.equal(await page.locator('#scenario-total').innerText(), '240');
    await page.locator('#scenario-source').selectOption('demo');
    // Seed real saved data using the unchanged public storage API, then compare every byte.
    await page.evaluate(async () => {
      const { getAssessment } = await import('/js/assessments/definitions.mjs');
      const { scoreAssessment } = await import('/js/assessments/scoring.mjs');
      const { saveResult } = await import('/js/assessments/storage.mjs');
      const definition = getAssessment('marketing-readiness');
      const response = { answers: {}, evidence: {}, priorities: [], actionPlan: [], context: definition.contextOptions[0], initiative: 'Preserved scenario baseline', metrics: {}, demo: false };
      for (const dimension of definition.dimensions) for (const question of dimension.questions) response.answers[question.id] = question.options?.[0]?.value || '3';
      const assertSave = saveResult(definition, response, scoreAssessment(definition, response));
      if (!assertSave.ok) throw Error('save failed');
    });
    const snapshot = () => page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort()));
    const saved = await snapshot();
    await page.reload();
    await page.locator('#scenario-workspace:not([hidden])').waitFor();
    assert.match(await page.locator('#dashboard-assessment-detail').innerText(), /Preserved scenario baseline/);
    assert(await page.locator('#dashboard-demo').isHidden());
    await page.locator('#scenario-cost-growth').fill('10');
    await page.locator('#scenario-reset').click();
    await page.getByRole('button', { name: 'Load Demo Data', exact: true }).click();
    assert.equal(await snapshot(), saved);
    fs.mkdirSync('.cache/scenario-verification', { recursive: true });
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.waitForFunction(() => Math.abs(document.querySelector('#scenario-chart').viewBox.baseVal.width - Math.max(250, document.querySelector('#scenario-chart').parentElement.clientWidth)) < 2);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `page overflow at ${width}`);
      await page.locator('#scenario-explorer').screenshot({ path: `.cache/scenario-verification/explorer-${width}.png` });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
    await page.screenshot({ path: '.cache/scenario-verification/dashboard-desktop.png' });
    const blocked = await browser.newPage();
    await blocked.addInitScript(() => { Storage.prototype.getItem = Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError'); }; });
    await blocked.goto(`${base}/dashboard.html`);
    await blocked.locator('#scenario-growth').fill('5');
    assert.match(await blocked.locator('#scenario-status').innerText(), /higher/);
    assert.match(await blocked.locator('#saved-assessment-dashboard').innerText(), /could not be read/);
    await blocked.close();
    assert.deepEqual(errors, []); assert.deepEqual(external, []);
    console.log('PASS scenario changes, reset, baseline comparison, explanations, insufficient inputs, line labels, storage preservation, blocked storage, responsive layout, keyboard, research separation, and no external requests.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
