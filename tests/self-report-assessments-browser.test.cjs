const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require(process.env.CEAM_PLAYWRIGHT_PATH||'playwright');
const base=process.env.CEAM_TEST_URL||'http://127.0.0.1:8765';
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const page=await context.newPage();const errors=[],posts=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(request.method()!=='GET')posts.push(request.url());});
  await page.goto(base+'/assessment-center.html');
  assert.equal(await page.locator('#self-report-catalogue [data-self-card]').count(),18);
  assert.equal(await page.locator('#ac-catalogue [data-assessment-card]').count(),13);
  await page.evaluate(()=>{localStorage.setItem('ceamplus.surveys.v1',JSON.stringify({schemaVersion:1,results:{},drafts:{}}));localStorage.setItem('ceamplus.assessment-center.v1',JSON.stringify({schemaVersion:1,results:{},drafts:{}}));});
  const prior=await page.evaluate(()=>[localStorage.getItem('ceamplus.surveys.v1'),localStorage.getItem('ceamplus.assessment-center.v1')]);
  const ids=await page.locator('[data-self-start]').evaluateAll(elements=>elements.map(item=>item.dataset.selfStart));
  for(const id of ids){
   await page.goto(base+'/assessment-center.html?selfReport='+id);
   await page.locator('#self-report-form').waitFor();
   for(const question of await page.locator('.self-report-question').all()){
    const radio=question.locator('input[type=radio][value="4"]');
    if(await radio.count())await radio.check();
    else if(await question.locator('input[type=checkbox]').count())await question.locator('input[type=checkbox]').first().check();
    else {const range=question.locator('input[type=range]');await range.focus();await range.press('End');await range.press('ArrowLeft');}
   }
   await page.locator('[name=self-initiative]').fill('Fictional integration check');
   await page.getByRole('button',{name:'Review Assessment',exact:true}).click();
   await page.locator('#self-report-save').waitFor();
   if(id.startsWith('self-report-'))assert.match(await page.locator('#self-report-workspace').innerText(),/No total readiness score/);
   else assert.match(await page.locator('#self-report-workspace').innerText(),/context discussion indicator/);
   await page.locator('#self-report-save').click();await page.locator('#self-report-save').click();
   assert.match(await page.locator('#self-report-status').innerText(),/saved in this browser/);
  }
  const records=await page.evaluate(()=>JSON.parse(localStorage.getItem('ceamplus.self-report-assessments.v1')).results);assert.equal(records.length,18);
  assert.deepEqual(await page.evaluate(()=>[localStorage.getItem('ceamplus.surveys.v1'),localStorage.getItem('ceamplus.assessment-center.v1')]),prior);
  await page.goto(base+'/dashboard.html');assert.equal(await page.locator('#self-report-history article').count(),18);
  await page.locator('#self-report-history').evaluate(element=>element.closest('details').open=true);
  const downloadEvent=page.waitForEvent('download');await page.locator('[data-self-download]').first().click();const download=await downloadEvent;const payload=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(payload.initiative,'Fictional integration check');assert(payload.answers);
  await page.locator('#self-report-history a').first().click();await page.locator('#self-report-save').waitFor();
  await page.locator('#self-report-edit').click();assert.equal(await page.locator('[name=self-initiative]').inputValue(),'Fictional integration check');
  fs.mkdirSync('.cache/self-report-review',{recursive:true});
  for(const width of [320,390,1024,1440]){
   await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'form overflow '+width);
  }
  await page.goto(base+'/assessment-center.html');
  for(const width of [1440,390]){await page.setViewportSize({width,height:1000});await page.locator('#self-report-title').scrollIntoViewIfNeeded();await page.screenshot({path:'.cache/self-report-review/assessments-'+width+'.png'});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
  await page.goto(base+'/surveys.html?context=education');assert.equal(await page.getByRole('link',{name:'Browse existing assessments',exact:true}).getAttribute('href'),'assessment-center.html#explore');
  assert.deepEqual(errors,[]);assert.deepEqual(posts,[]);
  const nojs=await browser.newContext({javaScriptEnabled:false});const fallback=await nojs.newPage();await fallback.goto(base+'/assessment-center.html#self-report-assessments');assert.match(await fallback.locator('#self-report-assessments').innerText(),/Enable JavaScript/);await nojs.close();
  console.log('PASS 18 integrated assessments: completion, unchanged context calculations, separate opt-in saves, idempotency, dashboard reopen/download, original history preservation, four widths, no-JS explanation and no submissions.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
