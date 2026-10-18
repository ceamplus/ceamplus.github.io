import { assessments } from '../assessments/definitions.mjs';

// Original CEAM+ exploratory items. Not validated scales or organizational scores.
const items = {
  'marketing-assessment': [
    ['Customer value', 'I can explain the customer need our offering addresses.'],
    ['Differentiation', 'I can explain why our intended customers would choose us.'],
    ['Execution', 'I understand how my marketing tasks support our priorities.'],
    ['Customer relationships', 'I see customer feedback being used to improve the experience.'],
    ['Performance understanding', 'I understand which outcomes indicate that our marketing is working.']],
  'marketing-readiness': [
    ['Goal clarity', 'I understand the goal of the marketing work being planned.'],
    ['Role clarity', 'I know what I am expected to contribute to that work.'],
    ['Resources', 'I have access to the resources needed for my marketing responsibilities.'],
    ['Coordination', 'I know whom to contact when marketing work is blocked.'],
    ['Learning support', 'I can get help with marketing tasks I have not done before.']],
  'customer-insight': [
    ['Listening access', 'I have opportunities to hear directly about customer needs.'],
    ['Needs understanding', 'I can describe the problems our customers want to solve.'],
    ['Segment differences', 'I recognize differences in what our customer groups need.'],
    ['Insight sharing', 'Customer information relevant to my work reaches me.'],
    ['Evidence challenge', 'I can question assumptions about customers without being dismissed.']],
  'analytics-data': [
    ['Access', 'I can access the information needed for my work decisions.'],
    ['Understanding', 'I understand the definitions of the measures I use.'],
    ['Data quality', 'I know how to report missing or unreliable data.'],
    ['Interpretation support', 'I can get help interpreting an unfamiliar analysis.'],
    ['Decision use', 'I can explain how information influenced a recent work decision.']],
  'ai-adoption': [
    ['Purpose', 'I understand the problem the proposed AI application is intended to solve.'],
    ['Human responsibility', 'I understand which decisions remain a human responsibility.'],
    ['Verification', 'I know how to check an AI output before relying on it.'],
    ['Choice and escalation', 'I know how to request human review of an AI-supported decision.'],
    ['Adaptation support', 'I can get support when an AI-supported process does not work for me.']],
  'change-readiness': [
    ['Purpose', 'I understand why the proposed change is being considered.'],
    ['Impact', 'I understand how this change could affect my work.'],
    ['Voice', 'I have an opportunity to raise concerns about the change.'],
    ['Time', 'I have enough time to learn the changed way of working.'],
    ['Support', 'I know where to get help during the transition.']],
  'customer-adoption': [
    ['Relevance', 'The product or service addresses a need that matters to me.'],
    ['Understanding', 'I understand what I would need to do to use it.'],
    ['Access', 'I can access the product or service when I need it.'],
    ['Support', 'I can get help when using it is difficult.'],
    ['Continued value', 'I can see a reason to keep using it after the first experience.']],
  'organizational-readiness': [
    ['Priorities', 'I understand the organizational priorities relevant to my role.'],
    ['Responsibility', 'I know which decisions I am responsible for.'],
    ['Capacity', 'My workload leaves enough time for the initiative being considered.'],
    ['Coordination', 'I can get timely cooperation from people my work depends on.'],
    ['Escalation', 'I know how to raise a resource or implementation problem.']],
  'strategic-marketing': [
    ['Direction', 'I understand the long-term market direction of our organization.'],
    ['Targeting', 'I understand which customer groups we prioritize and why.'],
    ['Positioning', 'I can describe the position we want to hold in customers’ minds.'],
    ['Trade-offs', 'I understand which opportunities we are choosing not to pursue.'],
    ['Strategic learning', 'I have opportunities to discuss market changes that could affect our strategy.']],
  'financial-marketing': [
    ['Cost understanding', 'I understand the costs associated with the marketing work I support.'],
    ['Outcome measures', 'I know which business outcomes our marketing measures represent.'],
    ['Attribution limits', 'I can discuss reasons other than marketing that may affect reported results.'],
    ['Long-term value', 'Long-term customer value is considered in the marketing discussions I join.'],
    ['Review', 'I have opportunities to question whether marketing expenditure is delivering value.']],
  'sustainability-resilience': [
    ['Impacts', 'I understand the longer-term effects of the decisions relevant to my role.'],
    ['Dependencies', 'I know which resource or partner dependencies could disrupt my work.'],
    ['Continuity', 'I know what to do if our usual way of working becomes unavailable.'],
    ['Capacity', 'My working arrangements allow effort to be sustained without repeated overload.'],
    ['Adaptation', 'I can suggest changes when conditions make our plans unrealistic.']],
  'agency-trust': [
    ['Meaningful choice', 'I have meaningful choices about how I carry out my responsibilities.'],
    ['Voice', 'I can express disagreement without expecting unfair treatment.'],
    ['Explanation', 'I can get an explanation for decisions that affect me.'],
    ['Accountability', 'I know who is accountable when a decision causes a problem.'],
    ['Follow-through', 'The people I rely on follow through on their commitments.']],
  'personal-change': [
    ['Purpose', 'I can explain why this change matters to me.'],
    ['Choice', 'I can identify a part of the change that I can influence.'],
    ['Practical capacity', 'I have time and resources for a realistic next step.'],
    ['Support', 'I know whom I can ask for support.'],
    ['Learning', 'I can adjust my next step based on what I learn.']]
};

export const surveyScale = [
  ['1', 'Strongly disagree'], ['2', 'Disagree'], ['3', 'Neither agree nor disagree'],
  ['4', 'Agree'], ['5', 'Strongly agree'], ['unsure', 'Not sure / insufficient information'], ['na', 'Not applicable']
];
export const surveys = assessments.map(assessment => ({
  id: `survey-${assessment.id}`, assessmentId: assessment.id, version: '1.0', category: assessment.category,
  title: assessment.title.replace(/Assessment$/, 'Survey'),
  audience: assessment.id === 'customer-adoption' ? 'Customers or intended users' : assessment.id === 'personal-change' ? 'An individual considering a change' : 'Employees, managers, owners, or team members',
  questions: items[assessment.id].map(([construct, text], i) => ({ id: `${assessment.id}-${i + 1}`, construct, text })),
  validationStatus: 'CEAM+ exploratory self-report items; not validated scales',
  interpretation: 'Responses describe one person’s reported experience. They do not establish organizational capability, causal effects, or population opinion.'
}));
export const surveyCategories = [...new Set(surveys.map(survey => survey.category))];
export function summarizeSurvey(survey, answers) {
  const valid = survey.questions.filter(q => surveyScale.some(([value]) => value === answers[q.id]));
  return { answered: valid.length, total: survey.questions.length,
    reportedStrengths: valid.filter(q => ['4', '5'].includes(answers[q.id])),
    discussionNeeds: valid.filter(q => ['1', '2'].includes(answers[q.id])),
    uncertain: valid.filter(q => answers[q.id] === 'unsure'),
    notApplicable: valid.filter(q => answers[q.id] === 'na'),
    unanswered: survey.questions.filter(q => !valid.includes(q)), dimensions: [] };
}
