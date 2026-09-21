import test from 'node:test';
import assert from 'node:assert/strict';
import { aiUseDefinition, newAIAnalysis } from '../js/assessments/ai-analysis-definition.mjs';
import { analyzeAI, organizeCase, metricCategory, classifyEvidence, evidenceConfidence } from '../js/assessments/ai-analysis.mjs';
import { saveResult, getHistory } from '../js/assessments/storage.mjs';
import { getAssessment } from '../js/assessments/definitions.mjs';
test('Coca-Cola user-supplied metric fixture separates activity and engagement from outcomes',()=>{
  const state=newAIAnalysis();state.claims=[['120,000 pieces of social content','activity'],['more than seven minutes of platform interaction','engagement'],['300 million social impressions','engagement']].map(([metric,expected])=>{assert.equal(metricCategory(metric),expected);return {claim:'Creates loyalty',metric,metricType:expected,value:metric,classification:'Observed Evidence',sources:'User-supplied case excerpt',quality:'documented'};});
  const result=analyzeAI(state);assert.equal(result.gaps.length,3);assert(result.supported.every(s=>!s.finding.includes('Creates loyalty')));assert(result.gaps.every(g=>/does not establish sales/.test(g.finding)));assert.equal(result.overall,null);assert.equal(result.confidence,'Moderate');assert(result.unresolved.some(t=>/long-term outcome/.test(t)));
});
test('missing and proposed evidence cannot become observed facts or high confidence',()=>{
  assert.equal(classifyEvidence({classification:'Observed Evidence'}).classification,'Unknown');
  assert.equal(evidenceConfidence({classification:'Proposed Application',sources:'A\nB',objective:true,quality:'strong',metricType:'financial'}),'Low');
  assert.equal(evidenceConfidence({classification:'Observed Evidence',sources:'A\nA',objective:true,quality:'strong',metricType:'financial'}),'Moderate');
  assert.equal(evidenceConfidence({classification:'Observed Evidence',sources:'A\nB',objective:true,quality:'strong',metricType:'financial'}),'High');
  assert.equal(evidenceConfidence({classification:'Observed Evidence',sources:'A\nB',objective:true,quality:'strong',metricType:'financial',contradiction:true}),'Low');
});
test('case organization preserves exact lines and treats possibilities and negations cautiously',()=>{
  const text='Company: Example\nThe organization could use personalization.\nLoyalty was not measured.\n300 million social impressions.';
  const excerpts=organizeCase(text,'Teaching fixture');assert.equal(excerpts.length,4);assert.equal(excerpts[1].classification,'Proposed Application');assert.equal(excerpts[2].negative,true);assert.equal(excerpts[3].classification,'Unknown');assert.equal(excerpts[3].quote,'300 million social impressions.');assert.match(excerpts[3].sources,/line 4/);
});
test('unknown states produce no fabricated practice score, allocation or comparative verdict',()=>{
  const state=newAIAnalysis();const result=analyzeAI(state);assert(result.dimensions.every(d=>d.score===null));assert.equal(result.confidence,'Low');assert.equal(result.comparison,null);assert.equal(result.overall,null);assert(result.unresolved.length>=8);
});
test('practice scoring and response patterns preserve eight independent dimensions',()=>{
  const state=newAIAnalysis();for(const d of aiUseDefinition.dimensions)for(const q of d.questions)state.answers[q.id]=d.id==='marketing-value'?'5':'2';
  const result=analyzeAI(state);assert.equal(result.dimensions.find(d=>d.id==='marketing-value').score,5);assert.equal(result.dimensions.find(d=>d.id==='evidence').score,2);assert(result.noticed.some(t=>/High claimed marketing value/.test(t)));assert.equal(result.overall,null);
});
test('human necessity and stress tests identify missing accountability and fallback without forecasts',()=>{
  const state=newAIAnalysis();state.tasks=[{activity:'Customer dispute resolution',should:'No',lost:'Empathy and authority',matters:'Customer trust',allocation:'Human-essential'}];state.stress[0].assumption='Customers accept automation';const result=analyzeAI(state);assert.equal(result.tasks[0].recommendation,'Human-essential');assert(result.tasks[0].missing.includes('accountable'));assert.equal(result.stress[0].status,'Exposed / response incomplete');assert(result.recommendations.some(r=>r.id==='stress'));
});
test('baseline is independent, captured before analysis and comparison remains qualified',()=>{
  const state=newAIAnalysis();state.baseline={text:'Local customer experience matters.\nLong-term outcome evidence is missing.',locked:true,capturedAt:'2026-09-21T00:00:00Z',skipped:false};const before=structuredClone(state.baseline);const result=analyzeAI(state);assert.deepEqual(state.baseline,before);assert.equal(result.comparison.baseline,before.text);assert.match(result.comparison.limitations,/not proof/);assert.match(result.comparison.limitations,/No winner/);
});
test('analysis and old readiness results are separated by storage version and existing readiness is intact',()=>{
  assert.equal(getAssessment('ai-adoption').version,'1.0');assert.equal(getAssessment('ai-adoption').dimensions.length,16);
  const values=new Map();const storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)};
  const state=newAIAnalysis();state.initiative='Test';const result=analyzeAI(state);assert(saveResult(aiUseDefinition,state,result,storage).ok);assert.equal(getHistory(aiUseDefinition,state,storage).history.length,1);assert.equal(getHistory(getAssessment('ai-adoption'),state,storage).history.length,0);
});
test('task allocation neither infers human necessity from any text nor ignores contradictory answers',()=>{
  const state=newAIAnalysis();state.tasks=[{activity:'Sorting',lost:'None identified',matters:'Not established'},{activity:'Judgment',can:'No',should:'No',allocation:'AI-led'}];const result=analyzeAI(state);assert.equal(result.tasks[0].recommendation,'Unknown / Evidence Needed');assert.equal(result.tasks[1].recommendation,'Allocation conflict — review required');assert(result.unresolved.some(s=>/conflicts/.test(s)));
});
