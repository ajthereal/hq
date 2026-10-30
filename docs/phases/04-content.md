# Phase 4 — Content Studio + teleprompter + Make in Claude

## Goal
A YouTube video with its Reels and carousel moves through the board, and Make in Claude opens a filled prompt.

## Build
- Migration: `content` table (type video/reel/carousel/thread/post, pillar, status, parent_id, script, links, publish_at, stats) with RLS.
- Pillars and an ideas inbox (capture from anywhere via the floating +).
- Pipeline board: Idea → Script → Recorded → With editor → Edited → Scheduled → Published. Touch-friendly, one-tap move to next stage.
- Parent/child: a video holds its child Reels, carousel and Threads posts; nothing orphaned (every child needs a parent or a pillar).
- Editor hand-off card: Drive folder link, brief, deadline, WhatsApp the editor in one tap (uses the template mechanism from phase 2).
- Teleprompter: port the existing "Prompter AJ" page (claude.ai artifact) into a Content Studio screen. AJ will provide its code or Claude reads it from the artifact; keep the same controls.
- **Make in Claude** button: builds a URL/prompt text with the brief, pillar and AJ's voice rules (no AI-sounding patterns, no colon setups) and opens Claude. Voice rules live in `docs/voice-rules.md` (create from AJ's Voice Guide artifact).
- Content due today or overdue appears on Today (Nothing-missed rule).

## Done when (AJ tests on iPhone)
1. Create a YouTube video, add two Reels and one carousel as children, move them through the board.
2. The editor hand-off opens WhatsApp with the brief ready.
3. The teleprompter works on iPhone and iPad.
4. Make in Claude opens Claude with a filled prompt.
5. A reel due today shows on Today.
