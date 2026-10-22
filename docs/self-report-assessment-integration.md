# Self-report assessments in Assessment Center

October 20, 2026

The former survey questionnaires are now available as assessments within Assessment Center. The catalogue contains the thirteen existing evidence-led assessments plus eighteen self-report assessments: thirteen five-statement experience assessments and five context assessments with 58, 58, 55, 54 and 54 questions respectively.

## What was preserved

Every original title, question, answer choice, scale, note and conditional follow-up is retained exactly. Original titles that contain the word Survey remain unchanged; their home is now Assessment Center. The brief experience assessments keep their categorical response summaries and do not acquire a total score. The five context assessments use the original context engine and its original discussion-indicator calculations. Where there are no scored answers, the interface displays no score. These exploratory tools remain unvalidated and do not diagnose a person, establish organizational capability or predict an outcome.

The thirteen evidence-led assessments, their questions, scoring rules, versions, recommendations and existing storage are unchanged. The original survey definitions and shared script are unchanged. Shared-script extraction and Phase 2 deletion are not part of this update.

## New interface and history

The self-report assessment section has category filters, accessible question groups, explicit uncertainty choices, review, editing, optional notes, downloads and an explicit Save to Dashboard action. No response is saved before that action. A new follow-up creates a new result. Repeated saves of the same result update that result without duplicating it.

New records use the dedicated `ceamplus.self-report-assessments.v1` browser-storage namespace and new instrument identities. Each saved result includes its question snapshot, original source identity/version, answers, notes and frozen result. Dashboard shows these in a self-report section, separately from evidence-led score trends. Reopening a saved result does not recalculate it. A corrupted store is left untouched, with a download alternative for the current result. Users may delete individual saved self-report results without changing other histories.

The interface calls only the preserved context engine's local question-rendering and calculation functions. It does not mount the old participant submission form or call email/support submission functions. Assessment Center's existing content-security policy disallows network connections. The new modules contain no network or email calls.

## Compatibility

`surveys.html` and `assessments.html` explain the move, link to the integrated assessments and preserve read-only legacy results and original downloads. As of October 22, old short-survey category links offer the related existing evidence-led assessment. Context links and unknown queries lead to the existing assessment catalogue because there is no exact one-to-one context mapping. The copied questionnaires and current Assessment Center layout remain intact. Nothing starts or submits automatically from an old URL.

Old records remain in their original schemas and namespaces. No historical survey record is renamed, converted, migrated, rescored or placed into an evidence-led trend. The older context engine did not persist browser history; existing downloaded context results remain readable and downloadable without alteration.

## Verification

The integration tests cover all eighteen questionnaires, original question equality, context calculation equality, categorical summaries, uncertainty, explicit saving, repeated saves, protected historical storage, Dashboard reopening, JSON downloads, mobile/desktop layouts, keyboard-friendly controls, no-JavaScript guidance and absence of submissions. The existing assessment, analytics, navigation and preservation suites remain part of release verification.
