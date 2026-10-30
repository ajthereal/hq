# Phase 5 — Money (PT AHU) + Word + Launcher

## Goal
The October close checklist works, month totals match the PT sheet, Word and Launcher are live.

## Prerequisites (AJ)
Share the PT accounting sheet and the Drive `PT_Receipts` folder with the service account (Sheets and Drive APIs enabled). Tell Claude Code which YouVersion reading plan he follows.

## Build
- Money: monthly close checklist (mutasi received, receipts filed, payroll, PPh21 deposit, KUR installment, reconciliation done), deadlines (SPT, pembetulan steps) with dates, month totals read from the PT sheet via Edge Function. Checklist items and deadlines are tasks and follow the Nothing-missed rule on Today.
- Receipts: snap a photo in HQ, save to Drive `PT_Receipts/<year>/<month>`, add a row for Claude to classify later. No Claude API calls in HQ. Never store tax IDs or bank numbers in app tables.
- Personal YNAB stays separate; do not integrate it.
- Word: `reading_log` table; today's passage from the reading plan, short note field, streak; buttons to open the passage in YouVersion and in Logos (use their URL schemes/universal links; if a deep link is not possible, copy the reference and open the app). Morning devotion from the scheduled task appears here.
- Launcher: tiles for Nu Skin VNG page, Nu Skin back office, Zoom RCP, CapCut, Canva, Claude, alvacy.com tools, Instagram, Threads, YouTube Studio. Tiles editable in a small settings list.
- Today shows today's Bible reading card.

## Done when (AJ tests on iPhone)
1. October close checklist can be ticked through and items due appear on Today.
2. Month totals match the PT sheet.
3. A receipt photo lands in the right Drive folder and a row is added.
4. Tapping the passage opens YouVersion (or copies the reference) and the note saves.
5. Every Launcher tile opens the right app or page.
