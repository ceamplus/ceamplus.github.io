/** Curated, deterministic drafting structures. No text is represented as AI output. */
export const categories = ['Workplace', 'Personal', 'Boards & governance', 'Projects & planning', 'Grants'];
const field = (id, label, hint, type = 'textarea') => ({ id, label, hint, type });
export const commonFields = [
  field('purpose', 'Purpose and desired outcome', 'What should this communication help the reader understand or do?'),
  field('audience', 'Audience and relationship', 'Who will read this? What do they already know?'),
  field('context', 'Context and key facts', 'Use confirmed facts. Include sources or mark information to verify.'),
  field('message', 'Main message', 'Write the essential message in your own words.'),
  field('action', 'Requested action', 'What response or next step are you requesting?'),
  field('deadline', 'Dates or deadlines', 'Include the date and time zone if relevant.'),
  field('tone', 'Tone and formality', 'For example: warm and direct, formal, or neutral.', 'text'),
  field('length', 'Length and communication channel', 'For example: a short email or a one-page letter.', 'text'),
  field('accessibility', 'Accessibility or language considerations', 'Plain language, translation, format, or other reader needs.')
];
const definitions = {
  Workplace: [
    ['Email', 'Write a clear subject, give necessary context, and close with a specific request.', 'Subject|Opening|Key points|Requested response|Sign-off'],
    ['Announcement', 'State what is changing, who is affected, and where to ask questions.', 'Announcement|Who is affected|What happens next|Questions and support'],
    ['Policy update', 'Quote or link the approved policy. Do not invent requirements or authority.', 'Approved policy and source|What changes|Who is affected|Effective date|Support and review'],
    ['Meeting agenda', 'Give each topic an owner, time allowance, and intended outcome.', 'Meeting purpose|Participants and logistics|Agenda and time allowances|Preparation|Decisions needed'],
    ['Meeting minutes', 'Separate recorded decisions from proposals and unresolved questions.', 'Meeting details|Discussion summary|Decisions recorded|Actions and owners|Open questions'],
    ['Employee recognition', 'Describe a specific contribution and its observed effect without exaggeration.', 'Contribution observed|Why it mattered|Acknowledgment'],
    ['Constructive feedback', 'Use observable behavior, describe impact, and invite the other perspective.', 'Situation|Observed behavior|Impact|Their perspective|Agreed next step'],
    ['Change communication', 'Explain the reason, practical effects, uncertainties, and ways to be heard.', 'Reason for change|What changes and what remains|Effects on people|Support available|Feedback and next review'],
    ['Project update', 'Compare progress with the plan and make decisions needed visible.', 'Reporting period|Progress|Risks and blockers|Decisions needed|Next milestones'],
    ['Stakeholder update', 'Tailor the evidence and decision request to this stakeholder group.', 'Headline update|Evidence|Stakeholder impact|Decisions requested|Next contact'],
    ['Customer response', 'Acknowledge the concern and only promise actions that are authorized.', 'Concern understood|Confirmed facts|Available response|Next contact'],
    ['Persuasive proposal', 'Explain the problem, options, evidence, resources, and decision sought.', 'Problem|Proposed approach|Evidence and alternatives|Resources and tradeoffs|Decision requested'],
    ['Executive summary', 'Lead with the decision, followed by evidence, implications, and limits.', 'Decision in brief|Key evidence|Implications|Risks and limitations|Recommended next step'],
    ['Difficult conversation preparation', 'Prepare questions and boundaries without scripting the other person’s intentions.', 'Purpose|Observable facts|Questions to ask|Boundaries|Possible next steps']
  ],
  Personal: [
    ['Formal letter', 'Identify the recipient, purpose, relevant facts, and courteous closing.', 'Recipient and date|Opening|Relevant facts|Request|Closing'],
    ['Request', 'Make the request specific and leave room for the recipient to respond.', 'What I am requesting|Why it matters|Practical details|Response requested'],
    ['Invitation', 'Include the occasion, location, accessibility needs, and RSVP details.', 'Occasion|Date and location|What to expect|Accessibility and RSVP'],
    ['Thank-you message', 'Name the help or kindness and explain its meaning to you.', 'What I appreciate|Why it mattered|Closing'],
    ['Apology', 'Take responsibility for the specific action without demanding forgiveness.', 'What happened|Responsibility|Impact acknowledged|Repair offered|Space for response'],
    ['Follow-up', 'Recall the previous contact and make the outstanding question clear.', 'Previous contact|What remains open|Requested next step'],
    ['Boundary-setting message', 'State the limit clearly and describe what you can reasonably offer.', 'Situation|My boundary|What I can offer|Next step'],
    ['School communication', 'Use relevant educational context without unnecessary sensitive information.', 'Reason for contact|Relevant context|Questions or request|Follow-up'],
    ['Personal statement', 'Connect your motivation to specific, truthful examples and the stated criteria.', 'Motivation|Relevant experiences|Learning and contribution|Fit with stated criteria|Closing']
  ],
  'Boards & governance': [
    ['Board meeting agenda', 'Follow your governing rules and identify items requiring a decision.', 'Meeting logistics|Declarations of interest|Previous actions|Discussion items|Decisions requested|Next meeting'],
    ['Board minutes', 'Record attendance, conflicts, motions, and decisions as actually documented.', 'Attendance|Conflicts declared|Motions and decisions|Actions and owners|Approval record'],
    ['Committee update', 'Summarize mandate, progress, risks, and items referred to the board.', 'Committee remit|Progress|Risks|Board decisions requested'],
    ['Decision log', 'Retain the decision, rationale, authority, and review conditions.', 'Decision and date|Decision maker|Evidence and alternatives|Rationale|Review trigger'],
    ['Action-item tracker', 'List an accountable owner, next step, due date, and status for each action.', 'Action|Owner label|Due date|Status|Evidence of completion'],
    ['Board report', 'Distinguish information, discussion, and approval items.', 'Purpose of report|Performance and evidence|Risks and oversight|Decision requested|Supporting materials']
  ],
  'Projects & planning': [
    ['Project brief', 'Define the outcome, scope, people affected, and success measures.', 'Problem and outcome|Scope and exclusions|Stakeholders|Deliverables|Measures and constraints'],
    ['Project charter', 'Document authority and approvals without assuming they have been granted.', 'Purpose|Sponsor and authority|Scope|Milestones|Resources|Risks|Approval required'],
    ['Task board', 'Break the work into specific tasks with owners and completion criteria.', 'Goal|Tasks and owners|Statuses|Due dates|Definition of complete'],
    ['Communication plan', 'Connect each audience to a message, channel, owner, and cadence.', 'Audiences|Messages|Channels and accessibility|Owners|Schedule|Feedback'],
    ['Timeline', 'Record milestones, dependencies, and assumptions behind each date.', 'Start and end|Milestones|Dependencies|Date assumptions|Review points'],
    ['Event plan', 'Cover purpose, logistics, access, responsibilities, and contingency plans.', 'Purpose and audience|Logistics|Accessibility|Responsibilities|Budget|Contingencies'],
    ['Campaign plan', 'Connect the audience and proposition to channels, measures, and review.', 'Objective|Audience and proposition|Channels|Schedule and resources|Measures|Review'],
    ['Content calendar', 'Plan useful messages with a channel, owner, date, and approval step.', 'Audience and themes|Content items|Channels|Publication dates|Owners and review'],
    ['Personal goal tracker', 'Choose a manageable next step and a way to review progress.', 'Goal and meaning|Small next steps|Resources and barriers|Review dates|Progress notes']
  ],
  Grants: [
    ['Letter of inquiry', 'Follow the funder’s inquiry format and confirm whether inquiries are accepted.', 'Funder and opportunity|Organization|Need and evidence|Proposed project|Amount requested|Next step'],
    ['Concept paper', 'Summarize the project and its fit with user-supplied opportunity criteria.', 'Project concept|Documented need|Population served|Approach|Expected measures|Indicative budget'],
    ['Grant proposal', 'Use the grant application workspace for funder questions, limits, budget, and a combined proposal.', 'Applicant and mission|Documented need|Project narrative|Objectives|Evaluation|Budget justification|Sustainability'],
    ['Needs statement', 'Support each factual claim with evidence, dates, and sources; flag gaps.', 'Population and location|Documented need|Sources and dates|Evidence gaps|Project relevance'],
    ['Organizational background', 'Use verifiable experience and credentials only.', 'Mission|Relevant experience|Capacity and evidence|Governance|Evidence still needed'],
    ['Project narrative', 'Explain activities, responsibilities, partnerships, and timing.', 'Project summary|Activities|People served|Partners and confirmed roles|Timeline|Risks'],
    ['Measurable goals and objectives', 'Describe the measure, starting point, target, time window, and evidence source.', 'Goal|Baseline and source|Objective and target|Time window|Measurement responsibility'],
    ['Work plan', 'Connect activities to owners, milestones, dependencies, and deliverables.', 'Activities|Owner labels|Milestones|Dependencies|Deliverables'],
    ['Logic model', 'Separate resources, activities, outputs, and hoped-for outcomes; explain assumptions.', 'Inputs|Activities|Outputs|Short-term outcomes|Longer-term outcomes|Assumptions and external factors'],
    ['Evaluation plan', 'Choose feasible measures and explain consent, collection, analysis, and learning.', 'Evaluation questions|Indicators|Data sources and consent|Collection schedule|Analysis and learning'],
    ['Budget worksheet', 'Use the grant workspace to calculate quantity × unit cost in one stated currency.', 'Currency|Cost categories|Quantities and unit costs|Basis of estimates|Funding sources'],
    ['Budget justification', 'Explain how each cost supports an activity and identify estimates or unconfirmed contributions.', 'Cost item|Activity supported|Basis and calculation|Funding source|Assumptions'],
    ['Sustainability plan', 'Describe realistic continuation options and distinguish commitments from possibilities.', 'What would continue|Resources needed|Confirmed support|Unconfirmed options|Contingencies'],
    ['Letter of support', 'Only state commitments approved by the named supporter.', 'Supporter and relationship|Project understanding|Authorized support|Limits and conditions|Signature approval'],
    ['Grant cover letter', 'Identify the opportunity and enclosed materials without claiming eligibility.', 'Recipient and opportunity|Applicant|Request summary|Materials included|Authorized contact'],
    ['Grant progress report', 'Compare documented progress and spending with the agreed reporting requirements.', 'Reporting period|Activities completed|Results and evidence|Budget actuals|Variances|Next steps'],
    ['Grant final report', 'Report evidenced results, limitations, actual expenditure, and learning.', 'Award and reporting period|Activities and outputs|Outcomes and evidence|Final expenditure|Limitations|Lessons and continuation']
  ]
};
const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const templates = Object.entries(definitions).flatMap(([category, rows]) => rows.map(([name, guidance, headings]) => ({
  id: slug(name), name, category, guidance,
  fields: [...commonFields, ...headings.split('|').map((label, i) => field(`section${i}`, label, `Add ${label.toLowerCase()} using your own information. Mark anything that needs verification.`))]
})));
export const blankTemplate = { id: 'blank', name: 'Blank document', category: 'Personal', guidance: 'Write freely in the preview. Nothing is inferred or sent.', fields: [] };
export function getTemplate(id, custom = []) { return [...templates, ...custom, blankTemplate].find(t => t.id === id) || blankTemplate; }
export function assemble(template, values) {
  if (template.body !== undefined) return template.body;
  return template.fields.filter(f => !['tone', 'length', 'accessibility'].includes(f.id)).map(f => `${f.label}\n${values[f.id]?.trim() || `[Add ${f.label.toLowerCase()}]`}`).join('\n\n');
}
export const grantFields = [
  ['funder', 'Funder'], ['opportunity', 'Opportunity name'], ['source', 'Official opportunity link'],
  ['instructions', 'Funder instructions and submission process'], ['criteria', 'Review criteria'], ['eligibility', 'Eligibility requirements and evidence'],
  ['deadline', 'Submission deadline'], ['timezone', 'Deadline time zone'], ['reportingDates', 'Reporting dates'],
  ['organization', 'Organization or applicant'], ['mission', 'Mission'], ['summary', 'Project summary'],
  ['population', 'Population and location served'], ['need', 'Documented need and sources'], ['activities', 'Proposed activities'],
  ['partners', 'Partners and confirmed roles'], ['timeline', 'Project timeline'], ['objectives', 'Measurable objectives'],
  ['evaluation', 'Evaluation approach'], ['amount', 'Funding request'], ['currency', 'Budget currency'],
  ['assumptions', 'Budget assumptions and other funding sources'], ['sustainability', 'Sustainability plan'],
  ['questions', 'Funder questions and responses'], ['owner', 'Application owner label'], ['stage', 'Application stage']
];
export const projectKinds = {
  'Team project': ['Define the outcome', 'Review the plan', 'Check progress'],
  'Board action items': ['Record the decision', 'Confirm action owners', 'Review completion evidence'],
  'Marketing campaign': ['Confirm audience and objective', 'Prepare campaign materials', 'Review results'],
  'Event planning': ['Confirm logistics and access', 'Prepare invitations', 'Review event readiness'],
  'Personal goals': ['Choose a small next step', 'Schedule a progress review'],
  'Grant application': ['Review eligibility and instructions', 'Draft narrative and budget', 'Review required documents', 'Record submission evidence'],
  'Grant reporting': ['Check reporting requirements', 'Gather results and expenditure', 'Prepare report', 'Record delivery evidence']
};
