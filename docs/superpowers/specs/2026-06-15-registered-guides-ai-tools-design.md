# Registered Access for Guides and AI Tools

## Goal

Make the full Guides and AI Tools sections available only to registered,
verified, and manually approved users. Public visitors should still see a short
preview so they understand what the sections offer before requesting access.

## Approved Direction

- Require email and password accounts.
- Require email verification.
- Require manual owner approval before full access unlocks.
- Use Zapier and email for the approval notification workflow.
- Use Supabase as the actual login and access-control system.
- Rename the site navigation label from `Contact Me` to
  `Contact a Consultant`.

## Public Experience

Visitors can open the Guides and AI Tools tabs, but they only see:

- A short preview of what is available.
- A clear message that full access is for registered approved users.
- Sign in and request access controls.
- A contact consultant link for people who need help.

The preview should avoid revealing full private guide libraries, detailed
implementation tools, or client-only resources.

## Registered User Experience

1. User creates an account with email and password.
2. User verifies their email through Supabase Auth.
3. User sees a pending-approval message.
4. Zapier emails the site owner an approval button/link.
5. Site owner clicks the approval link.
6. The user's profile is marked approved in Supabase.
7. The user signs in and can view full Guides and AI Tools content.

If the user is signed in but not approved, the page should not reveal the
locked content. It should show a calm pending message.

## Architecture

### Static GitHub Pages

The GitHub Pages site remains static and beginner-friendly. It should include:

- `auth.html` for sign in, registration, and status messages.
- `auth-config.example.js` for public Supabase URL and publishable/anon key
  placeholders.
- `auth.js` for browser-side sign in, sign up, sign out, and session checks.
- Guarded sections on `workflow.html` and `ai-solutions.html`.

No service role key, secret key, database password, or Zapier approval secret
may be committed to the website.

### Supabase

Supabase should handle:

- Email/password authentication.
- Email verification.
- User profiles.
- Approval status.
- Row Level Security.
- A server-side approval function.

Suggested tables:

```sql
profiles
access_requests
approval_tokens
```

Suggested `profiles` fields:

```text
id uuid primary key references auth.users(id)
email text not null
full_name text
approval_status text not null default 'pending'
approved_at timestamptz
created_at timestamptz default now()
```

Suggested `access_requests` fields:

```text
id uuid primary key default gen_random_uuid()
user_id uuid references auth.users(id)
email text not null
requested_sections text[]
status text not null default 'pending'
created_at timestamptz default now()
approved_at timestamptz
```

Suggested `approval_tokens` fields:

```text
id uuid primary key default gen_random_uuid()
user_id uuid references auth.users(id)
token_hash text not null
used_at timestamptz
expires_at timestamptz not null
created_at timestamptz default now()
```

### Zapier Email Approval

The browser should not generate or expose approval power. Instead:

1. The signed-in user requests access.
2. A Supabase Edge Function creates a secure approval token.
3. The function sends request details to Zapier.
4. Zapier emails the owner with an `Approve Access` button.
5. The approval button opens a Supabase Edge Function URL with the token.
6. The function validates the token and updates Supabase approval status.

Zapier can also add or update a Google Sheet row for easy review history, but
the Sheet is not the security source of truth.

## Bot Protection

Use Supabase-supported CAPTCHA protection for registration if configured in the
project. If CAPTCHA keys are not ready yet, the first version should still keep
manual approval required so bots cannot unlock Guides or AI Tools on their own.

## Security Rules

- Never commit real Supabase keys except a browser-safe publishable/anon key in
  a deliberately named public config file after Row Level Security is in place.
- Never expose a service role key in GitHub Pages.
- Never use user-editable metadata as the approval source.
- Full access checks must read trusted database approval status.
- Users may read only their own profile and request status.
- Only the approval Edge Function may approve a user.

## Testing

Automated checks should verify:

- Navigation says `Contact a Consultant` on all pages.
- Guides and AI Tools include preview and locked-access messaging.
- Auth config example exists and contains no real keys.
- No committed file contains a service role key placeholder or private secret.

Manual checks should verify:

- Public visitor sees preview only.
- New user can request access.
- Unapproved user remains locked.
- Approved user can view full content.
- Approval email button marks the right user approved.

## Open Implementation Notes

The current repository has no committed `.env` file and no live Supabase tables
yet. The first implementation should prepare the website and migration files
without committing real secrets. The owner will still need to paste the public
Supabase URL and publishable/anon key into the approved public config file when
the hosted Supabase project is ready.

