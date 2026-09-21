/** Local, evidence-led case worksheets. No network, API, or persistent storage. */
const CONFIDENCE = ['Strong evidence', 'Moderate evidence', 'Limited evidence', 'Assumption requiring validation'];
const ORIGINS = ['User-entered evidence', 'Uploaded data', 'Calculated result', 'Framework-based inference', 'Exploratory suggestion'];
const SWOT_TYPES = ['Strength', 'Weakness', 'Opportunity', 'Threat'];
const textField = (key, label, hint = '') => ({ key, label, type: 'text', hint });
const area = (key, label, hint = '') => ({ key, label, type: 'textarea', hint });
const select = (key, label, options, hint = '') => ({ key, label, type: 'select', options, hint });
const number = (key, label, hint = '') => ({ key, label, type: 'number', hint });
const score = (key, label, hint = '1 = least favorable; 5 = most favorable. Planning judgment, not a measured probability.') => ({ key, label, type: 'number', min: 1, max: 5, step: 1, hint });
const evidenceFields = [area('evidence', 'Evidence'), textField('source', 'Source / dataset / calculation reference'), select('origin', 'Evidence category', ORIGINS), select('confidence', 'Confidence in evidence', CONFIDENCE)];
const swotFields = [area('finding', 'Finding'), select('category', 'SWOT category', SWOT_TYPES), select('scope', 'Internal or external', ['Internal', 'External']), ...evidenceFields, score('importance', 'Importance (1–5)', '1 = least important; 5 = most important.'), score('confidenceScore', 'Confidence planning rating (1–5)', 'A separate user rating for prioritization; it is not a statistical confidence level.'), area('implication', 'Strategic implication')];
const forceGuides = [
  ['Competitive Rivalry', 'How many meaningful competitors exist? Compare product similarity, differentiation, switching, market concentration, fixed costs, category growth, price competition, and advertising intensity.', 'Market shares, competitor prices, customer switching, promotional intensity, number of competitors, category growth.'],
  ['Threat of New Entrants', 'What prevents entry? Consider startup and capital costs, brand loyalty, switching costs, distribution access, regulation, scale, technology, intellectual property, suppliers, and data/network advantages. A large market alone does not establish entry threat.', 'Entry costs, distribution agreements, regulation, capital requirements, loyalty research, technology and supplier access.'],
  ['Bargaining Power of Buyers', 'Consider customer concentration and purchase volume, alternative sellers, price sensitivity, information, differentiation, switching costs, and ability to negotiate.', 'Customer concentration, alternative offers, switching research, price sensitivity, negotiated terms.'],
  ['Bargaining Power of Suppliers', 'Consider supplier concentration, alternative inputs, switching costs, input importance, pricing power, vertical integration, and dependence on specialized technology or materials.', 'Supplier counts, contracts, alternative sources, input costs, switching requirements.'],
  ['Threat of Substitutes', 'What other way solves the customer problem? Compare price, performance, switching costs, technology, and behavior. A competitor may sell another coffee brand; a substitute may be tea or an energy drink.', 'Research on alternative solutions, comparative prices and performance, switching behavior, technology trends.']
];
const forceFields = [select('rating', 'User-reviewed competitive pressure', ['Low', 'Moderate', 'High']), ...evidenceFields, area('implication', 'Strategic implication'), area('research', 'Questions requiring additional research')];
const targetCriteria = ['Segment size', 'Growth potential', 'Profitability', 'Competitive intensity', 'Accessibility', 'Strategic fit', 'Customer need', 'Retention potential', 'Cost to serve', 'Organizational capability'];
const targetFields = [textField('name', 'Segment name'), area('definition', 'Segment definition / observed characteristics', 'Use measured demographics, geography, behavior, frequency, spending, value, preference, channel, satisfaction, loyalty, willingness, trust, risk, needs, or benefits. Do not invent missing characteristics.'), ...evidenceFields, ...targetCriteria.map((label, i) => score(`score${i}`, label, '1–5 attractiveness judgment. For competitive intensity and cost to serve, 5 means low competitive pressure / manageable cost.'))];
const positioningFields = [textField('customer', 'Target customer'), textField('brand', 'Brand / product'), area('problem', 'Customer problem'), area('benefit', 'Primary benefit'), area('difference', 'Point of difference'), area('alternative', 'Competitive alternatives'), area('reason', 'Reasons to believe'), ...evidenceFields, area('challenge', 'Challenge the Positioning', 'Is the difference meaningful, believable, difficult to copy, and supported by evidence? Does the product experience deliver it? Is the benefit important enough to influence purchase?')];
const mixFields = [select('element', 'Marketing mix element', ['Product', 'Price', 'Place', 'Promotion', 'People', 'Process', 'Physical Evidence']), area('current', 'Current approach'), ...evidenceFields, area('problem', 'Problem'), area('opportunity', 'Opportunity'), area('action', 'Recommended action'), textField('kpi', 'KPI / measurement')];
const pestelFields = [select('category', 'PESTEL category', ['Political', 'Economic', 'Social', 'Technological', 'Environmental', 'Legal']), area('finding', 'Trend / event'), ...evidenceFields, area('impact', 'Potential impact'), textField('horizon', 'Time horizon'), area('implication', 'Marketing implication')];
const ansoffFields = [select('option', 'Growth option', ['Market Penetration — existing products / existing markets', 'Market Development — existing products / new markets', 'Product Development — new products / existing markets', 'Diversification — new products / new markets']), area('opportunity', 'Opportunity'), ...evidenceFields, area('risk', 'Risk'), area('investment', 'Required investment'), area('capability', 'Organizational capability'), area('fit', 'Customer fit'), area('return', 'Expected return / assumptions')];
const productFields = [textField('name', 'Product / portfolio role'), area('features', 'Product features', 'A feature describes the product: waterproof material.'), area('benefits', 'Customer benefits', 'A benefit describes value to the customer: protects belongings during bad weather.'), area('quality', 'Quality and differentiation'), textField('brand', 'Brand'), area('packaging', 'Packaging'), area('service', 'Service / support'), select('stage', 'Possible lifecycle stage — interpretation', ['Introduction', 'Growth', 'Maturity', 'Decline', 'Uncertain']), ...evidenceFields, area('lifecycle', 'Lifecycle evidence and alternative explanations', 'Examine sales trends, market growth, competitor entry, pricing pressure, and adoption. Validate the stage; it is not a fixed pathway.'), area('action', 'Action worth testing')];
const benchmarkFields = [textField('name', 'Company / brand'), textField('variable', 'Comparison variable', 'Examples: price, share, growth, features, distribution, awareness, ratings, digital presence, positioning, promotion, service, sustainability.'), textField('value', 'Observed value'), textField('unit', 'Unit / scale and period'), ...evidenceFields];
const mapFields = [textField('name', 'Brand / product'), number('x', 'Horizontal research score'), number('y', 'Vertical research score'), select('basis', 'Basis for these scores', ['Research-based scores', 'Explicit estimates']), ...evidenceFields];
const priorityLabels = ['Strategic importance', 'Urgency', 'Evidence strength', 'Financial impact', 'Customer impact', 'Feasibility of intervention'];
const priorityFields = [area('problem', 'Identified problem'), ...evidenceFields, ...priorityLabels.map((label, i) => score(`score${i}`, label, '1 = low; 5 = high. Higher feasibility means easier intervention.')), area('action', 'Next research or intervention step')];
const decisionCriteria = ['Expected impact', 'Affordability', 'Feasibility', 'Customer value', 'Competitive advantage', 'Financial return', 'Risk manageability', 'Trust', 'Sustainability'];
const decisionFields = [textField('name', 'Strategic alternative'), select('approach', 'Approach, if relevant', ['Maintain current strategy', 'Modify current strategy', 'Aggressive growth strategy', 'Conservative strategy', 'Other']), area('benefit', 'Potential benefit'), area('cost', 'Cost / resources'), area('financial', 'Financial implication'), area('marketing', 'Marketing implication'), area('human', 'CEAM+ implication'), ...evidenceFields, ...decisionCriteria.map((label, i) => score(`score${i}`, label))];
const riskFields = [textField('name', 'Risk / strategy reference'), select('category', 'Risk category', ['Market', 'Financial', 'Competitive', 'Operational', 'Customer', 'Reputation', 'Technology', 'Regulatory']), score('probability', 'Likelihood planning rating (1–5)', '1 = least likely; 5 = most likely. This ordinal judgment is not a calculated probability.'), score('impact', 'Impact planning rating (1–5)', '1 = low impact; 5 = high impact.'), ...evidenceFields, area('mitigation', 'Mitigation / owner / monitoring trigger')];
const recommendationFields = [area('recommendation', 'Strategic recommendation'), area('rationale', 'Business rationale'), ...evidenceFields, textField('swot', 'SWOT connection — factor ID'), textField('force', 'Five Forces connection — force ID'), textField('concept', 'Marketing concept / framework'), area('financial', 'Financial impact and assumptions'), area('outcome', 'Expected outcome'), area('risk', 'Risk / tradeoff'), area('needed', 'Evidence needed'), textField('kpi', 'Key metric'), textField('formula', 'KPI formula / definition'), textField('current', 'Current value'), textField('target', 'Target value'), textField('horizon', 'Time horizon / deadline'), textField('owner', 'Owner'), area('feasibility', 'Achievable and relevant because…'), area('interpretation', 'How success will be interpreted')];
const rootCauseFields = [area('symptom', 'Observed symptom'), ...evidenceFields, ...Array.from({ length: 5 }, (_, i) => area(`why${i}`, `Why ${i + 1}?`, 'State a possible explanation and the evidence needed to test it.')), select('category', 'Possible cause category', ['Customer', 'Product', 'Price', 'Promotion', 'Distribution', 'Competition', 'Process', 'Technology', 'People', 'External environment']), area('problem', 'Possible underlying marketing problem'), area('contradiction', 'What could contradict this explanation?')];
const finalFields = [area('situation', 'Business Situation'), area('findings', 'Most Important Findings'), area('market', 'Market Evidence'), area('customer', 'Customer Insight / Evidence'), area('competition', 'Competitive Insight / Evidence'), area('financial', 'Financial Insight / Feasibility'), area('problem', 'Central Marketing Problem'), area('strategy', 'Recommended Strategy'), area('outcome', 'Expected Outcome'), area('risks', 'Key Risks'), area('kpis', 'KPIs to Monitor'), area('human', 'CEAM+ Human / Adoption Lens'), area('unknown', 'What We Still Need to Know'), area('decision', 'Management Decision', 'What does the available evidence support doing next?'), select('confidence', 'Confidence in Recommendation', ['High', 'Moderate', 'Low']), area('reason', 'Confidence explanation', 'Explain evidence quality, relevant gaps, alternative explanations, and assumptions. Confidence is a judgment, not a statistical probability.'), textField('references', 'Evidence references / record IDs')];
const lensQuestions = [
  ['adoption', 'Adoption', 'What encourages or inhibits adoption? Which customer groups might react differently?'],
  ['trust', 'Trust', 'Could this strategy strengthen or damage trust? What requires verification?'],
  ['agency', 'Agency', 'Does the strategy preserve meaningful choice and help customers make informed decisions?'],
  ['value', 'Value and perceived risk', 'What customer problem is solved? Consider financial, performance, social, privacy, and convenience risks.'],
  ['readiness', 'Organizational readiness', 'Are the people, processes, technology, resources, and execution capability available?'],
  ['sustainability', 'Sustainability', 'Can the strategy be maintained financially, operationally, socially, and environmentally where relevant?'],
  ['tradeoffs', 'Tradeoffs', 'Who benefits or may be disadvantaged? What is gained or given up? Could growth reduce quality or customer experience?'],
  ['resilience', 'Resilience', 'Would the strategy remain viable if market conditions change? What would trigger revision?']
];
const caseFields = [textField('business', 'Business / case name'), area('question', 'Business decision question', 'Describe the problem in your own words. Choose the simplest analysis that adequately answers it.'), textField('marketSize', 'Market size / definition'), textField('marketGrowth', 'Market growth / period'), area('customers', 'Customer / segment information'), area('competitors', 'Competitors'), area('pricing', 'Pricing'), area('sales', 'Sales / purchase data'), area('distribution', 'Distribution'), area('promotion', 'Promotion'), area('research', 'Available research / sources')];
const tools = [
  ['swot', 'SWOT + TOWS', 'What internal and external conditions matter?'],
  ['forces', 'Porter’s Five Forces', 'How difficult is the industry’s competitive environment?'],
  ['stp', 'Segmentation, Targeting & Positioning', 'Which customers should we serve, and how?'],
  ['mix', 'Marketing Mix — 4Ps / 7Ps', 'How should the strategy be executed?'],
  ['pestel', 'PESTEL External Environment', 'What external trends may create opportunities or threats?'],
  ['ansoff', 'Ansoff Growth Analysis', 'Which product and market growth paths deserve investigation?'],
  ['product', 'Product & Lifecycle Analysis', 'What value does the product deliver, and what stage might it be in?'],
  ['benchmark', 'Competitive Benchmarking & Perceptual Map', 'How do comparable brands differ on evidenced dimensions?'],
  ['causes', 'Root Cause / 5 Whys', 'Which underlying problem might explain the symptom?'],
  ['priorities', 'Problem Prioritization', 'Which evidenced problems deserve attention first?'],
  ['decisions', 'Weighted Decision & Risk Matrices', 'How do alternatives compare under explicit judgments?'],
  ['recommendations', 'Strategy → KPIs / SMART Objectives', 'How will we measure whether the decision worked?'],
  ['synthesis', 'Strategic Synthesis & Management Decision', 'What does the available evidence support doing next?']
];
const toolRules = [
  [/compet|rival|substitut|differentiat|position/i, ['forces', 'swot', 'benchmark', 'stp'], 'Competition and differentiation need industry, competitor, and customer evidence.', 'Competitive pricing and market share calculations may also help.'],
  [/acqui|customer|retention|loyal|convert|conversion|funnel|lead/i, ['stp', 'mix', 'recommendations'], 'Customer acquisition and retention questions benefit from explicit segments, execution choices, and outcome measures.', 'Consider funnel, CAC, CLV, and campaign calculations in the quantitative analysis tools.'],
  [/pric|margin|cost|profit|return|budget/i, ['benchmark', 'mix', 'decisions'], 'Pricing and profitability choices need comparable evidence, an execution plan, and financial tradeoffs.', 'Consider margin, break-even, price scenarios, elasticity, CLV:CAC, ROI, and ROMI when their inputs are available.'],
  [/grow|expand|market|new product/i, ['ansoff', 'pestel', 'product'], 'Growth questions benefit from separating product/market choices and checking external conditions.', 'Consider market growth, market share, forecasting, and scenario calculations.'],
  [/declin|fall|drop|problem|why|weak/i, ['causes', 'swot', 'priorities'], 'A symptom can have several underlying causes; test explanations before prioritizing intervention.', 'Compare relevant periods or groups and check data quality before explaining the change.']
];

const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const plain = value => value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
const finite = value => value !== '' && value != null && Number.isFinite(Number(value)) ? Number(value) : null;
const ordinal = value => { const n = finite(value); return n != null && Number.isInteger(n) && n >= 1 && n <= 5 ? n : null; };
const fmt = value => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
function meanScore(record, count) { const values = Array.from({ length: count }, (_, i) => ordinal(record[`score${i}`])); return values.every(v => v != null) ? values.reduce((a, b) => a + b, 0) / count : null; }
function swotPriority(record) { const i = ordinal(record.importance), c = ordinal(record.confidenceScore); return i != null && c != null ? i * c : null; }
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => { if (key === 'class') node.className = value; else if (key === 'onClick') node.addEventListener('click', value); else if (value != null) node.setAttribute(key, value); });
  children.flat().filter(v => v != null).forEach(child => node.append(child instanceof Node ? child : document.createTextNode(String(child))));
  return node;
}
function svgEl(tag, attrs = {}, text = '') { const node = document.createElementNS('http://www.w3.org/2000/svg', tag); Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value)); if (text) node.textContent = text; return node; }
function button(label, action, secondary = false) { return el('button', { type: 'button', class: secondary ? 'strategy-button strategy-secondary' : 'strategy-button', onClick: action }, label); }
function note(text) { return el('p', { class: 'strategy-note' }, text); }
function table(headers, rows, caption = '') {
  const result = el('table', {}, caption ? el('caption', {}, caption) : null, el('thead', {}, el('tr', {}, headers.map(h => el('th', { scope: 'col' }, h)))), el('tbody', {}, rows.map(row => el('tr', {}, row.map((cell, index) => el(index ? 'td' : 'th', index ? {} : { scope: 'row' }, cell ?? 'Not entered'))))));
  return el('div', { class: 'strategy-table-scroll', tabindex: '0', role: 'region', 'aria-label': caption || 'Analysis table' }, result);
}

/** Mount into an otherwise empty element. getContext is read only and may change. */
export function mountStrategy(container, { getContext = () => ({}) } = {}) {
  if (!container || typeof container.replaceChildren !== 'function') throw new TypeError('Case Analysis Mode needs a container element.');
  const prefix = `strategy-${Math.random().toString(36).slice(2, 9)}`;
  let counter = 0;
  const freshRecord = (kind, extras = {}) => ({ id: `${kind}-${++counter}`, origin: 'User-entered evidence', confidence: 'Assumption requiring validation', ...extras });
  const newState = () => ({ case: {}, active: 'swot', swot: [], forces: forceGuides.map(([name]) => freshRecord('force', { name })), targets: [], positioning: {}, mix: [], mixMode: '4Ps', pestel: [], ansoff: [], product: [], benchmarks: [], map: [], mapAxes: {}, causes: [], priorities: [], decisions: [], risks: [], recommendations: [], final: {}, lens: {}, weights: decisionCriteria.map(() => 1), tows: {}, groups: null, accepted: [] });
  let state = newState();
  let root, stage, status, suggestions, refreshOutputs = () => {};
  const context = () => { try { return getContext() || {}; } catch { return {}; } };
  const announce = message => { status.textContent = message; };
  const validRecords = records => records.filter(r => Object.entries(r).some(([key, val]) => !['id', 'origin', 'confidence', 'name'].includes(key) && val !== '' && val != null) || (r.name && !r.id.startsWith('force-')));

  function fieldUI(record, field, onChange = () => refreshOutputs()) {
    const id = `${prefix}-${record.id || 'single'}-${field.key}-${++counter}`;
    let input;
    if (field.type === 'select') {
      input = el('select', { id }, el('option', { value: '' }, 'Choose…'), field.options.map(option => el('option', { value: option }, option)));
      input.value = record[field.key] ?? '';
    } else if (field.type === 'textarea') {
      input = el('textarea', { id, rows: '3', maxlength: '8000' }); input.value = record[field.key] ?? '';
    } else {
      input = el('input', { id, type: field.type, step: field.step ?? 'any', min: field.min, max: field.max, maxlength: field.type === 'text' ? '1000' : null }); input.value = record[field.key] ?? '';
    }
    if (field.hint) input.setAttribute('aria-describedby', `${id}-hint`);
    input.addEventListener('input', () => { record[field.key] = input.value; onChange(field.key); });
    return el('div', { class: field.type === 'textarea' ? 'strategy-field strategy-wide' : 'strategy-field' }, el('label', { for: id }, field.label), input, field.hint ? el('small', { id: `${id}-hint` }, field.hint) : null);
  }
  function fields(record, definitions, onChange) { return el('div', { class: 'strategy-fields' }, definitions.map(field => fieldUI(record, field, onChange))); }
  function recordCard(record, definitions, list, title, extras) {
    const label = el('summary', {}, `${record.id} · ${title}`);
    const detail = el('details', { class: 'strategy-record', open: '' }, label);
    detail.append(fields(record, definitions, () => {
      label.textContent = `${record.id} · ${record.finding || record.name || record.problem || record.recommendation || record.option || record.element || title}`;
      refreshOutputs();
    }));
    if (extras) detail.append(extras(record));
    if (list) detail.append(button('Delete this entry', () => { const index = list.indexOf(record); if (index >= 0) list.splice(index, 1); if (record.analysisReference) state.accepted = state.accepted.filter(id => id !== record.analysisReference); renderActive(); announce(`${record.id} deleted.`); }, true));
    return detail;
  }
  function recordsList(list, definitions, noun, kind, defaults = {}, extras) {
    const box = el('div', { class: 'strategy-record-list' });
    list.forEach(record => box.append(recordCard(record, definitions, list, record.finding || record.name || record.problem || record.recommendation || record.element || record.option || noun, extras)));
    box.append(button(`Add ${noun}`, () => { list.push(freshRecord(kind, defaults)); renderActive(); const records = stage.querySelectorAll('.strategy-record'); records[records.length - 1]?.querySelector('input,textarea,select')?.focus(); }));
    return box;
  }
  function subsection(title, description = '') { const box = el('section', { class: 'strategy-subsection' }, el('h4', {}, title)); if (description) box.append(note(description)); return box; }

  function renderSuggestions() {
    suggestions.replaceChildren();
    const problem = `${state.case.question || ''} ${state.case.business || ''}`;
    const matched = toolRules.filter(([pattern]) => pattern.test(problem));
    if (!matched.length) { suggestions.append(note('Describe your decision question to see relevant-tool suggestions. Every worksheet is optional; use the tool selector below to open any tool.')); return; }
    const seen = new Set();
    matched.forEach(([, ids, why, calculations]) => {
      const available = ids.filter(id => !seen.has(id)); available.forEach(id => seen.add(id));
      suggestions.append(el('p', {}, why), el('div', { class: 'strategy-actions' }, available.map(id => button(`Open ${tools.find(t => t[0] === id)[1]}`, () => { state.active = id; renderActive(); syncSelector(); }, true))), note(calculations));
    });
    suggestions.append(note('Suggestions use words in your question. They indicate potentially useful tools, not findings or required steps. Skip any tool that does not address the decision.'));
  }
  function syncSelector() { const selector = root.querySelector('[data-strategy-selector]'); if (selector) selector.value = state.active; }
  function build() {
    root = el('div', { class: 'strategy-app' });
    status = el('p', { class: 'strategy-status', role: 'status', 'aria-live': 'polite' });
    root.append(el('h2', {}, 'Case Analysis Mode'), el('p', {}, 'Evidence → Framework → Questions → Interpretation → Human judgment. Use the simplest analysis that adequately answers the decision question.'), note('Your entries remain in this page’s current session memory. Reloading or resetting clears them. Export a report to keep your work. These worksheets support your analysis and questions; they do not write an assignment or certify a strategic conclusion.'));
    const caseDetails = el('details', { class: 'strategy-case', open: '' }, el('summary', {}, '1. Business introduction and case information'), fields(state.case, caseFields, renderSuggestions));
    const importLabel = el('label', {}, 'Load case notes (.txt)');
    const fileInput = el('input', { type: 'file', accept: '.txt,text/plain' });
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files?.[0]; if (!file) return;
      if (file.size > 1000000) { announce('Choose a case notes file smaller than 1 MB.'); return; }
      try { const content = await file.text(); state.case.research = `${state.case.research || ''}\nSource: ${file.name}\n${content}`.trim().slice(0, 24000); build(); announce('Case notes loaded locally into Available research. Review and classify them before using them as evidence.'); } catch { announce('The text file could not be read. Paste the case notes into Available research.'); }
    });
    importLabel.append(fileInput); caseDetails.append(importLabel, note('Use the lab’s dataset upload for spreadsheets. This control adds plain-text source notes without inferring facts.'));
    root.append(caseDetails);
    root.append(el('p', { class: 'strategy-hierarchy' }, 'Describe → Diagnose → Explain → Decide → Measure'));
    const recommendationBox = subsection('Recommended Analysis Tools'); suggestions = el('div'); recommendationBox.append(suggestions); root.append(recommendationBox);
    const selectorID = `${prefix}-selector`;
    const selector = el('select', { id: selectorID, 'data-strategy-selector': '' }, el('option', { value: '' }, 'Case information only — skip worksheets'), tools.map(([id, title]) => el('option', { value: id }, title)));
    selector.value = state.active; selector.addEventListener('change', () => { state.active = selector.value; renderActive(); });
    root.append(el('div', { class: 'strategy-select-tool' }, el('label', { for: selectorID }, '2. Choose an optional evidence worksheet'), selector));
    stage = el('div', { class: 'strategy-stage' }); root.append(stage);
    root.append(el('div', { class: 'strategy-actions' }, button('Copy case analysis', copyReport, true), button('Download case report', downloadReport), button('Reset case analysis', () => { state = newState(); build(); announce('Case entries and worksheet judgments cleared. Uploaded datasets and other lab analyses are unchanged.'); }, true)), status);
    container.replaceChildren(root); renderSuggestions(); renderActive();
  }

  function analysesEvidence() {
    const ctx = context(); const list = Array.isArray(ctx.analyses) ? ctx.analyses : [];
    return list.map((analysis, i) => ({ reference: String(analysis.id ?? `analysis-${i + 1}`), title: String(analysis.name ?? analysis.label ?? analysis.metricName ?? analysis.metric?.name ?? analysis.metric ?? `Saved analysis ${i + 1}`), result: `${plain(analysis.result ?? analysis.results ?? analysis.value ?? '')}${analysis.unit ? ` ${analysis.unit}` : ''}`, formula: plain(analysis.formula ?? ''), dataset: String(analysis.datasetName ?? analysis.dataset ?? ctx.datasetName ?? 'Manual analysis') })).filter(a => a.result.trim() !== '' && a.result.trim() !== '%');
  }
  function renderSwot() {
    stage.append(note('Strengths and weaknesses describe internal conditions; opportunities and threats describe external conditions. A favorable metric alone does not establish a strength without an appropriate benchmark.'));
    const candidates = subsection('Data-informed candidates', 'Only saved calculations can appear here. Accepting one creates an exploratory factor requiring your evidence review; no metric is automatically classified as high or low.');
    const refreshCandidates = () => {
      candidates.querySelectorAll('.strategy-candidate,.strategy-candidate-empty').forEach(n => n.remove());
      const evidence = analysesEvidence();
      if (!evidence.length) candidates.append(el('p', { class: 'strategy-candidate-empty' }, 'No saved calculation results are available. Complete and save an analysis in the lab, then refresh candidates.'));
      evidence.forEach(item => {
        const candidate = el('div', { class: 'strategy-candidate' }, el('strong', {}, 'Suggested — requires user validation'), el('p', {}, `${item.title}: ${item.result}`), note(`Calculated result · ${item.dataset} · ${item.reference}`));
        candidate.append(button(state.accepted.includes(item.reference) ? 'Already accepted' : 'Accept as exploratory SWOT factor', () => {
          if (state.accepted.includes(item.reference)) { announce('This calculation is already represented. Edit the existing factor to classify it.'); return; }
          state.swot.push(freshRecord('swot', { finding: `Investigate whether ${item.title} has strategic significance.`, evidence: `${item.title}: ${item.result}${item.formula ? `; formula: ${item.formula}` : ''}`, source: `${item.dataset}; saved calculation ${item.reference}`, origin: 'Calculated result', confidence: 'Assumption requiring validation', validation: 'Suggested — requires user validation', category: '', scope: '', analysisReference: item.reference }));
          state.accepted.push(item.reference); renderActive(); announce('Candidate accepted for review. Choose a SWOT category and scope, document a comparison, and assess evidence confidence.');
        }, true)); candidates.append(candidate);
      });
    };
    candidates.append(button('Refresh saved calculation candidates', refreshCandidates, true)); stage.append(candidates); refreshCandidates();
    const summary = subsection('SWOT matrix', 'Concise findings are shown here; source detail remains in each factor. Importance × confidence (1–5 each) gives a 1–25 planning aid, not a validated statistical score.'); stage.append(summary);
    stage.append(recordsList(state.swot, swotFields, 'SWOT factor', 'swot', {}, record => {
      const review = el('div');
      if (record.validation) review.append(note(record.validation));
      review.append(button('Mark factor reviewed', () => {
        if (!record.finding || !record.category || !record.scope || !record.evidence || !record.source || !record.confidence) { announce('Complete the finding, category, scope, evidence, source, and confidence before recording a review.'); return; }
        record.validation = 'User-reviewed interpretation — evidence and assumptions remain open to challenge.'; renderActive(); announce(`${record.id} review recorded. Human review does not make the finding certain.`);
      }, true)); return review;
    }));
    const tows = subsection('From SWOT to Strategy', 'Questions use your entered factors. Up to two highest-priority factors per category are paired to keep the discussion focused.'); stage.append(tows);
    const challenge = subsection('Challenge This SWOT');
    challenge.append(el('ul', {}, ['Is the factor truly internal or external? What evidence supports it?', 'Could a strength become a weakness, or an opportunity create a threat?', 'Are you confusing a result with its underlying cause?', 'Which entries are observations, interpretations, or assumptions?', 'Which factors matter most, are actionable, or would change with new evidence?'].map(q => el('li', {}, q))), fields(state.tows, [area('challenge', 'Your challenge / evidence to investigate')])); stage.append(challenge);
    refreshOutputs = () => {
      summary.querySelectorAll('.strategy-swot-matrix,.strategy-actions,.strategy-validation').forEach(n => n.remove());
      const priorities = state.swot.map(swotPriority).filter(v => v != null); const highest = priorities.length ? Math.max(...priorities) : null;
      const matrix = el('div', { class: 'strategy-swot-matrix' });
      SWOT_TYPES.forEach(category => {
        const records = state.swot.filter(r => r.category === category && r.finding);
        const box = el('section', {}, el('h5', {}, `${category}${category === 'Opportunity' ? ' — external' : category === 'Threat' ? ' — external' : ' — internal'}`));
        box.append(records.length ? el('ul', {}, records.map(record => el('li', { class: swotPriority(record) === highest && highest != null ? 'strategy-high-priority' : '' }, el('a', { href: `#${prefix}-${record.id}` }, `${record.id}: ${record.finding}`), el('small', {}, `${record.confidence || 'Confidence not entered'} · Priority ${swotPriority(record) ?? 'not rated'}${swotPriority(record) === highest && highest != null ? ' · Highest entered priority' : ''}`)))) : note('No factors entered.')); matrix.append(box);
      }); summary.append(matrix, el('div', { class: 'strategy-actions' }, button('Download SWOT image (SVG)', exportSwot, true)));
      state.swot.forEach(record => {
        const expected = ['Strength', 'Weakness'].includes(record.category) ? 'Internal' : ['Opportunity', 'Threat'].includes(record.category) ? 'External' : '';
        if (expected && record.scope && expected !== record.scope) summary.append(el('p', { class: 'strategy-validation' }, `${record.id}: ${record.category} normally describes an ${expected.toLowerCase()} condition. Reconsider the category or scope.`));
      });
      tows.querySelectorAll('.strategy-tows-questions').forEach(n => n.remove());
      tows.append(el('div', { class: 'strategy-tows-questions' }, towsQuestions().map(([label, questions]) => el('section', {}, el('h5', {}, label), questions.length ? el('ul', {}, questions.map(q => el('li', {}, q))) : note('Add factors in both relevant categories to create grounded discussion questions.')))));
      stage.querySelectorAll('.strategy-record').forEach((recordNode, i) => { if (state.swot[i]) recordNode.id = `${prefix}-${state.swot[i].id}`; });
    };
  }
  function towsQuestions() {
    const top = type => state.swot.filter(r => r.category === type && r.finding).sort((a, b) => (swotPriority(b) ?? -1) - (swotPriority(a) ?? -1)).slice(0, 2);
    return [['SO', 'Strength', 'Opportunity', 'help capture'], ['ST', 'Strength', 'Threat', 'help respond to'], ['WO', 'Weakness', 'Opportunity', 'be addressed by exploring'], ['WT', 'Weakness', 'Threat', 'be reduced while limiting exposure to']].map(([label, left, right, connection]) => [label, top(left).flatMap(a => top(right).map(b => `How might “${a.finding}” (${a.id}) ${connection} “${b.finding}” (${b.id})? What evidence would support that option?`))]);
  }
  function renderForces() {
    stage.append(note('Evaluate the defined industry and competitive pressure. Enter and review each classification yourself; unknown forces remain unrated. No average attractiveness score is calculated.'));
    const diagram = subsection('Industry Competition'); stage.append(diagram);
    state.forces.forEach((record, i) => {
      const guide = forceGuides[i]; const card = recordCard(record, forceFields, null, guide[0]); card.querySelector('summary').after(note(`${guide[1]} Potential evidence: ${guide[2]}`)); stage.append(card);
    });
    const connections = subsection('What does this mean for marketing strategy?'); connections.append(el('ul', {}, ['Segmentation / targeting: are some customer groups less exposed to this pressure?', 'Positioning / product: which evidenced differences, quality, innovation, or services might matter?', 'Price: how much pricing power is supported by switching and alternatives evidence?', 'Place / promotion: could distribution access, awareness, differentiation, or trust affect the response?', 'Customer experience / CRM: could service and retention reduce vulnerability without restricting choice?'].map(q => el('li', {}, q)))); stage.append(connections);
    refreshOutputs = () => {
      diagram.querySelectorAll('.strategy-forces,.strategy-forces-text').forEach(n => n.remove());
      diagram.append(el('div', { class: 'strategy-forces' }, el('div', { class: 'strategy-forces-center' }, 'Industry competition'), state.forces.map((f, i) => el('div', { class: `strategy-force force-${i}` }, el('strong', {}, f.name), el('span', {}, f.rating || 'Not assessed')))), el('ul', { class: 'strategy-forces-text' }, state.forces.map(f => el('li', {}, `${f.id} · ${f.name}: ${f.rating || 'Not assessed'}; ${f.confidence || 'Confidence not entered'}. ${f.implication || 'Strategic implication not yet entered.'}`))));
    };
  }

  function renderSTP() {
    stage.append(note('Target attractiveness planning tool: rate 1–5 only when you can explain your judgment. The displayed mean uses all ten entered ratings equally; it is not an objective scientific measurement.'));
    const groupBox = subsection('Examine available customer groups', 'Choose observed columns. Row count is not automatically a customer count. Distinct customer counts are shown only when an ID column is supplied.');
    const ctx = context(), columns = Array.isArray(ctx.columns) ? ctx.columns.map(c => typeof c === 'string' ? c : c.name ?? c.key).filter(Boolean) : [];
    const groupSettings = state.groupSettings ||= {};
    groupBox.append(fields(groupSettings, [select('group', 'Segment / grouping column', columns), select('value', 'Numeric measure column', columns), select('customer', 'Customer ID column (optional)', columns)], () => {}));
    const output = el('div');
    groupBox.append(button('Compare observed groups', () => {
      if (!groupSettings.group || !groupSettings.value) { announce('Choose a grouping column and a numeric measure.'); return; }
      const current = context(), rows = Array.isArray(current.rows) ? current.rows : []; const cols = Array.isArray(current.columns) ? current.columns.map(c => typeof c === 'string' ? c : c.name ?? c.key) : [];
      if (!cols.includes(groupSettings.group) || !cols.includes(groupSettings.value) || (groupSettings.customer && !cols.includes(groupSettings.customer))) { announce('The dataset columns changed. Reopen this worksheet and choose current columns.'); return; }
      const read = (row, column) => Array.isArray(row) ? row[cols.indexOf(column)] : row[column];
      const groups = new Map(); let skipped = 0;
      rows.forEach(row => {
        const raw = read(row, groupSettings.group); if (raw == null || String(raw).trim() === '') { skipped++; return; }
        const name = String(raw); if (!groups.has(name)) groups.set(name, { name, rows: 0, numeric: 0, sum: 0, ids: new Set() }); const group = groups.get(name); group.rows++;
        const value = finite(typeof read(row, groupSettings.value) === 'string' ? read(row, groupSettings.value).trim().replace(/[$£€,]/g, '') : read(row, groupSettings.value)); if (value != null) { group.numeric++; group.sum += value; }
        if (groupSettings.customer) { const id = read(row, groupSettings.customer); if (id != null && String(id).trim()) group.ids.add(String(id)); }
      });
      state.groups = { dataset: current.datasetName || 'Current dataset', group: groupSettings.group, value: groupSettings.value, customer: groupSettings.customer || '', total: rows.length, skipped, rows: [...groups.values()].map(g => ({ name: g.name, count: g.rows, numeric: g.numeric, sum: g.numeric ? g.sum : null, mean: g.numeric ? g.sum / g.numeric : null, customers: groupSettings.customer ? g.ids.size : null })) };
      drawGroups(output); announce('Observed groups compared. Missing or non-numeric measure cells were excluded from sums and means; valid counts are displayed.');
    }), output); stage.append(groupBox); drawGroups(output);
    stage.append(recordsList(state.targets, targetFields, 'target segment', 'segment'));
    const targetSummary = subsection('Target attractiveness comparison'); stage.append(targetSummary);
    const position = subsection('Positioning Analysis'); const statement = el('p', { class: 'strategy-generated' }); position.append(fields(state.positioning, positioningFields), statement); stage.append(position);
    refreshOutputs = () => { targetSummary.querySelectorAll('.strategy-table-scroll').forEach(n => n.remove()); targetSummary.append(table(['Segment', 'Planning mean / 5', 'Evidence confidence'], state.targets.map(r => [r.name || r.id, meanScore(r, 10) == null ? 'Enter all ten valid ratings' : fmt(meanScore(r, 10)), r.confidence]))); statement.textContent = positioningStatement(); };
  }
  function drawGroups(output) {
    output.replaceChildren(); if (!state.groups) return; const g = state.groups;
    output.append(note(`Saved comparison: ${g.dataset} · ${g.group} / ${g.value}. ${g.skipped} rows had no group. Measures are observations, not inferred segment characteristics.`), table(['Group', 'Rows', '% of all rows', 'Valid measure cells', 'Sum', 'Mean', ...(g.customer ? ['Distinct IDs within group'] : [])], g.rows.map(row => [row.name, row.count, g.total ? `${fmt(100 * row.count / g.total)}%` : 'Unavailable', row.numeric, row.sum == null ? 'Unavailable' : fmt(row.sum), row.mean == null ? 'Unavailable' : fmt(row.mean), ...(g.customer ? [row.customers] : [])]), 'Observed segment comparison'));
  }
  function positioningStatement() { const p = state.positioning; return `User draft: For ${p.customer || '[target customer]'}, ${p.brand || '[brand/product]'} provides ${p.benefit || '[benefit]'} because ${p.reason || '[reason to believe]'}, compared with ${p.alternative || '[alternative]'}. Validate the promised difference: ${p.difference || '[point of difference]'}.`; }

  function renderMix() {
    stage.append(note('4Ps covers Product, Price, Place, and Promotion. For services, 7Ps adds People, Process, and Physical Evidence. Every execution recommendation should connect to evidence and a KPI.'));
    const mode = fieldUI(state, select('mixMode', 'Marketing mix view', ['4Ps', '7Ps']), () => renderActive()); stage.append(mode);
    if (state.mixMode === '4Ps') stage.append(note('Focus on Product, Price, Place, and Promotion. Previously entered service elements remain editable; choose 7Ps to explicitly include the service extension.'));
    stage.append(recordsList(state.mix, mixFields, 'marketing mix element', 'mix'));
    refreshOutputs = () => {};
  }
  function renderPestel() {
    stage.append(note('External trends may create opportunities, threats, or both. Link the same evidenced trend into SWOT when useful; the source reference is retained.'));
    stage.append(recordsList(state.pestel, pestelFields, 'PESTEL factor', 'pestel', {}, record => el('div', { class: 'strategy-actions' }, ['Opportunity', 'Threat'].map(category => button(`Link as SWOT ${category.toLowerCase()}`, () => {
      if (!record.finding?.trim()) { announce('Enter the external trend before linking it.'); return; }
      if (state.swot.some(s => s.pestelReference === record.id && s.category === category)) { announce('This PESTEL factor already has that SWOT link. Edit the existing factor.'); return; }
      state.swot.push(freshRecord('swot', { finding: record.finding, category, scope: 'External', evidence: record.evidence || '', source: `${record.id}${record.source ? `; ${record.source}` : ''}`, origin: record.origin, confidence: record.confidence, implication: record.implication || '', pestelReference: record.id })); announce(`${record.id} linked to SWOT as a user-selected ${category.toLowerCase()}. Review it in SWOT.`);
    }, true)))));
    refreshOutputs = () => {};
  }

  function renderBenchmark() {
    stage.append(note('Compare like-for-like variables, definitions, units, and periods. Competitive position is not reduced to an overall score.'));
    stage.append(recordsList(state.benchmarks, benchmarkFields, 'benchmark observation', 'benchmark'));
    const summary = subsection('Comparison table'); stage.append(summary);
    const map = subsection('Exploratory Perceptual Mapping', 'Supply research-based scores or explicitly label estimates. The map does not invent consumer perceptions. Both axes must describe the same scale for every plotted brand.');
    map.append(fields(state.mapAxes, [textField('x', 'Horizontal dimension / scale'), textField('y', 'Vertical dimension / scale')]), recordsList(state.map, mapFields, 'brand / product point', 'map')); const plot = el('div'); map.append(plot); stage.append(map);
    refreshOutputs = () => {
      summary.querySelectorAll('.strategy-table-scroll,.strategy-benchmark-bars').forEach(n => n.remove());
      summary.append(table(['Company / brand', 'Variable', 'Value', 'Unit / period', 'Source', 'Confidence'], state.benchmarks.map(r => [r.name || r.id, r.variable, r.value, r.unit, r.source, r.confidence])));
      const numericGroups = new Map(); state.benchmarks.forEach(r => { if (!r.variable || !r.unit || finite(r.value) == null) return; const key = `${r.variable} (${r.unit})`; if (!numericGroups.has(key)) numericGroups.set(key, []); numericGroups.get(key).push(r); });
      const bars = el('div', { class: 'strategy-benchmark-bars' }); numericGroups.forEach((rows, label) => { if (rows.length < 2) return; const max = Math.max(...rows.map(r => Math.abs(Number(r.value))), 1); bars.append(el('h5', {}, label), ...rows.map(r => { const bar = el('span', { class: 'strategy-bar', 'aria-hidden': 'true' }); bar.style.width = `${100 * Math.abs(Number(r.value)) / max}%`; return el('div', { class: 'strategy-bar-row' }, `${r.name || r.id}: ${r.value}`, el('div', {}, bar)); })); }); summary.append(bars);
      plot.replaceChildren(); const points = state.map.filter(r => r.name && finite(r.x) != null && finite(r.y) != null && r.basis);
      if (!state.mapAxes.x || !state.mapAxes.y || !points.length) { plot.append(note('Name both dimensions and enter at least one brand with valid scores and an explicit score basis to draw the map.')); return; }
      plot.append(perceptualSVG(points), table(['Brand', state.mapAxes.x, state.mapAxes.y, 'Basis', 'Source'], points.map(p => [p.name, p.x, p.y, p.basis, p.source]), 'Text equivalent of perceptual map'));
    };
  }
  function perceptualSVG(points) {
    const chart = svgEl('svg', { viewBox: '0 0 640 420', role: 'img', 'aria-label': `Exploratory perceptual map: ${state.mapAxes.x} against ${state.mapAxes.y}. A text table follows.` });
    let xmin = Math.min(...points.map(p => Number(p.x))), xmax = Math.max(...points.map(p => Number(p.x))), ymin = Math.min(...points.map(p => Number(p.y))), ymax = Math.max(...points.map(p => Number(p.y)));
    if (xmin === xmax) { xmin--; xmax++; } if (ymin === ymax) { ymin--; ymax++; }
    const x = value => 85 + (value - xmin) / (xmax - xmin) * 475, y = value => 335 - (value - ymin) / (ymax - ymin) * 270;
    chart.append(svgEl('rect', { x: 70, y: 40, width: 510, height: 310, fill: '#fafafa', stroke: '#676a70' }));
    chart.append(svgEl('text', { x: 325, y: 410, 'text-anchor': 'middle', fill: '#34363a', 'font-size': 13 }, state.mapAxes.x), svgEl('text', { x: 18, y: 195, transform: 'rotate(-90 18 195)', 'text-anchor': 'middle', fill: '#34363a', 'font-size': 13 }, state.mapAxes.y));
    [xmin, (xmin + xmax) / 2, xmax].forEach(value => chart.append(svgEl('text', { x: x(value), y: 375, 'text-anchor': 'middle', fill: '#34363a', 'font-size': 12 }, fmt(value))));
    [ymin, (ymin + ymax) / 2, ymax].forEach(value => chart.append(svgEl('text', { x: 62, y: y(value) + 4, 'text-anchor': 'end', fill: '#34363a', 'font-size': 12 }, fmt(value))));
    points.forEach((point, i) => { chart.append(svgEl('circle', { cx: x(Number(point.x)), cy: y(Number(point.y)), r: 6, fill: '#947126', stroke: '#34363a' }), svgEl('text', { x: x(Number(point.x)), y: y(Number(point.y)) - 12, 'text-anchor': 'middle', fill: '#34363a', 'font-size': 12 }, `${i + 1}. ${point.name.slice(0, 30)}`)); }); return chart;
  }

  function renderPriorities() {
    stage.append(note('A structured decision aid, not an objective scientific ranking. All six 1–5 ratings are required; the mean weights them equally. A high score does not prove the diagnosis.'));
    const summary = subsection('Planning priorities'); stage.append(summary, recordsList(state.priorities, priorityFields, 'problem', 'problem'));
    refreshOutputs = () => { summary.querySelectorAll('.strategy-table-scroll').forEach(n => n.remove()); summary.append(table(['Problem', 'Planning mean / 5', 'Evidence confidence'], [...state.priorities].sort((a, b) => (meanScore(b, 6) ?? -1) - (meanScore(a, 6) ?? -1)).map(r => [r.problem || r.id, meanScore(r, 6) == null ? 'Enter six valid ratings' : fmt(meanScore(r, 6)), r.confidence]))); };
  }
  function decisionScore(record) {
    const active = state.weights.map((value, index) => ({ value: finite(value), index })).filter(w => w.value != null && w.value > 0);
    if (!active.length || state.weights.some(w => finite(w) == null || Number(w) < 0)) return null;
    if (active.some(w => ordinal(record[`score${w.index}`]) == null)) return null;
    return active.reduce((sum, w) => sum + ordinal(record[`score${w.index}`]) * w.value, 0) / active.reduce((sum, w) => sum + w.value, 0);
  }
  function renderDecisions() {
    stage.append(note('Decision-support framework: set relative weights, then rate alternatives 1–5, where 5 is favorable. Affordability means manageable cost; risk manageability means less exposure or stronger mitigation. Weights start equally at 1. A zero weight omits that criterion. Rankings depend on these judgments.'));
    const weights = subsection('Criterion weights'); weights.append(el('div', { class: 'strategy-fields' }, decisionCriteria.map((label, i) => fieldUI(state.weights, { ...number(String(i), label), min: 0, max: 1000 })))); stage.append(weights);
    const summary = subsection('Weighted alternatives', 'Formula: Σ(rating × weight) / Σ(weights), using every positive-weight criterion. Missing or invalid ratings leave the alternative unscored.'); stage.append(summary, recordsList(state.decisions, decisionFields, 'strategic alternative', 'alternative'));
    const riskSummary = subsection('Risk matrix', 'Likelihood × impact is a 1–25 ordinal planning indicator. It is not expected financial loss or a statistical probability.'); stage.append(riskSummary, recordsList(state.risks, riskFields, 'risk', 'risk'));
    refreshOutputs = () => {
      summary.querySelectorAll('.strategy-table-scroll').forEach(n => n.remove()); summary.append(table(['Alternative', 'Weighted planning result / 5', 'Evidence confidence'], [...state.decisions].sort((a, b) => (decisionScore(b) ?? -1) - (decisionScore(a) ?? -1)).map(r => [r.name || r.id, decisionScore(r) == null ? 'Complete valid ratings / weights' : fmt(decisionScore(r)), r.confidence])));
      riskSummary.querySelectorAll('.strategy-risk-grid,.strategy-table-scroll').forEach(n => n.remove());
      const matrix = el('div', { class: 'strategy-risk-grid', role: 'img', 'aria-label': 'Risk matrix, impact 1–5 across columns and likelihood 5–1 down rows. Individual risks and scores are in the table below.' });
      matrix.append(el('div', {}, 'L / I'), ...[1, 2, 3, 4, 5].map(n => el('strong', {}, n)));
      for (let p = 5; p >= 1; p--) { matrix.append(el('strong', {}, p)); for (let impact = 1; impact <= 5; impact++) { const risks = state.risks.filter(r => ordinal(r.probability) === p && ordinal(r.impact) === impact); matrix.append(el('div', { class: risks.length ? 'strategy-risk-occupied' : '' }, risks.length ? risks.map(r => r.id).join(', ') : '—')); } }
      riskSummary.append(matrix, table(['Risk', 'Likelihood', 'Impact', 'Planning product', 'Mitigation'], state.risks.map(r => [r.name || r.id, r.probability, r.impact, ordinal(r.probability) != null && ordinal(r.impact) != null ? ordinal(r.probability) * ordinal(r.impact) : 'Not rated', r.mitigation])));
    };
  }

  function renderRecommendations() {
    stage.append(note('Connect each recommendation to evidence, SWOT and Five Forces factor IDs, financial feasibility, and a measurable outcome. A SMART objective is specific, measurable, achievable, relevant, and time-bound.'));
    const refs = el('details', {}, el('summary', {}, 'Available evidence references'), evidenceLedger()); stage.append(refs);
    stage.append(recordsList(state.recommendations, recommendationFields, 'recommendation / KPI', 'recommendation'));
    const objectives = subsection('SMART objective drafts', 'These sentences use your entries. Review the formula, units, achievable target, relevance, and deadline before adopting the objective.'); stage.append(objectives);
    refreshOutputs = () => { objectives.querySelectorAll('.strategy-generated').forEach(n => n.remove()); state.recommendations.forEach(r => objectives.append(el('p', { class: 'strategy-generated' }, `${r.id}: ${smartStatement(r)}`))); };
  }
  function smartStatement(r) { return `${r.owner || '[owner]'} will move ${r.kpi || '[KPI]'} from ${r.current || '[baseline]'} to ${r.target || '[target]'} by ${r.horizon || '[deadline]'} through ${r.recommendation || '[action]'}. Achievable and relevant because: ${r.feasibility || '[evidence / rationale required]'}. Measure with ${r.formula || '[formula / definition]'} using ${r.source || '[data source]'}.`; }
  function researchGaps() {
    const gaps = [];
    if (!state.case.competitors) gaps.push('Competitor information has not been entered. Investigate relevant alternatives, pricing, and switching.');
    if (!state.case.customers) gaps.push('Customer or segment evidence has not been entered.');
    if (!state.case.research) gaps.push('Available research sources have not been described.');
    state.swot.forEach(r => { if (!r.evidence || !r.source) gaps.push(`${r.id}: finding needs evidence and a traceable source.`); if (r.confidence === 'Assumption requiring validation') gaps.push(`${r.id}: assumption still requires validation.`); if (!r.category || !r.scope) gaps.push(`${r.id}: category or internal/external scope is missing.`); });
    state.forces.forEach(r => { if (!r.rating) gaps.push(`${r.name} has not been assessed.`); else if (!r.evidence || !r.source) gaps.push(`${r.id}: ${r.name} rating needs supporting evidence and source.`); if (r.research) gaps.push(`${r.id}: ${r.research}`); });
    state.recommendations.forEach(r => { if (!r.evidence || !r.source) gaps.push(`${r.id}: recommendation needs an evidence link.`); if (!r.kpi || !r.target || !r.horizon) gaps.push(`${r.id}: complete the KPI, target, and time horizon.`); if (r.needed) gaps.push(`${r.id}: ${r.needed}`); });
    return [...new Set(gaps)];
  }
  function evidenceLedger() {
    const rows = [...state.swot, ...state.forces.filter(r => r.rating || r.evidence), ...state.targets, ...state.pestel, ...state.benchmarks].map(r => [r.id, r.finding || r.name || r.variable || 'Evidence entry', r.evidence || 'Not entered', r.source || 'Not entered', r.origin, r.confidence]);
    analysesEvidence().forEach(a => rows.push([a.reference, a.title, a.result, a.dataset, 'Calculated result', 'Review inputs / assumptions']));
    return table(['Reference', 'Finding / measure', 'Evidence', 'Source', 'Category', 'Confidence'], rows, 'Available evidence references');
  }
  function synthesisQuestions() {
    const rated = state.forces.filter(f => f.rating && f.evidence);
    return rated.flatMap(force => state.swot.filter(s => s.finding && s.evidence).slice(0, 3).map(factor => `${force.name} is user-rated ${force.rating.toLowerCase()} (${force.id}), and “${factor.finding}” is entered as a ${factor.category || 'unclassified factor'} (${factor.id}). How might these interact? Compare the sources, confidence, and alternatives before drawing a strategic implication.`)).slice(0, 10);
  }
  function renderSynthesis() {
    const situation = subsection('Situation Signals', 'Only user-entered evidence and saved calculations are summarized. Interpretation and management decisions remain your responsibility.'); situation.append(evidenceLedger()); stage.append(situation);
    const problem = subsection('Potential Marketing Problems / Questions for Consideration'); problem.append(el('p', {}, 'What central strategic problem emerges from the evidence? Distinguish symptoms such as low sales from possible underlying causes such as positioning, awareness, distribution, value, competition, or targeting. Which alternative explanation fits?'));
    const questions = synthesisQuestions(); problem.append(questions.length ? el('ul', {}, questions.map(q => el('li', {}, q))) : note('Enter evidenced SWOT factors and Five Forces ratings to create cross-framework questions.')); stage.append(problem);
    const gaps = subsection('What We Still Need to Know / Recommended Evidence to Investigate'); gaps.append(el('ul', {}, researchGaps().map(gap => el('li', {}, gap)))); stage.append(gaps);
    const challenge = subsection('Challenge the Analysis'); challenge.append(note('What evidence could contradict this interpretation? Are you confusing correlation with causation? Is the target market correctly defined? Which variables are missing? What assumption drives the recommendation? What might competitors do, and which customers might react differently?'));
    challenge.append(fields(state.final, [area('challenge', 'Your challenge / alternative explanation')])); stage.append(challenge);
    const lens = subsection('CEAM+ Decision Lens', 'Use only the questions relevant to the actual decision.'); lens.append(fields(state.lens, lensQuestions.map(([key, label, question]) => area(key, label, question)))); stage.append(lens);
    const final = subsection('Executive Summary / Final CEAM+ Decision Output', 'Write a concise evidence-based decision with source references. These headings organize your reasoning; no automatic conclusion is presented as fact.'); final.append(fields(state.final, finalFields)); stage.append(final);
    refreshOutputs = () => {};
  }

  function renderActive() {
    refreshOutputs = () => {}; stage.replaceChildren();
    if (!state.active) { stage.append(note('Worksheets are skipped. Your existing entries remain available when you reopen a tool and in the case report.')); return; }
    const selected = tools.find(t => t[0] === state.active); if (!selected) return;
    stage.append(el('h3', {}, selected[1]), el('p', { class: 'strategy-managerial-question' }, selected[2]));
    switch (state.active) {
      case 'swot': renderSwot(); break;
      case 'forces': renderForces(); break;
      case 'stp': renderSTP(); break;
      case 'mix': renderMix(); break;
      case 'pestel': renderPestel(); break;
      case 'ansoff': stage.append(note('A discussion framework, not a guaranteed recommendation. Evaluate customer fit, capability, investment, and uncertainty for each path.'), recordsList(state.ansoff, ansoffFields, 'growth option', 'ansoff')); break;
      case 'product': stage.append(recordsList(state.product, productFields, 'product', 'product')); break;
      case 'benchmark': renderBenchmark(); break;
      case 'causes': stage.append(note('5 Whys explores possible causes. Each step needs evidence; repeating “why” does not establish causation.'), recordsList(state.causes, rootCauseFields, 'root-cause inquiry', 'cause')); break;
      case 'priorities': renderPriorities(); break;
      case 'decisions': renderDecisions(); break;
      case 'recommendations': renderRecommendations(); break;
      case 'synthesis': renderSynthesis(); break;
    }
    refreshOutputs();
  }

  function recordReport(record, definitions) {
    const values = definitions.filter(f => record[f.key] != null && record[f.key] !== '').map(f => `<dt>${escapeHTML(f.label)}</dt><dd>${escapeHTML(record[f.key]).replace(/\n/g, '<br>')}</dd>`).join('');
    return values ? `<article><h4>${escapeHTML(record.id || '')}</h4><dl>${values}</dl></article>` : '';
  }
  function getReport() {
    let html = '<section class="case-analysis-report"><h2>CEAM+ Case Analysis</h2><p>Evidence-led, user-entered analysis. Planning ratings are judgments, not validated statistical scores. No AI conclusions or autonomous decisions are generated.</p>';
    html += `<p>Dataset context: ${escapeHTML(context().datasetName || 'Manual case analysis')}</p><h3>Business introduction</h3>${recordReport(state.case, caseFields)}`;
    const reportGroups = [['SWOT', state.swot, swotFields], ['Porter’s Five Forces', validRecords(state.forces), forceFields.map(f => f)], ['Target attractiveness planning tool', state.targets, targetFields], ['Marketing Mix', state.mix, mixFields], ['PESTEL', state.pestel, pestelFields], ['Ansoff Growth Analysis', state.ansoff, ansoffFields], ['Product and Lifecycle', state.product, productFields], ['Competitive Benchmarking', state.benchmarks, benchmarkFields], ['Perceptual Map Inputs', state.map, mapFields], ['Root Cause / 5 Whys', state.causes, rootCauseFields], ['Problem Prioritization', state.priorities, priorityFields], ['Strategic Alternatives', state.decisions, decisionFields], ['Risks', state.risks, riskFields], ['Recommendations and KPIs', state.recommendations, recommendationFields]];
    for (const [title, records, definitions] of reportGroups) { if (records.length) html += `<h3>${escapeHTML(title)}</h3>${records.map(r => `<h4>${escapeHTML(r.name || r.finding || r.element || r.option || '')}</h4>${recordReport(r, definitions)}`).join('')}`; }
    if (state.swot.length) html += `<h3>SWOT planning priorities</h3><ul>${state.swot.map(r => `<li>${escapeHTML(r.id)}: ${escapeHTML(r.finding || 'Unnamed factor')} — importance × confidence = ${swotPriority(r) ?? 'not fully rated'}</li>`).join('')}</ul><h3>From SWOT to Strategy</h3>${towsQuestions().map(([label, questions]) => `<h4>${label}</h4><ul>${questions.map(q => `<li>${escapeHTML(q)}</li>`).join('')}</ul>`).join('')}<p>Challenge This SWOT: ${escapeHTML(state.tows.challenge || 'Not entered')}</p>`;
    if (state.targets.length) html += `<h3>Target attractiveness means (planning aid)</h3><ul>${state.targets.map(r => `<li>${escapeHTML(r.name || r.id)}: ${meanScore(r, 10) == null ? 'Incomplete' : fmt(meanScore(r, 10))} / 5</li>`).join('')}</ul>`;
    if (Object.values(state.positioning).some(Boolean)) html += `<h3>Positioning</h3>${recordReport(state.positioning, positioningFields)}<p>${escapeHTML(positioningStatement())}</p>`;
    if (state.groups) { const g = state.groups; html += `<h3>Observed segment comparison</h3><p>${escapeHTML(g.dataset)}; group: ${escapeHTML(g.group)}; measure: ${escapeHTML(g.value)}; ${g.skipped} ungrouped rows.</p><table><thead><tr><th>Group</th><th>Rows</th><th>Numeric cells</th><th>Sum</th><th>Mean</th>${g.customer ? '<th>Distinct customer IDs</th>' : ''}</tr></thead><tbody>${g.rows.map(r => `<tr><th>${escapeHTML(r.name)}</th><td>${r.count}</td><td>${r.numeric}</td><td>${r.sum == null ? 'Unavailable' : fmt(r.sum)}</td><td>${r.mean == null ? 'Unavailable' : fmt(r.mean)}</td>${g.customer ? `<td>${r.customers}</td>` : ''}</tr>`).join('')}</tbody></table>`; }
    if (state.map.length) html += `<p>Map axes: ${escapeHTML(state.mapAxes.x || 'Not entered')} / ${escapeHTML(state.mapAxes.y || 'Not entered')}. Research scores and explicitly labeled estimates must not be treated as interchangeable.</p>`;
    if (state.priorities.length) html += `<h3>Problem planning means</h3><ul>${state.priorities.map(r => `<li>${escapeHTML(r.problem || r.id)}: ${meanScore(r, 6) == null ? 'Incomplete' : fmt(meanScore(r, 6))} / 5</li>`).join('')}</ul>`;
    if (state.decisions.length) html += `<h3>Weighted decision results</h3><p>Weights: ${decisionCriteria.map((c, i) => `${escapeHTML(c)} = ${escapeHTML(state.weights[i])}`).join('; ')}</p><ul>${state.decisions.map(r => `<li>${escapeHTML(r.name || r.id)}: ${decisionScore(r) == null ? 'Incomplete or invalid ratings/weights' : fmt(decisionScore(r))} / 5</li>`).join('')}</ul><p>Σ(rating × weight) / Σ(weights); 5 is favorable. These are decision-support judgments.</p>`;
    if (state.risks.length) html += `<h3>Risk planning indicators</h3><ul>${state.risks.map(r => `<li>${escapeHTML(r.name || r.id)}: likelihood × impact = ${ordinal(r.probability) != null && ordinal(r.impact) != null ? ordinal(r.probability) * ordinal(r.impact) : 'Incomplete'}</li>`).join('')}</ul>`;
    if (state.recommendations.length) html += `<h3>SMART objective drafts</h3>${state.recommendations.map(r => `<p>${escapeHTML(smartStatement(r))}</p>`).join('')}`;
    html += `<h3>Strategic synthesis questions</h3><ul>${synthesisQuestions().map(q => `<li>${escapeHTML(q)}</li>`).join('')}</ul><h3>What We Still Need to Know</h3><ul>${researchGaps().map(g => `<li>${escapeHTML(g)}</li>`).join('')}</ul><h3>CEAM+ Decision Lens</h3>${recordReport(state.lens, lensQuestions.map(([key, label]) => area(key, label)))}<h3>Executive Summary / Final Management Decision</h3>${recordReport(state.final, [...finalFields, area('challenge', 'Challenge the Analysis')])}`;
    const evidence = analysesEvidence(); if (evidence.length) html += `<h3>Available saved calculations</h3>${evidence.map(a => `<article><h4>${escapeHTML(a.reference)} · ${escapeHTML(a.title)}</h4><p>Calculated result: ${escapeHTML(a.result)}<br>Source: ${escapeHTML(a.dataset)}<br>Formula: ${escapeHTML(a.formula || 'See original analysis')}</p></article>`).join('')}`;
    return `${html}<p>Limitations: interpretations depend on evidence quality and definitions. Correlation does not establish causation. Validate assumptions, consider contrary evidence, and retain human judgment.</p></section>`;
  }
  function download(filename, content, type) { const url = URL.createObjectURL(new Blob([content], { type })); const link = el('a', { href: url, download: filename }); root.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
  function downloadReport() {
    const css = 'body{font:16px/1.55 system-ui,sans-serif;color:#252525;max-width:1000px;margin:32px auto;padding:20px}h2,h3{break-after:avoid}article{break-inside:avoid;border-bottom:1px solid #ddd;padding:12px 0}dt{font-weight:700}dd{margin:0 0 12px;overflow-wrap:anywhere}table{border-collapse:collapse;width:100%}th,td{border:1px solid #bbb;padding:8px;text-align:left}p,li{overflow-wrap:anywhere}@media print{body{margin:0;padding:0;font-size:11pt}}';
    download('ceam-case-analysis.html', `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CEAM+ Case Analysis Report</title><style>${css}</style><body>${getReport()}<p>Use your browser’s Print command to print or save as PDF.</p></body></html>`, 'text/html;charset=utf-8'); announce('Case report downloaded. Open it and use Print → Save as PDF.');
  }
  async function copyReport() {
    try { const parsed = new DOMParser().parseFromString(getReport(), 'text/html'); await navigator.clipboard.writeText(parsed.body.innerText || parsed.body.textContent); announce('Case analysis copied.'); } catch { announce('Clipboard access is unavailable. Download the case report instead.'); }
  }
  function exportSwot() {
    const image = svgEl('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 1000 660', width: 1000, height: 660, role: 'img' }); image.append(svgEl('rect', { width: 1000, height: 660, fill: '#fff' }), svgEl('text', { x: 25, y: 35, 'font-family': 'sans-serif', 'font-size': 22, fill: '#34363a' }, 'CEAM+ SWOT — user-entered findings'));
    SWOT_TYPES.forEach((type, index) => { const x = 20 + index % 2 * 490, y = 60 + Math.floor(index / 2) * 285; image.append(svgEl('rect', { x, y, width: 470, height: 265, fill: '#fafafa', stroke: '#b28a32' }), svgEl('text', { x: x + 16, y: y + 32, 'font-family': 'sans-serif', 'font-size': 19, fill: '#34363a' }, type)); const factors = state.swot.filter(r => r.category === type && r.finding); factors.slice(0, 5).forEach((factor, i) => { const label = `${factor.id}: ${factor.finding}`; image.append(svgEl('text', { x: x + 16, y: y + 67 + i * 35, 'font-family': 'sans-serif', 'font-size': 13, fill: '#34363a' }, label.length > 61 ? `${label.slice(0, 58)}…` : label)); }); if (factors.length > 5) image.append(svgEl('text', { x: x + 16, y: y + 248, 'font-family': 'sans-serif', 'font-size': 12, fill: '#676a70' }, `${factors.length - 5} additional factors in full report`)); });
    image.append(svgEl('text', { x: 25, y: 645, 'font-family': 'sans-serif', 'font-size': 13, fill: '#34363a' }, 'Concise view only. See case report for sources, confidence, assumptions, and strategic implications.'));
    download('ceam-swot.svg', new XMLSerializer().serializeToString(image), 'image/svg+xml;charset=utf-8'); announce('SWOT image downloaded. Detailed evidence remains in the case report.');
  }
  build();
  return { getReport, reset() { state = newState(); build(); } };
}
