/**
 * Conceptual CEAM+ metadata. These labels organize interpretation and future
 * research; they are not empirically validated factors or psychometric claims.
 */
export const CEAM_DIMENSIONS = Object.freeze({
  C: { code: 'C', name: 'Cognitive', short: 'What people understand and perceive', definition: 'Knowledge, understanding, beliefs, expectations, interpretation, perceived value, perceived risk, and mental models.' },
  E: { code: 'E', name: 'Ethical', short: 'Trust, fairness, responsibility, and agency', definition: 'Fairness, transparency, privacy, consent, accountability, human agency, contestability, reversibility, and oversight.' },
  A: { code: 'A', name: 'Adoption', short: 'Willingness and ability to use or accept', definition: 'Willingness, resistance, trial, purchase, implementation, continued use, recommendation, and participation.' },
  M: { code: 'M', name: 'Model', short: 'Whether the underlying system can work', definition: 'Business, operational, financial, analytical, organizational, and technological feasibility and capability.' },
  '+': { code: '+', name: 'Plus', short: 'Context, uncertainty, external forces, and anomalies', definition: 'Specific contextual conditions that can materially change interpretation, including regulation, culture, markets, dependencies, shocks, structural barriers, weak signals, and emerging conditions.' },
});

const variable = (id, name, settings) => ({ id, name, ...settings });

export const VARIABLE_CATALOG = Object.freeze([
  variable('privacy-permission', 'Privacy and permission', {
    keywords: ['privacy', 'consent', 'permission', 'data-use', 'data use', 'legal'], primary: 'E', secondary: ['M', 'A'], type: 'decision_sensitive',
    definition: 'Whether information may be collected, used, shared, or retained with appropriate authority, consent, and safeguards.',
    guidance: 'A low or unknown finding may constrain an otherwise capable initiative. Confirm the applicable rules, permissions, and stakeholder expectations.',
    sensitivity: 'A change in legal permission, consent, or data-use scope could materially change feasibility.', evidenceType: 'documented', outcomes: ['Implementation feasibility', 'Trust', 'Adoption willingness'], segments: ['Affected data subjects', 'Customers', 'Employees'],
    planningRule: { gate: true, threshold: 50, rationale: 'CEAM+ planning rule: unresolved privacy or permission conditions should be investigated before a favorable average is treated as sufficient.' },
  }),
  variable('safety-accountability', 'Safety and accountability', {
    keywords: ['safety', 'harm', 'accountab', 'oversight', 'human review', 'responsib', 'audit'], primary: 'E', secondary: ['M'], type: 'decision_sensitive',
    definition: 'Whether responsibility, review, escalation, and protection from foreseeable harm are clear and workable.',
    guidance: 'Strong procedures should be supported by named owners and records. Missing accountability can change whether implementation is prudent.',
    sensitivity: 'A serious incident, unclear owner, or ineffective escalation path could materially change the conclusion.', evidenceType: 'documented', outcomes: ['Responsible implementation', 'Risk control', 'Stakeholder protection'], segments: ['Decision owners', 'Affected stakeholders'],
    planningRule: { gate: true, threshold: 50, rationale: 'CEAM+ planning rule: safety and accountability conditions below the midpoint require explicit review; this is not an empirically validated cutoff.' },
  }),
  variable('trust', 'Trust', {
    keywords: ['trust', 'credible', 'credibility', 'believab'], primary: 'E', secondary: ['C', 'A', 'M'], type: 'cross_dimension',
    definition: 'A reasoned willingness to rely on a person, organization, process, or system under conditions of uncertainty.',
    guidance: 'High trust may support adoption, but it does not prove reliability. Low trust may reflect experience, uncertainty, power, or missing evidence.',
    sensitivity: 'Trust may change when explanations, observed reliability, accountability, or direct experience change.', evidenceType: 'self_report', outcomes: ['Adoption willingness', 'Verification behavior', 'Implementation participation'], segments: ['Customers', 'Employees', 'Decision makers'],
  }),
  variable('agency-control', 'Agency and perceived control', {
    keywords: ['agency', 'control', 'choice', 'voice', 'autonom', 'opt-out', 'contest', 'reversib'], primary: 'E', secondary: ['A', 'C'], type: 'cross_dimension',
    definition: 'The meaningful ability to understand options, influence a decision, question it, change course, or decline participation.',
    guidance: 'Reported choice should be checked against actual authority, consequences, and available alternatives.',
    sensitivity: 'Changes in authority, reversibility, opt-out conditions, or retaliation risk may alter the interpretation.', evidenceType: 'self_report', outcomes: ['Participation', 'Psychological ownership', 'Sustained adoption'], segments: ['Affected participants', 'Managers', 'Customers'],
  }),
  variable('adoption-willingness', 'Adoption willingness', {
    keywords: ['willing', 'adopt', 'accept', 'trial', 'try ', 'continued use', 'recommend', 'participat', 'purchase intent', 'intention'], primary: 'A', secondary: ['C', 'E'], type: 'core',
    definition: 'The reported or observed readiness to try, accept, purchase, implement, continue, or recommend a change.',
    guidance: 'Willingness is not the same as behavior. Compare intention with access, opportunity, observed use, and continued voluntary participation.',
    sensitivity: 'Perceived value, trust, risk, effort, resources, or experience may change willingness.', evidenceType: 'self_report', outcomes: ['Initial adoption', 'Continued use', 'Recommendation'], segments: ['Potential adopters', 'Current users', 'Non-users'],
  }),
  variable('resistance', 'Resistance', {
    keywords: ['resist', 'pushback', 'reluctan', 'hesitat', 'disengag', 'abandon'], primary: 'A', secondary: ['E', 'C', '+'], type: 'cross_dimension',
    definition: 'Delay, disagreement, refusal, modification, or protective pushback in response to a proposed change.',
    guidance: 'Resistance can signal risk, poor fit, limited resources, lack of voice, or a useful challenge. Do not infer motive or personal failure.',
    sensitivity: 'New evidence, resource changes, reduced coercion, or changed consequences may alter the response.', evidenceType: 'behavioral', outcomes: ['Implementation participation', 'Modification', 'Delay or non-adoption'], segments: ['Participants', 'Non-adopters', 'Frontline roles'],
  }),
  variable('knowledge-understanding', 'Knowledge and understanding', {
    keywords: ['understand', 'knowledge', 'aware', 'literacy', 'explain', 'mental model', 'comprehend', 'clarity'], primary: 'C', secondary: ['A'], type: 'core',
    definition: 'What people know, believe they know, and can accurately explain about a decision, offering, process, or technology.',
    guidance: 'Self-reported understanding should be compared with explanation quality or task evidence where the decision matters.',
    sensitivity: 'Information quality, experience, training, complexity, and misinformation may change understanding.', evidenceType: 'self_report', outcomes: ['Decision quality', 'Appropriate use', 'Learning'], segments: ['Novice users', 'Experienced users', 'Decision makers'],
  }),
  variable('perceived-value', 'Perceived value', {
    keywords: ['value proposition', 'perceived value', 'benefit', 'useful', 'usefulness', 'relevant difference', 'customer value'], primary: 'C', secondary: ['A', 'M'], type: 'cross_dimension',
    definition: 'The perceived balance of relevant benefits, costs, effort, alternatives, and consequences.',
    guidance: 'High perceived value can support interest, but feasibility, trust, access, and actual outcomes still require evidence.',
    sensitivity: 'Price, effort, alternatives, experience, or changing priorities may alter perceived value.', evidenceType: 'self_report', outcomes: ['Purchase consideration', 'Adoption willingness', 'Retention'], segments: ['Target customers', 'Current users'],
  }),
  variable('perceived-risk', 'Perceived risk', {
    keywords: ['risk', 'uncertain', 'concern', 'fear', 'consequence', 'vulnerab', 'threat'], primary: 'C', secondary: ['E', 'A', '+'], type: 'cross_dimension',
    definition: 'A person’s interpretation of the likelihood and consequence of possible loss, harm, failure, or uncertainty.',
    guidance: 'Perceived risk is meaningful evidence about interpretation; compare it with documented hazards, experience, and who bears the consequences.',
    sensitivity: 'New incidents, safeguards, reversibility, direct experience, or clearer evidence may change perceived risk.', evidenceType: 'self_report', outcomes: ['Adoption willingness', 'Verification', 'Protective resistance'], segments: ['Affected stakeholders', 'Potential adopters'],
  }),
  variable('customer-understanding', 'Customer understanding', {
    keywords: ['customer need', 'customer insight', 'customer research', 'journey', 'pain point', 'motivation', 'buyer', 'nonbuyer', 'voice of customer'], primary: 'C', secondary: ['M', 'A'], type: 'core',
    definition: 'Current, traceable knowledge of customer needs, differences, behavior, experience, and alternatives.',
    guidance: 'Strong understanding uses recent evidence from relevant groups and connects findings to a decision.',
    sensitivity: 'Nonresponse, a changing market, weak segment definitions, or contradictory behavior may change the interpretation.', evidenceType: 'customer', outcomes: ['Customer relevance', 'Positioning', 'Marketing decisions'], segments: ['Customer groups', 'Buyers and nonbuyers'],
  }),
  variable('financial-feasibility', 'Financial feasibility', {
    keywords: ['financial', 'profit', 'margin', 'budget', 'cost', 'revenue', 'cash', 'break-even', 'romi', 'roas', 'cac', 'clv'], primary: 'M', secondary: ['+'], type: 'decision_sensitive',
    definition: 'Whether expected costs, resources, cash timing, contribution, and plausible benefits support a workable decision.',
    guidance: 'Use comparable definitions and scenarios. Missing or fragile financial assumptions can constrain an otherwise attractive initiative.',
    sensitivity: 'Price, volume, cost, retention, timing, and attribution assumptions can materially change feasibility.', evidenceType: 'financial', outcomes: ['Feasibility', 'Investment capacity', 'Sustainability'], segments: ['Business units', 'Customer groups'],
    planningRule: { gate: true, threshold: 40, rationale: 'CEAM+ planning rule: severely underdeveloped financial feasibility warrants investigation before scale; the threshold is not an empirical benchmark.' },
  }),
  variable('data-readiness', 'Data readiness', {
    keywords: ['data readiness', 'data quality', 'data access', 'dataset', 'records', 'crm', 'missing data', 'integration', 'interoperab'], primary: 'M', secondary: ['E', '+'], type: 'decision_sensitive',
    definition: 'Whether relevant data are available, usable, appropriately governed, sufficiently complete, and fit for the intended analysis or operation.',
    guidance: 'Volume alone does not establish readiness. Confirm definitions, permissions, coverage, quality, and fitness for the decision.',
    sensitivity: 'Access, quality, permissions, missing populations, or integration failure can materially change the conclusion.', evidenceType: 'operational', outcomes: ['Analytical validity', 'Implementation feasibility', 'Measurement'], segments: ['Data owners', 'Affected populations'],
    planningRule: { gate: true, threshold: 40, rationale: 'CEAM+ planning rule: critically weak data conditions require investigation before data-dependent implementation; this is not a validated cutoff.' },
  }),
  variable('measurement-capability', 'Measurement capability', {
    keywords: ['measure', 'metric', 'kpi', 'analytics', 'statistic', 'forecast', 'attribution', 'dashboard', 'baseline', 'follow-up'], primary: 'M', secondary: ['C'], type: 'core',
    definition: 'The ability to define, collect, compare, interpret, and act on evidence using methods appropriate to the question.',
    guidance: 'A dashboard or calculation is useful only when definitions, populations, periods, assumptions, and decision use are clear.',
    sensitivity: 'Definition changes, missing data, attribution assumptions, or measurement error may alter the result.', evidenceType: 'operational', outcomes: ['Learning', 'Decision quality', 'Accountability'], segments: ['Decision teams', 'Measured populations'],
  }),
  variable('implementation-capacity', 'Implementation capacity', {
    keywords: ['capacity', 'capabilit', 'resource', 'staff', 'skill', 'training', 'time', 'workflow', 'process', 'infrastructure', 'technology readiness', 'operational'], primary: 'M', secondary: ['A', '+'], type: 'core',
    definition: 'The people, skills, time, authority, processes, tools, and resources required to carry out and sustain a change.',
    guidance: 'Favorable attitudes cannot compensate for absent opportunity or capacity. Check funded resources and actual authority.',
    sensitivity: 'Staffing, workload, access, leadership support, timing, or infrastructure changes may alter feasibility.', evidenceType: 'operational', outcomes: ['Implementation quality', 'Sustained adoption', 'Operational resilience'], segments: ['Teams', 'Departments', 'Locations'],
  }),
  variable('leadership-support', 'Leadership support', {
    keywords: ['leader', 'management', 'sponsor', 'owner', 'governance'], primary: 'M', secondary: ['E', 'A'], type: 'cross_dimension',
    definition: 'Visible, credible decisions, resources, accountability, and behavior from people with responsibility and authority.',
    guidance: 'Messages alone are weak evidence. Compare stated support with decisions, resources, consistency, and consequences for speaking up.',
    sensitivity: 'Resource decisions, leadership turnover, inconsistent behavior, or retaliation may change the interpretation.', evidenceType: 'observational', outcomes: ['Trust', 'Implementation capacity', 'Participation'], segments: ['Leaders', 'Managers', 'Employees'],
  }),
  variable('external-context', 'External and structural context', {
    keywords: ['regulat', 'economic', 'competitor', 'market condition', 'external', 'culture', 'social condition', 'shock', 'dependency', 'structural barrier', 'policy'], primary: '+', secondary: ['M', 'A'], type: 'contextual',
    definition: 'A specified external, structural, cultural, market, regulatory, or dependency condition that can alter what is feasible or how evidence should be interpreted.',
    guidance: 'Name the condition and its mechanism. Do not use Plus as a general miscellaneous category.',
    sensitivity: 'A regulatory, market, cultural, dependency, or structural change may alter the recommendation.', evidenceType: 'external', outcomes: ['Feasibility', 'Risk', 'Opportunity'], segments: ['Markets', 'Regions', 'Regulated groups'],
    plusReason: 'Assigned to Plus because the question concerns a specific external or structural condition that can change the meaning or feasibility of the assessed system.',
  }),
  variable('resilience-sustainability', 'Resilience and sustainability', {
    keywords: ['resilien', 'sustainab', 'recover', 'adapt', 'long-term', 'flourish', 'environmental impact'], primary: '+', secondary: ['M', 'E'], type: 'contextual',
    definition: 'The ability to continue, recover, adapt, and produce durable human, organizational, financial, and environmental value over time.',
    guidance: 'A strong short-term result may still be fragile. Examine resource depletion, unequal burdens, recovery capacity, and delayed effects.',
    sensitivity: 'External shocks, resource limits, burnout, delayed harms, or changing dependencies may alter sustainability.', evidenceType: 'observational', outcomes: ['Durability', 'Recovery', 'Human and environmental outcomes'], segments: ['Affected stakeholders', 'Teams', 'Communities'],
    plusReason: 'Assigned to Plus because the question concerns longer-term context, external conditions, or outcomes that can change interpretation beyond the immediate model.',
  }),
]);

const fallbackVariable = (dimension = {}) => variable(`assessment-${dimension.id || 'condition'}`, dimension.title || 'Assessment condition', {
  primary: inferFallbackDimension(dimension), secondary: [], type: 'core',
  definition: `The reported conditions represented by the ${dimension.title || 'assessment'} indicator group.`,
  guidance: 'Interpret the responses with their evidence, context, and alternative explanations rather than treating the score as a diagnosis.',
  sensitivity: 'Different evidence, respondents, definitions, resources, or context may change the interpretation.',
  evidenceType: 'self_report', outcomes: ['Decision quality'], segments: ['Relevant participants'],
});

function inferFallbackDimension(dimension) {
  const text = `${dimension.id || ''} ${dimension.title || ''}`.toLowerCase();
  if (/trust|ethic|agency|privacy|fair|accountab/.test(text)) return 'E';
  if (/adopt|resist|willing|accept|retention|loyal|switch|engage/.test(text)) return 'A';
  if (/knowledge|insight|understand|awareness|perception|research|need|motivation|value|risk/.test(text)) return 'C';
  if (/environment|regulat|culture|resilien|sustainab|external/.test(text)) return '+';
  return 'M';
}

const clean = value => String(value || '').toLowerCase().replace(/[’']/g, '');
const importance = weight => weight >= 4 ? 'high' : weight >= 2 ? 'moderate' : 'low';

export function classifyQuestion(question, context = {}) {
  const haystack = clean(`${question.text} ${context.dimension?.id} ${context.dimension?.title}`);
  const matched = VARIABLE_CATALOG.find(item => item.keywords.some(keyword => haystack.includes(clean(keyword)))) || fallbackVariable(context.dimension);
  const secondary = [...new Set(matched.secondary || [])].filter(code => code !== matched.primary);
  const plusReason = matched.primary === '+' || secondary.includes('+')
    ? matched.plusReason || `Plus is included because ${matched.name.toLowerCase()} may depend on a specific contextual, structural, or external condition described by this question.`
    : '';
  return {
    assessment: context.assessment?.title || '', assessmentId: context.assessment?.id || '',
    assessmentDimension: context.dimension?.title || '', assessmentDimensionId: context.dimension?.id || '',
    primaryCeamDimension: matched.primary, secondaryCeamDimensions: secondary,
    underlyingVariable: matched.name, variableId: matched.id, variableType: matched.type,
    evidenceType: matched.evidenceType, outcomesAffected: [...matched.outcomes], segmentsRelevant: [...matched.segments],
    strategicImportance: importance(context.dimension?.weight || question.weight || 1),
    evidenceConfidence: null, uncertainty: null,
    definition: matched.definition, interpretationGuidance: matched.guidance, sensitivityNotes: matched.sensitivity,
    plusReason, planningRule: matched.planningRule ? { ...matched.planningRule } : null,
    conceptualStatus: 'Defined CEAM+ variable; not a statistically discovered factor or validated construct.',
  };
}

export function validateQuestionMetadata(metadata) {
  if (!CEAM_DIMENSIONS[metadata.primaryCeamDimension]) return false;
  if (!Array.isArray(metadata.secondaryCeamDimensions) || metadata.secondaryCeamDimensions.some(code => !CEAM_DIMENSIONS[code])) return false;
  if ((metadata.primaryCeamDimension === '+' || metadata.secondaryCeamDimensions.includes('+')) && !metadata.plusReason) return false;
  return Boolean(metadata.underlyingVariable && metadata.variableType && metadata.definition && metadata.interpretationGuidance);
}

export function dimensionLabel(code) {
  const item = CEAM_DIMENSIONS[code];
  return item ? `${item.name}${code === '+' ? ' (+)' : ` (${code})`}` : code;
}
