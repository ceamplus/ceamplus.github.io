/** Presentation only. Formal item IDs, response values and analysis rules stay unchanged. */
import { escapeHTML as e } from './measurement-dictionary.mjs';
import { metricDefinitions } from '../analytics/metrics.mjs';

export const reviewIntroduction = 'Look at something you are currently doing and figure out whether it is actually working. CEAM+ will help you separate what you know from what you assume, identify what information you are missing, and decide what to do next.';
export const dimensionLanguage = {
  'strategic-fit': ['Does this solve a real problem?', [
    'Have you written down the problem you want to solve and a goal you can measure?',
    'Have you compared this AI use with a simpler option that does not use AI, using information you can check?',
    'Have you explained the benefit you expect, what competitors are doing, and when AI would not be needed?']],
  'marketing-value': ['Does this help your customers and your organization?', [
    'Can you connect this AI use to a specific marketing task and a customer need?',
    'Do you check time or money saved separately from whether customers and marketing results improve?',
    'Do you compare customer actions, money earned or saved, and lasting results with a clear starting point?']],
  allocation: ['How should people and AI share the work?', [
    'Do you assign work based on demonstrated ability and what happens if something goes wrong?',
    'Do you consider people’s judgment, experience, cultural understanding, and relationships when assigning work?',
    'Can someone with enough time and authority check, correct, and get help with AI results?']],
  evidence: ['How do you know?', [
    'For each claimed benefit, do you record the source, time period, people involved, and what changed?',
    'Do you record weaknesses in the information, other possible explanations, and conflicting findings?',
    'Do you check lasting results separately from counts such as posts, clicks, or conversations?']],
  'consumer-response': ['How do different customers respond?', [
    'Do you ask different customer groups about their experience, including culture, accessibility, and comfort with technology, without assuming they are alike?',
    'Do you check whether interactions are helpful to customers, separately from how many interactions happen?',
    'Do you check customers’ preferences for human contact, permission, trust, and problems at each step of their experience?']],
  ethics: ['Who could this affect?', [
    'Have you named who will protect privacy, get permission, prevent unfair or misleading treatment, and keep data use responsible?',
    'Do developers, data providers, managers, marketers, and others know which responsibilities belong to them?',
    'Can people affected by a mistake reach a person who can review, stop, or challenge the decision?']],
  adaptation: ['Will this keep working over time?', [
    'Do you regularly use feedback from customers, employees, and AI checks to review benefits and harm?',
    'Have you tested backup options for changing costs, unreliable technology, lost access, or unexpected events?',
    'Is someone responsible for changing or stopping AI use when it no longer creates acceptable value?']],
  'human-necessity': ['Where are people still needed?', [
    'For each important task, do you ask both whether AI can do it and whether it should do the whole task?',
    'Have you identified what people contribute that might be lost, and who would be affected?',
    'Do human involvement, responsibility, and plans for mistakes match how serious the consequences could be?']],
};

export const labels = {
  'Decision / initiative':'What are you doing? Give this review a name.',
  'Strategic problem':'What problem are you trying to solve?', 'AI technology / application':'What AI tool or use are you reviewing?',
  'Target market':'Which customers or people is this for?', 'Marketing / organizational objective':'What are you trying to accomplish?',
  'Human role':'What do people do?', 'Risks and ethical issues':'What could go wrong, and who could be affected?',
  'Case questions':'What questions do you want to answer?', 'Case source / citation':'Where did this case come from? Include a link or reference.',
  'Evidence classification':'What I know, what I think, or what I do not know yet',
  'Source references (one per line)':'Where can someone check this? Add one source or record per line.',
  'Measurement quality':'Can you trust the information?', 'Objective measure rather than opinion':'This is recorded or measured information, rather than an opinion.',
  'Conflicting evidence':'Other information disagrees with this.',
  'What the organization believes AI accomplishes':'What do you think is working?',
  'Expected customer or organizational outcome':'What did you hope would change?',
  'Actual metric measured':'What did you actually measure? For example, purchases or minutes saved.',
  'Metric category':'What kind of change did you measure?',
  'Measured value, units, denominator and period':'What was the result? Include the amount, who or what you counted, and the dates.',
  'AI-supported activity':'What task uses AI?', 'AI contribution (e.g. scale, pattern recognition)':'What does AI do? For example, sort many records.',
  'Human contribution (e.g. judgment, empathy, context)':'What do people contribute? For example, judgment or understanding a customer.',
  'Can meaningful human oversight remain?':'Can a person check and change what happens?', 'Provisional allocation':'Who should do this work? This is your current view.',
  'Segment':'Which group of customers?', 'Technology familiarity':'How comfortable are they with technology?',
  'Cultural context':'What cultural needs or expectations matter?', 'Observed or proposed segment response':'How did this group respond, or how do you think they might respond?',
  'Risk':'What could go wrong?', 'Affected stakeholder':'Who could be affected?', 'Potential consequence':'What could happen to them?',
  'Current safeguard':'What protection is already in place?', 'Recommended safeguard':'What protection would you add?',
  'Responsible party (developer, organization, marketer, manager, data provider, platform or other)':'Who is responsible for handling this?',
  'Responsibility level':'Where does that responsibility belong?',
  'AI contribution':'What does AI do?', 'Marketing mechanism':'How is this meant to help?', 'Human contribution':'What do people do?',
  'Customer benefit':'How does this help the customer?', 'Organizational benefit':'How does this help the organization?',
  'Expected outcome':'What change do you expect?', 'Measurement':'What would you count or check?',
  'Possible friction':'What might make this difficult for customers?', 'Trust implications':'How could this affect trust?',
  'Personalization':'How is this adapted to each customer?', 'Meaningful human interaction':'Where would contact with a person help?',
  'Possible unintended consequences':'What unexpected problems could this cause?',
  'Application':'What are you doing here?', 'Mechanism / expected value':'How should this help, and what benefit do you expect?',
  'Assumption the strategy depends on':'What are you assuming will stay true?', 'Signal to adapt or stop':'What would tell you to change or stop?',
  'Fallback / alternative':'What would you do instead?', 'Accountable owner':'Who will make that decision?',
  'Baseline measure':'What was the starting measurement?', 'Target measure':'What result are you aiming for?',
  'Follow-up measurement':'What did you measure when you checked again?', 'Owner':'Who will do this?',
};
export const sectionLabels = {
  'Benefit Claim':'What changed? Record a result', 'Human Necessity Activity':'Where are people still needed? Review a task',
  'Customer Segment':'How did different customer groups respond?', 'Ethical Risk':'What could go wrong, and who could be affected?',
  'Human + AI Customer Journey':'What happens at each step of the customer experience?',
  'Optional Marketing Mix — 4Ps / 7Ps':'Optional: review what you offer and how you deliver it',
  'Black Swan / Assumption Stress Test':'What if things change unexpectedly?',
};
export const optionLabel = (value,path) => {
  if(value==='') return 'Choose an answer (optional)';
  if(path.endsWith('.classification')) return ({'Unknown':'What I do not know yet','Observed Evidence':'What I know — recorded or measured','Supported Inference':'What I think — supported by information','Proposed Application':'An idea I have not tested'})[value] || value;
  if(path.endsWith('.quality')) return ({limited:'I have only limited information',documented:'I have records someone can check',strong:'I have checked the records and how the measurements were made'})[value] || value;
  if(path.endsWith('.metricType')) return ({unknown:'I am not sure',activity:'Work completed, such as posts made',engagement:'Attention or interaction, such as clicks',behavioral:'What people did, such as purchases',financial:'Money earned, spent, or saved','long-term':'Lasting changes, such as customers staying'})[value] || value;
  if(path.startsWith('answers.')) return ({'':'I do not know yet',unsure:'I am not sure',1:'1 — Not established',2:'2 — Limited',3:'3 — Developing',4:'4 — Usually supported',5:'5 — Consistently supported'})[value] ?? value;
  if(path.endsWith('.allocation')) return ({Unknown:'I do not know yet','AI-led':'AI does most of the work','AI-assisted':'People and AI share the work','Human-led with AI support':'People lead; AI helps','Human-essential':'People must remain involved'})[value] || value;
  return value === 'Unknown' ? 'I do not know yet' : value;
};

export const stageLabel = value => ({Awareness:'First hearing about you',Consideration:'Deciding whether you are a good fit',Purchase:'Buying',Experience:'Using your product or service','Loyalty / Retention':'Staying with you',Advocacy:'Recommending you to others',Product:'What you offer',Price:'What customers pay',Place:'Where customers can buy or get help',Promotion:'How you communicate',People:'The people delivering the service',Process:'How the service works','Physical evidence':'What customers can see or experience'})[value] || value;

const lessons = {
  roas:{id:'roas',name:'Revenue connected to advertising',meaning:'Compare the revenue connected to your advertising with how much you spent on it.',why:'More views do not necessarily mean more sales. This helps you check sales relative to advertising cost.',need:'Advertising spend and the revenue connected to those same ads over the same dates. Explain how you connected each sale to an ad.',example:'If 500 in ad spending is connected to 1,500 in revenue, the revenue is 3 times the ad spending.',caution:'This is revenue, not profit. It does not prove that the ads caused extra sales. Check other costs and use a fair comparison.'},
  conversion:{id:'conversion',name:'How many people took the intended next step',meaning:'Count the share of eligible people who completed one clearly defined action, such as buying or making an inquiry.',why:'Traffic alone does not tell you whether people took the step you wanted.',need:'The number who completed the action and the total eligible people in the same group and period.',example:'If 10 of 100 eligible visitors make an inquiry, that is 10%.',caution:'Define the action before counting. An inquiry is not a sale, and a change does not establish what caused it.'},
  retention:{id:'retention',name:'Customers who stay with you',meaning:'Check how many of the customers you started with are still customers at the end of a suitable period.',why:'Increasing sales does not necessarily mean customers are staying.',need:'Customers at the beginning and end, plus new customers acquired. When possible, track the same starting customers directly.',example:'Start with 100 customers, end with 110, and add 20 new customers: the simple estimate is 90 of the original 100, or 90%.',caution:'The estimate can mislead if new customers also leave or your definition of a customer changes. Use a period that fits how often people normally buy.'},
  visits:{name:'Visits from the people you want to reach',meaning:'Count visits to the website or location you intended people to use.',why:'This checks whether people arrived. It does not show whether they bought or found the visit helpful.',need:'Comparable dates, a consistent way to count visits, and a way to identify the relevant campaign or customer group.',example:'Compare weekly visits before and during the activity, keeping track of holidays and other promotions.',caution:'A before-and-after difference alone cannot tell you what caused the change.'},
  awareness:{name:'Whether people recognize and remember you',meaning:'Ask people in the intended audience whether they know your organization and what they remember about it.',why:'An ad being displayed does not show that people noticed or remembered it.',need:'The same clear questions, comparable groups of people, and a starting measurement.',example:'Ask “Which local services come to mind?” before and after the campaign, using similar groups.',caution:'Who answers and how you ask can change the result. Report the number and type of people who answered; avoid claiming the campaign caused the change without a fair comparison.'},
};
export function measurementLessons(review={}) {
  if(review.goal==='More repeat customers') return [lessons.retention];
  if(review.goal==='More awareness') return [lessons.awareness];
  if(review.goal==='More website visits') return [lessons.visits];
  if(review.goal==='More leads') return [lessons.conversion];
  if(review.goal==='More sales') return review.adSpend==='Yes' ? [lessons.roas,lessons.conversion] : [lessons.conversion];
  return [];
}
export function lessonHTML(lesson) {
  const formal=metricDefinitions.find(metric=>metric.id===lesson.id);
  return `<article class="ac-note"><h4>CEAM+ suggests measuring: ${e(lesson.name)}</h4><p><strong>What that means:</strong> ${e(lesson.meaning)}</p><p><strong>Why it matters:</strong> ${e(lesson.why)}</p><p><strong>What you need:</strong> ${e(lesson.need)}</p><p><strong>Example:</strong> ${e(lesson.example)}</p><p>${e(lesson.caution)}</p>${formal?`<details><summary>Learn more: name, formula, and limitations</summary><p><strong>${e(formal.label)}</strong></p><p>${e(formal.formula)}</p><p>${e(formal.assumptions)}</p><p>${e(formal.limitations)}</p><a href="analytics-lab.html">Open Marketing Analytics Lab</a></details>`:''}</article>`;
}
export const actionLanguage = {
  outcomes:['Check one claimed benefit against a clear starting measurement. Count the result you actually want, such as purchases, rather than clicks alone.','Track purchases or money left after relevant costs; check whether customers stay over a suitable period.','Comparable measurements support or challenge the claimed benefit.'],
  human:['Choose the task where a mistake would matter most. Ask staff and customers what people need to do, and test how they can step in.','Record mistakes, how quickly people resolve them, customer trust, and whether a responsible person reviewed the work.','Tests show which human contributions make results better and which do not.'],
  owners:['Choose the most serious possible harm, name who will handle it, and test a way to prevent or correct it.','Check whether the protection works and how long it takes to spot and correct a mistake.','The test and affected people’s experiences show whether the protection is enough.'],
  stress:['Test your backup plan for one assumption that could fail before expanding the activity.','Record recovery time, cost, and what customers experience during the test.','The backup plan keeps service acceptable when you try it.'],
  sustain:['Check the strongest claimed benefit again after a suitable customer cycle. Use the same definitions and comparable information.','Check whether customers still benefit, what it costs, and whether harm appears.','Benefits weaken, needs change, or new information challenges the conclusion.'],
};
export function simpleResultsHTML(state,result) {
  const r=state.plainReview||{};
  const items=values=>values.length?`<ul>${values.map(v=>`<li>${e(v)}</li>`).join('')}</ul>`:'<p>Not recorded yet. This is something to check, not a failure.</p>';
  const note=(title,value)=>value?`<p><strong>${e(title)} — your note, not independently checked:</strong> ${e(value)}</p>`:'';
  const observed=result.claims.filter(c=>c.evidence.classification==='Observed Evidence'&&c.metric&&c.value);
  const patternNotes=result.noticed.map(text=>({
    'High claimed marketing value coexists with weak or missing measurement practices. Test the value claim.':'You rated marketing benefits highly, but the checks supporting them are weak or missing. Test one benefit before relying on it.',
    'Task allocation appears developed, but the value lost by removing human participation remains unresolved.':'You have a plan for sharing work, but still need to check what might be lost if people are removed.',
  })[text]).filter(Boolean);
  return `<h2>Check What Is Working — AI Use &amp; Case Review</h2><p>${e(state.initiative||state.caseInfo?.company||'Your review')}</p><p>This review uses the information you supplied and local rules. No AI model or independent source check ran. Suggestions below are things to test.</p><p><strong>How sure are you? ${e(result.confidence)} support from the recorded information.</strong> This describes the evidence available, not the chance that a claim is true. Your own certainty does not raise this rating.</p>
  <section class="ac-result-section"><h3>What appears to be working</h3>${observed.length?items(observed.map(c=>`${c.metric}: ${c.value}. This supports only the reported measurement; it does not show that AI caused the result. How sure are we? ${c.evidence.confidence} support.`)):'<p>No recorded result with a source has been supplied yet. Add what changed, when, and where someone can check it.</p>'}${note('What I know',r.know)}</section>
  <section class="ac-result-section"><h3>What you are assuming</h3>${note('What I think',r.think)}${items([...patternNotes,...result.gaps.map(g=>`${g.claim}: ${g.finding} Compare the intended result with a clear starting point and consider other explanations.`),...result.claims.filter(c=>['Supported Inference','Proposed Application'].includes(c.evidence.classification)).map(c=>`${c.claim||'This idea'} still needs to be tested.`),...result.stress.filter(s=>s.assumption).map(s=>s.assumption)])}</section>
  <section class="ac-result-section"><h3>What you still need to know</h3>${note('What I do not know yet',r.missing)}${items([
    ...result.dimensions.filter(d=>d.score===null).map(d=>`${dimensionLanguage[d.id][0]} You have not rated these practices yet.`),
    ...result.claims.filter(c=>c.evidence.classification==='Unknown').map(c=>`Find a checkable source for: ${c.claim||'the claimed benefit'}.`),
    ...result.tasks.filter(t=>t.missing.length||t.conflict).map(t=>`Complete the task review for ${t.activity||'the unnamed task'} and check who can step in if something goes wrong.`),
    ...(!result.segments.length?['Ask different customer groups about their experience and any need for human help.']:[]),
    ...(!result.claims.some(c=>c.metricType==='long-term'&&c.evidence.classification==='Observed Evidence')?['Check whether benefits last; no recorded long-term result has been supplied.']:[])])}</section>
  <section class="ac-result-section"><h3>What to measure</h3>${measurementLessons(r).map(lessonHTML).join('')||'<p>Choose the change you want first. Define what you will count, who is included, the dates, and a starting measurement. Keep time saved separate from whether customers benefit.</p>'}${note('Your measurement plan',r.measure)}</section>
  <section class="ac-result-section"><h3>What could go wrong</h3>${note('Your concern',r.risks)}${note('Who could be affected',r.affected)}${items(result.risks.map(x=>`${x.risk||'Concern not described'}: ${x.consequence||'Possible consequences not recorded'}. Responsible person: ${x.owner||'not named'}.`))}${items(result.stress.filter(s=>s.assumption&&s.status==='Exposed / response incomplete').map(s=>`${s.scenario}: finish the backup plan, name who decides, and record what would tell you to act.`))}<p>These are possible problems to review, not predictions.</p></section>
  <section class="ac-result-section"><h3>Where people matter</h3>${note('Your view',r.people)}${items(result.tasks.map(t=>`${t.activity||'Task'}: ${t.humanContribution||'Describe what people contribute'}. Responsible person: ${t.accountable||'not named'}. Current work-sharing suggestion: ${optionLabel(t.recommendation,'task.allocation')}. Check this with the people affected.`))}</section>
  <section class="ac-result-section"><h3>What to do next</h3><p>CEAM+ suggestions based on your recorded responses:</p>${result.recommendations.map(a=>{const words=actionLanguage[a.id];return `<article><h4>${e(words?.[0]||a.action)}</h4><p><strong>What to check:</strong> ${e(words?.[1]||a.metric)}</p><p><strong>What would change this advice?</strong> ${e(words?.[2]||a.revise)}</p></article>`;}).join('')}${note('Your chosen next step',r.next)}<p>Check again after a suitable customer cycle, a change in the tool or policy, an unexpected problem, or new information.</p></section>`;
}
