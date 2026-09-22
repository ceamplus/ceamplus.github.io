const assert=require('node:assert/strict');const fs=require('node:fs');
const {chromium}=require(process.env.CEAM_PLAYWRIGHT_PATH||'C:/Users/brigg/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const context=await browser.newContext();const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base=process.env.CEAM_TEST_URL||'http://127.0.0.1:8767';await page.goto(base+'/assessment-center.html?assessment=ai-adoption&mode=analysis');
 await page.locator('[data-ai-field="baseline.text"]').fill('Independent view: keep human judgment and test the sales claim.');await page.locator('#ai-lock').click();
 assert(await page.getByRole('heading',{name:'Check What Is Working',exact:true}).isVisible());
 assert.equal(await page.locator('[data-ai-field^="answers."]').count(),24);
 assert.equal(await page.locator('[maxlength]').count(),0);
 const input=path=>page.locator(`[data-ai-field="${path}"]`);
 await input('plainReview.activity').fill('Local shop advertising');await input('plainReview.goal').selectOption('More sales');
 assert(!/Revenue connected to advertising/.test(await page.locator('#ai-measurement-help').innerText()));
 await input('plainReview.adSpend').selectOption('Yes');assert.match(await page.locator('#ai-measurement-help').innerText(),/Revenue connected to advertising/);
 assert(await input('plainReview.contribution').isVisible());await input('plainReview.contribution').selectOption('Somewhat');
 await input('plainReview.howKnow').selectOption('I have strong evidence over time');await input('plainReview.know').fill('Sales increased, but the cause has not been checked.');
 await input('plainReview.goal').selectOption('More repeat customers');assert.match(await page.locator('#ai-measurement-help').innerText(),/Customers who stay/);assert(!/Revenue connected to advertising/.test(await page.locator('#ai-measurement-help').innerText()));
 const first=input('answers.ai-use-strategic-fit-1');await first.evaluate(el=>el.closest('details').open=true);await first.selectOption('4');
 assert.match(await first.locator('..').innerText(),/written down the problem/);
 // Keyboard-accessible native disclosure, explicitly labelled controls, no horizontal overflow.
 const help=page.getByText('Learn more: original questions and scoring',{exact:true}).first();await help.focus();await page.keyboard.press('Enter');assert(await help.evaluate(el=>el.parentElement.open));
 assert(await page.locator('#ac-workspace').evaluate(root=>[...root.querySelectorAll('input,select,textarea')].every(el=>!!el.closest('label')||!!el.getAttribute('aria-label'))));
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`form overflow ${width}`);}
 await page.locator('#ai-generate').click();assert.match(await page.locator('#ac-workspace').innerText(),/Low support/);
 assert.equal(await page.getByRole('heading',{name:'What to do next',exact:true}).count(),1);
 assert(!await page.getByRole('heading',{name:'AI Use & Adoption — Evidence Profile',exact:true}).isVisible());
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`report overflow ${width}`);}
 const download=page.waitForEvent('download');await page.locator('#ai-export').click();const exported=JSON.parse(fs.readFileSync(await(await download).path(),'utf8'));
 assert.equal(exported.response.plainReview.goal,'More repeat customers');assert.equal(exported.response.answers['ai-use-strategic-fit-1'],'4');assert.equal(exported.result.dimensions[0].score,4);assert.equal(exported.result.confidence,'Low');
 await page.goto(base+'/dashboard.html');await page.getByRole('link',{name:'Review Report & Action Plan',exact:true}).click();await page.locator('#ai-edit').click();await input('plainReview.next').fill('Ask customers why they stayed.');assert.equal(await input('plainReview.activity').inputValue(),'Local shop advertising');
 await page.reload();await page.getByRole('button',{name:'All Assessments',exact:true}).click();await page.getByRole('button',{name:'Resume AI Use & Case Analysis',exact:true}).click();assert.equal(await input('plainReview.goal').inputValue(),'More repeat customers');
 fs.mkdirSync('.cache/review-ui',{recursive:true});await page.setViewportSize({width:390,height:900});await page.locator('#ai-review-heading').scrollIntoViewIfNeeded();await page.screenshot({path:'.cache/review-ui/mobile.png'});
 assert.deepEqual(errors,[]);console.log('PASS guided review, contextual lessons, 24 items, unchanged scores, export, saved reopen, keyboard labels and mobile widths.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
