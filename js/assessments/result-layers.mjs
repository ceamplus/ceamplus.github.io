import {scoreQuestion} from './scoring.mjs';
import {INTERPRETATION_VERSION,EVIDENCE_METHOD,LEGACY_VERSION,versionOf} from './scoring-versions.mjs';
const rounded=value=>Math.round(value*10)/10;
const number=value=>typeof value==='number'&&Number.isFinite(value);
const text=value=>typeof value==='string'?value.trim():'';
const weight=value=>number(value)&&value>0?value:1;
export function completion(definition,response={}){
  const counts={total:0,answered:0,applicable:0,skipped:0,notApplicable:0,uncertain:0,invalid:0,usablePercent:0};
  for(const d of definition.dimensions||[])for(const q of d.questions||[]){
    const {status}=scoreQuestion(q,response.answers?.[q.id]);counts.total++;
    if(status==='notApplicable')counts.notApplicable++;
    else{counts.applicable++;if(status==='scored')counts.answered++;else if(status==='unanswered')counts.skipped++;else if(status==='unknown')counts.uncertain++;else counts.invalid++;}
  }
  counts.usablePercent=counts.applicable?rounded(counts.answered/counts.applicable*100):0;
  return counts;
}
export function buildResultLayers(definition,response={},result={},now=new Date()){
  const coverage=completion(definition,response);
  const sufficient=coverage.answered>0&&coverage.usablePercent>=60;
  const relevant=(definition.dimensions||[]).filter(d=>d.questions.some(q=>scoreQuestion(q,response.answers?.[q.id]).status!=='notApplicable'));
  const evidenceRows=relevant.map(d=>{const e=response.evidence?.[d.id]||{};return {id:d.id,quality:e.quality||'none',documented:!!(text(e.source)||text(e.sources)||text(e.note)),conflict:e.contradiction===true};});
  const supported=evidenceRows.filter(e=>['some','strong'].includes(e.quality)&&e.documented).length;
  const conflicts=evidenceRows.filter(e=>e.conflict).length;
  const stronger=sufficient&&coverage.usablePercent===100&&evidenceRows.length>0&&evidenceRows.every(e=>e.quality==='strong'&&e.documented&&!e.conflict);
  const label=!sufficient?'Insufficient evidence':stronger?'Stronger evidence':supported>=Math.ceil(evidenceRows.length/2)&&supported>0&&!conflicts?'Moderate evidence':'Limited evidence';
  const calculated=Date.parse(response.completedAt||result.generatedAt||'');const nowTime=new Date(now).getTime();
  const ageDays=Number.isFinite(calculated)&&Number.isFinite(nowTime)?Math.floor((nowTime-calculated)/86400000):null;
  const display=result.presentation||result.marketing||result;
  const dimensions=(definition.dimensions||[]).map(d=>{
    const existing=(display.dimensions||[]).find(item=>item.id===d.id);
    const counts=completion({dimensions:[d]},response);
    return {id:d.id,title:d.title,score:number(existing?.score)?existing.score:null,status:counts.answered&&counts.usablePercent>=60?'Provisional':'Insufficient evidence',legacyMember:!response.aiAnalysis,coverage:counts,action:d.action||'Review the evidence and agree a proportionate next step.',evidence:d.evidenceNeeded||'Comparable observations and affected people’s perspectives.'};
  });
  // Rank influence on the preserved core formula; do not publish alternative answer recommendations.
  const scoredDimensions=(definition.dimensions||[]).map(d=>({d,items:d.questions.map(q=>({q,...scoreQuestion(q,response.answers?.[q.id])})).filter(x=>x.status==='scored')})).filter(x=>x.items.length);
  const dimensionWeight=scoredDimensions.reduce((sum,x)=>sum+weight(x.d.weight),0);
  const answeredTotal=scoredDimensions.reduce((sum,x)=>sum+x.items.length,0);
  const drivers=scoredDimensions.flatMap(({d,items})=>{
    const total=items.reduce((sum,x)=>sum+weight(x.q.weight),0);
    return items.map(x=>({dimensionId:d.id,dimension:d.title,questionId:x.q.id,influence:definition.id==='marketing-assessment'?Math.abs(x.score-50)/Math.max(1,answeredTotal):Math.abs(x.score-50)*weight(x.q.weight)/total*weight(d.weight)/dimensionWeight,direction:x.score>=50?'strengthened':'limited',text:`This result was ${x.score>=50?'strengthened':'limited'} by reported conditions concerning ${d.title.toLowerCase()}. Check the supporting evidence and context; a different answer is not an improvement by itself.`}));
  }).sort((a,b)=>b.influence-a.influence).slice(0,4);
  const uncertainties=[
    `${coverage.skipped} skipped, ${coverage.uncertain} uncertain, ${coverage.invalid} invalid, and ${coverage.notApplicable} not-applicable responses. Missing information is not zero.`,
    `${supported} of ${evidenceRows.length} applicable dimensions have declared documentary support with a source or note; ${conflicts} have flagged conflicts. Sources have not been verified.`,
    ageDays===null?'Completion date unavailable; recency cannot be assessed.':ageDays<0?'Completion date is in the future; verify the timestamp.':`Completed ${ageDays} days before this review. Recency is descriptive; no universal expiry threshold is assumed.`,
    'Respondent-role sample sizes and independent stakeholder perspectives are not established by the current assessment records.'
  ];
  const signals=[];
  if(number(display.overall)&&display.overall>=(definition.id==='marketing-assessment'?4:75)&&label!=='Stronger evidence')signals.push('Higher reported conditions coexist with incomplete or unverified evidence. Check sources before expanding implementation.');
  if(!sufficient)signals.push('Response coverage is too incomplete for a summary conclusion under the provisional reporting rule.');
  if(conflicts)signals.push('Existing evidence flags identify differing accounts; investigate context rather than assuming either account is wrong.');
  signals.push('Stakeholder perspectives are not established. Ask whose experience is missing before treating this record as shared agreement.');
  for(const pattern of result.patterns||[])signals.push(typeof pattern==='string'?pattern:pattern.label);
  if(response.aiAnalysis&&result.gaps?.length)signals.push('Outcome claims lack sufficient supporting measures or baselines. Productivity or activity does not establish human benefit.');
  const baseline=!!(response.baseline?.locked&&!response.baseline?.skipped&&text(response.baseline?.text));
  return {interpretationVersion:INTERPRETATION_VERSION,evidenceMethod:EVIDENCE_METHOD,
    substantive:{original:result.overall??null,display:display.overall??null,scale:definition.id==='marketing-assessment'&&(result.presentation||result.marketing)?'1–5':response.aiAnalysis?'No overall AI score':'0–100',summary:sufficient?display.overall??null:null},
    coverage,status:!sufficient?'Insufficient evidence':coverage.usablePercent<100?'Partial provisional profile':'Complete response coverage · provisional interpretation',dimensions,
    evidence:{label,method:EVIDENCE_METHOD,documentedDimensions:supported,applicableDimensions:evidenceRows.length,conflicts,humanBaseline:baseline?'Recorded; not independently verified':'Not available / not recorded',ageDays,originalIndex:result.confidence??null,statistical:false},
    drivers,uncertainties,signals:signals.filter(Boolean),
    adoption:{stage:null,explanation:'Insufficient stage-specific evidence. Current questions do not establish awareness, interest, trial, repeated use, workflow integration, delegation, or sustained use as distinct stages. Continued use alone does not establish willingness, trust, satisfaction, or success.'},
    interpretation:sufficient?'This describes the supplied responses under the existing scoring method. Evidence support, completion, and outcomes remain separate.':'Insufficient evidence for a summary conclusion. The original calculated result is retained for audit; gather missing information before interpreting it.',
    next:dimensions.find(d=>d.status==='Insufficient evidence')?.evidence||dimensions.find(d=>d.score!==null)?.action||'Gather comparable observations and discuss unanswered questions with affected people.',
    method:'Provisional reporting rule: a summary needs at least 60% usable applicable responses, reusing the existing investigation convention. This is not a validated cutoff. Stronger: complete responses and every applicable dimension declares strong documentary support with notes/sources and no flagged conflict. Moderate: at least half have some/strong documentary support and no flagged conflict. Otherwise Limited. None of these labels is statistical confidence or external verification. Recency, baseline availability, and stakeholder gaps are disclosed without invented numerical weights.'};
}
function scope(record){return [record.assessmentId,record.context||record.response?.context||'',record.initiative||record.response?.initiative||'',record.tailoringSignature||record.response?.tailoringSignature||''].join('\u0000');}
export function compareResults(previous,current){
  const reasons=[];if(scope(previous)!==scope(current))reasons.push('Different assessment, context, initiative, or organization profile.');
  if(previous.version!==current.version)reasons.push('Assessment versions differ.');
  if(versionOf(previous)===LEGACY_VERSION||versionOf(current)===LEGACY_VERSION)reasons.push('A scoring version was not recorded; historical comparability is unknown.');
  else if(versionOf(previous)!==versionOf(current))reasons.push('Scoring versions differ.');
  const beforeDefinition=previous.response?.definitionSnapshot,afterDefinition=current.response?.definitionSnapshot;
  if(beforeDefinition&&afterDefinition&&JSON.stringify(beforeDefinition.dimensions)!==JSON.stringify(afterDefinition.dimensions))reasons.push('Stored question, scale, or dimension definitions differ.');
  if(!!beforeDefinition!==!!afterDefinition)reasons.push('A definition snapshot is missing; exact question comparability cannot be checked.');
  const a=previous.result.presentation||previous.result.marketing||previous.result,b=current.result.presentation||current.result.marketing||current.result;
  if(!!previous.result.presentation!==!!current.result.presentation)reasons.push('Stored display methods differ.');
  if(!!previous.result.marketing!==!!current.result.marketing)reasons.push('Stored marketing display methods differ.');
  const dimensions=(b.dimensions||[]).map(d=>{const before=(a.dimensions||[]).find(x=>x.id===d.id)?.score;return {id:d.id,title:d.title,previous:before??null,current:d.score,change:!reasons.length&&number(before)&&number(d.score)?rounded(d.score-before):null};});
  const days=(Date.parse(current.createdAt)-Date.parse(previous.createdAt))/86400000;
  return {comparable:!reasons.length,warnings:reasons,previous:a.overall??null,current:b.overall??null,change:!reasons.length&&number(a.overall)&&number(b.overall)?rounded(b.overall-a.overall):null,days:Number.isFinite(days)?rounded(days):null,assessmentVersions:[previous.version,current.version],scoringVersions:[versionOf(previous),versionOf(current)],dimensions,evidenceChange:[previous.reportingSnapshot?.evidence?.label||'Not recorded',current.reportingSnapshot?.evidence?.label||'Not recorded'],limitations:'Repeated administrations are not independent stakeholder samples. A difference does not establish an intervention effect.'};
}
export function historicalChange(current,records){
  const candidates=records.filter(r=>r.id!==current.id&&r.assessmentId===current.assessmentId&&(r.initiative||'')===(current.initiative||'')&&(r.context||'')===(current.context||'')&&Date.parse(r.createdAt)<Date.parse(current.createdAt)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  return candidates.length?compareResults(candidates[0],current):null;
}
export function stakeholderDifferences(){
  return {available:false,groups:[],absoluteDifferences:[],sampleSize:null,missing:['Owners','Leaders','Managers','Employees','Customers','Partners','Individual users'],limitations:'Current records do not establish comparable respondent-role cohorts, independent sample sizes, or common administration periods. Context labels and record counts are not stakeholder samples. No group comparison or average is inferred.'};
}
