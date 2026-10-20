import {selfReportDefinitions, summarizeSelfReport, surveyScale, readSelfReports, saveSelfReport, SELF_REPORT_KEY} from './self-report-model.mjs';

const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const catalogue=document.querySelector('#self-report-catalogue');
const workspace=document.querySelector('#self-report-workspace');
const historyRoot=document.querySelector('#self-report-history');
const engine=window.CEAMAssessments;
const definitions=selfReportDefinitions(engine);
let active, answers={}, initiative='', notes='', record=null;
const download=value=>{const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='ceam-self-report-'+value.definition.id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
const status=message=>{const target=document.querySelector('#self-report-status');if(target)target.textContent=message;};
function focusWorkspace(){const heading=workspace.querySelector('h2');heading.tabIndex=-1;heading.focus();workspace.scrollIntoView({block:'start',behavior:'instant'});}
function listHistory(){
  if(!historyRoot)return;
  try {
    const state=readSelfReports();
    historyRoot.innerHTML=state.results.length?state.results.slice().reverse().map(item=>`<article class="ac-result-section"><h3>${escape(item.definition.title)}</h3><p>${escape(item.initiative||'No initiative supplied')} · ${escape(item.createdAt)}</p><p>Self-report assessment. Kept separate from evidence-led scores and legacy survey history.</p><div class="ac-actions"><a class="button secondary" href="assessment-center.html?selfReportResult=${encodeURIComponent(item.id)}">Open saved assessment</a><button class="button secondary" type="button" data-self-download="${escape(item.id)}">Download Result JSON</button><button class="button secondary" type="button" data-self-delete="${escape(item.id)}">Delete this saved result</button></div></article>`).join(''):'<p>No self-report assessments saved in this browser yet.</p>';
    historyRoot.querySelectorAll('[data-self-download]').forEach(button=>button.onclick=()=>download(state.results.find(item=>item.id===button.dataset.selfDownload)));
    historyRoot.querySelectorAll('[data-self-delete]').forEach(button=>button.onclick=()=>{
      if(!confirm('Delete this saved self-report assessment? Downloaded files and other histories will remain.'))return;
      try {const latest=readSelfReports();latest.results=latest.results.filter(item=>item.id!==button.dataset.selfDelete);localStorage.setItem(SELF_REPORT_KEY,JSON.stringify(latest));listHistory();}catch(error){status(error.message);}
    });
  } catch(error){historyRoot.textContent=error.message;}
}
function catalogueView(filter='All'){
  if(!catalogue)return;
  const shown=definitions.filter(item=>filter==='All'||item.category===filter);
  document.querySelector('#self-report-count').textContent=`${shown.length} self-report assessments: 13 brief experience assessments and 5 context assessments in the full collection.`;
  catalogue.innerHTML=shown.map(item=>`<article class="ac-card" data-self-card="${item.id}"><span class="ac-category">${escape(item.category)} · Self-report</span><h3>${escape(item.title)}</h3><p>${escape(item.description)}</p><p class="ac-meta">${item.questions.length} questions · ${item.kind==='experience'?'Response summary, no total score':'Context discussion indicator, separate from evidence-led scores'}</p><p><strong>For:</strong> ${escape(item.audience)}</p><button type="button" class="button primary" data-self-start="${item.id}">Start Assessment</button></article>`).join('');
  catalogue.querySelectorAll('[data-self-start]').forEach(button=>button.onclick=()=>start(button.dataset.selfStart));
}
function show(){document.querySelector('#ac-workspace').hidden=true;document.querySelector('#ac-landing').hidden=true;document.querySelector('#center-intro').hidden=true;workspace.hidden=false;}
function home(){workspace.hidden=true;document.querySelector('#ac-landing').hidden=false;document.querySelector('#center-intro').hidden=false;history.replaceState(null,'','assessment-center.html#self-report-assessments');listHistory();document.querySelector('#self-report-title').focus();}
function start(id){active=definitions.find(item=>item.id===id);if(!active)return;answers={};initiative='';notes='';record=null;show();history.replaceState(null,'','?selfReport='+encodeURIComponent(id));edit();focusWorkspace();}
const actions='<div class="ac-actions"><button type="button" class="button secondary" data-self-home>All Assessments</button></div>';
function questionHTML(q,index){
  const short=active.kind==='experience';
  const selected=answers[q.id];
  let fields;
  if(short)fields=surveyScale.map(([value,label])=>`<label><input type="radio" name="${q.id}" value="${value}"${selected===value?' checked':''}><span>${value.length===1?value+' — ':''}${escape(label)}</span></label>`).join('');
  else if(q.type==='choice')fields=q.options.map(value=>`<label><input type="checkbox" name="${q.id}" value="${escape(value)}"${Array.isArray(selected)&&selected.includes(value)?' checked':''}><span>${escape(value)}</span></label>`).join('');
  else {
    const original=engine.renderQuestion(q,index);
    const range=original.querySelector('input[type=range]');
    range.setAttribute('aria-labelledby','self-label-'+q.id);
    range.setAttribute('value',selected??0);range.setAttribute('data-touched',String(selected!==undefined));
    fields=`<output for="${q.id}" data-self-output>${selected??'Not answered'}</output>`+[...original.querySelectorAll('input[type=range],.range-ticks,.range-numbers,.scale-labels')].map(node=>node.outerHTML).join('');
  }
  const followup=q.followUp?`<div data-self-followup="${q.id}"${Array.isArray(selected)&&selected.some(value=>q.followUp.when.includes(value))?'':' hidden'}><p>${escape(q.followUp.label)}</p>${q.followUp.options.map(value=>`<label><input type="checkbox" name="${q.id}_followup" value="${escape(value)}"${answers[q.id+'_followup']?.includes(value)?' checked':''}><span>${escape(value)}</span></label>`).join('')}</div>`:'';
  return `<fieldset class="ac-question self-report-question"><legend id="self-label-${q.id}">${index+1}. ${escape(q.text||q.label)}</legend>${q.scenario?`<p>${escape(q.scenario)}</p>`:''}<div class="self-report-options">${fields}</div>${q.note?`<label>${escape(q.note)}<textarea name="${q.id}_note">${escape(answers[q.id+'_note'])}</textarea></label>`:''}${short?'':`<label>If the listed answers do not fit<select name="${q.id}_status"><option value="">Use my answer above</option>${['Uncertain','Not applicable','Insufficient information'].map(value=>`<option${answers[q.id+'_status']===value?' selected':''}>${value}</option>`).join('')}</select></label>`}${followup}</fieldset>`;
}
function edit(){
  workspace.innerHTML=actions+`<h2>${escape(active.title)}</h2><p>Self-report assessment. These exploratory questions describe your perspective; they are not a validated diagnosis, organizational capability measure or prediction.</p><p>Your answers stay in this tab until you explicitly save or download a result. No email submission is used.</p><form id="self-report-form"><label>Initiative or topic (optional)<input name="self-initiative" value="${escape(initiative)}"></label>${active.questions.map(questionHTML).join('')}<label>Notes or evidence to discuss (optional)<textarea name="self-notes">${escape(notes)}</textarea></label><p id="self-report-status" role="status"></p><button type="submit" class="button primary">Review Assessment</button></form>`;
  workspace.querySelector('[data-self-home]').onclick=home;
  const form=workspace.querySelector('form');
  const capture=()=>{
    const data=new FormData(form);initiative=String(data.get('self-initiative')||'');notes=String(data.get('self-notes')||'');answers={};
    active.questions.forEach(q=>{
      const state=data.get(q.id+'_status');
      if(state){answers[q.id+'_status']=state;return;}
      const values=data.getAll(q.id);
      if(active.kind==='experience'){if(values.length)answers[q.id]=values[0];}
      else if(q.type==='choice'){if(values.length)answers[q.id]=values;}
      else if(form.querySelector(`[name="${q.id}"]`)?.dataset.touched==='true')answers[q.id]=Number(values[0]);
      const note=data.get(q.id+'_note');if(note)answers[q.id+'_note']=String(note);
      if(q.followUp){const visible=Array.isArray(answers[q.id])&&answers[q.id].some(value=>q.followUp.when.includes(value));const container=form.querySelector(`[data-self-followup="${q.id}"]`);container.hidden=!visible;if(visible){const follow=data.getAll(q.id+'_followup');if(follow.length)answers[q.id+'_followup']=follow;}else container.querySelectorAll('input').forEach(input=>input.checked=false);}
    });
  };
  form.addEventListener('change',capture);
  form.querySelectorAll('input[type=range]').forEach(input=>input.addEventListener('input',()=>{input.dataset.touched='true';input.closest('fieldset').querySelector('[data-self-output]').textContent=input.value;}));
  form.onsubmit=event=>{event.preventDefault();capture();const result=summarizeSelfReport(active,answers,engine);record={schemaVersion:1,id:record?.id||crypto.randomUUID(),createdAt:record?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString(),definition:structuredClone(active),initiative,notes,answers:structuredClone(answers),result};report();focusWorkspace();};
}
function report(){
  show();const result=record.result;
  const short=result.kind==='experience';
  const summary=short?`<p>${result.answered} of ${result.total} statements answered. No total readiness score is calculated.</p><p>Reported positive experiences: ${result.reportedStrengths.length} · Areas to discuss: ${result.discussionNeeds.length} · Not sure: ${result.uncertain.length} · Not applicable: ${result.notApplicable.length} · Unanswered: ${result.unanswered.length}</p>`:`<p>${result.answeredCount} of ${result.questionCount} questions answered.</p><p><strong>${result.scoredAnswerCount?result.score+'% context discussion indicator':'No score calculated'}</strong></p><p>The preserved context method summarizes answered items. Unknown and not-applicable responses are excluded. This is not comparable to an evidence-led Assessment Center score or a diagnosis.</p>${result.scoredAnswerCount?`<p>${escape(result.recommendation.description)}</p><details><summary>Context discussion suggestions and limits</summary><ul>${result.recommendation.implementationPath.map(item=>`<li>${escape(item)}</li>`).join('')}</ul><p>Suggestions are exploratory and may be incomplete. Review evidence, alternatives and practical constraints with an appropriate human reviewer.</p></details>`:''}`;
  workspace.innerHTML=actions+`<h2>${escape(record.definition.title)}: results</h2><p>${escape(record.initiative||'No initiative supplied')}</p>${summary}<h3>Your responses</h3><ol>${record.definition.questions.map(q=>`<li><p>${escape(q.text||q.label)}</p><p>${escape(record.answers[q.id+'_status']|| (Array.isArray(record.answers[q.id])?record.answers[q.id].join('; '):record.answers[q.id]??'Unanswered'))}</p>${record.answers[q.id+'_note']?`<p>Note: ${escape(record.answers[q.id+'_note'])}</p>`:''}${record.answers[q.id+'_followup']?`<p>Follow-up: ${escape(record.answers[q.id+'_followup'].join('; '))}</p>`:''}</li>`).join('')}</ol><h3>Your notes</h3><p>${escape(record.notes||'No notes supplied')}</p><p>Use this as a starting point for discussion and supporting evidence. Changing the label from survey to self-report assessment does not establish validation or convert historical survey records.</p><div class="ac-actions"><button type="button" class="button primary" id="self-report-save">Save to Dashboard</button><button type="button" class="button secondary" id="self-report-download">Download Result JSON</button><button type="button" class="button secondary" id="self-report-edit">Edit Responses</button><button type="button" class="button secondary" id="self-report-followup">Start a New Follow-Up</button></div><p>Saving is optional and local to this browser. Anyone using this browser profile may access saved results. Self-report results have their own history; they do not enter evidence-led score comparisons.</p><p id="self-report-status" role="status"></p>`;
  workspace.querySelector('[data-self-home]').onclick=home;
  workspace.querySelector('#self-report-download').onclick=()=>download(record);
  workspace.querySelector('#self-report-save').onclick=()=>{try{saveSelfReport(record);status('Self-report assessment saved in this browser and available on Dashboard.');listHistory();}catch(error){status(error.message+' Download a copy to keep your work.');}};
  workspace.querySelector('#self-report-edit').onclick=()=>{active=record.definition;answers=structuredClone(record.answers);initiative=record.initiative;notes=record.notes;edit();focusWorkspace();};
  workspace.querySelector('#self-report-followup').onclick=()=>{const id=record.definition.id;start(id);};
}
listHistory();
if(catalogue&&workspace){
  const filterRoot=document.querySelector('#self-report-filters');filterRoot.innerHTML=['All',...new Set(definitions.map(item=>item.category))].map(category=>`<button type="button" data-self-filter="${escape(category)}" aria-pressed="${category==='All'}">${escape(category)}</button>`).join('');
  filterRoot.querySelectorAll('button').forEach(button=>button.onclick=()=>{filterRoot.querySelectorAll('button').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));catalogueView(button.dataset.selfFilter);});
  catalogueView();
  const params=new URLSearchParams(location.search);
  if(params.has('selfReport'))start(params.get('selfReport'));
  if(params.has('selfReportResult')){try{record=readSelfReports().results.find(item=>item.id===params.get('selfReportResult'));if(record){active=record.definition;report();focusWorkspace();}else status('Saved self-report assessment not found in this browser.');}catch(error){status(error.message);}}
}
