# CEAM+ Nine-Layer Image Design

## Goal

Make each expanded CEAM+ layer easier to recognize and scan by pairing its
content with a meaningful visual, while preserving all existing wording and
functionality.

## Approved Layout

- Desktop: content remains on the left and a full-height image fills the right
  side of each layer card.
- Mobile: the image becomes a wide banner within the card so text remains easy
  to read.
- Images contain no embedded text and do not replace layer headings or details.
- Each image uses descriptive alternative text.
- Stable image dimensions prevent layout shifting while assets load.

## Visual Direction

Use warm, realistic, human-centered editorial imagery. The images should show
people, work, decisions, support, learning, and progress rather than abstract
technology graphics. The nine subjects are:

1. Cognitive: sorting information and making a clear decision.
2. Emotional: reflection, confidence, and emotional awareness.
3. Agency: taking a practical next step.
4. Trust and Ethics: careful review, privacy, and accountability.
5. Environment: supportive people and surroundings.
6. AI Solution and Implementation: selecting and applying the right tool.
7. Human-AI Partnership: a person reviewing AI-assisted work.
8. Growth and Meaning: goals, values, and purposeful progress.
9. Continuous Improvement: reflection, measurement, and adjustment.

## Scope

Apply the image layout to the nine expanded layer cards in `framework.html` and
`applications.html`. Keep the original four-layer foundation unchanged.

## Accessibility And Performance

- Store optimized assets locally so GitHub Pages does not depend on hotlinked
  third-party images.
- Use `loading="lazy"` and `decoding="async"`.
- Preserve readable contrast because text is never placed over the images.
- Use `object-fit: cover` with a controlled focal position.

