# CEAM+ Nine-Layer Images Implementation Plan

**Goal:** Add the approved right-side desktop image and mobile banner treatment
to all nine expanded CEAM+ layer cards.

**Architecture:** Add one reusable local image asset per layer, reference those
assets from both layer pages, and extend the existing card CSS with a responsive
two-column layout.

**Tech Stack:** Static HTML, CSS, PowerShell regression tests, Playwright visual
verification.

## Tasks

1. Add a failing structural test requiring nine local layer images on both
   pages, with alt text and lazy loading.
2. Add nine project-local visual assets under `assets/layers/`.
3. Add image figures to each expanded card in `framework.html` and
   `applications.html`.
4. Update `styles.css` for the approved desktop and mobile layouts.
5. Run structural tests and desktop/mobile browser verification.

