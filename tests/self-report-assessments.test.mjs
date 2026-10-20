import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {surveys} from '../js/surveys/definitions.mjs';
import {selfReportDefinitions,summarizeSelfReport,readSelfReports,saveSelfReport,SELF_REPORT_KEY} from '../js/assessments/self-report-model.mjs';
const sandbox={document:{querySelector:()=>null},window:{matchMedia:()=>({matches:true}),addEventListener(){}}};
vm.runInNewContext(fs.readFileSync(new URL('../script.js',import.meta.url),'utf8'),sandbox);
const engine=sandbox.window.CEAMAssessments;
const definitions=selfReportDefinitions(engine);
test('all 18 original questionnaires retain every question and use separate new identities',()=>{
  assert.equal(definitions.length,18);assert.equal(new Set(definitions.map(x=>x.id)).size,18);
  for(const definition of definitions){
    const source=definition.kind==='experience'?surveys.find(x=>x.id===definition.sourceId):engine.getAssessmentById(definition.sourceId);
    assert.deepEqual(definition.questions,source.questions);
    assert.notEqual(definition.id,source.id);
    assert.equal(definition.title,source.title);
  }
});
test('brief self-reports preserve categorical summaries without inventing aggregate scores',()=>{
  const definition=definitions[0];const answers=Object.fromEntries(definition.questions.map((q,i)=>[q.id,['4','2','unsure','na','3'][i]]));
  const result=summarizeSelfReport(definition,answers,engine);
  assert.equal(result.reportedStrengths.length,1);assert.equal(result.discussionNeeds.length,1);assert.equal(result.uncertain.length,1);assert.equal(result.notApplicable.length,1);assert.equal(result.answered,5);assert.equal(result.score,undefined);
});
test('context assessments preserve original calculation and explicit uncertainty handling',()=>{
  for(const definition of definitions.filter(x=>x.kind==='context')){
    const q=definition.questions.find(x=>x.type==='scale');const answers={[q.id]:q.reverse?1:4};
    const original=engine.buildAssessmentResult(definition.source,answers);
    const current=summarizeSelfReport(definition,answers,engine);
    assert.equal(current.score,original.score);assert.deepEqual(current.phaseScores,original.phaseScores);assert.deepEqual(current.recommendation,original.recommendation);
    assert.equal(summarizeSelfReport(definition,{[q.id+'_status']:'Uncertain'},engine).scoredAnswerCount,0);
  }
});
test('new saves are opt-in, idempotent and cannot alter either prior history namespace',()=>{
  const state=new Map([['ceamplus.surveys.v1','{"historical":"original bytes"}'],['ceamplus.assessment-center.v1','{"existing":"original bytes"}']]);
  const storage={getItem:key=>state.get(key)??null,setItem:(key,value)=>state.set(key,value)};
  assert.deepEqual(readSelfReports(storage).results,[]);assert(!state.has(SELF_REPORT_KEY));
  const record={id:'fixture',definition:definitions[0],answers:{},result:{kind:'experience'}};
  saveSelfReport(record,storage);saveSelfReport({...record,notes:'updated'},storage);
  assert.equal(readSelfReports(storage).results.length,1);
  assert.equal(state.get('ceamplus.surveys.v1'),'{"historical":"original bytes"}');assert.equal(state.get('ceamplus.assessment-center.v1'),'{"existing":"original bytes"}');
  state.set(SELF_REPORT_KEY,'damaged');assert.throws(()=>saveSelfReport(record,storage));assert.equal(state.get(SELF_REPORT_KEY),'damaged');
});
