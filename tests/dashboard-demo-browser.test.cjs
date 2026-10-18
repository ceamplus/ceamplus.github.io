const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.CEAM_PLAYWRIGHT_PATH || 'C:/Users/brigg/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.CEAM_TEST_URL || 'http://127.0.0.1:8765';
const key = 'ceamplus.assessment-center.v1';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [], external = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (!request.url().startsWith(base)) external.push(request.url()); });
    const snapshot = () => page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort(([a], [b]) => a.localeCompare(b))));
    await page.goto(`${base}/dashboard.html`);
    assert.match(await page.locator('#saved-assessment-dashboard').innerText(), /No assessment results/);
    assert(await page.locator('#dashboard-demo').isVisible(), 'first-time visitors see working Dashboard content immediately');
    assert.match(await page.locator('#dashboard-demo-observation').innerText(), /9.3% higher/);
    assert.match(await page.locator('#dashboard-demo-decision').innerText(), /reversible test/);
    const original = await snapshot();
    const load = page.getByRole('button', { name: 'Load Demo Data', exact: true });
    assert(await load.isVisible(), 'demo entry is outside the collapsed research section');
    assert(await page.getByRole('link', { name: 'Try a Demo Assessment', exact: true }).isVisible());
    await load.focus();
    await page.keyboard.press('Enter');
    assert(await page.locator('#dashboard-demo').isVisible());
    assert.equal(await page.locator(':focus').getAttribute('id'), 'dashboard-demo-title');
    assert.match(await page.locator('#dashboard-demo').innerText(), /Demonstration Data · Fictional/);
    assert.equal(await page.locator('#dashboard-demo-rows tr').count(), 6);
    assert.deepEqual(await page.locator('#dashboard-demo-rows tr').last().locator('td').allTextContents(), ['47000', '31000']);
    assert.match(await page.locator('#dashboard-demo-chart').getAttribute('aria-label'), /Revenue/);
    await page.getByLabel('Choose a measure', { exact: true }).selectOption('Cost');
    assert.match(await page.locator('#dashboard-demo-chart').getAttribute('aria-label'), /Cost/);
    assert.equal(await snapshot(), original, 'loading and exploring demo writes no browser storage');
    fs.mkdirSync('.cache/feedback-verification', { recursive: true });
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.waitForFunction(() => {
        const canvas = document.querySelector('#dashboard-demo-chart');
        return Math.abs(canvas.width / Math.min(devicePixelRatio || 1, 2) - canvas.parentElement.clientWidth) < 2;
      });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `overflow at ${width}`);
      assert(await page.locator('#dashboard-demo-chart').evaluate(canvas => canvas.toDataURL().length > 1000), 'chart renders');
      if (width === 390 || width === 1440) await page.locator('#dashboard-demo').screenshot({ path: `.cache/feedback-verification/dashboard-demo-${width}.png` });
    }
    await page.getByRole('button', { name: 'Close demo', exact: true }).click();
    assert(await page.locator('#dashboard-demo').isHidden());
    assert.equal(await page.locator(':focus').getAttribute('id'), 'load-dashboard-demo');
    await page.getByRole('link', { name: 'Try a Demo Assessment', exact: true }).click();
    await page.locator('.ac-demo').waitFor();
    assert.match(await page.locator('.ac-demo').innerText(), /Fictional/);
    assert.equal(await snapshot(), original, 'direct demo assessment never saves');

    // A valid saved report, unrelated draft, and other browser data must survive both demos byte-for-byte.
    await page.evaluate(async () => {
      const { getAssessment } = await import('/js/assessments/definitions.mjs');
      const { scoreAssessment } = await import('/js/assessments/scoring.mjs');
      const { saveResult, saveDraft } = await import('/js/assessments/storage.mjs');
      const def = getAssessment('marketing-readiness');
      const response = { answers: {}, evidence: {}, priorities: [], actionPlan: [], context: def.contextOptions[0], initiative: 'Existing local evidence', metrics: {}, demo: false };
      for (const dimension of def.dimensions) for (const question of dimension.questions) response.answers[question.id] = question.options?.[0]?.value || '3';
      if (!saveResult(def, response, scoreAssessment(def, response)).ok) throw Error('fixture save failed');
      if (!saveDraft(getAssessment('customer-insight'), { ...response, initiative: 'Unfinished draft' }).ok) throw Error('fixture draft failed');
      localStorage.setItem('unrelated-test-key', 'keep this value');
    });
    const saved = await snapshot();
    await page.goto(`${base}/dashboard.html`);
    assert.match(await page.locator('#saved-assessment-dashboard').innerText(), /Existing local evidence/);
    assert(await page.locator('#dashboard-demo').isHidden(), 'saved results take priority for returning visitors');
    await page.getByRole('button', { name: 'Load Demo Data', exact: true }).click();
    assert(await page.locator('#dashboard-assessment-detail').isVisible(), 'demo does not replace saved view');
    assert.match(await page.locator('#dashboard-assessment-detail').innerText(), /Local assessment data/);
    await page.getByLabel('Choose a measure', { exact: true }).selectOption('Cost');
    await page.getByRole('link', { name: 'Try a Demo Assessment', exact: true }).click();
    await page.locator('.ac-demo').waitFor();
    assert.equal(await snapshot(), saved, 'saved results and drafts are unchanged');
    await page.goto(`${base}/dashboard.html`);
    await page.getByRole('link', { name: 'Review Report & Action Plan', exact: true }).click();
    await page.locator('.ac-result-hero').waitFor();
    assert.equal(await page.locator('.ac-demo').count(), 0, 'saved report stays a real assessment');
    assert.equal(await snapshot(), saved);
    assert.equal(await page.evaluate(key => Object.values(JSON.parse(localStorage.getItem(key)).results).flat().length, key), 1);

    const unavailable = await browser.newPage();
    await unavailable.addInitScript(() => { Storage.prototype.getItem = Storage.prototype.setItem = () => { throw new DOMException('Blocked for test', 'SecurityError'); }; });
    await unavailable.goto(`${base}/dashboard.html`);
    assert.match(await unavailable.locator('#saved-assessment-dashboard').innerText(), /could not be read/);
    await unavailable.getByRole('button', { name: 'Load Demo Data', exact: true }).click();
    assert(await unavailable.locator('#dashboard-demo').isVisible(), 'demo works without storage access');
    assert.equal(await unavailable.locator('#dashboard-demo-rows tr').count(), 6);
    await unavailable.close();
    assert.deepEqual(errors, []);
    assert.deepEqual(external, [], 'assessment and demo contents never leave the browser');
    console.log('PASS Dashboard demo: keyboard entry, fictional labels, six exact rows, chart/metric selection, responsive redraw, empty/saved/denied storage, byte-for-byte preservation of reports and drafts, direct demo assessment, saved report reopening, and no external requests.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
