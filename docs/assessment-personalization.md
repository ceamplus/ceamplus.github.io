# Assessment personalization

The Assessment Center keeps one versioned CEAM+ assessment registry and adds context through configuration. It does not create a separate framework for every industry.

## Profile layers

A profile combines:

1. one of 15 industries or organization types;
2. one of five size and complexity contexts;
3. one of ten departments or shared functions;
4. one department- and industry-aware business objective; and
5. the selected assessment's original CEAM+ dimensions.

The configuration lives in `js/assessments/personalization.mjs`. New industries, departments, and objectives can be added there without creating a new page or scoring engine. Marketing currently exposes the requested 17 general objectives plus a relevant sector objective. Other departments have focused objective banks rather than marketing labels copied into unrelated contexts.

## Modular question construction

`tailorAssessment(baseDefinition, profile)` clones the base definition. It never mutates the registry. The tailored definition retains every original dimension, question, ID, weight, result safeguard, and limitation, then adds a compact **CEAM+ implementation conditions** dimension assembled from five modules:

- CEAM+ core conditions;
- industry application;
- size and operating complexity;
- department coordination; and
- current objective.

Each added question records `module` and `constructId`. Industry prompts can also be added to relevant marketing dimensions while preserving their underlying construct. Tailoring updates actions, KPIs, evidence suggestions, and follow-up questions as well as wording. A microbusiness receives practical, lightweight actions; a large or multi-department organization receives coordination, ownership, governance, and integration actions. Employee count never awards maturity points.

Restaurant, retail, construction/trades, and corporate marketing include specific application language and evidence. Other configured sectors include their own operating setting, resource needs, evidence examples, actions, KPIs, marketing topics, and one sector objective.

## Comparison and storage identity

`profileSignature(profile)` produces a stable `personalization-v1` signature from industry, size, department, and objective IDs. Local drafts and results include this signature in their storage partition. Baseline and follow-up comparisons therefore require the same assessment ID, version, context, initiative, and full personalization profile.

The completed definition snapshot is stored with an explicitly saved result. This keeps the report readable if future configuration changes. Starting a follow-up carries the same profile and definition snapshot but clears answers, evidence, metrics, actions, result ID, and completion date.

## Limits and future validation

Personalization improves contextual fit; it does not validate the instrument. Industry examples and weights require expert review and pilot testing. Future work should examine content validity, response burden, accessibility, scoring sensitivity, comparability across modules, criterion relationships, and whether recommendations are useful for organizations of different sizes. Higher-stakes use also needs explicit evidence provenance, respondent/cohort metadata, permissions, retention policy, and review governance.

Run `node --test tests/assessment-personalization.test.mjs` to check configuration coverage, dynamic objectives, profile validation, modular construction, context-specific questions and recommendations, and the absence of size-based pre-scoring.
