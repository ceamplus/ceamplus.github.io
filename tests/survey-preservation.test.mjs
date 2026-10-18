import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { applyAssessmentLink } from '../js/analytics/assessment-links.mjs';

const read = file => fs.readFileSync(fileURLToPath(new URL(`../${file}`, import.meta.url)), 'utf8');
const source = read('script.js');
const sandbox = { document: { querySelector: () => null }, window: { matchMedia: () => ({ matches: true }), addEventListener() {} } };
vm.runInNewContext(source, sandbox);
const engine = sandbox.window.CEAMAssessments;
const counts = { personal: 58, business: 58, education: 55, healthcare: 54, rehabilitation: 54 };

test('the original survey engine content is unchanged across Git line-ending conventions', () => {
  // Windows Git checkouts may use CRLF. The normalized digest matches HEAD:script.js.
  assert.equal(crypto.createHash('sha256').update(source.replace(/\r\n/g, '\n')).digest('hex'), '7fa6e420b9700d0a582249b51a8d1308f54f2c4a650ba14ea93cbfd23dc9261a');
});

test('all five complete survey contexts and nine CEAM+ dimensions are preserved', () => {
  assert.deepEqual(Array.from(engine.assessments, item => item.id), Object.keys(counts));
  assert.equal(engine.phases.length, 9);
  for (const [id, count] of Object.entries(counts)) {
    const assessment = engine.getAssessmentById(id);
    assert.equal(assessment.questions.length, count, id);
    assert.equal(new Set(assessment.questions.map(question => question.id)).size, count, id);
    assert.equal(assessment.phases.length, 9, id);
    for (const question of assessment.questions) assert(question.label?.length, `${id}: question has its wording`);
  }
});

test('survey scoring, uncertainty, recommendations and contextual safeguards remain functional', () => {
  for (const id of Object.keys(counts)) {
    const assessment = engine.getAssessmentById(id);
    const question = assessment.questions.find(item => !['choice', 'text'].includes(item.type));
    assert(question, `${id} has a scale question`);
    const responses = { [question.id]: question.reverse ? 1 : 4 };
    const result = engine.buildAssessmentResult(assessment, responses);
    assert.equal(result.score, 80, id);
    assert.equal(result.scoredAnswerCount, 1, id);
    assert(result.recommendation.description.length > 20, id);
    assert(result.recommendation.implementationPath.length > 0, id);
    const unknown = engine.buildAssessmentResult(assessment, { [`${question.id}_status`]: 'Uncertain' });
    assert.equal(unknown.scoredAnswerCount, 0, id);
    assert.equal(unknown.answeredCount, 1, id);
    assert.deepEqual(Array.from(unknown.responseStatuses), ['Uncertain']);
    const notApplicable = engine.buildAssessmentResult(assessment, { [`${question.id}_status`]: 'Not applicable' });
    assert.equal(notApplicable.scoredAnswerCount, 0, id);
    assert.deepEqual(Array.from(notApplicable.responseStatuses), ['Not applicable']);
  }
});

test('canonical and compatibility survey pages retain functional controls, safeguards and disclosure', () => {
  assert.equal(read('surveys.html'), read('assessments.html'));
  for (const file of ['surveys.html', 'assessments.html']) {
    const page = read(file);
    for (const required of ['<title>CEAM+ Surveys</title>', 'id="assessments"', 'id="assessments-title"', 'data-organization-select', 'data-start-assessment', 'data-assessment-panel', 'script.js?v=20260904-assessment-integrity', 'js/surveys-context.js', 'CEAM+ Adoption Model', 'not validated diagnostic instruments', 'Contradictory answers create follow-up questions', 'Triangulate when stakes are high', 'Keep structural barriers visible', 'Preserve human authority', 'Zapier', 'assessment-center.html', 'analytics-lab.html']) assert(page.includes(required), `${file}: ${required}`);
    for (const id of Object.keys(counts)) assert(page.includes(`value="${id}"`), `${file}: ${id}`);
    assert(!page.includes('http-equiv="refresh"'), `${file} stays functional without a redirect`);
  }
});

test('survey context links only select a known context and never start a submission', () => {
  const helper = read('js/surveys-context.js');
  for (const requested of [...Object.keys(counts), 'invented']) {
    const calls = [];
    const select = { value: '', options: Object.keys(counts).map(value => ({ value })), dispatchEvent: event => calls.push(event.type) };
    vm.runInNewContext(helper, { URLSearchParams, Event, document: { querySelector: () => select }, window: { location: { search: `?context=${requested}` } } });
    assert.equal(select.value, requested === 'invented' ? '' : requested);
    assert.deepEqual(calls, requested === 'invented' ? [] : ['change']);
  }
});

test('analytics recommendations select only existing tools and do not transfer evidence', () => {
  for (const [query, target] of [['?mode=calculator&metric=cac', 'cac'], ['?mode=case&tool=forces', 'forces'], ['?mode=data&analysis=forecast', 'forecast']]) {
    const events = [], statuses = [];
    const select = { value: '', options: [{ value: target, textContent: target }], dispatchEvent: event => events.push(event.type) };
    const document = { querySelector: query => query.includes('mode-switch') ? { click: () => events.push('mode') } : select, getElementById: () => select };
    assert.equal(applyAssessmentLink({ document, location: { search: query }, Event, setStatus: status => statuses.push(status) }), true);
    assert.equal(select.value, target);
    assert.deepEqual(events, ['mode', 'change']);
    assert(statuses[0].includes('No assessment responses') || statuses[0].includes('no assessment responses'));
  }
  let clicked = false;
  assert.equal(applyAssessmentLink({ document: { querySelector() { clicked = true; } }, location: { search: '?mode=unknown' }, Event, setStatus() {} }), false);
  assert.equal(clicked, false);
});
