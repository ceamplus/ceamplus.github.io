const assert=require('node:assert/strict');const fs=require('node:fs');
const {chromium}=require(process.env.CEAM_PLAYWRIGHT_PATH||'C:/Users/brigg/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.CEAM_TEST_URL||'http://127.0.0.1:8765';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/dashboard.html');
 await page.evaluate(async()=>{
  const {getAssessment}=await import('/js/assessments/definitions.mjs');const {scoreAssessment}=await import('/js/assessments/scoring.mjs');const {saveResult,STORAGE_KEY}=await import('/js/assessments/storage.mjs');
  const definition=getAssessment('marketing-readiness');
  for(const [id,when,sparse] of [['baseline','2026-10-01',false],['current','2026-10-11',false],['sparse','2026-10-12',true]]){
   const response={resultId:id,completedAt:when,context:'Organization',initiative:'Evidence review',answers:{},evidence:{},actionPlan:[],definitionSnapshot:definition};
   for(const d of definition.dimensions){response.evidence[d.id]={quality:'some',source:'Declared team records'};for(const q of d.questions)response.answers[q.id]=q.options?.[0]?.value||(q.type==='yes-partly-no'?'yes':q.type==='evidence'?'available':'4');}
   if(sparse)response.answers={[definition.dimensions[0].questions[0].id]:'5'};
   const saved=saveResult(definition,response,scoreAssessment(definition,response));if(!saved.ok)throw Error(saved.error);
  }
  const state=JSON.parse(localStorage.getItem(STORAGE_KEY));const source=Object.values(state.results).flat().find(r=>r.id==='baseline');const legacy={id:'legacy',assessmentId:source.assessmentId,version:source.version,createdAt:'2026-09-01T00:00:00.000Z',response:{...source.response,resultId:'legacy'},result:{...source.result}};delete legacy.result.scoringVersion;state.results.legacy=[legacy];localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
 });
 const snapshot=()=>page.evaluate(()=>localStorage.getItem('ceamplus.assessment-center.v1'));const saved=await snapshot();await page.reload();
 const layers=page.locator('[data-result-layers]');assert.match(await layers.innerText(),/Insufficient evidence/);assert.match(await layers.innerText(),/questions answered with usable responses/);
 for(const text of ['Dimensions and measurement status','Important drivers','Important uncertainties and evidence method','Signals to examine','Stakeholder differences','Change over time and comparability','Adoption interpretation','Original calculation and version record']){const summary=layers.getByText(text,{exact:true});await summary.focus();await page.keyboard.press('Enter');}
 assert.match(await layers.innerText(),/Sample size: unknown/);assert.match(await layers.innerText(),/Provisional/);assert.match(await layers.innerText(),/not risks proven/);assert.match(await layers.innerText(),/ceam-core-1.0/);
 assert.equal(await snapshot(),saved,'viewing layers never writes historical data');
 const downloadEvent=page.waitForEvent('download');await page.locator('#dashboard-download-result').click();const download=await downloadEvent;const payload=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(payload.scoringRecord.scoringVersion,'ceam-core-1.0');assert(payload.scoringRecord.originalCalculation);assert.equal(payload.result.overall,100,'sparse original numeric calculation retained');
 await page.locator('#dashboard-assessment').selectOption('1');await layers.getByText('Change over time and comparability',{exact:true}).click();assert.match(await layers.innerText(),/Days between: 10/);
 await page.locator('#dashboard-assessment').selectOption('3');await layers.getByText('Original calculation and version record',{exact:true}).click();assert.match(await layers.innerText(),/Legacy scoring version was not recorded/);assert.equal(await snapshot(),saved);
 await page.goto(base+'/assessment-center.html?result=baseline');await page.locator('[data-result-layers]').waitFor({state:'attached'});assert.equal(await snapshot(),saved,'reopening keeps originals');
 await page.goto(base+'/dashboard.html');fs.mkdirSync('.cache/scoring-verification',{recursive:true});
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow ${width}`);}
 await page.locator('[data-result-layers]').screenshot({path:'.cache/scoring-verification/layers-desktop.png'});
 assert.deepEqual(errors,[]);console.log('PASS layered Dashboard/report: sparse evidence, dimensions, drivers, warnings, history, legacy preservation, version exports, keyboard, and responsive layout.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
