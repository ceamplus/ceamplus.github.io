const assert=require('node:assert/strict');
const {chromium}=require(process.env.CEAM_PLAYWRIGHT_PATH||'C:/Users/brigg/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.CEAM_TEST_URL||'http://127.0.0.1:8765';
const fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}});await context.route('https://fonts.googleapis.com/**',route=>route.fulfill({status:200,contentType:'text/css',body:''}));const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  await page.goto(base+'/marketing.html');await page.getByRole('link',{name:'Start Marketing Assessment',exact:true}).click();
  assert.match(await page.locator('#marketing-scale').innerText(),/Consistently/);await page.locator('#ac-saving').check();await page.getByRole('button',{name:'Begin Assessment',exact:true}).click();
  const {getAssessment}=await import('../js/assessments/definitions.mjs');const questions=getAssessment('marketing-assessment').dimensions.flatMap(d=>d.questions);assert.equal(questions.length,40);
  for(let i=0;i<40;i++){assert.match(await page.locator('#ac-workspace h2').innerText(),new RegExp(`Question ${i+1} of 40`));assert.equal(await page.locator('.ac-question legend').innerText(),questions[i].text);await page.locator('.ac-question input[value="2"]').check();await page.locator('.ac-question input[value="4"]').check();assert(await page.locator('.ac-question input[value="4"]').isChecked());if(i<39)await page.getByRole('button',{name:'Next Question',exact:true}).click();}
  await page.getByRole('button',{name:'Previous Question',exact:true}).click();assert(await page.locator('.ac-question input[value="4"]').isChecked());await page.locator('.ac-question input[value="1"]').check();await page.getByRole('button',{name:'Next Question',exact:true}).click();await page.getByRole('button',{name:'Review All Responses',exact:true}).click();assert.equal(await page.getByRole('button',{name:/Change response/}).count(),40);
  await page.getByRole('button',{name:'Generate Marketing Capability Profile',exact:true}).click();assert.equal(await page.locator('.mk-profile-table tbody tr').count(),8);assert.match(await page.locator('.mk-overall').innerText(),/3.9/);
  await page.getByRole('button',{name:'Create Measurable Action Plan',exact:true}).click();assert.equal(await page.locator('[data-field=owner]').count(),3);await page.locator('[data-field=owner]').first().fill('Test owner');await page.locator('[data-field=owner]').first().press('Tab');
  await page.getByRole('button',{name:'Start Follow-Up',exact:true}).click();
  await page.getByRole('button',{name:'Begin Assessment',exact:true}).click();
  for(let i=0;i<40;i++){await page.locator('.ac-question input[value="5"]').check();if(i<39)await page.getByRole('button',{name:'Next Question',exact:true}).click();}
  await page.getByRole('button',{name:'Review All Responses',exact:true}).click();
  await page.getByRole('button',{name:'Generate Marketing Capability Profile',exact:true}).click();
  assert.match(await page.locator('#ac-comparison').innerText(),/2 comparable saved results/);
  assert.match(await page.locator('#ac-comparison').innerText(),/capability score points/);
  for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`marketing report overflow ${width}`);}
  fs.mkdirSync('.cache/marketing-update',{recursive:true});await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:'.cache/marketing-update/marketing-report.png',fullPage:false});
  await page.getByRole('link',{name:'Open Dashboard',exact:true}).click();assert.match(await page.locator('#dashboard-assessment-detail').innerText(),/out of 5/);await page.getByRole('link',{name:'Analyze Business Data',exact:true}).click();assert.match(await page.locator('#lab-marketing-profile').innerText(),/Marketing Capability Profile/);
  await page.goto(base+'/assessment-center.html?assessment=ai-adoption');await page.getByRole('button',{name:'AI Use & Case Analysis',exact:true}).click();
  await page.locator('[data-ai-field="caseInfo.company"]').fill('Coca-Cola teaching fixture');await page.locator('[data-ai-field="caseInfo.source"]').fill('User-supplied case fixture, not independently verified');await page.locator('[data-ai-field="caseInfo.text"]').fill('AI-assisted advertising generated more than 120,000 pieces of social content.\nPlatform interaction exceeded seven minutes.\nApproximately 300 million social impressions.\nLoyalty was not measured.');
  await page.locator('[data-ai-field="baseline.text"]').fill('Impressions and content volume do not demonstrate loyalty. Human creative judgment remains important.');assert.equal(await page.locator('#ai-generate').count(),0);await page.getByRole('button',{name:'Save & Lock Human Baseline',exact:true}).click();assert(await page.locator('[data-ai-field="baseline.text"]').getAttribute('readonly')!==null);
  await page.getByRole('button',{name:'Organize Case Excerpts',exact:true}).click();
  await page.locator('[data-ai-add=claims]').evaluate(el=>el.closest('details').open=true);await page.locator('[data-ai-add=claims]').click();await page.locator('[data-ai-field="claims.0.claim"]').evaluate(el=>el.closest('details').open=true);
  await page.locator('[data-ai-field="claims.0.claim"]').fill('Improves loyalty');await page.locator('[data-ai-field="claims.0.metric"]').fill('Social impressions');await page.locator('[data-ai-field="claims.0.metricType"]').selectOption('engagement');await page.locator('[data-ai-field="claims.0.value"]').fill('300 million impressions');await page.locator('[data-ai-field="claims.0.classification"]').selectOption('Observed Evidence');await page.locator('[data-ai-field="claims.0.sources"]').fill('Case fixture, line 3');
  await page.locator('#ai-saving').check();await page.getByRole('button',{name:'Generate CEAM+ Structured Analysis',exact:true}).click();assert.match(await page.locator('#ac-workspace').innerText(),/does not establish sales/);assert.match(await page.locator('#ac-workspace').innerText(),/What We Do Not Know/);assert.equal(await page.locator('#ac-workspace table tbody tr').count(),8);
  for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`AI report overflow ${width}`);}
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:'.cache/marketing-update/ai-report.png',fullPage:false});
  const comparison=page.locator('details').filter({has:page.locator('summary',{hasText:'Human Baseline vs. CEAM+'})}).first();await comparison.locator('summary').click();
  assert.match(await comparison.innerText(),/Impressions and content volume do not demonstrate loyalty/);
  await page.getByRole('button',{name:'Start Follow-Up',exact:true}).click();
  await page.getByRole('button',{name:'Continue Without Comparison',exact:true}).click();
  await page.getByRole('button',{name:'Generate CEAM+ Structured Analysis',exact:true}).click();
  assert.match(await page.locator('#ac-workspace').innerText(),/Same analysis version, context and initiative/);
  await page.getByRole('link',{name:'Open Dashboard',exact:true}).click();assert.match(await page.locator('#dashboard-assessment-detail').innerText(),/no overall AI score/i);await page.getByRole('link',{name:'Review Report & Action Plan',exact:true}).click();assert.match(await page.locator('#ac-workspace h2').innerText(),/AI Use/);
  await page.getByRole('button',{name:'All Assessments',exact:true}).click();assert.equal(await page.locator('[data-assessment-card]').count(),13);
  await page.getByRole('link',{name:'Corporate & Organizational Readiness',exact:true}).click();
  assert.match(page.url(),/assessment=organizational-readiness/);
  await page.getByRole('button',{name:'Begin Assessment',exact:true}).click();
  assert(await page.locator('.ac-question').count()>0);
  await page.goto(base+'/assessment-center.html?assessment=ai-adoption&mode=analysis');
  await page.locator('#ai-case-file').setInputFiles({name:'fixture.txt',mimeType:'text/plain',buffer:Buffer.from('Company: Fixture\n300 million social impressions. Loyalty was not measured.')});
  await page.waitForFunction(()=>document.querySelector('[data-ai-field="caseInfo.text"]')?.value.includes('300 million'));
  await page.getByRole('button',{name:'Continue Without Comparison',exact:true}).click();
  const assumption=page.locator('[data-ai-field="stress.0.assumption"]');await assumption.evaluate(el=>{let p=el.parentElement;while(p){if(p.tagName==='DETAILS')p.open=true;p=p.parentElement;}});await assumption.fill('Customers welcome automated service');
  await page.getByRole('button',{name:'Generate CEAM+ Structured Analysis',exact:true}).click();
  const stress=page.locator('details').filter({has:page.locator('summary',{hasText:'Black Swan / Assumption Stress Test'})}).first();await stress.locator('summary').first().click();assert.match(await stress.innerText(),/Exposed \/ response incomplete/);
  const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Download Analysis JSON',exact:true}).click()]);const payload=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(payload.response.baseline.skipped,true);assert.equal(payload.result.comparison,null);assert(payload.result.dimensions.every(d=>d.score===null));
  await page.getByRole('button',{name:'Start Follow-Up',exact:true}).click();assert.equal(await page.locator('[data-ai-field="baseline.text"]').inputValue(),'');assert.equal(await page.locator('#ai-generate').count(),0);
  assert.deepEqual(errors,[]);console.log('PASS live follow-up comparisons, corporate entry, 40 exact editable marketing questions, scores, reports, action plans, dashboard/Lab; AI case, locked human baseline, evidence gaps, saved reopen, mobile and no console errors.');
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exit(1);});