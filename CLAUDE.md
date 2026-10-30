# HQ — rules for Claude Code

HQ is a single-user personal work app for Ivan Jonathan (AJ), installed as a PWA on iPad and iPhone. AJ has **no computer**: everything is built, reviewed and tested from the Claude app, Safari and the GitHub app.

## Read first
- `docs/SPEC.md` is the source of truth.
- `docs/phases/NN-*.md` is the current phase. Read the SPEC and the phase file before writing code. Touch only that phase's module.

## Stack (fixed)
React + TypeScript + Vite + Tailwind + vite-plugin-pwa + supabase-js. Supabase Edge Functions for Google, push and Meta. pg_cron for nightly jobs. No Next.js, no extra frameworks, no new dependencies without saying why in the PR.

## Rules
- Phone first: works at 390 px and iPad 1024 px, 44 px tap targets, safe-area insets.
- Single user. Do not build multi-user, roles, sharing or team logins.
- Every database change is a new numbered migration in `supabase/migrations/`. Never edit an old migration. Row-level security on every table.
- Secrets only in Edge Functions or environment variables, never in the app bundle, never committed.
- No tax IDs, bank or card numbers in any table or file.
- Time zone WIB (Asia/Jakarta). Money in IDR formatting. UI copy in AJ's mixed Indonesian-English, aku/kamu voice.
- **Nothing-missed rule:** Today must never hide a task. Overdue items stay pinned until done or snoozed to a date. Undated items show in an Inbox strip with a count. See SPEC section 3. Do not weaken this.
- Calendar meetings added from HQ default to 2 hours on the AJ Jonathan calendar.
- Design must not look AI-generated or templated: Tiimo-style direction approved by AJ (see `app/index.html`): near-black or warm off-white canvas, soft pastel icon chips, pill section headers, Fraunces + DM Sans, small type. Dark and light mode. Real content, restrained, no generic gradients or stock-looking cards. Layouts for iPhone, iPad and Mac. Use the frontend-design skill for new screens.
- Copy that is in AJ's voice must not read as AI-written. No colon setups like "Yang bikin beda: ...", no filler hype.

## Workflow
- Work on a branch, open a pull request per phase. Never push to main directly after Phase 0.
- Keep changes small and inside the phase.
- Before finishing every session: typecheck passes, build passes, then report:
  1. the preview link,
  2. a 5-line test list AJ can run on his iPhone,
  3. anything not done or any decision needed.
- Commit messages: short, plain, imperative.
- If a phase is unclear or contradicts the SPEC, stop and ask AJ rather than guessing.

## Out of scope for v1
WhatsApp reading, WhatsApp Business API, Threads/IG posting, genealogy PDF reading, any Claude API calls inside the app. These are phase 7 options.
