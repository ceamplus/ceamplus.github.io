import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { assessments, getAssessment } from '../js/assessments/definitions.mjs';
import { metricDefinitions } from '../js/analytics/metrics.mjs';

const root = new URL('../', import.meta.url);
const source = (path) => readFileSync(new URL(path, root), 'utf8');
const requestedDimensions = {
  'marketing-readiness': ['Customer Knowledge', 'Segmentation & Targeting', 'Positioning & Value Proposition', 'Market Research Maturity', 'Marketing Analytics', 'CRM & Retention', 'Channel Strategy', 'Performance Measurement', 'Competitive Awareness', 'Marketing Capabilities'],
  'customer-insight': ['Needs & Problems', 'Motivations', 'Purchase Behavior', 'Customer Journey', 'Barriers & Friction', 'Satisfaction', 'Loyalty & Retention', 'Switching Behavior', 'Customer Value', 'Voice of Customer', 'Qualitative Research Capability', 'Quantitative Research Capability', 'Customer Data Integration', 'Insight-to-Action Capability'],
  'analytics-data': ['Data Availability', 'Data Quality', 'Data Governance', 'Integration', 'KPI Discipline', 'Dashboard Use', 'Descriptive Analytics', 'Diagnostic Analytics', 'Predictive Analytics', 'Prescriptive Analytics', 'Statistical Capability', 'Forecasting', 'Experimentation', 'Data Visualization', 'Decision Integration', 'Skills & Literacy', 'Technology', 'Data Culture'],
  'ai-adoption': ['Technology Readiness', 'Organizational Readiness', 'Environmental Conditions', 'AI Literacy', 'Use-Case Clarity', 'Financial Readiness', 'Privacy & Security', 'Integration Readiness', 'Leadership Support', 'Employee Adoption', 'Trust', 'Perceived Control', 'Human-AI Role Clarity', 'Governance', 'Expected Value', 'Implementation Capacity'],
  'change-readiness': ['Willingness', 'Resistance', 'Trust', 'Perceived Control', 'Communication', 'Leadership', 'Purpose Clarity', 'Resources', 'Skills', 'Organizational Culture', 'Psychological Safety', 'Participation', 'Implementation Capacity', 'Change Fatigue', 'Structural Barriers', 'Sustainability'],
  'customer-adoption': ['Perceived Value', 'Perceived Usefulness', 'Ease of Use', 'Trust', 'Perceived Risk', 'Switching Costs', 'Awareness', 'Understanding', 'Trialability', 'Compatibility', 'Social Influence', 'Willingness to Try', 'Purchase Intent', 'Repeat Use Intent', 'Recommendation Intent', 'Continued Adoption'],
  'organizational-readiness': ['People', 'Leadership', 'Strategy', 'Processes', 'Technology', 'Data', 'Financial Resources', 'Skills', 'Governance', 'Culture', 'Communication', 'Decision Rights', 'Change Capability', 'Implementation Capacity', 'Measurement', 'Learning Capability'],
  'strategic-marketing': ['SWOT Quality', 'Porter’s Five Forces', 'Segmentation', 'Targeting', 'Positioning', 'Value Proposition', 'Product Strategy', 'Pricing Strategy', 'Place / Distribution', 'Promotion', 'People / Process / Physical Evidence', 'Competitive Advantage', 'Market Attractiveness', 'Growth Opportunities', 'Ansoff Options', 'Strategic Alignment', 'Measurement'],
  'financial-marketing': ['Revenue Growth', 'Gross Margin', 'Contribution Margin', 'Profitability', 'Market Share', 'Customer Acquisition Cost', 'Customer Lifetime Value', 'CLV:CAC', 'Retention', 'Churn', 'Conversion', 'Average Order Value', 'Break-Even', 'ROMI', 'ROAS', 'CAC Payback', 'Budget vs Actual', 'Forecast Accuracy', 'Segment Profitability', 'Channel Profitability', 'Campaign Performance', 'Measurement Discipline'],
  'sustainability-resilience': ['Financial Resilience', 'Revenue Concentration', 'Customer Dependence', 'Supplier Dependence', 'Technology Dependence', 'Workforce Resilience', 'Operational Flexibility', 'Market Adaptability', 'Scenario Preparedness', 'Learning Capability', 'Ethical Considerations', 'Social Impact', 'Environmental Considerations', 'Long-Term Viability', 'Risk Management', 'Recovery Capability'],
  'agency-trust': ['Information Quality', 'Transparency', 'Choice', 'Voice', 'Perceived Control', 'Reversibility', 'Consent', 'Trust', 'Reliability', 'Competence', 'Benevolence / Stakeholder Regard', 'Risk Awareness', 'Dependency', 'Human Oversight', 'Contestability', 'Agency Preservation'],
  'personal-change': ['Purpose', 'Readiness', 'Willingness', 'Confidence', 'Knowledge', 'Resources', 'Support', 'Perceived Control', 'Barriers', 'Risk', 'Habits', 'Environment', 'Sustainability', 'Learning', 'Reflection'],
};
const dimension = (assessmentID, dimensionID) => getAssessment(assessmentID).dimensions.find(d => d.id === dimensionID);
const questions = (assessmentID, dimensionID) => dimension(assessmentID, dimensionID).questions.map(q => q.text).join(' ');

test('all twelve original assessments and every original dimension remain present', () => {
  const original = assessments.filter(a=>a.id !== 'marketing-assessment');
  assert.deepEqual(original.map(a => a.id).sort(), Object.keys(requestedDimensions).sort());
  for (const [id, expected] of Object.entries(requestedDimensions)) {
    const item = getAssessment(id);
    assert.equal(item, assessments.find(a => a.id === id));
    assert.deepEqual(item.dimensions.map(d => d.title), expected, id);
  }
  assert.equal(getAssessment('unknown-assessment'), undefined);
  assert.equal(original.reduce((sum, a) => sum + a.dimensions.length, 0), 192);
  assert.equal(original.reduce((sum, a) => sum + a.dimensions.reduce((n, d) => n + d.questions.length, 0), 0), 385);
});

test('registry provides complete card, context, report and action-plan content', () => {
  const categories = new Set(['Marketing & Customer', 'Organization & Change', 'Data & Technology', 'Personal']);
  const ids = new Set();
  const questionIDs = new Set();
  for (const item of assessments) {
    assert.ok(!ids.has(item.id)); ids.add(item.id);
    assert.ok(categories.has(item.category), item.id);
    for (const field of ['title', 'purpose', 'audience', 'output', 'version', 'overallLabel']) {
      assert.ok(typeof item[field] === 'string' && item[field].trim(), `${item.id}.${field}`);
    }
    assert.ok(item.timeMinutes > 0 && item.retakeDays > 0);
    for (const field of ['evidence', 'contextOptions', 'limitations']) {
      assert.ok(Array.isArray(item[field]) && item[field].length, `${item.id}.${field}`);
      assert.ok(item[field].every(value => typeof value === 'string' && value.trim()));
    }
    const dimensionIDs = new Set();
    const questionTexts = new Set();
    for (const d of item.dimensions) {
      assert.ok(!dimensionIDs.has(d.id), `${item.id}: duplicate dimension ${d.id}`); dimensionIDs.add(d.id);
      assert.ok(typeof d.title === 'string' && d.title.trim().length > 2, `${item.id}.${d.id}.title`);
      for (const field of ['why', 'action', 'kpi', 'evidenceNeeded', 'followUp']) {
        assert.ok(typeof d[field] === 'string' && d[field].trim().length > 12, `${item.id}.${d.id}.${field}`);
      }
      assert.ok(Array.isArray(d.tools) && Array.isArray(d.surveys) && d.surveys.length);
      assert.ok(d.questions.length >= 2, `${item.id}.${d.id} needs complementary prompts`);
      for (const q of d.questions) {
        assert.ok(q.id.startsWith(`${item.id}-${d.id}-`));
        assert.ok(!questionIDs.has(q.id), `duplicate question ${q.id}`); questionIDs.add(q.id);
        assert.ok(!questionTexts.has(q.text), `repeated prompt within ${item.id}`); questionTexts.add(q.text);
        assert.ok(q.text.length > (item.fixedQuestions ? 15 : 40) && typeof q.allowNA === 'boolean');
      }
    }
  }
});

test('all scales are explicit, scores are bounded and question weights are positive', () => {
  const supported = new Set(['maturity', 'agreement', 'yes-partly-no', 'choice', 'evidence', 'numeric']);
  const encountered = new Set();
  for (const item of assessments) for (const d of item.dimensions) for (const q of d.questions) {
    assert.ok(supported.has(q.type), q.id); encountered.add(q.type);
    assert.ok(Number.isFinite(q.weight) && q.weight > 0, q.id);
    if (q.type === 'choice') {
      assert.ok(q.options.length >= 2);
      assert.equal(new Set(q.options.map(o => o.value)).size, q.options.length);
      for (const option of q.options) {
        assert.ok(typeof option.value === 'string' && option.label);
        assert.ok(Number.isFinite(option.score) && option.score >= 0 && option.score <= 100);
      }
    }
    if (q.type === 'numeric') {
      assert.ok(q.numericScore && q.numericScore.max > q.numericScore.min);
    }
  }
  for (const type of ['maturity', 'agreement', 'yes-partly-no', 'choice', 'evidence']) assert.ok(encountered.has(type));
});

test('weights differ by assessment and every effective weight is documented', () => {
  const register = source('docs/assessment-content.md');
  const profiles = new Set();
  for (const item of assessments) {
    if (!item.fixedQuestions) assert.ok(new Set(item.dimensions.map(d => d.weight)).size > 1, item.id);
    profiles.add(JSON.stringify(item.dimensions.map(d => d.weight)));
    const total = item.dimensions.reduce((n, d) => n + d.weight, 0);
    for (const d of item.dimensions) {
      assert.ok(Number.isFinite(d.weight) && d.weight > 0);
      assert.ok(Number.isFinite(d.importance) && d.importance >= 1 && d.importance <= 5);
      assert.ok(Number.isFinite(d.risk) && d.risk >= 1 && d.risk <= 5);
      const row = `| ${d.title} | ${d.weight} | ${(d.weight / total * 100).toFixed(1)}% | ${d.importance} | ${d.risk} |`;
      assert.ok(register.includes(row), `undocumented settings: ${item.id}.${d.id}`);
    }
  }
  assert.equal(profiles.size, assessments.length, 'do not apply the same dimension-weight profile to all assessments');
});

test('analytics links reference existing calculators, worksheets and page anchors', () => {
  const metricIDs = new Set(metricDefinitions.map(d => d.id));
  const strategyList = source('js/analytics/strategy.mjs').match(/const tools = \[([\s\S]*?)\n\];/)[1];
  const worksheetIDs = new Set([...strategyList.matchAll(/\['([^']+)',/g)].map(match => match[1]));
  const analyticsPage = source('analytics-lab.html');
  for (const item of assessments) for (const d of item.dimensions) for (const link of d.tools) {
    assert.ok(link.label && link.href);
    const url = new URL(link.href, 'https://ceamplus.github.io/');
    assert.equal(url.origin, 'https://ceamplus.github.io');
    assert.equal(url.pathname, '/analytics-lab.html');
    assert.ok(existsSync(fileURLToPath(new URL(url.pathname.slice(1), root))));
    const params = url.searchParams;
    if (params.get('mode') === 'calculator') assert.ok(metricIDs.has(params.get('metric')), link.href);
    if (params.get('mode') === 'case') assert.ok(worksheetIDs.has(params.get('tool')), link.href);
    if (params.has('analysis')) assert.equal(params.get('analysis'), 'forecast');
    if (url.hash) assert.ok(analyticsPage.includes(`id="${url.hash.slice(1)}"`), link.href);
    for (const key of params.keys()) assert.ok(['mode', 'metric', 'tool', 'analysis'].includes(key), 'responses must not be included in tool links');
  }
});

test('supporting surveys use existing context routes and do not invent standalone instruments', () => {
  const contexts = new Set(['personal', 'business', 'education', 'healthcare', 'rehabilitation']);
  assert.ok(existsSync(new URL('surveys.html', root)));
  for (const item of assessments) for (const d of item.dimensions) for (const link of d.surveys) {
    const url = new URL(link.href, 'https://ceamplus.github.io/');
    assert.equal(url.pathname, '/surveys.html');
    assert.ok(contexts.has(url.searchParams.get('context')));
    assert.equal([...url.searchParams.keys()].join(), 'context');
    assert.match(link.label, /survey:.*(prompts|discuss)/i);
  }
});

test('cross-dimension pattern conditions reference real dimensions and remain qualified', () => {
  for (const item of assessments) for (const pattern of item.patterns || []) {
    const ids = new Set(item.dimensions.map(d => d.id));
    assert.ok(pattern.label.length > 30);
    assert.ok(Array.isArray(pattern.high) && Array.isArray(pattern.low));
    assert.ok(pattern.high.length + pattern.low.length > 0);
    for (const id of [...pattern.high, ...pattern.low]) assert.ok(ids.has(id), `${item.id}: missing pattern dimension ${id}`);
    assert.ok(!pattern.high.some(id => pattern.low.includes(id)));
    assert.match(pattern.label, /appear|investigate|check/i);
  }
  assert.equal(getAssessment('ai-adoption').patterns.length, 5);
});

test('customer risk separates five risk topics and marketing links include financial analysis', () => {
  const risk = questions('customer-adoption', 'risk');
  for (const topic of ['financial', 'performance', 'privacy', 'social', 'time', 'convenience']) assert.match(risk.toLowerCase(), new RegExp(topic));
  assert.ok(dimension('customer-adoption', 'risk').questions.length >= 3);
  const metricIDs = dimension('marketing-readiness', 'measurement').tools.map(t => new URL(t.href, 'https://example.test').searchParams.get('metric'));
  for (const id of ['cac', 'clv_margin', 'romi_contribution', 'breakeven', 'operating_profit']) assert.ok(metricIDs.includes(id));
  assert.ok(getAssessment('customer-insight').dimensions.some(d => d.tools.some(t => /RFM/.test(t.label))));
});

test('financial scores describe measurement and do not mix performance values into maturity', () => {
  const financial = getAssessment('financial-marketing');
  assert.match(financial.overallLabel, /measurement capability/i);
  assert.match(financial.limitations.join(' '), /strong measurement can coexist with weak results/i);
  assert.match(financial.limitations.join(' '), /no universal good/i);
  assert.ok(financial.dimensions.every(d => d.questions.every(q => q.type !== 'numeric')));
  assert.match(questions('financial-marketing', 'romi'), /incremental contribution/i);
  assert.match(questions('financial-marketing', 'roas'), /distinguish ROAS from profit/i);
});

test('resistance, dependency and personal prompts preserve conditions and positive score direction', () => {
  assert.match(questions('change-readiness', 'resistance'), /constructively.*investigate/i);
  assert.match(getAssessment('change-readiness').limitations.join(' '), /signal.*investigate.*not a diagnosis/i);
  assert.match(questions('agency-trust', 'dependency'), /prevented.*fallback or exit route/i);
  assert.match(getAssessment('agency-trust').limitations.join(' '), /not a person.s character/i);
  const personal = getAssessment('personal-change');
  assert.match(personal.limitations.join(' '), /not a medical, psychological or diagnostic instrument/i);
  assert.match(personal.limitations.join(' '), /structural constraints.*despite strong motivation/i);
  assert.match(personal.limitations.join(' '), /Pausing.*not to proceed can be reasonable/i);
  assert.ok(personal.dimensions.every(d => d.questions[0].type === 'agreement'));
});

test('advanced analytics permits justified exclusion while foundations remain relevant', () => {
  for (const id of ['predictive', 'prescriptive', 'forecasting']) {
    assert.ok(dimension('analytics-data', id).questions.every(q => q.allowNA), id);
  }
  assert.ok(dimension('analytics-data', 'quality').questions.every(q => !q.allowNA));
  assert.match(getAssessment('analytics-data').limitations.join(' '), /simple, reliable metric may answer the decision well/i);
});

test('initiative and agency context choices cover the requested application settings', () => {
  assert.deepEqual(getAssessment('organizational-readiness').contextOptions, ['New marketing strategy', 'New technology', 'AI implementation', 'CRM deployment', 'New product', 'Geographic expansion', 'Organizational change']);
  assert.deepEqual(getAssessment('agency-trust').contextOptions, ['Customer', 'Employee', 'Technology user', 'AI user', 'Student', 'Organization stakeholder', 'Other']);
  assert.ok(getAssessment('organizational-readiness').dimensions.some(d => d.questions.some(q => q.text.includes('{initiative}'))));
  assert.ok(getAssessment('agency-trust').dimensions.some(d => d.questions.some(q => q.text.includes('{context}'))));
});
