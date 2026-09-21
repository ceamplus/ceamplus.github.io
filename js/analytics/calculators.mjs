import {metricDefinitions,calculateMetric} from './metrics.mjs';
import {parseNumber,missing} from './data-quality.mjs';
import {escapeHTML as e,format,teachingHTML,tableHTML} from './interpretations.mjs';
import {drawChart} from './charts.mjs';
export function percentInput(raw,scale,label='Percentage') {
  if (!String(raw).trim().endsWith('%') && !scale) throw Error(`${label}: choose whether an unmarked number is a whole percent (7 = 7%) or a decimal ratio (0.07 = 7%).`);
  const number=parseNumber(raw,scale||'number');if(number==null)throw Error(`Enter a valid ${label.toLowerCase()}.`);return number;
}
const aliases={market:'Market size',growthRate:'Growth rate',purchaseRate:'Purchase rate',revenue:'Revenue',cost:'Cost',cogs:'Cost',marketingCost:'Marketing spend',marketingSpend:'Marketing spend',acquisitionCost:'Marketing spend',newCustomers:'New customers',conversions:'Conversions',leads:'Leads',purchases:'Purchases',customersLost:'Customers lost',customersBeginning:'Customers at beginning',customersEnd:'Customers at end',price:'Price',variableCost:'Variable cost',fixedCosts:'Fixed costs',companySales:'Revenue',marketSales:'Total category sales',companyUnits:'Units sold',marketUnits:'Total category sales',clicks:'Clicks',impressions:'Impressions',clv:'Customer lifetime value',cac:'Customer acquisition cost',budget:'Budget',actual:'Actual spending'};
export function mountCalculators({getContext,saveAnalysis,setError,setStatus}){
 const $=id=>document.getElementById(id);let last=null,scenario=null,quickImage=null;
 const select=$('metric-select');
 select.innerHTML=[...new Set(metricDefinitions.map(d=>d.category))].map(category=>`<optgroup label="${e(category)}">${metricDefinitions.filter(d=>d.category===category).map(d=>`<option value="${d.id}">${e(d.question)} — ${e(d.label)}</option>`).join('')}</optgroup>`).join('');
 function render(){
  last=null;scenario=null;$('scenario-slider').disabled=true;$('metric-result').replaceChildren();$('scenario-result').replaceChildren();
  const def=metricDefinitions.find(d=>d.id===select.value),ctx=getContext();
  $('metric-fit').textContent=def.why;$('mapped-status').textContent='Data-column choices are suggestions. Confirm the definition and aggregation before using them.';
  $('metric-fields').innerHTML=def.fields.map(field=>{
    const suggested=ctx.mapping[aliases[field.key]]||ctx.columns.find(c=>c.toLowerCase().replace(/[^a-z]/g,'')===field.label.toLowerCase().replace(/[^a-z]/g,''))||'';
    return `<div class="lab-field"><label for="value-${field.key}">${e(field.label)}${field.type==='percent'?' (%)':''}</label><input id="value-${field.key}" name="${field.key}" inputmode="decimal" required placeholder="${field.type==='percent'?'e.g. 7%':'Enter a value'}">${field.type==='percent'?`<label>Unmarked percentage format<select id="scale-${field.key}"><option value="">Choose if there is no % sign</option><option value="percent">7 means 7%</option><option value="decimal">0.07 means 7%</option></select></label>`:''}${field.help?`<small>${e(field.help)}</small>`:''}<label>Optional dataset column<select id="column-${field.key}"><option value="">Manual entry</option>${ctx.columns.map(c=>`<option ${c===suggested?'selected':''} value="${e(c)}">${e(c)}${c===suggested?' · suggestion':''}</option>`).join('')}</select></label><label>Aggregate selected column<select id="aggregate-${field.key}"><option value="sum">Sum · additive quantities</option><option value="mean">Mean · unweighted observations</option><option value="first">First nonmissing row</option><option value="last">Last nonmissing row</option><option value="unique">Distinct nonmissing values</option></select></label></div>`;
  }).join('');
  def.fields.forEach(field=>{if(field.type==='percent'||/price|market|costper|clv|cac/i.test(field.key))$('aggregate-'+field.key).value='last';});
  $('scenario-field').innerHTML=def.fields.map(field=>`<option value="${field.key}">${e(field.label)}</option>`).join('');
 }
 function values(){const def=metricDefinitions.find(d=>d.id===select.value);return Object.fromEntries(def.fields.map(field=>{const raw=$('value-'+field.key).value;return [field.key,field.type==='percent'?percentInput(raw,$('scale-'+field.key).value,field.label):parseNumber(raw)];}));}
 $('use-mapped').addEventListener('click',()=>{try{
  const ctx=getContext(),def=metricDefinitions.find(d=>d.id===select.value),notes=[];
  if(!ctx.rows.length)throw Error('Load a dataset first, or enter the values manually.');
  const pending=[];
  for(const field of def.fields){const column=$('column-'+field.key).value;if(!column)continue;const agg=$('aggregate-'+field.key).value,raw=ctx.rows.map(r=>r[column]).filter(v=>!missing(v));
    let nums;if(field.type==='percent'){if(!raw.length)throw Error(`${column} has no values.`);nums=raw.map(v=>percentInput(v,$('scale-'+field.key).value,field.label));}else nums=raw.map(v=>parseNumber(v)).filter(v=>v!=null);
    if(!nums.length&&agg!=='unique')throw Error(`${column} has no numeric values.`);
    if(field.type==='percent'&&agg==='sum')throw Error('Use a defined rate or a justified mean; percentages must not be added across rows.');
    const n=agg==='unique'?new Set(raw.map(String)).size:agg==='first'?nums[0]:agg==='last'?nums.at(-1):nums.reduce((a,b)=>a+b,0)/(agg==='mean'?nums.length:1);
    pending.push({field,n});notes.push(`${field.label}: ${agg} of ${column}; ${nums.length} numeric values, ${ctx.rows.length-nums.length} missing/nonnumeric rows. Verify the periods and scope.`);
  }
  if(!pending.length)throw Error('Choose at least one dataset column.');
  pending.forEach(({field,n})=>{$('value-'+field.key).value=String(n);if(field.type==='percent')$('scale-'+field.key).value='decimal';});
  $('mapped-status').textContent=notes.join(' ');setError('');
 }catch(error){setError(error.message);}});
 $('metric-form').addEventListener('submit',event=>{event.preventDefault();try{const input=values(),a=calculateMetric(select.value,input);last={input,a};$('metric-result').innerHTML=`<article class="lab-result"><h3>${e(a.label)}</h3>${teachingHTML(a)}</article>`;saveAnalysis(a);setError('');setStatus(`${a.label} calculated. Review the explanation and assumptions.`);}catch(error){$('metric-result').replaceChildren();last=null;setError(error.message);}});
 select.addEventListener('change',render);
 $('quick-example').addEventListener('click',()=>{$('quick-market').value='5,000';$('quick-growth').value='7%';$('quick-purchase').value='11%';$('quick-scale').value='percent';});
 $('quick-form').addEventListener('submit',event=>{event.preventDefault();try{
  const market=parseNumber($('quick-market').value),rate=percentInput($('quick-growth').value,$('quick-scale').value,'Growth rate'),purchase=percentInput($('quick-purchase').value,$('quick-scale').value,'Purchased last quarter');
  const growth=calculateMetric('growth',{market,growthRate:rate}),purchasers=calculateMetric('purchasers',{market,purchaseRate:purchase});
  const interpretation=`The defined market contains approximately ${format(market)} potential customers. The assumed ${format(rate*100)}% growth rate ${rate>0?'describes an expanding market':rate<0?'describes a contracting market':'describes no change'} for the next period. Approximately ${format(purchasers.result)} customers, or ${format(purchase*100)}% of that market, purchased during the previous quarter.`;
  $('quick-result').innerHTML=`<article class="lab-result"><h3>Market Growth</h3>${teachingHTML(growth)}</article><article class="lab-result"><h3>Purchasers</h3>${teachingHTML(purchasers)}</article><h3>Plain-Language Interpretation</h3><p>${e(interpretation)}</p><h3>Marketing Meaning</h3><p>Consider whether market growth and purchase penetration leave room for customer acquisition. Nonpurchase alone does not establish unmet demand or explain the gap. Investigate awareness, positioning, pricing, distribution, competition, perceived value, and conversion barriers before choosing a response.</p><h3>Questions to Investigate</h3><ul><li>Why did the remaining defined market not purchase?</li><li>Is awareness sufficient and the value proposition clear?</li><li>Is price limiting adoption?</li><li>Are competitors capturing demand, or is distribution limiting access?</li><li>Is the market definition accurate?</li></ul><div class="lab-quick-canvas"><canvas id="quick-chart" role="img"></canvas></div><p>What this chart suggests: the projected market differs from the current base by the assumed growth amount; purchasers are a subset of the current defined market, not sales market share.</p>`;
  drawChart($('quick-chart'),{rows:[{Measure:'Current market',Count:market},{Measure:'Projected market',Count:market+growth.result},{Measure:'Purchasers',Count:purchasers.result}],x:'Measure',y:'Count',type:'bar',title:'Defined market, projected market and purchasers'});
  quickImage=$('quick-chart').toDataURL('image/png');saveAnalysis(growth);saveAnalysis(purchasers);setError('');setStatus('Growth and purchasers calculated. Review the CEAM+ Decision Lens below.');
 }catch(error){$('quick-result').replaceChildren();quickImage=null;setError(error.message);}});
 function scenarios(){if(!last||last.a.id!==select.value)throw Error('Calculate a base case for the current metric first.');const key=$('scenario-field').value,field=metricDefinitions.find(d=>d.id===select.value).fields.find(f=>f.key===key);const read=id=>field.type==='percent'?percentInput($(id).value,$('scale-'+key).value,field.label):parseNumber($(id).value);const low=read('scenario-low'),high=read('scenario-high');if(low==null||high==null||low>high)throw Error('Enter a valid low assumption no greater than the high assumption.');return {key,field,low,high};}
 function showScenarios(){const {key,field,low,high}=scenario;const points=[['Low',low],['Base',last.input[key]],['High',high]],rows=points.map(([name,v])=>{const a=calculateMetric(select.value,{...last.input,[key]:v});return[name,field.type==='percent'?format(v*100)+'%':v,`${format(a.result)} ${a.unit}`];});const fraction=+$('scenario-slider').value/100,current=low+(high-low)*fraction,result=calculateMetric(select.value,{...last.input,[key]:current});$('scenario-result').innerHTML=tableHTML(['Scenario',field.label,last.a.label],rows)+`<p><strong>Interactive assumption:</strong> ${e(format(field.type==='percent'?current*100:current))}${field.type==='percent'?'%':''} → ${e(format(result.result))} ${e(result.unit)}.</p><p>Only ${e(field.label)} changes; other inputs stay at the base case. Sensitivity reflects this assumed range, not its likelihood.</p>`;}
 $('run-scenario').addEventListener('click',()=>{try{scenario=scenarios();showScenarios();$('scenario-slider').disabled=false;setError('');}catch(error){setError(error.message);}});
 $('scenario-slider').addEventListener('input',()=>{try{showScenarios();}catch(error){setError(error.message);}});
 $('methodology').innerHTML=metricDefinitions.map(d=>`<details><summary>${e(d.label)}</summary><p><strong>Formula:</strong> ${e(d.formula)}</p><p><strong>Required data:</strong> ${e(d.fields.map(f=>f.label).join(', '))}</p><p>${e(d.why)}</p><p><strong>Assumptions:</strong> ${e(d.assumptions)}</p><p><strong>Limitations:</strong> ${e(d.limitations)}</p></details>`).join('');
 render();
 return {refresh:render,choose:id=>{select.value=id;render();},getQuickImage:()=>quickImage,reset:()=>{['quick-market','quick-growth','quick-purchase'].forEach(id=>$(id).value='');$('quick-scale').value='';$('quick-result').replaceChildren();quickImage=null;select.selectedIndex=0;render();}};
}
