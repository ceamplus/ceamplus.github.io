# Future CEAM+ Database Migrations

Create versioned Supabase migrations in this folder when the CEAM+ database design is approved.

Planned data areas:

- Client profiles
- Assessment submissions and complete responses
- AI tool recommendations
- Support and personalized-guide requests
- CEAM+ implementation plans and progress

Security requirements for every future migration:

- Enable Row Level Security on exposed tables.
- Link client-owned rows to `auth.uid()`.
- Add explicit grants only for roles that need Data API access.
- Keep privileged keys and administrative operations out of browser code.

No live database tables are created by this file.
