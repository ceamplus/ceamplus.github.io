export const missing = v => v == null || String(v).trim() === '';
export function parseNumber(value, percentMode = 'number') {
  if (missing(value) || typeof value === 'boolean') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? (percentMode === 'percent' ? value / 100 : value) : null;
  let text = String(value).trim(), negative = false;
  if (/^\(.*\)$/.test(text)) { negative = true; text = text.slice(1, -1).trim(); }
  const explicitPercent = text.endsWith('%');
  if (explicitPercent) text = text.slice(0, -1).trim();
  text = text.replace(/^([-+]?)[£$€¥]\s*/, '$1').trim();
  if (!/^[-+]?(?:\d{1,3}(?:,\d{3})+|\d+|)(?:\.\d+)?(?:[eE][-+]?\d+)?$/.test(text) || !/\d/.test(text)) return null;
  const number = Number(text.replaceAll(',', '')) * (negative ? -1 : 1);
  if (!Number.isFinite(number)) return null;
  return number / (explicitPercent || percentMode === 'percent' ? 100 : 1);
}
export function numericValues(rows, column, mode = 'number') {
  return rows.map(row => parseNumber(row[column], mode)).filter(v => v != null);
}
export function quantile(values, p) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b), i = (sorted.length - 1) * p;
  return sorted[Math.floor(i)] + (sorted[Math.ceil(i)] - sorted[Math.floor(i)]) * (i % 1);
}
export function inspectData(rows, columns) {
  const signatures = new Set(); let duplicates = 0;
  rows.forEach(row => { const key = JSON.stringify(columns.map(c => row[c])); if (signatures.has(key)) duplicates++; signatures.add(key); });
  return { duplicates, columns: columns.map(name => {
    const present = rows.map(r => r[name]).filter(v => !missing(v));
    const numbers = present.map(v => parseNumber(v)).filter(v => v != null);
    const pct = present.filter(v => /%$/.test(String(v).trim())).length;
    const currency = present.filter(v => /[$£€¥]/.test(String(v))).length;
    const dates = present.filter(v => /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(String(v)) && Number.isFinite(Date.parse(v))).length;
    const bools = present.filter(v => typeof v === 'boolean' || /^(true|false|yes|no)$/i.test(String(v))).length;
    const type = !present.length ? 'Unknown' : bools === present.length ? 'Boolean' : dates === present.length ? 'Date/time' : numbers.length === present.length ? (pct ? 'Percentage' : currency ? 'Currency' : 'Numeric') : 'Text/category';
    const q1 = quantile(numbers, .25), q3 = quantile(numbers, .75), iqr = q3 - q1;
    const outliers = numbers.length >= 4 && iqr > 0 ? numbers.filter(v => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr).length : 0;
    const notes = [];
    if (!present.length) notes.push('Empty column');
    if (numbers.length && numbers.length < present.length) notes.push('Mixed text and numeric values; nonnumeric values are omitted from numeric analyses, with counts shown.');
    if (numbers.length && present.some(v => typeof v === 'string' && parseNumber(v) != null)) notes.push('Numeric values stored as text; recognized formatting can be parsed.');
    if (pct || /rate|percent|margin|retention|growth/i.test(name)) notes.push('Potential percentage: confirm the scale in variable mapping.');
    if (currency) notes.push('Potential currency; calculations do not convert currencies.');
    if (outliers) notes.push(`${outliers} possible outlier(s), using the 1.5 × IQR rule; investigate context.`);
    return { name, type, missing: rows.length - present.length, unique: new Set(present.map(String)).size, numeric: numbers.length, outliers, notes };
  }) };
}
export const roles = ['Date','Quarter','Year','Customer ID','Acquisition date','Segment','Product','Region','Channel','Campaign','Customer type','Market size','Growth rate','Purchase rate','Units sold','Revenue','Price','Cost','Variable cost','Fixed costs','Advertising spend','Marketing spend','Leads','Visitors','Conversions','New customers','Returning customers','Customers at beginning','Customers at end','Customers lost','Purchases','Satisfaction score','Likelihood to recommend','Retention','Customer acquisition cost','Customer lifetime value','Profit','Margin','Competitor sales','Total category sales','Impressions','Clicks','Cash inflows','Operating costs','Investment costs','Budget','Actual spending'];
export function suggestMappings(columns) {
  const normalize = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return Object.fromEntries(roles.map(role => [role, columns.find(c => normalize(c) === normalize(role)) || '']));
}
