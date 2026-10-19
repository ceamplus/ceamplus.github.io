import { library, facets, profileFields, contextSources, principle, filterPersonas, locationOptions, usStates, sharedGoals, representation, guidance } from './library.mjs';
import { loadCustom, saveCustom, makeCustom, unknown, prefer } from './custom.mjs';
import { renderPersonaDemo } from './demo.mjs';
import {languageSuggestions,languages} from './languages.mjs';
import {countries} from './countries.mjs';
import {roleOptions,sizeOptions,demographicFields,demographicOptions} from './options.mjs';
const $=id=>document.getElementById(`persona-${id}`);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const storage={getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)};
const loaded=loadCustom(storage);
let customs=loaded.items, editing=null, openProfile=null, demoId=null;
const selected=new Set();
const all=()=>[...library,...customs];
const find=id=>all().find(persona=>persona.id===id);
const focusHeading=root=>{const heading=root.querySelector('h2');if(heading){heading.tabIndex=-1;heading.focus();}};
const status=message=>{$('builder-status').textContent=message;};
$('persist').checked=loaded.persisted;
if(!loaded.ok)status(loaded.error);
function languageField(id,value='',filter=false){
  return `<label for="${id}">Language<input id="${id}" name="language" type="search" list="persona-language-options" value="${esc(value)}" maxlength="1500" autocomplete="off" aria-describedby="${id}-hint" placeholder="${filter?'All languages — type to search':'Search or enter language(s)'}"><small id="${id}-hint">${filter?'Search by language name or code. Clear to show all.':'Search or type any language, sign language, or dialect. Separate multiple languages with semicolons. Unknown and Prefer not to answer are valid.'}</small></label>`;
}
function facetValues(key){return [...new Set([...(key==='role'?roleOptions:key==='size'?sizeOptions:[]),...all().map(p=>p[key])])].sort();}
function demographicsHTML(persona){
 const values=Object.entries(persona.demographics||{}).filter(([,value])=>value);
 return values.length?`<details><summary>Optional demographics and background</summary><p>Fictional, user-supplied context. These fields do not determine scores or behavior.</p><dl>${values.map(([key,value])=>`<dt>${esc(demographicFields[key]||key)}</dt><dd>${esc(value)}</dd>`).join('')}</dl></details>`:'';
}

function filters(){
  const existing=Object.fromEntries([...$('filters').querySelectorAll('select, input[name=language]')].map(select=>[select.name,select.value]));
  const option=(value,label,key)=>`<option value="${esc(value)}"${existing[key]===value?' selected':''}>${esc(label)}</option>`;
  $('filters').innerHTML=Object.entries(facets).map(([key,label])=>key==='language'?languageField('filter-language',existing.language||'',true):`<label for="filter-${key}">${label}<select id="filter-${key}" name="${key}"><option value="">All</option>${key==='location'?locationOptions(all()).map(group=>`<optgroup label="${group.label}">${group.options.map(p=>option(p.value,p.label,key)).join('')}</optgroup>`).join(''):facetValues(key).map(value=>option(value,value,key)).join('')}</select>${key==='location'?'<small>Choose a country, state or region, or local setting. Unspecified places are labeled.</small>':''}</label>`).join('');
}
function updateSelection(){
  $('selection').textContent=selected.size ? `${selected.size} selected: ${[...selected].map(id=>find(id)?.name).join(', ')}. Selection remains when filters change.` : 'Select two or three personas to compare.';
  $('compare').disabled=selected.size<2;
  for(const input of $('cards').querySelectorAll('[data-compare]'))input.disabled=selected.size>=3&&!selected.has(input.dataset.compare);
}
function cards(){
  const current=Object.fromEntries([...$('filters').querySelectorAll('select, input[name=language]')].map(select=>[select.name,select.value]));
  const items=filterPersonas(all(),current);
  $('count').textContent=`${items.length} of ${all().length} personas shown. ${library.length} fictional library profiles; ${customs.length} user-created scenarios.`;
  $('cards').innerHTML=items.length?items.map(persona=>`<article class="persona-card"><span class="persona-initial" aria-hidden="true">${esc(persona.name[0])}</span><p class="persona-badge">${persona.kind==='custom'?'User-created · fictional':'CEAM+ library · fictional / unvalidated'}</p><h3>${esc(persona.name)}</h3><p>${esc(persona.role)}<br>${esc(persona.location)}</p><p>${esc(persona.context)}</p><p><strong>A question to explore:</strong> ${esc(persona.hesitation)}</p><button type="button" data-profile="${persona.id}">Open profile: ${esc(persona.name)}</button><label><input type="checkbox" data-compare="${persona.id}"${selected.has(persona.id)?' checked':''}>Compare ${esc(persona.name)}</label></article>`).join(''):'<p class="persona-empty">No profiles match these circumstances. Clear a filter or create a custom scenario; absence here does not mean a perspective is unimportant.</p>';
  updateSelection();
}
function evidence(persona){return `<details><summary>Assumptions and Evidence</summary><dl><dt>Fictional details and construction assumptions</dt><dd>${esc(persona.assumptions)}</dd><dt>Documented conditions / research</dt><dd>${esc(persona.evidenceStatus)} General accessibility and connectivity sources are context, not evidence that this person or group behaves a certain way.</dd><dt>Unknowns</dt><dd>${esc(persona.unknown)}</dd><dt>Verify with real users</dt><dd>${esc(persona.evidence)}</dd><dt>Lived-experience review</dt><dd>${esc(persona.review)}</dd></dl><p>Version ${persona.version} · updated ${esc(persona.updated)}. Research context, not an organizational diagnosis.</p>${contextSources.map(source=>`<p><a href="${source.url}">${esc(source.title)}</a> — ${esc(source.note)}</p>`).join('')}</details>`;}
function profile(id){
  const persona=find(id);if(!persona)return;
  openProfile=id;
  $('profile').hidden=false;
  $('profile').innerHTML=`<p class="persona-badge">${persona.kind==='custom'?'User-created fictional scenario':'CEAM+ fictional composite · provisional'}</p><h2>${esc(persona.name)}</h2><p>${esc(persona.location)} · ${esc(persona.community)}</p><h3>Goals</h3><ul>${persona.goals.map(goal=>`<li>${esc(goal)}</li>`).join('')}</ul><dl class="persona-profile-grid">${[...Object.entries(facets),...Object.entries(profileFields)].map(([key,label])=>`<div><dt>${esc(label)}</dt><dd>${esc(persona[key])}</dd></div>`).join('')}</dl>${demographicsHTML(persona)}${evidence(persona)}<div class="persona-actions"><button type="button" data-explore="${id}">Explore CEAM+ as this persona</button><button type="button" data-export="${id}">Export persona JSON</button>${persona.kind==='custom'?`<button type="button" data-edit="${id}">Edit custom persona</button><button type="button" data-duplicate="${id}">Duplicate custom persona</button><button type="button" data-delete="${id}">Delete custom persona</button>`:''}<button type="button" id="persona-close-profile">Close profile</button></div>`;
  focusHeading($('profile'));
}
const compareFields=[['Different constraints',p=>`${p.time} ${p.securityDetail}`],['Differences in access',p=>`${p.accessDetail} ${p.needs}`],['Practical agency',p=>`${p.authority} ${p.optout}`],['Support requirements',p=>p.support],['Possible benefits to investigate',p=>p.interest],['Possible burdens to investigate',p=>p.hesitation],['Evidence gaps',p=>`${p.unknown} ${p.evidenceStatus}`],['Questions before a recommendation',p=>guidance(p).map(([label,text])=>`${label}: ${text}`).join(' ')]];
function comparison(){
  const items=[...selected].map(find).filter(Boolean);
  if(items.length<2){$('comparison').hidden=true;return;}
  const goals=sharedGoals(items);
  $('comparison').hidden=false;$('comparison').style.setProperty('--persona-columns',items.length);
  $('comparison').innerHTML=`<h2>Compare Personas</h2><p>Fictional circumstances, not ranked people. No scores, adoption probabilities, or group predictions are generated.</p><h3>Shared goals</h3><p>${goals.length?esc(goals.join('; ')):'No exact shared goal is recorded. Ask whether priorities overlap; do not infer consensus.'}</p><div class="persona-compare-cells">${items.map(p=>`<article><h4>${esc(p.name)}</h4><p>${esc(p.goals.join('; '))}</p></article>`).join('')}</div>${compareFields.map(([label,value])=>`<section class="persona-compare-row"><h3>${label}</h3><div class="persona-compare-cells">${items.map(p=>`<article><h4>${esc(p.name)}</h4><p>${esc(value(p))}</p></article>`).join('')}</div></section>`).join('')}<button type="button" id="persona-close-comparison">Close comparison</button>`;
  focusHeading($('comparison'));
}
function persist(message){
  if(!$('persist').checked){status(`${message} In this tab only; export a copy or enable browser saving.`);return;}
  const result=saveCustom(storage,customs);status(result.ok?`${message} Saved in this browser only.`:result.error);
}
function refresh(){
  document.getElementById('persona-language-options').innerHTML=languageSuggestions([unknown,prefer,...all().map(p=>p.language)]).map(item=>`<option value="${esc(item.value)}" label="${esc(item.label)}"></option>`).join('');
  filters();cards();
}
function builder(){
  const options=key=>[unknown,prefer,'Other / describe in context',...new Set([...(key==='location'?[...countries,...usStates.map(state=>`United States · ${state}`)]:key==='role'?roleOptions:key==='size'?sizeOptions:[]),...all().map(p=>p[key])])];
  const locationLabels=new Map(locationOptions(library)[2].options.map(p=>[p.value,p.label]));
  const textFields={context:'Role and context (fictional)',goals:'Goals (one per line)',hesitation:'Constraints and reasons for caution',accessDetail:'Technology access in practice',experienceDetail:'Experience level and learning needs',time:'Available time and mental bandwidth',securityDetail:'Financial and employment considerations',support:'Human support',needs:'Accessibility and language requirements',authority:'Decision authority',optout:'Ability to opt out, question, or override',interest:'Potential benefit to investigate',success:'What successful adoption might look like',evidence:'Evidence available / needed',unknown:'Important unknowns'};
  const selectField=(key,label,values,optional=false)=>`<label for="custom-${key}">${label}<select id="custom-${key}" name="${key}">${(optional?['',unknown,prefer,...values]:values).map(value=>`<option value="${esc(value)}">${esc(value||'Not supplied')}</option>`).join('')}</select></label>`;
  const circumstances=Object.entries(facets).map(([key,label])=>key==='language'?languageField('custom-language',unknown):selectField(key,label,options(key))).join('');
  const descriptions=Object.entries(textFields).map(([key,label])=>`<label for="custom-${key}">${label}<textarea id="custom-${key}" name="${key}" rows="3" maxlength="1500" placeholder="Fictional circumstances only. Unknown or Prefer not to answer are valid."></textarea></label>`).join('');
  const demographics=Object.entries(demographicOptions).map(([key,values])=>selectField(key,demographicFields[key],values,true)).join('');
  $('builder-fields').innerHTML=`<details open><summary>Describe circumstances · no real identity</summary><div class="persona-builder-grid">${descriptions}</div></details>
  <details id="persona-circumstances"><summary>Optional library filters and sensitive circumstances</summary><p>Every field supports Prefer not to answer. Disabled person and Homemaker / home maker are available as roles; a disability does not imply employment status, needs, or ability.</p><div class="persona-builder-grid">${circumstances}${selectField('lifeStage','Age / life stage',[unknown,prefer,'Adult','Young adult','Caregiving stage','Workforce transition','Retired adult','Other / describe in context'])}</div></details>
  <details id="persona-demographics"><summary>Optional demographics and background</summary><p>Skip every field if you wish. Use fictional composites only. Sex, gender, age, and background do not set assessment scores, capability, or expected behavior. Describe self-defined details in Additional background without names, exact dates of birth, addresses, or identifiable histories.</p><div class="persona-builder-grid">${demographics}<label for="custom-background">Additional background (optional)<textarea id="custom-background" name="background" rows="4" maxlength="1500" placeholder="Fictional cultural, community, education, or life context. Leave blank or enter Prefer not to answer."></textarea></label></div></details>
  <datalist id="persona-language-options"></datalist><p class="ac-small">${languages.length.toLocaleString('en')} registered language entries, including sign languages, plus custom entries. Names and codes: <a href="https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry">IANA Language Subtag Registry</a>. Language choices describe a persona; the website interface remains in English. Country and territory names: <a href="https://cldr.unicode.org/">Unicode CLDR</a>.</p>`;
  for(const option of $('builder-fields').querySelectorAll('#custom-location option'))option.textContent=locationLabels.get(option.value)||option.value;
}

function edit(id){
  const persona=find(id);if(persona?.kind!=='custom')return;
  editing=id;
  for(const element of $('builder-form').elements){if(Object.hasOwn(demographicFields,element.name))element.value=persona.demographics?.[element.name]||'';}
  for(const element of $('builder-form').elements){if(element.name&&Object.hasOwn(persona,element.name)){const value=Array.isArray(persona[element.name])?persona[element.name].join('\n'):persona[element.name];element.value=value;}}
  $('save').textContent='Save custom persona edits';document.getElementById('builder-title').focus();status(`Editing ${persona.name}. No real name is requested.`);
}
function resetBuilder(){$('builder-form').querySelector('#custom-language').value=unknown;editing=null;$('builder-form').querySelectorAll('textarea').forEach(input=>input.value='');$('builder-form').querySelectorAll('select').forEach(input=>input.selectedIndex=0);$('save').textContent='Create custom persona';}
function exportPersona(id){
  const persona=find(id);if(!persona)return;
  const url=URL.createObjectURL(new Blob([JSON.stringify({schemaVersion:1,persona,limitations:principle},null,2)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download=`ceam-persona-${id}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function explore(id){
  const persona=find(id);if(!persona)return;demoId=id;
  const heading=renderPersonaDemo($('demo'),persona);
  if(persona.kind==='library'){
    const links=document.createElement('div');links.className='persona-actions';
    for(const [file,label] of [['dashboard.html','Open Dashboard demonstration'],['assessment-center.html','Open assessment demonstration']]){const link=document.createElement('a');link.className='button secondary';link.href=`${file}?demo=true&persona=${encodeURIComponent(id)}`;link.textContent=label;links.append(link);}
    $('demo').append(links);
  }else{const note=document.createElement('p');note.textContent='Custom personas are explored in this panel only. Their free-text contents are not placed in URLs or transferred to assessments.';$('demo').append(note);}
  heading.focus();
}
$('filters').addEventListener('change',cards);
$('filters').addEventListener('input',event=>{if(event.target.name==='language')cards();});
$('clear-filters').addEventListener('click',()=>{$('filters').querySelectorAll('select, input[name=language]').forEach(select=>select.value='');cards();});
$('cards').addEventListener('change',event=>{const id=event.target.dataset.compare;if(!id)return;if(event.target.checked&&selected.size<3)selected.add(id);else selected.delete(id);updateSelection();});
$('compare').addEventListener('click',comparison);
$('clear-selection').addEventListener('click',()=>{selected.clear();cards();$('comparison').hidden=true;});
$('cancel-edit').addEventListener('click',()=>{resetBuilder();status('Builder cleared. Existing personas are unchanged.');});
$('persist').addEventListener('change',()=>{if($('persist').checked)persist('Current custom personas');else status('Future edits will stay in this tab. Previously saved personas remain until explicitly deleted.');});
$('builder-form').addEventListener('submit',event=>{
  event.preventDefault();
  if(!editing&&customs.length>=100){status('This browser workspace supports up to 100 custom personas. Export or delete one before adding another.');return;}
  const input=Object.fromEntries(new FormData($('builder-form')));
  const id=editing||`custom-${crypto.randomUUID()}`;
  const name=editing?find(id).name:`Custom scenario ${customs.length+1}`;
  const persona=makeCustom(input,id,name);
  customs=editing?customs.map(item=>item.id===id?persona:item):[...customs,persona];
  persist(editing?'Persona updated.':'Persona created.');resetBuilder();refresh();profile(id);
  if(demoId===id)explore(id);
  if(!$('comparison').hidden)comparison();
});
document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.profile)profile(button.dataset.profile);
  if(button.dataset.explore)explore(button.dataset.explore);
  if(button.dataset.edit)edit(button.dataset.edit);
  if(button.dataset.export)exportPersona(button.dataset.export);
  if(button.dataset.duplicate){const original=find(button.dataset.duplicate);if(original?.kind!=='custom'||customs.length>=100)return;const copy=makeCustom(original,`custom-${crypto.randomUUID()}`,`Custom scenario ${customs.length+1}`);customs.push(copy);persist('Persona duplicated.');refresh();profile(copy.id);}
  if(button.dataset.delete){
    const id=button.dataset.delete;if(find(id)?.kind!=='custom')return;
    customs=customs.filter(item=>item.id!==id);selected.delete(id);
    // An explicit delete also removes an existing saved copy, even if future saving is off.
    const existing=loadCustom(storage);
    let deletionMessage='Persona deleted from this tab.';
    if(!existing.ok) deletionMessage+=' Stored copies could not be checked or removed; browser storage is unavailable.';
    else if(existing.items.some(item=>item.id===id)){const outcome=saveCustom(storage,existing.items.filter(item=>item.id!==id));deletionMessage+=outcome.ok?' Saved copy deleted.':` ${outcome.error}`;}
    if($('persist').checked)persist(deletionMessage);else status(deletionMessage);
    if(editing===id)resetBuilder();if(demoId===id){$('demo').hidden=true;demoId=null;}if(openProfile===id)$('profile').hidden=true;
    refresh();if(!$('comparison').hidden)comparison();document.getElementById('builder-title').focus();
  }
  if(button.id==='persona-close-profile'){$('profile').hidden=true;document.querySelector(`[data-profile="${openProfile}"]`)?.focus();}
  if(button.id==='persona-close-comparison'){$('comparison').hidden=true;$('compare').focus();}
});
$('demo').addEventListener('persona-ended',()=>{document.querySelector(`[data-explore="${demoId}"]`)?.focus();demoId=null;});
const review=representation(library);
const geography={};for(const p of library){const country=p.location.split(' · ')[0];geography[country]=(geography[country]||0)+1;}
$('review').innerHTML=`<article><h3>Geographic concentration</h3><ul>${Object.entries(geography).map(([key,count])=>`<li>${esc(key)}: ${count} of ${library.length}</li>`).join('')}</ul><p>The United States has the most profiles. Country presence does not establish cultural or within-country coverage.</p></article>${Object.entries(review).map(([key,values])=>`<article><h3>${esc(facets[key]||'Age / life stage')}</h3><p>Largest recorded category: ${esc(values[0][0])} (${values[0][1]} of ${library.length}).</p><ul>${values.map(([value,count])=>`<li>${esc(value)}: ${count}</li>`).join('')}</ul></article>`).join('')}`;
$('principle').textContent=principle;
$('sources').innerHTML=contextSources.map(source=>`<p><a href="${source.url}">${esc(source.title)}</a> — ${esc(source.note)}</p>`).join('');
builder();refresh();
