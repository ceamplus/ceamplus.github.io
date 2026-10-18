import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {library,facets,profileFields,filterPersonas,locationOptions,usStates,sharedGoals,representation,guidance,notice,principle} from '../js/personas/library.mjs';
import {makeCustom,loadCustom,saveCustom,storageKey,prefer} from '../js/personas/custom.mjs';
test('fictional library is complete, unique, provisional, and not demographic scoring',()=>{
  assert.equal(library.length,16);assert.equal(new Set(library.map(p=>p.id)).size,16);
  for(const p of library){for(const key of [...Object.keys(facets),...Object.keys(profileFields),'assumptions','unknown','review','evidenceStatus'])assert.equal(typeof p[key],'string',`${p.id}.${key}`);assert(p.goals.length);assert.equal(p.reviewed,false);assert.equal(p.kind,'library');assert(!Object.hasOwn(p,'score'));assert.match(p.assumptions,/fictional/);}
  assert.match(notice,/do not predict/);assert.match(principle,/rather than demographic destiny/);
});
test('all twelve filters combine exactly and no-match is empty',()=>{
  assert.equal(Object.keys(facets).length,12);
  for(const key of Object.keys(facets)){const value=library[0][key];assert(filterPersonas(library,{[key]:value}).every(p=>p[key]===value));}
  assert.deepEqual(filterPersonas(library,{role:'Student',location:library[0].location}),[]);
  assert.equal(filterPersonas(library,{}).length,16);
});
test('location selections support countries, regions and detailed local settings',()=>{
  assert.equal(filterPersonas(library,{location:'country:United States'}).length,9);
  assert.deepEqual(filterPersonas(library,{location:'region:United States · Illinois'}).map(p=>p.id),['dev']);
  assert.deepEqual(filterPersonas(library,{location:'country:United States',role:'Student'}).map(p=>p.id),['dev']);
  assert.deepEqual(filterPersonas(library,{location:'region:India · Maharashtra'}).map(p=>p.id),['ravi']);
  const groups=locationOptions(library);
  assert.equal(groups.length,3);
  assert.match(groups[2].options.find(p=>p.value===library[0].location).label,/United States · Kentucky · Rural Appalachia · town unspecified/);
  assert.match(groups[2].options.find(p=>p.value===library.find(p=>p.id==='rowan').location).label,/state and Nation unspecified/);
  const custom=makeCustom({location:library[0].location},'custom-location','Custom location');
  assert.equal(filterPersonas([custom],{location:custom.location}).length,1);
  assert.equal(filterPersonas([custom],{location:'country:United States'}).length,1);
});
test('all 50 US states are selectable and custom state choices survive storage',()=>{
  assert.equal(usStates.length,50);assert.equal(new Set(usStates).size,50);
  assert.deepEqual([...usStates].sort(),usStates);
  const regions=locationOptions(library)[1].options.filter(option=>option.value.startsWith('region:United States · '));
  assert.equal(regions.length,50);
  for(const state of usStates){
    const persona=makeCustom({location:`United States · ${state}`},'custom-state','State scenario');
    const storage={value:null,setItem(key,value){this.value=value;},getItem(){return this.value;}};
    assert(saveCustom(storage,[persona]).ok);
    const saved=loadCustom(storage).items;
    assert.equal(filterPersonas(saved,{location:`region:United States · ${state}`}).length,1,state);
    assert.equal(filterPersonas(saved,{location:'country:United States'}).length,1,state);
  }
  assert.deepEqual(filterPersonas(library,{location:'region:United States · Alaska'}),[]);
  assert.equal(filterPersonas([makeCustom({location:library[0].location},'custom-local','Local scenario')],{location:'region:United States · Kentucky'}).length,1);
});
test('comparison finds actual shared goals, not invented consensus',()=>{
  assert.deepEqual(sharedGoals([{goals:['a','b']},{goals:['b','c']},{goals:['b']}]),['b']);
  assert.deepEqual(sharedGoals([{goals:['a']},{goals:['b']}]),[]);
});
test('representation counts add up without treating coverage as validation',()=>{
  for(const counts of Object.values(representation(library)))assert.equal(counts.reduce((sum,[,count])=>sum+count,0),16);
});
test('guidance depends on declared circumstances, not demographic changes',()=>{
  const p=library[0];const changed={...p,location:'Elsewhere',lifeStage:'Different age',name:'Another fictional label',gender:'Different',race:'Different'};
  assert.deepEqual(guidance(p),guidance(changed));assert.equal(guidance(p).length,6);
});
test('custom persona does not require identity and sensitive fields preserve refusal',()=>{
  const p=makeCustom({security:prefer,accessibility:prefer,language:prefer,lifeStage:prefer,goals:'Learn\nKeep support'},'custom-1','Custom scenario 1');
  assert.equal(p.kind,'custom');assert.equal(p.security,prefer);assert.equal(p.lifeStage,prefer);assert.deepEqual(p.goals,['Learn','Keep support']);assert.equal(p.reviewed,false);assert(!('score' in p));
});
test('custom persistence uses a separate key and rejects malformed or blocked data',()=>{
  const data=new Map([['ceamplus.assessment-center.v1','preserve']]);const storage={getItem:key=>data.get(key),setItem:(key,value)=>data.set(key,value)};
  const p=makeCustom({},'custom-1','Custom scenario 1');assert(saveCustom(storage,[p]).ok);assert.equal(loadCustom(storage).items.length,1);assert.equal(data.get('ceamplus.assessment-center.v1'),'preserve');
  data.set(storageKey,'broken');assert.equal(loadCustom(storage).ok,false);assert.equal(data.get(storageKey),'broken');
  const denied={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
  assert.equal(loadCustom(denied).ok,false);assert.equal(saveCustom(denied,[p]).ok,false);
});
test('persona modules cannot write assessment scores or storage',()=>{
  for(const file of ['library','custom','demo','context','app']){const code=fs.readFileSync(new URL(`../js/personas/${file}.mjs`,import.meta.url),'utf8');assert.doesNotMatch(code,/import.*(?:assessments\/|scoring|storage\.mjs)/);assert.doesNotMatch(code,/ceamplus\.assessment-center/);}
});
