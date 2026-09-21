export const escapeHTML = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const format = v => typeof v === 'number' ? (Number.isFinite(v)?v.toLocaleString(undefined,{maximumFractionDigits:4}):'Not defined') : String(v??'Missing');
export function tableHTML(headers, rows) {
  return `<div class="lab-table-wrap" tabindex="0" role="region" aria-label="Scrollable data table"><table><thead><tr>${headers.map(h=>`<th scope="col">${escapeHTML(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(v=>`<td>${escapeHTML(format(v))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
const list = values => `<ul>${(Array.isArray(values)?values:[values]).filter(Boolean).map(v=>`<li>${escapeHTML(v)}</li>`).join('')}</ul>`;
export function teachingHTML(a) {
  const sequence=[['Business Question',a.question],['Method',a.label],['Why This Method Fits',a.why],['Formula',a.formula],['Calculation',a.calculation],['Interpretation',a.interpretation],['Marketing / Managerial Meaning',a.managerial]];
  return `<div class="lab-result-value">${escapeHTML(format(a.result))} <span>${escapeHTML(a.unit||'')}</span></div>${a.details?.length?tableHTML(['Additional result','Value'],a.details.map(d=>[d.label,`${format(d.value)} ${d.unit||''}`])):''}<ol class="lab-learning">${sequence.map(([label,text])=>`<li><h4>${label}</h4><p>${escapeHTML(text||'See the method notes.')}</p></li>`).join('')}<li><h4>Decision Questions</h4>${list(a.questions||['What evidence could change this interpretation?'])}</li></ol><details><summary>How this calculation works · When to use this · Common mistake</summary><p>${escapeHTML(a.why)}</p><p><strong>Assumptions:</strong> ${escapeHTML(Array.isArray(a.assumptions)?a.assumptions.join(' '):a.assumptions)}</p><p><strong>Common mistake:</strong> ${escapeHTML(a.commonMistake)}</p><p><strong>Limitations:</strong> ${escapeHTML(Array.isArray(a.limitations)?a.limitations.join(' '):a.limitations)}</p></details><details><summary>How you could calculate this in Excel</summary><code>${escapeHTML(a.excel||'Use the displayed formula with the corresponding cell references.')}</code></details>`;
}
export const lensQuestions = {
  Adoption:'What encourages or inhibits adoption? Which customer groups might react differently or resist?',
  Trust:'Does the proposed change require trust in a new product, brand, technology, channel, or process? How could it strengthen or damage trust?',
  Agency:'Does the strategy preserve meaningful customer choice and help people make informed decisions?',
  'Perceived risk':'Consider financial, performance, social, privacy, and time or convenience risks.',
  'Customer value':'Does the strategy solve a real customer problem? Are the benefits clear and meaningful?',
  'Organizational readiness':'Do people, processes, technology, and resources support implementation?',
  Sustainability:'Can the strategy be sustained financially, operationally, and in customer relationships? Consider environmental and social effects when relevant.',
  Tradeoffs:'Who benefits? Who may be disadvantaged? What might management gain or give up, and what unintended effects are possible?',
  Resilience:'Would the strategy remain viable if market conditions change?'
};
export function lensHTML(){return Object.entries(lensQuestions).map(([title,q])=>`<details><summary>${title}</summary><p>${q}</p></details>`).join('');}
export function managerialHTML(analyses,datasetName){
  return `<h3>Managerial Interpretation</h3><p><strong>Data:</strong> ${escapeHTML(datasetName||'Manual inputs')}. Only the selected inputs support these results.</p><h4>Calculated results</h4>${list(analyses.map(a=>`${a.name||a.label}: ${format(a.result)} ${a.unit||''}. ${a.interpretation||''}`))}<h4>Interpretation</h4><p>${analyses.length?'Read these findings together, while checking that populations, periods, and definitions are comparable. Differences and trends identify questions; the figures alone do not establish their causes.':'Run a calculation to build an interpretation from available evidence.'}</p><h4>Recommendations to investigate</h4>${list([...new Set(analyses.flatMap(a=>a.questions||[]))].slice(0,6))}<h4>Uncertainty</h4><p>Missing information, data quality, attribution, and competing explanations may change the interpretation. No unavailable business facts are supplied by this tool.</p>`;
}
