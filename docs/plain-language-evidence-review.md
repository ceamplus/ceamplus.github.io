# Check What Is Working

The AI Use & Case Analysis interface presents the formal Practice and Evidence Review in plain language. This is a presentation update, not a new assessment version or a newly validated scale.

## What changed

- All 24 practice prompts have conversational explanations, retaining the original eight dimensions, item IDs, response values and weights. Original wording, definitions, citations and scoring descriptions remain under “Learn more”.
- An optional guided review follows activity, goal, basis for belief, known information, assumptions, missing information, risks, affected people, human judgment, measurement and next action.
- `response.plainReview` stores unscored notes. It does not feed the scoring, evidence classification, evidence confidence, recommendation rules or baseline comparison engine. Self-declared certainty never upgrades evidence support. Notes are shown as user statements, not verified findings.
- Measurement teaching depends on the selected goal and advertising-spend answer. It covers sales, inquiries, visits, awareness and retention. Formula disclosures reuse the existing Analytics Lab registry. Guidance is not a calculated or observed result. Advertising revenue is distinguished from profit and causal effects; retention limitations are explicit.
- Seven simple result sections precede the complete formal report. Existing rule IDs supply plain-language next actions without changing the rule triggers. Research detail and the original human comparison remain available in the expandable full report and exports.
- Save, lock, upload, export, edit, follow-up and local browser storage behavior remain intact. Older records without guided notes still render. A follow-up carries only goal and advertising context into new guided notes; previous claims and notes are not silently treated as new observations.

## Verification

The 101-test Node suite passes, including unchanged-analysis equivalence with and without guided notes, metric examples, escaped user content and old-record compatibility. Browser tests cover context-sensitive teaching, 24 ratings, exported formal values, saved notes, baseline locking and storage-failure backup, case analysis, comparison, follow-up, dashboard reopening, Marketing and Corporate Readiness entry points, keyboard disclosures, labels and widths 320/390/768/1440. Core definition, scoring, analysis, storage and measurement dictionary files were checked byte-for-byte against their pre-edit copies.

## Research and usability limitations

Plain-language paraphrases need comprehension testing with students and business users; equivalent item intent does not establish psychometric equivalence or validation. Technical vocabulary is intentionally retained in optional methodology, full research results and machine-readable exports. The tool continues to use local deterministic rules, not a language model or independent source verification. Guided notes are not automatically extracted into scored evidence records: users must enter a result, source and evidence category to support analytical findings.
