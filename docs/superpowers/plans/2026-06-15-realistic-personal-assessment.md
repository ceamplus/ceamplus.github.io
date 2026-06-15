# Realistic Personal Assessment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the complete personal assessment around realistic daily-life pressures, setbacks, relationships, and personal goals without breaking scoring or automation.

**Architecture:** Expand the existing `personal` category overrides so every shared template receives personal wording and choices. Rewrite the nine personal-only additions for family, work, money, privacy, support, and setback recovery while preserving IDs and data contracts.

**Tech Stack:** Vanilla JavaScript, static HTML/CSS, GitHub Pages, Playwright/Edge verification.

---

### Task 1: Cover every shared template

**Files:**
- Modify: `script.js`

- [ ] List every `questionTemplates` ID and compare it with personal override IDs.
- [ ] Add personal overrides for all missing cognitive, emotional, agency, trust, environment, adoption, partnership, growth, and improvement questions.
- [ ] Keep question IDs, phase IDs, indicators, and question types unchanged.

### Task 2: Add realistic life situations

**Files:**
- Modify: `script.js`

- [ ] Include children, family, caregiving, work stress, money, household load, health routines, and relationship demands.
- [ ] Include realistic fear, guilt, shame, exhaustion, frustration, and confidence options.
- [ ] Include setback triggers, effects, and recovery actions without diagnostic language.

### Task 3: Improve personal-only questions

**Files:**
- Modify: `script.js`

- [ ] Rewrite all nine personal additions around practical daily-life situations.
- [ ] Preserve option-score alignment and existing indicator mapping.

### Task 4: Verify compatibility and rendering

**Files:**
- Test: `script.js`
- Test: `assessments.html`

- [ ] Run JavaScript syntax checks.
- [ ] Verify every shared template has a personal override.
- [ ] Verify option-score lengths.
- [ ] Verify 58 questions and nine phases.
- [ ] Render the personal assessment on desktop and mobile.
- [ ] Verify full-answer client and administrator emails.
- [ ] Run `git diff --check`.

