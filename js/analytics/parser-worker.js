/* SheetJS is vendored locally. No workbook data leaves this worker/browser. */
importScripts('../../assets/vendor/xlsx.full.min.js');
const LIMITS = { rows: 20000, columns: 100, sheets: 20, cells: 1000000 };
function csvRows(text) {
  if (text.includes('\0')) throw Error('The CSV contains binary data. Export a text CSV instead.');
  const delimiter = text.split(/\r?\n/)[0].includes('\t') ? '\t' : ',';
  const rows = []; let row = [], value = '', quoted = false, ended = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { value += '"'; i++; }
      else if (c === '"') { quoted = false; ended = true; }
      else value += c;
    } else if (c === '"' && value === '' && !ended) quoted = true;
    else if (c === delimiter || c === '\n' || c === '\r') {
      row.push(value); value = ''; ended = false;
      if (row.length > LIMITS.columns) throw Error('Use at most 100 columns.');
      if (c !== delimiter) { rows.push(row); row = []; if (c === '\r' && text[i + 1] === '\n') i++; }
      if (rows.length > LIMITS.rows + 1) throw Error('Use at most 20,000 data rows.');
    } else {
      if (ended && c.trim()) throw Error('Malformed CSV: unexpected text after a closing quote.');
      if (c === '"') throw Error('Malformed CSV: quote inside an unquoted value.');
      value += c;
    }
  }
  if (quoted) throw Error('Malformed CSV: a quoted field is not closed.');
  if (value || row.length || ended) { row.push(value); rows.push(row); }
  return rows;
}
function normalize(grid, name) {
  while (grid.length && grid[grid.length - 1].every(v => v == null || v === '')) grid.pop();
  if (!grid.length) return { name, columns: [], rows: [], notes: ['Empty sheet.'] };
  const width = Math.max(...grid.map(r => r.length));
  if (width > LIMITS.columns || grid.length > LIMITS.rows + 1 || width * grid.length > LIMITS.cells) throw Error('Sheet exceeds the limit: 20,000 rows, 100 columns, or 1,000,000 cells. Export a smaller selection.');
  const seen = new Set(), notes = [];
  const columns = Array.from({ length: width }, (_, i) => {
    const raw = String(grid[0][i] ?? '').trim() || `Column ${i + 1}`;
    let label = raw, n = 2; while (seen.has(label)) label = `${raw} (${n++})`;
    if (label !== raw || !grid[0][i]) notes.push(`Column ${i + 1} is displayed as “${label}”.`);
    seen.add(label); return label;
  });
  const rows = grid.slice(1).filter(r => r.some(v => v != null && v !== '')).map(r => Object.fromEntries(columns.map((c, i) => [c, r[i] ?? null])));
  return { name, columns, rows, notes };
}
onmessage = ({ data }) => {
  try {
    const { bytes, name, sheet } = data;
    if (/\.csv$/i.test(name)) {
      const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, '');
      postMessage({ sheetNames: ['CSV'], sheet: normalize(csvRows(text), 'CSV') }); return;
    }
    const u = new Uint8Array(bytes);
    if (/\.xlsx$/i.test(name) && !(u[0] === 80 && u[1] === 75)) throw Error('This file is not an XLSX workbook. Check its format.');
    if (/\.xls$/i.test(name) && !((u[0] === 208 && u[1] === 207) || u[0] === 9)) throw Error('Use an Excel binary XLS file, XLSX, or CSV. Renamed text/XML files are not supported as XLS.');
    const meta = XLSX.read(bytes, { type: 'array', bookSheets: true });
    if (!meta.SheetNames.length || meta.SheetNames.length > LIMITS.sheets) throw Error('Use a workbook with 1–20 sheets.');
    const selected = sheet || meta.SheetNames[0];
    if (!meta.SheetNames.includes(selected)) throw Error('Select an available sheet.');
    const book = XLSX.read(bytes, { type: 'array', sheets: selected, dense: true, sheetRows: LIMITS.rows + 2, cellDates: true, cellFormula: true, cellHTML: false });
    const ws = book.Sheets[selected];
    const range = ws['!fullref'] || ws['!ref'];
    if (!range) { postMessage({ sheetNames: meta.SheetNames, sheet: normalize([], selected) }); return; }
    const end = XLSX.utils.decode_range(range).e;
    if (end.r > LIMITS.rows || end.c >= LIMITS.columns || (end.r + 1) * (end.c + 1) > LIMITS.cells) throw Error('Sheet is too large. Use at most 20,000 rows, 100 columns and 1,000,000 cells.');
    let missingFormula = 0;
    const grid = Array.from({ length: end.r + 1 }, (_, r) => Array.from({ length: end.c + 1 }, (_, c) => {
      const cell = ws['!data']?.[r]?.[c]; if (!cell) return null;
      if (cell.f && cell.v == null) missingFormula++;
      if (cell.t === 'e') return null;
      if (cell.v instanceof Date) return cell.v.toISOString();
      if (cell.t === 'n' && /%/.test(cell.w || '')) return cell.w;
      if (cell.t === 'n' && /[$£€¥]/.test(cell.w || '')) return cell.w;
      return cell.v ?? null;
    }));
    const normalized = normalize(grid, selected);
    normalized.notes.push('First row is treated as headers. Formulas are not executed; stored results are used. Spreadsheet error cells become missing values.');
    if (missingFormula) normalized.notes.push(`${missingFormula} formula cells have no saved result. Recalculate and save the workbook in Excel first.`);
    postMessage({ sheetNames: meta.SheetNames, sheet: normalized });
  } catch (error) { postMessage({ error: error.message || 'Unable to read this file.' }); }
};
