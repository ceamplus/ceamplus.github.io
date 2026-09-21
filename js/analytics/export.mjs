export function download(name, blob, type){const payload=blob instanceof Blob?blob:new Blob([blob],{type:type||'application/octet-stream'});const url=URL.createObjectURL(payload);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function csvReport(rows){return rows.map(row=>row.map(value=>{let s=String(value??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}).join(',')).join('\r\n');}
export function printReport(html){
  const target=document.getElementById('lab-print-report');target.innerHTML=html;window.print();
}
