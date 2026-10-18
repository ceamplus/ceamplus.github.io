/** Marketing-only decision support. Pure data; existing scorer validates answers. */
import { scoreAssessment, scoreQuestion } from './scoring.mjs';

const round = value => value === null ? null : Math.round((value + Number.EPSILON) * 10) / 10;
const average = values => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
const text = value => typeof value === 'string' ? value.trim() : '';
const evidenceLabels = { 'self-report': 'Self-reported assessment responses', organizational: 'Organizational data — user-declared', external: 'External market evidence — user-declared' };

/** Bands use the same one-decimal value shown to the reader, with no gaps. */
export function marketingMaturity(value) {
  if (!Number.isFinite(value) || value < 1 || value > 5) return 'Insufficient responses';
  const score = round(value);
  return score >= 4.6 ? 'Integrated' : score >= 4 ? 'Advanced' : score >= 3 ? 'Established' : score >= 2 ? 'Developing' : 'Foundational';
}

// Each item connects a specific response to a capability, action, metric and risk.
// There is deliberately no universal required target or industry score adjustment.
const item = (capability, action, metric, risk) => ({ capability, action, metric, risk });
const rules = [
  { focus: 'long-term marketing direction and its role in organizational decisions', followUp: 'Reassess after the next strategic planning review, or within 90 days.', sustain: 'Review one strategic market assumption against customer evidence before the next budget decision.', items: [
    item('alignment with long-term goals', 'Write a one-page link between one long-term organizational goal, a priority customer group and the marketing choice that supports it.', 'Priority marketing decisions explicitly linked to an organizational goal', 'Spending may serve disconnected activities rather than the organization’s long-term goals.'),
    item('marketing input into major decisions', 'Add customer and market implications to the next major business decision and name the person who provides that input.', 'Major decisions with documented market and customer input', 'Product, capacity or investment decisions may overlook customer demand.'),
    item('anticipation of market changes', 'Choose two market changes that could affect the next year and write the response that each would trigger.', 'Important market assumptions reviewed and decisions updated', 'The organization may react too late to changing demand or alternatives.'),
    item('deliberate market-shaping choices', 'Decide whether shaping customer expectations fits the organization’s goals; test one new value idea with customers only if that direction is useful.', 'Customer evidence informing the choice to respond to or shape a market', 'An unexamined choice between responding to and shaping demand can misdirect investment; a responsive strategy can be entirely appropriate.'),
    item('long-term marketing commitment', 'Reserve a proportionate amount of time and budget for one long-term customer or brand objective and review it alongside immediate results.', 'Marketing commitments reviewed against both current and long-term goals', 'Short spending cycles may interrupt capabilities and relationships that take time to develop.'),
  ] },
  { focus: 'customer needs, segments and reasons for choosing the organization', followUp: 'Reassess after five customer conversations or a segment review, normally within 60–90 days.', sustain: 'Check a currently accepted customer insight against recent buyers, non-buyers and customers who left.', items: [
    item('priority customer clarity', 'Describe one priority customer group using its needs, buying situation and value to the organization; check that description against recent customers.', 'Recent customers who match the documented priority group', 'Resources may be spread across groups the organization cannot serve well.'),
    item('understanding customer choice', 'Ask recent customers and lost prospects why they chose an option, and compare the answers with your assumed reasons.', 'Customer choice reasons confirmed by interviews or feedback', 'Messages may emphasize benefits that do not influence customer decisions.'),
    item('regular collection of customer needs', 'Schedule five short customer conversations and record recurring needs and unmet expectations in one shared place.', 'Recent customer conversations that inform a specific decision', 'Needs may be inferred from outdated assumptions or a small vocal group.'),
    item('recognition of different customer needs', 'Compare two customer groups and identify one need or service preference that differs between them.', 'Priority groups with documented differences in needs', 'One offer or message may fit one group while excluding another.'),
    item('use of customer information in decisions', 'Use a recent customer finding to change or confirm one marketing decision and record the reason.', 'Marketing decisions with a traceable customer insight', 'Customer information may be collected without changing choices.'),
  ] },
  { focus: 'awareness of competitive and wider external conditions', followUp: 'Review signals monthly and reassess within 90 days, or immediately after a material market change.', sustain: 'Review the most consequential external assumption and record what evidence would require a different decision.', items: [
    item('competitive monitoring', 'Compare three relevant alternatives on customer value, price and access; date the sources and identify one implication to investigate.', 'Relevant alternatives reviewed with current, dated sources', 'A substitute or competitor may change customer expectations before the organization notices.'),
    item('economic monitoring', 'Review one economic indicator relevant to your customers and test how a change could affect demand, price or payment behavior.', 'Demand or pricing assumptions reviewed against relevant economic evidence', 'Plans may rely on demand or affordability assumptions that no longer hold.'),
    item('sociocultural monitoring', 'Discuss one changing customer expectation or social trend with your priority customer group before changing the offer.', 'Customer expectation changes checked with the affected group', 'Messages or experiences may drift away from customer expectations.'),
    item('technological monitoring', 'Check one technology change affecting how customers find, buy or use your offer and decide whether a small adaptation is warranted.', 'Customer-facing technology assumptions reviewed for relevance', 'Changes in how customers access or compare offers may be missed.'),
    item('political and legal monitoring', 'Assign an owner to check authoritative updates relevant to marketing, service delivery and customer information, and record when specialist advice is needed.', 'Relevant external requirements reviewed by an identified owner', 'Unnoticed changes may invalidate marketing or operating assumptions.'),
  ] },
  { focus: 'a credible and understandable reason for customers to choose the offer', followUp: 'Reassess after a message or offer test, normally within 60 days.', sustain: 'Retest the claimed difference with a current customer group and check whether the delivered experience supports it.', items: [
    item('an understandable difference', 'Ask five customers to explain what makes the organization different in their own words, then simplify one unclear message.', 'Customers who can correctly describe the intended difference', 'Customers may see the offer as interchangeable and choose mainly on price.'),
    item('a clearly solved customer need', 'Link one product or service benefit to a specific customer need and test that link with customers.', 'Customers confirming the offer addresses the stated need', 'The offer may be well promoted without solving a valued problem.'),
    item('pricing that reflects customer value', 'Compare the price, customer-perceived benefits and cost to serve for one offer before testing a price or package change.', 'Contribution per offer alongside customer-perceived value', 'Pricing may either undermine sustainable delivery or discourage customers who would value a different offer.'),
    item('brand message consistency', 'Compare your three most-used customer touchpoints and align their promise, wording and supporting evidence.', 'Priority touchpoints communicating a consistent, supported promise', 'Inconsistent promises can weaken recognition and customer trust.'),
    item('a compelling competitive value proposition', 'Write one customer-specific reason to choose the organization, with proof and a comparison to the main alternative, then test it.', 'Target customers who recognize and value the stated advantage', 'A claimed advantage may not be relevant or credible to customers.'),
  ] },
  { focus: 'reliable implementation and alignment of the marketing mix', followUp: 'Review after one marketing cycle or 30 days; reassess within 60–90 days.', sustain: 'Review one completed marketing cycle for handoff failures, unnecessary work and alignment with the strategy.', items: [
    item('promotion aligned to strategy', 'Link the next promotion to one strategic objective and stop or adjust an activity that has no clear contribution.', 'Active promotions linked to a stated strategic objective', 'Busy promotional activity may consume resources without supporting the intended direction.'),
    item('channels that fit customer behavior', 'Ask the priority customer group how it prefers to find, buy and receive support, then focus one channel test on that behavior.', 'Qualified inquiries or conversions by relevant channel', 'Channel effort may fail to reach customers where they make decisions.'),
    item('alignment of product, price, place and promotion', 'Review one offer as a whole: what is delivered, its price, how customers access it and what promotion promises; fix one mismatch.', 'Marketing mix mismatches found and resolved before launch', 'A compelling promotion may fail because price, access or the delivered offer does not fit.'),
    item('clear marketing responsibilities', 'Name one accountable owner for each task in the next marketing cycle and agree the handoff and deadline.', 'Marketing tasks with an owner and on-time completion', 'Unclear responsibility may cause delays, duplicated work or missed customer follow-up.'),
    item('implementation of marketing plans', 'Choose one feasible marketing commitment, break it into weekly tasks and review completion against the original plan.', 'Planned marketing commitments completed on time', 'Strategic intentions may produce little customer or business value if they never reach execution.'),
  ] },
  { focus: 'retention, useful customer records and the value of existing relationships', followUp: 'Review after one normal repurchase or service cycle; reassess within 90 days where the cycle allows.', sustain: 'Compare one existing-customer group with another on retention, contribution and service experience before expanding acquisition spending.', items: [
    item('useful customer records', 'Audit a small sample of customer records for accurate contact details, relationship stage and service history; correct the most useful missing field.', 'Customer records complete enough for a defined service or retention task', 'Fragmented records can cause missed follow-up and repeated customer effort.'),
    item('intentional customer retention', 'Identify a recent group of customers who did not return, investigate why and test one appropriate follow-up or service improvement.', 'Retention or repeat purchase rate for a defined customer cohort', 'Acquisition spending may replace avoidable customer losses rather than create growth.'),
    item('understanding customer relationship value', 'Compare revenue or mission value, contribution and cost to serve for two existing customer groups before choosing where to invest.', 'Contribution or mission value and cost to serve by relationship group', 'Apparently valuable customers may absorb unsustainable service costs while other relationships are overlooked.'),
    item('customer feedback used for improvements', 'Choose one recurring customer complaint or request, assign an owner and check whether the resulting change improves the experience.', 'Repeat complaints or service issues after the selected improvement', 'Unresolved experience problems may reduce loyalty even when acquisition marketing works.'),
    item('relationship-building communication', 'Plan one useful, permission-respecting follow-up for an existing customer group at a relevant point in its service or buying cycle.', 'Repeat engagement, service resolution and retention after useful follow-up', 'Generic or mistimed communication may erode trust rather than deepen relationships.'),
  ] },
  { focus: 'reliable information and research that answer marketing decisions', followUp: 'Reassess after the next consequential research-supported decision, normally within 60–90 days.', sustain: 'Audit one recent decision for the quality, recency and practical use of its internal and external evidence.', items: [
    item('evidence used in important decisions', 'List the assumptions behind the next important marketing decision and find one reliable source that could confirm or challenge the most consequential assumption.', 'Important marketing decisions with documented supporting and conflicting evidence', 'Confident decisions may rest on unsupported assumptions.'),
    item('a defined research problem', 'Write the decision, uncertainty and question to answer before collecting new marketing information.', 'Research briefs with a defined decision and question', 'Research may produce interesting information that does not resolve the actual decision.'),
    item('use of internal marketing information', 'Review one existing sales, service or customer dataset to answer a specific marketing question and document its limitations.', 'Decisions informed by usable internal records', 'Useful patterns may remain hidden in information the organization already holds.'),
    item('use of external marketing information', 'Find a dated industry, competitor or market source relevant to one current decision, and compare its scope with your market.', 'Priority decisions with relevant, dated external evidence', 'An internal view alone may miss changes affecting demand and alternatives.'),
    item('information quality checks', 'Check the source, date, coverage and possible bias of the evidence behind one marketing decision before using it.', 'Important sources passing a documented relevance and quality check', 'Inaccurate or irrelevant information may give a misleading basis for action.'),
  ] },
  { focus: 'accountability for short-term outcomes and long-term marketing value', followUp: 'Review operating measures monthly and reassess after 90 days; allow a longer observation window for loyalty and brand change.', sustain: 'Review whether the dashboard changes decisions and balances current contribution with customer loyalty and longer-term brand value.', items: [
    item('clear marketing goals', 'Set one marketing goal with a baseline, target, owner and date that directly supports an organizational outcome.', 'Marketing goals with a defined baseline, target, owner and review date', 'Activity may be evaluated without agreement on what success means.'),
    item('tracking useful marketing measures', 'Choose three measures for the next marketing decision and record their definitions, sources and review schedule.', 'Decision-relevant measures updated with consistent definitions', 'The organization may not notice whether marketing changes are helping.'),
    item('connecting activity to outcomes', 'Trace one marketing activity through customer response to a business or mission outcome, recording alternative explanations for changes.', 'Marketing activities linked to an outcome with explicit attribution limits', 'Activity counts or attributed sales may be mistaken for value caused by marketing.'),
    item('appropriate review of marketing returns', 'For one relevant investment, reconcile marketing cost and incremental contribution; document assumptions and compare the result with retention and service outcomes.', 'Contribution-based ROMI where appropriate, with costs and incrementality assumptions disclosed', 'Spending decisions may ignore costs or confuse concurrent sales with incremental return; ROMI is only useful where inputs are meaningful.'),
    item('attention to loyalty and brand value', 'Add one longer-term customer or brand measure to the dashboard and review it alongside immediate sales and cost measures.', 'Cohort retention or customer loyalty, plus a consistent brand-awareness indicator where useful', 'Short-term returns may mask deterioration in loyalty, brand value or future demand.'),
  ] },
];

function contextFor(response) {
  const input = { ...(response.profile || {}), ...(response.marketingContext || {}) };
  const size = text(input.size || input.organizationSize).toLowerCase();
  const industry = text(input.industry || input.organizationType).toLowerCase();
  let scope = /micro|solo|small|1[–-]9|1[–-]10/.test(size) ? 'Keep this to one owner, one customer group and a simple shared record.' : /large|enterprise|corporat/.test(size) ? 'Pilot in one unit, agree common definitions across teams and scale only after reviewing the result.' : /medium|growing/.test(size) ? 'Assign one accountable owner and test with one team before extending across the organization.' : 'Choose a scope that fits available people, time and the customer decision cycle.';
  if (/nonprofit|non-profit|charit/.test(`${industry} ${text(input.organizationType).toLowerCase()}`)) scope += 'For a nonprofit, distinguish beneficiaries, donors and other supporters, and use mission value alongside financial sustainability.';
  else if (/restaurant|food/.test(industry)) scope += 'Use one dining occasion or service period and check repeat visits and service capacity.';
  else if (/contract|construction|service/.test(industry)) scope += 'Use one service or job type and check inquiry quality, delivery capacity and repeat or referral relationships.';
  else if (/retail/.test(industry)) scope += 'Use one product category and consider availability, buying access and repeat customers.';
  if (text((input.primaryCustomerType||input.customerType))) scope += ` Start with the stated customer group: ${text((input.primaryCustomerType||input.customerType))}.`;
  if (text((input.geographicMarket||input.geography))) scope += ` Check relevance in the stated market: ${text((input.geographicMarket||input.geography))}.`;
  return { input, scope };
}

function declaredEvidence(response, id, coverage, sharedDimension) {
  const declared = response.evidence?.[id] || {};
  const type = Object.hasOwn(evidenceLabels, declared.type) ? declared.type : 'self-report';
  const quality = ['none', 'anecdotal', 'some', 'strong'].includes(declared.quality) ? declared.quality : 'none';
  const maximum = type === 'self-report' ? 40 : type === 'organizational' ? 80 : 75;
  const support = Number.isFinite(sharedDimension?.confidence) ? sharedDimension.confidence : ({ none: 0, anecdotal: 25, some: 60, strong: 100 })[quality] * coverage / 100 * (declared.contradiction ? 0.5 : 1);
  // Selecting a source category does not verify a file or its contents.
  const contradictionFactor = declared.contradiction === true ? 0.5 : 1;
  const confidence = round(Math.min(maximum * coverage / 100, support / contradictionFactor) * contradictionFactor);
  return { confidence, evidence: { type, label: evidenceLabels[type], quality, source: text(declared.source), note: text(declared.note), contradiction: declared.contradiction === true, verified: false, inference: true } };
}

function dimensionProfile(dimension, index, response, sharedResult, scope) {
  const rule = rules[index];
  const items = dimension.questions.map((question, qIndex) => {
    const scored = scoreQuestion(question, response.answers?.[question.id]);
    return { id: question.id, number: index * 5 + qIndex + 1, question: question.text, ...rule.items[qIndex], score: scored.status === 'scored' ? 1 + scored.score / 25 : null, status: scored.status };
  });
  const valid = items.filter(entry => entry.score !== null);
  const rawScore = average(valid.map(entry => entry.score));
  const score = round(rawScore);
  const coverage = round(valid.length / items.length * 100);
  const { confidence, evidence } = declaredEvidence(response, dimension.id, coverage, sharedResult);
  const ordered = [...valid].sort((a, b) => a.score - b.score || a.number - b.number);
  const weakest = ordered[0];
  const strongest = [...ordered].reverse().filter(entry => entry.score >= 4);
  const weak = ordered.filter(entry => entry.score < 3);
  const inconsistent = ordered.filter(entry => entry.score === 3);
  const enough = coverage >= 60;
  const maturity = marketingMaturity(rawScore);
  const currentState = rawScore === null ? `No interpretable responses establish ${rule.focus}. Capability is unknown.` : `Responses suggest ${maturity.toLowerCase()} capability in ${rule.focus} (${score.toFixed(1)}/5).${!enough ? ' Fewer than three of five questions are scored; this is too incomplete for a dimension-level conclusion.' : coverage < 100 ? ' This describes answered items only; missing conditions remain unknown.' : ''}`;
  const strength = strongest.length ? `Reported strengths: ${strongest.slice(0, 2).map(entry => `${entry.capability} (${entry.score}/5)`).join('; ')}. Validate these reports with relevant records or customer evidence.` : 'No answered item currently reports a consistently strong capability. This may be a relative stronger area, but it is not a demonstrated strength.';
  let gap = weak.length ? `Reported weak or inconsistent capabilities: ${weak.map(entry => `${entry.capability} (${entry.score}/5)`).join('; ')}.` : inconsistent.length ? `Developing consistency: ${inconsistent.map(entry => entry.capability).join('; ')}.` : valid.length ? 'No specific weakness is reported in the answered items; validate priority capabilities before increasing investment.' : 'Information is missing; absence of a score is not evidence of low capability.';
  if (coverage < 100) gap += ` ${items.length - valid.length} of ${items.length} responses are unscored.`;
  // Market-driving and ROMI are situational choices, not mandatory investments.
  if (index === 0 && weakest?.number === 4) gap += ' A deliberate market-driven strategy may be appropriate; a low market-shaping response is not automatically a problem.';
  if (index === 7 && weakest?.number === 39) gap += ' Establish whether ROMI is appropriate for the decision before treating it as a required capability.';
  const risk = !enough ? 'Missing information could lead to an unsupported investment or an incorrectly prioritized capability.' : weakest?.score < 4 ? weakest.risk : 'No specific business consequence is established by these high self-ratings. Unchecked assumptions or changing conditions could still weaken performance.';
  const baseAction = !enough ? `Gather examples for the unanswered questions about ${rule.focus} and review the rating with the people responsible before committing resources.` : weakest.score < 4 ? weakest.action : rule.sustain;
  const metric = !enough ? `Answered questions with a relevant, dated source for ${dimension.title}` : weakest?.metric || 'Relevant capability observations with dated evidence';
  return { id: dimension.id, title: dimension.title, score, rawScore, maturity, coverage, confidence, evidence, currentState, strength, gap, risk, action: `${baseAction} ${scope}`, metric, followUp: !enough ? 'Reassess as soon as the missing responses and evidence are available.' : rule.followUp, items, weakestQuestion: weakest?.id || null, evidenceLabel: evidence.label, confidenceLabel: confidence >= 60 ? 'Moderate declared support' : 'Low declared support', priorityType: !enough || confidence < 40 || evidence.contradiction ? 'investigate' : 'act' };
}

const patternRules = [
  [0, 4, 'strategy-execution', 'Strategic intent exceeds execution', 'The organization may understand where it wants to go but struggle to put the strategy into practice.', 'Translate one strategic objective into weekly commitments with an owner, deadline and capacity check.', 'Strategic commitments completed on time'],
  [1, 7, 'customer-analytics', 'Customer knowledge exceeds measurement', 'Customer understanding may be informal or experience-based while measurement systems cannot show whether decisions work.', 'Turn one customer insight into a measurable test with a baseline, outcome and review date.', 'Customer-insight decisions with a baseline and follow-up result'],
  [7, 1, 'analytics-customer', 'Measurement exceeds customer understanding', 'Significant measurement may not yet translate into meaningful understanding of customer needs or choices.', 'Pair one dashboard pattern with conversations from the affected customer group before changing spend.', 'Dashboard decisions validated against customer explanations'],
  [4, 0, 'execution-strategy', 'Marketing activity exceeds strategic direction', 'The organization may be active in marketing without a clear connection to long-term direction.', 'Review the next three activities against one long-term objective, and stop or reshape activity without a clear contribution.', 'Activities explicitly supporting an agreed long-term objective'],
  [3, 5, 'differentiation-relationships', 'Attraction may exceed retention capability', 'A clear reason to choose the organization may attract customers while weak relationship capabilities limit retention or customer value.', 'Investigate one group of customers who did not return before increasing acquisition spending.', 'Retention and contribution of the selected customer cohort'],
  [6, 0, 'research-strategy', 'Research is not yet translated into direction', 'The organization may gather information without using it to make strategic choices.', 'Use one recent research finding to confirm or change a target-market or investment decision and record why.', 'Strategic decisions with a traceable research finding'],
];

function crossPatterns(dimensions) {
  return patternRules.filter(([high, low]) => dimensions[high]?.coverage >= 60 && dimensions[low]?.coverage >= 60 && dimensions[high].rawScore >= 4 && dimensions[low].rawScore < 3).map(([high, low, id, title, finding, action, metric]) => ({
    id, title, finding: `Inferred pattern: ${finding}`, action, metric, dimensionIds: [dimensions[high].id, dimensions[low].id], confidence: Math.min(dimensions[high].confidence, dimensions[low].confidence), evidence: { type: 'inferred', label: 'Inferred from self-reported dimension scores; not a verified cause', verified: false, inference: true },
  }));
}

function externalProfile(dimension) {
  const prompts = [
    ['competitive', 'Competitive', 'an underserved need or an alternative offer leaves room for a useful difference', 'a competitor or substitute reduces the appeal of the current offer'],
    ['economic', 'Economic', 'a change in spending, funding or costs creates demand for a different offer', 'a change in customer affordability, funding or operating costs reduces sustainable demand'],
    ['sociocultural', 'Sociocultural', 'a changing expectation creates a need the organization can serve', 'the current message or experience no longer fits an important customer group'],
    ['technological', 'Technological', 'a change in customer access or service delivery can improve convenience or value', 'a change in how customers find or use alternatives weakens current access'],
    ['political-legal', 'Political/legal', 'a relevant policy change creates a new need or accessible market', 'a relevant rule or policy change creates a cost, constraint or service obligation'],
  ];
  return dimension.items.map((entry, index) => ({
    id: prompts[index][0], label: prompts[index][1], score: entry.score, confidence: entry.score === null ? 0 : dimension.confidence, evidence: dimension.evidence, classification: 'Context required',
    observation: entry.score === null ? 'Monitoring capability is unknown; no external event has been established.' : `Monitoring is self-rated ${entry.score}/5. This describes awareness capability, not an observed external change.`,
    opportunity: `Investigate whether ${prompts[index][2]}; confirm relevance with dated evidence.`,
    threat: `Investigate whether ${prompts[index][3]}; impact depends on the organization and market.`,
    action: `${entry.action} Record the actual change, affected customer group, source and plausible positive or negative impact in SWOT before classifying it.`,
  }));
}

function marketOrientation(dimensions) {
  const shaping = dimensions[0].items[3].score;
  const sensing = average([dimensions[1].items[2].score, dimensions[1].items[4].score, dimensions[2].rawScore].filter(value => value !== null));
  const enough = shaping !== null && dimensions[1].coverage >= 60 && dimensions[2].coverage >= 60;
  let label = 'Orientation is not established';
  let finding = 'There is not enough evidence of a deliberate choice between responding to existing demand and shaping new value or expectations.';
  if (!enough) finding = 'Complete the market-shaping question and customer/environment dimensions before interpreting orientation.';
  else if (shaping >= 4 && sensing >= 3) { label = 'Market-driving with market awareness'; finding = 'Responses suggest an intention to shape expectations or create new value while also paying attention to customers and external conditions.'; }
  else if (shaping >= 4) { label = 'Market-driving ambition with limited market sensing'; finding = 'Responses suggest market-shaping ambition; limited customer or external awareness could leave the underlying assumptions untested.'; }
  else if (shaping < 3 && sensing >= 3) { label = 'Primarily market-driven'; finding = 'Responses emphasize learning from customers and conditions more than actively shaping the market. A responsive strategy may fit the organization’s role and resources.'; }
  else if (shaping >= 3 && sensing >= 3) { label = 'Mixed market-driven and market-driving orientation'; finding = 'Responses suggest a combination of responding to existing demand and exploring ways to shape customer value.'; }
  return { label, finding: `Inferred orientation: ${finding} Neither orientation is universally superior.`, action: 'Choose the balance that fits the organization’s goals, resources and market; test customer value before committing substantial resources.', shapingScore: shaping, sensingScore: round(sensing), confidence: enough ? Math.min(...[0, 1, 2].map(index => dimensions[index].confidence)) : 0, evidence: { type: 'inferred', label: 'Inferred from market-shaping, customer-information and environment responses', verified: false, inference: true } };
}

function findingFor(dimension, id, title, finding, action, metric) {
  return { id, title, finding: `Inferred finding: ${finding}`, action, metric, confidence: dimension.confidence, evidence: { type: 'inferred', label: 'Inferred from self-reported item responses', verified: false, inference: true } };
}

function customerRelationships(dimensions) {
  const dimension = dimensions[5];
  const scored = index => dimension.items[index].score;
  const low = index => scored(index) !== null && scored(index) < 3;
  const findings = [];
  if (low(1)) findings.push(findingFor(dimension, 'retention-before-acquisition', 'Check retention before acquisition spending', 'Reported retention capability is limited. More acquisition alone could replace avoidable losses.', dimension.items[1].action, dimension.items[1].metric));
  if (low(2)) findings.push(findingFor(dimension, 'relationship-profitability', 'Develop valuable existing relationships', 'The value and service cost of different customer relationships may not be understood.', dimension.items[2].action, dimension.items[2].metric));
  if (low(3)) findings.push(findingFor(dimension, 'customer-service', 'Resolve service feedback', 'Customer feedback may not consistently lead to improvements in the offer or experience.', dimension.items[3].action, dimension.items[3].metric));
  if (scored(1) >= 4 && scored(2) >= 4) findings.push(findingFor(dimension, 'acquisition-balance', 'Compare acquisition with relationship development', 'Retention and relationship-value capability are reported as strong. Compare the next acquisition opportunity with developing existing relationships before selecting investment.', 'Compare customer acquisition cost with contribution-based lifetime value and service capacity using a consistent customer group and period.', 'Acquisition cost, cohort retention and contribution-based lifetime value'));
  return { summary: 'These responses describe relationship capabilities. They do not establish actual acquisition cost, loyalty, retention, profitability or service results; use organizational records to compare those outcomes.', findings, metrics: ['Customer acquisition cost for a defined cohort', 'Retention or repeat purchase rate', 'Customer loyalty or referral behavior', 'Contribution and cost to serve by relationship group', 'Customer service resolution and recurring issues'] };
}

function performanceProfile(dimension) {
  const shortTerm = ['Sales, qualified leads and conversions', 'Incremental contribution and marketing expenditure', 'Contribution-based ROMI where meaningful'];
  const longTerm = ['Customer loyalty and cohort retention', 'Brand awareness and brand equity indicators', 'Contribution-based customer lifetime value', 'Position in the chosen market'];
  const findings = [];
  const returns = dimension.items[3].score, horizon = dimension.items[4].score;
  if (returns !== null && returns >= 4 && horizon !== null && horizon < 3) findings.push(findingFor(dimension, 'short-term-romi', 'Short-term return may obscure long-term value', 'Strong reported return measurement alongside weak long-term measurement may favor immediate returns while overlooking loyalty and brand value.', 'Add cohort retention and one consistent brand indicator to the return review before shifting the marketing budget.', 'ROMI alongside cohort retention and a consistently defined brand indicator'));
  if (dimension.items[2].score !== null && dimension.items[2].score < 3) findings.push(findingFor(dimension, 'outcome-attribution', 'Separate activity from business contribution', 'Reported ability to connect activity to outcomes is limited; concurrent sales cannot establish incremental marketing return.', dimension.items[2].action, dimension.items[2].metric));
  if (horizon !== null && horizon >= 4 && returns !== null && returns < 3) findings.push(findingFor(dimension, 'sustainable-long-term-value', 'Support long-term value with proportionate cost information', 'Long-term outcomes receive attention while return measurement is limited. Decide whether financial contribution measures would improve this specific decision.', 'Where meaningful, reconcile the cost and contribution of one activity while retaining the long-term customer or mission measures.', 'Relevant marketing costs and contribution alongside retention or mission outcomes'));
  return { summary: 'Balance the time horizons that matter for this organization. Do not substitute ROMI for customer loyalty, sustainable relationships or brand value. No financial return or brand valuation is calculated from Likert ratings.', shortTerm, longTerm, findings };
}

function marketingMixProfile(dimensions) {
  const allItems = dimensions.flatMap(dimension => dimension.items.map(entry => ({ ...entry, confidence: dimension.confidence })));
  const mix = [
    ['Product', [17, 29], 'Check that the offer solves a valued need and improves through customer feedback.', 'Customer confirmation of the need solved and repeat service issues'],
    ['Price', [18, 23, 28], 'Check that price fits customer-perceived value, the rest of the offer and sustainable relationship economics.', 'Contribution and cost to serve alongside perceived customer value'],
    ['Place / distribution', [22, 23], 'Check that customers can access the offer through appropriate channels with workable handoffs.', 'Qualified conversion and access or delivery failures by channel'],
    ['Promotion', [19, 21, 22], 'Check that consistent messages and relevant channels support the marketing strategy.', 'Qualified response to a consistent message in a relevant channel'],
  ];
  return mix.map(([label, numbers, action, metric]) => {
    const source = allItems.filter(entry => numbers.includes(entry.number));
    const valid = source.filter(entry => entry.score !== null);
    const rawScore = average(valid.map(entry => entry.score));
    return { label, score: round(rawScore), finding: rawScore === null ? 'No interpretable linked responses; investigate before drawing a mix conclusion.' : `Linked responses suggest ${rawScore < 3 ? 'a possible coordination gap' : rawScore < 4 ? 'developing consistency' : 'reported strength'} in ${label.toLowerCase()}. This is a diagnostic view of selected responses, not a separate assessment.`, action, metric, confidence: valid.length === source.length ? Math.min(...valid.map(entry => entry.confidence)) : 0, questionNumbers: numbers, evidence: { type: 'inferred', label: 'Inferred marketing mix connection', verified: false, inference: true } };
  });
}

function nextToolsFor(dimensions, priorities) {
  const tools = [];
  const low = index => dimensions[index].rawScore !== null && dimensions[index].rawScore < 3;
  const add = (title, href, reason) => tools.push({ title, label: title, href, reason });
  const priorityIds = new Set(priorities.map(priority => priority.dimensionId));
  if (low(1) || low(3)) add('Segmentation, targeting and positioning', 'analytics-lab.html?mode=case&tool=stp', 'Connect customer needs and a credible reason to choose the offer.');
  if (low(2) || priorityIds.has(dimensions[2].id)) { add('External environment: PESTEL', 'analytics-lab.html?mode=case&tool=pestel', 'Document real external changes with dated evidence before judging their impact.'); add('SWOT and TOWS', 'analytics-lab.html?mode=case&tool=swot', 'Translate evidenced, context-specific external opportunities and threats into strategic options.'); }
  if (low(4)) { add('Marketing mix: 4Ps / 7Ps', 'analytics-lab.html?mode=case&tool=mix', 'Check product, price, access and promotion alignment.'); add('Change Readiness Assessment', 'assessment-center.html?assessment=change-readiness', 'Consider this separate assessment if implementation gaps appear related to resistance, ownership or support; marketing responses do not establish the cause.'); }
  if (low(6) || low(7)) add('Analytics & Data Maturity Assessment', 'assessment-center.html?assessment=analytics-data', 'Consider the separate data assessment if missing records, definitions or infrastructure contribute to the marketing measurement gap.');
  if (low(5) || priorityIds.has(dimensions[5].id)) add('Customer retention calculator', 'analytics-lab.html?mode=calculator&metric=retention', 'Calculate a real cohort measure before deciding whether acquisition or retention deserves attention.');
  add('Action objectives and KPIs', 'analytics-lab.html?mode=case&tool=recommendations', 'Turn the selected action into an owner, baseline, measure and review date.');
  return tools;
}

/**
 * The third argument is the existing normalized 0–100 scoreAssessment result.
 * Preserve that result for existing dashboards/storage; this view uses exact
 * equal-question arithmetic in the requested 1–5 units, including partial data.
 */
export function buildMarketingProfile(definition, response = {}, scoreResult = scoreAssessment(definition, response)) {
  if (!Array.isArray(definition?.dimensions) || definition.dimensions.length !== 8 || definition.dimensions.some(dimension => dimension.questions?.length !== 5)) throw new Error('Marketing profile requires eight dimensions with five questions each.');
  const { scope, input } = contextFor(response);
  const dimensions = definition.dimensions.map((dimension, index) => dimensionProfile(dimension, index, response, scoreResult.dimensions?.find(entry => entry.id === dimension.id), scope));
  const answered = dimensions.flatMap(dimension => dimension.items).filter(entry => entry.score !== null);
  const overallRaw = average(answered.map(entry => entry.score));
  const covered = dimensions.filter(dimension => dimension.coverage >= 60 && dimension.rawScore !== null);
  const descending = [...covered].sort((a, b) => b.rawScore - a.rawScore || a.id.localeCompare(b.id));
  const ascending = [...covered].sort((a, b) => a.rawScore - b.rawScore || a.id.localeCompare(b.id));
  const patterns = crossPatterns(dimensions);
  const ranked = [...dimensions].sort((a, b) => {
    const priority = dimension => (dimension.rawScore === null ? 4 : 5 - dimension.rawScore) + (dimension.coverage < 60 ? 1 : 0) + patterns.filter(pattern => pattern.dimensionIds[1] === dimension.id).length * 0.6 + ((response.priorities || []).includes(dimension.id) ? 0.5 : 0);
    return priority(b) - priority(a) || a.id.localeCompare(b.id);
  });
  const priorities = ranked.slice(0, 3).map((dimension, index) => {
    const pattern = patterns.find(entry => entry.dimensionIds[1] === dimension.id);
    const action = pattern ? `${pattern.action} ${scope}` : dimension.action;
    const metric = pattern?.metric || dimension.metric;
    return { priority: index + 1, dimensionId: dimension.id, title: dimension.title, action, reason: pattern?.finding || dimension.gap, metric, followUp: dimension.followUp, confidence: dimension.confidence, evidence: dimension.evidence, baseline: dimension.score, baselineRaw: dimension.rawScore, coverage: dimension.coverage, priorityType: dimension.priorityType, evidenceNeeded: dimension.evidence.source || 'A dated, relevant customer observation, organizational record or external source to check the reported condition.' };
  });
  const strongest = descending[0];
  const largestGaps = strongest ? ascending.filter(dimension => strongest.rawScore > dimension.rawScore).slice(0, 3).map(dimension => ({ from: strongest.title, to: dimension.title, fromId: strongest.id, toId: dimension.id, difference: round(strongest.rawScore - dimension.rawScore), finding: `${strongest.title} is ${round(strongest.rawScore - dimension.rawScore).toFixed(1)} points above ${dimension.title}. Check whether that difference matters for the chosen goals; equal scores are not required.` })) : [];
  return {
    assessmentId: definition.id, overall: round(overallRaw), overallRaw, maturity: marketingMaturity(overallRaw), coverage: round(answered.length / 40 * 100), confidence: round(average(dimensions.map(dimension => dimension.confidence))),
    dimensions, strengths: descending.slice(0, 3), gaps: ascending.slice(0, 3), largestGaps, strengthsLabel: 'Relative strongest areas', gapsLabel: 'Relative weakest areas', patterns, priorities,
    externalIndicators: externalProfile(dimensions[2]), orientation: marketOrientation(dimensions), marketingMix: marketingMixProfile(dimensions), relationships: customerRelationships(dimensions), performance: performanceProfile(dimensions[7]), nextTools: nextToolsFor(dimensions, priorities),
    strategicRisks: ranked.filter(dimension => dimension.rawScore === null || dimension.rawScore < 4).slice(0, 3).map(dimension => ({ dimensionId: dimension.id, title: dimension.title, finding: dimension.risk, confidence: dimension.confidence, evidence: { type: 'inferred', label: 'Possible consequence; not a verified outcome', verified: false, inference: true } })),
    context: input, contextNote: `${scope} Context changes the recommended scope, never the scores. Different organizations need different capability priorities.`,
    rankingNote: 'The top and bottom areas are relative to this profile, not proof of strength or failure. There is no requirement to score equally high in every dimension. Confirm the relevance of a gap before investing.',
    evidenceNote: 'All scores originate from self-reported responses. Organizational and external sources are user-declared, not imported or verified. Diagnostic findings are inferences. Confidence is a conservative evidence-support index, not statistical confidence; missing evidence, incomplete coverage and contradictions reduce it.',
    scoringNote: 'Each dimension is the arithmetic mean of its answered 1–5 questions. The overall score is the arithmetic mean of all answered questions, with equal question weights. Unanswered, unknown and invalid responses are excluded, never treated as zero. Scores round to one decimal before maturity classification. A partial profile describes only answered conditions.',
    followUp: 'Set a baseline for each chosen metric, name an owner and review after one relevant marketing or customer cycle. Reassess within 90 days, or after a major market change; compare the same questions, customer groups, periods and context. A score change alone does not prove an action caused improvement.',
    workflow: 'Assess → Diagnose → Decide → Act → Measure → Learn → Reassess',
  };
}
