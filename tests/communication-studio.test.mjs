import test from 'node:test';
import assert from 'node:assert/strict';
import { templates, getTemplate, assemble } from '../js/communication-studio/templates.mjs';
import { emptyWorkspace, createDraft, createProject, validateWorkspace, parseBackup, addDemo, budgetTotal, grantIssues, proposalText, countText } from '../js/communication-studio/model.mjs';

test('every requested template has meaningful guidance and missing-information markers', () => {
  assert.equal(templates.length, 55);
  assert.equal(new Set(templates.map(t => t.id)).size, templates.length);
  for (const t of templates) { assert(t.guidance.length > 40); assert(t.fields.length >= 12); assert.match(assemble(t, {}), /\[Add /); }
  const text = assemble(getTemplate('email'), { message: 'First paragraph.\n\nSecond paragraph.' });
  assert.match(text, /First paragraph\.\n\nSecond paragraph\./);
});
test('round-trip retains drafts, links, grants, custom columns and checklists', () => {
  const w = emptyWorkspace(); addDemo(w);
  w.projects[0].columns.push('Awaiting evidence'); w.projects[0].tasks[0].status = 'Awaiting evidence';
  assert.deepEqual(parseBackup(JSON.stringify(w)), w);
  assert.equal(budgetTotal(w.projects[0].grant), 2000);
  assert.match(proposalText(w.projects[0]), /FICTIONAL EXAMPLE/);
  assert.equal(addDemo(w), false);
});
test('import rejects corrupt schemas, unsafe identifiers, broken links, bad amounts and versions', () => {
  const w = emptyWorkspace(); addDemo(w);
  for (const mutate of [
    x => x.version = 99,
    x => x.projects[0].tasks[0].draftId = 'missing',
    x => x.projects[0].columns.push('To Do'),
    x => x.projects[0].grant.budget[0].cost = '-1',
    x => x.projects[0].grant.budget[0].quantity = 'Infinity',
    x => x.projects[0].id = '"><img src=x onerror=alert(1)>',
    x => x.projects[0].grant.sections[0].budgetIds = ['missing'],
    x => x.projects[0].grant.sections[0].limit = '2.5',
    x => x.drafts[0].projectId = 'missing',
    x => x.drafts.push(structuredClone(x.drafts[0])),
    x => x.projects[0].grant = null,
    x => x.drafts[0].values = JSON.parse('{"__proto__":"unsafe"}')
  ]) { const copy = structuredClone(w); mutate(copy); assert.throws(() => validateWorkspace(copy)); }
  assert.throws(() => parseBackup('not json'));
  assert.throws(() => parseBackup(' '.repeat(4 * 1024 * 1024 + 1)));
});
test('budgets round by line and flag narrative gaps, funding mismatches and limits', () => {
  const g = createProject('Test', 'Grant application').grant;
  g.budget = [{ id: 'cost1', label: 'Materials', quantity: '3', cost: '0.1', basis: 'Estimate' }, { id: 'cost2', label: 'Time', quantity: '2.5', cost: '120', basis: 'Estimate' }];
  g.fields.amount = '301';
  g.sections[0].text = 'A proposed activity with [Evidence needed]'; g.sections[0].limit = '3';
  assert.equal(budgetTotal(g), 300.3);
  assert(grantIssues(g).some(s => s.includes('differs')));
  assert(grantIssues(g).some(s => s.includes('exceeds')));
  assert(grantIssues(g).some(s => s.includes('placeholders')));
  assert.equal(countText('one\n\ntwo three'), 3);
  assert.equal(countText('a😀', 'characters'), 2);
});
test('malicious user text is retained only as data and custom templates round-trip', () => {
  const w = emptyWorkspace(); const d = createDraft(getTemplate('email'));
  d.text = '<img src=x onerror=alert(1)>\n\nKeep my paragraph.'; w.drafts.push(d);
  w.customTemplates.push({ id: 'custom-1', name: 'My template', category: 'Workplace', guidance: 'Replace private facts.', fields: [], body: d.text });
  const reused = createDraft(getTemplate('custom-1', w.customTemplates)); w.drafts.push(reused);
  assert.equal(parseBackup(JSON.stringify(w)).drafts[1].text, d.text);
});

test('import rejects custom field attribute injection and reserved object keys', () => {
  for (const fieldId of ['x" autofocus onfocus="alert(1)', '__proto__', 'constructor']) {
    const w = emptyWorkspace();
    w.customTemplates.push({ id: 'custom-test', name: 'Custom', category: 'Personal', guidance: 'Test', body: '', fields: [{ id: fieldId, label: 'Field', hint: '', type: 'text' }] });
    assert.throws(() => validateWorkspace(w));
  }
});
