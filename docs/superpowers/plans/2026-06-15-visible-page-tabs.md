# CEAM+ Visible Page Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent two-row header with nine visible section tabs and a highlighted current-page state.

**Architecture:** Keep the existing static HTML structure and shared stylesheet. Each page owns its static `aria-current` state, while CSS places the brand/action in row one and the navigation in row two.

**Tech Stack:** HTML, CSS, PowerShell regression test, Playwright visual verification.

---

### Task 1: Expand the Navigation Test

**Files:**
- Modify: `tests/site-navigation.test.ps1`

- [ ] Require all nine section links on every main page.
- [ ] Require exactly one `aria-current="page"` link matching the current page.
- [ ] Require CSS rules that place navigation on the second header row.
- [ ] Run the test and confirm it fails before production edits.

### Task 2: Update Main Page Navigation

**Files:**
- Modify: `index.html`
- Modify: `framework.html`
- Modify: `mission.html`
- Modify: `values.html`
- Modify: `assessments.html`
- Modify: `workflow.html`
- Modify: `ai-solutions.html`
- Modify: `about.html`
- Modify: `contact.html`
- Modify: `applications.html`

- [ ] Add Home, Layers, Mission, Values, Assessments, Guides, AI Tools, About, and Contact Me.
- [ ] Mark the matching tab with `aria-current="page"`.
- [ ] Keep Applications accessible through the Layers content even though it is not a primary tab.

### Task 3: Create the Two-Row Header

**Files:**
- Modify: `styles.css`

- [ ] Use a two-column grid for the brand row.
- [ ] Place navigation across the full second row.
- [ ] Add a visible current-tab treatment.
- [ ] Keep the tab row horizontally scrollable on small screens.

### Task 4: Verify

**Files:**
- Verify: `tests/site-navigation.test.ps1`
- Verify: all main HTML pages
- Verify: `styles.css`

- [ ] Run the structural regression test.
- [ ] Run JavaScript syntax checks.
- [ ] Render desktop and mobile screenshots.
- [ ] Click representative tabs and confirm the destination and active state.
- [ ] Run `git diff --check`.

