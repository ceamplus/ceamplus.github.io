const { chromium } = require('C:/Users/brigg/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ body: '', contentType: 'text/css' }));
    const base = process.env.CEAM_TEST_URL || 'http://127.0.0.1:8765';
    const files = fs.readdirSync('.').filter(name => name.endsWith('.html'));
    const expected = ['Dashboard', 'Marketing Analytics Lab', 'Assessment Center', 'Personas', 'Home', 'Surveys', 'Research', 'AI', 'Consulting', 'About'];
    for (const name of files) {
      await page.goto(base + '/' + name);
      if (['mission.html', 'philosophy.html'].includes(name)) await page.waitForURL('**/values.html*');
      assert.deepEqual(await page.locator('header .nav-links a').allTextContents(), expected, name);
      assert.equal(await page.locator('header .nav-links > a').count(), 4, name + ': primary task links');
      for (const width of [320, 456, 900, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.locator('.nav-more').evaluate(details => { details.open = false; });
        const metrics = await page.locator('.site-header').evaluate(header => {
          const nav = header.querySelector('nav');
          return {
            right: header.getBoundingClientRect().right,
            height: header.getBoundingClientRect().height,
            scroll: nav.scrollWidth,
            client: nav.clientWidth,
            links: [...nav.querySelectorAll(':scope > a, summary')].map(link => ({ left: link.getBoundingClientRect().left, right: link.getBoundingClientRect().right, height: link.getBoundingClientRect().height }))
          };
        });
        assert(metrics.right <= width + 1, name + ': header overflow');
        assert(metrics.scroll <= metrics.client + 1, name + ': nav overflow');
        assert(metrics.height <= (width >= 1100 ? 85 : width > 700 ? 140 : 200), name + ': compact header at ' + width);
        assert(metrics.links.every(link => link.left >= 0 && link.right <= width + 1 && link.height >= 44), name + ': primary target bounds');
        await page.locator('.nav-more > summary').click();
        const secondary = await page.locator('.nav-secondary').boundingBox();
        assert(secondary && secondary.x >= 0 && secondary.x + secondary.width <= width + 1, name + ': disclosure bounds');
        for (const link of await page.locator('.nav-secondary a').all()) assert(await link.isVisible(), name + ': secondary destination');
      }
      console.log('PASS shared header ' + name + ': all destinations and four viewport widths');
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(base + '/dashboard.html');
    await page.screenshot({ path: '.cache/feedback-header-desktop.png' });
    await page.setViewportSize({ width: 320, height: 900 });
    await page.screenshot({ path: '.cache/feedback-header-mobile.png' });
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
