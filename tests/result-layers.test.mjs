import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {assessments} from '../js/assessments/definitions.mjs';
import {aiUseDefinition} from '../js/assessments/ai-analysis-definition.mjs';
import {scoreAssessment} from '../js/assessments/scoring.mjs';
import {completion,buildResultLayers,compareResults,historicalChange,stakeholderDifferences} from '../js/assessments/result-layers.mjs';
import {saveResult,loadState,getHistory,STORAGE_KEY} from '../js/assessments/storage.mjs';
import {CORE_SCORING_VERSION,LEGACY_VERSION} from '../js/assessments/scoring-versions.mjs';
const definitions=[...assessments,aiUseDefinition];
const def={id:'test-layer',version:'1',title:'Test',dimensions:[{id:'d',title:'Conditions',weight:1,questions:[{id:'a',type:'maturity',weight:1,allowNA:true},{id:'b',type:'maturity',weight:1,allowNA:true},{id:'c',type:'maturity',weight:1,allowNA:true}],action:'Check observations.'}]};
const response={answers:{a:'5',b:'4',c:'3'},evidence:{d:{quality:'strong',source:'Declared records'}},completedAt:'2026-10-01T00:00:00Z',resultId:'first',context:'Team',initiative:'Trial'};
const memory=()=>{const map=new Map();return {map,getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value)};};
test('all 56 pre-change outputs retain identical substantive and evidence arithmetic',()=>{
 const fixtures=JSON.parse(fs.readFileSync(new URL('./fixtures/scoring-original.json',import.meta.url)));
 for(const fixture of fixtures){const definition=definitions.find(d=>d.id===fixture.id&&d.version===fixture.version);const {scoringVersion,...actual}=scoreAssessment(definition,fixture.response);assert.equal(scoringVersion,CORE_SCORING_VERSION);assert.deepEqual(actual,fixture.result,`${fixture.id}/${fixture.version}/${fixture.mode}`);}
});
test('all assessment questions, choices, maps, and tailoring sources remain byte-identical',()=>{
 const hashes=JSON.parse(fs.readFileSync(new URL('./fixtures/assessment-content-hashes.json',import.meta.url)));
 for(const [file,hash] of Object.entries(hashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL(`../js/assessments/${file}`,import.meta.url))).digest('hex'),hash,file);
});
test('completion distinguishes skipped uncertain invalid and not-applicable from explicit low answers',()=>{
 assert.deepEqual(completion(def,{answers:{a:'1',b:'na',c:'unsure'}}),{total:3,answered:1,applicable:2,skipped:0,notApplicable:1,uncertain:1,invalid:0,usablePercent:50});
 assert.equal(completion(def,{answers:{a:'garbage'}}).invalid,1);assert.equal(completion(def,{}).skipped,3);
});
test('minimum reporting evidence withholds conclusion without changing original numeric score',()=>{
 const sparse={answers:{a:'5'}};const result=scoreAssessment(def,sparse);const layer=buildResultLayers(def,sparse,result);
 assert.equal(result.overall,100);assert.equal(layer.substantive.original,100);assert.equal(layer.substantive.summary,null);assert.equal(layer.status,'Insufficient evidence');assert.equal(layer.dimensions[0].status,'Insufficient evidence');
 const na=buildResultLayers(def,{answers:{a:'na',b:'na',c:'na'}},scoreAssessment(def,{answers:{a:'na',b:'na',c:'na'}}));assert.equal(na.evidence.label,'Insufficient evidence');
});
test('evidence confidence remains separate and documentary claims must have notes or sources',()=>{
 const a=scoreAssessment(def,response);const weak={...response,evidence:{d:{quality:'strong'}}};
 assert.equal(scoreAssessment(def,weak).overall,a.overall);assert.equal(buildResultLayers(def,response,a).evidence.label,'Stronger evidence');assert.equal(buildResultLayers(def,weak,scoreAssessment(def,weak)).evidence.label,'Limited evidence');
 const conflict={...response,evidence:{d:{quality:'strong',source:'Records',contradiction:true}}};assert.equal(buildResultLayers(def,conflict,scoreAssessment(def,conflict)).evidence.label,'Limited evidence');
});
test('reporting discloses baseline and recency without fabricated weight or statistical claims',()=>{
 const layer=buildResultLayers(def,{...response,baseline:{locked:true,skipped:false,text:'Original human view'}},scoreAssessment(def,response),'2026-10-18');
 assert.equal(layer.evidence.ageDays,17);assert.match(layer.evidence.humanBaseline,/Recorded/);assert.equal(layer.evidence.statistical,false);assert.equal(layer.adoption.stage,null);assert(layer.signals.length);
});
test('new saves retain explicit versions original calculation and applicable count',()=>{
 const storage=memory();const result=scoreAssessment(def,response);const saved=saveResult(def,response,result,storage).record;
 assert.equal(saved.scoringVersion,CORE_SCORING_VERSION);assert.equal(saved.applicableQuestionCount,3);assert(saved.evidenceConfidenceMethod);assert(saved.interpretationVersion);assert.deepEqual(saved.originalCalculation.result,result);assert.equal(saved.createdAt,new Date(response.completedAt).toISOString());
});
test('explicit same-version response edits retain original and prior calculations, plan edits remain one administration',()=>{
 const storage=memory();const original=scoreAssessment(def,response);saveResult(def,response,original,storage);
 const edited={...response,answers:{a:'2',b:'2',c:'2'}};saveResult(def,edited,scoreAssessment(def,edited),storage);
 const record=getHistory(def,response,storage).history[0];assert.deepEqual(record.originalCalculation.result,original);assert.deepEqual(record.calculationRevisions[0].result,original);assert.equal(record.result.overall,25);assert.equal(getHistory(def,response,storage).history.length,1);
 saveResult(def,{...edited,actionPlan:[{owner:'Reviewer'}]},record.result,storage);assert.equal(getHistory(def,response,storage).history[0].calculationRevisions.length,1);
});
test('material scoring-version changes fork rather than overwrite historical result',()=>{
 const storage=memory();const result=scoreAssessment(def,response);const original=saveResult(def,response,result,storage).record;
 saveResult(def,response,{...result,scoringVersion:'reviewed-future-method',overall:12},storage);
 const history=getHistory(def,response,storage).history;assert.equal(history.length,2);assert.deepEqual(history.find(r=>r.id===original.id),original);assert.equal(compareResults(history[0],history[1]).comparable,false);
});
test('legacy reads never write or invent versions and version changes suppress numerical differences',()=>{
 const storage=memory();const {scoringVersion,...oldResult}=scoreAssessment(def,response);const record={id:'old',assessmentId:def.id,version:'1',createdAt:response.completedAt,response,result:oldResult};
 storage.setItem(STORAGE_KEY,JSON.stringify({schemaVersion:1,drafts:{},results:{legacy:[record]}}));const before=storage.getItem(STORAGE_KEY);loadState(storage);assert.equal(storage.getItem(STORAGE_KEY),before);
 const current={...record,id:'new',result:scoreAssessment(def,response),scoringVersion:CORE_SCORING_VERSION};assert.equal(compareResults(record,current).change,null);assert(compareResults(record,current).scoringVersions.includes(LEGACY_VERSION));
 assert.equal(compareResults(current,{...current,version:'2'}).comparable,false);
});
test('assessment-version changes preserve the prior record with a distinct result identity',()=>{
 const storage=memory();const original=saveResult(def,response,scoreAssessment(def,response),storage).record;
 const revised={...def,version:'2'};const later=saveResult(revised,response,scoreAssessment(revised,response),storage).record;
 assert.notEqual(later.id,original.id);assert.equal(later.sourceRecordId,original.id);assert.deepEqual(getHistory(def,response,storage).history[0],original);
 assert.equal(compareResults(original,later).change,null);
 saveResult(revised,response,scoreAssessment(revised,response),storage);assert.equal(getHistory(revised,response,storage).history.length,1);
});
test('history shows only compatible stored differences and evidence label changes',()=>{
 const storage=memory();const a=saveResult(def,response,scoreAssessment(def,response),storage).record;
 const next={...response,resultId:'second',completedAt:'2026-10-11T00:00:00Z',answers:{a:'5',b:'5',c:'5'},evidence:{}};const b=saveResult(def,next,scoreAssessment(def,next),storage).record;
 const change=historicalChange(b,[a,b]);assert.equal(change.days,10);assert.equal(change.change,25);assert.deepEqual(change.evidenceChange,['Stronger evidence','Limited evidence']);
 assert.equal(compareResults(a,{...b,tailoringSignature:'different'}).change,null);
});
test('stakeholder records do not become invented independent groups or sample sizes',()=>{
 const report=stakeholderDifferences([{context:'Employee',result:{overall:40}},{context:'Owner',result:{overall:90}}]);assert.equal(report.available,false);assert.equal(report.sampleSize,null);assert.deepEqual(report.groups,[]);assert(report.missing.includes('Employees'));
});
test('identity and personas never change substantive scores or reporting evidence',()=>{
 const changed={...response,persona:'mara',race:'fictional',gender:'fictional',age:70,disability:'fictional',income:0,location:'elsewhere'};
 assert.deepEqual(scoreAssessment(def,response),scoreAssessment(def,changed));assert.deepEqual(buildResultLayers(def,response,scoreAssessment(def,response),'2026-10-18'),buildResultLayers(def,changed,scoreAssessment(def,changed),'2026-10-18'));
});
test('blocked storage preserves current calculation and refuses persistence truthfully',()=>{
 const storage={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};const result=scoreAssessment(def,response);assert.equal(saveResult(def,response,result,storage).ok,false);assert.equal(result.overall,75);
});
