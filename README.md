# HQ

AJ's personal work app. A PWA on iPhone and iPad, built with React, TypeScript, Vite, Tailwind and Supabase.
The spec is in `docs/SPEC.md`, the build plan in `docs/phases/`.

## How deploys work

Cloudflare Pages is connected to this repo.

- **Production:** every push to `main` builds and goes live at `hq.alvacy.com`.
- **Previews:** every pull request gets its own preview link. Cloudflare posts it on the PR (the "Cloudflare Pages" check or comment). Open that link on the iPhone to test before merging.
- **Build settings:** framework preset None, build command `npm run build`, output directory `dist`. Node 22 comes from `.node-version`.
- **Environment variables** (Pages project → Settings → Variables, set for both Production and Preview):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

  These are public by design (the anon key only works within RLS). Real secrets go in Supabase Edge Function secrets, never here.

If the app shows "Supabase belum disambung", the two variables are missing for that environment. Add them and retry the deploy.

## Login

Email only. Supabase sends one email with a magic link and a 6-digit code.

- In Safari, tapping the link logs in.
- In the Home Screen app, type the code. A tapped link always opens Safari, which keeps separate storage from the Home Screen app.

Supabase settings this depends on:

- Auth → Email provider on. Email template "Magic Link" contains both `{{ .ConfirmationURL }}` and `{{ .Token }}`.
- Auth → URL Configuration: Site URL `https://hq.alvacy.com`. Redirect URLs include `https://hq.alvacy.com/**` and the preview pattern `https://*.<pages-project>.pages.dev/**`, otherwise the magic link on a preview falls back to production.
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
