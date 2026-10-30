# Phase 0 — Skeleton

## Goal
HQ is on AJ's Home Screen and he is logged in on iPhone and iPad.

## Prerequisites (AJ)
- Supabase project (Singapore) with the Email provider on and the "Magic Link" email template edited to include both the magic link (`{{ .ConfirmationURL }}`) and the 6-digit code (`{{ .Token }}`). No GitHub login. AJ signs up once with his email; "Allow new users to sign up" can be switched off afterwards. Project URL and anon key added as Cloudflare Pages environment variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Cloudflare Pages connected to this repo; `hq.alvacy.com` pointed at it.

## Build
- Vite + React + TypeScript + Tailwind project at the repo root, PWA via vite-plugin-pwa (manifest, icons placeholder, offline shell, standalone display).
- Email login via Supabase Auth: `signInWithOtp({ email })`. The email has a magic link and a 6-digit code. The login screen has two steps (email, then a code box with the text "Atau ketuk link di email"); the code is verified with `verifyOtp({ email, token, type: 'email' })`. The code path is what logs in the iOS Home Screen app, because a tapped link opens Safari, which has separate storage from the Home Screen app. The link path must also work in Safari and set `emailRedirectTo` to the HQ site URL. Plain login screen with two steps: email, then code. Only AJ's account is expected. Add an RLS-level check so only his user id can read or write data, even if signups stay on.
- App shell: bottom tab bar on phone (<768 px), sidebar on iPad. Tabs: Today, People, Team, Content, More (Calendar, Trips, Money, Word, Launcher). Each is an empty screen with its title.
- Design tokens: Cloudlight palette (soft blue, white canvas, orange accent), Sora for headings, Manrope for body, spacing, radius, safe-area handling.
- `supabase/migrations/0001_init.sql`: enable extensions needed later, create an `app_owner` check so RLS policies can limit rows to the single logged-in user.
- README: how deploys and previews work.

## Done when (AJ tests on iPhone)
1. Open the preview/production link in Safari, enter his email, tap the magic link in the email, and land in the app.
2. Share → Add to Home Screen; open it from the icon, log in with the 6-digit code from the email inside the Home Screen app, and stay logged in after closing and reopening it.
3. Tab bar works; each tab shows its title.
4. iPad shows the sidebar layout.
5. Logging out and in again works; a logged-out visitor sees only the login screen.
