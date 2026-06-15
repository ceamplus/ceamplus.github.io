# CEAM+ AI Solution Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a practical AI Solution Layer and toolkit-selection guide while preserving assessment and Zapier compatibility.

**Architecture:** Add a standalone static guide driven by structured JavaScript data, link it from the existing framework, and enrich the existing assessment recommendation objects without renaming webhook fields. Reuse the existing HTML/CSS/JavaScript conventions.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, GitHub Pages, Playwright/Edge verification.

---

### Task 1: Add the AI solution guide

**Files:**
- Create: `ai-solutions.html`
- Create: `ai-solutions.js`

- [ ] Build semantic guide markup with search, category filtering, catalog output, pathways, and CTA.
- [ ] Define 14 category records and all user-requested tools.
- [ ] Include purpose, use case, benefits, limitations, cost, oversight, skill, and five option levels.
- [ ] Define eight audience implementation pathways.

### Task 2: Expand layer six

**Files:**
- Modify: `applications.html`
- Modify: `script.js`
- Modify: `workflow.html`

- [ ] Rename layer six to `AI Solution & Implementation Layer`.
- [ ] Add category-selection questions and a link to the detailed guide.
- [ ] Preserve the phase id `adoption` and all existing question ids for scoring compatibility.

### Task 3: Enrich assessment recommendations

**Files:**
- Modify: `script.js`

- [ ] Replace single-tool defaults with category-based toolkit recommendations.
- [ ] Add beginner, intermediate, advanced, low-cost, and free options.
- [ ] Render purpose, fit, benefits, limitations, cost, oversight, and skill level.
- [ ] Keep `aiTools`, `selectedTasks`, and every Zapier field name unchanged.

### Task 4: Style and navigation

**Files:**
- Modify: `styles.css`
- Modify: `index.html`
- Modify: `mission.html`

- [ ] Add responsive guide filters, expandable catalog rows, comparison details, and pathway layouts.
- [ ] Add clear links to the AI Solution Guide without crowding the primary navigation.
- [ ] Update cache versions for changed CSS and JavaScript.

### Task 5: Verify

**Files:**
- Test: all HTML and JavaScript files

- [ ] Run JavaScript syntax checks.
- [ ] Verify all local links.
- [ ] Confirm 14 categories, eight pathways, and five option levels.
- [ ] Confirm nine assessment phases and preserved Zapier fields.
- [ ] Run desktop/mobile browser checks and inspect screenshots.
- [ ] Run `git diff --check`.
