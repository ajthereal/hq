# HQ design system

Calm & soft, Tiimo evolved (chosen by AJ, 20 Nov 2026). Light and dark follow the device; iPhone and iPad are designed equally.

## Color
Time-of-day pastels are the color language. Everything else stays neutral.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | #F1F2EF | #141517 | page |
| `--card` | #FFFFFF | #1D1F22 | rows, cards (no borders) |
| `--card2` | #E7E9E4 | #26282C | segments, chips, pressed |
| `--ink` / `--mute` | #1A1C1E / #62666B | #F2F2EF / #9EA2A8 | text |
| `--morning-bg/ink` | #EFE5A2 / #4A430E | #6E6A30 / #FFF8CF | morning |
| `--aft-bg/ink` | #F2D0DD / #5A2240 | #6B3A52 / #FFE6F1 | noon |
| `--eve-bg/ink` | #D9D2F5 / #2F2466 | #4A3F82 / #EEEAFF | evening |
| `--late-bg/ink` | #F5CDB8 / #6A2A0C | #8A4325 / #FFEDE3 | overdue, badges |

## Type
- Headings and group pills: Gabarito 600/700, self-hosted in `assets/fonts` (works offline).
- Everything else: the iOS system font. Numbers use tabular figures.
- Sentence case everywhere. No all-caps labels.

## Layout
- iPhone: labelled tab bar with 5 items: Today, People, Team, Library, More.
- iPad: grouped sidebar (Every day / Make / Personal), Settings & sync at the bottom.
- People = Focus (was Work), My group, Lists, switched by the segment under the title.
- Today: the day rail runs morning → noon → evening down the left, with a "Now" line in the current part of the day.

## Rules
- Rows are borderless cards, 16px radius, at least 60px tall, tick targets 44px.
- Calendar events are marked by a dot in their part-of-day color, not a side bar.
- Text contrast at least 4.5:1, functional text never under 11px.
