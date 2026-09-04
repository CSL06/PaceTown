# First-time `?` help and plain-language guardians — design

Date: 2026-09-04. Choice of approach: A (one shared help module + one `?` component).
Status: approved by user (all 3 sections), awaiting spec review.

## Goal

A first-time player can tap `?` on any panel and immediately understand what is
going on, what to do, and which guardian helps there and why. Guardian lines
across the game speak in 1–2 short plain sentences that keep each guardian's
role while explaining game words inline on first use.

Non-goals: no first-visit auto-popups, no new persisted state, no save
migration, no rewrite of game rules or numbers.

## Architecture

- New `src/game/help.ts`. Single source of truth:
  `HELP: Record<ViewId, { title, what, how, guardian: { who, why }, adaptive? }>`.
  `adaptive` is an optional function of (state, load) returning one live line
  or null. Only five views define it (see Content).
- New `src/game/panels/HelpDot.tsx`. One reusable component: a `?` button plus
  a small popup card. Local open/close state only. Closes on tap-away and
  Escape. Keyboard accessible (`aria-expanded`, focusable button). Styled with
  the existing game card patterns, no new design language.
- Insertion: one line per panel next to its heading (Intake, Understand,
  Rebalance, Work, Session, Recover, Ripples, Pocket, Firefly, Chime, WarmCup,
  Lanterns, Keepsakes, Collection, Journal, Council, Mailbox, Calm, Home,
  Backpack, Garden, LoadPanel, TownList, Briefing, Preview — every `ViewId`
  with a panel).
- Guardian rewrites edit existing strings in place, no new plumbing:
  7 `PLAN_TEMPLATES` openers (`src/domain/plans.ts`), 5 `guardianLens` lines
  (`src/domain/guidance.ts`), 6 `GREETINGS` (`src/game/Game.tsx`), Council
  voices and panel `Guardian says` lines (~10 across `Places.tsx`,
  `Loop.tsx`, `Minis.tsx`, `Pocket.tsx`, `Ripples.tsx`, `Keepsakes.tsx`).

## Content rules

- Every `?` popup has exactly three fixed parts: what this screen is, what to
  do here, which guardian helps here and why.
- Guardian roles stay fixed and are stated plainly: Mira (Library) explains
  what is in front of you; Kai (Clock Tower) plans time and moves work; Sol
  (Garden/Park) keeps effort sustainable; Sky (Café) keeps you company without
  pressure; Goh (Market) finishes small outstanding things.
- Game words are explained inline at first use: a checkpoint is one small step
  with a clear finish line; rebalance means moving flexible work to another day
  with approval; an outcome is simply how the session ended.
- Adaptive live lines (one each, only where they change decisions):
  Work names the chosen blocker and guardian; Session names the active guardian
  and checkpoint; Rebalance names the move count; Council names the current
  recommendation; Understand names the current percentage. All other views are
  fully static.

## Safety

- Unknown view id renders no `?` rather than crashing.
- An adaptive function that throws or returns empty falls back to the static
  text silently.
- No animation dependency, so reduced-motion needs nothing new.
- No persisted state: nothing to migrate, nothing to reset.

## Tests

- `help.ts` has an entry for every `ViewId` in `PANELS`.
- Every `guardian.who` referenced exists in `GUARDIANS`.
- Guidance lens lines and rewritten openers: at most two sentences each and
  free of unexplained jargon (explicit word list in the test).
- Existing suite stays green: `tsc`, `vitest run`, `vite build`.
