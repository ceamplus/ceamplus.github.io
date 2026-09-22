import { measurementHTML } from './measurement-dictionary.mjs';
import { mountAIAnalysis } from './ai-analysis-view.mjs';
import { marketingEvidenceForm, marketingEvidenceReport } from './marketing-evidence.mjs';
import { assessments, getAssessment } from './definitions.mjs';
import { scoreAssessment, FINANCIAL_FIELDS, financialMetrics } from './scoring.mjs';
import { loadState, saveDraft, saveResult, getHistory, clearAssessment, deleteDraft, assessmentKey } from './storage.mjs';
import { industries, sizes, departments, objectivesFor, defaultProfile, sanitizeProfile, tailorAssessment, profileLabel } from './personalization.mjs';
import { classifyQuestion, dimensionLabel } from './ceam-metadata.mjs';
import { buildInterpretation } from './interpretation.mjs';
import { glossaryTerm, initGlossary } from '../glossary.mjs';
import { buildMarketingProfile } from './marketing-diagnostics.mjs';
import { renderMarketingResults } from './marketing-results.mjs';
import { cleanMarketingContext, marketingContextSignature, marketingContextHTML } from './marketing-context.mjs';

const $ = selector => document.querySelector(selector);
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const clone = value => JSON.parse(JSON.stringify(value));
const fmt = value => value === null || value === undefined ? 'Not scored' : Number(value).toLocaleString(undefined, { maximumFractionDigits:1 });
const date = value => new Date(value).toLocaleString();
const dayAfter = days => { const when = new Date(); when.setDate(when.getDate() + days); return when.toISOString().slice(0,10); };
const uniqueLinks = links => [...new Map(links.map(link => [link.href + link.label, link])).values()];
const linkList = links => `<div class="ac-result-links">${uniqueLinks(links).map(link => `<a href="${escape(link.href)}">${escape(link.label)}</a>`).join('')}</div>`;
let active = null;
let response = null;
let result = null;
let interpretation = null;
let step = 0;
let saving = false;
let filter = 'All';
let lastDraftScope = null;

function status(message) { $('#ac-status').textContent = message; }
function ensureMetadata(definition) {
  definition?.dimensions?.forEach(dimension => dimension.questions?.forEach(question => {
    question.metadata ||= classifyQuestion(question, { assessment: definition, dimension });
  }));
  return definition;
}
function reportStorage(outcome, success = '') { status(outcome.ok ? success : `Browser saving is unavailable: ${outcome.error || 'storage could not be accessed'}. Your current answers remain in this tab; download a report to keep them.`); return outcome.ok; }
function storeDraft() {
  if (!saving || !response || response.demo || result) return;
  const saved = saveDraft(active, response);
  if (reportStorage(saved)) {
    if (lastDraftScope && assessmentKey(active, lastDraftScope) !== assessmentKey(active, response)) deleteDraft(active, lastDraftScope);
    lastDraftScope = clone(response);
  }
}
function storeCompleted() { if (saving && response && !response.demo && result) reportStorage(saveResult(active, response, result), 'Assessment and action plan saved in this browser.'); }
function focusWorkspace() { $('#ac-workspace').scrollIntoView({behavior:'instant',block:'start'}); const heading = $('#ac-workspace h2'); if (heading) { heading.tabIndex = -1; heading.focus({preventScroll:true}); } }
function showWorkspace() { $('#ac-workspace').hidden = false; $('#ac-landing').hidden = true; $('#center-intro').hidden = true; }

function renderCatalogue() {
  const categories = ['All', ...new Set(assessments.map(item => item.category)), 'Recommended for me'];
  $('#ac-filters').innerHTML = categories.map(category => `<button type="button" data-filter="${escape(category)}" aria-pressed="${category === filter}">${escape(category)}</button>`).join('');
  const shown = assessments.filter(item => filter === 'All' || item.category === filter);
  $('#ac-catalogue-count').textContent = `${shown.length} assessments · Evidence-led profiles with actions and follow-up`;
  $('#ac-catalogue').innerHTML = shown.map(item => `<article class="ac-card" data-assessment-card="${item.id}"><span class="ac-category">${escape(item.category)}</span><h3>${escape(item.title)}</h3><p>${escape(item.purpose)}</p><p class="ac-meta">${item.timeMinutes} minutes · ${item.dimensions.length} dimensions</p><p><strong>For:</strong> ${escape(item.audience)}</p><details><summary>Learn More</summary><p><strong>What evidence helps:</strong> ${escape(item.evidence.join('; '))}.</p><p><strong>What you receive:</strong> ${escape(item.output)}</p><p><strong>Dimensions:</strong> ${escape(item.dimensions.map(d=>d.title).join(', '))}.</p></details><div class="ac-actions"><button type="button" class="button primary" data-start="${item.id}">Start Assessment</button></div></article>`).join('');
}

function renderSaved() {
  const loaded = loadState();
  if (!loaded.ok) { $('#ac-saved').innerHTML = '<p>Saved assessments could not be read. Current-tab assessment use remains available.</p>'; return; }
  const {state} = loaded;
  const compatible = record => getAssessment(record.assessmentId)?.version === record.version || (record.assessmentId==='ai-adoption' && record.version==='2.0-analysis');
  const drafts = Object.values(state.drafts).filter(compatible);
  const records = Object.values(state.results).flat().filter(compatible).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  $('#ac-saved').innerHTML = `<h3>Saved in this browser</h3>${!drafts.length && !records.length ? '<p>No saved assessments yet. Enable browser saving when you start to keep a draft, baseline, or follow-up.</p>' : ''}${drafts.map((d,i)=>`<p><button class="button secondary" data-resume="${i}" type="button">Resume ${escape(getAssessment(d.assessmentId).title)}</button> <span class="ac-small">${escape(d.context)} · ${escape(d.initiative || 'No named initiative')} · ${date(d.updatedAt)}</span></p>`).join('')}${records.slice(0,24).map((r,i)=>`<p><button class="button secondary" data-open-result="${i}" type="button">Open ${escape(getAssessment(r.assessmentId).title)} report</button> <span class="ac-small">${escape(r.context)} · ${escape(r.initiative || 'No named initiative')} · ${date(r.createdAt)}</span></p>`).join('')}`;
  $('#ac-saved').querySelectorAll('[data-resume]').forEach(button => button.addEventListener('click',()=>{const draft=drafts[Number(button.dataset.resume)]; if(draft.response.aiAnalysis){openAIAnalysis(clone(draft.response));return;} start(draft.assessmentId,clone(draft.response)); saving=true; renderSetup();}));
  $('#ac-saved').querySelectorAll('[data-open-result]').forEach(button=>button.addEventListener('click',()=>{const record=records[Number(button.dataset.openResult)]; response=clone(record.response); active=ensureMetadata(response.definitionSnapshot || (response.profile?tailorAssessment(getAssessment(record.assessmentId),response.profile):getAssessment(record.assessmentId))); response.resultId=record.id; response.completedAt=record.createdAt; result=clone(record.result); saving=true; showWorkspace(); renderResults(); focusWorkspace();}));
}

function start(id, previous = null, demo = false) {
  if(id==='ai-adoption'&&previous?.aiAnalysis)return openAIAnalysis(previous);
  const base = getAssessment(id);
  if (!base) return;
  response = previous || {answers:{},evidence:{},priorities:[],context:base.contextOptions?.[0] || 'Organization / team',initiative:'',metrics:{},actionPlan:[],demo,profile:(id==='personal-change'||id==='marketing-assessment')?null:{...defaultProfile,department:base.category==='Marketing & Customer'?'marketing':defaultProfile.department}};
  if (response.profile) response.profile = sanitizeProfile(response.profile);
  active = ensureMetadata(response.definitionSnapshot || (response.profile ? tailorAssessment(base, response.profile) : base));
  response.tailoringSignature = active.tailoring?.signature || '';
  lastDraftScope = previous ? clone(previous) : null;
  response.answers ||= {}; response.evidence ||= {}; response.priorities ||= []; response.metrics ||= {}; response.actionPlan ||= [];
  if (id === 'marketing-assessment') { response.marketingContext = cleanMarketingContext(response.marketingContext); response.tailoringSignature = marketingContextSignature(response.marketingContext); }
  result = null; interpretation = null; step = 0; saving = false; status('');
  showWorkspace();
  history.replaceState(null,'',`?assessment=${encodeURIComponent(active.id)}`);
  renderSetup(); focusWorkspace();
}

function topLine(label) { return `<div class="ac-workspace-head"><span class="eyebrow">${escape(active.category)} / ${label}</span><button class="button secondary ac-no-print" type="button" data-home>All Assessments</button></div>${response.demo ? '<div class="ac-demo">Fictional demonstration · Example answers, evidence, and business values. This demo is never saved to your real history.</div>' : ''}`; }
function setupFields() { return `<div class="ac-form-grid"><label>Context<select id="ac-context">${(active.contextOptions?.length ? active.contextOptions : ['Organization / team']).map(context=>`<option${context===response.context?' selected':''}>${escape(context)}</option>`).join('')}</select></label><label>Initiative or change being considered<input id="ac-initiative" maxlength="180" value="${escape(response.initiative)}" placeholder="e.g. CRM deployment or new marketing strategy"></label></div>`; }
function renderPersonalization() {
  if (!response.profile) return;
  let panel = $('#ac-personalization');
  if (!panel) { panel=document.createElement('section'); panel.id='ac-personalization'; $('#ac-context').closest('.ac-form-grid').before(panel); }
  const locked = Object.keys(response.answers).length > 0;
  const select = (key,label,options) => `<label>${label}<select data-profile="${key}"${locked?' disabled':''}>${options.map(option=>`<option value="${option.id}"${response.profile[key]===option.id?' selected':''}>${escape(option.label)}</option>`).join('')}</select></label>`;
  panel.innerHTML=`<h3>Make this assessment fit your organization.</h3><div class="ac-form-grid">${select('industry','What best describes your organization?',industries)}${select('size','Organization size / complexity',sizes)}${select('department','Department / business function',departments)}${select('objective','What are you trying to improve?',objectivesFor(response.profile.department,response.profile.industry))}</div><p class="ac-small">${locked?'This profile is fixed for the recorded responses. Start a new assessment to evaluate a different profile.':'Size describes operating context, not maturity. Questions, examples, evidence, and actions adapt while retaining common CEAM+ constructs.'}</p><details><summary>How this assessment is tailored</summary><p>${escape(active.tailoring?.label||profileLabel(response.profile))}</p><p>Core conditions + industry + size and complexity + department + objective. Question and dimension weights are disclosed with your results. Comparisons require the same profile and content version.</p></details>`;
  panel.querySelectorAll('[data-profile]').forEach(input=>input.addEventListener('change',()=>{
    response.profile=sanitizeProfile({...response.profile,[input.dataset.profile]:input.value});
    active=tailorAssessment(getAssessment(active.id),response.profile);
    response.tailoringSignature=active.tailoring.signature;
    delete response.definitionSnapshot;
    renderPersonalization();
  }));
}
function saveControl() { return `<label class="ac-check ac-no-print"><input type="checkbox" id="ac-saving"${saving?' checked':''}${response.demo?' disabled':''}><span>Optional: save answers, evidence notes, and results in this browser. This does not submit the assessment. Anyone using this browser profile may access them.</span></label>`; }
function renderSetup() {
  if(response?.aiAnalysis)return openAIAnalysis(response,result);
  $('#ac-workspace').innerHTML = `${topLine('Your context')}<h2>${escape(active.title)}</h2><p>${escape(active.purpose)}</p><p class="ac-meta">${active.timeMinutes} minutes · ${active.dimensions.length} dimensions · Version ${escape(active.version)}</p><div class="ac-question-card"><h3>Begin with a specific question.</h3><p>Describe the conditions for one initiative and use the same context when you reassess. Choose “Not sure” when evidence is missing. “Not applicable” is available where appropriate; neither counts as a low score.</p>${setupFields()}<p><strong>Evidence that improves this assessment:</strong> ${escape(active.evidence.join('; '))}.</p><details><summary>Choose dimensions that matter most to your current objective</summary><p>Selected dimensions receive a disclosed planning-priority adjustment; they do not change your assessment score.</p><div class="ac-form-grid">${active.dimensions.map(d=>`<label class="ac-check"><input type="checkbox" data-priority="${d.id}"${response.priorities.includes(d.id)?' checked':''}>${escape(d.title)}</label>`).join('')}</div></details><div class="ac-note"><strong>Interpret with context.</strong> Assessment results identify patterns and questions for further investigation. They are not diagnoses, guarantees, or deterministic predictions. Evidence ratings are your descriptions, not independent verification.</div>${saveControl()}<div class="ac-actions"><button class="button primary" id="ac-begin" type="button">${Object.keys(response.answers).length?'Continue Assessment':'Begin Assessment'}</button>${response.demo?'<button class="button secondary" data-demo-results type="button">Explore Demo Results</button>':''}</div></div>`;
  $('#ac-context').addEventListener('change',e=>{response.context=e.target.value;});
  $('#ac-initiative').addEventListener('input',e=>{response.initiative=e.target.value;});
  document.querySelectorAll('[data-priority]').forEach(input=>input.addEventListener('change',()=>{response.priorities=[...document.querySelectorAll('[data-priority]:checked')].map(i=>i.dataset.priority);}));
  bindSave();
  renderPersonalization();
  if(active.id==='ai-adoption'){const modes=document.createElement('section');modes.className='ac-note';modes.innerHTML='<h3>Choose the AI assessment mode</h3><p>This page retains AI Readiness for organizations considering adoption. Use the separate mode below to investigate existing applications or a business case.</p><button type="button" id="ai-use-mode" class="button primary">AI Use &amp; Case Analysis</button>';$('#ac-workspace h2').after(modes);$('#ai-use-mode').onclick=()=>openAIAnalysis();}
  if (active.id === 'marketing-assessment') {
    const card = $('#ac-workspace .ac-question-card');
    const scale = document.createElement('section');
    scale.className = 'ac-note'; scale.id = 'marketing-scale';
    scale.innerHTML = `<h3>How to respond</h3><p>Rate each statement from 1 to 5 for your organization's current conditions.</p><ul>${active.dimensions[0].questions[0].options.map(option=>`<li>${escape(option.label)}</li>`).join('')}</ul><p>Choose “Not sure” if you cannot give a supported rating. Unknown or unanswered items do not count as a low score.</p><p>Assess → Diagnose → Decide → Act → Measure → Learn → Reassess</p>`;
    card.before(scale);
    card.querySelector('.ac-form-grid').insertAdjacentHTML('afterend', marketingContextHTML(response.marketingContext, Object.keys(response.answers).length > 0));
    card.querySelectorAll('[data-marketing-context]').forEach(input=>input.addEventListener('change',()=>{
      response.marketingContext = cleanMarketingContext(Object.fromEntries([...card.querySelectorAll('[data-marketing-context]')].map(field=>[field.dataset.marketingContext,field.value])));
      response.tailoringSignature = marketingContextSignature(response.marketingContext);
      storeDraft();
    }));
  }
  $('#ac-begin').addEventListener('click',()=>{response.definitionSnapshot=clone(active);storeDraft(); renderStep(); focusWorkspace();});
}

const SCALES = {
  maturity:[['1','1 — Not currently in place'],['2','2 — Beginning'],['3','3 — Developing'],['4','4 — Established'],['5','5 — Advanced']],
  agreement:[['1','1 — Strongly disagree'],['2','2 — Disagree'],['3','3 — Neither / uncertain'],['4','4 — Agree'],['5','5 — Strongly agree']],
  'yes-partly-no':[['yes','Yes'],['partly','Partly'],['no','No']],
  evidence:[['available','Evidence available'],['unavailable','Evidence not available']]
};
function questionText(text) { return text.replaceAll('{initiative}',response.initiative || 'this initiative').replaceAll('{context}',response.context || 'this context'); }
function questionMeaningHTML(q) {
  if (active.id === 'marketing-assessment') return '';
  const m=q.metadata;if(!m)return '';
  const dimensions=[m.primaryCeamDimension,...(m.secondaryCeamDimensions||[])];
  return `<details class="ac-question-why"><summary>Why this question matters</summary><p><strong>Underlying variable:</strong> ${escape(m.underlyingVariable)} · <strong>CEAM+:</strong> ${dimensions.map(code=>escape(dimensionLabel(code))).join(' · ')}</p><p>${escape(m.definition)}</p><p><strong>How CEAM+ uses this:</strong> ${escape(m.interpretationGuidance)}</p><p><strong>Potential outcomes:</strong> ${escape((m.outcomesAffected||[]).join(', '))}.</p>${m.plusReason?`<p><strong>Why Plus applies:</strong> ${escape(m.plusReason)}</p>`:''}<p class="ac-small">${escape(m.conceptualStatus)}</p></details>`;
}
function questionHTML(q) {
  const answer = String(response.answers[q.id] ?? '');
  let options = q.options?.map(o=>[o.value,o.label]) || SCALES[q.type] || [];
  options = [...options,['unsure','Not sure'],...(q.allowNA?[['na','Not applicable']]:[])];
  return `<fieldset class="ac-question"><legend>${escape(questionText(q.text))}</legend>${q.type==='numeric'?`<label>Numeric value<input type="number" data-answer="${q.id}" step="any"${q.min!==undefined?` min="${q.min}"`:''}${q.max!==undefined?` max="${q.max}"`:''} value="${/^-?\d+(\.\d+)?$/.test(answer)?escape(answer):''}"></label>`:''}<div class="ac-options">${options.map(([value,label])=>`<label><input type="radio" name="${q.id}" data-answer="${q.id}" value="${escape(value)}"${answer===String(value)?' checked':''}><span>${escape(label)}</span></label>`).join('')}</div>${questionMeaningHTML(q)}</fieldset>`;
}
function renderStep() {
  if (active.id === 'marketing-assessment') return renderMarketingStep();
  const dim=active.dimensions[step];
  const questions=active.dimensions.flatMap(d=>d.questions);
  const answered=questions.filter(q=>response.answers[q.id]!==undefined && response.answers[q.id]!=='').length;
  const ev=response.evidence[dim.id] || {quality:'none',note:'',source:'',contradiction:false};
  $('#ac-workspace').innerHTML=`${topLine('Assessment')}<h2>${escape(active.title)}</h2><p class="ac-small">${escape(response.context)} · ${escape(response.initiative || 'No named initiative')}</p><div class="ac-step-layout"><aside class="ac-step-nav ac-no-print"><label for="ac-progress">${answered} of ${questions.length} responses recorded</label><progress id="ac-progress" value="${answered}" max="${questions.length}"></progress><ol>${active.dimensions.map((d,i)=>`<li><button type="button" data-step="${i}"${i===step?' aria-current="step"':''}>${i+1}. ${escape(d.title)}${d.questions.every(q=>response.answers[q.id]!==undefined && response.answers[q.id]!=='')?' ✓':''}</button></li>`).join('')}</ol><button type="button" class="button secondary" data-edit-context>Review Context</button></aside><div class="ac-question-card"><span class="eyebrow">Dimension ${step+1} of ${active.dimensions.length}</span><h3>${escape(dim.title)}</h3><p>${escape(dim.why)}</p>${dim.questions.map(questionHTML).join('')}<section class="ac-evidence-box"><h4>What supports these responses?</h4><p class="ac-small">${escape(dim.evidenceNeeded)}. Describe sources and date range; quality is self-declared and is not scientifically verified.</p><label>Evidence quality<select id="ac-evidence-quality"><option value="none">No evidence available</option><option value="anecdotal">Anecdotal</option><option value="some">Some documented evidence</option><option value="strong">Strong documented evidence</option></select></label><div class="ac-form-grid"><label>Source / reporting period<input id="ac-evidence-source" maxlength="500" value="${escape(ev.source)}" placeholder="e.g. customer interviews, Q3 2026"></label><label>Evidence notes<textarea id="ac-evidence-note" maxlength="4000">${escape(ev.note)}</textarea></label></div><label class="ac-check"><input type="checkbox" id="ac-contradiction"${ev.contradiction?' checked':''}>The available sources or responses conflict. Investigate before drawing a conclusion.</label></section>${saveControl()}<div class="ac-actions"><button class="button secondary" type="button" data-previous${step===0?' disabled':''}>Previous</button>${step<active.dimensions.length-1?'<button class="button primary" type="button" data-next>Next Dimension</button>':`<button class="button primary" type="button" data-review>${active.id==='financial-marketing'?'Add Business Numbers / Review':'Review Results'}</button>`}<button class="button secondary" type="button" data-review>Review Available Responses</button></div><p class="ac-small">You may review an incomplete profile. Coverage, unknowns, and evidence gaps will remain visible.</p></div></div>`;
  if(active.id==='ai-adoption') {
    const guide={name:dim.title,definition:dim.why,why:dim.why,indicators:dim.questions.map(q=>q.text),question:dim.questions.map(q=>q.text).join(' '),metric:dim.kpi,variableTypes:['self-reported readiness and practice'],scale:'See each question’s explicit response options. Unknown and permitted not-applicable answers are excluded.',scoring:'Question-weighted dimension mean on 0–100; evidence support and response coverage remain separate.',interpretation:'Readiness describes reported conditions for adoption, not evidence that AI has created value. Use AI Use & Case Analysis for existing applications.',validationStatus:'Original CEAM+ authored readiness prompts; no empirical validation is claimed.',limitations:'Single-informant reports and conceptual planning weights need pilot and construct-validity research. These items are not a reproduced TAM or other validated scale.'};
    $('#ac-workspace .ac-question').insertAdjacentHTML('beforebegin',measurementHTML(guide));
  }
  $('#ac-evidence-quality').value=ev.quality;
  document.querySelectorAll('[data-answer]').forEach(input=>input.addEventListener('change',e=>{
    if(input.type==='number'&&!input.checkValidity()){input.reportValidity();return;}
    response.answers[input.dataset.answer]=e.target.value;storeDraft();
    const count=questions.filter(q=>response.answers[q.id]!==undefined&&response.answers[q.id]!=='').length;
    $('#ac-progress').value=count; document.querySelector('label[for=ac-progress]').textContent=`${count} of ${questions.length} responses recorded`;
  }));
  ['#ac-evidence-quality','#ac-evidence-source','#ac-evidence-note','#ac-contradiction'].forEach(selector=>$(selector).addEventListener('input',()=>{response.evidence[dim.id]={quality:$('#ac-evidence-quality').value,source:$('#ac-evidence-source').value,note:$('#ac-evidence-note').value,contradiction:$('#ac-contradiction').checked};storeDraft();}));
  bindSave();
}

function openAIAnalysis(previous=null,previousResult=null) {
  showWorkspace();
  history.replaceState(null,'','?assessment=ai-adoption&mode=analysis');
  mountAIAnalysis($('#ac-workspace'),{response:previous,result:previousResult,onHome:()=>{response=null;result=null;saving=false;home();},onReadiness:()=>start('ai-adoption')});
  const heading=$('#ac-workspace h2');if(heading){heading.tabIndex=-1;heading.focus();}
}

function renderMarketingStep() {
  const entries = active.dimensions.flatMap((dimension, dimensionIndex)=>dimension.questions.map(question=>({dimension,dimensionIndex,question})));
  step = Math.max(0,Math.min(entries.length-1,step));
  const { dimension, question } = entries[step];
  const evidence = response.evidence[dimension.id] || {};
  const answered = entries.filter(({question:q})=>response.answers[q.id] !== undefined && response.answers[q.id] !== '').length;
  $('#ac-workspace').innerHTML = `${topLine('Marketing Assessment')}<h2>Marketing Assessment — Question ${step+1} of ${entries.length}</h2><p class="ac-small">${answered} of ${entries.length} responses recorded</p><progress aria-label="Marketing assessment progress" max="${entries.length}" value="${answered}"></progress><div class="ac-step-layout"><aside class="ac-step-nav ac-no-print"><h3>Sections</h3><ol>${active.dimensions.map((d,i)=>`<li><button type="button" data-step="${i*5}"${d.id===dimension.id?' aria-current="step"':''}>${i+1}. ${escape(d.title)}</button></li>`).join('')}</ol><button class="button secondary" type="button" data-edit-context>Review Context</button></aside><div class="ac-question-card"><h3>${escape(dimension.title)}</h3>${questionHTML(question)}<details class="ac-evidence-box"><summary>Optional: add evidence for this section</summary><p>Ratings are self-reported. Describe records or external research that support them; sources are not independently verified.</p><label>Evidence source type<select id="marketing-evidence-type"><option value="self-report">Self-reported responses only</option><option value="organizational">Organizational data / records</option><option value="external">External market evidence</option></select></label><label>Evidence quality<select id="marketing-evidence-quality"><option value="none">No supporting evidence</option><option value="anecdotal">Anecdotal</option><option value="some">Some documented evidence</option><option value="strong">Strong documented evidence</option></select></label><label>Source / reporting period<input id="marketing-evidence-source" maxlength="500" value="${escape(evidence.source)}"></label><label>Evidence notes<textarea id="marketing-evidence-note" maxlength="4000">${escape(evidence.note)}</textarea></label><label class="ac-check"><input type="checkbox" id="marketing-evidence-conflict"${evidence.contradiction?' checked':''}>Sources conflict or require further investigation.</label></details>${saveControl()}<div class="ac-actions"><button class="button secondary" type="button" data-previous${step===0?' disabled':''}>Previous Question</button>${step<entries.length-1?'<button class="button primary" type="button" data-next>Next Question</button>':'<button class="button primary" type="button" data-marketing-review>Review All Responses</button>'}<button class="button secondary" type="button" data-marketing-review>Review Available Responses</button></div><p class="ac-small">You can go back and change any response before generating your profile.</p></div></div>`;
  document.querySelectorAll('[data-answer]').forEach(input=>input.addEventListener('change',()=>{response.answers[input.dataset.answer]=input.value;storeDraft();const count=entries.filter(({question:q})=>response.answers[q.id]!==undefined&&response.answers[q.id]!=='').length;$('#ac-workspace > .ac-small').textContent=`${count} of ${entries.length} responses recorded`;$('#ac-workspace progress').value=count;}));
  $('#marketing-evidence-type').value=evidence.type||'self-report';
  $('#marketing-evidence-quality').value=evidence.quality||'none';
  ['type','quality','source','note','conflict'].forEach(key=>$('#marketing-evidence-'+key).addEventListener('change',()=>{response.evidence[dimension.id]={type:$('#marketing-evidence-type').value,quality:$('#marketing-evidence-quality').value,source:$('#marketing-evidence-source').value,note:$('#marketing-evidence-note').value,contradiction:$('#marketing-evidence-conflict').checked};storeDraft();}));
  document.querySelectorAll('[data-marketing-review]').forEach(button=>button.addEventListener('click',renderMarketingReview));
  bindSave();
}

function renderMarketingReview() {
  let index=0;
  $('#ac-workspace').innerHTML=`${topLine('Review your responses')}<h2>Review your Marketing Assessment</h2><p>Check or change any of the 40 responses before generating your profile. Missing responses stay visible and are never scored as zero.</p>${active.dimensions.map(d=>`<section class="ac-result-section"><h3>${escape(d.title)}</h3><ol start="${index+1}">${d.questions.map(q=>{const position=index++;const answer=q.options.find(option=>String(option.value)===String(response.answers[q.id]));return `<li><p>${escape(q.text)}</p><p><strong>${escape(answer?.label||(response.answers[q.id]==='unsure'?'Not sure':'Unanswered'))}</strong> <button type="button" class="button secondary" data-step="${position}" aria-label="Change response ${position+1}">Change</button></p></li>`;}).join('')}</ol></section>`).join('')}${marketingEvidenceForm(response)}<div class="ac-actions"><button class="button primary" type="button" id="marketing-submit">Generate Marketing Capability Profile</button><button class="button secondary" type="button" data-step="0">Back to Questions</button></div>`;
  document.querySelectorAll('[data-marketing-construct]').forEach(input=>input.addEventListener('input',()=>{response.marketingEvidence ||= {}; response.marketingEvidence[input.dataset.marketingConstruct] ||= {}; response.marketingEvidence[input.dataset.marketingConstruct][input.dataset.layer]=input.value;storeDraft();}));
  $('#marketing-submit').addEventListener('click',complete);focusWorkspace();
}

function renderMarketingReport() {
  const profile = buildMarketingProfile(active,response,result);
  result.marketing = profile;
  const priorities = profile.priorities.map(item=>({ ...active.dimensions.find(d=>d.id===item.dimensionId),id:item.dimensionId,title:item.title,action:item.action,why:item.reason,kpi:item.metric,baseline:item.baseline }));
  $('#ac-workspace').innerHTML=`${topLine('Marketing report')}<h2>Marketing Capability Profile</h2><p>${escape(response.context)} · ${escape(response.initiative||'No named initiative')} · ${date(response.completedAt)}</p><div class="ac-actions ac-no-print"><button class="button primary" type="button" id="ac-print">Print / Save as PDF</button><button class="button secondary" type="button" id="ac-copy">Copy Summary</button><button class="button secondary" type="button" id="ac-download">Download Result JSON</button><button class="button secondary" type="button" id="ac-retake">Start Follow-Up</button><a class="button secondary" href="dashboard.html#assessment-insights">Open Dashboard</a><button class="button secondary" type="button" data-edit-responses>Edit Responses</button><button class="button secondary" type="button" data-reset>Reset Current Assessment</button></div>${marketingEvidenceReport(response)}${renderMarketingResults({definition:active,response,result,profile})}<section class="ac-result-section" id="ac-action-plan"><h3>Measurable Follow-Up Actions</h3><div id="ac-plan-content"></div></section><section class="ac-result-section"><h3>Baseline vs. Follow-Up</h3><div id="ac-comparison"></div><p>${escape(profile.followUp)}</p></section><details class="ac-result-section"><summary>Scoring and interpretation</summary><p>Each section is the arithmetic mean of its five 1–5 responses. The overall score averages all answered statements with equal weight. With all 40 answered, this equals the mean of the eight dimension scores. Unknown and unanswered statements are excluded; coverage is always shown.</p><p>Scores are rounded to one decimal before assigning maturity: 1.0–1.9 Foundational; 2.0–2.9 Developing; 3.0–3.9 Established; 4.0–4.5 Advanced; 4.6–5.0 Integrated. These descriptive thresholds are planning conventions, not validated performance benchmarks.</p><p>Cross-dimension comparisons use high scores of at least 4.0 and low scores below 3.0, with at least 60% response coverage in both sections. Findings are rule-based inferences. Evidence support is user-declared, not independently verified.</p><ul>${active.limitations.map(item=>`<li>${escape(item)}</li>`).join('')}</ul></details><div class="ac-no-print">${saveControl()}<p class="ac-small">Saved results stay in this browser. Exports contain your answers, context, evidence notes, and action plan.</p></div>`;
  bindReportControls(priorities);
}

function renderMetrics() {
  const groups=[...new Set(FINANCIAL_FIELDS.map(field=>field.group))];
  const fieldHTML=field=>`<label>${escape(field.label)}<input name="${field.key}" type="number" step="any"${field.min!==undefined?` min="${field.min}"`:''} value="${escape(response.metrics[field.key]??'')}">${field.hint?`<span class="ac-small">${escape(field.hint)}</span>`:''}</label>`;
  $('#ac-workspace').innerHTML=`${topLine('Business measures')}<h2>Financial &amp; Marketing Performance</h2><div class="ac-question-card"><h3>What do your numbers show?</h3><p>Optional: enter comparable values for one reporting period, customer cohort, and currency. Leave unavailable inputs blank. These calculations are separate from your measurement capability score; no universal performance benchmark is applied.</p><p>Costs and revenues must use compatible definitions. CLV inputs describe a customer lifetime; CAC inputs describe the matching acquisition cohort. Describe any timing or attribution limitations in your evidence notes.</p><form id="ac-metrics-form">${groups.map((group,index)=>{const fields=FINANCIAL_FIELDS.filter(field=>field.group===group);const hasValues=fields.some(field=>response.metrics[field.key]!==undefined&&response.metrics[field.key]!=='');return `<details class="ac-metric-group"${index===0||hasValues?' open':''}><summary>${escape(group)} <span>${fields.length} optional inputs</span></summary><div class="ac-form-grid">${fields.map(fieldHTML).join('')}</div></details>`;}).join('')}<button type="submit" class="button primary">Generate Assessment Report</button></form></div>`;
  $('#ac-metrics-form').addEventListener('input',event=>{if(event.target.name){response.metrics[event.target.name]=event.target.value;storeDraft();}});
  $('#ac-metrics-form').addEventListener('submit',event=>{event.preventDefault();complete();});
  focusWorkspace();
}

function complete() {
  result=scoreAssessment(active,response);
  if (active.id === 'marketing-assessment') result.marketing = buildMarketingProfile(active,response,result);
  response.definitionSnapshot=clone(active);
  response.resultId ||= crypto.randomUUID?.() || `${active.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  response.completedAt ||= new Date().toISOString();
  response.actionPlan ||= [];
  storeCompleted();renderResults();focusWorkspace();
}

function dimensionPair(d) { return {...active.dimensions.find(def=>def.id===d.id),...d}; }
function ranked() { return result.dimensions.map(dimensionPair).sort((a,b)=>b.priority-a.priority); }
function recommendedDimensions() { const applicable=ranked().filter(d=>d.priorityType!=='not-applicable');const gaps=applicable.filter(d=>d.score===null||d.score<75||d.confidence<50);return (gaps.length?gaps:applicable).slice(0,5); }
function safeguardsHTML() { return `<section class="ac-result-section"><h3>Assumptions &amp; Limitations</h3><div class="ac-safeguards"><div><strong>Interpret with context</strong><p>Assessment results identify patterns and questions for further investigation. They are not diagnoses, guarantees, or deterministic predictions.</p></div><div><strong>Triangulate</strong><p>When the decision matters, compare assessment results with observable behavior, business data, records, research, and perspectives from multiple roles.</p></div><div><strong>Preserve structural context</strong><p>Resources, authority, access, time, organizational structure, culture, and opportunity may explain results that could otherwise be incorrectly attributed to individual motivation.</p></div><div><strong>Human authority</strong><p>CEAM+ provides decision support. Human reviewers retain responsibility for interpretation and action. Any AI interpretation is provisional; this engine uses transparent rules and does not call an AI service.</p></div></div><ul>${active.limitations.map(item=>`<li>${escape(item)}</li>`).join('')}<li>Evidence quality and contradictions are user-declared. Notes are not automatically verified or analyzed; a lack of flagged contradictions does not mean sources agree.</li><li>Self-report can be affected by respondent selection, wording, recall, and impression management. A score is a discussion indicator, not proof about people.</li></ul></section>`; }

function renderResults() {
  if(response?.aiAnalysis)return openAIAnalysis(response,result);
  if (active.id === 'marketing-assessment') return renderMarketingReport();
  const dimensions=result.dimensions.map(dimensionPair);
  const strongest=[...dimensions].filter(d=>d.score!==null&&d.score>=75).sort((a,b)=>b.score-a.score).slice(0,3);
  const priorities=recommendedDimensions();
  const uncertainty=result.uncertainty;
  const tools=priorities.flatMap(d=>d.tools||[]);
  const surveys=priorities.flatMap(d=>d.surveys||[]);
  $('#ac-workspace').innerHTML=`${topLine('Assessment report')}<h2>${escape(active.title)}</h2><p><strong>Date:</strong> ${date(response.completedAt)} · <strong>Context:</strong> ${escape(response.context)} · <strong>Initiative:</strong> ${escape(response.initiative||'Not specified')} · <strong>Version:</strong> ${escape(active.version)}</p>${active.tailoring?`<p class="ac-note"><strong>Organization profile:</strong> ${escape(active.tailoring.label)}. Size informs context and action scope, not maturity.</p>`:''}<div class="ac-actions ac-no-print"><button class="button primary" type="button" id="ac-print">Print / Save as PDF</button><button class="button secondary" type="button" id="ac-copy">Copy Summary</button><button class="button secondary" type="button" id="ac-download">Download Result JSON</button><button class="button secondary" type="button" id="ac-retake">Start Follow-Up</button><a class="button secondary" href="dashboard.html#assessment-insights">Open Dashboard</a><button class="button secondary" type="button" data-edit-responses>Edit Responses</button><button class="button secondary" type="button" data-reset>Reset Current Assessment</button></div><div class="ac-result-hero"><div><span>${escape(active.overallLabel||'Overall Assessment Score')}</span><div class="ac-score">${result.overall===null?'—':fmt(result.overall)} <small>/ 100</small></div><strong>${escape(result.band)}</strong><p>${result.scoreScope==='partial'?'Partial profile — based on the dimensions with usable responses.':result.scoreScope==='none'?'Insufficient responses for a score. Begin by gathering evidence.':'A profile of the conditions reported for this context.'}</p></div><div><h3>Evidence behind the profile</h3><p><strong>${fmt(result.coverage)}% response coverage</strong><br><strong>${fmt(result.confidence)} / 100 evidence support index</strong> · user-declared</p><p>Unknown: ${uncertainty.unknown} · Not applicable: ${uncertainty.notApplicable}<br>Unanswered: ${uncertainty.unanswered} · Invalid: ${uncertainty.invalid||0} · Unsupported: ${uncertainty.unsupported}<br>Flagged contradictions: ${uncertainty.contradictions}</p></div></div><p class="ac-note">The score is a starting point for discussion. Maturity bands are illustrative planning conventions, not validated thresholds. A one-point difference or crossing a band does not establish a meaningful or scientific difference.</p><section class="ac-result-section"><h3>What did we measure?</h3><p>${escape(active.purpose)}</p><h4>What This Means</h4><p>${result.overall===null?'There is not enough usable information to infer a readiness or capability profile. Missing information is an investigation priority, not evidence of failure.':`The available responses suggest ${escape(result.band.toLowerCase())} conditions in the areas scored. Examine the dimension profile, supporting sources, and coverage before deciding what action is reasonable.`}</p>${result.patterns?.length?`<ul>${result.patterns.map(pattern=>`<li>${escape(typeof pattern==='string'?pattern:pattern.label)}</li>`).join('')}</ul>`:''}<p>These findings matter because a gap in resources, information, coordination, or oversight can change whether an initiative is workable. Strong scores with limited evidence should be checked before expansion.</p></section><section class="ac-result-section"><h3>Dimension Scores</h3><p>Longer bars indicate stronger reported conditions within this assessment. “Not scored” means no usable score was available. Evidence strength is shown separately.</p><div class="ac-bars" role="img" aria-label="Dimension score bars, with exact values and evidence coverage in the following table">${dimensions.map(d=>`<div class="ac-bar-row"><span>${escape(d.title)}</span><div class="ac-bar-track"><div class="ac-bar-fill" style="width:${d.score??0}%"></div></div><strong>${d.score===null?'—':fmt(d.score)}</strong></div>`).join('')}</div><div class="ac-table-wrap"><table><caption>Scores, coverage, and user-declared evidence by dimension</caption><thead><tr><th scope="col">Dimension</th><th scope="col">Score / 100</th><th scope="col">Coverage</th><th scope="col">Evidence support</th><th scope="col">Dimension weight</th></tr></thead><tbody>${dimensions.map(d=>`<tr><th scope="row">${escape(d.title)}</th><td>${fmt(d.score)}</td><td>${fmt(d.coverage)}%</td><td>${fmt(d.confidence)} / 100</td><td>${d.weight}</td></tr>`).join('')}</tbody></table></div></section><div class="ac-result-grid"><section class="ac-result-section"><h3>Strongest Areas</h3>${strongest.length?`<ul>${strongest.map(d=>`<li><strong>${escape(d.title)} — ${fmt(d.score)}</strong><br>${escape(d.why)} Evidence support: ${fmt(d.confidence)}/100. Verify that the reported conditions hold across roles.</li>`).join('')}</ul>`:'<p>No scored dimension currently reaches the Established planning band. Relative strengths can still be explored in the dimension table.</p>'}</section><section class="ac-result-section"><h3>Priority Gaps</h3><p>CEAM+ Planning Priority combines gaps and investigation needs. This ordering is a planning aid, not a scientifically proven ranking.</p><ol>${priorities.map(d=>`<li><strong>${escape(d.title)} · ${escape(d.priorityLabel)}</strong> (${fmt(d.priority)}/100)<br>${d.score===null?'Information gap; capability is unknown.':`Score ${fmt(d.score)}/100.`} ${escape((d.priorityReasons||[]).join(' '))}</li>`).join('')}</ol></section></div><section class="ac-result-section"><h3>Recommended Actions</h3><ol>${priorities.map(d=>`<li><strong>${escape(d.title)}:</strong> ${escape(d.score===null?'Gather the missing evidence and discuss conditions with relevant people before rating capability. '+d.action:d.action)}<br><strong>Why it matters:</strong> ${escape(d.why)}<br><strong>Measure success:</strong> ${escape(d.kpi)}</li>`).join('')}</ol><button class="button primary ac-no-print" type="button" id="ac-create-plan">${response.actionPlan.length?'View / Update Action Plan':'Create Action Plan'}</button></section><section class="ac-result-section"><h3>Questions to Investigate</h3><ul>${priorities.map(d=>`<li>${escape(d.followUp)}</li>`).join('')}<li>What differs across customer groups, roles, or settings? Which sources challenge the current interpretation?</li><li>Which resource, access, authority, time, or structural constraints could explain the observed pattern?</li></ul></section><section class="ac-result-section"><h3>Evidence Strength</h3><p>Evidence confidence here is a user-declared support index, not a statistical confidence interval or proof of accuracy. ${uncertainty.unknown} unknown responses and ${uncertainty.unanswered} unanswered questions leave conditions unresolved. Conflicting evidence calls for follow-up, not accusations.</p>${dimensions.map(d=>{const e=response.evidence[d.id]||{};return `<details><summary>${escape(d.title)} — ${escape(({none:'No evidence available',anecdotal:'Anecdotal',some:'Some documented evidence',strong:'Strong documented evidence'})[e.quality]||'No evidence available')}</summary><p><strong>Source / period:</strong> ${escape(e.source||'Not supplied')}</p><p><strong>Evidence notes:</strong> ${escape(e.note||'Not supplied')}</p><p><strong>Conflict flagged:</strong> ${e.contradiction?'Yes — investigate differing accounts.':'No conflict flagged; agreement has not been verified.'}</p></details>`;}).join('')}</section>${active.id==='financial-marketing'?metricsReport():''}<section class="ac-result-section"><h3>CEAM+ Decision Lens</h3><p>Read the conditions through cognition and understanding, emotion and willingness, agency and perceived control, trust and ethics, environment and resources, implementation capability, human-AI roles, purpose, and continuous improvement.</p><p>Decide what the evidence supports, identify plausible alternatives, choose a reversible next step where feasible, assign human responsibility, and define the measure that would change your interpretation. Preserve meaningful choice and sustainable pacing.</p><p><a class="text-link" href="framework.html">Explore the CEAM+ framework</a> · <a class="text-link" href="dashboard.html#prescriptive-support">CEAM+ Decision Support</a></p></section><div class="ac-result-grid"><section class="ac-result-section"><h3>Suggested Analytics Tools</h3><p>Explore the numerical or strategic evidence relevant to these priorities. Links select tools without transferring assessment responses.</p>${linkList(tools)}</section><section class="ac-result-section"><h3>Suggested Follow-Up Survey</h3><p>Use these prompts in the existing survey contexts. Survey scores remain self-report evidence; supporting topics are not separate validated survey instruments.</p>${linkList(surveys)}</section></div><section class="ac-result-section" id="ac-action-plan"><h3>Action Plan</h3><div id="ac-plan-content"></div></section><section class="ac-result-section"><h3>Baseline vs. Follow-Up</h3><div id="ac-comparison"></div><h4>Retake Recommendation</h4><p>Consider reassessing in ${active.retakeDays} days (around ${dayAfter(active.retakeDays)}), or after a meaningful change in conditions. Use the same initiative, context, definitions, and respondent group where feasible.</p><p>A score change may reflect actual improvement, different respondents, changed interpretation, new evidence, or measurement variation. Do not automatically attribute change to an intervention.</p></section><section class="ac-result-section"><h3>Scoring &amp; Planning Logic</h3><p>Maturity and agreement responses map 1–5 to 0, 25, 50, 75, 100. Other response types use their documented scoring map. Question weights form dimension scores; dimension weights form the overall score across scored dimensions. Unknown and applicable exclusions are disclosed separately. A partial profile cannot establish overall readiness.</p><div id="ac-formula-notes"></div><details><summary>All question weights and scoring maps</summary><div class="ac-table-wrap"><table><thead><tr><th>Question</th><th>Type</th><th>Weight</th><th>Scoring map</th></tr></thead><tbody>${active.dimensions.flatMap(d=>d.questions).map(q=>`<tr><td>${escape(questionText(q.text))}</td><td>${escape(q.type)}</td><td>${q.weight}</td><td>${escape(q.options? q.options.map(o=>`${o.label}: ${o.score}`).join('; '):q.type==='maturity'||q.type==='agreement'?'1:0; 2:25; 3:50; 4:75; 5:100':q.type==='yes-partly-no'?'Yes:100; Partly:50; No:0':q.type==='evidence'?'Available:100; Unavailable:0':JSON.stringify(q.numericScore||{}))}</td></tr>`).join('')}</tbody></table></div></details></section>${safeguardsHTML()}<div class="ac-no-print">${saveControl()}<p class="ac-small">Reports include answers and evidence notes. Keep downloaded or printed reports somewhere appropriate for their contents.</p></div>`;
  bindReportControls(priorities);
  renderFormulaNotes();
  collapseReportSections();
}

function bindReportControls(priorities) {
  renderPlan();renderComparison();bindSave();
  $('#ac-print').addEventListener('click',()=>window.print());
  $('#ac-download').addEventListener('click',()=>{const payload={schemaVersion:1,assessment:active,response,result,financialMetrics:active.id==='financial-marketing'?financialMetrics(response.metrics):[],exportedAt:new Date().toISOString(),limitations:'User-declared evidence; discussion indicators, not validated diagnoses or deterministic predictions.'};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const anchor=document.createElement('a');anchor.href=url;anchor.download=`ceam-${active.id}${response.demo?'-fictional-demo':''}.json`;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  $('#ac-copy').addEventListener('click',copySummary);
  $('#ac-create-plan').addEventListener('click',()=>{if(!response.actionPlan.length){response.actionPlan=priorities.map(d=>({dimensionId:d.id,gap:d.title,action:d.action,why:d.why,...(active.id==='marketing-assessment'?{baseline:d.baseline??'',target:'',observed:''}:{}),owner:'',targetDate:'',kpi:d.kpi,evidenceNeeded:d.evidenceNeeded,status:'Not Started',followUpDate:dayAfter(active.retakeDays)}));renderPlan();storeCompleted();}$('#ac-action-plan').scrollIntoView({behavior:'smooth'});});
  $('#ac-retake').addEventListener('click',()=>{const next={answers:{},evidence:{},priorities:[...response.priorities],context:response.context,initiative:response.initiative,metrics:{},actionPlan:[],demo:response.demo,profile:response.profile?clone(response.profile):null,definitionSnapshot:clone(active),tailoringSignature:response.tailoringSignature||'',marketingContext:clone(response.marketingContext||{})};const keepSaving=saving;start(active.id,next);saving=keepSaving&&!next.demo;renderSetup();status('Follow-up started with fresh answers. Your saved baseline remains available for comparison.');});
}

function metricsReport() {
  const metrics=financialMetrics(response.metrics);
  return `<section class="ac-result-section"><h3>Calculated Business Performance</h3><p>These are calculations from your supplied numbers, independent of the measurement capability score. “We measure this” does not establish “performance is strong.” No universal good/bad benchmark is applied.</p><div class="ac-table-wrap"><table><caption>Calculations from supplied business values</caption><thead><tr><th>Metric</th><th>Result</th><th>Formula</th><th>Assumptions / missing inputs</th></tr></thead><tbody>${metrics.map(m=>`<tr><th scope="row">${escape(m.label)}</th><td>${m.value===null?'Not calculated':`${fmt(m.value)} ${escape(m.unit||'')}`}</td><td>${escape(m.formula)}</td><td>${escape(m.error||m.note)}</td></tr>`).join('')}</tbody></table></div></section>`;
}

function renderPlan() {
  $('#ac-plan-content').innerHTML=response.actionPlan.length?response.actionPlan.map((action,i)=>`<article class="ac-action"><h4>${i+1}. ${escape(action.gap)}</h4><p><strong>Recommended action:</strong> ${escape(action.action)}<br><strong>Why it matters:</strong> ${escape(action.why)}<br><strong>Evidence needed:</strong> ${escape(action.evidenceNeeded)}</p><div class="ac-form-grid"><label>Owner<input data-plan="${i}" data-field="owner" maxlength="160" value="${escape(action.owner)}"></label><label>Target Date<input type="date" data-plan="${i}" data-field="targetDate" value="${escape(action.targetDate)}"></label><label>Status<select data-plan="${i}" data-field="status">${['Not Started','In Progress','Completed','Needs Review'].map(s=>`<option${s===action.status?' selected':''}>${s}</option>`).join('')}</select></label><label>KPI / success measure<input data-plan="${i}" data-field="kpi" maxlength="500" value="${escape(action.kpi)}"></label>${active.id==='marketing-assessment'?`<label>Baseline measure<input data-plan="${i}" data-field="baseline" maxlength="500" value="${escape(action.baseline)}"></label><label>Target measure<input data-plan="${i}" data-field="target" maxlength="500" value="${escape(action.target)}"></label><label>Follow-up measurement<input data-plan="${i}" data-field="observed" maxlength="500" value="${escape(action.observed)}"></label>`:''}<label>Follow-Up Assessment Date<input type="date" data-plan="${i}" data-field="followUpDate" value="${escape(action.followUpDate)}"></label></div><p class="ac-print-value" data-plan-print="${i}">${planText(action)}</p></article>`).join(''):'<p>Select “Create Action Plan” above to turn recommended actions into an editable plan with owners, target dates, KPIs, evidence needs, status, and a follow-up date.</p>';
  document.querySelectorAll('[data-plan]').forEach(input=>input.addEventListener('change',()=>{const action=response.actionPlan[Number(input.dataset.plan)];action[input.dataset.field]=input.value;document.querySelector(`[data-plan-print="${input.dataset.plan}"]`).textContent=planText(action,false);storeCompleted();}));
}
function planText(action,escaped=true) { const text=`Owner: ${action.owner||'Unassigned'} · Target date: ${action.targetDate||'Not set'} · Status: ${action.status} · KPI: ${action.kpi} · Follow-up: ${action.followUpDate||'Not set'}${active.id==='marketing-assessment'?` · Baseline: ${action.baseline||'Not set'} · Target: ${action.target||'Not set'} · Follow-up measurement: ${action.observed||'Not recorded'}`:''}`;return escaped?escape(text):text; }
function renderComparison() {
  if(response.demo){$('#ac-comparison').innerHTML='<p>Demo results are excluded from baseline and follow-up history. Start an assessment with your own evidence to build a comparable history.</p>';return;}
  const historyResult=getHistory(active,response);
  if(!historyResult.ok){$('#ac-comparison').textContent='Saved comparison could not be read. Export the current report and check browser storage availability.';return;}
  const records=historyResult.history;
  if (active.id === 'marketing-assessment') historyResult.comparison = historyResult.comparison.map(row=>({...row,baseline:row.baseline===null?null:Math.round((1+row.baseline/25)*10)/10,followUp:row.followUp===null?null:Math.round((1+row.followUp/25)*10)/10,change:row.change===null?null:Math.round(row.change/25*10)/10}));
  if(records.length<2){$('#ac-comparison').innerHTML=`<p>${records.length?'One comparable baseline is saved. Complete and save a follow-up to see dimension changes.':'Enable browser saving to keep this result as a baseline. A follow-up must use the same assessment version, context, and initiative.'}</p>`;return;}
  $('#ac-comparison').innerHTML=`<p>${records.length} comparable saved results · Baseline: ${date(historyResult.baseline.createdAt)} · Follow-up: ${date(historyResult.followUp.createdAt)}. Comparison uses the earliest and latest saved results for this exact context, initiative, and version.</p><div class="ac-table-wrap"><table><caption>Baseline and latest follow-up, with changes in ${active.id==='marketing-assessment'?'1–5 capability':'0–100'} score points</caption><thead><tr><th>Dimension</th><th>Baseline</th><th>Follow-Up</th><th>Change</th></tr></thead><tbody>${historyResult.comparison.map(row=>`<tr><th scope="row">${escape(row.title)}</th><td>${fmt(row.baseline)}</td><td>${fmt(row.followUp)}</td><td>${row.change===null?'Not comparable':`${row.change>0?'+':''}${fmt(row.change)}`}</td></tr>`).join('')}</tbody></table></div>`;
}

function renderFormulaNotes() {
  $('#ac-formula-notes').innerHTML='<p><strong>Dimension score:</strong> sum of (question score × question weight), divided by answered question weights. <strong>Overall:</strong> sum of (dimension score × dimension weight), divided by scored dimension weights.</p><p><strong>Evidence support:</strong> No evidence = 0; anecdotal = 25; some documented = 60; strong documented = 100. Multiply by applicable response coverage; halve if conflicting evidence is flagged. Overall support is a dimension-weighted average.</p><p><strong>CEAM+ Planning Priority:</strong> 40% gap + 20% strategic importance + 15% risk + 15% evidence uncertainty + 10% user priority. Gap = 100 − score; an unknown score uses a neutral 50 only for planning. Importance and risk map 1–5 to 20–100; selected user priority = 100, otherwise 0. Evidence uncertainty = 100 − evidence support. Missing support raises investigation priority, not confidence in a conclusion. High priority begins at 65; medium at 40. Entirely not-applicable dimensions are excluded from actions.</p><p>Uncertainty counters can overlap: unsupported responses and flagged contradictions should not be added to unknown responses as if they were distinct people or questions. <a class="text-link" href="docs/assessment-scoring.md">Read the full scoring documentation</a>.</p>';
}
function collapseReportSections() {
  const expandable = new Set(['Evidence Strength','Questions to Investigate','CEAM+ Decision Lens','Scoring & Planning Logic','Assumptions & Limitations','Suggested Analytics Tools','Suggested Follow-Up Survey']);
  document.querySelectorAll('#ac-workspace .ac-result-section').forEach(section=>{
    const heading=section.querySelector(':scope > h3');
    if (!heading || !expandable.has(heading.textContent)) return;
    const details=document.createElement('details');details.className='ac-report-details';
    const summary=document.createElement('summary');summary.textContent=heading.textContent;
    details.append(summary);heading.remove();while(section.firstChild)details.append(section.firstChild);section.append(details);
  });
  const note=document.createElement('p');note.className='ac-note';note.textContent='Interpret with context. Triangulate important decisions with behavior, records, research, and multiple perspectives. Resources, authority, access, time, and structure can explain apparent gaps. Human reviewers retain responsibility for action.';
  $('#ac-workspace .ac-result-hero').after(note);
  const button=document.createElement('button');button.type='button';button.className='button secondary';button.textContent='Expand Report Details';button.addEventListener('click',()=>{const open=button.textContent.startsWith('Expand');document.querySelectorAll('.ac-report-details').forEach(details=>{details.open=open;});button.textContent=open?'Collapse Report Details':'Expand Report Details';});
  $('#ac-workspace .ac-actions').append(button);
}
let printDetails = [];
window.addEventListener('beforeprint',()=>{printDetails=[...document.querySelectorAll('#ac-workspace details')].map(details=>[details,details.open]);printDetails.forEach(([details])=>{details.open=true;});});
window.addEventListener('afterprint',()=>{printDetails.forEach(([details,open])=>{details.open=open;});printDetails=[];});
function marketingSummary() {
  const profile=buildMarketingProfile(active,response,result);
  return `Marketing Capability Profile\n${date(response.completedAt)}\nOverall: ${fmt(profile.overall)}/5 — ${profile.maturity}\nCoverage: ${fmt(profile.coverage)}%\n${profile.dimensions.map(d=>`${d.title}: ${fmt(d.score)}/5 — ${d.maturity}`).join('\n')}\nWhat should this organization do next?\n${profile.priorities.map((p,i)=>`${i+1}. ${p.action} Measure: ${p.metric}`).join('\n')}\n${profile.evidenceNote}`;
}

async function copySummary() {
  const text=active.id==='marketing-assessment' ? marketingSummary() : `${active.title}${response.demo?' — FICTIONAL DEMO':''}\n${date(response.completedAt)}\nContext: ${response.context}; Initiative: ${response.initiative||'Not specified'}\nOverall: ${fmt(result.overall)}/100 — ${result.band}\nCoverage: ${fmt(result.coverage)}%; user-declared evidence support: ${fmt(result.confidence)}/100\n${result.dimensions.map(d=>`${d.title}: ${fmt(d.score)}`).join('\n')}\nPriority actions:\n${recommendedDimensions().map(d=>`${d.title}: ${d.action}`).join('\n')}\nResults identify conditions and questions, not diagnoses or deterministic predictions. Triangulate with evidence and preserve human responsibility.`;
  try { await navigator.clipboard.writeText(text); status('Summary copied.'); } catch { const box=document.createElement('textarea');box.value=text;box.setAttribute('aria-label','Report summary to copy');$('#ac-workspace').prepend(box);box.focus();box.select();status('Clipboard access is unavailable. The summary is selected for manual copying.'); }
}

function bindSave() {
  $('#ac-saving')?.addEventListener('change',event=>{saving=event.target.checked;if(saving){if(result){storeCompleted();renderComparison();}else storeDraft();}else status('Automatic browser saving is off. Any previously saved copies remain available under Manage Saved Assessments.');});
}

function demo() {
  start('marketing-readiness',null,true);
  const restaurant=industries.find(item=>/Restaurant/.test(item.label));
  response.profile=sanitizeProfile({...response.profile,industry:restaurant?.id||response.profile.industry,department:'marketing',size:'micro'});
  active=tailorAssessment(getAssessment('marketing-readiness'),response.profile);response.tailoringSignature=active.tailoring.signature;
  response.context=active.contextOptions?.[0]||'Organization / team';response.initiative='Fictional Harbor & Pine retail launch';
  active.dimensions.forEach((dimension,index)=>{
    dimension.questions.forEach((q,i)=>{response.answers[q.id]=q.options?.[Math.min(q.options.length-1,index%q.options.length)]?.value || (q.type==='yes-partly-no'?['yes','partly','no'][index%3]:q.type==='evidence'?'available':String([4,3,4,3,2,2,4,2,3,4][index]||3));if(index===3&&i===0)response.answers[q.id]='unsure';});
    response.evidence[dimension.id]={quality:index%3===0?'strong':index%3===1?'some':'anecdotal',source:'Fictional Q3 2026 team review',note:'Illustrative sample evidence only. No real business or research data.',contradiction:index===4};
  });
  response.priorities=[active.dimensions[4].id];
  complete();
}

function home() {storeDraft();$('#ac-workspace').hidden=true;$('#ac-landing').hidden=false;$('#center-intro').hidden=false;history.replaceState(null,'','assessment-center.html');renderSaved();$('#explore').scrollIntoView({behavior:'instant'});}
document.addEventListener('click',event=>{
  const target=event.target.closest('button');if(!target)return;
  if(target.dataset.start)start(target.dataset.start);
  if(target.dataset.filter){if(target.dataset.filter==='Recommended for me'){$('#recommended').scrollIntoView({behavior:'smooth'});$('#ac-wizard-form select').focus({preventScroll:true});}else{filter=target.dataset.filter;renderCatalogue();}}
  if(target.hasAttribute('data-home'))home();
  if(target.dataset.step!==undefined){step=Number(target.dataset.step);renderStep();focusWorkspace();}
  if(target.hasAttribute('data-next')){step++;renderStep();focusWorkspace();}
  if(target.hasAttribute('data-previous')){step--;renderStep();focusWorkspace();}
  if(target.hasAttribute('data-review')){if(active.id==='financial-marketing')renderMetrics();else complete();}
  if(target.hasAttribute('data-edit-context')){renderSetup();focusWorkspace();}
  if(target.hasAttribute('data-demo-results'))complete();
  if(target.hasAttribute('data-edit-responses')){result=null;response.actionPlan.forEach(action=>{action.status='Needs Review';});renderStep();focusWorkspace();}
  if(target.hasAttribute('data-reset')){const current=active.id;const demoMode=response.demo;const profile=response.profile?clone(response.profile):null;if(saving&&!demoMode)deleteDraft(active,response);start(current,{answers:{},evidence:{},priorities:[],context:response.context,initiative:response.initiative,metrics:{},actionPlan:[],demo:demoMode,profile,marketingContext:clone(response.marketingContext||{})});status('Current answers cleared. Saved baselines remain available under Follow-Up.');}
});

$('#demo-start').addEventListener('click',demo);
$('#ac-wizard-form').addEventListener('submit',event=>{
  event.preventDefault();const form=new FormData(event.currentTarget);
  const mapping={marketing:['marketing-assessment','marketing-readiness'],customers:['customer-adoption','customer-insight'],ai:['ai-adoption','agency-trust'],data:['analytics-data','customer-insight'],change:['change-readiness','organizational-readiness'],financial:['financial-marketing','marketing-readiness'],strategy:['strategic-marketing','sustainability-resilience'],trust:['agency-trust','change-readiness'],personal:['personal-change'],resilience:['sustainability-resilience','organizational-readiness']};
  let ids=[...(mapping[form.get('goal')]||mapping.marketing)];
  if(form.get('audience')==='personal')ids=['personal-change',...ids.filter(id=>id!=='personal-change')].slice(0,2);
  if(form.get('audience')==='customers'&&!ids.includes('customer-adoption'))ids.push('customer-adoption');
  const evidence=form.get('evidence');
  $('#ac-recommendations').innerHTML=`<h3>Your suggested starting points</h3><p>${evidence==='none'?'Start with the sources you have, mark uncertain conditions, and gather supporting survey responses or interviews.':evidence==='numbers'?'Bring your records and use the Analytics Lab to examine the measures behind the conditions.':'Use your records to support each dimension and flag conflicting accounts.'}</p><ol>${[...new Set(ids)].slice(0,3).map(id=>{const def=getAssessment(id);return `<li><strong>${escape(def.title)}</strong><p>${escape(def.purpose)}</p><button class="button secondary" type="button" data-start="${id}">Start ${escape(def.title)}</button></li>`;}).join('')}</ol>`;
});
$('#clear-saved').addEventListener('click',()=>{
  $('#ac-data-manager').innerHTML='<p>Delete only the selected assessment’s saved drafts and results, across its contexts and versions. Downloads remain on your device.</p>'+assessments.map(def=>`<p><button type="button" class="button secondary" data-delete-saved="${def.id}">Delete Saved ${escape(def.title)}</button></p>`).join('');
  document.querySelectorAll('[data-delete-saved]').forEach(button=>button.addEventListener('click',()=>{const def=getAssessment(button.dataset.deleteSaved);if(window.confirm(`Delete all locally saved drafts and results for ${def.title}?`)){reportStorage(clearAssessment(def),'Selected saved assessment data deleted.');renderSaved();}}));
});
renderCatalogue();renderSaved();
const params=new URLSearchParams(location.search);
const savedId=params.get('result');
const savedRecord=savedId?Object.values(loadState().state.results).flat().find(record=>record.id===savedId):null;
if(savedRecord&&getAssessment(savedRecord.assessmentId)){response=clone(savedRecord.response);active=ensureMetadata(response.definitionSnapshot||(response.profile?tailorAssessment(getAssessment(savedRecord.assessmentId),response.profile):getAssessment(savedRecord.assessmentId)));response.resultId=savedRecord.id;response.completedAt=savedRecord.createdAt;result=clone(savedRecord.result);saving=true;showWorkspace();renderResults();focusWorkspace();}
const requested=savedRecord?null:params.get('assessment');
if(requested){if(requested==='ai-adoption'&&params.get('mode')==='analysis')openAIAnalysis();else if(getAssessment(requested))start(requested);else status('That assessment could not be found. Choose one from the catalogue.');}
initGlossary();
