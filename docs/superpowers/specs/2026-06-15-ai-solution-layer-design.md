# CEAM+ AI Solution Layer Design

## Goal

Expand the existing Adoption and Implementation Layer into an AI Solution and Implementation Layer that helps people choose a fit-for-purpose toolkit instead of assuming one assistant is right for every problem.

## Scope

- Preserve all current pages, assessment questions, scoring, email templates, Zapier webhook field names, and submission behavior.
- Rename layer six throughout the public framework and assessment output.
- Add a dedicated `ai-solutions.html` guide with plain-language tool evaluation.
- Cover AI assistants, research, writing, marketing, images, video, meetings, customer service, sales and CRM, productivity, data analysis, automation, agentic AI, and website development.
- Cover pathways for retail, restaurants, contractors, service businesses, professional offices, nonprofits, educational organizations, and individual users.
- Every category recommendation includes beginner, intermediate, advanced, low-cost, and free starting options.
- Tool profiles explain purpose, appropriate use, benefits, limitations, cost considerations, oversight, and skill level.
- Avoid exact prices because vendor plans change. Show relative cost guidance and tell users to verify current pricing and privacy terms.

## Information Architecture

`applications.html` remains the nine-layer framework overview. Layer six becomes a concise entry point to the detailed guide.

`ai-solutions.html` contains:

1. AI Solution Layer introduction and evaluation criteria.
2. Search and category filters.
3. Fourteen tool-category sections generated from structured data.
4. Eight implementation pathways.
5. A responsible toolkit checklist and assessment call to action.

`ai-solutions.js` owns only catalog data and guide interactions. The assessment engine remains in `script.js`.

## Assessment Recommendations

Assessment recommendations will use a structured toolkit model. Each recommendation will include:

- category and suggested tools
- what the category does
- when it fits
- benefits and limitations
- relative cost
- oversight requirement
- recommended skill level
- beginner, intermediate, advanced, low-cost, and free options

The existing `aiTools` property and Zapier field names remain intact. Richer details are added inside each `aiTools` item, so current automations continue receiving the existing flattened text field.

## Design

The new guide follows the existing CEAM+ visual system: off-white page, dark green headings, compact eight-pixel radii, restrained borders, and open full-width sections. Filters are functional controls, not decorative pills. Category results use expandable rows to avoid a wall of cards.

## Verification

- JavaScript syntax checks for `script.js` and `ai-solutions.js`.
- Local-link validation across all HTML files.
- Static checks for 14 categories, eight pathways, five option levels, and the renamed layer.
- Browser checks at desktop and mobile widths.
- Assessment submission/result check confirming nine phases and richer toolkit recommendations.
- Confirm Zapier assessment and support field names are unchanged.
