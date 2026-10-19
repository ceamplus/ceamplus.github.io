import test from 'node:test';
import assert from 'node:assert/strict';
import {languages,registryDate,matchesLanguage,languageSuggestions} from '../js/personas/languages.mjs';
import {countries,countryData} from '../js/personas/countries.mjs';
import {roleOptions,sizeOptions,demographicFields} from '../js/personas/options.mjs';
import {library,locationOptions,filterPersonas,guidance} from '../js/personas/library.mjs';
import {makeCustom,saveCustom,loadCustom} from '../js/personas/custom.mjs';
test('complete IANA snapshot covers languages, aliases, and sign languages',()=>{
 assert.equal(registryDate,'2026-09-17');assert.equal(languages.length,8043);
 assert.equal(new Set(languages.map(p=>p.code)).size,languages.length);
 const suggestions=languageSuggestions();const labels=new Set(suggestions.map(p=>p.label.split(' · ')[0]));
 for(const p of languages){assert.match(p.code,/^[a-z]{2,3}$/);assert(p.name);assert(labels.has(p.code),p.code);}
 for(const name of ['American Sign Language','British Sign Language','English','Mandarin Chinese','Esperanto','Latin','Cherokee','Navajo','Zulu'])assert(languages.some(p=>p.name===name),name);
 assert(matchesLanguage('English and Spanish','es'));assert(matchesLanguage('Bangla','bn'));assert(matchesLanguage('Punjabi','pa'));
 assert(matchesLanguage('American Sign Language; English','ase'));assert(matchesLanguage('My community language','My community language'));
 assert(!matchesLanguage('English','American Sign Language'));
 assert.equal(filterPersonas(library,{language:'Hindi'}).length,1);
});
test('every country and territory is selectable and saved countries filter correctly',()=>{
 assert.equal(countryData.length,257);assert.equal(new Set(countryData.map(p=>p[0])).size,257);
 const choices=new Set(locationOptions(library)[0].options.map(p=>p.value));
 for(const country of countries){assert(choices.has(`country:${country}`));const p=makeCustom({location:country},'custom-country','Country scenario');assert.equal(filterPersonas([p],{location:`country:${country}`}).length,1);}
 for(const country of ['Canada','Australia','New Zealand','South Africa','Brazil','Japan','United States','Palestinian Territories','Kosovo'])assert(countries.includes(country),country);
});
test('expanded roles and organization sizes preserve selected circumstances',()=>{
 assert(roleOptions.includes('Disabled person'));assert(roleOptions.includes('Homemaker / home maker'));assert(sizeOptions.includes('10,000+ people'));assert(sizeOptions.includes('Solo / 1 person'));
 const p=makeCustom({role:'Disabled person',size:'10,000+ people'},'custom-role','Role scenario');
 assert.equal(p.role,'Disabled person');assert.equal(p.size,'10,000+ people');assert.equal(p.demographics.employment,undefined);
});
test('optional demographics persist, remain optional and do not change guidance or scores',()=>{
 const blank=makeCustom({},'custom-blank','Blank');assert.deepEqual(blank.demographics,{});
 const demographics=Object.fromEntries(Object.keys(demographicFields).map(key=>[key,'Prefer not to answer']));
 const p=makeCustom({language:'American Sign Language; English; My community language',location:'Canada',demographics},'custom-optional','Optional');
 const storage={value:null,setItem(key,value){this.value=value;},getItem(){return this.value;}};
 assert(saveCustom(storage,[p]).ok);const restored=loadCustom(storage).items[0];assert.deepEqual(restored.demographics,demographics);assert.equal(restored.language,p.language);
 assert.deepEqual(guidance({...library[0],demographics}),guidance(library[0]));assert(!Object.hasOwn(p,'score'));
 assert.equal(makeCustom({sex:'Female',ageBand:'35–44'},'custom-flat','Flat').demographics.ageBand,'35–44');
});
