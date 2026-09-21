import { industries, sizes } from './personalization.mjs';

const fields = ['industry', 'organizationType', 'size', 'marketType', 'customerType', 'geography', 'years', 'channels'];
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function cleanMarketingContext(input = {}) {
  const context = Object.fromEntries(fields.map(key => [key, typeof input[key] === 'string' ? input[key].trim().slice(0, 300) : '']));
  if (!industries.some(item => item.id === context.industry)) context.industry = '';
  if (!sizes.some(item => item.id === context.size)) context.size = '';
  if (!['B2B', 'B2C', 'Both', 'Community / beneficiaries'].includes(context.marketType)) context.marketType = '';
  if (!/^\d{1,3}$/.test(context.years)) context.years = '';
  return context;
}
export function marketingContextSignature(input) {
  return `marketing-context-v1:${JSON.stringify(cleanMarketingContext(input))}`;
}
export function marketingContextHTML(input, locked = false) {
  const value = cleanMarketingContext(input);
  const disabled = locked ? ' disabled' : '';
  const select = (key, label, options) => `<label>${label}<select data-marketing-context="${key}"${disabled}><option value="">Prefer not to specify</option>${options.map(item => `<option value="${escape(item.id)}"${value[key] === item.id ? ' selected' : ''}>${escape(item.label)}</option>`).join('')}</select></label>`;
  const text = (key, label, placeholder) => `<label>${label}<input data-marketing-context="${key}" maxlength="300" value="${escape(value[key])}" placeholder="${placeholder}"${disabled}></label>`;
  return `<details id="marketing-context"><summary>Optional organization context</summary><p>These details help make actions practical for your organization. They do not change your questions or score. Leave any field blank.</p><div class="ac-form-grid">${select('industry','Industry',industries)}${text('organizationType','Organization type','e.g. nonprofit, contractor, family business')}${select('size','Organization size',sizes)}${select('marketType','Who do you serve?',['B2B','B2C','Both','Community / beneficiaries'].map(id=>({id,label:id})))}${text('customerType','Primary customer type','e.g. local homeowners, members, purchasing teams')}${text('geography','Geographic market','e.g. one neighborhood, regional, international')}<label>Years in operation<input type="number" min="0" max="999" step="1" data-marketing-context="years" value="${escape(value.years)}"${disabled}></label>${text('channels','Primary marketing channels','e.g. referrals, search, email, local events')}</div>${locked?'<p>Context is fixed for these recorded responses. Start a new assessment to compare a different organization or situation.</p>':''}</details>`;
}
