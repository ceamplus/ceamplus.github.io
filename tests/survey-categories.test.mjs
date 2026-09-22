import test from 'node:test';
import assert from 'node:assert/strict';
import { assessments } from '../js/assessments/definitions.mjs';
import { surveys, surveyCategories, surveyScale, summarizeSurvey } from '../js/surveys/definitions.mjs';
test('surveys match every assessment and category without adding AI to other domains',()=>{
  assert.equal(surveys.length,13);
  assert.deepEqual(surveys.map(s=>s.assessmentId),assessments.map(a=>a.id));
  assert.deepEqual(surveyCategories,[...new Set(assessments.map(a=>a.category))]);
  for(const s of surveys){assert.equal(s.questions.length,5);assert.equal(new Set(s.questions.map(q=>q.id)).size,5);assert.match(s.validationStatus,/not validated/);for(const q of s.questions){assert(q.construct&&q.text);if(s.assessmentId!=='ai-adoption')assert(!/\bAI\b/i.test(q.text));}}
});
test('responses stay separate from organizational capability scores and missing data is explicit',()=>{
  const s=surveys[0];const values=['5','2','unsure','na','invalid'];const r=summarizeSurvey(s,Object.fromEntries(s.questions.map((q,i)=>[q.id,values[i]])));
  assert.equal(r.answered,4);assert.equal(r.reportedStrengths.length,1);assert.equal(r.discussionNeeds.length,1);assert.equal(r.uncertain.length,1);assert.equal(r.notApplicable.length,1);assert.equal(r.unanswered.length,1);assert.equal(r.score,undefined);assert.deepEqual(r.dimensions,[]);assert.equal(surveyScale.length,7);
});
