import { surveys, surveyScale, summarizeSurvey } from '../surveys/definitions.mjs';

export const SELF_REPORT_KEY = 'ceamplus.self-report-assessments.v1';
export { surveyScale };
export function selfReportDefinitions(engine) {
  return [
    ...surveys.map(source => ({ id:'self-report-'+source.assessmentId, title:source.title, kind:'experience', version:'1.0', sourceId:source.id, sourceVersion:source.version, category:source.category, questions:source.questions, audience:source.audience, description:'Five statements about your own experience, with a response summary and discussion prompts.', source })),
    ...(engine?.assessments || []).map(source => ({ id:'context-'+source.id, title:source.title, kind:'context', version:'1.0', sourceId:source.id, sourceVersion:source.version, category:source.id==='personal'?'Personal':'Organization & Change', questions:source.questions, audience:'An individual reflecting on this setting', description:source.description, source }))
  ];
}
export function summarizeSelfReport(definition, answers, engine) {
  if(definition.kind==='experience') return {kind:'experience', ...summarizeSurvey(definition.source, answers)};
  // Preserve the established context calculation. Never apply it to historical records.
  const result=engine.buildAssessmentResult(definition.source, answers);
  return {kind:'context', ...result};
}
export function readSelfReports(storage=globalThis.localStorage) {
  const raw=storage.getItem(SELF_REPORT_KEY);
  if(raw===null)return {schemaVersion:1,results:[]};
  const value=JSON.parse(raw);
  if(value?.schemaVersion!==1 || !Array.isArray(value.results) || value.results.some(record=>!record || typeof record.id!=='string' || !record.definition || !record.answers || !record.result)) throw new Error('Saved self-report assessments could not be read. Existing data was left unchanged.');
  return value;
}
export function saveSelfReport(record, storage=globalThis.localStorage) {
  const state=readSelfReports(storage);
  const index=state.results.findIndex(item=>item.id===record.id);
  if(index<0)state.results.push(record);else state.results[index]=record;
  storage.setItem(SELF_REPORT_KEY,JSON.stringify(state));
  return record;
}
