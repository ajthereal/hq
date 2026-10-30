# Phase 0 — Skeleton

## Goal
HQ is on AJ's Home Screen and he is logged in on iPhone and iPad.

## Prerequisites (AJ)
- Supabase project (Singapore) with the GitHub provider on (GitHub OAuth app created by AJ, client ID and secret pasted into Supabase). No email magic link: it does not carry into the iOS Home Screen app. Project URL and anon key added as Cloudflare Pages environment variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Cloudflare Pages connected to this repo; `hq.alvacy.com` pointed at it.

## Build
- Vite + React + TypeScript + Tailwind project at the repo root, PWA via vite-plugin-pwa (manifest, icons placeholder, offline shell, standalone display).
- "Sign in with GitHub" via Supabase Auth (`signInWithOAuth`, provider github). One button on a plain login screen, no sign-up flow. Only AJ's account is expected; after his first login AJ turns off "Allow new users to sign up" in Supabase. Also add an RLS-level check so only his user id can read or write data.
- App shell: bottom tab bar on phone (<768 px), sidebar on iPad. Tabs: Today, People, Team, Content, More (Calendar, Trips, Money, Word, Launcher). Each is an empty screen with its title.
- Design tokens: Cloudlight palette (soft blue, white canvas, orange accent), Sora for headings, Manrope for body, spacing, radius, safe-area handling.
- `supabase/migrations/0001_init.sql`: enable extensions needed later, create an `app_owner` check so RLS policies can limit rows to the single logged-in user.
- README: how deploys and previews work.

## Done when (AJ tests on iPhone)
1. Open the preview/production link in Safari, tap Sign in with GitHub, and land in the app.
2. Share → Add to Home Screen; open it from the icon, sign in with GitHub inside the Home Screen app, and stay logged in after closing and reopening it. If the login does not return to the Home Screen app, stop and report it so email-code login can be added as a fallback.
3. Tab bar works; each tab shows its title.
4. iPad shows the sidebar layout.
5. Logging out and in again works; a logged-out visitor sees only the login screen.
