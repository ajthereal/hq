# Phase 2 — People (CRM) + WhatsApp level 1 + CRM migration

## Goal
The CRM lives in HQ. Message → send → Logged takes 3 taps. Due follow-ups show on Today.

## Build
- Migrations: `people`, `touchpoints`, `programs`, `purchases`, `facts`, `promises`, `templates` with RLS and indexes on stage and next_follow_up.
- People list: filter by stage (Namelist, Relationship, Prospect, Closing, Customer, TRME Active, Warming Partner, Partner, Not Now), search by name, sort by next follow-up.
- Person page: stage, source, Prysm scores, TRME day and check-ins, purchases, birthday, facts, promises, touchpoint history.
- Row actions: **Message** (template picker, fills `{nama}`, `{hari TRME}`, `{skor Prysm}`, opens `https://wa.me/<E.164>?text=...`, then on return asks "Sent?" and logs a touchpoint and sets next follow-up), **Log** (2 taps), **Next** (date).
- Templates screen: follow-up, TRME check-in, birthday, OPP invite, Monitoring AJ. Seed with drafts in aku/kamu voice; AJ edits them.
- Today integration: follow-ups due, TRME check-ins, promises due appear as action cards and follow the Nothing-missed rule (overdue stays pinned).
- Quiz leads: Edge Function endpoint that receives leads from alvacy.com and inserts a person with `coach_slug` and source. Auth with a shared secret stored in function secrets.
- Migration of existing data is done by Claude (chat) through the Supabase connector after this phase merges, not by app code. Provide `docs/migration-crm.md` listing the old collections and target columns so counts can be checked before and after.

## Done when (AJ tests on iPhone)
1. Person count matches the old CRM after the Claude migration.
2. Message → send in WhatsApp → back in HQ → Logged: 3 taps.
3. A person with a follow-up date in the past shows in Today's Overdue until acted on.
4. Birthday and TRME check-in cards appear on the right days.
5. A test lead posted to the quiz endpoint appears in People with the right coach.
