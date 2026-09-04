# PaceTown — Prototype Demo Flow

A scripted, repeatable walkthrough that proves the system works end to end.
One presenter, one browser, ~5 minutes. Every input below is **prefilled in the
app already** (the seeded demo week) — you only paste if you want to show the
parser working from raw text.

## Before you show it

```powershell
npm run dev
```

Open `http://localhost:5173/game` (Vite prints the real port if 5173 is busy).

That URL is the presenter's front door: it signs you in as a guest and opens
the seeded week directly, so no account, form, or first-run wizard interrupts
the demo. (`/` is the landing page, `/login` and `/signup` are the real account
screens, and `/welcome` is the first-run setup a genuine new user sees — none
of them are on this path.)

For a clean run, reset first: **Settings → Start the example week again**. That
restores the seeded week and keeps you in the town, which is what you want
between runs. (**Delete local data** is the full wipe — it removes your account
too and returns you to the landing page, so use it to finish, not to reset.)
Reloading mid-demo is safe — saves are versioned and you return to the title
screen with progress intact.

## The prefixed inputs (already in the app)

Town Hall opens with this schedule text prefilled:

> Database Systems lecture from 9 to 12, 90 minute commute, Film Society at 5,
> café shift from 6 to 10, ERD assignment due tomorrow takes 120 minutes,
> revise normalisation notes for 62 minutes, weekly groceries 45 minutes,
> bursary form due next week 30 minutes, laundry 30 minutes

And this assignment brief prefilled:

> Enrolment System — Coursework 2.
> You must design an entity-relationship diagram for the university enrolment system.
> - Identify the entities and their attributes
> - Describe the relationship between each pair of entities
> - Resolve any many-to-many relationships with a junction entity
> - Write a short data dictionary
> Diagrams should be legible and submitted as PDF.

Say this up front: *"Nothing here is hardcoded. The schedule is parsed live,
and every number I show is calculated from it."*

## Act 1 — The week, understood (1 min)

*Goal: you're a student opening the app for the first time, and within a minute
you can see your whole week as one honest number.*

**How to move around (first-timer basics):** walk with `W` `A` `S` `D` or arrow
keys, press `E` next to a glowing place to enter it, `Esc` to step back out. On
a phone, use the on-screen direction pad. Lost? Open the **Town List** — every
single place in town is listed there, so you never have to find things by
walking.

1. Press **Enter Campus Grove**. Kai, the keeper of the Clock Tower, greets you:
   *"Thursday is at 108 percent… Four things are locked in… Two of the flexible
   ones can move."*
   - **What just happened (the logic):** the app parsed the seeded week into 9
     commitments, sorted them into fixed (lectures, commute, shift, club — 570
     minutes that consume your day directly) and flexible (everything else), and
     computed Thursday: 570 fixed minutes leave 330 of your 900 waking minutes
     for 5 flexible tasks, whose weighted demand lands at 108%. Over 100% simply
     means "more planned than fits" — it is schedule guidance, and the app says
     so on screen. It never calls it stress, and never calls *you* anything.
2. Open **Town Hall** (walk there or Town List). The parse preview shows
   **9 commitments, confidence 1.00, and 3 visible assumptions** (for example,
   "assumed 30 minutes" where you gave no duration).
   - **What just happened:** a small local parser — no AI, no cloud — split your
     sentences on commas, recognized keywords ("lecture" → time/fixed,
     "groceries" → errands/flexible), read clock ranges and durations, and
     guessed deadlines from words like "tomorrow" and "next week". Every guess
     is listed as an assumption instead of being hidden.
   - Click **Review as editable list**, change one row (try laundry 30 → 45
     minutes), then click **Save these commitments**. Notice the numbers
     downstream would shift with your edit.
   - **Say it:** *"The parser never invents commitments, every assumption is
     shown, and what I edited is what got saved — nothing happens silently."*

## Act 2 — Make space, with consent (1 min)

*Goal: you're overloaded, so the town offers to rearrange the week — but you
stay in charge of every change.*

3. Open the **Clock Tower**. Kai shows a proposal: move low-priority flexible
   tasks with slack to Saturday. Your fixed lectures, the café shift, and the
   club meeting appear visibly **locked**; the ERD assignment is never offered
   because it's due tomorrow and moving it would break its deadline.
   - **What just happened (the logic):** the rebalancing engine ranked your
     flexible tasks — lowest priority first, most deadline-slack first — and
     simulated moving them until Thursday drops out of the Overloaded band. The
     result is a *preview*: your real schedule is untouched until you approve.
   - Uncheck one move and watch Thursday's after-value change live — that's the
     preview recalculating. Re-check it and click **Approve these 2 moves**.
    - **Say it:** Thursday **108% → 91.5% (Heavy)**, Saturday 15.4% → 22.4% and
      stays Open. *"Nothing moved until I approved it. Reject would have left my
      week exactly as it was."*
    - Numbers assume the seeded week, unedited. If you edited anything at Town
      Hall, expect different figures — that is the parser working live, not the
      demo breaking.
   - Optional glance: open the **Backpack** — your load shown as carried items
     with locked/flexible badges — and notice it got lighter. Workload as
     luggage you can set down, not a grade.

## Act 3 — One checkpoint, one session (1.5 min)

*Goal: one scary assignment becomes one small step, and you take it with
company.*

4. Open the **Library**. First the app asks what's *actually* in the way —
   choose ***I do not know where to begin***.
   - **What just happened (the logic):** instead of generic advice, the plan
     follows your blocker to the right guardian — Mira, who understands study
     tangles. Because your brief is pasted in, the first checkpoint is grounded
     in your brief's first deliverable, not an example from someone else's
     course. Pick the ~20-minute checkpoint; rewrite its title if you like —
     every word stays editable.
   - Click **Extract deliverables** to show the brief turning into a checklist
     (pattern matching, local, editable — extracted text never becomes your
     submitted work).
5. Click **Start a Pace Session**. Tour the workspace in 20 seconds:
   - **One checkpoint** with its definition of done — the only thing on your
     plate.
   - **Timer**, untimed by default. *"A timer running out never completes work
     here — only you can."*
   - **Scratchpad** for messy notes, links, and half-thoughts.
   - **Ask Mira → Explain**. **Say it:** *"Listen — she's talking about my
     task and my checkpoint, not a canned example. All six help modes answer
     from my task, my blocker, and my brief."*
6. Select **Partial progress**, keep *"Add the enrolment junction entity"* as
   the next action, click **Save and leave**.
   - **What just happened (the logic):** partial progress earns 20 XP because in
      this town, naming the next action *is* the success condition — completed,
      partial, blocked, and rescheduled are all valid endings. Watch the HUD
      quest card flip to *Recover first*: Thursday sits at 91.5% after the
      rebalance, so with work banked the system foregrounds exactly one next
      thing instead of five equal buttons. (If Thursday is still over 95%, the
      card keeps foregrounding making space instead — same rule, honest numbers.)

## Act 4 — Recover both ways (1 min)

*Goal: rest is part of the loop, on screen and off it — and pausing never
costs you your place.*

7. Go to the **Garden Pavilion** (or via **Pause & regulate** mid-session): tap
   the pond a few times. Ripples spread, petals drift, a fish swims, flowers
   bloom as you participate. Toggle the breathing guide (inhale 4, hold 2,
   exhale 6 — or hide it entirely), then **Done for now → Lighter → Resume
   checkpoint**.
   - **What just happened (the logic):** participation — not points, speed, or
     duration — completed the activity. Your Lighter/Same/Not sure answer is
     stored as a preference that tunes future suggestions; it is never a health
     score. Resuming restores your checkpoint, notes, and timer exactly.
   - **Say it:** *"No score, no failure, and leaving early is also a valid
     ending."*
8. Go to the **Park → Pocket of Green**. Pick **open-window observation**,
   **self-confirm**, **Done**.
   - **What just happened (the logic):** this is the real-world twin of the
     pond — 5–10 minutes with something green, in four settings (outside,
     window, indoor plant, image) so nobody is assumed able-bodied, outdoors,
     or on camera. An optional photo is checked *on your device* for greenery
     or daylight only — never location, identity, or mood — and an uncertain
     result just asks you to confirm manually. A denied camera skips straight
     to self-confirm.
   - **Say it:** *"Both paths earn identically — 20 XP. The system must never
     pay more for photographic proof than for your word."*

## Act 5 — Memory and evidence (30 sec)

*Goal: keep a souvenir of the reset, then see the whole story written down.*

9. Click **Turn it into a Keepsake**. Choose **Create keepsake, discard
   original**, tick the four privacy confirmations, **Generate**, approve the
   preview, and place it in the **Recovery Garden**.
   - **What just happened (the logic):** your photo was redrawn into pixels
     (which strips location data by construction), snapped to the town's color
     palette by a local filter — or drawn as a symbolic card if you had no
     photo. Nothing is placed without your preview approval, the original is
     deleted exactly as you chose, and the photo earned *nothing extra*.
   - **Say it:** *"A keepsake is a memory, never proof. A failed check would
     never have blocked it, and a pretty result proves nothing."*
10. Open the **Journal** (Post Office) and read the timeline aloud: the
    rebalance with before/after values, the partial session with its reward,
    the recovery choice, the keepsake with its deletion state — and the next
    action, waiting patiently for next time.
    - Glance up: the HUD shows earned XP, coins, and level; one garden plant
      has grown; the Library fog has eased.
    - **Closing line:** *"The town responds to sustainable choices — starting,
      asking for help, replanning honestly, resting on purpose — never to
      streaks or hours. That's PaceTown: find your pace, grow your place."*

## If the audience asks…

| Question | Answer to give (and where to click) |
|---|---|
| What if I disagree with the plan? | Reject the rebalance, rewrite any checkpoint, pick another blocker — approval is always explicit (Clock Tower, Library). |
| What if I'm too tired to work? | Say *"watch this"* — Daily Briefing → low energy bends guidance; Council recommends **Recover first**; Exit Quest at Home closes the day with the next action kept. |
| Where is my data? | Settings (or Home) → **Export save (JSON)** / Delete local data. Local-first; photos optional, private, removable. |
| Does it work on a phone? | Same flow at 390px: Town List drawer, thumb D-pad, bottom sheet. Reduced-motion and high-contrast in Home and the top bar. |
| What proves the math? | `npm test` — 221 cases pin the 108% Thursday, band boundaries, parity, and no-auto-complete rules. |

## Troubleshooting (live-demo insurance)

- **Numbers differ from this script** (e.g. not 108%): someone edited the
  schedule text — Town Hall → Re-parse → Save restores it.
- **Stale state from a previous run**: Settings → **Start the example week again**.
- **No camera / file picker awkward on stage**: use self-confirm — that *is*
  the point (equal rewards), and say so.
- **Offline dare**: `npm run build; npm run preview`, then disconnect — the
  shell is runtime-cached and saves persist.

## Function reference (presenter-only — own notes, not for the audience)

Read this if you are new to the system. Each function is explained in plain
language: what it is, why it exists, and how to show it. Jargon is decoded on
first use. Key files are listed so you can quote exact paths when asked.

### Understand — see the week clearly

**Title + Kai intro** (`src/game/Game.tsx`, `src/domain/seed.ts`).
What it is: the opening screen. Kai, the planning guardian, tells you Thursday
is at 108% before you see any menus. Why it exists: a stressed student should
meet an explanation first, not a dashboard. How to show it: press Enter Campus
Grove and read Kai's three lines aloud. The 108% is calculated live from the
seeded week, not typed in.

**Town Hall intake** (`src/game/panels/Loop.tsx` → Intake, `src/domain/parse.ts`).
What it is: a plain-text box where the student describes their week ("lecture
from 9 to 12…"), plus an optional assignment-brief box. A deterministic local
parser turns the text into a list of commitments with time, category (time,
mental, physical, social, errands), and fixed/flexible type. Anything the parser
had to guess (e.g. "assumed 30 minutes") is shown as an assumption, never hidden.
Why it exists: typing a week is easier than filling a form, and no AI is needed.
How to show it: open Town Hall, point at confidence 1.00 and the 3 assumptions,
click Review as editable list, edit one row, save.

**Understand / Daily Load** (`Loop.tsx` → Understand, `src/domain/workload.ts`).
What it is: the math behind the 108%. Each flexible task gets a *weighted
demand* = minutes × priority weight × mental-effort weight × urgency weight;
fixed commitments (lectures, shifts) instead shrink your available minutes.
Load % = weighted demand ÷ available minutes. Bands: Open <60, Steady 60–80,
Heavy 81–95, Overloaded 96–110, Unsustainable >110. Why it exists: every number
on screen must be explainable — "explain every score" is a product rule.
How to show it: open Understand, read one row's arithmetic aloud (ERD: 120 ×
1.25 × 1.20 × 1.15 ≈ 207).

**Daily Load + Load Weather** (`Places.tsx` → LoadPanel, `src/game/Campus.tsx`).
What it is: the same numbers expressed two ways — a breakdown panel (waking
minutes, fixed, available, weighted demand, top contributors) and ambient art on
the map (Library fog = mental load, fast clock = time pressure, parcels =
errands, café crowd = social, garden shade = physical). Why it exists: pressure
should be *felt* in the world, not just read in a table — but never as damage;
the town is never punished. How to show it: open Daily Load, then step back to
the map and point at the fog and parcels.

### Make space — reduce what can be reduced

**Rebalance Workshop** (`Loop.tsx` → Rebalance, `src/domain/rebalance.ts`).
What it is: Kai proposes moving flexible tasks with slack (low priority first,
never past deadlines, never fixed events) to Saturday, with before/after
percentages for both days. Checkboxes approve all, some, or none. Why it
exists: students shouldn't have to spot the movable pieces themselves — but the
app must never move anything without explicit approval. How to show it: uncheck
a move, watch Thursday's after-value change, re-check, approve. Thursday
108% → 91.5%, Saturday stays Open.

**Backpack** (`Places.tsx` → Backpack). What it is: Thursday's tasks shown as
things you *carry* — locked badges for fixed commitments, flexible badges for
movable work, with minutes and weighted demand. Why it exists: workload as a
container you can lighten, not a verdict on you. How to show it: open it before
and after rebalancing — it gets visibly lighter.

### Do the work — one checkpoint with a guardian

**Library work plans** (`Loop.tsx` → Work, `src/domain/plans.ts`). What it is:
pick a task, answer what's blocking you (unclear start, too large, missing
knowledge/materials, low capacity, perfection pressure, something else), and get
an editable checkpoint list from the guardian whose specialty matches (Mira for
understanding, Kai for planning, Sol for low capacity, Sky for perfection
pressure, Goh for materials). The first checkpoint is grounded in your brief's
deliverables when a brief exists. Why it exists: intimidating work starts when
it becomes one small, owned step. How to show it: pick "I do not know where to
begin", extract brief deliverables, rewrite a checkpoint title live.

**Pace Session** (`Loop.tsx` → Session, `src/domain/guidance.ts`). What it is:
the focused workspace for one checkpoint: its definition of done, an optional
timer (untimed by default — a timer reaching zero never completes anything),
a scratchpad, six help modes (Plan, Explain, Brainstorm, Review, Debug, What
next?), and always-available escape routes (Pause & regulate, Reduce the scope,
Reschedule, Save & leave). Sessions end as completed, partial, blocked, or
rescheduled — all valid. Why it exists: help must arrive *inside* the work, and
stopping honestly must be rewarded, not punished. How to show it: ask Mira to
Explain (the answer references your task, not a canned example), pick Partial
progress, save the next action.

**Guardian Council** (`Places.tsx` → Council). What it is: when pressures
compete, the three most relevant guardians each give one short read of the
numbers (Mira names your largest contributor), and one recommendation is
foregrounded: do one checkpoint, make space, recover first, gather what's
missing, or choose for yourself. Why it exists: one clear suggestion beats five
equal buttons when you're overloaded — but the student always decides. How to
show it: open it after the session; it should say Recover first.

### Recover — rest without losing progress

**Gentle Ripples** (`src/game/panels/Ripples.tsx`, `src/domain/regulation.ts`).
What it is: the flagship mini-game at the Garden Pavilion. Tap the pond to make
ripples; petals drift, a fish swims, flowers bloom as you participate; an
optional breathing circle (inhale 4, hold 2, exhale 6) can be hidden. No score,
no failure, no minimum time; leaving early is a valid ending. It ends with an
optional Lighter / Same / Not sure response (a preference, never a health
score) and three return paths: resume, reduce scope, keep resting. Why it
exists: regulation needs to be available before, during, and after work — and
pausing must never lose your place. How to show it: tap a few times, toggle the
breathing guide, finish, resume the checkpoint with notes intact.

**Pocket of Green** (`src/game/panels/Pocket.tsx`, `src/domain/photo.ts`).
What it is: the real-world quest at the Park — 5–10 minutes with something
green, via four settings (go outside, open window, indoor plant, nature image).
Confirm by your own word or an optional photo, which is checked *locally* for
greenery/daylight only. Outcomes: done, partly done, changed mind, choose
another; a denied camera falls back to self-confirm. Why it exists: recovery
shouldn't require a screen, proof, or able-bodied outdoors access — and photos
must never earn more than honesty. How to show it: pick window + self-confirm +
Done, and say the XP (20) is identical either way.

**Firefly Stories, Chime Drift, Warm Cup, Night Lanterns**
(`src/game/panels/Minis.tsx`). What they are: the other four mini-games —
follow story lights with Mira; tap slow chimes with Kai (or just watch); brew an
unruinable drink with Sky; light a lantern for a worry with Goh. Same contract
as Ripples: no score, muted by default, reduced-motion variants, early exit,
response, and each game's own return paths. Why they exist: different stuck
feelings need different pauses. How to show them: Calm Corner lists all five;
if time is short, just open Warm Cup and complete the 4-step ritual.

**Calm Corner** (`Places.tsx` → Calm). What it is: direct access to all five
activities with zero prerequisites — no load score or active task needed. Why it
exists: you shouldn't have to earn rest. Mention it when showing Ripples.

### Remember and grow — nothing is lost

**Pace Keepsakes pipeline** (`src/game/panels/Keepsakes.tsx`,
`src/domain/keepsake.ts`). What it is: after an IRL quest, an optional photo
can become private pixel art. You pick one of four explicit policies (verify
and discard / keepsake and discard original / save both privately / cancel),
the image is redrawn (which strips location metadata), you confirm a privacy
checklist, a local palette filter (or symbolic fallback with no photo)
generates the art, and you approve a preview before placing it in the Journal,
Garden, town, mailbox, or collection. Why it exists: memories without
surveillance — verification and art-making are separate, failure never blocks a
keepsake, and photo users gain zero advantage. How to show it: create-and-
discard → generate → approve → place in the Recovery Garden.

**Collection** (`Keepsakes.tsx` → Collection). What it is: your private grid of
keepsakes — filter by category, rename, move placement, download, delete. Each
card states whether the original was retained or discarded. No feed, no
trading, no rarity. Mention it right after placing a keepsake.

**Journal** (`Places.tsx` → Journal, `src/game/state.ts`). What it is: an
automatic private timeline — every rebalance, session, recovery, keepsake, and
reward, plus the waiting next action. No mood scores, no streaks, no
missed-day shame. Why it exists: returning students shouldn't have to
reconstruct anything. How to show it: read the last three entries aloud at the
end of the demo.

**Recovery Garden** (`Places.tsx` → Garden). What it is: one plot with five
growth stages, fed by work progress, recovery, replanning, and help-seeking.
Nothing wilts; absence removes nothing. Why it exists: visible proof that
sustainable choices accumulate. How to show it: point at the taller sprout in
Act 5.

**Future Mailbox** (`Places.tsx` → Mailbox). What it is: send your next action
or a kind note to your future self; it waits for the next session instead of
nagging you. Show it as a return choice after Pocket of Green.

**Daily Briefing** (`Places.tsx` → Briefing). What it is: wake/sleep hours plus
optional energy/stress check-in. Energy *bends* the guidance within a bounded
range and is always shown beside — never instead of — the raw %. Skipping is
always one click. Mention it when asked "what if I'm tired."

### System — the invisible parts worth naming

**HUD quest card** (`src/game/Game.tsx`, `src/domain/quests.ts`). What it is:
the bottom-left card that always shows one foregrounded quest (up to three
exist; only one is pushed under high pressure) plus a resume card when a
checkpoint is in progress. Quests can be replaced without penalty; frequently
skipped kinds appear less often. Name it when it flips to "Recover first."

**Home + Exit Quest** (`Places.tsx` → Home). What it is: Quiet Mode (less
motion, life, and effects), high contrast, capacity settings, save export
(JSON) and deletion — plus the Exit Quest: close the day intentionally with
progress recorded and the next action kept. Start here to reset the demo.

**Town List** (`Places.tsx` → TownList, `src/game/layout.ts`). What it is: a
list that reaches every place on the map — nothing is pointer-only. It is the
keyboard and screen-reader path through the whole game. Mention it whenever you
walk somewhere: "or Town List, same destination."

**Saves + storage** (`src/game/state.ts`, `src/game/storage.ts`). What it is:
versioned saves in the browser (currently v4, migrated forward — never wiped)
behind an adapter, so production can swap in IndexedDB later. Mention it when
you reload mid-demo without fear.

**Offline shell** (`assets/app-runtime-v1/sw.js`, `assets/app-runtime-v1/manifest.webmanifest`,
`src/main.tsx`). What it is: the app is an installable PWA whose shell is
runtime-cached, so a built copy works with the Wi-Fi off. Save it for the
closing dare.
