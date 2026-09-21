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
    if (points.length > 3000) throw Error('Scatter plots support up to 3,000 pairs; use a smaller dataset.');
    return { points, omitted, table: { headers: [x, y, ...(group ? [group] : [])], rows: points.map(p => [p.x,p.y,...(group ? [p.label] : [])]) }, summary: `${points.length} complete pairs are plotted. A visible relationship does not establish causation. ${omitted} incomplete or nonnumeric pairs omitted.` };
  }
  if (type === 'histogram') {
    const values = rows.map(r => parseNumber(r[y], mode)).filter(v => { if (v == null) omitted++; return v != null; });
    if (!values.length) throw Error('Choose a variable with numeric values.');
    const min = Math.min(...values), max = Math.max(...values), count = max === min ? 1 : Math.min(12, Math.ceil(Math.sqrt(values.length))), width = (max - min) / count || 1;
    const bins = Array.from({ length: count }, (_, i) => ({ label: `${f(min + i * width)}–${f(min + (i + 1) * width)}`, value: 0 }));
    values.forEach(v => bins[Math.min(count - 1, Math.floor((v - min) / width))].value++);
    return { labels: bins.map(b => b.label), series: [{ name: 'Count', values: bins.map(b => b.value) }], omitted, table: { headers: [y + ' interval (upper end excluded except last)', 'Count'], rows: bins.map(b => [b.label,b.value]) }, summary: `Distribution of ${values.length} values across ${count} equal-width interval(s). Range ${f(min)} to ${f(max)}. ${omitted} missing or nonnumeric values omitted.` };
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
  if (type === 'donut' && (labels.length > 8 || series.length > 1 || series[0].values.some(v => v == null || v < 0) || series[0].values.reduce((a,b)=>a+b,0) <= 0)) throw Error('Donut charts need 1–8 nonnegative categories in one series with a positive total. Choose a bar chart for other data.');
  const available = series.flatMap(s=>s.values.filter(v=>v!=null)), min=Math.min(...available),max=Math.max(...available);
  return { labels,series,omitted,table:{headers:[x,...series.map(s=>s.name)],rows:labels.map((l,i)=>[l,...series.map(s=>s.values[i])])},summary:`The chart shows ${aggregation} by ${x}, from ${f(min)} to ${f(max)} across ${labels.length} categories. ${type==='line'?'Time ordering does not establish seasonality or cause; compare like periods.':'Category differences describe this dataset; they do not explain the causes.'} ${omitted} missing or nonnumeric rows omitted. Missing combinations are gaps, not zero.` };
}
export function drawChart(canvas, config) {
  const data=buildChartData(config), width=Math.max(300,canvas.parentElement.clientWidth),height=config.type==='horizontalBar'?Math.max(330,(data.labels?.length||1)*32+90):380;
  const ratio=Math.min(window.devicePixelRatio||1,2);canvas.width=width*ratio;canvas.height=height*ratio;canvas.style.width='100%';canvas.style.height=height+'px';
  const ctx=canvas.getContext('2d');ctx.scale(ratio,ratio);ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);ctx.font='12px Inter, sans-serif';ctx.fillStyle='#34363a';
  const title=config.title||`${config.y} by ${config.x}`; ctx.font='600 15px Inter, sans-serif';ctx.fillText(title.slice(0,90),16,24);ctx.font='12px Inter, sans-serif';
  const left=config.type==='horizontalBar'?Math.min(150,width*.32):64,top=60,right=20,bottom=70,w=width-left-right,h=height-top-bottom;
  const all=data.points?data.points.map(p=>p.y):data.series.flatMap(s=>s.values.filter(v=>v!=null));let ymin=Math.min(0,...all),ymax=Math.max(0,...all);if(ymin===ymax)ymax=ymin+1;
  const Y=v=>top+h-(v-ymin)/(ymax-ymin)*h;
  function text(value,x,y,align='left'){ctx.textAlign=align;ctx.fillStyle='#505258';ctx.fillText(value,x,y);ctx.textAlign='left';}
  if(config.type==='donut'){
    const values=data.series[0].values,total=values.reduce((a,b)=>a+b,0),cx=width/2,cy=height/2+10,r=Math.min(width*.27,120);let angle=-Math.PI/2;
    values.forEach((v,i)=>{const next=angle+v/total*Math.PI*2;ctx.fillStyle=palette[i];ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,angle,next);ctx.closePath();ctx.fill();angle=next;});ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(cx,cy,r*.55,0,Math.PI*2);ctx.fill();text(f(total),cx,cy+5,'center');
  }else if(config.type==='horizontalBar'){
    const X=v=>left+(v-ymin)/(ymax-ymin)*w,rowH=h/data.labels.length;
    data.labels.forEach((l,i)=>{text(l.slice(0,20),left-8,top+i*rowH+rowH/2,'right');data.series.forEach((s,k)=>{const v=s.values[i];if(v==null)return;ctx.fillStyle=palette[k];const base=X(0);ctx.fillRect(Math.min(base,X(v)),top+i*rowH+k*rowH/data.series.length+2,Math.abs(X(v)-base),Math.max(2,rowH/data.series.length-4));});});
    for(let i=0;i<=4;i++)text(f(ymin+(ymax-ymin)*i/4),left+w*i/4,height-30,'center');
  }else{
    for(let i=0;i<=4;i++){const v=ymin+(ymax-ymin)*i/4,y=Y(v);ctx.strokeStyle='#dedfe2';ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(width-right,y);ctx.stroke();text(f(v),left-8,y+4,'right');}
    if(data.points){const xs=data.points.map(p=>p.x),min=Math.min(...xs),max=Math.max(...xs),span=max-min||1;const groups=[...new Set(data.points.map(p=>p.label))];data.points.forEach(p=>{ctx.fillStyle=palette[Math.max(0,groups.indexOf(p.label))%palette.length];ctx.beginPath();ctx.arc(left+(p.x-min)/span*w,Y(p.y),3.5,0,Math.PI*2);ctx.fill();});for(let i=0;i<=4;i++)text(f(min+span*i/4),left+w*i/4,height-40,'center');
    }else{
      const gap=w/data.labels.length,step=Math.max(1,Math.ceil(data.labels.length/(width<500?5:12)));
      data.labels.forEach((label,i)=>{if(i%step===0)text(label.slice(0,14),left+gap*(i+.5),height-42,'center');});
      data.series.forEach((s,k)=>{ctx.strokeStyle=palette[k];ctx.fillStyle=palette[k];ctx.lineWidth=2.5;let started=false;ctx.beginPath();s.values.forEach((v,i)=>{if(v==null){started=false;return;}const x=left+gap*(i+.5);if(config.type==='line'){if(started)ctx.lineTo(x,Y(v));else ctx.moveTo(x,Y(v));started=true;}else ctx.fillRect(left+gap*i+gap*.12+k*gap*.76/data.series.length,Math.min(Y(0),Y(v)),gap*.76/data.series.length,Math.max(1,Math.abs(Y(v)-Y(0))));});if(config.type==='line'){ctx.stroke();s.values.forEach((v,i)=>{if(v!=null){ctx.beginPath();ctx.arc(left+gap*(i+.5),Y(v),3,0,Math.PI*2);ctx.fill();}})}});
    }
  }
  ctx.font='11px Inter, sans-serif';text('CEAM+ · Locally calculated · See the table for exact values',16,height-12);
  canvas.setAttribute('aria-label',`${title}. ${data.summary}`);
  return data;
}
