-- CEAM+ assessment storage schema for Supabase/PostgreSQL.
-- Run this in the Supabase SQL editor after creating a project.
-- Keep service-role database keys on a backend only. Do not place them in GitHub Pages.

create extension if not exists pgcrypto;

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  organization_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_email_idx on clients (lower(email));

create table if not exists assessment_submissions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  assessment_id text not null,
  assessment_title text not null,
  assessment_version text not null,
  score integer not null check (score >= 0 and score <= 100),
  readiness_profile text not null,
  support_level text,
  submitted_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  completion_seconds integer,
  source_url text,
  raw_result jsonb not null
);

create index if not exists submissions_assessment_idx on assessment_submissions (assessment_id);
create index if not exists submissions_profile_idx on assessment_submissions (readiness_profile);
create index if not exists submissions_submitted_idx on assessment_submissions (submitted_at desc);

create table if not exists assessment_responses (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references assessment_submissions(id) on delete cascade,
  question_id text not null,
  question_label text,
  phase_id text not null,
  answer jsonb not null,
  follow_up_answer jsonb,
  note text,
  indicators text[] default '{}',
  answered_at timestamptz not null default now()
);

create index if not exists responses_submission_idx on assessment_responses (submission_id);
create index if not exists responses_phase_idx on assessment_responses (phase_id);
create index if not exists responses_question_idx on assessment_responses (question_id);

create table if not exists assessment_results (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references assessment_submissions(id) on delete cascade,
  layer_scores jsonb not null,
  indicators jsonb not null,
  selected_tasks jsonb default '[]'::jsonb,
  observations jsonb not null,
  barriers jsonb not null,
  recommendations jsonb not null,
  ai_tools jsonb not null,
  implementation_plan jsonb not null,
  generated_summary text,
  created_at timestamptz not null default now()
);

create table if not exists workflow_analytics (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references assessment_submissions(id) on delete set null,
  assessment_id text,
  event_type text not null,
  phase_id text,
  question_id text,
  event_payload jsonb default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists analytics_assessment_idx on workflow_analytics (assessment_id);
create index if not exists analytics_event_idx on workflow_analytics (event_type);
create index if not exists analytics_time_idx on workflow_analytics (occurred_at desc);

create table if not exists email_events (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references assessment_submissions(id) on delete set null,
  recipient_type text not null,
  recipient_email text not null,
  provider text not null default 'zapier',
  status text not null,
  sent_at timestamptz,
  error_message text,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security. A server-side API should write using the service role key.
alter table clients enable row level security;
alter table assessment_submissions enable row level security;
alter table assessment_responses enable row level security;
alter table assessment_results enable row level security;
alter table workflow_analytics enable row level security;
alter table email_events enable row level security;
