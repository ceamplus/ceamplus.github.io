import { facets, profileFields } from './library.mjs';
export const storageKey = 'ceamplus.personas.custom.v1';
export const unknown = 'Unknown / not specified';
export const prefer = 'Prefer not to answer';
const clean = value => typeof value === 'string' ? value.trim().slice(0, 1500) : '';
export function makeCustom(input, id, name) {
  const persona = { id, name, kind:'custom', version:1, updated:new Date().toISOString().slice(0,10), reviewed:false };
  for (const field of [...Object.keys(facets), ...Object.keys(profileFields)]) persona[field] = clean(input[field]) || unknown;
  persona.goals = (Array.isArray(input.goals) ? input.goals : clean(input.goals).split('\n')).filter(value => typeof value === 'string' && value.trim()).slice(0,10).map(clean);
  if (!persona.goals.length) persona.goals = ['Goals not specified'];
  persona.assumptions = 'User-created fictional planning scenario. All entered details are assumptions unless separately verified; never a real participant record.';
  persona.unknown = clean(input.unknown) || 'Important unknowns have not been recorded.';
  persona.review = 'Not independently reviewed for lived experience or research validity.';
  persona.evidenceStatus = 'User-entered evidence notes; not verified by CEAM+.';
  return persona;
}
export function loadCustom(storage) {
  try {
    const raw = storage.getItem(storageKey);
    if (!raw) return { ok:true, items:[], persisted:false };
    const parsed = JSON.parse(raw);
    if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.items) || parsed.items.length > 100) throw Error('Unrecognized persona file');
    const ids = new Set();
    const items = parsed.items.map((item,index) => {
      if (typeof item.id !== 'string' || !/^custom-[a-z0-9-]+$/i.test(item.id) || ids.has(item.id)) throw Error('Invalid persona identifier');
      ids.add(item.id);
      return makeCustom(item,item.id,`Custom scenario ${index+1}`);
    });
    return { ok:true,items,persisted:true };
  } catch { return { ok:false,items:[],persisted:false,error:'Custom persona storage is unavailable or unreadable. Existing stored data has not been changed. You can work in this tab and export.' }; }
}
export function saveCustom(storage, items) {
  try {
    if (items.length > 100 || items.some(item => item.kind !== 'custom' || !item.id.startsWith('custom-'))) throw Error('Invalid custom personas');
    storage.setItem(storageKey,JSON.stringify({ schemaVersion:1,items }));
    return { ok:true };
  } catch { return { ok:false,error:'Changes are in this tab only. Browser saving failed; any previously stored copy is unchanged. Export to keep your work.' }; }
}
