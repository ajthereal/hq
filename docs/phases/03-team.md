# Phase 3 — Team (ST Monitoring) + Monitoring AJ + attendance + "Send to HQ"

## Goal
The daily upline report text matches what AJ sends now, and behind-pace alerts show before the 14th.

## Build
- Migrations: `team_members`, `team_volume`, `attendance` with RLS.
- Team screen: each leader's volume vs the 3,000 minimum and the monthly goal; colour/flag when behind pace; early warning before the 14th.
- Manual volume entry and a "paste from Claude" entry (source = manual/claude). PDF reading is phase 7.
- Attendance: log daily, weekly, monthly meetings and conventions; Lucky, Jeffrey and AJ auto-counted.
- **Monitoring AJ** button: builds the daily upline report text from current data and opens WhatsApp with it. Use `docs/monitoring-aj-format.md` (AJ to supply the exact current report text; ask him if missing).
- Behind-pace members appear as action cards on Today (Nothing-missed rule applies).
- "Send to HQ" iOS Shortcut: an Edge Function endpoint (secret token) that accepts text and an optional person name and stores a touchpoint or note. Write setup steps in `docs/shortcut-send-to-hq.md` for AJ to follow on his phone.
- Migration of the ST Team Dashboard data is done by Claude via the connector (current month first); provide `docs/migration-team.md`.

## Done when (AJ tests on iPhone)
1. The Monitoring AJ text matches what he sends uplines today.
2. A member below pace shows a warning before the 14th and a card on Today.
3. Attendance logging takes 2 taps per person or one tap for the standard group.
4. The Shortcut sends a copied WhatsApp message into HQ as a note on the right person.
5. Month totals match the old dashboard.
