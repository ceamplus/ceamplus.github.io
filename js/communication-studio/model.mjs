import { assemble, getTemplate, grantFields, projectKinds } from './templates.mjs';

export const STORAGE_KEY = 'ceamplus.communication-planning.v1';
export const MAX_BACKUP_BYTES = 4 * 1024 * 1024;
export const id = () => globalThis.crypto.randomUUID();
export const emptyWorkspace = () => ({ version: 1, drafts: [], projects: [], customTemplates: [] });
export function createDraft(template, fictional = false) {
  return { id: id(), title: template.name, templateId: template.id, values: {}, text: assemble(template, {}), edited: false, projectId: '', fictional, updated: new Date().toISOString() };
}
export function createProject(title, kind = 'Team project', fictional = false) {
  return { id: id(), title, kind, fictional, columns: ['To Do', 'In Progress', 'Review', 'Complete'],
    tasks: (projectKinds[kind] || []).map(title => ({ id: id(), title, description: '', owner: '', status: 'To Do', priority: 'Normal', due: '', checklist: [], draftId: '' })),
    grant: kind.startsWith('Grant') ? {
      fields: Object.fromEntries(grantFields.map(([key]) => [key, key === 'currency' ? 'USD' : key === 'stage' ? 'Planning' : ''])),
      sections: ['Project narrative', 'Documented need', 'Measurable objectives', 'Evaluation plan', 'Budget justification', 'Sustainability plan'].map(title => ({ id: id(), title, question: '', text: '', limit: '', unit: 'words', budgetIds: [], documentIds: [] })),
      budget: [], documents: []
    } : null };
}
export const countText = (text, unit = 'words') => unit === 'characters' ? [...text].length : (text.trim().match(/\S+/g) || []).length;
export const budgetTotal = grant => Math.round(grant.budget.reduce((sum, row) => sum + Math.round(Number(row.quantity || 0) * Number(row.cost || 0) * 100), 0)) / 100;
export function grantIssues(grant) {
  const issues = [];
  for (const key of ['funder', 'opportunity', 'instructions', 'criteria', 'eligibility', 'deadline', 'timezone', 'organization', 'need', 'amount']) {
    if (!grant.fields[key]?.trim()) issues.push(`Missing ${grantFields.find(([id]) => id === key)[1].toLowerCase()}.`);
  }
  if (!grant.budget.length) issues.push('No budget lines entered.');
  if (grant.fields.amount && Number(grant.fields.amount) !== budgetTotal(grant)) issues.push('Funding request differs from the budget total. Explain other funding sources or reconcile the amounts.');
  for (const section of grant.sections) {
    if (!section.text.trim()) issues.push(`${section.title}: not drafted.`);
    if (section.limit && countText(section.text, section.unit) > Number(section.limit)) issues.push(`${section.title}: exceeds the user-entered ${section.unit} limit.`);
    if (/\[.+?\]/s.test(section.text)) issues.push(`${section.title}: contains placeholders or evidence to verify.`);
  }
  if (grant.documents.some(d => !d.done)) issues.push('Required document checklist has outstanding items.');
  return issues;
}
export function proposalText(project) {
  const g = project.grant;
  return [project.title, project.fictional ? 'FICTIONAL EXAMPLE — not a real application' : 'User-entered draft — not verified, approved, or submitted',
    ...grantFields.map(([key, label]) => `${label}\n${g.fields[key]?.trim() || `[Add ${label.toLowerCase()}]`}`),
    ...g.sections.map(s => `${s.title}\nFunder question: ${s.question || '[Paste the exact question]'}\n${s.text || '[Draft this section using supported facts]'}\n${s.limit ? `User-entered limit: ${s.limit} ${s.unit}; current count: ${countText(s.text, s.unit)}` : 'Limit: not supplied'}`),
    `Budget (${g.fields.currency || '[Specify currency]'})\n${g.budget.map(b => `${b.label || '[Cost item]'}: ${b.quantity || 0} × ${b.cost || 0} = ${(Number(b.quantity || 0) * Number(b.cost || 0)).toFixed(2)}; basis: ${b.basis || '[Add evidence or estimate basis]'}`).join('\n')}\nTotal: ${budgetTotal(g).toFixed(2)}`,
    `Required documents\n${g.documents.map(d => `[${d.done ? 'x' : ' '}] ${d.text}`).join('\n') || '[Add funder-required documents]'}`,
    'Review notes\n' + grantIssues(g).join('\n'),
    'Human review required. All requirements and claims are user-entered. Check the official opportunity, evidence, budget and narrative together; this workspace does not establish eligibility, compliance, submission, or funding prospects.'
  ].join('\n\n');
}

/** Explicit schema, size, number and referential-integrity checks before replacing storage. */
export function validateWorkspace(value) {
  const fail = message => { throw new Error('Invalid workspace: ' + message); };
  const object = (x, keys) => {
    if (!x || typeof x !== 'object' || Array.isArray(x) || Object.keys(x).some(k => !keys.includes(k))) fail('unexpected object or fields.');
  };
  const str = (x, max = 80000) => { if (typeof x !== 'string' || x.length > max) fail('text is missing or too long.'); };
  const bool = x => { if (typeof x !== 'boolean') fail('invalid flag.'); };
  const array = (x, max = 500) => { if (!Array.isArray(x) || x.length > max) fail('too many or missing records.'); };
  const ids = new Set();
  const unique = x => { str(x, 100); if (!/^[a-z0-9_-]+$/i.test(x) || ids.has(x)) fail('unsafe, duplicate or missing identifier.'); ids.add(x); };
  const numeric = (x, max) => { str(x, 30); if (x !== '' && (!Number.isFinite(Number(x)) || Number(x) < 0 || Number(x) > max)) fail('invalid numeric amount or limit.'); };
  const checklist = list => { array(list); for (const item of list) { object(item, ['id', 'text', 'done']); unique(item.id); str(item.text, 2000); bool(item.done); } };
  object(value, ['version', 'drafts', 'projects', 'customTemplates']);
  if (value.version !== 1) fail('unsupported backup version.');
  array(value.drafts); array(value.projects, 100); array(value.customTemplates, 100);
  for (const t of value.customTemplates) {
    object(t, ['id', 'name', 'category', 'guidance', 'fields', 'body']); unique(t.id); str(t.name, 160); str(t.category, 80); str(t.guidance, 1000); str(t.body); array(t.fields, 40);
    const fieldIds = new Set();
    for (const f of t.fields) { object(f, ['id', 'label', 'hint', 'type']); for (const k of ['id', 'label', 'hint', 'type']) str(f[k], 1000); if (!/^[a-z0-9_-]{1,80}$/i.test(f.id) || ['__proto__', 'constructor', 'prototype'].includes(f.id) || fieldIds.has(f.id) || !['text', 'textarea'].includes(f.type)) fail('invalid template field.'); fieldIds.add(f.id); }
  }
  for (const d of value.drafts) {
    object(d, ['id', 'title', 'templateId', 'values', 'text', 'edited', 'projectId', 'fictional', 'updated']); unique(d.id);
    for (const key of ['title', 'templateId', 'projectId', 'updated']) str(d[key], 160);
    if (!Number.isFinite(Date.parse(d.updated))) fail('invalid draft date.');
    str(d.text); bool(d.edited); bool(d.fictional);
    if (!d.values || typeof d.values !== 'object' || Array.isArray(d.values) || Object.keys(d.values).length > 40) fail('invalid draft fields.');
    for (const [key, text] of Object.entries(d.values)) { if (!/^[a-zA-Z0-9_-]+$/.test(key) || ['__proto__', 'constructor', 'prototype'].includes(key)) fail('invalid field name.'); str(text); }
    if (getTemplate(d.templateId, value.customTemplates).id !== d.templateId) fail('unknown template.');
  }
  for (const p of value.projects) {
    object(p, ['id', 'title', 'kind', 'fictional', 'columns', 'tasks', 'grant']); unique(p.id); str(p.title, 160); bool(p.fictional);
    if (!Object.hasOwn(projectKinds, p.kind)) fail('unknown project type.');
    array(p.columns, 20); if (!p.columns.length || new Set(p.columns).size !== p.columns.length) fail('missing or duplicate columns.');
    p.columns.forEach(c => { str(c, 80); if (!c.trim()) fail('empty status.'); });
    array(p.tasks);
    for (const t of p.tasks) {
      object(t, ['id', 'title', 'description', 'owner', 'status', 'priority', 'due', 'checklist', 'draftId']); unique(t.id);
      for (const key of ['title', 'owner', 'status', 'due', 'draftId']) str(t[key], 200);
      str(t.description); checklist(t.checklist);
      if (!p.columns.includes(t.status) || !['Low', 'Normal', 'High'].includes(t.priority)) fail('invalid task status or priority.');
      if (t.due && (!/^\d{4}-\d{2}-\d{2}$/.test(t.due) || !Number.isFinite(Date.parse(t.due)))) fail('invalid task date.');
      if (t.draftId && !value.drafts.some(d => d.id === t.draftId)) fail('task references a missing draft.');
    }
    if (p.kind.startsWith('Grant') !== (p.grant !== null)) fail('grant project mismatch.');
    if (p.grant) {
      const g = p.grant; object(g, ['fields', 'sections', 'budget', 'documents']); object(g.fields, grantFields.map(([key]) => key));
      for (const [key] of grantFields) str(g.fields[key]); numeric(g.fields.amount, 1e12);
      array(g.sections, 100); array(g.budget, 200); checklist(g.documents);
      for (const b of g.budget) { object(b, ['id', 'label', 'quantity', 'cost', 'basis']); unique(b.id); str(b.label, 200); str(b.basis); numeric(b.quantity, 1e6); numeric(b.cost, 1e9); }
      if (budgetTotal(g) > 1e12) fail('budget exceeds supported total.');
      for (const s of g.sections) {
        object(s, ['id', 'title', 'question', 'text', 'limit', 'unit', 'budgetIds', 'documentIds']); unique(s.id); str(s.title, 200); str(s.question); str(s.text); numeric(s.limit, 1000000);
        if (!['words', 'characters'].includes(s.unit) || (s.limit && !Number.isInteger(Number(s.limit)))) fail('invalid section limit.');
        for (const [key, items] of [['budgetIds', g.budget], ['documentIds', g.documents]]) { array(s[key]); if (s[key].some(ref => !items.some(i => i.id === ref))) fail('missing grant section reference.'); }
      }
    }
  }
  if (value.drafts.some(d => d.projectId && !value.projects.some(p => p.id === d.projectId))) fail('draft references a missing project.');
  if (new TextEncoder().encode(JSON.stringify(value)).length > MAX_BACKUP_BYTES) fail('backup exceeds 4 MB.');
  return value;
}
export function parseBackup(text) {
  if (new TextEncoder().encode(text).length > MAX_BACKUP_BYTES) throw new Error('Backup exceeds 4 MB.');
  return validateWorkspace(JSON.parse(text));
}
export function addDemo(workspace) {
  if (workspace.projects.some(p => p.fictional)) return false;
  const project = createProject('Fictional example · Community learning grant', 'Grant application', true);
  Object.assign(project.grant.fields, { funder: 'Fictional Learning Fund', opportunity: 'Example workshop award', organization: 'Fictional Community Workshop', mission: 'Example: help adults practice digital skills.', summary: 'Example: four introductory workshops.', amount: '2000', assumptions: 'Example estimates only. No funder or requirements have been verified.' });
  project.grant.budget.push({ id: id(), label: 'Example workshop facilitation', quantity: '4', cost: '500', basis: 'Fictional estimate, not a quotation.' });
  project.grant.sections[0].text = 'FICTIONAL EXAMPLE: Four introductory workshops are proposed. [Add evidence of need, confirmed capacity, and participant input.]';
  project.grant.documents.push({ id: id(), text: 'Example: confirm official application instructions', done: false });
  const draft = createDraft(getTemplate('project-update'), true); draft.title = 'Fictional example · Planning update'; draft.projectId = project.id;
  draft.values = { purpose: 'Review an illustrative workshop plan.', audience: 'Example planning group', message: 'The budget is an example and requires evidence.', action: 'Identify information to verify.' };
  draft.text = assemble(getTemplate(draft.templateId), draft.values); project.tasks[0].draftId = draft.id;
  workspace.projects.push(project); workspace.drafts.push(draft); return true;
}
