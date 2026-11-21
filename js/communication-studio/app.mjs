import { templates, categories, blankTemplate, getTemplate, assemble, grantFields, projectKinds } from './templates.mjs';
import { STORAGE_KEY, MAX_BACKUP_BYTES, id, emptyWorkspace, createDraft, createProject, countText, budgetTotal, grantIssues, proposalText, validateWorkspace, parseBackup, addDemo } from './model.mjs';
import { writingContact } from './config.mjs';

const $ = selector => document.querySelector(selector);
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const button = (action, label, value = '', cls = '') => `<button type="button" data-action="${action}" data-id="${escape(value)}" class="${cls}">${label}</button>`;
const options = (items, selected) => items.map(item => { const [value, label] = Array.isArray(item) ? item : [item, item]; return `<option value="${escape(value)}"${value === selected ? ' selected' : ''}>${escape(label)}</option>`; }).join('');
const input = (label, name, value = '', { type = 'text', hint = '', required = false, attrs = '', rows = 3, max = 80000 } = {}) => `<label class="cp-field">${escape(label)}${required ? ' *' : ''}${hint ? `<span class="cp-hint">${escape(hint)}</span>` : ''}${type === 'textarea' ? `<textarea name="${name}" rows="${rows}" maxlength="${max}" ${required ? 'required' : ''} ${attrs}>${escape(value)}</textarea>` : `<input name="${name}" type="${type}" value="${escape(value)}" ${['text', 'email', 'url'].includes(type) ? `maxlength="${max}"` : ''} ${required ? 'required' : ''} ${attrs}>`}</label>`;
const select = (label, name, items, selected, attrs = '') => `<label class="cp-field">${escape(label)}<select name="${name}" ${attrs}>${options(items, selected)}</select></label>`;
const note = text => `<p class="cp-note">${text}</p>`;
let workspace = emptyWorkspace(), blocked = false, view = 'templates', selectedDraft = '', selectedProject = '', selectedTask = '', boardView = 'list', search = '', filter = 'All';
let request = {}, requestSource = '', requestProject = '', includeDraft = false, includeGrant = false;
let rawStored = '', unsaved = false;
try { rawStored = localStorage.getItem(STORAGE_KEY) || ''; if (rawStored) workspace = parseBackup(rawStored); }
catch { blocked = true; }
const draft = () => workspace.drafts.find(d => d.id === selectedDraft);
const project = () => workspace.projects.find(p => p.id === selectedProject);
const task = () => project()?.tasks.find(t => t.id === selectedTask);
const matches = text => text.toLowerCase().includes(search.toLowerCase());
const visibleProject = p => (filter !== 'Grants' || p.grant) && matches(`${p.title} ${p.kind}`);
const isDemo = item => item.fictional ? '<span class="cp-badge">Fictional example</span>' : '';
function announce(message, error = false) { $('#cp-status').textContent = message; $('#cp-status').classList.toggle('cp-error', error); }
function save(message = '') {
  unsaved = true;
  if (blocked) { announce('Saving is paused to protect existing data. Export this session, then reload or use workspace recovery below.', true); return false; }
  try { validateWorkspace(workspace); localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace)); unsaved = false; updateOverview(); if (message) announce(message); return true; }
  catch (error) { announce(`Not saved: ${error.message}. Keep this tab open and export a backup.`, true); return false; }
}
function download(text, filename, mime = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement('a'); a.href = url; a.download = filename.replace(/[^a-z0-9._ -]/gi, '_'); a.click(); setTimeout(() => URL.revokeObjectURL(url), 2000);
}
async function copy(text) {
  try { await navigator.clipboard.writeText(text); announce('Copied to clipboard. Nothing has been sent.'); }
  catch { announce('Clipboard is unavailable. Select and copy the preview, or download the text.', true); }
}
function printText(text) { $('#cp-print-output').textContent = text; window.print(); }
function updateOverview() {
  $('#cp-counts').textContent = `${workspace.projects.length} projects · ${workspace.drafts.length} drafts · ${workspace.projects.reduce((n, p) => n + p.tasks.filter(t => t.status !== 'Complete').length, 0)} open tasks`;
}
function sidebar() {
  $('#cp-drafts').innerHTML = workspace.drafts.filter(d => matches(d.title) && (filter !== 'Grants' || getTemplate(d.templateId, workspace.customTemplates).category === 'Grants' || workspace.projects.find(p => p.id === d.projectId)?.grant)).map(d => button('open-draft', `${escape(d.title)}${d.fictional ? ' · Example' : ''}`, d.id, selectedDraft === d.id && view === 'editor' ? 'is-active' : '')).join('') || '<p class="cp-hint">No matching drafts. Choose a template or start from blank.</p>';
  $('#cp-projects').innerHTML = workspace.projects.filter(visibleProject).map(p => button('open-project', `${escape(p.title)}${p.fictional ? ' · Example' : ''}`, p.id, selectedProject === p.id && ['project', 'grant'].includes(view) ? 'is-active' : '')).join('') || '<p class="cp-hint">No matching projects. Create one to organize your work.</p>';
  updateOverview();
}
function navigate(next, focus = true) {
  view = next; render();
  if (focus) $('#cp-main h2')?.focus();
}
function render() {
  sidebar();
  $('#cp-main').innerHTML = view === 'editor' && draft() ? editorView() : view === 'new-project' ? newProjectView() : view === 'project' && project() ? projectView() : view === 'grant' && project()?.grant ? grantView() : view === 'request' ? requestView() : view === 'overview' ? overviewView() : libraryView();
  if (view === 'request') updateRequestPreview();
  if (view === 'grant') updateGrantPreview();
  if (view === 'editor') updateDraftReview();
}
function libraryView() {
  const shown = [...templates, ...workspace.customTemplates].filter(t => (filter === 'All' || filter === 'Custom' && workspace.customTemplates.includes(t) || t.category === filter) && matches(`${t.name} ${t.category} ${t.guidance}`));
  return `<div class="cp-panel"><div class="cp-heading"><div><span class="eyebrow">Make a useful first draft</span><h2 tabindex="-1">Template library</h2></div><span class="cp-badge">${shown.length} templates</span></div><p>Choose a starting point, add your facts, then edit the preview in your own voice. Templates structure your information; they do not invent it.</p><div class="cp-actions">${button('blank', 'Start from Blank')}${button('request', 'Have It Written for Me')}</div><div class="cp-template-grid">${shown.map(t => `<article class="cp-template"><span class="cp-category">${escape(t.category)}</span><h3>${escape(t.name)}</h3><p>${escape(t.guidance)}</p>${button('use-template', 'Use template', t.id)}${workspace.customTemplates.includes(t) ? button('delete-template', 'Delete custom template', t.id, 'cp-quiet') : ''}</article>`).join('') || '<p>No templates match. Clear the search or choose another category.</p>'}</div></div>`;
}
function overviewView() {
  const upcoming = workspace.projects.filter(visibleProject).flatMap(p => p.tasks.filter(t => t.due && t.status !== 'Complete').map(t => ({ ...t, project: p }))).sort((a, b) => a.due.localeCompare(b.due));
  return `<section class="cp-panel"><h2 tabindex="-1">Workspace overview</h2><p>Start with a communication, connect it to a project, and choose a manageable next step.</p><div class="cp-actions">${button('templates', 'Use a Template', '', 'cp-primary')}${button('new-project', 'Create a project')}${button('new-grant', 'Start a grant application')}</div><h3>Projects</h3><div class="cp-template-grid">${workspace.projects.filter(visibleProject).map(p => `<article class="cp-template">${isDemo(p)}<h3>${escape(p.title)}</h3><p>${escape(p.kind)} · ${p.tasks.length} tasks</p>${button('open-project', 'Open project', p.id)}</article>`).join('') || '<p>No projects yet. Use a project template to start with a short task list.</p>'}</div><h3>Upcoming tasks</h3><ul class="cp-upcoming">${upcoming.map(t => `<li><strong>${escape(t.due)}</strong> ${escape(t.title)} · ${escape(t.project.title)} ${button('open-project', 'Open', t.project.id)}</li>`).join('') || '<li>No upcoming due dates. Add a task and due date in a project.</li>'}</ul></section>`;
}
function exportActions(prefix = 'draft') { return `<div class="cp-actions">${button(`copy-${prefix}`, 'Copy text')}${button(`download-${prefix}`, 'Download text')}${button(`print-${prefix}`, 'Print / Save PDF')}</div>`; }
function editorView() {
  const d = draft(), t = getTemplate(d.templateId, workspace.customTemplates);
  return `<div class="cp-work-columns"><section class="cp-panel"><div class="cp-heading"><div><span class="eyebrow">${escape(t.category)}</span><h2 tabindex="-1">Communication builder</h2></div>${isDemo(d)}</div><p>${escape(t.guidance)}</p><div class="cp-actions">${button('save-draft', 'Save draft', '', 'cp-primary')}<a class="cp-button" href="#cp-preview">Edit draft preview</a>${button('request-draft', 'Have It Written for Me')}</div><form id="cp-draft-form">${input('Draft title', 'title', d.title, { required: true, max: 160 })}${select('Attach to project', 'projectId', [['', 'No project'], ...workspace.projects.map(p => [p.id, p.title])], d.projectId)}${t.fields.filter(f => ['purpose', 'audience', 'message'].includes(f.id)).map(f => input(f.label, `value:${f.id}`, d.values[f.id], { type: f.type, hint: f.hint })).join('')}${t.fields.length ? `<details class="cp-inner-panel"><summary>Context, action, dates, and writing preferences</summary>${t.fields.filter(f => !f.id.startsWith('section') && !['purpose', 'audience', 'message'].includes(f.id)).map(f => input(f.label, `value:${f.id}`, d.values[f.id], { type: f.type, hint: f.hint })).join('')}</details><details class="cp-inner-panel"><summary>Template sections · ${escape(t.name)}</summary>${t.fields.filter(f => f.id.startsWith('section')).map(f => input(f.label, `value:${f.id}`, d.values[f.id], { type: f.type, hint: f.hint })).join('')}</details>` : ''}</form><div class="cp-actions">${button('save-draft', 'Save draft', '', 'cp-primary')}${button('duplicate-draft', 'Duplicate')}${button('custom-template', 'Save as reusable template')}${button('request-draft', 'Have It Written for Me')}${button('delete-draft', 'Delete draft', '', 'cp-danger')}</div>${note('Edits save locally as you type when browser storage is available. A reusable template keeps the current preview, including any facts you entered; review it before reuse.')}</section><aside class="cp-panel cp-preview"><h2>Editable preview</h2><p id="cp-preview-mode">${d.edited ? 'Your edited version is preserved. Rebuild only if you want to replace it with the guided fields.' : 'The preview updates as you complete the fields. Editing it directly preserves your version.'}</p><label class="cp-field">Draft text<textarea id="cp-preview" rows="20" maxlength="80000">${escape(d.text)}</textarea></label><p id="cp-word-count" class="cp-hint"></p>${button('regenerate', 'Rebuild from guided fields')}${exportActions()}<details open class="cp-inner-panel"><summary>Review checklist</summary><div id="cp-draft-review"></div><ul><li>Verify names, dates, facts, sources, and authority.</li><li>Check tone, length, accessibility, and the requested action for this reader.</li><li>Replace every placeholder before sharing.</li></ul></details></aside></div>`;
}
function updateDraftReview() {
  const d = draft(); if (!d) return;
  $('#cp-word-count').textContent = `${countText(d.text)} words · ${countText(d.text, 'characters')} characters`;
  const t = getTemplate(d.templateId, workspace.customTemplates);
  const missing = t.fields.filter(f => !d.values[f.id]?.trim());
  $('#cp-draft-review').innerHTML = `<p>${missing.length ? `${missing.length} guided fields still blank. These may be covered by your edited text; review them.` : 'All guided fields contain text. Accuracy still requires human review.'}</p>${missing.length ? `<ul>${missing.map(f => `<li>${escape(f.label)}</li>`).join('')}</ul>` : ''}<p>${/\[.+?\]/s.test(d.text) ? 'The preview still contains placeholders.' : 'No bracketed placeholders found; this does not verify the facts.'}</p>`;
}
function newProjectView() {
  return `<section class="cp-panel cp-narrow"><h2 tabindex="-1">Create a project</h2><p>Start with a small task list and adapt it. Owner labels are notes; they do not notify or assign work to anyone.</p><form id="cp-new-project-form">${input('Project name', 'title', '', { required: true, max: 160 })}${select('Project template', 'kind', Object.keys(projectKinds), 'Team project')}<button class="cp-primary" type="submit">Create project</button></form></section>`;
}
function taskCard(t) {
  return `<article class="cp-task"><h4>${escape(t.title || 'Untitled task')}</h4><p>${escape(t.owner || 'No owner label')} · ${escape(t.priority)} priority</p>${t.due ? `<p>Due ${escape(t.due)}</p>` : ''}${t.draftId ? '<p>Communication attached</p>' : ''}<p>${t.checklist.filter(c => c.done).length}/${t.checklist.length} checklist items</p>${select(`Status for ${t.title || 'untitled task'}`, 'status', project().columns, t.status, `data-move-task="${t.id}"`)}${button('edit-task', 'Edit task', t.id)}</article>`;
}
function projectView() {
  const p = project();
  return `<div class="cp-work-columns"><section class="cp-panel"><div class="cp-heading"><div><span class="eyebrow">${escape(p.kind)}</span><h2 tabindex="-1">${escape(p.title)}</h2></div>${isDemo(p)}</div>${note('Private to this browser profile. Owner labels do not send assignments. This board does not provide live team collaboration.')}<div class="cp-actions">${button('add-task', 'Add task', '', 'cp-primary')}${button('list-view', 'Table / list', '', boardView === 'list' ? 'is-active' : '')}${button('kanban-view', 'Kanban', '', boardView === 'kanban' ? 'is-active' : '')}${p.grant ? button('grant', 'Grant builder') + button('request-grant', 'Have It Written for Me') : ''}</div>${boardView === 'kanban' ? `<div class="cp-kanban">${p.columns.map(column => `<section class="cp-column"><h3>${escape(column)} <span>${p.tasks.filter(t => t.status === column).length}</span></h3>${p.tasks.filter(t => t.status === column).map(taskCard).join('') || '<p class="cp-hint">No tasks in this column.</p>'}</section>`).join('')}</div>` : `<div class="cp-table-wrap" tabindex="0" role="region" aria-label="Project tasks"><table><caption>Tasks and next steps</caption><thead><tr><th scope="col">Task</th><th scope="col">Owner / due</th><th scope="col">Status</th><th scope="col">Details</th></tr></thead><tbody>${p.tasks.map(t => `<tr><th scope="row">${escape(t.title)}<small>${escape(t.priority)} priority</small></th><td>${escape(t.owner || 'Unassigned label')}<small>${escape(t.due || 'No due date')}</small></td><td>${select(`Status for ${t.title}`, 'status', p.columns, t.status, `data-move-task="${t.id}"`)}</td><td>${button('edit-task', 'Edit task', t.id)}</td></tr>`).join('')}</tbody></table>${!p.tasks.length ? '<p>No tasks yet. Add one above.</p>' : ''}</div>`}<details class="cp-inner-panel"><summary>Project settings and columns</summary><form id="cp-project-settings">${input('Project name', 'title', p.title, { required: true, max: 160 })}<button type="submit">Rename project</button></form><form id="cp-column-add">${input('New column name', 'column', '', { required: true, max: 80 })}<button type="submit">Add column</button></form><form id="cp-column-rename">${select('Column to rename', 'oldColumn', p.columns, p.columns[0])}${input('Replacement column name', 'column', '', { required: true, max: 80 })}<button type="submit">Rename column</button></form>${button('delete-project', 'Delete project and tasks', '', 'cp-danger')}</details><details open class="cp-inner-panel"><summary>Project communications</summary>${workspace.drafts.filter(d => d.projectId === p.id || p.tasks.some(t => t.draftId === d.id)).map(d => button('open-draft', escape(d.title), d.id)).join('') || '<p>No drafts attached. Select this project in a draft or attach a draft to a task.</p>'}${button('templates', 'Choose a communication template')}</details></section><aside class="cp-panel">${task() ? taskView() : '<h2>Task details</h2><p>Select Edit task to add an owner label, checklist, deadline, and related communication.</p>'}</aside></div>`;
}
function checklistHtml(items, scope) {
  return `<ul class="cp-checklist">${items.map(item => `<li><label><input type="checkbox" data-check="${scope}" data-id="${item.id}" ${item.done ? 'checked' : ''}>${escape(item.text)}</label>${button(`remove-${scope}-item`, 'Remove', item.id, 'cp-quiet')}</li>`).join('')}</ul><form data-checklist-form="${scope}" class="cp-inline-form">${input(scope === 'task' ? 'New checklist item' : 'Required document', 'text', '', { required: true, max: 2000 })}<button type="submit">Add item</button></form>`;
}
function taskView() {
  const t = task(), p = project();
  return `<h2>Task details</h2><form id="cp-task-form">${input('Task title', 'title', t.title, { max: 200, required: true })}${input('Description', 'description', t.description, { type: 'textarea' })}${input('Owner label', 'owner', t.owner, { max: 200, hint: 'A label only; no one is notified.' })}${select('Task status', 'status', p.columns, t.status)}${select('Priority', 'priority', ['Low', 'Normal', 'High'], t.priority)}${input('Due date', 'due', t.due, { type: 'date' })}${select('Linked communication', 'draftId', [['', 'No communication'], ...workspace.drafts.map(d => [d.id, d.title])], t.draftId)}<button type="submit" class="cp-primary">Save task</button></form><h3>Checklist</h3>${checklistHtml(t.checklist, 'task')}<div class="cp-actions">${t.draftId ? button('open-draft', 'Open linked communication', t.draftId) : ''}${button('delete-task', 'Delete task', '', 'cp-danger')}</div>`;
}
function grantView() {
  const p = project(), g = p.grant;
  const shortFields = ['funder', 'opportunity', 'organization', 'timezone', 'currency', 'owner', 'stage'];
  return `<div class="cp-work-columns"><section class="cp-panel"><span class="eyebrow">Grants / ${escape(p.title)}</span><h2 tabindex="-1">Grant application builder</h2>${isDemo(p)}<p>Paste the actual funder instructions first. Your supplied questions and limits take priority over the starter sections. Every requirement and claim here is user-entered, not independently verified.</p><div class="cp-actions">${button('project', 'Tasks and application board')}${button('request-grant', 'Have It Written for Me')}<a class="cp-button" href="#cp-proposal">View proposal preview</a></div><details open class="cp-inner-panel"><summary>Opportunity, requirements, and project facts</summary><form id="cp-grant-fields">${grantFields.map(([key, label]) => input(label, key, g.fields[key], { type: key === 'source' ? 'url' : key === 'amount' ? 'number' : key === 'deadline' ? 'datetime-local' : shortFields.includes(key) ? 'text' : 'textarea', hint: key === 'need' ? 'Cite your evidence, source, and date. Mark unsupported claims [Evidence needed].' : key === 'eligibility' ? 'Paste requirements and record evidence; entry here does not establish eligibility.' : key === 'amount' ? 'Use the same currency as your budget. Other funding must be explained.' : '', attrs: key === 'amount' ? 'min="0" max="1000000000000" step="0.01"' : '' })).join('')}</form></details><h3>Narrative sections</h3><p>Draft to each funder question. Link costs and required documents to the section they support.</p><div id="cp-sections">${g.sections.map((s, i) => `<details class="cp-inner-panel" ${i === 0 ? 'open' : ''}><summary>${escape(s.title)} <span data-section-progress="${s.id}"></span></summary><form data-section-form="${s.id}">${input('Section title', 'title', s.title, { max: 200, required: true })}${input('Exact funder question and instructions', 'question', s.question, { type: 'textarea' })}<div class="cp-pair">${input('Limit supplied by funder (leave blank if unknown)', 'limit', s.limit, { type: 'number', attrs: 'min="1" max="1000000" step="1"' })}${select('Count unit', 'unit', ['words', 'characters'], s.unit)}</div>${input('Section narrative', 'text', s.text, { type: 'textarea', rows: 8, hint: 'Use supported facts. Mark gaps [Evidence needed]. Do not imply confirmed partnerships or results without evidence.' })}<p data-section-count="${s.id}" class="cp-note"></p><fieldset><legend>Linked budget lines</legend>${g.budget.length ? g.budget.map(b => `<label class="cp-check"><input type="checkbox" name="budgetIds" value="${b.id}" ${s.budgetIds.includes(b.id) ? 'checked' : ''}>${escape(b.label || 'Untitled cost')}</label>`).join('') : '<p>Add budget lines below to link them.</p>'}</fieldset><fieldset><legend>Linked required documents</legend>${g.documents.length ? g.documents.map(d => `<label class="cp-check"><input type="checkbox" name="documentIds" value="${d.id}" ${s.documentIds.includes(d.id) ? 'checked' : ''}>${escape(d.text)}</label>`).join('') : '<p>Add required documents below to link them.</p>'}</fieldset></form><div class="cp-actions">${button('copy-section', 'Copy section', s.id)}${button('delete-section', 'Delete section', s.id, 'cp-danger')}</div></details>`).join('')}</div><div class="cp-actions">${button('add-section', 'Add funder question / section')}${button('templates', 'Browse grant section templates', 'Grants')}</div><details open class="cp-inner-panel"><summary>Budget worksheet</summary><p>Amounts use the currency entered above. Each line is quantity × unit cost, rounded to two decimal places. The total is the sum of those lines.</p>${g.budget.map(b => `<form class="cp-budget-row" data-budget-form="${b.id}">${input('Cost item', 'label', b.label, { max: 200 })}<div class="cp-pair">${input('Quantity', 'quantity', b.quantity, { type: 'number', attrs: 'min="0" max="1000000" step="any"' })}${input('Unit cost', 'cost', b.cost, { type: 'number', attrs: 'min="0" max="1000000000" step="0.01"' })}</div>${input('Basis, evidence, or estimate assumptions', 'basis', b.basis, { type: 'textarea' })}<p data-budget-total="${b.id}"></p>${button('delete-budget', 'Remove budget line', b.id, 'cp-danger')}</form>`).join('')}${button('add-budget', 'Add budget line')}<p id="cp-budget-total" class="cp-total"></p></details><details open class="cp-inner-panel"><summary>Required documents checklist</summary><p>Track preparation here. No files are uploaded or attached.</p>${checklistHtml(g.documents, 'document')}</details><div class="cp-actions">${button('save-grant', 'Save grant application', '', 'cp-primary')}${button('request-grant', 'Prepare a grant writing request')}</div></section><aside class="cp-panel cp-preview"><h2>Combined proposal preview</h2><p>Edit the fields and narrative sections to update this preview.</p><label class="cp-field">Proposal text<textarea id="cp-proposal" rows="24" readonly></textarea></label>${exportActions('proposal')}<details open class="cp-inner-panel"><summary>Completion and review</summary><div id="cp-grant-review"></div><p>Counts and arithmetic do not establish compliance, eligibility, submission, or likelihood of funding. Compare the narrative to the budget and verify all claims with a responsible reviewer.</p></details></aside></div>`;
}
function updateGrantPreview() {
  const g = project()?.grant; if (!g || !$('#cp-proposal')) return;
  $('#cp-proposal').value = proposalText(project());
  $('#cp-budget-total').textContent = `Budget total: ${budgetTotal(g).toFixed(2)} ${g.fields.currency || '(currency missing)'} · Requested: ${g.fields.amount || 'not entered'}`;
  for (const b of g.budget) document.querySelector(`[data-budget-total="${b.id}"]`).textContent = `Line total: ${(Math.round(Number(b.quantity || 0) * Number(b.cost || 0) * 100) / 100).toFixed(2)}`;
  for (const s of g.sections) {
    const amount = countText(s.text, s.unit), exceeds = s.limit && amount > Number(s.limit);
    document.querySelector(`[data-section-count="${s.id}"]`).textContent = `${amount}${s.limit ? ' / ' + s.limit : ''} ${s.unit}${exceeds ? ' — Over the supplied limit' : s.limit ? ' — Within supplied limit; review content separately' : ' — No funder limit supplied'}`;
    document.querySelector(`[data-section-progress="${s.id}"]`).textContent = s.text.trim() ? ' · Drafted, needs review' : ' · Not drafted';
  }
  const issues = grantIssues(g);
  $('#cp-grant-review').innerHTML = `<p>${g.sections.filter(s => s.text.trim()).length}/${g.sections.length} sections contain text · ${g.documents.filter(d => d.done).length}/${g.documents.length} documents checked.</p><ul>${issues.map(issue => `<li>${escape(issue)}</li>`).join('') || '<li>No structural gaps detected. Human review still required.</li>'}</ul>`;
}
const requestFields = [
  ['documentType', 'Document type and purpose', true], ['audience', 'Intended audience', true],
  ['facts', 'Key facts and instructions', true], ['outcome', 'Desired outcome', true],
  ['tone', 'Preferred tone', false], ['length', 'Approximate length', false], ['deadline', 'Requested deadline', true],
  ['name', 'Your name', true], ['email', 'Preferred contact email', true]
];
const requestGrantFields = [
  ['funder', 'Funder and opportunity name'], ['source', 'Official opportunity link'], ['instructions', 'Application instructions'],
  ['amount', 'Requested amount and currency'], ['submissionDeadline', 'Submission deadline and time zone'],
  ['materials', 'Existing materials (describe only)'], ['sections', 'Sections requiring assistance']
];
function requestView() {
  const source = workspace.drafts.find(d => d.id === requestSource), application = workspace.projects.find(p => p.id === requestProject);
  return `<div class="cp-work-columns"><section class="cp-panel"><span class="eyebrow">Human writing assistance</span><h2 tabindex="-1">Have It Written for Me</h2><p>Prepare a request for personal, professional, managerial, board, project, or grant writing. Pricing, availability, scope, and delivery date must be agreed upon before work begins. Preparing this request does not mean a writer has accepted it.</p>${note('Request details stay in this tab until you copy, download, or open an email draft. They are not saved to project boards or example data. Avoid sensitive personal information. There is no file-upload service.')}<form id="cp-request-form">${select('Service', 'service', ['Writing from scratch', 'Editing', 'Formatting', 'Grant proposal writing', 'Grant editing', 'Budget narrative assistance', 'Application review'], request.service || 'Writing from scratch')}${requestFields.map(([key, label, required]) => input(label, key, request[key], { type: key === 'email' ? 'email' : key === 'deadline' ? 'date' : ['name', 'tone', 'length'].includes(key) ? 'text' : 'textarea', required })).join('')}<details class="cp-inner-panel" ${application || /grant|budget|application/i.test(request.service || '') ? 'open' : ''}><summary>Grant writing request details</summary>${requestGrantFields.map(([key, label]) => input(label, key, request[key], { type: key === 'source' ? 'url' : 'textarea' })).join('')}</details>${source ? `<label class="cp-check"><input id="cp-include-draft" type="checkbox" ${includeDraft ? 'checked' : ''}>Include the complete contents of “${escape(source.title)}” in this request</label>` : ''}${application?.grant ? `<label class="cp-check"><input id="cp-include-grant" type="checkbox" ${includeGrant ? 'checked' : ''}>Include all grant application details, narratives, budget, and checklist from “${escape(application.title)}”</label>` : ''}<p>Only explicitly selected draft or application contents are included. Inspect the summary before sharing.</p><div class="cp-actions"><button type="submit" data-request-export="copy">Copy request</button><button type="submit" data-request-export="download">Download request</button>${writingContact.email ? '<button type="submit" data-request-export="email" class="cp-primary">Open email draft</button>' : ''}</div></form><p>${writingContact.email ? `Destination: <a href="mailto:${escape(writingContact.email)}">${escape(writingContact.email)}</a>. You must send the email yourself. For long requests, download the text and attach it in your email app.` : 'No submission destination is configured. Copy or download the request and use the Contact page to arrange delivery.'}</p><p id="cp-request-status" role="status">Not submitted. No request has been delivered by this workspace.</p></section><aside class="cp-panel cp-preview"><h2>Live request summary</h2><label class="cp-field">Request text<textarea id="cp-request-preview" readonly rows="28"></textarea></label><p>Refresh clears these request details. Download before leaving if you want to keep them.</p></aside></div>`;
}
function requestText() {
  const source = workspace.drafts.find(d => d.id === requestSource), application = workspace.projects.find(p => p.id === requestProject);
  return ['CEAM+ human writing assistance request — not yet delivered', `Service\n${request.service || 'Writing from scratch'}`,
    ...[...requestFields, ...requestGrantFields].map(([key, label]) => `${label}\n${request[key]?.trim() || '[Not supplied]'}`),
    includeDraft && source ? `Explicitly included draft: ${source.title}\n${source.text}` : 'Draft contents: not included.',
    includeGrant && application?.grant ? `Explicitly included application\n${proposalText(application)}` : 'Application contents: not included.',
    'Pricing, availability, scope, and delivery date require agreement before work begins. This request is not an acceptance or delivery commitment.'
  ].join('\n\n');
}
function updateRequestPreview() { if ($('#cp-request-preview')) $('#cp-request-preview').value = requestText(); }
function beginRequest(d = '', p = '') { requestSource = d; requestProject = p; includeDraft = false; includeGrant = false; if (p) request.service = 'Grant proposal writing'; navigate('request'); }
function openDraft(templateId) {
  const d = createDraft(getTemplate(templateId, workspace.customTemplates));
  if (selectedProject && workspace.projects.some(p => p.id === selectedProject)) d.projectId = selectedProject;
  workspace.drafts.push(d); selectedDraft = d.id; save('New draft created in this browser.'); navigate('editor');
}
function openNewGrant() { selectedProject = ''; navigate('new-project'); $('#cp-new-project-form [name=kind]').value = 'Grant application'; }

$('#cp-app').addEventListener('input', event => {
  const target = event.target;
  if (target.id === 'cp-search') { search = target.value; sidebar(); if (['templates', 'overview'].includes(view)) render(); return; }
  if (target.closest('#cp-draft-form')) {
    const d = draft(); if (target.name.startsWith('value:')) d.values[target.name.slice(6)] = target.value; else d[target.name] = target.value;
    if (!d.edited) { d.text = assemble(getTemplate(d.templateId, workspace.customTemplates), d.values); $('#cp-preview').value = d.text; }
    d.updated = new Date().toISOString(); save(); updateDraftReview();
  } else if (target.id === 'cp-preview') {
    const d = draft(); d.text = target.value; d.edited = true; d.updated = new Date().toISOString(); save(); updateDraftReview();
    $('#cp-preview-mode').textContent = 'Your edited version is preserved. Rebuild only if you want to replace it with the guided fields.';
  } else if (target.closest('#cp-task-form')) {
    task()[target.name] = target.value; save();
  } else if (target.closest('#cp-grant-fields')) {
    if (!target.validity.valid) { announce('Check the amount or link format before saving this field.', true); return; }
    project().grant.fields[target.name] = target.value; save(); updateGrantPreview();
  } else if (target.closest('[data-section-form]')) {
    if (!target.validity.valid) { announce('Use a positive whole number for the section limit.', true); return; }
    const form = target.closest('form'), s = project().grant.sections.find(s => s.id === form.dataset.sectionForm);
    if (target.type === 'checkbox') s[target.name] = [...form.querySelectorAll(`[name="${target.name}"]:checked`)].map(c => c.value); else s[target.name] = target.value;
    save(); updateGrantPreview();
  } else if (target.closest('[data-budget-form]')) {
    if (!target.validity.valid) { announce('Use a nonnegative amount within the displayed budget limits.', true); return; }
    const b = project().grant.budget.find(b => b.id === target.closest('form').dataset.budgetForm); b[target.name] = target.value; save(); updateGrantPreview();
  } else if (target.closest('#cp-request-form')) {
    if (target.id === 'cp-include-draft') includeDraft = target.checked;
    else if (target.id === 'cp-include-grant') includeGrant = target.checked;
    else request[target.name] = target.value;
    updateRequestPreview();
    if (target.name === 'service' && /grant|budget|application/i.test(target.value)) target.form.querySelector('details').open = true;
  }
});
$('#cp-app').addEventListener('change', event => {
  const target = event.target;
  if (target.id === 'cp-filter') { filter = target.value; sidebar(); if (['templates', 'overview'].includes(view)) render(); }
  if (target.dataset.moveTask) { project().tasks.find(t => t.id === target.dataset.moveTask).status = target.value; save('Task status updated.'); render(); }
  if (target.dataset.check) { const items = target.dataset.check === 'task' ? task().checklist : project().grant.documents; items.find(i => i.id === target.dataset.id).done = target.checked; save(); if (view === 'grant') updateGrantPreview(); }
  if (target.id === 'cp-import') importBackup(target.files[0]);
});
async function importBackup(file) {
  if (!file) return;
  try {
    if (file.size > MAX_BACKUP_BYTES) throw new Error('Backup exceeds 4 MB.');
    const next = parseBackup(await file.text());
    if (!confirm(`Replace this Studio workspace with ${next.drafts.length} drafts and ${next.projects.length} projects? Export your current work first. Other CEAM+ data will not be changed.`)) return;
    // Write first. A quota/storage failure must leave both the current session and saved workspace intact.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); workspace = next; blocked = false; unsaved = false; selectedProject = ''; selectedDraft = ''; selectedTask = ''; navigate('overview'); announce('Backup restored and saved in this browser.');
  } catch (error) { announce(`Import rejected. Current work is unchanged. ${error.message}`, true); }
  finally { $('#cp-import').value = ''; }
}
$('#cp-app').addEventListener('submit', async event => {
  event.preventDefault(); const form = event.target, data = Object.fromEntries(new FormData(form));
  if (form.id === 'cp-new-project-form') {
    if (!data.title.trim()) { announce('Enter a project name.', true); return; }
    const p = createProject(data.title.trim(), data.kind); workspace.projects.push(p); selectedProject = p.id; selectedTask = ''; save('Project created.'); navigate(p.grant ? 'grant' : 'project');
  } else if (form.id === 'cp-project-settings') {
    if (!data.title.trim()) return; project().title = data.title.trim(); save('Project renamed.'); render();
  } else if (form.id === 'cp-column-add' || form.id === 'cp-column-rename') {
    const p = project(), name = data.column.trim();
    if (!name || p.columns.includes(name)) { announce('Choose a nonempty, unique column name.', true); return; }
    if (form.id === 'cp-column-add') { if (p.columns.length >= 20) { announce('This board supports up to 20 columns.', true); return; } p.columns.push(name); }
    else { p.columns[p.columns.indexOf(data.oldColumn)] = name; p.tasks.filter(t => t.status === data.oldColumn).forEach(t => { t.status = name; }); }
    save('Columns updated.'); render();
  } else if (form.id === 'cp-task-form') { save('Task saved.'); render(); }
  else if (form.dataset.checklistForm) {
    if (!data.text.trim()) return;
    const list = form.dataset.checklistForm === 'task' ? task().checklist : project().grant.documents;
    list.push({ id: id(), text: data.text.trim(), done: false }); save('Checklist item added.'); render();
  } else if (form.id === 'cp-request-form') {
    request = { ...request, ...data }; updateRequestPreview();
    const kind = event.submitter?.dataset.requestExport, text = requestText();
    if (kind === 'copy') { await copy(text); $('#cp-request-status').textContent = 'Request prepared for copying. Not submitted; no request has been delivered.'; }
    if (kind === 'download') { download(text, 'CEAM-writing-request.txt'); $('#cp-request-status').textContent = 'Request downloaded. Not submitted; send it yourself after review.'; }
    if (kind === 'email') {
      const url = `mailto:${writingContact.email}?subject=${encodeURIComponent('CEAM+ writing assistance request')}&body=${encodeURIComponent(text)}`;
      if (url.length > 1800) { download(text, 'CEAM-writing-request.txt'); $('#cp-request-status').textContent = 'The request is too long for a reliable email link. Text downloaded; attach it in your email app and send to the listed contact. Not submitted.'; }
      else { const a = document.createElement('a'); a.href = url; a.click(); $('#cp-request-status').textContent = 'Email draft requested in your email app. Review and send it there. Delivery has not been confirmed.'; }
    }
  }
});

$('#cp-app').addEventListener('click', async event => {
  const control = event.target.closest('[data-action]'); if (!control) return;
  const action = control.dataset.action, value = control.dataset.id;
  switch (action) {
    case 'templates': if (value) { filter = value; $('#cp-filter').value = value; } navigate('templates'); break;
    case 'overview': navigate('overview'); break;
    case 'blank': openDraft('blank'); break;
    case 'use-template': openDraft(value); break;
    case 'open-draft': selectedDraft = value; navigate('editor'); break;
    case 'save-draft': if (!$('#cp-draft-form').reportValidity()) break; save('Draft saved in this browser.'); sidebar(); break;
    case 'duplicate-draft': { const d = structuredClone(draft()); d.id = id(); d.title = (d.title + ' (copy)').slice(0, 160); d.updated = new Date().toISOString(); workspace.drafts.push(d); selectedDraft = d.id; save('Draft duplicated.'); navigate('editor'); break; }
    case 'custom-template': { const d = draft(), original = getTemplate(d.templateId, workspace.customTemplates); workspace.customTemplates.push({ id: id(), name: d.title || 'Custom template', category: original.category, guidance: 'Your saved preview. Replace retained names, facts, and dates before reuse.', fields: [], body: d.text }); save('Reusable template saved. Find it with the Custom category filter.'); break; }
    case 'delete-template': if (workspace.drafts.some(d => d.templateId === value)) { announce('This template is used by a draft. Delete or replace those drafts before deleting the template.', true); break; } if (confirm('Delete this reusable template?')) { workspace.customTemplates = workspace.customTemplates.filter(t => t.id !== value); save('Template deleted.'); render(); } break;
    case 'regenerate': if (confirm('Replace the preview with a fresh draft from the guided fields? Direct preview edits will be lost.')) { const d = draft(); d.text = assemble(getTemplate(d.templateId, workspace.customTemplates), d.values); d.edited = false; save('Preview rebuilt.'); render(); } break;
    case 'delete-draft': if (confirm('Delete this draft and remove its task links?')) { workspace.projects.forEach(p => p.tasks.forEach(t => { if (t.draftId === selectedDraft) t.draftId = ''; })); workspace.drafts = workspace.drafts.filter(d => d.id !== selectedDraft); selectedDraft = ''; save('Draft deleted.'); navigate('templates'); } break;
    case 'new-project': navigate('new-project'); break;
    case 'new-grant': openNewGrant(); break;
    case 'open-project': selectedProject = value; selectedTask = ''; navigate('project'); break;
    case 'project': navigate('project'); break;
    case 'grant': navigate('grant'); break;
    case 'list-view': boardView = 'list'; render(); break;
    case 'kanban-view': boardView = 'kanban'; render(); break;
    case 'add-task': { const t = { id: id(), title: 'New task', description: '', owner: '', status: project().columns[0], priority: 'Normal', due: '', checklist: [], draftId: '' }; project().tasks.push(t); selectedTask = t.id; save(); render(); $('#cp-task-form [name=title]').focus(); break; }
    case 'edit-task': selectedTask = value; render(); $('#cp-task-form [name=title]').focus(); break;
    case 'delete-task': if (confirm('Delete this task and its checklist? The linked draft will be retained.')) { project().tasks = project().tasks.filter(t => t.id !== selectedTask); selectedTask = ''; save('Task deleted.'); render(); } break;
    case 'delete-project': if (confirm('Delete this project, tasks, and grant application details? Communication drafts will be retained without the project link.')) { workspace.drafts.forEach(d => { if (d.projectId === selectedProject) d.projectId = ''; }); workspace.projects = workspace.projects.filter(p => p.id !== selectedProject); selectedProject = ''; selectedTask = ''; save('Project deleted.'); navigate('overview'); } break;
    case 'add-section': { project().grant.sections.push({ id: id(), title: 'Additional funder question', question: '', text: '', limit: '', unit: 'words', budgetIds: [], documentIds: [] }); save(); render(); const panel = $('#cp-sections details:last-child'); panel.open = true; panel.querySelector('input').focus(); break; }
    case 'delete-section': if (confirm('Delete this narrative section?')) { project().grant.sections = project().grant.sections.filter(s => s.id !== value); save(); render(); } break;
    case 'copy-section': { const s = project().grant.sections.find(s => s.id === value); await copy(`${s.title}\n\n${s.text}`); break; }
    case 'add-budget': project().grant.budget.push({ id: id(), label: '', quantity: '', cost: '', basis: '' }); save(); render(); document.querySelector('[data-budget-form]:last-of-type input')?.focus(); break;
    case 'delete-budget': if (confirm('Remove this budget line and its narrative links?')) { project().grant.budget = project().grant.budget.filter(b => b.id !== value); project().grant.sections.forEach(s => { s.budgetIds = s.budgetIds.filter(ref => ref !== value); }); save(); render(); } break;
    case 'remove-task-item': case 'remove-document-item': if (confirm('Remove this checklist item?')) { if (action === 'remove-task-item') task().checklist = task().checklist.filter(i => i.id !== value); else { project().grant.documents = project().grant.documents.filter(i => i.id !== value); project().grant.sections.forEach(s => { s.documentIds = s.documentIds.filter(ref => ref !== value); }); } save(); render(); } break;
    case 'save-grant': if ([...document.querySelectorAll('#cp-main form')].some(form => !form.reportValidity())) break; save('Grant application saved locally. It has not been submitted.'); break;
    case 'request': beginRequest(); break;
    case 'request-draft': beginRequest(selectedDraft); break;
    case 'request-grant': beginRequest('', selectedProject); break;
    case 'copy-draft': await copy(draft().text); break;
    case 'download-draft': download(draft().text, `${draft().title || 'CEAM-draft'}.txt`); break;
    case 'print-draft': printText(draft().text); break;
    case 'copy-proposal': await copy(proposalText(project())); break;
    case 'download-proposal': download(proposalText(project()), `${project().title || 'CEAM-proposal'}.txt`); break;
    case 'print-proposal': printText(proposalText(project())); break;
    case 'export': download(JSON.stringify(workspace, null, 2), 'CEAM-studio-backup.json', 'application/json'); announce('Workspace backup downloaded. Keep it private; it contains your saved text and owner labels.'); break;
    case 'demo': if (addDemo(workspace)) { save('Fictional examples added alongside your work.'); navigate('overview'); } else announce('Fictional examples are already present.'); break;
    case 'clear-demo': if (confirm('Delete all records labeled fictional, including edits to those examples? Your other records will remain.')) { const pids = workspace.projects.filter(p => p.fictional).map(p => p.id), dids = workspace.drafts.filter(d => d.fictional).map(d => d.id); workspace.projects = workspace.projects.filter(p => !p.fictional); workspace.drafts = workspace.drafts.filter(d => !d.fictional); workspace.drafts.forEach(d => { if (pids.includes(d.projectId)) d.projectId = ''; }); workspace.projects.forEach(p => p.tasks.forEach(t => { if (dids.includes(t.draftId)) t.draftId = ''; })); selectedDraft = ''; selectedProject = ''; save('Fictional examples cleared.'); navigate('overview'); } break;
    case 'recover-raw': download(rawStored || 'No stored workspace was readable.', 'CEAM-studio-recovery.txt'); break;
    case 'reset-workspace': if (confirm('Permanently clear this Communication & Planning Studio workspace? Export first. Other CEAM+ data will remain.')) { try { localStorage.removeItem(STORAGE_KEY); workspace = emptyWorkspace(); blocked = false; selectedDraft = ''; selectedProject = ''; selectedTask = ''; unsaved = false; navigate('templates'); announce('Studio workspace cleared.'); } catch { announce('Browser storage could not be cleared.', true); } } break;
  }
});
window.addEventListener('storage', event => { if (event.key === STORAGE_KEY) { blocked = true; announce('This workspace changed in another tab. Saving paused. Export this session if needed, then reload to use the latest saved version.', true); } });
window.addEventListener('beforeunload', event => { if (blocked || unsaved || Object.values(request).some(Boolean)) { event.preventDefault(); event.returnValue = ''; } });
$('#cp-app').hidden = false;
$('#cp-loading').hidden = true;
if (matchMedia('(max-width: 760px)').matches) document.querySelectorAll('.cp-sidebar > details').forEach(panel => { panel.open = false; });
render();
if (blocked) announce('Saved data could not be read. Saving is paused to protect it. Use workspace recovery below to download the original, import a valid backup, or clear this Studio workspace.', true);
else announce('Ready. Your work stays in this browser; it does not sync across devices.');
