import { loadState } from '../assessments/storage.mjs';
import { getAssessment } from '../assessments/definitions.mjs';
import { buildMarketingProfile } from '../assessments/marketing-diagnostics.mjs';

/** Read only results explicitly saved in this browser, separate from measured data. */
export function mountMarketingAssessmentContext({ document, location }) {
  const root = document.getElementById('lab-assessment-context');
  if (!root) return;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const loaded = loadState();
  if (!loaded.ok) { root.innerHTML='<summary>Marketing Assessment context</summary><p>Saved assessments could not be read. You can still analyze business data here.</p>'; return; }
  const records=Object.values(loaded.state.results).flat().filter(record=>record.assessmentId==='marketing-assessment'&&!record.response.demo).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  root.innerHTML=`<summary>Connect a saved Marketing Assessment</summary><p>Assessment ratings are self-reported capabilities, not measured sales or market data. Use the profile to choose what to investigate. Nothing is uploaded or added to your dataset.</p>${records.length?`<label>Saved Marketing Assessment<select id="lab-marketing-result"><option value="">Choose a saved profile</option>${records.map((record,i)=>`<option value="${i}">${escape(record.initiative||record.context)} · ${escape(new Date(record.createdAt).toLocaleString())}</option>`).join('')}</select></label><div id="lab-marketing-profile"></div>`:'<p>No Marketing Assessment is saved in this browser yet. Enable browser saving in the assessment to connect its profile here.</p>'}<p><a href="assessment-center.html?assessment=marketing-assessment">Start Marketing Assessment</a></p>`;
  if (!records.length) return;
  const select=document.getElementById('lab-marketing-result');
  const show=()=>{
    const target=document.getElementById('lab-marketing-profile');
    if (select.value==='') { target.innerHTML=''; return; }
    const record=records[Number(select.value)];
    const profile=buildMarketingProfile(record.response.definitionSnapshot||getAssessment(record.assessmentId),record.response,record.result);
    target.innerHTML=`<h3>Marketing Capability Profile</h3><p>Self-reported assessment · ${profile.overall===null?'Not scored':profile.overall.toFixed(1)+' / 5'} · ${escape(profile.maturity)}</p><ul>${profile.dimensions.map(d=>`<li><strong>${escape(d.title)}:</strong> ${d.score===null?'Not scored':d.score.toFixed(1)+' / 5'}</li>`).join('')}</ul><h4>Questions for the business evidence</h4><ol>${profile.priorities.map(item=>`<li>${escape(item.action)} <strong>Measure:</strong> ${escape(item.metric)}</li>`).join('')}</ol><p><a href="assessment-center.html?result=${encodeURIComponent(record.id)}">Return to assessment report and action plan</a></p>`;
  };
  select.addEventListener('change',show);
  const requested=new URLSearchParams(location.search).get('assessment-result');
  const index=records.findIndex(record=>record.id===requested);
  if (index>=0) { select.value=String(index);root.open=true;show(); }
}

/** Open an existing tool from a recommendation; URLs never carry user evidence. */
export function applyAssessmentLink({ document, location, Event, setStatus }) {
  const params = new URLSearchParams(location.search);
  const mode = params.get('mode');
  if (!['data', 'calculator', 'case'].includes(mode)) return false;
  const modeButton = document.querySelector(`.lab-mode-switch [data-mode="${mode}"]`);
  if (!modeButton) return false;
  modeButton.click();

  const selector = mode === 'calculator' ? document.getElementById('metric-select')
    : mode === 'case' ? document.querySelector('[data-strategy-selector]')
      : document.getElementById('stat-method');
  const requested = params.get(mode === 'calculator' ? 'metric' : mode === 'case' ? 'tool' : 'analysis');
  if (!requested || !selector) return true;
  const option = Array.from(selector.options).find(item => item.value === requested && item.value);
  if (!option) {
    setStatus('The requested tool was not recognized. Choose an available tool below.');
    return true;
  }
  selector.value = requested;
  selector.dispatchEvent(new Event('change', { bubbles: true }));
  const label = option.textContent.trim();
  setStatus(mode === 'data'
    ? `${label} selected. Load suitable data or a clearly labeled sample, then review the method assumptions before running it. No assessment responses have been transferred.`
    : `${label} opened from a recommendation. Enter and review the relevant evidence; no assessment responses have been transferred.`);
  return true;
}
