import {languageData,registryDate} from './languages-data.mjs';
export {registryDate};
export const languages=languageData.map(([code,name,...aliases])=>({code,name,aliases}));
const fold=value=>String(value??'').normalize('NFKC').trim().toLocaleLowerCase('en');
const identifiers=new Map();
for(const language of languages)for(const alias of [language.code,language.name,...language.aliases])identifiers.set(fold(alias),language.code);
const codes=new Set(languages.map(p=>p.code));
const canonical=value=>{const text=fold(value),code=text.match(/\[([a-z]{2,3})\]$/)?.[1];return code&&codes.has(code)?code:identifiers.get(text)||text;};
export function matchesLanguage(recorded,selected){
 if(!selected)return true;
 const target=canonical(selected);
 if(canonical(recorded)===target)return true;
 return String(recorded).split(/;|,|\s+and\s+/i).some(part=>canonical(part)===target);
}
export function languageSuggestions(extra=[]){
 const counts=new Map();for(const p of languages)for(const name of [p.name,...p.aliases])counts.set(name,(counts.get(name)||0)+1);
 const options=new Map(languages.flatMap(language=>[language.name,...language.aliases].map(name=>{const value=counts.get(name)>1?`${name} [${language.code}]`:name;return [value,{value,label:`${language.code} · ${language.name}`}];})));
 for(const value of extra)if(value&&!options.has(value))options.set(value,{value,label:'Recorded language or preference'});
 return [...options.values()].sort((a,b)=>a.value.localeCompare(b.value,'en'));
}
