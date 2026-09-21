export const MAX_FILE_BYTES = 10 * 1024 * 1024;
let activeWorker;
let rejectActive;
export function cancelParsing() {
  if (activeWorker) { activeWorker.terminate(); activeWorker = null; rejectActive?.(new Error('File processing cancelled.')); rejectActive = null; }
}
export async function parseFile(file, sheet) {
  if (!/\.(csv|xlsx|xls)$/i.test(file.name)) throw Error('Choose a CSV, XLSX, or XLS file.');
  if (!file.size) throw Error('This file is empty.');
  if (file.size > MAX_FILE_BYTES) throw Error('Use a file smaller than 10 MB.');
  cancelParsing();
  const bytes = await file.arrayBuffer();
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./parser-worker.js', import.meta.url));
    activeWorker = worker;
    const finish = () => { clearTimeout(timer); worker.terminate(); if (activeWorker === worker) { activeWorker = null; rejectActive = null; } };
    const timer = setTimeout(() => { finish(); reject(Error('File processing took too long. Try a smaller workbook or export the relevant sheet as CSV.')); }, 15000);
    rejectActive = error => { finish(); reject(error); };
    worker.onmessage = ({ data }) => { finish(); data.error ? reject(Error(data.error)) : resolve(data); };
    worker.onerror = () => { finish(); reject(Error('The local parser could not start. Reload the page and try again.')); };
    worker.postMessage({ bytes, name: file.name, sheet }, [bytes]);
  });
}
