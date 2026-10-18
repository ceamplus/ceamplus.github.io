import { guidance, notice } from './library.mjs';
export function renderPersonaDemo(root, persona) {
  root.replaceChildren(); root.hidden = false;
  root.className = 'persona-demo';
  const add = (tag,text,parent=root) => { const element=document.createElement(tag); element.textContent=text; parent.append(element); return element; };
  add('p','Fictional persona demonstration · no scoring or saving').className='eyebrow';
  const heading=add('h2',`Explore CEAM+ as ${persona.name}`); heading.tabIndex=-1;
  add('p',notice);
  add('p','This changes only the questions and explanations in this demonstration panel. Assessment answers, weights, scores, and organizational results are unchanged. A persona cannot answer an assessment for a person.');
  const controls=add('div',''); controls.className='persona-actions';
  const short=add('button','Use shorter explanations',controls); short.type='button'; short.setAttribute('aria-pressed','false');
  const large=add('button','Larger demonstration text',controls); large.type='button'; large.setAttribute('aria-pressed','false');
  const close=add('button','End persona demonstration',controls); close.type='button';
  const brief=add('p','Ask: Can I access this? Do I have time and support? Can I say no or correct an error? Try one small task with a person available to help.'); brief.hidden=true;
  const full=add('div','');
  for (const [title,text] of guidance(persona)) { add('h3',title,full); add('p',text,full); }
  const example=add('details',''); add('summary','Try an assessment-language check',example);
  add('p','Original discussion question: “Does the implementation preserve practical agency?”',example);
  add('p','Plain-language version: “Can you ask for help, say no, or correct the tool without losing something important?”',example);
  const label=add('label','Which follow-up should the demonstration emphasize?',example);
  const select=add('select','',label);
  for (const text of ['Choose a question','Access and alternatives','Paid time to learn','A human to review or override','What remains unknown','Prefer not to answer']) { const option=add('option',text,select); option.value=text; }
  const response=add('p','No answer is inferred from the persona.',example); response.setAttribute('role','status');
  select.addEventListener('change',()=> { response.textContent=select.selectedIndex ? `Demonstration focus: ${select.value}. Ask the person what this means in practice; no score is generated.` : 'No answer is inferred from the persona.'; });
  short.addEventListener('click',()=>{ const on=short.getAttribute('aria-pressed')!=='true'; short.setAttribute('aria-pressed',String(on)); brief.hidden=!on; full.hidden=on; });
  large.addEventListener('click',()=>{const on=large.getAttribute('aria-pressed')!=='true';large.setAttribute('aria-pressed',String(on));root.classList.toggle('persona-large',on);});
  close.addEventListener('click',()=>{root.hidden=true;root.dispatchEvent(new CustomEvent('persona-ended'));});
  return heading;
}
