# CEAM+ Version 1 Refocus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Present CEAM+ Version 1 as a practical, human-centered path from awareness to successful action for individuals and small businesses.

**Architecture:** Preserve the existing static multi-page GitHub Pages site and its assessment JavaScript. Replace only the homepage content hierarchy, refine the mission page content hierarchy, add shared responsive presentation classes, and update client-facing email copy.

**Tech Stack:** Semantic HTML, CSS, vanilla JavaScript, GitHub Pages, Zapier webhook integration.

---

### Task 1: Refocus the Homepage

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

- [ ] Replace the technology-first hero with the approved action-first copy and assessment/guide buttons.
- [ ] Add the mission, five layers, audience paths, philosophy, and final call-to-action sections.
- [ ] Preserve all existing navigation destinations, logo assets, and footer identity.
- [ ] Add responsive CSS for the new sections without removing assessment or existing page styles.

### Task 2: Expand the Mission Page

**Files:**
- Modify: `mission.html`
- Modify: `styles.css`

- [ ] Lead with the approved Version 1 mission and implementation-gap explanation.
- [ ] Add the value list and five CEAM+ layers with plain-language questions.
- [ ] Preserve the existing values and place broader sectors under future applications.
- [ ] Keep assessment and contact pathways available.

### Task 3: Update Client Email Copy

**Files:**
- Modify: `script.js`

- [ ] Replace the assessment-results follow-up sentence with the new support address.
- [ ] Replace the support-request confirmation follow-up sentence with the same support address.
- [ ] Leave admin recipients, Zapier fields, assessment calculations, and support-request behavior unchanged.

### Task 4: Verify and Publish

**Files:**
- Test: `index.html`
- Test: `mission.html`
- Test: `script.js`
- Test: `styles.css`

- [ ] Run JavaScript syntax validation.
- [ ] Verify all local page links resolve.
- [ ] Verify required homepage and mission copy is present.
- [ ] Verify the email templates contain the new support address.
- [ ] Render desktop and mobile views and inspect for overflow or overlap.
- [ ] Review the git diff, commit, and push the current publishing branch.

### Task 5: Expand CEAM+ Into the Human Adaptation Framework

**Files:**
- Modify: `applications.html`
- Modify: `workflow.html`
- Modify: `about.html`
- Modify: `assessments.html`
- Modify: `contact.html`
- Modify: `script.js`
- Modify: `styles.css`

- [ ] Preserve the simple five-layer public model and add the nine-layer expanded model.
- [ ] Add plain-language, personal-use, small-business, and optional advanced explanations for every expanded layer.
- [ ] Preserve every existing assessment question and context while adding Emotional, Agency, Human-AI Partnership, and Growth & Meaning questions.
- [ ] Reclassify the existing Plus questions under CEAM+ Continuous Improvement.
- [ ] Expand assessment scoring and result narratives to all nine layers.
- [ ] Update public support language without changing webhook routing or saved data.
