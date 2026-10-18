import { parseNumber, missing } from './data-quality.mjs';
const palette = ['#947126','#505258','#316977','#965445','#625482','#4b7058','#8b5e35','#606b83'];
const f = n => Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
function order(label) {
  const q = String(label).match(/^(\d{4})[ -]?Q([1-4])$/i); if (q) return +q[1] * 4 + +q[2];
  const d = /^\d{4}-\d{2}/.test(String(label)) ? Date.parse(label) : NaN;
  return Number.isFinite(d) ? d : label;
}
export function buildChartData({ rows, x, y, group = '', type = 'bar', aggregation = 'sum', mode = 'number', xMode = 'number' }) {
  if (!rows.length || !y) throw Error('Load data and select a Y variable.');
  let omitted = 0;
  if (type === 'scatter') {
    if (!x) throw Error('Choose a numeric X variable for a scatter plot.');
    const points = rows.map(r => ({ x: parseNumber(r[x], xMode), y: parseNumber(r[y], mode), label: group ? String(r[group] ?? 'Missing group') : '' })).filter(p => { const ok = p.x != null && p.y != null; if (!ok) omitted++; return ok; });
    if (!points.length) throw Error('No complete numeric pairs are available.');
    const xValues = points.map(point => point.x);
    if (!Number.isFinite(Math.max(...xValues) - Math.min(...xValues))) throw Error('The numeric range cannot be plotted reliably. Rescale the units before charting.');
    if (points.length > 3000) throw Error('Scatter plots support up to 3,000 pairs; use a smaller dataset.');
    return { points, omitted, table: { headers: [x, y, ...(group ? [group] : [])], rows: points.map(p => [p.x,p.y,...(group ? [p.label] : [])]) }, summary: `${points.length} complete pairs are plotted. A visible relationship does not establish causation. ${omitted} incomplete or nonnumeric pairs omitted.` };
  }
  if (type === 'histogram') {
    const values = rows.map(r => parseNumber(r[y], mode)).filter(v => { if (v == null) omitted++; return v != null; });
    if (!values.length) throw Error('Choose a variable with numeric values.');
    const min = Math.min(...values), max = Math.max(...values), count = max === min ? 1 : Math.min(12, Math.ceil(Math.sqrt(values.length))), width = (max - min) / count || 1;
    if (!Number.isFinite(width)) throw Error('The numeric range cannot be plotted reliably. Rescale the units before charting.');
    const bins = Array.from({ length: count }, (_, i) => ({ label: intervalLabel(min + i * width, min + (i + 1) * width), lower: min + i * width, upper: min + (i + 1) * width, value: 0 }));
    values.forEach(v => bins[Math.min(count - 1, Math.floor((v - min) / width))].value++);
    return { labels: bins.map(b => b.label), series: [{ name: 'Count', values: bins.map(b => b.value) }], omitted, table: { headers: [y + ' interval (upper end excluded except last)', 'Count'], rows: bins.map(b => [String(b.lower) + '–' + String(b.upper), b.value]) }, summary: `Distribution of ${values.length} values across ${count} equal-width interval(s). Range ${f(min)} to ${f(max)}. ${omitted} missing or nonnumeric values omitted.` };
  }
  if (!x) throw Error('Choose an X or grouping variable.');
  const grouped = new Map(), seriesNames = new Set();
  for (const row of rows) {
    const value = aggregation === 'count' ? 1 : parseNumber(row[y], mode);
    if (missing(row[x]) || value == null) { omitted++; continue; }
    const label = String(row[x]), key = group ? String(row[group] ?? 'Missing group') : y;
    seriesNames.add(key); if (!grouped.has(label)) grouped.set(label,new Map());
    const cell = grouped.get(label).get(key) || []; cell.push(value); grouped.get(label).set(key,cell);
  }
  if (!grouped.size) throw Error('No complete values are available for this chart.');
  if (grouped.size > 40 || seriesNames.size > 6) throw Error('Use at most 40 categories and 6 groups. Choose a higher-level grouping or smaller dataset.');
  const labels = [...grouped.keys()].sort((a,b) => { const aa=order(a),bb=order(b); return typeof aa==='number'&&typeof bb==='number'?aa-bb:a.localeCompare(b,undefined,{numeric:true}); });
  const series = [...seriesNames].map(name => ({ name, values: labels.map(label => { const list=grouped.get(label).get(name); return list ? list.reduce((a,b)=>a+b,0)/(aggregation==='mean'?list.length:1) : null; }) }));
  if (type === 'donut' && (labels.length > 8 || series.length > 1 || series[0].values.some(v => v == null || v < 0) || !Number.isFinite(series[0].values.reduce((a,b)=>a+b,0)) || series[0].values.reduce((a,b)=>a+b,0) <= 0)) throw Error('Donut charts need 1–8 nonnegative categories in one series with a positive total. Choose a bar chart for other data.');
  const available = series.flatMap(s=>s.values.filter(v=>v!=null)), min=Math.min(...available),max=Math.max(...available);
  return { labels,series,omitted,table:{headers:[x,...series.map(s=>s.name)],rows:labels.map((l,i)=>[l,...series.map(s=>s.values[i])])},summary:`The chart shows ${aggregation} by ${x}, from ${f(min)} to ${f(max)} across ${labels.length} categories. ${type==='line'?'Time ordering does not establish seasonality or cause; compare like periods.':'Category differences describe this dataset; they do not explain the causes.'} ${omitted} missing or nonnumeric rows omitted. Missing combinations are gaps, not zero.` };
}
/** Outward rounded bounds retain zero and every observed value. */
export function chartScale(values, intervals = 5) {
  if (!values.length || values.some(value => !Number.isFinite(value))) throw Error('Chart values exceed the supported numeric range. Review the data or rescale its units.');
  let min = Math.min(0, ...values), max = Math.max(0, ...values);
  if (min === max) max = min + 1;
  const rawStep = (max - min) / intervals;
  if (!Number.isFinite(rawStep) || rawStep <= 0) throw Error('The numeric range cannot be plotted reliably. Rescale the units before charting.');
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const fraction = rawStep / magnitude;
  const step = ([1, 2, 2.5, 5, 10].find(value => value >= fraction) || 10) * magnitude;
  min = Math.floor(min / step) * step;
  max = Math.ceil(max / step) * step;
  if (![min, max, step, max - min].every(Number.isFinite) || step <= 0) throw Error('The numeric range cannot be plotted reliably. Rescale the units before charting.');
  const ticks = Array.from({ length: Math.round((max - min) / step) + 1 }, (_, i) => Number((min + i * step).toPrecision(12)));
  return { min, max, step, ticks };
}

const tickText = value => value !== 0 && (Math.abs(value) < .001 || Math.abs(value) >= 1e9)
  ? value.toExponential(2).replace(/\.?0+e/, 'e')
  : value.toLocaleString(undefined, { maximumFractionDigits: 8 });
const intervalLabel = (lower, upper) => {
  const start = tickText(lower), end = tickText(upper);
  // Preserve distinct bounds when compact formatting would make a nonzero interval look empty.
  return start === end && lower !== upper ? String(lower) + '–' + String(upper) : start + '–' + end;
};
const valueText = value => {
  if (value !== 0 && Math.abs(value) < .01) return String(value);
  const rounded = Number(value.toFixed(2));
  return (rounded === value ? '' : '≈') + f(value);
};

export function drawChart(canvas, config) {
  const data = buildChartData(config);
  const parentStyle = window.getComputedStyle(canvas.parentElement);
  const availableWidth = canvas.parentElement.clientWidth - (parseFloat(parentStyle.paddingLeft) || 0) - (parseFloat(parentStyle.paddingRight) || 0);
  const width = Math.max(180, availableWidth || 300);
  const height = config.type === 'horizontalBar' ? Math.max(330, (data.labels?.length || 1) * 36 + 100) : width < 500 ? 350 : 380;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
  canvas.style.width = '100%'; canvas.style.height = height + 'px';
  const ctx = canvas.getContext('2d');
  const font = window.getComputedStyle(canvas).fontFamily || 'system-ui, sans-serif';
  ctx.scale(ratio, ratio); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, width, height);
  ctx.font = '12px ' + font;
  function text(value, x, y, align = 'left') {
    ctx.textAlign = align; ctx.fillStyle = '#505258'; ctx.fillText(String(value), x, y); ctx.textAlign = 'left';
  }
  function fitted(value, maxWidth) {
    let label = String(value);
    if (ctx.measureText(label).width <= maxWidth) return label;
    while (label.length && ctx.measureText(label + '…').width > maxWidth) label = label.slice(0, -1);
    return label + '…';
  }
  const title = config.title || (config.y + ' by ' + config.x);
  ctx.font = '600 13px ' + font;
  // Wrap a compact title; the accessible label retains its full text.
  const words = title.split(/\s+/); const titleLines = [''];
  words.forEach(word => {
    const index = titleLines.length - 1, next = (titleLines[index] + ' ' + word).trim();
    if (ctx.measureText(next).width > width - 24 && titleLines[index] && index === 0) titleLines.push(word);
    else titleLines[index] = next;
  });
  titleLines.forEach((line, index) => text(fitted(line, width - 24), 12, 22 + index * 17));
  ctx.font = '12px ' + font;
  const all = data.points ? data.points.map(point => point.y) : data.series.flatMap(series => series.values.filter(value => value != null));
  const scale = chartScale(all);
  const horizontal = config.type === 'horizontalBar';
  const left = horizontal ? Math.min(150, width * .36) : Math.max(48, ...scale.ticks.map(value => ctx.measureText(tickText(value)).width + 12));
  const top = 64, right = 18, bottom = 78, w = width - left - right, h = height - top - bottom;
  const Y = value => top + h - (value - scale.min) / (scale.max - scale.min) * h;
  function annotate(value, x, y) {
    const label = valueText(value), half = ctx.measureText(label).width / 2;
    const boundedX = Math.max(half + 3, Math.min(width - half - 3, x));
    const boundedY = Math.max(top - 8, Math.min(top + h - 2, y));
    // A white backing keeps labels readable over grid lines without hiding data marks.
    ctx.fillStyle = '#fff'; ctx.fillRect(boundedX - half - 2, boundedY - 11, half * 2 + 4, 14);
    text(label, boundedX, boundedY, 'center');
  }
  if (config.type === 'donut') {
    const values = data.series[0].values, total = values.reduce((a, b) => a + b, 0);
    const cx = width / 2, cy = height / 2 + 4, radius = Math.min(width * .31, 112); let angle = -Math.PI / 2;
    values.forEach((value, index) => {
      const next = angle + value / total * Math.PI * 2;
      ctx.fillStyle = palette[index]; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, radius, angle, next); ctx.closePath(); ctx.fill(); angle = next;
    });
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, radius * .55, 0, Math.PI * 2); ctx.fill(); text(f(total), cx, cy + 5, 'center');
  } else if (horizontal) {
    const X = value => left + (value - scale.min) / (scale.max - scale.min) * w, rowH = h / data.labels.length;
    scale.ticks.forEach(value => {
      const x = X(value); ctx.strokeStyle = value === 0 ? '#9b9da1' : '#dedfe2'; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, top + h); ctx.stroke(); text(tickText(value), x, top + h + 24, 'center');
    });
    data.labels.forEach((label, index) => {
      text(fitted(label, left - 12), left - 8, top + index * rowH + rowH / 2 + 4, 'right');
      data.series.forEach((series, seriesIndex) => {
        const value = series.values[index]; if (value == null) return;
        const barY = top + index * rowH + seriesIndex * rowH / data.series.length + 2;
        ctx.fillStyle = palette[seriesIndex];
        ctx.fillRect(Math.min(X(0), X(value)), barY, Math.abs(X(value) - X(0)), Math.max(2, rowH / data.series.length - 4));
        if (data.series.length === 1 && data.labels.length <= 12) {
          const labelText = valueText(value), labelWidth = ctx.measureText(labelText).width;
          const outside = value >= 0 ? X(value) + 5 : X(value) - labelWidth - 5;
          const labelX = Math.max(left + 3, Math.min(width - right - labelWidth, outside));
          ctx.fillStyle = '#fff'; ctx.fillRect(labelX - 2, barY + rowH / 2 - 11, labelWidth + 4, 14);
          text(labelText, labelX, barY + rowH / 2);
        }
      });
    });
  } else {
    scale.ticks.forEach(value => {
      const y = Y(value); ctx.strokeStyle = value === 0 ? '#9b9da1' : '#dedfe2'; ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(width - right, y); ctx.stroke(); text(tickText(value), left - 8, y + 4, 'right');
    });
    if (data.points) {
      const xs = data.points.map(point => point.x), min = Math.min(...xs), max = Math.max(...xs), span = max - min || 1;
      const groups = [...new Set(data.points.map(point => point.label))];
      data.points.forEach(point => { ctx.fillStyle = palette[Math.max(0, groups.indexOf(point.label)) % palette.length]; ctx.beginPath(); ctx.arc(left + (point.x - min) / span * w, Y(point.y), 3.5, 0, Math.PI * 2); ctx.fill(); });
      for (let index = 0; index <= 4; index++) text(tickText(min + span * index / 4), left + w * index / 4, height - 45, 'center');
    } else {
      const gap = w / data.labels.length;
      const quarters = data.labels.every(label => /^\d{4} Q[1-4]$/i.test(label));
      const step = data.labels.length <= 6 ? 1 : Math.max(1, Math.ceil(data.labels.length / (width < 500 ? 5 : 12)));
      data.labels.forEach((label, index) => {
        if (index % step && index !== data.labels.length - 1) return;
        const x = left + gap * (index + .5);
        if (quarters && gap < 75) {
          const [, quarter] = label.split(' '); text(quarter, x, height - 51, 'center');
        } else {
          text(fitted(label, Math.max(22, gap * step - 4)), x, height - 44, 'center');
        }
      });
      if (quarters && gap < 75) {
        const years = new Map();
        data.labels.forEach((label, index) => { const year = label.split(' ')[0]; const indexes = years.get(year) || []; indexes.push(index); years.set(year, indexes); });
        years.forEach((indexes, year) => text(year, left + gap * ((indexes[0] + indexes.at(-1)) / 2 + .5), height - 35, 'center'));
      }
      data.series.forEach((series, seriesIndex) => {
        ctx.strokeStyle = palette[seriesIndex]; ctx.fillStyle = palette[seriesIndex]; ctx.lineWidth = 2.5;
        let started = false; ctx.beginPath();
        series.values.forEach((value, index) => {
          if (value == null) { started = false; return; }
          const x = left + gap * (index + .5);
          if (config.type === 'line') { if (started) ctx.lineTo(x, Y(value)); else ctx.moveTo(x, Y(value)); started = true; }
          else ctx.fillRect(left + gap * index + gap * .12 + seriesIndex * gap * .76 / data.series.length, Math.min(Y(0), Y(value)), gap * .76 / data.series.length, Math.max(1, Math.abs(Y(value) - Y(0))));
        });
        if (config.type === 'line') {
          ctx.stroke(); series.values.forEach((value, index) => { if (value != null) { ctx.fillStyle = palette[seriesIndex]; ctx.beginPath(); ctx.arc(left + gap * (index + .5), Y(value), 3, 0, Math.PI * 2); ctx.fill(); } });
        }
        if (data.series.length === 1 && data.labels.length <= 12) {
          const labelsFit = series.values.filter(value => value != null).every(value => ctx.measureText(valueText(value)).width + 10 <= gap);
          const finiteIndexes = series.values.map((value, index) => value == null ? -1 : index).filter(index => index >= 0);
          const sparse = new Set([finiteIndexes[0], finiteIndexes.at(-1)]);
          series.values.forEach((value, index) => {
            if (value != null && (labelsFit || sparse.has(index))) annotate(value, left + gap * (index + .5), Y(value) + (value < 0 ? 19 : -10));
          });
        }
      });
    }
  }
  ctx.font = '10px ' + font;
  text(width < 420 ? 'CEAM+ · Exact values in data table' : 'CEAM+ · Locally calculated · Exact values in data table', 12, height - 10);
  canvas.setAttribute('aria-label', title + '. ' + data.summary + ' Exact values are available in the accompanying data table.');
  return data;
}
