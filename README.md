# HQ

AJ's personal work app. A PWA on iPhone and iPad, built with React, TypeScript, Vite, Tailwind and Supabase.
The spec is in `docs/SPEC.md`, the build plan in `docs/phases/`.

## How deploys work

Cloudflare Workers Builds is connected to this repo (Worker name `hq`). `wrangler.jsonc` tells it to serve `dist/` as a single-page app.

- **Production:** every push to `main` builds and goes live at `hq.alvacy.com`.
- **Previews:** every pull request branch gets a preview URL. Cloudflare posts it on the PR (the "Workers Builds: hq" check, Details link). Open it on the iPhone to test before merging.
- **Build settings:** build command `npm run build`, deploy command `npx wrangler deploy`, non-production branch deploy command `npx wrangler versions upload`, with non-production builds and preview URLs turned on. Node 22 comes from `.node-version`.
- **Build variables** (Worker → Settings → Build → Variables and secrets; they must be *build* variables because Vite bakes them in at build time):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

  These are public by design (the anon key only works within RLS). Real secrets go in Supabase Edge Function secrets, never here.

If the app shows "Supabase belum disambung", the two build variables are missing. Add them and retry the build.

## Login

Email only. Supabase sends one email with a magic link and a 6-digit code.

- In Safari, tapping the link logs in.
- In the Home Screen app, type the code. A tapped link always opens Safari, which keeps separate storage from the Home Screen app.

Supabase settings this depends on:

- Auth → Email provider on. Email template "Magic Link" contains both `{{ .ConfirmationURL }}` and `{{ .Token }}`.
- Auth → URL Configuration: Site URL `https://hq.alvacy.com`. Redirect URLs include `https://hq.alvacy.com/**` and the preview pattern `https://*-hq.<your-subdomain>.workers.dev/**`, otherwise the magic link on a preview falls back to production.
- After AJ's first login, "Allow new users to sign up" can be switched off.

## Database

Migrations live in `supabase/migrations/`, numbered, never edited after they run. Apply them in order (Supabase SQL editor, or Claude through the Supabase connector).

`0001_init.sql` makes the first account that signs up the owner (`app_owner`). Every table gets RLS with `public.is_owner()`, so a second account sees nothing even if signups stay on.

## Local dev (optional)

```
cp .env.example .env   # fill in the two values
npm install
npm run dev
```

`npm run typecheck` and `npm run build` must pass before every PR.
