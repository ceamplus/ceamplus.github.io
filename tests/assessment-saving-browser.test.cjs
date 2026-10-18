const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.CEAM_PLAYWRIGHT_PATH || 'C:/Users/brigg/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.CEAM_TEST_URL || 'http://127.0.0.1:8765';
const key = 'ceamplus.assessment-center.v1';
const records = page => page.evaluate(key => Object.values(JSON.parse(localStorage.getItem(key) || '{"results":{}}').results).flat(), key);
async function download(page, selector) {
  const [file] = await Promise.all([page.waitForEvent('download'), page.locator(selector).click()]);
  return JSON.parse(fs.readFileSync(await file.path(), 'utf8'));
}
async function report(page, kind) {
  await page.goto(`${base}/assessment-center.html?assessment=${kind === 'ai' ? 'ai-adoption&mode=analysis' : kind}`);
  if (kind === 'ai') {
    await page.getByRole('button', { name: 'Continue Without Comparison', exact: true }).click();
    await page.locator('#ai-generate').click();
  } else {
    await page.getByRole('button', { name: 'Begin Assessment', exact: true }).click();
    await page.locator('.ac-question input[value="4"]').first().check();
    await page.getByRole('button', { name: 'Review Available Responses', exact: true }).click();
    if (kind === 'marketing-assessment') await page.getByRole('button', { name: 'Generate Marketing Capability Profile', exact: true }).click();
  }
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const kind of ['marketing-readiness', 'marketing-assessment', 'ai']) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await report(page, kind);
      assert.equal((await records(page)).length, 0, 'saving is never implicit');
      const save = kind === 'ai' ? '#ai-save-dashboard' : '#ac-save-dashboard';
      const notice = kind === 'ai' ? '#ai-save-status' : '#ac-save-status';
      await page.locator(save).focus();
      await page.keyboard.press('Enter');
      assert.match(await page.locator(notice).innerText(), /Saved in this browser/);
      await page.locator(save).click();
      assert.equal((await records(page)).length, 1, 'repeated saves update the same record');
      const stored = (await records(page))[0];
      const direct = await download(page, kind === 'ai' ? '#ai-export' : '#ac-download');
      assert.deepEqual(direct.result, stored.result);
      assert.equal(direct.response.resultId, stored.id);
      await page.getByRole('link', { name: 'Open Dashboard', exact: true }).click();
      await page.locator('#dashboard-download-result').waitFor();
      assert(await page.locator('#dashboard-demo').isHidden(), 'saved assessments have priority');
      const exported = await download(page, '#dashboard-download-result');
      assert.deepEqual(exported.response, stored.response);
      assert.deepEqual(exported.result, stored.result);
      assert.equal(exported.recordId, stored.id);
      assert.match(exported.limitations, /User-declared evidence/);
      await page.reload();
      assert.equal((await records(page)).length, 1, 'saved result persists on reload');
      await page.getByRole('link', { name: 'Review Report & Action Plan', exact: true }).click();
      await page.locator(save).waitFor();
      assert.equal((await records(page))[0].id, stored.id);
      for (const width of [320, 390, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${kind}: report overflow at ${width}`);
      }
      assert.deepEqual(errors, []);
      console.log(`PASS ${kind}: explicit keyboard saving, stable result identity, report and Dashboard JSON downloads, reload/reopen, responsive controls.`);
      await context.close();
    }
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('Blocked for test', 'QuotaExceededError'); }; });
    await report(page, 'marketing-readiness');
    await page.locator('#ac-save-dashboard').click();
    assert.match(await page.locator('#ac-save-status').innerText(), /saving is unavailable/);
    assert.equal((await records(page)).length, 0);
    assert((await download(page, '#ac-download')).response.answers);
    await page.goto(`${base}/assessment-center.html?demo=true`);
    await page.locator('.ac-demo').waitFor();
    assert.equal(await page.locator('#ac-save-dashboard').count(), 0, 'fictional demo cannot enter saved history');
    assert.equal((await download(page, '#ac-download')).response.demo, true);
    assert.equal((await records(page)).length, 0);
    await context.close();
    console.log('PASS unavailable browser storage retains downloadable results; demo downloads remain fictional and unsavable.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
