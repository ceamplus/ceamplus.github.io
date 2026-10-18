# Survey preservation and evidence pathways

## Integration boundary

The existing `script.js` is the human-adaptation instrument engine. Its five
contexts (`personal`, `business`, `education`, `healthcare`, `rehabilitation`),
question definitions, nine CEAM+ phases, response logic, scoring, interpretation,
recommendations, uncertainty handling, and submission behavior remain intact.
The Assessment Center is a separate, modular application and does not replace
or import this survey engine.

Before integration, `script.js` had SHA-256:
`626b98eaace24c8a676cc0f462030d456aba576c6baaa086a2219c442feb0cf3`.
The local file remains byte-identical. For portable Git checkouts, the regression
test checks the original Git blob's LF-normalized SHA-256:
`7fa6e420b9700d0a582249b51a8d1308f54f2c4a650ba14ea93cbfd23dc9261a`.

## Routes and visible language

- `surveys.html` is the canonical human-adaptation survey entry point.
- `assessments.html` remains a fully functional compatibility page, including
  its original `#assessments` and `#assessments-title` anchors. It loads the same
  engine and controls instead of relying on a redirect.
- Both pages retain the original Adoption Model explanation, safeguards and
  context labels. Their visible page title is **CEAM+ Surveys** and their start
  button says **Start Survey**. Preserved instrument text can still use the
  word “assessment”; changing it would alter the existing instrument.
- `js/surveys-context.js` optionally selects an existing context from the URL.
  It never starts, answers, submits, or scores a survey automatically.

## Privacy boundary

The legacy survey submission flow sends entered participant details, responses,
and a generated profile to the configured ClearPathway Systems Zapier webhook
when the participant submits the completed form. Existing optional support
requests also use that workflow. Do not claim that this survey system is
entirely local. The new Assessment Center has its own local-only processing
and storage policy; its results are not silently transferred into surveys.

## Tool links

Assessment results can recommend the existing tools without transferring data:

- `surveys.html?context=business` (also `personal`, `education`, `healthcare`,
  `rehabilitation`) preselects an existing instrument.
- `analytics-lab.html?mode=calculator&metric=cac` selects a registered calculator.
- `analytics-lab.html?mode=case&tool=forces` selects Porter’s Five Forces.
- `analytics-lab.html?mode=data&analysis=forecast` selects forecasting and asks
  the user to load suitable data. It does not manufacture a dataset.

The analytics helper selects only existing menu options. Unknown parameters
leave the normal workspace usable. No responses, scores, participant details,
or evidence notes are placed in these URLs.

## Evidence distinction

The survey and analytics introductions, site navigation, and homepage evidence
cycle distinguish **what people report**, **what combined evidence suggests**,
and **what measurable business data show**. CEAM+ decision support retains
human interpretation and follow-up measurement.

## Verification

`tests/survey-preservation.test.mjs` verifies the engine hash, all five complete
instrument configurations, their question counts, scoring and uncertainty
behavior, safeguard text, both page routes and the optional context selector.
Browser integration checks exercise all contexts and intercept the legacy
submission request locally without delivering an email, verify profile results
and JSON export, local navigation and targeted analytics tools, and check
small-screen overflow and keyboard focus.
