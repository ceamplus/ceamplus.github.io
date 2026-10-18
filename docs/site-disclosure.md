# Progressive disclosure on CEAM+ content pages

## Content and navigation

Long explanations now sit inside native HTML `details` / `summary` elements.
Each closed topic shows its name and a short overview; opening it reveals the
original section, constructs, examples, research caveats, images, and links.
Research, framework, values, about, homepage and selected application pages use
the same component. Original section IDs and heading IDs remain in place.

The homepage and survey pages show **Surveys → Assessment → Dashboard → Action**.
The original five-stage evidence cycle remains available, and Analytics is
still described as the separate tool for measurable business data. Navigation,
introductory value statements, primary actions, survey context controls, survey
safeguards, and the legacy survey submission disclosure remain visible.

Only survey background and extended evidence-pathway explanations collapse.
The legacy `script.js` remains byte-identical, including its questions, scoring,
recommendations and submission workflow. `surveys.html` and the compatibility
`assessments.html` keep identical content and behavior.

## Accessibility and URL behavior

- Native summaries support keyboard activation and expose expanded state to
  assistive technology without custom ARIA state management.
- Visible focus outlines, descriptive summaries and sufficient target padding
  make the controls usable with keyboard, pointer and touch.
- Optional page controls expand or collapse the topic sections. Without
  JavaScript they stay hidden; individual native disclosures still work.
- `js/site-disclosure.js` opens every ancestor disclosure for an existing hash
  target on initial load, hash changes and same-page link clicks. This preserves
  older deep links, including links inside nested research propositions.
- Printing temporarily opens all main-content disclosures, including nested
  details, then restores the prior open state. Print CSS also exposes content
  and avoids printing the expand/collapse toolbar.

No persistence, analytics or network requests are added by this helper. Open
states belong to the current page view only.

## Verification

The original survey engine hash and existing navigation/research/auth/content
tests remain applicable. Browser checks cover native keyboard toggling,
expand/collapse controls, old deep links and nested disclosures, printable
content and restored open state, visible survey controls and safeguards, and
mobile overflow. Content preservation is checked during transformation using
the original text-token counts; only additional summaries and navigation are
introduced.
