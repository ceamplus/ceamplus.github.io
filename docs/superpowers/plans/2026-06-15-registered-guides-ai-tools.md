# Registered Guides and AI Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a registered-user access flow for full Guides and AI Tools content while leaving short public previews visible.

**Architecture:** GitHub Pages remains static. Supabase Auth handles email/password login and verified sessions; a trusted profile approval status unlocks guarded sections. Zapier receives access-request notifications and can email the owner an approval link once Supabase Edge Functions are configured.

**Tech Stack:** Static HTML/CSS/JavaScript, Supabase Auth browser client, Zapier Catch Hook, PowerShell regression tests.

---

### Task 1: Navigation and Contact Label

**Files:**
- Modify: all top-level `.html` pages
- Modify: `tests/site-navigation.test.ps1`

- [x] Replace `Contact Me` with `Contact a Consultant` in every navigation bar.
- [x] Update the navigation regression test to expect `Contact a Consultant`.

### Task 2: Public Auth Configuration

**Files:**
- Create: `auth-config.example.js`
- Create: `auth-config.js`
- Modify: `.gitignore`

- [x] Add safe placeholder public Supabase configuration.
- [x] Include a Zapier access request type and the existing Zapier catch hook field pattern.
- [x] Keep real secrets out of committed files.

### Task 3: Login and Access Request Page

**Files:**
- Create: `auth.html`
- Create: `auth.js`
- Modify: `styles.css`

- [x] Add email/password sign in.
- [x] Add account request form.
- [x] Add pending approval, approved, signed-out, and configuration-missing states.
- [x] Send access-request payloads to Zapier when configured.

### Task 4: Lock Guides and AI Tools

**Files:**
- Modify: `workflow.html`
- Modify: `ai-solutions.html`
- Modify: `auth.js`
- Modify: `styles.css`

- [x] Keep short previews visible.
- [x] Hide full sections unless the visitor is signed in and approved.
- [x] Add login/request access calls to action.
- [x] Keep AI Tools dynamic rendering disabled until approval.

### Task 5: Supabase Preparation

**Files:**
- Add migration SQL under `supabase/migrations/`
- Add Edge Function templates under `supabase/functions/`
- Modify: `README.md`

- [x] Define `profiles` and `access_requests`.
- [x] Add RLS policies for users reading their own approval status.
- [x] Add Edge Function placeholders for secure Zapier approval-link flow.
- [x] Document the required setup steps.

### Task 6: Tests

**Files:**
- Create: `tests/registered-access.test.ps1`

- [x] Verify Guides and AI Tools contain public previews and locked content markers.
- [x] Verify auth files exist and do not contain real service-role secrets.
- [x] Verify all pages use `Contact a Consultant`.

