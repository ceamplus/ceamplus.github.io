import { getPersona } from './library.mjs';
import { renderPersonaDemo } from './demo.mjs';
const params = new URLSearchParams(location.search);
const persona = getPersona(params.get('persona'));
// Read-only, allowlisted library ID. Real assessment and saved-result routes take precedence.
if (persona && params.get('demo') === 'true' && !params.has('result') && !params.has('assessment')) {
  const main = document.querySelector('main');
  const panel = document.createElement('section'); panel.id='persona-context'; panel.hidden=true;
  main.prepend(panel);
  const isAssessment = location.pathname.endsWith('assessment-center.html');
  let shown=false,ended=false;
  const sync=()=>{
    const allowed=!isAssessment || !!document.querySelector('#ac-workspace .ac-demo');
    if (allowed && !shown && !ended) { renderPersonaDemo(panel,persona);shown=true; }
    panel.hidden=!allowed || ended;
  };
  panel.addEventListener('persona-ended',()=>{ended=true;panel.hidden=true; const target=document.querySelector('main h1, #ac-workspace h2');if(target){target.tabIndex=-1;target.focus();}});
  sync();
  if (isAssessment) new MutationObserver(sync).observe(document.querySelector('#ac-workspace'),{childList:true,subtree:true});
}
