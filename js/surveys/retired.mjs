/** Read-only legacy access. No scoring, migration, persistence writes or network requests. */
import { surveys } from './definitions.mjs';
const root = document.querySelector('#legacy-survey-history');
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const element = (tag, text) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; return node; };
function download(value, name) {
  const url = URL.createObjectURL(new Blob([typeof value === 'string' ? value : JSON.stringify(value, null, 2)], {type:'application/json'}));
  const link = element('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function jsonView(parent, label, value) {
  const detail = element('details'); detail.append(element('summary', label));
  const pre = element('pre', JSON.stringify(value, null, 2)); pre.style.whiteSpace = 'pre-wrap'; pre.style.overflowWrap = 'anywhere'; detail.append(pre); parent.append(detail);
}
function button(parent, label, handler) { const node = element('button', label); node.type='button'; node.className='button secondary'; node.addEventListener('click', handler); parent.append(node); }
if (root) {
  root.replaceChildren();
  try {
    const raw = localStorage.getItem('ceamplus.surveys.v1');
    if (!raw) root.append(element('p','No browser-saved legacy short-survey records found. Existing downloaded files are not automatically stored here.'));
    else {
      const state = JSON.parse(raw);
      if (!object(state) || state.schemaVersion !== 1 || !object(state.results) || !object(state.drafts)) throw new Error('Unsupported legacy history format.');
      const results = Object.values(state.results).flat();
      const drafts = Object.values(state.drafts);
      root.append(element('p',`${results.length} legacy survey results and ${drafts.length} legacy drafts. These are not assessment results. No survey scores enter assessment comparisons.`));
      button(root,'Download Original Legacy Storage JSON',()=>download(raw,'ceam-legacy-survey-storage.json'));
      for (const record of results) {
        const article=element('article'); article.className='research-callout';
        const definition=surveys.find(s=>s.id===record?.assessmentId);
        article.append(element('h3',`Legacy survey result: ${definition?.title || record?.assessmentId || 'Unknown instrument'}`));
        article.append(element('p',`Original date: ${record?.createdAt || 'Not recorded'} · Original version: ${record?.version || 'Not recorded'}. Stored interpretation only; not recalculated.`));
        jsonView(article,'Read original responses and stored result',record);
        if(object(record)&&object(record.response)&&object(record.result)) button(article,'Download Legacy Survey JSON',()=>download({survey:record.response.definitionSnapshot||(definition&&String(record.version)===definition.version?definition:{id:record.assessmentId,version:record.version||'not-recorded',historicalDefinition:'Not retained in saved record'}),response:record.response,result:record.result},'ceam-'+String(record.assessmentId||'legacy').replace(/[^a-z0-9-]/gi,'')+'.json'));
        root.append(article);
      }
      for (const draft of drafts) jsonView(root,'Legacy survey draft, read only (not a completed result)',draft);
    }
  } catch (error) {
    root.append(element('p','Legacy history could not be read. Existing storage has not been changed. '+error.message));
    button(root,'Download Unmodified Legacy Storage Backup',()=>{try{const raw=localStorage.getItem('ceamplus.surveys.v1');if(raw!==null)download(raw,'ceam-legacy-survey-storage-backup.json');}catch{}});
  }
}
const routeNote=document.querySelector('#legacy-route-note');
if(routeNote){
  const params=new URLSearchParams(location.search);const requested=params.get('survey');
  const match=surveys.find(s=>s.assessmentId===requested||s.id===requested);
  routeNote.append(element('p','Old context, survey, query and hash links now open this retirement page. No survey starts automatically.'));
  const link=element('a',match?'Open related assessment: '+match.title.replace(/Survey$/,'Assessment'):'Browse existing assessments');
  link.href=match?'assessment-center.html?assessment='+encodeURIComponent(match.assessmentId):'assessment-center.html#explore';
  routeNote.append(link);
  if(match)routeNote.append(element('p','Topic relationship only. This is a different instrument, not a conversion or comparable score.'));
}
const picker=document.querySelector('#legacy-result-file');
if(picker)picker.addEventListener('change',async()=>{
  const view=document.querySelector('#legacy-file-view');view.replaceChildren();const file=picker.files[0];if(!file)return;
  if(file.size>10*1024*1024){view.append(element('p','Choose a JSON file smaller than 10 MB. No data was changed.'));return;}
  try{const raw=await file.text();const value=JSON.parse(raw);
    const longResult=object(value)&&['personal','business','education','healthcare','rehabilitation'].includes(value.assessmentId)&&object(value.responses)&&object(value.recommendation);
    const shortResult=object(value)&&object(value.survey)&&String(value.survey.id||'').startsWith('survey-')&&object(value.response)&&object(value.result);
    if(!longResult&&!shortResult)throw new Error('This file is not a recognized legacy survey result. Assessment and demo files must be opened in their own workflow.');
    view.append(element('h3','Legacy survey result, original downloaded file'),element('p','Read only. Original score, recommendations, timestamps and version are preserved exactly as supplied. No assessment comparison or recalculation.'));
    jsonView(view,'Read original downloaded result',value);button(view,'Download Unchanged Original Result',()=>download(raw,'ceam-legacy-original-result.json'));
  }catch(error){view.append(element('p',error.message+' Nothing was imported or written to storage.'));}
});
