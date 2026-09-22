const assert = require('node:assert/strict');
const { chromium } = require(process.env.CEAM_PLAYWRIGHT_PATH || 'C:/Users/brigg/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.CEAM_TEST_URL || 'http://127.0.0.1:8765';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [], capturedSubmissions = [];
  page.on('pageerror', error => errors.push(error.message));
  // Exercise the existing send branch with an intercepted request, never a live email.
  await page.route('https://hooks.zapier.com/**', async route => {
    capturedSubmissions.push(route.request().postData());
    await route.fulfill({ status: 200, body: 'Test interception: nothing delivered.' });
  });
  const counts = { personal: 58, business: 58, education: 55, healthcare: 54, rehabilitation: 54 };
  for (const [context, count] of Object.entries(counts)) {
    await page.goto(`${base}/surveys.html?context=${context}`, { waitUntil: 'domcontentloaded' });
    assert.equal(await page.title(), 'CEAM+ Surveys');
    assert.equal(await page.locator('[data-organization-select]').inputValue(), context);
    await page.locator('[data-start-assessment]').click();
    assert.equal(await page.locator('.guided-question').count(), count, context);
    assert.equal(await page.locator('.phase-card').count(), 9, context);
    const first = page.locator('[data-response-status]').first();
    await first.selectOption('Uncertain');
    assert.match(await page.locator('[data-progress-text]').innerText(), /^1 of /);
    await first.selectOption('Not applicable');
    assert.equal(await first.inputValue(), 'Not applicable');
    assert.equal(capturedSubmissions.length, 0, 'starting and answering never submits');
  }

  await page.goto(`${base}/assessments.html?context=business#assessments`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-start-assessment]').click();
  assert.equal(await page.locator('.guided-question').count(), 58);
  assert.equal(await page.locator('.nav-links [aria-current="page"]').getAttribute('href'), 'surveys.html');
  const form = page.locator('[data-assessment-form]');
  for (const [name, value] of Object.entries({ firstName: 'Fictional', lastName: 'Test', email: 'test@example.invalid', phone: '0000000000', organization: 'Fictional browser test' })) await form.locator(`[name="${name}"]`).fill(value);
  await page.locator('[data-response-status]').first().selectOption('Uncertain');
  await page.getByRole('button', { name: 'Show My CEAM+ Profile', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('[data-result]')?.hidden === false);
  assert.match(await page.locator('[data-result]').innerText(), /No score calculated/);
  assert.match(await page.locator('[data-result]').innerText(), /human reviewer retains responsibility/);
  await page.waitForTimeout(100);
  assert.equal(capturedSubmissions.length, 1, 'existing submit branch reached the interception only');
  assert.match(capturedSubmissions[0], /Fictional/);
  const download = await Promise.all([page.waitForEvent('download'), page.locator('[data-download-results]').click()]);
  assert.match(download[0].suggestedFilename(), /^ceam-results-business-.*\.json$/);

  for (const [query, selector, expected] of [
    ['?mode=calculator&metric=cac', '#metric-select', 'cac'],
    ['?mode=calculator&metric=romi_contribution', '#metric-select', 'romi_contribution'],
    ['?mode=case&tool=forces', '[data-strategy-selector]', 'forces'],
    ['?mode=case&tool=stp', '[data-strategy-selector]', 'stp'],
    ['?mode=data&analysis=forecast', '#stat-method', 'forecast'],
  ]) {
    await page.goto(`${base}/analytics-lab.html${query}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => Boolean(window.CEAMAnalyticsLab));
    assert.equal(await page.locator(selector).inputValue(), expected);
    assert.match(await page.locator('#lab-status').innerText(), /assessment responses have been transferred/);
  }
  await page.getByRole('button', { name: 'Load Sample Data' }).click();
  assert.equal(await page.locator('#stat-method').inputValue(), 'forecast');
  assert(await page.locator('#stat-method').isVisible());

  for (const route of ['index.html', 'surveys.html?context=personal', 'assessments.html?context=business', 'analytics-lab.html?mode=case&tool=forces']) {
    await page.goto(`${base}/${route}`, { waitUntil: 'domcontentloaded' });
    if (route.includes('context=')) await page.locator('[data-start-assessment]').click();
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${route}: page overflow at ${width}px`);
      assert.equal(await page.locator('.nav-links a').count(), 9);
    }
    await page.locator('.nav-links a[href="assessment-center.html"]').focus();
    assert.equal(await page.locator(':focus').getAttribute('href'), 'assessment-center.html');
  }
  assert.deepEqual(errors, []);
  await browser.close();
  console.log('PASS survey integration: five contexts, legacy route, uncertainty, intercepted submission, results/download, analytic tool links, responsive layout and keyboard navigation. No live survey submission was sent.');
})().catch(error => { console.error(error); process.exit(1); });
