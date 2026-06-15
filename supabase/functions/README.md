# CEAM+ Edge Function Templates

These templates prepare the email-button approval flow for registered Guides and
AI Tools access.

Required function secrets:

```text
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_URL
ZAPIER_ACCESS_WEBHOOK_URL
APPROVAL_SECRET
SITE_URL
```

Do not commit real values. Add them in the Supabase dashboard or with:

```powershell
supabase secrets set NAME=value
```

The static GitHub Pages site uses only the public anon or publishable key. These
functions use private secrets server-side after deployment.
