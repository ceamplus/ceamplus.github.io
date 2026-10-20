import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const pages=fs.readdirSync('.').filter(p=>p.endsWith('.html'));
test('public pages have no legacy survey starter or survey navigation',()=>{
 for(const p of pages){const s=fs.readFileSync(p,'utf8');const nav=s.match(/<nav class="nav-links"[\s\S]*?<\/nav>/)?.[0]||'';assert(!nav.includes('surveys.html'),p);assert(!/data-start-assessment|data-survey-start|Start Survey|Take a Survey|Start a Survey/.test(s),p);assert(!/src="js\/surveys\/app.mjs|src="js\/surveys-context.js/.test(s),p);}
});
test('read-only compatibility does not import scoring or write, remove, migrate or transmit storage',()=>{
 const s=fs.readFileSync('js/surveys/retired.mjs','utf8');assert(!/setItem\s*\(|removeItem\s*\(|\.clear\s*\(|fetch\s*\(|XMLHttpRequest|sendBeacon|summarizeSurvey\s*\(|saveResult\s*\(|saveDraft\s*\(/.test(s));assert(!s.includes('from \'../assessments/storage.mjs\''));assert(!s.includes('script.js'));assert(!s.includes('scenario-studio/'));
 for(const p of ['surveys.html','assessments.html']){const page=fs.readFileSync(p,'utf8');assert.match(page,/not been converted or rescored/);assert.match(page,/not validated diagnoses/);assert.match(page,/id="legacy-history"/);}
});
