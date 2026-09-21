import test from 'node:test';
import assert from 'node:assert/strict';
import { getAssessment } from '../js/assessments/definitions.mjs';
import { industries, sizes, departments, objectivesFor, defaultProfile, sanitizeProfile, profileSignature, profileLabel, tailorAssessment } from '../js/assessments/personalization.mjs';
import { scoreAssessment } from '../js/assessments/scoring.mjs';

test('configuration exposes every requested organization, size and department option', () => {
  assert.equal(industries.length, 15);
  assert.deepEqual(industries.map(x=>x.label), ['Restaurant / Food Service','Retail','E-commerce','Professional Services','Construction / Skilled Trades','Manufacturing','Hospitality / Tourism','Healthcare','Financial Services','Technology / SaaS','Education','Nonprofit','Government / Public Sector','Corporate / Multi-Department Organization','Other']);
  assert.equal(sizes.length, 5);
  assert(sizes.some(x=>x.label==='Microbusiness: 1–9 employees'));
  for (const label of ['Whole Organization','Marketing','Sales','Customer Experience','Human Resources / People','Operations','Finance','Leadership / Strategy','Technology / AI']) assert(departments.some(x=>x.label===label), label);
});

test('objectives are dynamic and marketing is a fully developed demonstration bank', () => {
  const restaurant=objectivesFor('marketing','restaurant');
  const finance=objectivesFor('finance','restaurant');
  assert(restaurant.length>=17);
  for (const label of ['Marketing Readiness','Customer Insights','Customer Segmentation','Brand Positioning','Campaign Effectiveness','Marketing Analytics','Marketing Technology / MarTech','AI in Marketing','Customer Acquisition','Customer Retention','Marketing Attribution','ROMI','Digital Marketing','Loyalty','Market Research']) assert(restaurant.some(x=>x.label===label),label);
  assert(restaurant.some(x=>x.label.startsWith('Local Marketing')));
  assert.notDeepEqual(restaurant.map(x=>x.id),finance.map(x=>x.id));
  assert(restaurant.some(x=>/restaurant|food/i.test(x.label+x.action+x.evidence)));
});

test('invalid profiles are sanitized into valid internally consistent configurations', () => {
  const sanitized=sanitizeProfile({industry:'invalid',size:'giant',department:'unknown',objective:'bad'});
  assert.deepEqual(sanitized,defaultProfile);
  const changed=sanitizeProfile({industry:'restaurant',size:'micro',department:'marketing',objective:'local'});
  assert.equal(changed.objective,'local');
  assert.match(profileLabel(changed),/Restaurant.*Microbusiness.*Marketing.*Local Marketing/);
  assert.match(profileSignature(changed),/^personalization-v1:/);
});

test('tailoring preserves base CEAM+ content and adds traceable modular questions', () => {
  const base=getAssessment('marketing-readiness');
  const profile={industry:'restaurant',size:'micro',department:'marketing',objective:'local'};
  const tailored=tailorAssessment(base,profile);
  assert.equal(base.dimensions.length,10,'base is never mutated');
  assert(tailored.dimensions.length>base.dimensions.length);
  assert.deepEqual(tailored.dimensions.slice(0,base.dimensions.length).map(d=>d.id),base.dimensions.map(d=>d.id));
  assert.equal(tailored.tailoring.modules.length,5);
  assert.deepEqual(tailored.tailoring.modules.map(m=>m.id),['core','industry','size','department','objective']);
  const added=tailored.dimensions.flatMap(d=>d.questions).filter(q=>q.module);
  assert(added.length>=8);
  assert(added.every(q=>q.constructId&&q.id.startsWith('marketing-readiness-')));
  assert.match(JSON.stringify(tailored),/reviews|repeat customers|local visibility/i);
  assert.match(tailored.tailoring.scoringNote,/size.*never score points/i);
});

test('industry, size, department and objective change questions and recommendations', () => {
  const base=getAssessment('marketing-readiness');
  const smallRestaurant=tailorAssessment(base,{industry:'restaurant',size:'micro',department:'marketing',objective:'local'});
  const corporate=tailorAssessment(base,{industry:'corporate',size:'large',department:'marketing',objective:'marketing-attribution'});
  assert.notEqual(smallRestaurant.tailoring.signature,corporate.tailoring.signature);
  assert.notEqual(JSON.stringify(smallRestaurant.dimensions),JSON.stringify(corporate.dimensions));
  assert.match(JSON.stringify(smallRestaurant),/simple|weekly|low-cost|practical/i);
  assert.match(JSON.stringify(corporate),/cross-functional|governance|enterprise|multi-department/i);
});

test('organization size does not pre-score or boost maturity', () => {
  const base=getAssessment('marketing-readiness');
  const small=tailorAssessment(base,{industry:'retail',size:'micro',department:'marketing',objective:'marketing-readiness'});
  const large=tailorAssessment(base,{industry:'retail',size:'large',department:'marketing',objective:'marketing-readiness'});
  const smallResult=scoreAssessment(small,{answers:{},evidence:{},priorities:[]});
  const largeResult=scoreAssessment(large,{answers:{},evidence:{},priorities:[]});
  assert.equal(smallResult.overall,null);
  assert.equal(largeResult.overall,null);
  assert.equal(smallResult.coverage,0);
  assert.equal(largeResult.coverage,0);
});
