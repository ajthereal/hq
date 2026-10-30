# HQ — Personal Work App Spec

Owner: Ivan Jonathan (AJ). Single user, forever. Working name: HQ.
Source of truth: this file. Exported from the Claude Doc "AJ HQ — Personal Work App Design" (30 Oct 2026), plus decisions made after.

## 1. The idea

HQ is one installable web app (PWA) on AJ's iPad and iPhone. It opens to a single **Today** screen where every daily job is one or two taps from done. Claude stays the thinking partner and scheduled-task engine; HQ is where the work gets done and recorded.

Moves into HQ: Success Together CRM, ST Team Dashboard, Trip Board, content planning (YouTube, Reels, carousels, Threads, IG), calendar, Bible reading, PT AHU monthly bookkeeping, launchers for Nu Skin pages, CapCut, Canva, Claude. Tiimo is replaced by Today.

Stays outside: CapCut editing, Claude chat, Claude Design/Motion for carousels, WhatsApp itself (HQ opens the chat with the message ready; AJ presses send).

### Design principles
1. **Act, don't browse.** Every list item carries its action button (Message, Log, Done, Open in Claude). No screen exists only to look at.
2. **One source of truth per kind of data.** People live in HQ's database, time lives in Google Calendar, PT receipts live in Drive and the PT sheet. Nothing typed twice.
3. **Claude reads and writes the same data** through the Supabase connector. "Tell Claude" keeps working.
4. **Small, testable phases built by Sonnet.** Boring tech, one feature per Claude Code session, every phase tested on iPhone before the next.
5. **No computer needed, ever.** Setup, build, test, deploy happen from Safari, the Claude app and the GitHub app.
6. **Looks like AJ, not AI slop.** Light "Cloudlight" direction (softer blue, white canvas, orange accent). Real faces and real data, no template look. Copy in AJ's mixed Indonesian-English, aku/kamu voice.
7. **Nothing hides.** See section 3 ("Nothing-missed rule"). This is a hard requirement, learned from Tiimo.

## 2. What is possible on iPad + iPhone only

| Need | Possible? | How |
|---|---|---|
| App icon, full screen, iPad + iPhone | Yes | PWA added to Home Screen |
| Push notifications | Yes | Web push on iOS 16.4+ for Home Screen web apps |
| Works with bad signal | Mostly | Offline cache of today's data; edits sync later |
| Open WhatsApp with message ready | Yes | `wa.me` links with pre-filled text |
| Read WhatsApp chats | No | Personal WhatsApp has no API |
| Share text/screenshots into HQ | Yes | iOS Shortcut "Send to HQ" (share sheet can't target a web app) |
| Google Calendar read + write | Yes | Calendars shared with a Google service account |
| PT sheet + Drive receipts | Yes | Same service account, sheet and PT_Receipts folder shared with it |
| Gmail | Through Claude only | Service accounts can't open personal Gmail; Claude scheduled tasks can |
| Threads / IG posting, insights | Later phase | Official Threads API and Instagram API (professional account) |
| Build and deploy | Yes | Claude Code → GitHub → Cloudflare auto-deploy |
| Native widgets, Siri, background refresh | No | Needs a Mac; not worth it now |

## 3. Architecture and stack

- **App:** React + TypeScript + Vite + Tailwind, as a PWA (vite-plugin-pwa), supabase-js.
- **Hosting:** Cloudflare Pages at `hq.alvacy.com` (DNS at Namecheap). Free, deploys on every push, preview link per pull request.
- **Data, login, files, jobs:** Supabase (Postgres, Auth with email magic link + 6-digit code, Storage, Edge Functions, pg_cron). Region: Singapore.
- **Code home:** private GitHub repo `ajthereal/hq`.
- **Google access:** one service account; AJ shares each calendar, sheet and folder with it once.
- `alvacy.com` stays on GitHub Pages. HQ is separate because it needs secrets and server code.
- HQ and Claude both read and write Supabase, so a change in either shows in the other.
- No Next.js, no extra frameworks. No Claude API calls inside HQ in v1 (API billing is separate from the Pro plan).

### Nothing-missed rule (Today view)
Tiimo's failure: a task sometimes was not in Today's view and AJ missed it. HQ must make that impossible by design:
- Today is built from **every** source with a date, not only tasks scheduled for today: calendar events, tasks, CRM follow-ups, TRME check-ins, promises, content due, PT deadlines, Bible reading.
- **Overdue items never disappear.** They stay in Today, pinned in an "Overdue" section at the top, until done or deliberately snoozed to a date.
- **Undated tasks are not hidden.** An "Inbox / No date" strip sits on Today with a count badge. Capture via the floating + button never drops an item into an invisible list.
- Every item must have a state: scheduled, due, overdue, snoozed (with a date), done. No orphan state.
- A **"Missed nothing?" check** line at the bottom of Today shows: counts of overdue, undated, and due-tomorrow, each tappable.
- Anything due tomorrow shows in a small "Tomorrow" preview so surprises are rare.
- A daily end-of-day push (default 20:30 WIB) if any item is still overdue or undated.
- Search is global and reaches every item type from any screen.
- Phase 1 acceptance test: create a task for yesterday, a task with no date, and a task for tomorrow. All three must be visible on Today without scrolling past more than one screen.

## 4. Modules and screens

Nine modules behind a bottom tab bar (iPhone) or sidebar (iPad). Today is home. A floating + does quick capture from anywhere.

**1. Today (replaces Tiimo)**
- Visual timeline of today's calendar (AJ Jonathan + Family calendars), with RCP, System Meeting, BSE shown as fixed blocks.
- "Top 3" for the day, picked each morning.
- Action cards sorted by urgency: follow-ups due, TRME clients needing check-in, team members behind the 3,000 pace, content due, PT tasks due, today's Bible reading.
- Overdue, undated and tomorrow sections per the Nothing-missed rule.
- Morning brief card (written by the existing Claude scheduled task).
- Focus timer on any block.
- Make it better than Tiimo: time blocks, drag to reschedule, push reminders, one-tap done, all tied to real calendar and CRM.

**2. People (CRM)**
- Stages: Namelist → Relationship → Prospect → Closing → Customer → TRME Active → Warming Partner → Partner, plus Not Now.
- Person page: stage, source, Prysm scores, TRME day and check-ins, purchases, birthday, facts, promises, touchpoint history.
- Every row has **Message** (opens WhatsApp with ready text, then auto-logs), **Log** (2-tap touchpoint), **Next** (set follow-up date).
- Leads from the alvacy.com quiz arrive automatically, credited to the coach link they came from.

**3. Team (ST Monitoring)**
- Each leader's volume vs the 3,000 minimum and monthly goal, early warning before the 14th.
- Attendance at daily, weekly, monthly meetings and conventions (Lucky, Jeffrey and AJ auto-counted).
- **Monitoring AJ** button builds the daily upline report text and opens WhatsApp with it.
- Data in: Volume & Genealogy (VNG) page on nuskin.com is the source. Upload the Team Genealogy PDF; HQ reads it (later phase) or Claude does it as today.

**4. Content Studio**
- Pillars and an ideas inbox.
- Pipeline board: Idea → Script → Recorded → With editor → Edited → Scheduled → Published.
- A YouTube video holds its child pieces (Reels, carousel, Threads posts). Nothing orphaned.
- Editor hand-off card per video: Drive folder link, brief, deadline, WhatsApp the editor in one tap.
- Teleprompter (Prompter AJ moves in).
- **Make in Claude** button opens Claude with the brief and voice rules filled in.
- Later: post to Threads, publish IG carousels, pull views and saves nightly.

**5. Calendar**
- Week view on iPad. **Add meeting** defaults to **2 hours** on the AJ Jonathan calendar, optional link to a person.

**6. Trips**
- Trip Board moves in: same Paper Ticket look and Sora/Manrope fonts. Daily Gmail sync stays a Claude scheduled task that writes into HQ.

**7. Money: PT AHU**
- Monthly close checklist: mutasi received, receipts filed, payroll, PPh21 deposit, KUR installment, reconciliation.
- Deadlines (SPT, pembetulan steps).
- Month totals read from the PT accounting sheet.
- Receipts: send photos to Claude as now, or snap in HQ (saved to Drive PT_Receipts/year/month, row added for Claude to classify). Personal YNAB stays separate.

**8. Word (Bible reading)**
- Today's passage from the reading plan, short note field, streak.
- Buttons that open the passage in **YouVersion** (and **Logos** for study). Reading plan source: AJ's current YouVersion plan (confirm plan name in Phase 5).
- Morning devotion from the scheduled task appears here.

**9. Launcher**
- Tiles: Nu Skin VNG page, Nu Skin back office, Zoom RCP, CapCut, Canva, Claude, alvacy.com tools, Instagram, Threads, YouTube Studio.

## 5. WhatsApp integration
- **Level 1 (build in phase 2):** ready-to-send `wa.me` links from templates; one tap logs it and sets next follow-up. Free, zero risk.
- **Level 2 (phase 3):** "Send to HQ" iOS Shortcut: share a WhatsApp message into HQ as a note or touchpoint.
- **Level 3 (option after v1):** WhatsApp Business API with coexistence (AJ already uses WhatsApp Business). Needs Meta business verification; business-initiated messages are paid.
- Templates live in HQ in aku/kamu voice with fields like `{nama}`, `{hari TRME}`, `{skor Prysm}`. Editable in a Templates screen.

## 6. How Claude fits in
- Connect the Supabase connector in claude.ai once; chats and scheduled tasks read/write HQ directly.
- Scheduled tasks (Morning brief, Trip Board refresh, quiz lead sync, Morning devotion) write rows into HQ instead of their own artifacts. All run on **Sonnet**.
- Deterministic jobs (follow-up list, 3,000 pace check, Monitoring AJ report, later PDF reading) are plain code in HQ, not Claude, to protect the Pro limit.
- "Open in Claude" buttons carry context and voice rules.
- Anything written in AJ's voice must not read as AI-written (no colon setups like "Yang bikin beda: ...").

## 7. Data model (16 Postgres tables, v1)
Every table: `id`, `created_at`, `updated_at`, row-level security limited to AJ's login. Numbered SQL migrations in the repo.

| Table | Holds | Key fields |
|---|---|---|
| people | Every lead, customer, partner | name, phone (E.164), stage, source, coach_slug, birthday, next_follow_up, tags, notes |
| touchpoints | Every contact | person_id, type, result, channel, note, at |
| programs | TRME enrolments | person_id, start_date, day, check_ins, before/after stats |
| purchases | Orders | person_id, product, amount, date |
| facts | Relationship memory | person_id, text |
| promises | Things AJ promised a person | person_id, text, due |
| templates | WhatsApp templates | name, use_case, body with {fields}, language |
| team_members | ST downline | name, leader_id, monthly_goal, leg |
| team_volume | Daily volume snapshots | member_id, date, volume, source (pdf/manual/claude) |
| attendance | Meetings | meeting_type, date, member_id |
| content | All content pieces | type (video/reel/carousel/thread/post), pillar, status, parent_id, script, links, publish_at, stats |
| tasks | Top 3 and loose to-dos | title, due (nullable), state (scheduled/due/overdue/snoozed/done), snoozed_until, done, linked record |
| briefs | Claude scheduled-task output | kind (morning/devotion/trip), date, body |
| trips | Trip Board | flights, stays, confirmation, perks |
| segments | Trip legs | trip_id, type, details |
| reading_log | Bible reading | date, passage, note |

Not stored in HQ: calendar events (read live from Google), PT ledger rows (stay in the PT sheet), tax IDs and bank numbers (stay in Drive / Claude memory, never in app tables).

## 8. Migration from current artifacts
Live data sits in two Claude artifact databases; moving it is a one-time Claude job via the Supabase connector, counts checked before and after. Old pages stay up, read-only, until HQ has run cleanly for two weeks; each goes read-only the day its module goes live.

| Today | Moves to | How |
|---|---|---|
| Success Together CRM | people, touchpoints, programs, purchases, facts, promises | Claude reads every collection and inserts into Supabase |
| ST Team Dashboard | team_members, team_volume, attendance | Same; current month first |
| Trip Board | trips, segments | Same; refresh task re-pointed to HQ |
| Prompter AJ | Content Studio teleprompter | Code reused |
| Scheduled tasks | briefs, people | Each prompt edited to write rows into HQ |
| PT sheet + Drive PT_Receipts | Stay | HQ reads via service account |
| Tiimo | Today timeline | Cancel when Today feels right |

## 9. Build plan
Eight phases, one Claude Code session and one pull request each, tested on iPhone via the preview link before merging. See `docs/phases/`.

Per session: open Claude Code on this repo, pick **Sonnet**, say "Do phase N from docs/phases", review the PR, test the preview link, merge. Use Opus only if a phase gets stuck.

One-time setup (AJ, in Safari):
- GitHub private repo `ajthereal/hq` ✅
- Supabase project (Singapore) with Email login; edit the Magic Link email template to include both the link and the 6-digit code
- Cloudflare Pages connected to the repo; `hq.alvacy.com` from Namecheap
- Google Cloud: Calendar, Sheets, Drive APIs; service account; share AJ Jonathan + Family calendars, PT sheet, PT_Receipts with it (needed from Phase 1)
- claude.ai: Supabase connector

## 10. Risks
- Supabase free tier pauses after about a week of no use. Daily use and nightly jobs keep it awake; nightly export to Drive as backup. Upgrade to Pro (US$25/mo) only if needed.
- WhatsApp reading waits for phase 7; v1 never reads chats.
- Instagram publishing needs a professional account and Meta developer app (phase 7).
- Sonnet drift on big changes: contained by small phases, fixed stack, CLAUDE.md, test list per phase.
- Sensitive data: login is AJ only, RLS on every table, no tax IDs or account numbers in tables.
- Two systems during migration: old artifacts go read-only the day each module goes live.

## 11. Decisions log
- Name: keep **HQ**.
- Users: **AJ only, forever.** No multi-user, no sharing, no roles. Keep auth simple (email magic link plus 6-digit code in the same email, one account; the code is what logs in the iOS Home Screen app because a tapped link opens Safari; no GitHub login).
- Bible: **YouVersion and Logos.**
- Tiimo: drop once Today is live; Today must be better, and must never hide a task.
- VNG = Volume & Genealogy, the data source for Team.
- WhatsApp Business is in use, so API level 3 stays possible later.
