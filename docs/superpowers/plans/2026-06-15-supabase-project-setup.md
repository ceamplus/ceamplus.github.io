# CEAM+ Supabase Project Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare the static CEAM+ GitHub Pages repository for a future Supabase backend without changing current site behavior or exposing secrets.

**Architecture:** Use the official Supabase CLI initializer to create local configuration. Store only empty environment-variable examples in Git, and document connection, security, and future database responsibilities in the README.

**Tech Stack:** Static GitHub Pages, Supabase CLI, Supabase Postgres/Auth for future work, GitHub encrypted secrets.

---

### Task 1: Initialize Supabase

**Files:**
- Create: `supabase/config.toml`

- [ ] **Step 1: Confirm the folder does not exist**

Run: `Test-Path supabase`
Expected: `False`

- [ ] **Step 2: Run the official initializer**

Run: `supabase init`
Expected: A new `supabase/config.toml` and standard Supabase support files.

- [ ] **Step 3: Inspect generated files**

Run: `Get-ChildItem supabase -Recurse -Force`
Expected: Local configuration only; no credentials.

### Task 2: Add Safe Environment Documentation

**Files:**
- Create: `.env.example`
- Modify: `.gitignore`

- [ ] **Step 1: Add empty public-client placeholders**

```dotenv
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

- [ ] **Step 2: Confirm real environment files are ignored**

Run: `git check-ignore .env`
Expected: `.env`

- [ ] **Step 3: Confirm the example remains trackable**

Run: `git check-ignore .env.example`
Expected: no output and exit code `1`.

### Task 3: Write Beginner Connection Instructions

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Explain dashboard credential locations**

Document that the project URL and anon or publishable key are available in the Supabase dashboard under the project's API settings or Connect dialog.

- [ ] **Step 2: Explain local setup**

Document copying `.env.example` to `.env`, pasting only the project URL and anon or publishable key, and never using a service-role or secret key in browser code.

- [ ] **Step 3: Explain repository linking**

Document `supabase login`, `supabase link --project-ref YOUR_PROJECT_REF`, and where to find the project reference. Mention `npx supabase` as an alternative when Node.js and npm are installed.

- [ ] **Step 4: Explain GitHub encrypted secrets**

Document adding `SUPABASE_URL` and `SUPABASE_ANON_KEY` under repository Settings, Secrets and variables, Actions only when a future workflow needs them.

- [ ] **Step 5: Document future database areas**

Describe assessments, tool recommendations, user submissions, and implementation plans, including the requirement for Row Level Security.

### Task 4: Verify Safety and Compatibility

**Files:**
- Verify: `.env.example`
- Verify: `.gitignore`
- Verify: `README.md`
- Verify: `supabase/config.toml`

- [ ] **Step 1: Scan tracked changes for credential patterns**

Run a repository search for Supabase URLs, JWT prefixes, service-role references, and non-empty credential assignments.
Expected: Documentation warnings and empty placeholders only.

- [ ] **Step 2: Confirm website files were not changed by this setup**

Run: `git diff --name-only`
Expected: Supabase setup and documentation files are added alongside pre-existing unrelated website changes.

- [ ] **Step 3: Validate Supabase configuration**

Run: `supabase --help`
Expected: CLI help exits successfully.

- [ ] **Step 4: Review Git status**

Run: `git status --short`
Expected: No `.env` file or real secret appears.
