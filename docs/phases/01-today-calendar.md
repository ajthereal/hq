# Phase 1 — Today + Calendar

## Goal
Today shows AJ's real events and every item he could miss. Add meeting creates a 2-hour event in Google Calendar.

## Prerequisites (AJ)
Google Cloud: enable Calendar API; create a service account; share the AJ Jonathan and Family calendars with it ("Make changes to events"). Service account JSON stored as a Supabase Edge Function secret, never in the repo.

## Build
- Migration: `tasks` table (title, due nullable, state scheduled/due/overdue/snoozed/done, snoozed_until, linked record, timestamps) with RLS.
- Edge Function `calendar`: list events (AJ Jonathan + Family) for a date range; create event (default 2 hours, AJ Jonathan calendar, optional person link stored in description); update and delete.
- Today screen:
  - Timeline of today's events; RCP, System Meeting and BSE shown as fixed blocks.
  - Top 3 for the day (pick each morning, stored as tasks).
  - **Overdue** section pinned at top; items stay until done or snoozed to a date.
  - **Inbox / No date** strip with a count badge.
  - **Tomorrow** preview.
  - **"Missed nothing?"** footer line with counts of overdue, undated, due-tomorrow, each tappable.
  - Focus timer on any block.
- Quick capture: floating + adds a task (date optional). It never lands in an invisible place.
- Calendar tab: week view on iPad, day list on phone, Add meeting (2 h default).
- Global search across tasks and events.

## Done when (AJ tests on iPhone)
1. Today shows his real events for today.
2. Add meeting creates a 2-hour event that appears in Google Calendar.
3. Create a task dated yesterday, a task with no date, and a task for tomorrow: all three are visible on Today without scrolling past one screen.
4. Snoozing an overdue task to a date moves it out of Overdue and into that day.
5. Completing a task removes it everywhere; the "Missed nothing?" counts update.
