/** Version identifiers describe algorithms, not validation or respondent identity. */
export const CORE_SCORING_VERSION='ceam-core-1.0';
export const AI_SCORING_VERSION='ceam-ai-profile-1.0';
export const INTERPRETATION_VERSION='ceam-layers-1.0';
export const EVIDENCE_METHOD='declared-evidence-rubric-1.0';
export const LEGACY_VERSION='legacy-unversioned';
export const scoringVersions={
  [CORE_SCORING_VERSION]:{date:'2026-10-18',status:'Existing formulas, explicitly versioned; not empirically validated',scale:'Core 0–100; dedicated Marketing display retains its frozen 1–5 adapter'},
  [AI_SCORING_VERSION]:{date:'2026-10-18',status:'Existing AI practice profile; no overall score',scale:'1–5 dimensions'},
  [LEGACY_VERSION]:{date:null,status:'Original scoring version was not recorded; comparability unverified',scale:'Use stored result and definition snapshot'}
};
export const versionOf=record=>record.scoringVersion||record.result?.scoringVersion||LEGACY_VERSION;
