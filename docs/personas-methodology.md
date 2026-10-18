# CEAM+ Personas — methodology and implementation, October 2026

CEAM+ personas represent circumstances, constraints, goals, and forms of agency rather than demographic destiny. They are used to expose overlooked questions, test accessibility, and improve implementation guidance. They are not predictions of how a group will behave.

## Prior work and implementation

The complete working-tree search (including hidden files, cached release/baseline copies, filenames, and relevant Git history) found a Customer Persona Builder placeholder in `analytics-lab.html` and existing persona terms in `ai-analysis-definition.mjs` and `ai-analysis.mjs`. No working persona page, library, or builder was found. The Lab placeholder now links to the working section; existing AI analysis terminology is retained. Assessment personalization is separate and is not a persona scoring mechanism.

The first-class `personas.html` page is in every root page's primary navigation. Four primary destinations plus Explore use one desktop navigation row and two compact mobile navigation rows. Existing destinations, current-page markers, native disclosure behavior, and keyboard controls remain.

## Initial library: fictional, unvalidated, expandable

All 16 profiles are constructed composites, not participant records or accounts of real individuals. No profile has had lived-experience review. Names and all biographical details are fictional. General W3C accessibility and ITU connectivity references provide design context only; they do not validate a profile or support any demographic prediction.

| Fictional profile | Context and location |
| --- | --- |
| Mara Ellis | Small-business owner, rural Appalachia, Kentucky; intermittent connection |
| Eli Mercer | Manufacturing employee, small Southern community, Mississippi; required use |
| Nora Vale | Cooperative manager, agricultural Iowa; seasonal work |
| Tess Morgan | Customer and parent, midsized Alabama city; mobile service access |
| Dev Rowan | Student, Chicago; frequent voluntary AI use |
| Iris Lane | Caregiver returning to work, suburban New Jersey; shared device |
| Rowan Bell | Community nonprofit coordinator, unspecified Indigenous community; provisional, community deliberation required |
| Ama Doran | Nonprofit worker, Accra, Ghana; reporting and consent |
| Ravi Sen | Contractor, Pune, India; client-required AI and variable income |
| Lea Winter | Educator, Leipzig, Germany; optional institutional pilot |
| Lucia Mar | Public-sector worker, Medellín, Colombia; screen-reader compatibility |
| Nia Clarke | Healthcare administrator, Kingston, Jamaica; administrative messaging only |
| Sam Avery | Independent technology user, London; voice input and keyboard alternatives |
| Jo Linden | Retired technician, rural West Virginia; experienced experimentation |
| Alex Brook | Workforce entrant, fictional Detroit locality facing job losses; library devices |
| Ren Santos | Employee and parent, Manila; required AI use and shifting schedules |

The Indigenous-community profile deliberately names no Nation and makes no claim about traditions, governance, or community consent. Local authority, stewardship, and review are unknown. It is a provisional invitation to community-led co-design, not a representation of a Nation's views.

## Interactions and privacy

Twelve filters combine role, location, community, industry, organization size, technology access, AI experience, cognitive availability, economic security, accessibility, language, and adoption circumstances. Profiles disclose full circumstances and assumptions. Compare two or three profiles using shared recorded goals, constraints, access, agency, support, benefits, burdens, evidence gaps, and questions. Mobile comparisons stack with repeated names rather than forcing unreadable columns.

Custom scenarios use automatically assigned neutral labels, with no name/contact field. Optional fields support unknowns and Prefer not to answer. Users can edit, duplicate, compare, export, and delete. Storage is opt-in under `ceamplus.personas.custom.v1`, separate from assessment storage. Blocked storage retains current-tab use and export; failure notices do not claim persistence. An explicit delete attempts to remove an existing saved copy even when future saving is off. Text is escaped and free text is not put in integration URLs.

Explore-as-persona opens an isolated demonstration with contextual questions, shorter explanations, larger text, and an unscored language-check exercise. Library-only IDs may open Dashboard or assessment demo guidance. Real assessment or saved-result routes take precedence. Custom personas stay in their own demonstration panel. Persona modules do not import assessment scoring or assessment storage. They never prefill assessment answers or alter scores. Changing personas must leave identical fictional assessment answers producing identical scores.

## Detailed location selections (October 18, 2026)

The Location filter groups choices into countries, states/regions, and cities/local settings. Country and regional selections match the recorded settings; local selections retain existing location values so saved custom scenarios remain compatible. Detailed labels also appear in the builder. Named cities include their state or region where specified; unnamed towns, cities, neighborhoods, and the provisional Indigenous community remain explicitly unspecified. Geographic labels describe fictional settings and do not infer preferences or alter scoring. Targeted verification covers nine persona unit tests and the Personas browser workflow, including country/region filtering, builder labels, custom editing, saved assessment preservation, and four viewport widths.

## Creation, review, updates, retirement

The location catalogue now includes all 50 U.S. states in both library filtering and the custom builder, even when no library profile is set there. Empty matches do not generate new personas. Custom scenarios saved with a state retain that selection through editing, export, and reload and match both the state and country filters. State coverage in the selector is not research coverage in the fictional library.

1. Identify an overlooked practical question and construct explicit circumstances, not a demographic behavioral rule. Do not use identifiable participant information.
2. Record which details are fictional, assumptions, unknowns, and any source supporting a general condition. Keep research context separate from person-specific claims.
3. Seek voluntary, appropriately compensated review with relevant lived experience. Record consent, scope, date, disagreements, and what review did not establish. Community-specific work requires locally appropriate authorization; no reviewer speaks for an entire group.
4. Test counterexamples and accessibility with the people and assistive tools involved. Record limitations; coverage alone does not validate a persona.
5. Increment the profile version and update date when circumstances or interpretations change. Explain revisions in documentation; retain earlier exported snapshots. Never silently change saved user-created scenarios.
6. Retire misleading, redundant, or unsupported profiles by removing them from the active library in a reviewed code change and recording the reason and last version. Old exports remain historical fictional artifacts, not current recommendations. Invalid/retired IDs must not fall back to an unrelated persona.

## Representation review and missing perspectives

The page counts library profiles only and exposes concentration across geography, role, industry, resources, access, life stage, language, accessibility, and experience. The United States and English-language contexts are concentrated. Income is represented as a fictional resource circumstance, not inferred wealth. Counts are not population estimates or diversity-validity scores.

Missing or thin perspectives include Oceania, Central Asia, the Middle East, displaced and stateless people, people without stable housing, children's direct perspectives, Deaf sign-language users, multiple access needs, informal agricultural labor, and no usable internet. Each international setting is sparse. Specific Tribal Nations are intentionally not represented without community-led development. All profiles need lived-experience review.

## Files and verification

New: `personas.html`, `styles-personas.css`, five modules under `js/personas/` (`library`, `custom`, `demo`, `context`, `app`), two persona test files, and this document. Existing root HTML headers and `styles-header.css` expose the new destination. Dashboard and Assessment Center load isolated persona guidance; the Lab placeholder is expanded. Four navigation tests reflect the added destination.

Eight unit tests cover library completeness, filtering, exact shared goals, representation counts, demographic isolation, custom privacy, separate persistence, and blocked/malformed storage. Browser coverage exercises navigation, 2/3 comparisons, four viewport widths, keyboard controls, evidence disclosures, identical demo scoring, saved-result preservation, custom CRUD/export, sensitive opt-outs, and blocked storage. Final verification on October 18, 2026: 143 unit tests, all 19 browser scripts, five PowerShell suites, and syntax checks for 53 JavaScript files pass. The browser run initially passed 18 scripts; the remaining survey integration script passed after its obsolete navigation count was updated for Personas. Browser checks are not a complete screen-reader or WCAG certification.
