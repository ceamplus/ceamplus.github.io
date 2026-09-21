import { CEAM_DIMENSIONS, dimensionLabel } from './ceam-metadata.mjs';
import { scoreAssessment, scoreBand, scoreQuestion } from './scoring.mjs';

const rounded = value => Math.round(value * 10) / 10;
const weightOf = value => Number.isFinite(value) && value > 0 ? value : 1;
const confidenceLevel = value => value >= 75 ? 'high' : value >= 40 ? 'moderate' : 'low';
const uncertaintyLevel = item => item.unknown || item.unanswered || item.invalid || item.contradictions ? (item.coverage < 60 || item.contradictions ? 'high' : 'moderate') : 'low';
const strengthLabel = score => score === null ? 'Requires additional evidence' : score >= 75 ? 'Stronger indicators' : score >= 60 ? 'Moderate indicators' : score >= 40 ? 'Developing conditions' : 'Underdeveloped conditions';

function answerLabel(question, raw) {
  if (raw === undefined || raw === null || raw === '') return 'Unanswered';
  if (raw === 'unsure') return 'Not sure';
  if (raw === 'na') return 'Not applicable';
  if (question.options) return question.options.find(option => String(option.value) === String(raw))?.label || String(raw);
  if (question.type === 'maturity') return ({ 1: 'Not established', 2: 'Early', 3: 'Developing', 4: 'Established', 5: 'Advanced' })[raw] || String(raw);
  if (question.type === 'agreement') return ({ 1: 'Strongly disagree', 2: 'Disagree', 3: 'Mixed / unsure', 4: 'Agree', 5: 'Strongly agree' })[raw] || String(raw);
  if (question.type === 'yes-partly-no') return ({ yes: 'Yes', partly: 'Partly', no: 'No' })[raw] || String(raw);
  if (question.type === 'evidence') return ({ available: 'Available', unavailable: 'Unavailable' })[raw] || String(raw);
  return String(raw);
}

function lowerAnswer(question, raw) {
  if (question.type === 'maturity' || question.type === 'agreement') {
    const value = Number(raw); return Number.isInteger(value) && value > 1 && value <= 5 ? String(value - 1) : null;
  }
  if (question.type === 'yes-partly-no') return ({ yes: 'partly', partly: 'no' })[raw] || null;
  if (question.type === 'evidence') return raw === 'available' ? 'unavailable' : null;
  if (question.type === 'choice') {
    const ordered = [...(question.options || [])].sort((a, b) => a.score - b.score);
    const index = ordered.findIndex(option => String(option.value) === String(raw));
    return index > 0 ? String(ordered[index - 1].value) : null;
  }
  return null;
}

function flatten(definition, response, result) {
  const dimensionResults = new Map(result.dimensions.map(item => [item.id, item]));
  return definition.dimensions.flatMap(dimension => dimension.questions.map(question => {
    const scored = scoreQuestion(question, response.answers?.[question.id]);
    const dimensionResult = dimensionResults.get(dimension.id);
    return {
      question, dimension, metadata: question.metadata, raw: response.answers?.[question.id],
      answerLabel: answerLabel(question, response.answers?.[question.id]), score: scored.status === 'scored' ? scored.score : null,
      status: scored.status, weight: weightOf(question.weight), confidence: dimensionResult?.confidence ?? 0,
      coverage: dimensionResult?.coverage ?? 0, contradiction: Boolean(response.evidence?.[dimension.id]?.contradiction),
      evidenceQuality: dimensionResult?.evidenceQuality || 'none',
    };
  }));
}

function aggregate(items, key, title) {
  const groups = new Map();
  for (const item of items) {
    const id = key(item);
    if (!id) continue;
    if (!groups.has(id)) groups.set(id, { id, title: title(item), items: [], scoreWeight: 0, scoreTotal: 0, confidenceWeight: 0, confidenceTotal: 0 });
    const group = groups.get(id); group.items.push(item);
    if (item.score !== null) { group.scoreWeight += item.weight; group.scoreTotal += item.score * item.weight; }
    group.confidenceWeight += item.weight; group.confidenceTotal += item.confidence * item.weight;
  }
  return [...groups.values()].map(group => {
    const score = group.scoreWeight ? rounded(group.scoreTotal / group.scoreWeight) : null;
    const confidence = group.confidenceWeight ? rounded(group.confidenceTotal / group.confidenceWeight) : 0;
    const unknown = group.items.filter(item => item.status === 'unknown').length;
    const unanswered = group.items.filter(item => item.status === 'unanswered').length;
    const invalid = group.items.filter(item => item.status === 'invalid').length;
    const contradictions = group.items.filter(item => item.contradiction).length;
    const coverage = rounded(group.items.filter(item => item.score !== null).length / group.items.length * 100);
    return { ...group, score, band: scoreBand(score), label: strengthLabel(score), confidence, confidenceLevel: confidenceLevel(confidence), uncertainty: uncertaintyLevel({ unknown, unanswered, invalid, contradictions, coverage }), unknown, unanswered, invalid, contradictions, coverage };
  });
}

function relatedAssessments(variableId, assessments) {
  return assessments.filter(definition => definition.dimensions.some(dimension => dimension.questions.some(question => question.metadata?.variableId === variableId))).map(definition => definition.title);
}

function sensitivityScenarios(definition, response, result, items) {
  if (result.overall === null) return [];
  const scenarios = [];
  for (const item of items.filter(entry => entry.metadata?.variableType === 'decision_sensitive' && entry.score !== null)) {
    const changed = lowerAnswer(item.question, item.raw);
    if (changed === null) continue;
    const counterfactual = { ...response, answers: { ...(response.answers || {}), [item.question.id]: changed } };
    const revised = scoreAssessment(definition, counterfactual);
    if (revised.overall === null) continue;
    scenarios.push({
      variableId: item.metadata.variableId, variable: item.metadata.underlyingVariable, questionId: item.question.id,
      currentAssumption: `${item.answerLabel} for “${item.question.text}”`, changedAssumption: answerLabel(item.question, changed),
      originalResult: result.overall, revisedResult: revised.overall, magnitude: rounded(revised.overall - result.overall),
      interpretation: `A one-step lower response to this decision-sensitive question changes the same published scoring model by ${Math.abs(rounded(revised.overall - result.overall))} point${Math.abs(rounded(revised.overall - result.overall)) === 1 ? '' : 's'}. This scenario does not predict what will happen.`,
    });
  }
  return scenarios.sort((a, b) => Math.abs(b.magnitude) - Math.abs(a.magnitude)).filter((scenario, index, all) => all.findIndex(item => item.variableId === scenario.variableId) === index).slice(0, 5);
}

export function buildInterpretation(definition, response, result, assessments = []) {
  const items = flatten(definition, response, result);
  const variables = aggregate(items, item => item.metadata?.variableId, item => item.metadata?.underlyingVariable).map(group => {
    const metadata = group.items[0].metadata;
    const dimensions = [...new Set(group.items.flatMap(item => [item.metadata.primaryCeamDimension, ...(item.metadata.secondaryCeamDimensions || [])]))];
    const assessmentNames = relatedAssessments(group.id, assessments);
    return {
      ...group, metadata, dimensions, assessmentNames,
      evidenceTypes: [...new Set(group.items.map(item => item.metadata.evidenceType))],
      outcomesAffected: [...new Set(group.items.flatMap(item => item.metadata.outcomesAffected || []))],
      segmentsRelevant: [...new Set(group.items.flatMap(item => item.metadata.segmentsRelevant || []))],
      qualitativeSensitivity: metadata.planningRule?.gate || metadata.variableType === 'decision_sensitive' ? 'High' : metadata.variableType === 'cross_dimension' ? 'Moderate' : 'Low',
    };
  });
  const ceamDimensions = aggregate(items, item => item.metadata?.primaryCeamDimension, item => dimensionLabel(item.metadata?.primaryCeamDimension))
    .map(group => ({ ...group, ...CEAM_DIMENSIONS[group.id] })).sort((a, b) => ['C', 'E', 'A', 'M', '+'].indexOf(a.id) - ['C', 'E', 'A', 'M', '+'].indexOf(b.id));
  const crossDimensionVariables = variables.filter(item => item.metadata.variableType === 'cross_dimension' || item.dimensions.length > 1);
  const decisionSensitiveVariables = variables.filter(item => item.metadata.variableType === 'decision_sensitive');
  const gatingIssues = decisionSensitiveVariables.filter(item => {
    const rule = item.metadata.planningRule;
    return rule?.gate && (item.score === null || item.score < rule.threshold);
  }).map(item => ({ ...item, rationale: item.metadata.planningRule.rationale, threshold: item.metadata.planningRule.threshold }));
  const scoredVariables = variables.filter(item => item.score !== null).sort((a, b) => b.score - a.score);
  const strongest = scoredVariables[0] || null;
  const barrier = [...scoredVariables].sort((a, b) => a.score - b.score)[0] || null;
  const scenarios = sensitivityScenarios(definition, response, result, items);
  let conclusion;
  if (result.overall === null) conclusion = 'There is not enough usable information to form a readiness or capability conclusion. Missing information is an investigation priority.';
  else if (gatingIssues.length) conclusion = `Several indicators may be favorable, but ${gatingIssues.map(item => item.title).join(' and ')} ${gatingIssues.length === 1 ? 'is' : 'are'} unresolved under an explicit CEAM+ planning rule. The overall average should not be treated as sufficient for a favorable decision.`;
  else if (result.confidence < 40) conclusion = `The scored indicators average ${result.overall}/100, but evidence support is low. Treat the current profile as a set of questions requiring additional evidence.`;
  else conclusion = `The available indicators average ${result.overall}/100 (${result.band.toLowerCase()}). This describes reported conditions; it does not establish that the initiative is ready or that an outcome will occur.`;
  return {
    conceptualStatus: 'C/E/A/M/+ is a hypothesized conceptual structure. These groupings are defined metadata, not statistically discovered factors or validated constructs.',
    conclusion, strongest, barrier, variables, ceamDimensions, crossDimensionVariables, decisionSensitiveVariables, gatingIssues, sensitivityScenarios: scenarios,
    relevantSegments: [...new Set(variables.flatMap(item => item.segmentsRelevant))],
    evidenceTrace: variables.map(variableItem => ({
      variableId: variableItem.id, variable: variableItem.title, score: variableItem.score, confidence: variableItem.confidence,
      questions: variableItem.items.map(item => ({ id: item.question.id, text: item.question.text, answer: item.answerLabel, status: item.status, assessmentDimension: item.dimension.title, evidenceQuality: item.evidenceQuality })),
    })),
    whatCouldChange: decisionSensitiveVariables.map(item => ({ variable: item.title, sensitivity: item.qualitativeSensitivity, explanation: item.metadata.sensitivityNotes, currentScore: item.score })),
  };
}
