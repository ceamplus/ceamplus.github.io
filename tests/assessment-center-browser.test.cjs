const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.CEAM_PLAYWRIGHT_PATH || 'C:/Users/brigg/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.CEAM_TEST_URL || 'http://127.0.0.1:8765';
const storageKey = 'ceamplus.assessment-center.v1';
const screenshots = process.env.CEAM_SCREENSHOT_DIR;

(async()=>{
  const { assessments } = await import('../js/assessments/definitions.mjs');
  const browser = await chromium.launch({channel:'msedge',headless:true});
  try {
    const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
    const page=await context.newPage();
    const errors=[],external=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
    page.on('request',request=>{if(!request.url().startsWith(base)&&!request.url().startsWith('blob:')&&!request.url().startsWith('data:'))external.push(request.url());});
    const state=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'{"drafts":{},"results":{}}'),storageKey);
    const card=id=>page.locator(`[data-assessment-card="${id}"]`);
    await page.goto(`${base}/assessment-center.html`);
    assert.equal(await page.locator('[data-assessment-card]').count(),assessments.length);
    await page.getByRole('button',{name:'Data & Technology',exact:true}).click();
    assert.equal(await page.locator('[data-assessment-card]').count(),2);
    await page.getByRole('button',{name:'All',exact:true}).click();
    await card('marketing-readiness').getByText('Learn More',{exact:true}).click();
    assert.match(await card('marketing-readiness').innerText(),/What evidence helps/);
    await page.getByRole('button',{name:'Recommended for me',exact:true}).click();
    await page.locator('[name=goal]').selectOption('ai');
    await page.getByRole('button',{name:'Recommend Assessments',exact:true}).click();
    assert.match(await page.locator('#ac-recommendations').innerText(),/AI Adoption Readiness/);
    assert((await page.locator('#ac-recommendations li').count())<=3);
    for(const width of [320,390,768,1440]){
      await page.setViewportSize({width,height:1000});
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`landing overflow at ${width}`);
    }
    if(screenshots){fs.mkdirSync(screenshots,{recursive:true});await page.screenshot({path:path.join(screenshots,'assessment-center-desktop.png'),fullPage:true});}

    // Every entry loads its own complete definition and can report unknowns.
    for(const def of assessments.filter(item=>item.id!=='marketing-assessment')){
      await page.goto(`${base}/assessment-center.html?assessment=${def.id}`);
      await page.getByRole('button',{name:'Begin Assessment',exact:true}).click();
      assert((await page.locator('[data-step]').count())>=def.dimensions.length,def.id);
      await page.locator('.ac-question').first().locator('input[value="unsure"]').check();
      await page.getByRole('button',{name:'Review Available Responses',exact:true}).click();
      if(def.id==='financial-marketing')await page.getByRole('button',{name:'Generate Assessment Report',exact:true}).click();
      assert.match(await page.locator('.ac-result-hero').innerText(),/Insufficient responses/);
      assert.match(await page.locator('.ac-result-hero').innerText(),/Unknown: 1/);
      assert.equal(await page.locator('.ac-bar-row').count(),await page.locator('table').first().locator('tbody tr').count());
    }
    assert.equal(Object.keys((await state()).results).length,0,'no saving without opt-in');

    await page.goto(`${base}/assessment-center.html`);
    await page.getByRole('button',{name:'Try a Demo Assessment',exact:true}).click();
    assert.match(await page.locator('.ac-demo').innerText(),/Fictional/);
    assert.match(await page.locator('#ac-workspace').innerText(),/Restaurant/);
    assert.equal(Object.keys((await state()).results).length,0,'demo excluded from history');
    await page.getByRole('button',{name:'Create Action Plan',exact:true}).click();
    await page.locator('[data-field=owner]').first().fill('Fictional reviewer');
    await page.locator('[data-field=owner]').first().press('Tab');
    assert.equal(Object.keys((await state()).results).length,0,'demo plan excluded from history');
    await page.getByRole('button',{name:'Copy Summary',exact:true}).click();
    assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/FICTIONAL DEMO/);
    const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Download Result JSON',exact:true}).click()]);
    const json=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
    assert.equal(json.response.demo,true);assert.equal(json.assessment.id,'marketing-readiness');assert(json.response.actionPlan.length);
    if(screenshots)await page.screenshot({path:path.join(screenshots,'assessment-results-desktop.png'),fullPage:true});
    await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
    assert.equal(await page.locator('#ac-workspace details:not([open])').count(),0);
    await page.emulateMedia({media:'print'});
    assert.equal(await page.locator('#center-intro').isVisible(),false);
    assert.equal(await page.locator('.ac-print-value').first().isVisible(),true);
    if(screenshots)await page.pdf({path:path.join(screenshots,'assessment-demo-report.pdf'),format:'A4',printBackground:true});
    await page.emulateMedia({media:'screen'});await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
    for(const width of [320,390,768,1440]){
      await page.setViewportSize({width,height:900});
      const layout=await page.evaluate(()=>({ok:document.documentElement.scrollWidth<=innerWidth+1,scrollWidth:document.documentElement.scrollWidth,innerWidth,wide:[...document.querySelectorAll('body *')].filter(el=>{const r=el.getBoundingClientRect();return r.right>innerWidth+1||r.left<-1;}).slice(0,8).map(el=>({tag:el.tagName,class:el.className,text:(el.textContent||'').trim().slice(0,50),left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,scroll:el.scrollWidth,parent:el.parentElement?.className})),containers:[...document.querySelectorAll('body *')].filter(el=>el.scrollWidth>el.clientWidth+1).slice(0,12).map(el=>({tag:el.tagName,class:el.className,client:el.clientWidth,scroll:el.scrollWidth,overflow:getComputedStyle(el).overflowX,children:[...el.children].map(c=>({tag:c.tagName,class:c.className,client:c.clientWidth,scroll:c.scrollWidth,right:c.getBoundingClientRect().right,text:(c.textContent||'').trim().slice(0,35)}))}))}));
      assert(layout.ok,`report overflow at ${width}: ${JSON.stringify(layout)}`);
    }

    // Tailoring changes labels, modules and actions; size never pre-scores maturity.
    await page.goto(`${base}/assessment-center.html?assessment=marketing-readiness`);
    await page.locator('[data-profile=industry]').selectOption({label:'Restaurant / Food Service'});
    await page.locator('[data-profile=size]').selectOption({label:'Microbusiness: 1–9 employees'});
    await page.locator('[data-profile=department]').selectOption('marketing');
    assert((await page.locator('[data-profile=objective] option').count())>=17);
    await page.locator('#ac-initiative').fill('Local loyalty test');
    await page.locator('#ac-saving').check();
    await page.getByRole('button',{name:'Begin Assessment',exact:true}).click();
    await page.locator('.ac-question input[value="4"]').first().check();
    await page.locator('#ac-evidence-quality').selectOption('strong');
    await page.locator('#ac-evidence-source').fill('<img src=x onerror=alert(1)> Fictional source');
    await page.locator('#ac-evidence-note').fill('Browser test evidence, not a real record.');
    await page.reload();
    await page.getByRole('button',{name:'All Assessments',exact:true}).click();
    await page.locator('[data-resume]').first().click();
    await page.getByRole('button',{name:'Continue Assessment',exact:true}).click();
    assert.equal(await page.locator('.ac-question input[value="4"]').first().isChecked(),true);
    assert.equal(await page.locator('#ac-evidence-quality').inputValue(),'strong');
    assert.match(await page.locator('#ac-evidence-source').inputValue(),/Fictional source/);
    for(const width of [320,390,768,1440]){
      await page.setViewportSize({width,height:900});
      const questionLayout=await page.evaluate(()=>({ok:document.documentElement.scrollWidth<=innerWidth+1,scrollWidth:document.documentElement.scrollWidth,innerWidth,containers:[...document.querySelectorAll('body *')].filter(el=>el.scrollWidth>el.clientWidth+1).slice(0,12).map(el=>({tag:el.tagName,class:el.className,client:el.clientWidth,scroll:el.scrollWidth,overflow:getComputedStyle(el).overflowX,text:(el.textContent||'').trim().slice(0,50)}))}));
      assert(questionLayout.ok,`questions overflow at ${width}: ${JSON.stringify(questionLayout)}`);
    }
    const count=await page.locator('[data-step]').count();
    for(let i=0;i<count;i++){
      await page.locator(`[data-step="${i}"]`).click();
      for(const fieldset of await page.locator('.ac-question').all()){
        const preferred=fieldset.locator('input[value="4"],input[value="yes"],input[value="available"]').first();
        if(await preferred.count())await preferred.check();else await fieldset.locator('input[type=radio]').first().check();
      }
      await page.locator('#ac-evidence-quality').selectOption('some');
    }
    await page.getByRole('button',{name:'Review Available Responses',exact:true}).click();
    let records=Object.values((await state()).results).flat();
    assert.equal(records.length,1);assert.equal(Object.keys((await state()).drafts).length,0);
    assert(records[0].response.tailoringSignature);assert(records[0].response.definitionSnapshot);
    assert.equal(records[0].result.coverage,100);
    await page.getByRole('button',{name:'Create Action Plan',exact:true}).click();
    await page.locator('[data-field=owner]').first().fill('Review owner');await page.locator('[data-field=owner]').first().press('Tab');
    await page.locator('[data-field=status]').first().selectOption('In Progress');
    records=Object.values((await state()).results).flat();
    assert.equal(records.length,1,'plan edits do not create follow-ups');
    assert.equal(records[0].response.actionPlan[0].status,'In Progress');
    const baseline=records[0];
    await page.getByRole('button',{name:'Start Follow-Up',exact:true}).click();
    await page.getByRole('button',{name:'Begin Assessment',exact:true}).click();
    await page.locator('.ac-question input[value="5"]').first().check();
    await page.getByRole('button',{name:'Review Available Responses',exact:true}).click();
    records=Object.values((await state()).results).flat();assert.equal(records.length,2);
    assert.match(await page.locator('#ac-comparison').innerText(),/2 comparable saved results/);
    assert.match(await page.locator('#ac-comparison').innerText(),/Follow-Up/);
    await page.getByRole('button',{name:'Reset Current Assessment',exact:true}).click();
    assert.equal(await page.getByRole('button',{name:'Begin Assessment',exact:true}).count(),1);
    assert.equal(Object.values((await state()).results).flat().length,2,'reset retains baselines');

    await page.goto(`${base}/dashboard.html`);
    assert.match(await page.locator('#saved-assessment-dashboard').innerText(),/Marketing Readiness/);
    await page.locator('#dashboard-assessment').selectOption('1');
    assert.match(await page.locator('#saved-assessment-dashboard').innerText(),/In Progress/);
    assert.match(await page.locator('#saved-assessment-dashboard').innerText(),/Review owner/);
    await page.getByRole('link',{name:'Review Report & Action Plan',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('#ac-workspace')?.textContent.includes('Local loyalty test'));
    assert.match(await page.locator('#ac-workspace').innerText(),/Local loyalty test/);
    assert.equal(await page.locator('[data-field=owner]').first().inputValue(),'Review owner');
    assert.equal(await page.locator('img[src=x]').count(),0,'evidence is escaped, not interpreted as markup');

    // Numbers calculate independently from an otherwise unscored financial profile.
    await page.goto(`${base}/assessment-center.html?assessment=financial-marketing`);
    await page.getByRole('button',{name:'Begin Assessment',exact:true}).click();
    await page.getByRole('button',{name:'Review Available Responses',exact:true}).click();
    for(const [key,value] of Object.entries({revenue:'1200',previousRevenue:'1000',cogs:'700',acquisitionCost:'200',newCustomers:'10'})){
      const input=page.locator(`[name="${key}"]`);
      await input.evaluate(element=>{element.closest('details').open=true;});
      await input.fill(value);
    }
    await page.getByRole('button',{name:'Generate Assessment Report',exact:true}).click();
    assert.match(await page.locator('.ac-result-hero').innerText(),/Insufficient responses/);
    const financialTable=page.locator('table').filter({has:page.locator('caption').filter({hasText:'Calculations from supplied business values'})});
    assert.match(await financialTable.innerText(),/20/);assert.match(await financialTable.innerText(),/Not calculated/);
    assert.equal(external.length,0,`unexpected external requests: ${external.join(', ')}`);
    assert.deepEqual(errors,[]);
    console.log('PASS assessment center: all 12 entries, categories/wizard, tailoring, uncertainty, demo, charts, consent, resume, full baseline, action upserts, follow-up, dashboard, export/print, financial metrics, responsive layouts, escaped evidence, and local-only requests.');
    // Browser storage denial must leave the application usable.
    const denied=await context.newPage();
    await denied.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new DOMException('Blocked in test','QuotaExceededError');};});
    await denied.goto(`${base}/assessment-center.html?assessment=personal-change`);
    await denied.locator('#ac-saving').check();
    assert.match(await denied.locator('#ac-status').innerText(),/unavailable/);
    await denied.getByRole('button',{name:'Begin Assessment',exact:true}).click();
    await denied.getByRole('button',{name:'Review Available Responses',exact:true}).click();
    assert(await denied.locator('#ac-download').isVisible());
    console.log('PASS storage failure retains an exportable current-tab report.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
