import { scoreAssessment } from './scoring.mjs';
import { aiUseDefinition, evidenceClasses } from './ai-analysis-definition.mjs';
const clean=value=>typeof value==='string'?value.trim():'';
export function metricCategory(text){
  const value=clean(text);
  if(/retention|loyalty|brand equity|lifetime|market share|sustained/i.test(value))return 'long-term';
  if(/revenue|profit|cost per|acquisition cost|roi|romi|expenditure|margin/i.test(value))return 'financial';
  if(/purchase|conversion|referral|product usage/i.test(value))return 'behavioral';
  if(/impression|click|minutes?|interaction time|engagement|reach|views?/i.test(value))return 'engagement';
  if(/content|campaigns? launched|pieces|interactions?|generated|produced/i.test(value))return 'activity';
  return 'unknown';
}
export function evidenceConfidence(record={}){
  const sources=[...new Set(clean(record.sources).split('\n').map(s=>s.trim().toLowerCase()).filter(Boolean))];
  if(!sources.length||record.contradiction||!['Observed Evidence','Supported Inference'].includes(record.classification))return 'Low';
  if(record.classification==='Observed Evidence'&&record.objective===true&&record.quality==='strong'&&sources.length>=2&&['behavioral','financial','long-term'].includes(record.metricType))return 'High';
  if(record.quality==='strong'||record.quality==='documented')return 'Moderate';
  return 'Low';
}
export function classifyEvidence(record={}){
  const declared=evidenceClasses.includes(record.classification)?record.classification:'Unknown';
  const traceable=!!clean(record.sources);
  return {classification:(!traceable&&['Observed Evidence','Supported Inference'].includes(declared))?'Unknown':declared,declared,traceable,confidence:evidenceConfidence(record),verification:'User-supplied evidence; not independently verified'};
}
/** Exact text excerpts with line references, never automatic verification or ratings. */
export function organizeCase(text,source='Pasted case'){
  return clean(text).split(/\r?\n/).map((quote,index)=>({quote:quote.trim(),line:index+1})).filter(r=>r.quote).map((row,index)=>{
    const proposed=/\b(could|might|propos|suggest|potential|would|may)\b/i.test(row.quote);
    const negative=/\b(no|not|never|unknown|unmeasured|not measured)\b/i.test(row.quote);
    const type=metricCategory(row.quote);
    const topics=aiUseDefinition.dimensions.filter(d=>({ 'strategic-fit':/objective|goal|problem|strategy|alternative/i,'marketing-value':/marketing|content|personal|segment|target|campaign|price|forecast|research|persona|survey|pattern/i,allocation:/human|judgment|creative|automation|oversight/i,evidence:/measure|evidence|metric|data|source|impression|minute|pieces/i,'consumer-response':/customer|consumer|generation|culture|accessib|trust|loyal/i,ethics:/privacy|bias|consent|ethical|copyright|hallucin|hacking|security|manipul/i,adaptation:/adapt|monitor|sustain|fallback|stop|review/i,'human-necessity':/human|empathy|accountab|meaning|relationship/i}[d.id]).test(row.quote)).map(d=>d.id);
    return {...row,id:`excerpt-${index+1}`,sources:`${source}, line ${row.line}`,classification:proposed?'Proposed Application':'Unknown',suggestedClassification:proposed?'Proposed Application':'Reported statement — review source before classifying',metricType:type,negative,topics};
  });
}
function taskProfile(task){
  let recommendation='Unknown / Evidence Needed';
  if(task.should==='No')recommendation='Human-led with AI support';
  if(task.should==='Partly')recommendation='AI-assisted';
  if(task.allocation==='Human-essential')recommendation='Human-essential';
  else if(task.allocation&&task.allocation!=='Unknown')recommendation=task.allocation;
  const conflict=task.allocation==='AI-led'&&(task.should==='No'||task.can==='No');
  if(conflict)recommendation='Allocation conflict — review required';
  return {...task,conflict,evidence:classifyEvidence(task),recommendation,interpretation:'Provisional allocation supplied or inferred from the necessity review; verify with affected people.',missing:['activity','aiContribution','humanContribution','lost','affected','oversight','failure','accountable'].filter(key=>!clean(task[key]))};
}
function comparison(baseline,findings){
  if(!baseline?.locked||baseline.skipped)return null;
  const human=clean(baseline.text).split(/\n+/).filter(Boolean);
  const tokenSet=text=>new Set(text.toLowerCase().match(/[a-z]{4,}/g)||[]);
  const pairs=[];const usedH=new Set(),usedF=new Set();
  human.forEach((text,i)=>findings.forEach((finding,j)=>{const a=tokenSet(text),b=tokenSet(finding);const overlap=[...a].filter(t=>b.has(t)).length;if(overlap>=3&&overlap/Math.max(1,Math.min(a.size,b.size))>=0.35){pairs.push({human:text,ceam:finding,classification:'Possible shared topic; human review required'});usedH.add(i);usedF.add(j);}}));
  return {baseline:baseline.text,capturedAt:baseline.capturedAt,shared:pairs,humanOnly:human.filter((_,i)=>!usedH.has(i)),ceamOnly:findings.filter((_,i)=>!usedF.has(i)),limitations:'This local comparison matches words and topics, not semantic agreement or factual correctness. Unmatched text is a review candidate, not proof either analysis missed evidence. No winner is assigned.'};
}
export function analyzeAI(response={}){
  const scores=scoreAssessment(aiUseDefinition,response);
  const excerpts=Array.isArray(response.extracted)?response.extracted:[];
  const claims=(response.claims||[]).map(claim=>({...claim,evidence:classifyEvidence(claim),metricType:claim.metricType&&claim.metricType!=='unknown'?claim.metricType:metricCategory(claim.metric)}));
  const tasks=(response.tasks||[]).map(taskProfile);
  const gaps=claims.filter(c=>['activity','engagement','unknown'].includes(c.metricType)||c.evidence.classification==='Unknown').map(c=>({claim:c.claim||'Unnamed benefit claim',observed:clean(c.value)||'No measured value supplied',finding:['activity','engagement'].includes(c.metricType)?`The supplied ${c.metricType} measure does not establish sales, profit, loyalty or lasting relationships.`:'Evidence or outcome measurement is missing.',next:'Specify the claimed outcome, comparable baseline, period and alternative explanations; gather that evidence before concluding value.',evidence:c.evidence}));
  const dimensions=scores.dimensions.map(d=>({...d,score:d.score===null?null:Math.round((1+d.score/25)*10)/10,measurement:aiUseDefinition.dimensions.find(x=>x.id===d.id).measurement,evidence:classifyEvidence(response.evidence?.[d.id]||{}),excerpts:excerpts.filter(x=>x.topics.includes(d.id)),interpretation:d.score===null?'Unknown / Evidence Needed — no practice ratings supplied.':`Self-reported practice rating, with ${d.coverage}% coverage. It does not demonstrate customer or organizational outcomes.`}));
  const risks=(response.risks||[]).map(r=>({...r,evidence:classifyEvidence(r),unowned:!clean(r.owner)}));
  const stress=(response.stress||[]).map(s=>({...s,status:!clean(s.assumption)?'Assumption not specified':!clean(s.fallback)||!clean(s.owner)||!clean(s.trigger)?'Exposed / response incomplete':'Response proposed — test it',evidence:classifyEvidence(s)}));
  const unresolved=[...dimensions.filter(d=>d.score===null).map(d=>`${d.title}: practice evidence not rated.`),...claims.filter(c=>c.evidence.classification==='Unknown').map(c=>`Source or evidence classification missing for: ${c.claim||'benefit claim'}`),...tasks.filter(t=>t.missing.length).map(t=>`${t.activity||'Activity'}: missing ${t.missing.join(', ')}.`),...tasks.filter(t=>t.conflict).map(t=>`${t.activity||'Activity'}: AI-led allocation conflicts with its capability or necessity review.`),...risks.filter(r=>r.unowned).map(r=>`${r.risk||'Ethical risk'}: responsible party not named.`)];
  if(!(response.segments||[]).length)unresolved.push('Customer segment, accessibility and human-interaction preferences have not been investigated.');
  if(!claims.some(c=>c.metricType==='long-term'&&c.evidence.classification==='Observed Evidence'))unresolved.push('No traceable observed long-term outcome has been supplied.');
  const noticed=[];
  if(gaps.length)noticed.push('Benefit claims rely on limited or lower-level metrics; outcome evidence is needed.');
  if(tasks.some(t=>t.missing.includes('accountable')||t.missing.includes('oversight')))noticed.push('Automation is being considered without a complete accountability or oversight record.');
  const get=id=>dimensions.find(d=>d.id===id);
  if(get('marketing-value').score>=4&&(get('evidence').score===null||get('evidence').score<3))noticed.push('High claimed marketing value coexists with weak or missing measurement practices. Test the value claim.');
  if(get('allocation').score>=4&&(get('human-necessity').score===null||get('human-necessity').score<3))noticed.push('Task allocation appears developed, but the value lost by removing human participation remains unresolved.');
  if(risks.some(r=>r.unowned))noticed.push('Some ethical risks have no named responsible party.');
  if(stress.some(s=>s.status==='Exposed / response incomplete'))noticed.push('A named assumption has no complete fallback, trigger or accountable owner.');
  if(!noticed.length)noticed.push('No selected response pattern establishes a problem or success; inspect evidence and unresolved questions.');
  const recommendations=[];
  if(gaps.length)recommendations.push({id:'outcomes',action:'Test one benefit claim using an outcome measure and a comparison baseline, not interaction volume alone.',metric:'Incremental conversion or contribution, with retention/loyalty followed over a relevant period',revise:'Comparable outcome evidence supports or contradicts the claimed value.'});
  if(tasks.some(t=>t.missing.length||t.conflict)||!tasks.length)recommendations.push({id:'human',action:'Run the Human Necessity review on the highest-consequence activity with affected staff and customers.',metric:'Error recovery, override use, customer trust and accountable review completion',revise:'Task trials show which human contributions improve outcomes and which do not.'});
  if(risks.some(r=>r.unowned)||!risks.length)recommendations.push({id:'owners',action:'Assign an accountable owner and test a safeguard for the most consequential ethical risk.',metric:'Safeguard test result and time to detect, challenge and remedy an error',revise:'Observed safeguards and stakeholder outcomes reduce or increase the risk.'});
  if(stress.some(s=>s.status==='Exposed / response incomplete'))recommendations.push({id:'stress',action:'Exercise a fallback for a named assumption failure before scaling use.',metric:'Recovery time, cost and service quality under the selected scenario',revise:'The fallback maintains acceptable customer outcomes in a controlled exercise.'});
  if(!recommendations.length)recommendations.push({id:'sustain',action:'Recheck the strongest value claim after the next customer cycle using comparable evidence.',metric:'Persistence of customer benefit, operating cost and adverse outcomes',revise:'Benefits diminish, expectations change, or new stakeholder evidence challenges the interpretation.'});
  const supported=claims.filter(c=>c.evidence.classification==='Observed Evidence'&&clean(c.metric)&&clean(c.value)).map(c=>({finding:`Reported ${c.metricType} measure: ${c.metric} — ${c.value}`,evidence:c.evidence,limit:`Evidence category: ${c.metricType}. Do not generalize beyond this outcome.`}));
  const findings=[...noticed,...gaps.map(g=>g.finding),...unresolved,...recommendations.map(r=>r.action)];
  return {...scores,overall:null,band:'Multidimensional profile — no overall AI score',dimensions,claims,tasks,risks,gaps,stress,unresolved,noticed,recommendations,supported,excerpts,journey:(response.journey||[]).map(j=>({...j,evidence:classifyEvidence(j)})),segments:(response.segments||[]).map(s=>({...s,evidence:classifyEvidence(s)})),mix:(response.mix||[]).map(m=>({...m,evidence:classifyEvidence(m)})),confidence:claims.length&&claims.every(c=>c.evidence.confidence==='High')?'High':claims.some(c=>['High','Moderate'].includes(c.evidence.confidence))?'Moderate':'Low',comparison:comparison(response.baseline,findings),method:'Local structured rules; no AI model or external verification. Inferences are exploratory and revisable. Confidence is categorical evidence support, not a probability or validated scale.',generatedAt:new Date().toISOString()};
}
