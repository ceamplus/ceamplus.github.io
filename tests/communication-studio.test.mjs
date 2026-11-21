import test from 'node:test';
import assert from 'node:assert/strict';
import { templates, getTemplate, assemble } from '../js/communication-studio/templates.mjs';
import { emptyWorkspace, createDraft, createProject, validateWorkspace, parseBackup, addDemo, budgetTotal, grantIssues, proposalText, countText, completedStatus, isTaskComplete, renameColumn, copyDraftToProposal } from '../js/communication-studio/model.mjs';

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

test('email assembly produces a document and honors explicit sections without inventing a recipient', () => {
  const text = assemble(getTemplate('email'), { purpose: 'Review the plan', audience: 'Leadership team', context: 'The scope remains under review.', message: 'First paragraph.\n\nSecond paragraph.', action: 'Please review the draft.', deadline: 'Friday, 5 p.m. Eastern', tone: 'Formal' });
  assert.match(text, /^Subject: Review the plan/);
  assert.match(text, /\[Add greeting for your recipient\]/);
  assert.match(text, /First paragraph\.\n\nSecond paragraph\./);
  assert.match(text, /Timing: Friday, 5 p.m. Eastern/);
  assert(!text.includes('Purpose and desired outcome'));
  assert(!text.includes('Formal'));
  assert.equal(assemble(getTemplate('blank'), {}), '');
  const override = assemble(getTemplate('email'), { purpose: 'Old subject', message: 'Old message', section0: 'My subject', section2: 'My actual wording' });
  assert.match(override, /^Subject: My subject/); assert(override.includes('My actual wording')); assert(!override.includes('Old message'));
});

test('renaming a completion column preserves task completion and old backups remain readable', () => {
  const w = emptyWorkspace(), p = createProject('Test'); w.projects.push(p);
  delete p.completedStatus; // Original v1 shape.
  p.tasks[0].status = 'Complete';
  const restored = parseBackup(JSON.stringify(w)); assert.equal(restored.projects[0].completedStatus, undefined);
  assert.equal(completedStatus(p), 'Complete'); assert(isTaskComplete(p, p.tasks[0]));
  renameColumn(p, 'Complete', 'Done');
  assert.equal(p.tasks[0].status, 'Done'); assert(isTaskComplete(p, p.tasks[0]));
  assert.deepEqual(parseBackup(JSON.stringify(w)), w);
  p.completedStatus = 'Missing'; assert.throws(() => validateWorkspace(w));
});

test('a proposal copy preserves text independently and exports section evidence links', () => {
  const w = emptyWorkspace(), p = createProject('Test application', 'Grant application'), d = createDraft(getTemplate('needs-statement'));
  w.projects.push(p); w.drafts.push(d); d.text = 'Supported need.\n\n[Evidence still needed]';
  const s = copyDraftToProposal(p, d); assert.equal(d.projectId, p.id); assert.equal(s.text, d.text);
  d.text = 'Later draft revision'; assert.notEqual(s.text, d.text);
  p.grant.budget.push({ id: 'linked-cost', label: 'Workshop time', quantity: '3', cost: '100', basis: 'Estimate' });
  p.grant.documents.push({ id: 'linked-document', text: 'Approved work plan', done: false });
  s.budgetIds.push('linked-cost'); s.documentIds.push('linked-document');
  assert.match(proposalText(p), /Linked budget total: 300.00 USD/);
  assert.match(proposalText(p), /Approved work plan \[outstanding\]/);
  assert.deepEqual(parseBackup(JSON.stringify(w)), w);
  d.fictional = true; assert.throws(() => copyDraftToProposal(p, d), /Fictional/);
});

test('fractional budget lines use the same rounding in every export and total', () => {
  const p = createProject('Rounding example', 'Grant application');
  p.grant.budget.push({ id: 'fractional-cost', label: 'Partial hour', quantity: '0.5', cost: '5.35', basis: 'Estimate' });
  p.grant.sections[0].budgetIds.push('fractional-cost');
  assert.equal(budgetTotal(p.grant), 2.68);
  const text = proposalText(p);
  assert.match(text, /0.5 × 5.35 = 2.68/);
  assert.match(text, /Linked budget total: 2.68 USD/);
});
