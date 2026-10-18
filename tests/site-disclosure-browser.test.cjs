const assert = require('node:assert/strict');
const { chromium } = require(process.env.CEAM_PLAYWRIGHT_PATH || 'C:/Users/brigg/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.CEAM_TEST_URL || 'http://127.0.0.1:8765';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const route of ['research.html','framework.html','index.html','about.html','values.html','change-consulting.html','sustainability.html','marketing.html','ai-technology.html']) {
    await page.goto(`${base}/${route}`, { waitUntil: 'domcontentloaded' });
    const disclosures = page.locator('details[data-site-disclosure]');
    assert(await disclosures.count() >= 2, route);
    assert.equal(await page.locator('details[data-site-disclosure][open]').count(), 0, `${route}: concise by default`);
    const summary = disclosures.first().locator(':scope > summary');
    await summary.focus();
    await page.keyboard.press('Enter');
    assert.equal(await disclosures.first().getAttribute('open'), '');
    await page.getByRole('button', { name: 'Expand all topics', exact: true }).click();
    assert.equal(await page.locator('details[data-site-disclosure][open]').count(), await disclosures.count());
    await page.getByRole('button', { name: 'Collapse all topics', exact: true }).click();
    assert.equal(await page.locator('details[data-site-disclosure][open]').count(), 0);
    for (const width of [320,390,768,1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${route}: overflow at ${width}px`);
    }
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/research.html`, { waitUntil: 'domcontentloaded' });
  const researchAreas = page.locator('main > details.research-area');
  const researchTopics = page.locator('details.research-area details[data-site-disclosure]');
  assert.equal(await researchAreas.count(), 5, 'research is partitioned into five high-level areas');
  assert(await researchTopics.count() >= 20, 'full research is divided into individual expandable topics');
  assert.equal(await page.locator('main details[open]').count(), 0, 'all research areas and topics start closed');
  assert(await researchAreas.first().locator('details[data-site-disclosure]').first().locator(':scope > summary').isHidden(), 'topic rows stay hidden until their area is selected');
  await researchAreas.first().locator(':scope > summary').click();
  assert.equal(await page.locator('main > details.research-area[open]').count(), 1, 'one research area opens independently');
  assert.equal(await researchAreas.first().locator('details[data-site-disclosure][open]').count(), 0, 'opening an area does not dump every topic body');
  const firstResearchTopic = researchAreas.first().locator('details[data-site-disclosure]').first();
  await firstResearchTopic.locator(':scope > summary').click();
  assert.equal(await firstResearchTopic.getAttribute('open'), '', 'a visitor can expand one research topic');
  assert(await firstResearchTopic.locator('.site-disclosure-body').isVisible(), 'the selected topic content is revealed');
  await page.getByRole('link', { name: /2\. Evidence & measurement/ }).click();
  assert.equal(await page.locator('#research-evidence').getAttribute('open'), '', 'the compact directory opens the selected research area');

  for (const [route, id] of [['research.html','evidence'],['research.html','conceptual-core'],['research.html','ai-reliance'],['values.html','philosophy'],['index.html','problems'],['about.html','applied-research-title']]) {
    await page.goto(`${base}/${route}#${id}`, { waitUntil: 'domcontentloaded' });
    assert(await page.locator(`[id="${id}"]`).isVisible(), `${route}#${id}: old hash target revealed`);
    assert(await page.locator(`[id="${id}"]`).evaluate(node => { for(let p=node;p;p=p.parentElement)if(p.tagName==='DETAILS'&&!p.open)return false;return true; }));
  }

  await page.goto(`${base}/research.html`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { location.hash = '#trusted-signals'; });
  await page.waitForFunction(() => document.getElementById('trusted-signals').closest('details').open);
  const before = await page.locator('main details').evaluateAll(nodes => nodes.map(node => node.open));
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  assert.equal(await page.locator('main details:not([open])').count(), 0, 'print reveals nested research propositions');
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  assert.deepEqual(await page.locator('main details').evaluateAll(nodes => nodes.map(node => node.open)), before, 'print restores the prior reading state');

  for (const route of ['surveys.html','assessments.html']) {
    await page.goto(`${base}/${route}?context=business`, { waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('details[data-site-disclosure][open]').count(), 0);
    for (const selector of ['[data-organization-select]','[data-start-assessment]','.assessment-integrity-note','.assessment-safeguards','.survey-submission-note','.survey-journey']) assert(await page.locator(selector).isVisible(), `${route}: ${selector} remains visible`);
    assert(await page.locator('.survey-journey').innerText().then(text => text.includes('Surveys → Assessment → Dashboard → Action')));
    await page.locator('[data-start-assessment]').click();
    assert.equal(await page.locator('.guided-question').count(),58);
    assert.equal(await page.locator('details[data-site-disclosure][open]').count(),0,'starting surveys leaves optional explanations closed');
  }

  const native = await browser.newPage({ javaScriptEnabled: false });
  await native.goto(`${base}/framework.html`, { waitUntil: 'domcontentloaded' });
  assert(!(await native.locator('[data-disclosure-toolbar]').isVisible()));
  const first = native.locator('details[data-site-disclosure]').first();
  await first.locator(':scope > summary').click();
  assert.equal(await first.getAttribute('open'),'','native disclosures work without JavaScript');
  await native.close();
  assert.deepEqual(errors,[]);
  await browser.close();
  console.log('PASS progressive disclosure: preserved routes, native keyboard toggles, topic controls, deep links, nested print/restore, visible survey controls/safeguards, no-JavaScript fallback and mobile layout.');
})().catch(error => { console.error(error); process.exit(1); });
