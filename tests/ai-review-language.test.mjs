import test from 'node:test';
import assert from 'node:assert/strict';
import { aiUseDefinition,newAIAnalysis } from '../js/assessments/ai-analysis-definition.mjs';
import { analyzeAI } from '../js/assessments/ai-analysis.mjs';
import { dimensionLanguage,optionLabel,measurementLessons,lessonHTML,simpleResultsHTML } from '../js/assessments/ai-review-language.mjs';
import { calculateMetric } from '../js/analytics/metrics.mjs';
import { saveResult,getHistory } from '../js/assessments/storage.mjs';

test('plain wording covers all 24 original questions without replacing formal definitions',()=>{
  assert.equal(Object.keys(dimensionLanguage).length,8);
  for(const d of aiUseDefinition.dimensions){assert.equal(dimensionLanguage[d.id][1].length,d.questions.length);assert(d.measurement);for(const q of dimensionLanguage[d.id][1])assert(q.endsWith('?'));}
  assert.equal(optionLabel('Observed Evidence','claims.0.classification'),'What I know — recorded or measured');
  assert.equal(optionLabel('5','answers.ai-use-evidence-1'),'5 — Consistently supported');
});
test('guidance follows stated goals and reuses the existing metric definitions and calculations',()=>{
  assert.equal(measurementLessons({}).length,0);
  assert.equal(measurementLessons({goal:'More sales',adSpend:'No'}).some(x=>x.id==='roas'),false);
  const ads=measurementLessons({goal:'More sales',adSpend:'Yes'});assert.equal(ads[0].id,'roas');assert.match(lessonHTML(ads[0]),/not profit/);assert.match(lessonHTML(ads[0]),/Learn more/);
  assert.equal(measurementLessons({goal:'More leads'})[0].id,'conversion');
  assert.equal(measurementLessons({goal:'More repeat customers'})[0].id,'retention');
  assert.match(measurementLessons({goal:'More awareness'})[0].meaning,/Ask people/);
  assert.match(measurementLessons({goal:'More website visits'})[0].caution,/cannot tell you what caused/);
  assert.equal(calculateMetric('roas',{attributedRevenue:1500,adSpend:500}).result,3);
  assert.equal(calculateMetric('retention',{ending:110,newCustomers:20,beginning:100}).result,90);
});
test('unscored guided notes never change scores, classifications, confidence or analysis patterns',()=>{
  const before=newAIAnalysis();
  for(const [i,d] of aiUseDefinition.dimensions.entries()) for(const q of d.questions)before.answers[q.id]=String(i%5+1);
  before.claims=[{claim:'Customers stay longer',metric:'clicks',value:'300',metricType:'engagement',classification:'Observed Evidence',sources:'Sales log',quality:'documented'}];
  const after=structuredClone(before);after.plainReview={howKnow:'I have strong evidence over time',know:'I am certain sales improved',goal:'More sales',adSpend:'Yes',contribution:'Yes'};
  const a=analyzeAI(before),b=analyzeAI(after);delete a.generatedAt;delete b.generatedAt;assert.deepEqual(a,b);
  assert.equal(analyzeAI({...newAIAnalysis(),plainReview:after.plainReview}).confidence,'Low');
  const values=new Map(),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
  assert(saveResult(aiUseDefinition,after,b,storage).ok);
  assert.deepEqual(getHistory(aiUseDefinition,after,storage).history[0].response.plainReview,after.plainReview);
});
test('simple report supports old records, distinguishes notes from findings and escapes user text',()=>{
  const state=newAIAnalysis();state.plainReview={know:'<img src=x onerror=alert(1)>',goal:'More repeat customers'};
  const html=simpleResultsHTML(state,analyzeAI(state));
  for(const heading of ['What appears to be working','What you are assuming','What you still need to know','What to measure','What could go wrong','Where people matter','What to do next'])assert(html.includes(`<h3>${heading}</h3>`));
  assert(!html.includes('<img'));assert.match(html,/your note, not independently checked/);assert.match(html,/Low support/);
  assert.doesNotThrow(()=>simpleResultsHTML(newAIAnalysis(),analyzeAI(newAIAnalysis())));
});
