import { parseFile, cancelParsing } from './parser.mjs';
import { inspectData, suggestMappings, roles, parseNumber, missing } from './data-quality.mjs';
import { samples } from './samples.mjs';
import { drawChart } from './charts.mjs';
import { descriptiveStats, percentile, confidenceInterval, correlation, regression, oneSampleT, twoSampleT, pairedT, forecast } from './statistics.mjs';
import { mountCalculators } from './calculators.mjs';
import { mountStrategy } from './strategy.mjs';
import { escapeHTML, format, tableHTML, teachingHTML, managerialHTML, lensHTML } from './interpretations.mjs';
import { csvReport, download, printReport } from './export.mjs';
import { applyAssessmentLink, mountMarketingAssessmentContext } from './assessment-links.mjs';

const $ = (id) => document.getElementById(id);
const html = escapeHTML;
const state = {
  datasetName: '', file: null, sheetNames: [], sheetName: '', rows: [], columns: [], mapping: {}, quality: null,
  analyses: [], chart: null, mode: 'data', sequence: 0, strategy: null, calculators: null,
};

function setStatus(message) { $('lab-status').textContent = message || ''; }
function setError(message) { const node = $('lab-error'); node.textContent = message || ''; node.hidden = !message; }
function context() { return { datasetName: state.datasetName, columns: state.columns, rows: state.rows, mapping: state.mapping, analyses: state.analyses }; }
function labelForColumn(column) { return column ? `“${column}”` : 'the selected column'; }

function showMode(mode) {
  state.mode = mode;
  document.querySelectorAll('[data-mode-panel]').forEach(panel => { panel.hidden = panel.dataset.modePanel !== mode; });
  document.querySelectorAll('.lab-mode-switch [data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
  setError('');
  if (mode === 'calculator') state.calculators?.refresh?.();
}

function populateSelect(select, columns, { blank = 'Choose a column', selected = '', includeCount = false } = {}) {
  if (!select) return;
  const options = [`<option value="">${html(blank)}</option>`].concat(columns.map(column => `<option value="${html(column)}"${column === selected ? ' selected' : ''}>${html(column)}${includeCount ? ` · ${state.quality?.columns.find(item => item.name === column)?.type || 'unknown'}` : ''}</option>`));
  select.innerHTML = options.join('');
}

function renderPreview() {
  const rows = state.rows.slice(0, 8).map(row => state.columns.map(column => row[column]));
  $('preview-caption').textContent = `${state.rows.length.toLocaleString()} data row${state.rows.length === 1 ? '' : 's'} · ${state.columns.length} column${state.columns.length === 1 ? '' : 's'} · preview shows the first ${rows.length} nonblank row${rows.length === 1 ? '' : 's'}.`;
  $('data-preview').innerHTML = rows.length ? tableHTML(state.columns, rows) : '<p>No nonblank rows are available.</p>';
}

function renderQuality() {
  state.quality = inspectData(state.rows, state.columns);
  const empty = state.quality.columns.filter(column => column.type === 'Unknown').length;
  $('quality-summary').textContent = `${state.quality.duplicates.toLocaleString()} potential duplicate row${state.quality.duplicates === 1 ? '' : 's'} detected. ${empty ? `${empty} empty or unknown column${empty === 1 ? '' : 's'}.` : 'Every column has at least one nonblank value.'} Review the notes as prompts for investigation; they are not proof that the source contains errors.`;
  $('data-quality').innerHTML = tableHTML(['Column', 'Detected type', 'Missing', 'Unique', 'Numeric values', 'Possible outliers', 'Notes'], state.quality.columns.map(column => [column.name, column.type, column.missing, column.unique, column.numeric, column.outliers || 0, column.notes.join(' ') || 'No additional note.']));
}

function renderMapping() {
  const suggestions = suggestMappings(state.columns);
  const ordered = [...roles].sort((a, b) => {
    const common = ['Date', 'Quarter', 'Year', 'Customer ID', 'Segment', 'Product', 'Region', 'Channel', 'Campaign', 'Market size', 'Growth rate', 'Purchase rate', 'Revenue', 'Cost', 'Marketing spend', 'Leads', 'Visitors', 'Conversions', 'New customers', 'Returning customers', 'Customers lost', 'Purchases', 'Profit'];
    return (common.indexOf(a) < 0 ? 999 : common.indexOf(a)) - (common.indexOf(b) < 0 ? 999 : common.indexOf(b));
  });
  $('variable-mapping').innerHTML = ordered.map(role => {
    const current = state.mapping[role] || suggestions[role] || '';
    return `<div class="lab-field"><label for="mapping-${html(role)}">${html(role)}</label><select id="mapping-${html(role)}" data-mapping-role="${html(role)}"><option value="">Not mapped</option>${state.columns.map(column => `<option value="${html(column)}"${column === current ? ' selected' : ''}>${html(column)}${column === suggestions[role] && suggestions[role] ? ' · suggestion' : ''}</option>`).join('')}</select><small>${suggestions[role] ? `Suggested match: ${html(suggestions[role])}. Review its definition and period.` : 'No exact column-name match. Choose a column only when its meaning fits.'}</small></div>`;
  }).join('');
  state.columns.forEach(column => { if (!state.mapping[column]) state.mapping[column] = column; });
  $('variable-mapping').querySelectorAll('[data-mapping-role]').forEach(select => select.addEventListener('change', () => { state.mapping[select.dataset.mappingRole] = select.value; renderOperations(); }));
}

function renderDatasetControls() {
  const selects = [$('chart-x'), $('chart-y'), $('chart-group'), $('stat-a'), $('stat-b')];
  selects.forEach(select => populateSelect(select, state.columns, { includeCount: true }));
  const numeric = state.quality?.columns.filter(column => ['Numeric', 'Percentage', 'Currency'].includes(column.type)).map(column => column.name) || [];
  if (numeric.length) {
    ['chart-y', 'stat-a'].forEach(id => populateSelect($(id), state.columns, { selected: numeric[0], includeCount: true }));
    if (numeric[1]) populateSelect($('stat-b'), state.columns, { selected: numeric[1], includeCount: true });
  }
  const dateLike = state.quality?.columns.find(column => ['Date/time'].includes(column.type))?.name || state.columns.find(column => /date|quarter|year|month|period/i.test(column));
  const groupLike = state.columns.find(column => /segment|product|region|channel|campaign|category|type/i.test(column));
  if (dateLike) populateSelect($('chart-x'), state.columns, { selected: dateLike, includeCount: true });
  else if (groupLike) populateSelect($('chart-x'), state.columns, { selected: groupLike, includeCount: true });
  if (groupLike) populateSelect($('chart-group'), state.columns, { selected: groupLike, includeCount: true });
  $('chart-recommendation').textContent = dateLike && numeric.length ? `A line chart may fit ${labelForColumn(dateLike)} with ${labelForColumn(numeric[0])}; compare it with a bar chart when categories are not ordered periods.` : groupLike && numeric.length ? `A bar chart may fit ${labelForColumn(groupLike)} with ${labelForColumn(numeric[0])}. Choose a line chart only when X is an ordered time period.` : 'Choose an X or grouping variable and a numeric Y variable. The recommendation is a starting point, not an automatic choice.';
}

function renderDataset() {
  const hasData = Boolean(state.columns.length);
  $('dataset-summary').hidden = !hasData;
  $('dataset-panels').hidden = !hasData;
  if (!hasData) { $('data-preview').replaceChildren(); $('data-quality').replaceChildren(); $('variable-mapping').replaceChildren(); $('operations-root').replaceChildren(); return; }
  $('dataset-name').textContent = `${state.datasetName || 'Untitled dataset'} · ${state.rows.length.toLocaleString()} rows × ${state.columns.length} columns`;
  $('dataset-notes').textContent = state.sheetName && state.sheetNames.length > 1 ? `Selected sheet: ${state.sheetName}. ${state.file ? `${(state.file.size / 1024 / 1024).toFixed(2)} MB source file.` : ''}` : state.file ? `${(state.file.size / 1024 / 1024).toFixed(2)} MB source file.` : 'This is an in-memory demonstration dataset.';
  const sheetControl = $('sheet-control');
  if (state.sheetNames.length > 1 && state.file) { sheetControl.hidden = false; $('sheet-select').innerHTML = state.sheetNames.map(name => `<option value="${html(name)}"${name === state.sheetName ? ' selected' : ''}>${html(name)}</option>`).join(''); }
  else sheetControl.hidden = true;
  renderPreview(); renderQuality(); renderMapping(); renderDatasetControls(); renderOperations();
  state.calculators?.refresh?.();
}

async function useFile(file, sheet) {
  try {
    setError(''); setStatus(`Reading ${file.name} locally…`); state.file = file;
    const result = await parseFile(file, sheet);
    if (result.sheetNames?.length > 1 && !sheet) state.sheetNames = result.sheetNames;
    else if (result.sheetNames?.length) state.sheetNames = result.sheetNames;
    state.sheetName = result.sheet?.name || result.sheetNames?.[0] || '';
    state.datasetName = file.name;
    state.rows = result.sheet.rows; state.columns = result.sheet.columns;
    state.mapping = {}; renderDataset(); setStatus(`${file.name} is ready. Review the preview and mapping before calculating.`);
  } catch (error) { setError(error.message); setStatus('The file was not loaded.'); }
}

function useSample(key) {
  const sample = samples[key];
  const columns = [...new Set(sample.rows.flatMap(row => Object.keys(row)))];
  state.file = null; state.sheetNames = []; state.sheetName = ''; state.datasetName = sample.name; state.rows = sample.rows.map(row => Object.fromEntries(columns.map(column => [column, row[column] ?? null]))); state.columns = columns; state.mapping = {};
  renderDataset(); setStatus(`${sample.name} loaded. It is fictional demonstration data for testing the local workflow.`); setError('');
}

function valuesForColumn(column, { allowMissing = false } = {}) {
  if (!column) throw Error('Choose a column first.');
  const values = [], omissions = [];
  state.rows.forEach((row, index) => { const value = parseNumber(row[column]); if (value == null) omissions.push(index + 1); else values.push(value); });
  if (!values.length) throw Error(`${labelForColumn(column)} has no numeric values.`);
  if (omissions.length && !allowMissing) throw Error(`${labelForColumn(column)} has ${omissions.length} missing or nonnumeric row${omissions.length === 1 ? '' : 's'}. Resolve those values or use a complete-case analysis explicitly.`);
  return { values, omissions };
}

function pairedValues(first, second) {
  if (!first || !second) throw Error('Choose both variables.');
  const a = [], b = [], omitted = [];
  state.rows.forEach((row, index) => { const x = parseNumber(row[first]), y = parseNumber(row[second]); if (x == null || y == null) omitted.push(index + 1); else { a.push(x); b.push(y); } });
  if (!a.length) throw Error(`No complete numeric pairs are available for ${labelForColumn(first)} and ${labelForColumn(second)}.`);
  return { a, b, omitted };
}

function renderOperations() {
  const mapped = role => state.mapping[role] && state.columns.includes(state.mapping[role]) ? state.mapping[role] : '';
  const group = ['Segment', 'Product', 'Region', 'Channel', 'Campaign', 'Customer type'].map(mapped).find(Boolean);
  const measure = ['Revenue', 'Profit', 'Marketing spend', 'Cost', 'Units sold', 'Conversions'].map(mapped).find(Boolean);
  const customerId = mapped('Customer ID'), date = mapped('Date') || mapped('Acquisition date'), revenue = mapped('Revenue');
  let out = '<div class="lab-operation-cards">';
  if (group && measure) out += `<details class="lab-details" open><summary>Observed group comparison · ${html(group)} / ${html(measure)}</summary><div id="group-output"></div><button type="button" class="button secondary" id="compare-groups">Compare groups</button></details>`;
  if (['Impressions', 'Clicks', 'Leads', 'Conversions', 'New customers'].map(mapped).filter(Boolean).length >= 2) out += `<details class="lab-details"><summary>Campaign and funnel analysis</summary><p>Stage rates are calculated only when their numerator and denominator are present. A drop-off identifies a question, not its cause.</p><div id="funnel-output"></div></details>`;
  if (customerId && date && revenue) out += `<details class="lab-details"><summary>RFM and cohort starting point</summary><p>RFM labels below are planning categories from this dataset. They do not invent customer motivations or replace research.</p><div id="rfm-output"></div></details>`;
  const financial = ['Revenue', 'Profit', 'Marketing spend', 'Customer acquisition cost', 'Customer lifetime value', 'Margin', 'Budget', 'Actual spending'].map(role => [role, mapped(role)]).filter(([, column]) => column);
  if (financial.length) out += `<details class="lab-details"><summary>Financial dashboard · mapped measures</summary>${tableHTML(['Measure', 'Column', 'Total / available values'], financial.map(([role, column]) => [role, column, summarizeColumn(column)]))}</details>`;
  if (out === '<div class="lab-operation-cards">') out += '<p>Map a Segment, Product, Region, Channel, Campaign, customer ID, date, or financial column to unlock focused comparisons. Every available measure remains usable through the business-question selector.</p>';
  out += '</div>'; $('operations-root').innerHTML = out;
  $('compare-groups')?.addEventListener('click', () => renderGroupOutput(group, measure));
  if ($('funnel-output')) renderFunnelOutput(mapped);
  if ($('rfm-output')) renderRfmOutput(customerId, date, revenue);
}

function summarizeColumn(column) {
  const numbers = state.rows.map(row => parseNumber(row[column])).filter(value => value != null);
  return numbers.length ? `${numbers.length} numeric values · ${format(numbers.reduce((a, b) => a + b, 0))} sum · ${format(numbers.reduce((a, b) => a + b, 0) / numbers.length)} mean` : 'No numeric values';
}

function renderGroupOutput(group, measure) {
  const groups = new Map(); let omitted = 0;
  state.rows.forEach(row => { const key = missing(row[group]) ? '' : String(row[group]); const value = parseNumber(row[measure]); if (!key || value == null) { omitted++; return; } const entry = groups.get(key) || { count: 0, sum: 0 }; entry.count++; entry.sum += value; groups.set(key, entry); });
  const rows = [...groups.entries()].sort((a, b) => b[1].sum - a[1].sum).map(([name, value]) => [name, value.count, value.sum, value.sum / value.count]);
  $('group-output').innerHTML = `${tableHTML(['Group', 'Valid rows', `Sum of ${measure}`, `Mean of ${measure}`], rows, 'Observed group comparison')}<p class="lab-unit-note">${omitted} row${omitted === 1 ? '' : 's'} omitted for missing group or nonnumeric measure. Rows are observations; distinct customers are counted only when an ID role is mapped.</p>`;
}

function renderFunnelOutput(mapped) {
  const stages = [['Impressions', mapped('Impressions')], ['Clicks', mapped('Clicks')], ['Leads', mapped('Leads')], ['Conversions', mapped('Conversions')], ['New customers', mapped('New customers')]].filter(([, column]) => column);
  const totals = stages.map(([label, column]) => { const values = state.rows.map(row => parseNumber(row[column])).filter(value => value != null); return [label, column, values.reduce((a, b) => a + b, 0), values.length]; });
  const rates = totals.slice(1).map((row, index) => { const prior = totals[index]; return [row[0], `${format(row[2])} / ${format(prior[2])} = ${format(row[2] / prior[2] * 100)}%`, row[3]]; });
  $('funnel-output').innerHTML = tableHTML(['Stage', 'Column', 'Total', 'Numeric rows'], totals) + (rates.length ? `<h4>Stage conversion</h4>${tableHTML(['Stage', 'Rate', 'Rows'], rates)}` : '') + '<p class="lab-unit-note">A funnel drop-off shows where to ask about messaging, value, price, trust, process, or access. It does not identify a cause by itself.</p>';
}

function renderRfmOutput(customerId, date, revenue) {
  const now = Date.now(); const customers = new Map();
  state.rows.forEach(row => { const id = missing(row[customerId]) ? '' : String(row[customerId]); const value = parseNumber(row[revenue]); const when = Date.parse(row[date]); if (!id || value == null || !Number.isFinite(when)) return; const item = customers.get(id) || { last: when, frequency: 0, monetary: 0 }; item.last = Math.max(item.last, when); item.frequency++; item.monetary += value; customers.set(id, item); });
  const rows = [...customers.entries()].map(([id, item]) => [id, Math.max(0, Math.round((now - item.last) / 86400000)), item.frequency, item.monetary]).sort((a, b) => a[1] - b[1] || b[3] - a[3]).slice(0, 20);
  $('rfm-output').innerHTML = rows.length ? tableHTML(['Customer ID', 'Recency (days)', 'Frequency', 'Monetary value'], rows, 'Exploratory RFM observations') + '<p class="lab-unit-note">Recency uses today’s browser date; frequency counts rows, not necessarily distinct purchases. Validate transaction definitions before labeling customers as loyal or at risk.</p>' : '<p>No complete customer ID, parseable date, and numeric revenue triplets were found.</p>';
}

function renderMetricResult(result, title = result.label) {
  $('metric-result').innerHTML = `<article class="lab-result"><h3>${html(title)}</h3>${teachingHTML(result)}</article>`;
  renderManagerial();
}

function renderManagerial() { $('managerial-interpretation').innerHTML = managerialHTML(state.analyses, state.datasetName); $('ceam-lens').innerHTML = lensHTML(); renderHistory(); }

function saveAnalysis(result, extra = {}) {
  const record = { ...result, ...extra, reference: `A${++state.sequence}`, title: result.label || result.title || 'Analysis', name: result.label || result.title || 'Analysis', dataset: state.datasetName || 'Manual inputs', datasetName: state.datasetName || 'Manual inputs', createdAt: new Date().toISOString() };
  state.analyses = [...state.analyses, record].slice(-20); renderManagerial();
}

function renderHistory() {
  const target = $('analysis-history');
  if (!state.analyses.length) { target.innerHTML = '<p>No calculations or charts retained in this tab.</p>'; return; }
  target.innerHTML = state.analyses.slice().reverse().map((item, reverseIndex) => `<div class="lab-history-item"><p><strong>${html(item.reference)} · ${html(item.title || item.label)}</strong><br>${html(item.datasetName || item.dataset)} · ${new Date(item.createdAt).toLocaleString()}${item.result !== '' && item.result != null ? `<br>Result: ${html(format(item.result))} ${html(item.unit || '')}` : ''}${item.chartType ? `<br>Chart: ${html(item.chartType)}` : ''}</p><button type="button" class="lab-small-button" data-delete-analysis="${state.analyses.length - 1 - reverseIndex}">Delete</button></div>`).join('');
  target.querySelectorAll('[data-delete-analysis]').forEach(button => button.addEventListener('click', () => { state.analyses.splice(Number(button.dataset.deleteAnalysis), 1); renderManagerial(); setStatus('Analysis removed from this browser tab.'); }));
}

function currentChartImage() { return state.chart?.canvas?.toDataURL?.('image/png') || null; }

function reportHTML() {
  const calculations = state.analyses.filter(item => !item.chartType).map(item => `<article><h3>${html(item.title || item.label)}</h3><p><strong>Result:</strong> ${html(format(item.result))} ${html(item.unit || '')}</p><p><strong>Formula:</strong> ${html(item.formula || '')}</p><p><strong>Calculation:</strong> ${html(item.calculation || '')}</p><p><strong>Interpretation:</strong> ${html(item.interpretation || '')}</p><p><strong>Managerial meaning:</strong> ${html(item.managerial || '')}</p><p><strong>Assumptions:</strong> ${html(item.assumptions || '')}</p><p><strong>Limitations:</strong> ${html(item.limitations || '')}</p></article>`).join('');
  const image = currentChartImage() || state.calculators?.getQuickImage?.();
  const chart = image ? `<h2>Visualization</h2><img src="${image}" alt="Chart exported from the CEAM+ Marketing Analytics Lab"><p>${html(state.chart?.summary || 'The chart is a visual aid; see the underlying table and summary for its meaning.')}</p>` : '';
  const strategy = state.strategy?.getReport?.() || '';
  return `<article><h1>CEAM+ Marketing Analytics Lab Report</h1><p><strong>Dataset:</strong> ${html(state.datasetName || 'Manual inputs')}<br><strong>Generated:</strong> ${html(new Date().toLocaleString())}</p><p>Data, calculations, interpretation, recommendations, and uncertainty remain distinct. This report contains local browser work only.</p></article>${calculations ? `<h2>Calculations and interpretations</h2>${calculations}` : '<p>No saved calculations yet.</p>'}${chart}<h2>Managerial interpretation</h2>${managerialHTML(state.analyses, state.datasetName)}<h2>CEAM+ Decision Lens</h2>${lensHTML()}${strategy ? `<h2>Case Analysis Mode</h2>${strategy}` : ''}<h2>Limitations</h2><p>Results depend on data definitions, quality, scope, and method assumptions. Correlation does not establish causation. Forecasts and planning ratings are estimates or discussion aids. CEAM+ supports human judgment and does not replace it.</p>`;
}

function chartSubmit(event) {
  event.preventDefault();
  try {
    if (!state.rows.length) throw Error('Load a dataset or a sample before generating a chart.');
    const type = $('chart-type').value, x = $('chart-x').value, y = $('chart-y').value, group = $('chart-group').value, aggregation = $('chart-aggregation').value;
    const canvas = $('analysis-chart'); const chart = drawChart(canvas, { rows: state.rows, x, y, group, type, aggregation, title: $('chart-name').value.trim() || `${y} by ${x}` });
    state.chart = { canvas, ...chart, type, chartType: type, x, y, group, summary: chart.summary };
    $('chart-output').hidden = false; $('chart-legend').textContent = chart.series ? chart.series.map(series => series.name).join(' · ') : 'Each point represents a complete paired observation.'; $('chart-summary').textContent = chart.summary; $('chart-table').innerHTML = tableHTML(chart.table.headers, chart.table.rows, 'Underlying chart data');
    saveAnalysis({ id: 'chart', label: `Chart: ${$('chart-name').value.trim() || `${y} by ${x}`}`, result: '', unit: '', formula: 'Grouped or paired values from the selected columns', calculation: chart.summary, interpretation: chart.summary, managerial: 'Use the chart to identify questions, then compare the underlying records and context.', assumptions: 'Grouping and aggregation choices reflect the selected columns.', limitations: 'A chart describes the supplied rows; it does not establish a cause.', questions: ['What evidence could contradict this pattern?', 'Are periods, populations and units comparable?'], chartType: type });
    setError(''); setStatus('Chart generated locally. Review the text summary and data table; color is not the only source of meaning.');
  } catch (error) { setError(error.message); }
}

function updateStatFit() {
  const method = $('stat-method').value;
  const messages = { describe: 'Descriptive statistics summarize the selected numeric observations; they do not generalize beyond the data by themselves.', ci: 'A confidence interval estimates a population mean under sampling assumptions. It is not a range for individual future observations.', correlation: 'Correlation describes linear association in matched pairs. It does not establish causation.', regression: 'Regression describes a least-squares line for matched numeric pairs. Inspect a scatter plot and residuals before interpretation.', one: 'A one-sample t test compares a sample mean with a prespecified benchmark; review the benchmark before seeing the result.', two: 'Welch’s test compares two independent means without requiring equal variances or equal sample sizes.', paired: 'A paired test compares after − before for the same matched rows. Do not independently sort or filter the columns.', forecast: 'A simple forecast is a conditional estimate. Historical, moving-average, growth, and trend methods use different assumptions.' };
  $('stat-fit').textContent = messages[method];
  $('stat-assumptions').checked = false;
}

function statSubmit(event) {
  event.preventDefault();
  try {
    const method = $('stat-method').value; if (method !== 'describe' && !$('stat-assumptions').checked) throw Error('Review and check the method assumptions before running this statistical analysis.');
    const first = valuesForColumn($('stat-a').value, { allowMissing: true }); let result;
    const confidence = Number($('stat-confidence').value), alpha = 1 - confidence;
    if (method === 'describe') { result = descriptiveStats(first.values); const p = Number($('stat-percentile').value) / 100; result.details = [...(result.details || []), { label: `${format(p * 100)}th percentile`, value: percentile(first.values, p) }]; result.interpretation += first.omissions.length ? ` ${first.omissions.length} missing or nonnumeric rows were omitted for this descriptive summary.` : ''; }
    if (method === 'ci') result = confidenceInterval(first.values, confidence);
    if (method === 'one') result = oneSampleT(first.values, parseNumber($('stat-null').value), alpha);
    if (method === 'forecast') { const raw = $('forecast-rate').value.trim(); const growthRate = $('forecast-method').value === 'growth' ? (raw.endsWith('%') ? parseNumber(raw) : (() => { throw Error('Enter the forecast growth assumption with a % sign when using the growth-rate method (for example, 5%).'); })()) : undefined; result = forecast(first.values, { method: $('forecast-method').value, periods: 3, growthRate, scenarioRate: .1 }); }
    if (['correlation', 'regression', 'two', 'paired'].includes(method)) { const pair = pairedValues($('stat-a').value, $('stat-b').value); if (method === 'correlation') result = correlation(pair.a, pair.b); if (method === 'regression') result = regression(pair.a, pair.b); if (method === 'paired') result = pairedT(pair.a, pair.b, alpha); if (method === 'two') { const split = Math.floor(pair.a.length / 2); if (split < 2 || pair.a.length - split < 2) throw Error('Two-sample analysis needs at least two complete observations in each group. Choose separate group columns or use the group comparison.'); result = twoSampleT(pair.a.slice(0, split), pair.a.slice(split), alpha); } if (pair.omitted.length) result.interpretation += ` ${pair.omitted.length} incomplete pairs were omitted while preserving row alignment.`; }
    if (!result) throw Error('Choose a supported statistical method.');
    $('statistics-result').innerHTML = `<article class="lab-result"><h3>${html(result.label)}</h3>${teachingHTML(result)}</article>`; saveAnalysis(result); setError(''); setStatus(`${result.label} completed. Review its assumptions and practical meaning.`);
  } catch (error) { $('statistics-result').replaceChildren(); setError(error.message); }
}

function resetChart() { $('chart-form').reset(); $('chart-output').hidden = true; state.chart = null; renderDatasetControls(); }
function downloadChart() { const canvas = $('analysis-chart'); canvas.toBlob(blob => blob && download('ceam-chart.png', blob, 'image/png')); }

function exportResults() {
  const rows = [['Dataset', state.datasetName || 'Manual inputs'], ['Reference', 'Title', 'Result', 'Unit', 'Formula', 'Interpretation', 'Chart type']];
  state.analyses.forEach(item => rows.push([item.reference || '', item.title || item.label || '', item.result ?? '', item.unit || '', item.formula || '', item.interpretation || '', item.chartType || '']));
  download('ceam-analysis-results.csv', new Blob([csvReport(rows)], { type: 'text/csv;charset=utf-8' }), 'text/csv;charset=utf-8'); setStatus('Results CSV downloaded.');
}

async function copyReport() {
  const node = document.createElement('div'); node.innerHTML = reportHTML(); const text = node.innerText || node.textContent || '';
  try { await navigator.clipboard.writeText(text); setStatus('Analysis copied to the clipboard.'); } catch { setError('Clipboard access is unavailable in this browser. Use Print / Save report as PDF or Export results CSV instead.'); }
}

function clearDataset() { cancelParsing(); state.file = null; state.sheetNames = []; state.sheetName = ''; state.datasetName = ''; state.rows = []; state.columns = []; state.mapping = {}; $('data-file').value = ''; renderDataset(); setStatus('Dataset cleared. Your retained analysis history remains in this tab.'); setError(''); }
function clearAll() { cancelParsing(); state.file = null; state.sheetNames = []; state.sheetName = ''; state.datasetName = ''; state.rows = []; state.columns = []; state.mapping = {}; state.analyses = []; state.chart = null; $('data-file').value = ''; state.calculators?.reset?.(); state.strategy?.reset?.(); renderDataset(); renderManagerial(); setStatus('All work cleared from this tab.'); setError(''); }

function wireDataInput() {
  const input = $('data-file'), drop = $('drop-zone');
  input.addEventListener('change', () => input.files[0] && useFile(input.files[0]));
  ['dragenter', 'dragover'].forEach(event => drop.addEventListener(event, e => { e.preventDefault(); drop.classList.add('is-dragging'); }));
  ['dragleave', 'drop'].forEach(event => drop.addEventListener(event, e => { e.preventDefault(); drop.classList.remove('is-dragging'); }));
  drop.addEventListener('drop', e => { const file = e.dataTransfer.files[0]; if (file) useFile(file); });
  $('sheet-select').addEventListener('change', () => state.file && useFile(state.file, $('sheet-select').value));
  $('load-sample').addEventListener('click', () => useSample($('sample-select').value));
  $('clear-data').addEventListener('click', clearDataset);
}

function wireModes() {
  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => showMode(button.dataset.mode)));
}

function boot() {
  wireModes(); wireDataInput();
  $('chart-form').addEventListener('submit', chartSubmit); $('reset-chart').addEventListener('click', resetChart); $('download-chart').addEventListener('click', downloadChart);
  $('statistics-form').addEventListener('submit', statSubmit); $('stat-method').addEventListener('change', updateStatFit);
  $('print-report').addEventListener('click', () => printReport(reportHTML())); $('export-csv').addEventListener('click', exportResults); $('copy-analysis').addEventListener('click', copyReport); $('clear-all').addEventListener('click', clearAll); $('clear-history').addEventListener('click', () => { state.analyses = []; renderManagerial(); setStatus('Analysis history cleared from this tab.'); });
  state.calculators = mountCalculators({ getContext: context, saveAnalysis, setError, setStatus });
  state.strategy = mountStrategy($('strategy-root'), { getContext: context });
  updateStatFit(); renderManagerial(); showMode('data');
  window.CEAMAnalyticsLab = { state, loadSample: useSample, parseFile: useFile, calculate: state.calculators, getReport: reportHTML, strategy: state.strategy };
}

boot();
applyAssessmentLink({ document, location: window.location, Event: window.Event, setStatus });
mountMarketingAssessmentContext({ document, location: window.location });
