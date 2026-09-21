/** Opt-in browser persistence. No implicit writes, network requests or telemetry. */
export const STORAGE_KEY = 'ceamplus.assessment-center.v1';
const emptyState = () => ({ schemaVersion: 1, drafts: {}, results: {} });
const object = (value) => !!value && typeof value === 'object' && !Array.isArray(value);
const clean = (value) => typeof value === 'string' ? value.trim() : '';
const clone = (value) => JSON.parse(JSON.stringify(value));
const failed = (error, extra = {}) => ({ ok: false, ...extra, error: error instanceof Error ? error.message : String(error) });

export function assessmentKey(definition, scope = {}) {
  const parts = [definition.id, String(definition.version || '1.0'), clean(scope.context), clean(scope.initiative)];
  // Keep pre-personalization partitions readable; tailored profiles are never mixed.
  const signature = clean(scope.tailoringSignature) || clean(definition.tailoring?.signature);
  if (signature) parts.push(signature);
  return JSON.stringify(parts);
}

function getStorage(storage) {
  const resolved = storage === undefined ? globalThis.localStorage : storage;
  if (!resolved || typeof resolved.getItem !== 'function' || typeof resolved.setItem !== 'function') {
    throw new Error('Local browser storage is unavailable. You can still complete and export this assessment.');
  }
  return resolved;
}

function validateState(state) {
  if (!object(state) || state.schemaVersion !== 1 || !object(state.drafts) || !object(state.results)) throw new Error('Saved assessment data has an unsupported or damaged format. Existing data was left unchanged.');
  for (const draft of Object.values(state.drafts)) {
    if (!object(draft) || typeof draft.assessmentId !== 'string' || !object(draft.response)) throw new Error('A saved assessment draft is damaged. Existing data was left unchanged.');
  }
  for (const history of Object.values(state.results)) {
    if (!Array.isArray(history) || history.some((record) => !object(record) || typeof record.id !== 'string' || typeof record.assessmentId !== 'string' || !object(record.response) || !object(record.result) || typeof record.createdAt !== 'string' || !Number.isFinite(Date.parse(record.createdAt)) ||
      (record.result.dimensions !== undefined && (!Array.isArray(record.result.dimensions) || record.result.dimensions.some((dimension) => !object(dimension) || typeof dimension.id !== 'string' || (dimension.score !== null && !Number.isFinite(dimension.score))))))) {
      throw new Error('Saved assessment history is damaged. Existing data was left unchanged.');
    }
  }
  return state;
}

export function loadState(storage) {
  try {
    const raw = getStorage(storage).getItem(STORAGE_KEY);
    return { ok: true, state: raw === null ? emptyState() : validateState(JSON.parse(raw)) };
  } catch (error) {
    return failed(error, { state: emptyState() });
  }
}

function mutate(storage, operation) {
  const loaded = loadState(storage);
  if (!loaded.ok) return failed(loaded.error);
  try {
    const outcome = operation(loaded.state);
    getStorage(storage).setItem(STORAGE_KEY, JSON.stringify(loaded.state));
    return { ok: true, ...outcome };
  } catch (error) {
    return failed(error);
  }
}

function metadata(definition, response) {
  if (!clean(definition.id)) throw new Error('Assessment ID is required for saving.');
  return { assessmentId: definition.id, version: String(definition.version || '1.0'), context: clean(response.context), initiative: clean(response.initiative), tailoringSignature: clean(response.tailoringSignature) || clean(definition.tailoring?.signature) };
}

function rejectDemo(response, result) {
  if (response?.demo || response?.isDemo || response?.mode === 'demo' || result?.demo || result?.isDemo) throw new Error('Fictional demo responses are not saved in personal drafts or history.');
}

export function saveDraft(definition, response, storage) {
  return mutate(storage, (state) => {
    rejectDemo(response);
    const draft = { ...metadata(definition, response), response: clone(response), updatedAt: new Date().toISOString() };
    state.drafts[assessmentKey(definition, response)] = draft;
    return { draft };
  });
}

export function loadDraft(definition, scope = {}, storage) {
  const loaded = loadState(storage);
  return { ok: loaded.ok, draft: loaded.ok ? loaded.state.drafts[assessmentKey(definition, scope)] || null : null, ...(loaded.error ? { error: loaded.error } : {}) };
}

export function deleteDraft(definition, scope = {}, storage) {
  return mutate(storage, (state) => {
    delete state.drafts[assessmentKey(definition, scope)];
    return {};
  });
}

export function saveResult(definition, response, result, storage) {
  return mutate(storage, (state) => {
    rejectDemo(response, result);
    const meta = metadata(definition, response);
    const key = assessmentKey(definition, response);
    const history = state.results[key] || [];
    const id = clean(response.resultId) || clean(result.id) || globalThis.crypto?.randomUUID?.() || `assessment-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const existing = history.findIndex((item) => item.id === id);
    const suppliedDate = clean(response.completedAt);
    const createdAt = existing >= 0 ? history[existing].createdAt : suppliedDate && Number.isFinite(Date.parse(suppliedDate)) ? new Date(suppliedDate).toISOString() : new Date().toISOString();
    const record = { ...meta, id, createdAt, updatedAt: new Date().toISOString(), response: clone({ ...response, resultId: id, completedAt: createdAt }), result: clone(result) };
    if (existing >= 0) history[existing] = record;
    else history.push(record);
    history.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    state.results[key] = history;
    delete state.drafts[key];
    return { record };
  });
}

/** Earliest and latest saved comparable administrations, never different versions. */
export function getHistory(definition, scope = {}, storage) {
  const loaded = loadState(storage);
  if (!loaded.ok) return failed(loaded.error, { history: [], baseline: null, followUp: null, comparison: [] });
  const history = [...(loaded.state.results[assessmentKey(definition, scope)] || [])].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const baseline = history[0] || null;
  const followUp = history.length > 1 ? history.at(-1) : null;
  const baselineDimensions = new Map((baseline?.result.dimensions || []).map((dimension) => [dimension.id, dimension]));
  const comparison = (followUp?.result.dimensions || []).map((dimension) => {
    const before = baselineDimensions.get(dimension.id)?.score;
    const after = dimension.score;
    const comparable = typeof before === 'number' && Number.isFinite(before) && typeof after === 'number' && Number.isFinite(after);
    return { id: dimension.id, title: dimension.title, baseline: before ?? null, followUp: after ?? null, change: comparable ? Math.round((after - before) * 10) / 10 : null };
  });
  return { ok: true, history, baseline, followUp, comparison };
}

/** Explicit reset across contexts and versions for this assessment only. */
export function clearAssessment(definition, storage) {
  return mutate(storage, (state) => {
    for (const [key, draft] of Object.entries(state.drafts)) if (draft.assessmentId === definition.id) delete state.drafts[key];
    for (const [key, history] of Object.entries(state.results)) if (history.some((record) => record.assessmentId === definition.id)) delete state.results[key];
    return {};
  });
}
