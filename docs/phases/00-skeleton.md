# Phase 0 — Skeleton

## Goal
HQ is on AJ's Home Screen and he is logged in on iPhone and iPad.

## Prerequisites (AJ)
- Supabase project (Singapore) with the Email provider on and the "Magic Link" email template edited to show the 6-digit code (`{{ .Token }}`) instead of a link. No GitHub login. AJ signs up once with his email; "Allow new users to sign up" can be switched off afterwards. Project URL and anon key added as Cloudflare Pages environment variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Cloudflare Pages connected to this repo; `hq.alvacy.com` pointed at it.

## Build
- Vite + React + TypeScript + Tailwind project at the repo root, PWA via vite-plugin-pwa (manifest, icons placeholder, offline shell, standalone display).
- Email + 6-digit code login via Supabase Auth: `signInWithOtp({ email })`, then `verifyOtp({ email, token, type: 'email' })`. The code is typed inside the app so it works in the iOS Home Screen app (an emailed link would open Safari and not log the app in). Plain login screen with two steps: email, then code. Only AJ's account is expected. Add an RLS-level check so only his user id can read or write data, even if signups stay on.
- App shell: bottom tab bar on phone (<768 px), sidebar on iPad. Tabs: Today, People, Team, Content, More (Calendar, Trips, Money, Word, Launcher). Each is an empty screen with its title.
- Design tokens: Cloudlight palette (soft blue, white canvas, orange accent), Sora for headings, Manrope for body, spacing, radius, safe-area handling.
- `supabase/migrations/0001_init.sql`: enable extensions needed later, create an `app_owner` check so RLS policies can limit rows to the single logged-in user.
- README: how deploys and previews work.

## Done when (AJ tests on iPhone)
1. Open the preview/production link in Safari, enter his email, receive the code, type it, and land in the app.
2. Share → Add to Home Screen; open it from the icon, log in with the emailed code inside the Home Screen app, and stay logged in after closing and reopening it.
3. Tab bar works; each tab shows its title.
4. iPad shows the sidebar layout.
5. Logging out and in again works; a logged-out visitor sees only the login screen.
