# Phase 6 — Trips + scheduled tasks write to HQ + push

## Goal
Morning brief and Trip refresh appear in HQ, and a follow-up push arrives on AJ's phone.

## Build
- Migrations: `trips`, `segments`, `briefs` with RLS.
- Trips: port the Trip Board look (Paper Ticket style, Sora/Manrope). Data written by the existing Claude scheduled task (Gmail booking sync) through the Supabase connector; HQ only displays and allows manual edits.
- Briefs: Morning brief and Morning devotion cards on Today, read from `briefs`.
- Scheduled tasks: write `docs/scheduled-tasks.md` describing, for each task (Morning brief, Trip Board refresh, quiz lead sync, Morning devotion), the table and fields it must write. AJ edits the task prompts in Claude; every scheduled task must run on **Sonnet**. Do not add Claude API calls to HQ.
- Web push: service worker, subscription storage, Edge Function to send. Push types: follow-up due, behind-pace alert, and the **end-of-day nudge (default 20:30 WIB)** if any item is overdue or undated. pg_cron schedules the nightly checks.
- Nightly job exports a backup of HQ data to Drive.
- Settings: push on/off per type, nudge time.

## Done when (AJ tests on iPhone)
1. The Morning brief and Trip refresh appear in HQ the day after the tasks are re-pointed.
2. A follow-up push arrives on the iPhone Home Screen app.
3. The 20:30 nudge arrives when something is overdue or undated, and does not arrive when everything is clear.
4. The nightly backup file appears in Drive.
5. Old artifacts can be set read-only without losing anything.
