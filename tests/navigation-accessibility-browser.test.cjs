const { chromium } = require('C:/Users/brigg/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const base = process.env.CEAM_TEST_URL || 'http://127.0.0.1:8765';
  try {
    const page = await browser.newPage();
    await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ body: '', contentType: 'text/css' }));
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(base + '/index.html');
      const nav = page.locator('.nav-links');
      const details = nav.locator('.nav-more');
      const summary = details.locator('summary');
      await page.locator('.brand').focus();
      for (const expected of ['Dashboard', 'Marketing Analytics Lab', 'Assessment Center', 'Personas', 'Explore']) {
        await page.keyboard.press('Tab');
        assert.equal(await page.locator(':focus').textContent(), expected, 'logical keyboard order at ' + width);
      }
      assert.equal(await summary.evaluate(element => getComputedStyle(element).outlineStyle), 'solid', 'visible keyboard focus');
      await page.keyboard.press('Enter');
      assert(await details.evaluate(element => element.open), 'Enter opens disclosure');
      await page.keyboard.press('Tab');
      assert.equal(await page.locator(':focus').textContent(), 'Home');
      await page.keyboard.press('Tab');
      assert.equal(await page.locator(':focus').textContent(), 'Surveys');
      await page.keyboard.press('Escape');
      assert.equal(await details.evaluate(element => element.open), false, 'Escape closes disclosure');
      assert(await summary.evaluate(element => document.activeElement === element), 'Escape restores focus');
      await page.keyboard.press('Space');
      assert(await details.evaluate(element => element.open), 'Space opens disclosure');
      await page.mouse.click(8, 650);
      assert.equal(await details.evaluate(element => element.open), false, 'outside click closes disclosure');
      await summary.click();
      await details.getByRole('link', { name: 'Research', exact: true }).click();
      await page.waitForURL('**/research.html');
      assert.equal(await page.locator('.nav-more[data-current-section]').count(), 1, 'current secondary section visible on summary');
      await page.locator('.nav-more > summary').click();
      assert.equal(await page.locator('.nav-secondary a[aria-current="page"]').textContent(), 'Research');
      console.log('PASS navigation keyboard and disclosure controls at ' + width);
    }
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
    const fallback = await context.newPage();
    await fallback.route('https://fonts.googleapis.com/**', route => route.fulfill({ body: '', contentType: 'text/css' }));
    await fallback.goto(base + '/index.html');
    const summary = fallback.locator('.nav-more > summary');
    await summary.focus();
    await fallback.keyboard.press('Enter');
    for (const link of await fallback.locator('.nav-links a').all()) assert(await link.isVisible(), 'every destination works without JavaScript');
    await fallback.keyboard.press('Space');
    assert.equal(await fallback.locator('.nav-secondary').isVisible(), false, 'native disclosure closes without JavaScript');
    await context.close();
    console.log('PASS navigation no-JavaScript fallback');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
