# PaceTown — Mobile Optimization: Full Implementation Spec for Claude

> **READ THIS ENTIRE DOCUMENT BEFORE WRITING ANY CODE.**
>
> You are optimizing the mobile experience for **PaceTown**, a cozy retro pixel-art
> productivity RPG built with **React 19 + TypeScript + Vite**.
> This document contains everything you need: codebase architecture, every mobile
> issue found in a full audit, pre-made design decisions, exact file paths, and
> verification steps.

---

## Table of Contents

1. [Codebase Architecture](#1-codebase-architecture)
2. [Rules & Constraints](#2-rules--constraints)
3. [Issues & Fixes (Priority Order)](#3-issues--fixes-priority-order)
4. [Verification](#4-verification)

---

## 1. Codebase Architecture

### Stack
- **Framework:** React 19, TypeScript, Vite
- **Styling:** Plain CSS files (no Tailwind, no CSS modules)
- **Build:** `vite.config.ts` → `publicDir: 'assets/app-runtime-v1'`
- **Tests:** Vitest (378+ tests), `npm test`
- **Typecheck:** `npm run typecheck`

### Key File Map

| File | Purpose |
|------|---------|
| `index.html` | Entry point, viewport meta, PWA manifest link |
| `src/game/game.css` | Main game shell: `.pt-game`, `.stage`, `.world`, `.spr`, `.dpad`, `.dlg`, `.sheet`, `.prompt`, `.hint-move`, `.hud-tools`, `.toasts`, `.outcomes`, `.move` |
| `src/game/hud.css` | Top HUD rail: `.hud-top`, `.hud-group`, `.hud-brand`, `.load-chip`, `.hud-prog`, `.hud-sys` |
| `src/game/overlays.css` | Guardian dock (`.dock`) and quest card (`.hud-quest`) |
| `src/game/clock-tower.css` | Clock Tower interior and Week Board |
| `src/game/library.css` | Library interior and study panels |
| `src/game/recovery/recovery.css` | 5 recovery activities (Ripples, Warm Cup, Fireflies, Chime, Lanterns) |
| `src/game/panels.css` | Panel buttons, form controls, journal week strip |
| `src/game/scene-kit.css` | Shared interior scene surfaces and buttons |
| `src/game/cosmetics.css` | Town cosmetics and shop |
| `src/landing/landing.css` | Landing page and Live Town hero |
| `src/onboarding/onboarding.css` | First-run wizard |
| `src/auth/auth.css` | Auth / sign-in |
| `src/game/Game.tsx` | Main game component, D-pad with pointer events |
| `src/game/ClockTower.tsx` | Week Board component, touch drag handling |
| `src/game/Library.tsx` | Library component with D-pad |
| `src/game/LiveTown.tsx` | Landing page live town with D-pad |
| `src/game/useWorld.ts` | Camera tracking, movement, SPEED=340 |

### Existing Mobile Support (Already Built)
- On-screen D-pads in `Game.tsx`, `ClockTower.tsx`, `Library.tsx`, `LiveTown.tsx`
- D-pads toggled via `@media (hover: none) and (pointer: coarse)`
- Haptic feedback (`haptic(6)`) on touch actions
- PWA manifest at `/manifest.webmanifest`
- Responsive breakpoints at 1100px, 900px, 780px, 720px, 620px, 560px
- Guardian dock hidden below 900px width

### Assets
- Runtime bundle: **28 MB** (63 files in `assets/app-runtime-v1`)
- World map: 3072×2048px, sprites: 64×96px
- All rendered with `image-rendering: pixelated`
- **DO NOT resize, crop, or recreate any image files**

---

## 2. Rules & Constraints

1. **All 378+ tests must continue passing** after your changes. Run `npm test` to verify.
2. **TypeScript must compile cleanly.** Run `npm run typecheck` to verify.
3. **Production build must succeed.** Run `npm run build` to verify.
4. **DO NOT modify image assets.** The existing pixel art renders cleanly on high-DPI mobile screens.
5. **DO NOT remove desktop functionality.** All changes must be behind mobile media queries or additive CSS that doesn't affect desktop.
6. **Preserve all existing comments and docstrings** unrelated to your changes.
7. **Test order matters.** Always run typecheck → test → build in sequence.

---

## 3. Issues & Fixes (Priority Order)

### TASK 1 — Viewport Meta & PWA Tags (index.html)
**Priority: 🔴 Critical | Effort: 5 min | Affects: Every screen**

**Problem:** Current viewport meta allows accidental pinch-zoom and doesn't handle notched screens.

**Fix in `index.html`:**

1. Replace the existing viewport meta tag (line 5):
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

2. Add these tags after the existing `<meta name="color-scheme">` tag (after line 8):
   ```html
   <meta name="apple-mobile-web-app-capable" content="yes" />
   <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
   <meta name="apple-mobile-web-app-title" content="PaceTown" />
   <meta name="mobile-web-app-capable" content="yes" />
```

---

### TASK 2 — Global: Replace vh with dvh + Safe Area Insets
**Priority: 🔴 Critical | Effort: 20 min | Affects: Every screen**

**Problem:** 17 locations use `100vh` which causes layout jumps when mobile browser address bars collapse/expand. No safe-area padding exists for iPhone notches and home bars.

**Fix:** In every file listed below, add a modern `dvh` line immediately after each `vh` line (browsers that don't support `dvh` will ignore it and use the `vh` fallback):

**In `src/game/game.css`:**
- `.pt-game` (line 28): Add `overscroll-behavior: none; -webkit-touch-callout: none;`
- `.sheet` (line 391): After `max-height: calc(100vh - 56px)`, add `max-height: calc(100dvh - 56px - env(safe-area-inset-top) - env(safe-area-inset-bottom));`

**In `src/styles.css`:**
- Find all `calc(100vh - ...)` and add a `dvh` override line after each.

**In `src/auth/auth.css`:**
- `.au { min-height: 100vh }` → add `min-height: 100dvh;` after it.
- `.au-modal max-height` → add `dvh` override.

**In `src/onboarding/onboarding.css`:**
- `.ob { min-height: 100vh }` → add `min-height: 100dvh;` after it.

**In `src/landing/landing.css`:**
- `.lp { min-height: 100vh }` → add `min-height: 100dvh;` after it.

**In `src/game/recovery/recovery.css`:**
- `.recovery-complete` max-height → add `dvh` override.
- All `vh`-based max-heights on `.lantern-workbench`, `.firefly-thoughts`, `.story-page`, `.lantern-concern-card` → add `dvh` overrides.

---

### TASK 3 — HUD Top Rail: Add 480px Breakpoint
**Priority: 🔴 Critical | Effort: 30 min | Affects: Campus, all game screens**

**Problem:** The HUD rail requires ~481px minimum width but phones are 375px. The right side (settings, account) gets pushed off-screen. No breakpoint exists below 620px.

**Fix in `src/game/hud.css`:**

Add a new media query after the existing `@media (max-width: 620px)` block (after line 218):

```css
@media (max-width: 480px) {
  .hud-top { padding: 8px 10px; padding-top: calc(8px + env(safe-area-inset-top)); gap: 5px; }
  .hud-top { --hud-h: 34px; }
  .hud-brand { padding-left: 4px; gap: 6px; }
  .hud-brand .mark { width: 22px; height: 22px; font-size: 13px; }
  .load-chip { gap: 7px; padding: 0 8px; }
  .load-num { font-size: 16px; }
  .hud-prog { display: none; }
  .hud-sys .acct-btn span { display: none; }
  .hud-sys { gap: 4px; padding: 0 5px; }
}
```

This hides the progression group (coins + level badge) and account name on small phones, bringing the minimum width down to ~220px.

---

### TASK 4 — Campus: Fix 6-Way Bottom Overlay Collision
**Priority: 🔴 Critical | Effort: 45 min | Affects: Campus screen**

**Problem:** On mobile touchscreens, D-pad + quest card + prompt + hint-move + hud-tools + toasts all overlap in the bottom 0–300px.

**Fix in `src/game/game.css`:**

Update the existing `@media (hover: none) and (pointer: coarse)` block (line 363–366) to handle all collisions:

```css
@media (hover: none) and (pointer: coarse) {
  .dpad {
    display: grid;
    left: calc(16px + env(safe-area-inset-left));
    bottom: calc(16px + env(safe-area-inset-bottom));
  }
  .hud-quest {
    bottom: calc(128px + env(safe-area-inset-bottom));
    left: calc(12px + env(safe-area-inset-left));
    right: calc(12px + env(safe-area-inset-right));
  }
  /* "WASD to walk" is keyboard-only advice — hide on touchscreens */
  .hint-move { display: none; }
  /* Move Town List button above the D-pad area */
  .hud-tools {
    bottom: auto;
    top: calc(68px + env(safe-area-inset-top));
    right: calc(10px + env(safe-area-inset-right));
  }
  /* Interaction prompt clears the quest card */
  .prompt { bottom: calc(310px + env(safe-area-inset-bottom)); }
  /* Toasts above everything */
  .toasts { bottom: calc(340px + env(safe-area-inset-bottom)); }
}
```

---

### TASK 5 — Clock Tower Week Board: Mobile-First Tab View
**Priority: 🔴 Critical | Effort: 2 hours | Affects: Clock Tower**

**Problem:** The wooden frame wastes 41% of screen height, tasks are in a scroll-inside-scroll, drag handles are 22px (too small for fingers).

**Design decisions (pre-made):**
- **Use tabs** (the existing `.week-tabs`), not swipe carousel.
- **Drop the wooden frame** on mobile — use a clean pixel-bordered card instead.
- **Stack Kai's panel below** the day card (not a collapsible drawer — keep it always visible).

**Fix in `src/game/clock-tower.css`:**

1. In the existing `@media (max-width: 720px)` block (line 278), add/update:

```css
@media (max-width: 720px) {
  .clock-board-screen {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto minmax(0, 1fr) auto auto;
    padding: 10px;
    padding-top: calc(10px + env(safe-area-inset-top));
    padding-bottom: calc(10px + env(safe-area-inset-bottom));
  }
  .kai-plan { grid-column: 1; grid-row: auto; align-self: auto; }
  .clock-disclaimer { grid-row: auto; }

  /* Drop the wooden frame on mobile — tasks get full height */
  .week-frame {
    min-height: 0;
    background: none;
    padding: 0;
  }
  .week-grid {
    position: relative;
    inset: auto;
    min-height: 200px;
    max-height: calc(100dvh - 380px);
    max-height: calc(100vh - 380px);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    border: var(--px-border) solid var(--px-ink);
    clip-path: var(--px-clip);
    box-shadow: var(--px-bevel-down);
  }

  /* Make drag handles finger-friendly */
  .task-drag-handle {
    min-height: 44px;
    padding: 10px 12px;
    font-size: 14px;
  }

  /* Week tabs scroll horizontally with comfortable sizing */
  .week-tabs {
    display: flex;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
    gap: 4px;
  }
  .week-tabs button {
    scroll-snap-align: start;
    flex: 0 0 auto;
    min-width: 58px;
    min-height: 44px;
    padding: 8px 10px;
  }

  /* Kai's panel: no floated image on narrow screens */
  .kai-plan > img { float: none; width: 50px; height: 75px; margin: 0 0 8px; }
}
```

---

### TASK 6 — D-Pad Ergonomics: Press Feedback + Pointer Fixes
**Priority: 🟠 Major | Effort: 45 min | Affects: All 4 D-Pads**

**Problem A — No visual feedback:** D-pad buttons have no `:active` state so players can't tell if they pressed.

**Fix in `src/game/game.css`:** Add after the `.dpad .up` rule (after line 362):
```css
.dpad button:active {
  background: var(--accent); color: var(--on-accent);
  transform: scale(0.92);
}
```

**Fix in `src/game/clock-tower.css`:** Add after `.clock-dpad button:first-child` (after line 97):
```css
.clock-dpad button:active {
  background: var(--sk-accent); color: var(--sk-on-accent);
  transform: scale(0.92);
}
```

**Fix in `src/game/library.css`:** Add after the library D-pad rules (after line 101):
```css
.library-dpad button:active {
  background: var(--sk-accent); color: var(--sk-on-accent);
  transform: scale(0.92);
}
```

**Problem B — Stuck walking:** If a player slides their thumb off a D-pad button, the character keeps walking because only `onPointerUp` is handled.

**Fix in `src/game/Game.tsx`, `src/game/ClockTower.tsx`, `src/game/Library.tsx`, `src/game/LiveTown.tsx`:**

Find every D-pad `<button>` that has `onPointerDown` and `onPointerUp` handlers. Add `onPointerLeave` and `onPointerCancel` mapped to the same stop handler as `onPointerUp`.

For example, if the current code is:
`	sx
onPointerDown={() => startDirection('up')}
onPointerUp={() => stopDirection('up')}
```

Change to:
`	sx
onPointerDown={() => startDirection('up')}
onPointerUp={() => stopDirection('up')}
onPointerLeave={() => stopDirection('up')}
onPointerCancel={() => stopDirection('up')}
```

Do this for every direction button (up, down, left, right) in all 4 files.

---

### TASK 7 — Touch Stage: Prevent Rubber-Banding
**Priority: 🟠 Major | Effort: 10 min | Affects: Campus, all interiors**

**Fix in `src/game/game.css`:** Add to `.stage` (line 144):
```css
.stage {
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}
```

Also add to `.world` and `.map` (lines 147–148):
```css
.world, .map {
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
```

---

### TASK 8 — Recovery Scenes: Card Positioning
**Priority: 🟠 Major | Effort: 30 min | Affects: Warm Cup, Ripples, Lanterns**

**Problem:** Warm Cup step card (343px wide at 375px) completely covers the tea-making artwork. Ripple dialogue overlaps recovery controls.

**Design decision (pre-made):** Make overlapping cards top-anchored on mobile so artwork stays visible below.

**Fix in `src/game/recovery/recovery.css`:**

In the existing `@media (max-width: 700px)` block, update:

```css
/* Warm Cup: anchor step card to top so artwork is visible below */
.cup-step-card {
  right: 12px;
  left: 12px;
  width: auto;
  top: calc(70px + env(safe-area-inset-top));
  bottom: auto;
  max-height: 40vh;
  max-height: 40dvh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* Ripples: stack dialogue above recovery controls */
.ripple-dialogue {
  bottom: calc(62px + env(safe-area-inset-bottom));
}

/* Recovery controls: safe area padding */
.recovery-controls {
  bottom: calc(12px + env(safe-area-inset-bottom));
}
```

Also add `dvh` overrides for all the `vh` max-heights in the mobile block:
```css
.lantern-workbench { max-height: 52dvh; }
.firefly-thoughts { max-height: 68dvh; }
.story-page { max-height: 70dvh; }
.lantern-concern-card { max-height: 61dvh; }
```

---

### TASK 9 — Clock Tower Interior: Speech vs D-Pad Collision
**Priority: 🟠 Major | Effort: 10 min | Affects: Clock Tower room**

**Problem:** Kai's speech bubble at `bottom: 9%` collides with D-pad at `bottom: 48px`.

**Fix in `src/game/clock-tower.css`:**

In the existing `@media (max-width: 560px)` block (line 284), add:
```css
.clock-speech { bottom: 15%; }
.clock-near-prompt { bottom: calc(120px + env(safe-area-inset-bottom)); }
.clock-dpad {
  bottom: calc(14px + env(safe-area-inset-bottom));
  left: calc(14px + env(safe-area-inset-left));
}
```

---

### TASK 10 — Touch Targets: Increase Sub-44px Elements
**Priority: 🟠 Major | Effort: 30 min | Affects: Everywhere**

Add a mobile-only media query in `src/game/game.css` (at the end of the file, before the final `@media (prefers-reduced-motion)`):

```css
@media (hover: none) and (pointer: coarse) {
  .iconbtn { width: 44px; height: 44px; }
  .tool { padding: 12px 14px; min-height: 44px; }
  .helpdot { width: 44px; height: 44px; }
  .qa button { padding: 12px 14px; min-height: 44px; }
  .prompt { padding: 12px 20px; }
  .sheet-head .iconbtn { width: 44px; height: 44px; }
}
```

In `src/game/scene-kit.css`, add before the reduced-motion query:
```css
@media (hover: none) and (pointer: coarse) {
  .sk-btn { padding: 12px 16px; min-height: 44px; }
}
```

In `src/game/clock-tower.css`, inside the `@media (max-width: 560px)` block:
```css
.clock-close { min-width: 44px; min-height: 44px; padding: 8px; }
.week-tabs button { min-height: 44px; }
```

In `src/game/library.css`, inside the `@media (max-width: 760px)` block:
```css
.library-panel header button { width: 44px; height: 44px; }
.library-hud button { min-height: 44px; padding: 10px 12px; }
.library-queue-page button { min-height: 44px; }
```

---

### TASK 11 — Modal Sheets & Dialogues: Safe Area
**Priority: 🟡 Minor | Effort: 10 min**

**Fix in `src/game/game.css`:**

Add inside a new `@media (max-width: 480px)` block:
```css
@media (max-width: 480px) {
  .dlg { padding-bottom: calc(20px + env(safe-area-inset-bottom)); }
  .dlg-body { min-height: 90px; padding: 12px 14px; }
  .dlg-text { font-size: 14px; line-height: 1.55; }
  .sheet {
    width: min(860px, calc(100vw - 20px));
    max-height: calc(100dvh - 32px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  }
}
```

---

### TASK 12 — Rating Scale & Move Grid Layout Fix
**Priority: 🟡 Minor | Effort: 10 min**

**Fix in `src/game/game.css`:**

Add a mobile override:
```css
@media (max-width: 480px) {
  .outcomes { grid-template-columns: repeat(5, 1fr); }
  .outcomes button { padding: 10px 4px; font-size: 12px; }
  .move { grid-template-columns: auto 1fr auto 1fr; gap: 8px; padding: 10px; }
}
```

---

### TASK 13 — Title Screen Cast Row
**Priority: 🟡 Minor | Effort: 5 min**

**Fix in `src/game/game.css`:**
```css
@media (max-width: 480px) {
  .title-cast li { width: 56px; }
  .title-cast img { width: 40px; }
  .title-cast b { font-size: 9px; }
}
```

---

### TASK 14 — Library & Landing dvh Fixes
**Priority: 🟡 Minor | Effort: 10 min**

**In `src/game/library.css`:** In the `@media (max-width: 760px)` block, update:
```css
.library-panel { max-height: calc(100dvh - 18px); }
.library-dpad {
  bottom: calc(14px + env(safe-area-inset-bottom));
  left: calc(14px + env(safe-area-inset-left));
}
```

**In `src/landing/landing.css`:** After `.lp { min-height: 100vh; }` add:
```css
.lp { min-height: 100dvh; }
```

---

## 4. Verification

After completing ALL tasks, run these commands in order:

`ash
# 1. TypeScript must compile with 0 errors
npm run typecheck

# 2. All 378+ tests must pass
npm test

# 3. Production build must succeed
npm run build
```

### Manual Verification Checklist
Open Chrome DevTools → Device Toolbar → Select **iPhone SE (375×667)** and **iPhone 14 Pro (393×852)**:

- [ ] HUD rail fits on screen without horizontal overflow
- [ ] D-pad is visible and doesn't overlap quest card or other UI
- [ ] Walking with D-pad stops when lifting finger (no stuck walking)
- [ ] D-pad buttons show accent color press feedback
- [ ] `WASD to walk` hint is hidden on touch devices
- [ ] Clock Tower Week Board shows one day at a time with tab navigation
- [ ] No wooden frame visible on mobile — clean card instead
- [ ] Kai's panel stacks below the day card
- [ ] Modal sheets don't jump when scrolling (address bar test)
- [ ] Dialogue text is not hidden behind iPhone home bar
- [ ] Recovery Warm Cup: tea artwork is visible below the step card
- [ ] All buttons are comfortably tappable (no tiny 22px targets)
- [ ] No rubber-band / pull-to-refresh on the game canvas
