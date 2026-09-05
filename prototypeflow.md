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

For a clean run, open `/reset` first — it wipes the save and session and drops
you straight back on `/game` with the seeded week. (Or **Home → Delete local
data**, which is the same wipe but lands on the landing page; or **Settings →
Start the example week again**, which reseeds the week in place and keeps you
in the town — that one is the gentlest between runs, and **Delete local data**
is the full wipe, so use it to finish, not to reset.) Reloading mid-demo is
safe — saves are versioned and you return to the title screen with progress
intact.

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

1. Press **Enter Campus Grove**. Kai, the keeper of the Clock Tower, greets a
   new player with the first-run intro: *"You made it. Take a breath before you
   look at any of it. Your week is already waiting at Town Hall — one
   plain-language list."* Choose **Show me my week** — the intro deliberately
   leads new players to Town Hall first, before any numbers.
   - **What just happened (the logic):** the intro is written for a brand-new
     save: it points at the plain-language list, not at the math, so you see
     where the numbers come from before you hear them. The title hook above
     the button already tells the honest figure — *Thursday is at 103%* —
     calculated live from the seeded week, never typed in.
2. Open **Town Hall** (walk there or Town List). The parse preview shows
   **9 commitments, confidence 1.00, and 3 visible assumptions** (for example,
   "No deadline given for 'weekly groceries 45 minutes' — treated as flexible
   this week").
   - **What just happened:** the app parsed the seeded text into 9 commitments,
     sorted them into fixed (lectures, commute, shift, club — 570 minutes that
     consume your day directly) and flexible (everything else), and computed
     Thursday: 570 fixed minutes plus 356 weighted flexible minutes over 900
     waking minutes lands at **102.9%**. Over 100% simply means "more planned
     than fits" — it is schedule guidance, and the app says so on screen. It
     never calls it stress, and never calls *you* anything. The parsing itself
     is a small local parser — no AI, no cloud — that splits sentences on
     commas, recognizes keywords ("lecture" → time/fixed, "groceries" →
     errands/flexible), reads clock ranges and durations, and guesses
     deadlines from words like "tomorrow" and "next week". Every guess is
     listed as an assumption instead of being hidden.
   - Click **Review as editable list**, change one row (try laundry 30 → 45
     minutes), then click **Save these commitments**. Notice the numbers
     downstream would shift with your edit.
   - **Say it:** *"The parser never invents commitments, every assumption is
     shown, and what I edited is what got saved — nothing happens silently."*

## Act 2 — Make space, with consent (1 min)

*Goal: you're overloaded, so the town offers to rearrange the week — but you
stay in charge of every change.*

3. Enter the **Clock Tower** (the Clock Tower room on campus; the quest card
   also routes you there). Walk to the **Week Board** — or talk to Kai, whose
   speech offers the board directly. The board opens on Kai's consent proposal
   (auto-preview): three Thursday tasks are **softly outlined** — bursary form,
   weekly groceries, laundry — and their ghost blocks already appear on
   Saturday as previews. Your fixed lectures, the café shift, and the club
   meeting sit visibly **locked** with a ⌑ badge; the ERD assignment is never
   offered because it's due tomorrow and moving it would break its deadline.
   Pick a destination day (Friday/Saturday/Sunday appear as options), compare
   the before/after loads, uncheck one move and watch Thursday's after-value
   change live — that's the preview recalculating — then click
   **Approve 3 moves**.
   - **What just happened (the logic):** the rebalancing engine ranked your
     flexible tasks — lowest priority first, most deadline-slack first — and
     simulated moving them until Thursday drops out of the Overloaded band.
     The result is a *preview*: your real schedule is untouched until you
     approve.
   - **Manual alternative (worth one sentence):** *"or drag a flexible task to
     another day yourself — same consent rule, fixed tasks never move."* The
     same board is a drag-and-drop calendar: flexible tasks drag, fixed ones
     don't, a move past a deadline is refused, and **Undo last move** is
     always one click.
   - **Say it:** Thursday **103% → 95% (Heavy)**, Saturday **10% → 18%** and
     stays Open. *"Nothing moved until I approved it. Reject would have left
      my week exactly as it was."* (103% and 95% are the board's rounded
      on-screen readings; precisely they are 102.9 → 94.6 — Heavy either way
      you read it.)
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
   choose ***I do not know where to begin***. A message box opens like a
   dialogue with that guardian: Mira's opener, and the plan she built for
   your task. **← Back** returns you to the blocker list, so the choice is
   never a trap.
   - **What just happened (the logic):** instead of generic advice, the plan
     follows your blocker to the right guardian — Mira, who understands study
     tangles (Kai plans, Sol holds capacity, Sky sits with you, Goh gathers
     missing pieces). Because your brief is pasted in, the first checkpoint is
     grounded in your brief's first deliverable, not an example from someone
     else's course. Pick the ~20-minute checkpoint; rewrite its title,
     minutes, or definition of done — every word stays editable.
   - Click **Extract deliverables** to show the brief turning into a checklist
     (pattern matching, local, editable — extracted text never becomes your
     submitted work).
   - **Work with** is a guardian picker — the blocker's guardian is the routed
     default (highlighted), and you can switch (Mira explains, Kai plans, Sol
     keeps it small, Sky stays close, Goh gathers). The picker, the session,
     and the resume card all follow the same chosen guardian.
5. Click **Start a Pace Session with Mira**. Tour the workspace in 20 seconds:
   - **One checkpoint** with its definition of done — the only thing on your
     plate.
   - **Timer**, untimed by default. *"A timer running out never completes work
     here — only you can."*
   - **Scratchpad** for messy notes, links, and half-thoughts.
   - **Ask Mira → Explain**. **Say it:** *"Listen — she's talking about my
     task and my checkpoint, not a canned example. All six help modes answer
     from my task, my blocker, and my brief."* (Plan, Explain, Brainstorm,
     Review, Debug, What next? — all local, no AI provider connected.)
   - **Mira's action**: one guardian action button under your chosen
     guardian — Mira **drafts an outline into the scratchpad**, Kai **splits
     the checkpoint in two**, Sol **shrinks it to a 5-minute step**, Sky
     **sits with you** (starts the count-up together), Goh **adds a gathering
     checklist**.
6. Select **Partial progress**, keep *"Add the enrolment junction entity"* as
   the next action, click **Save and leave**.
   - **What just happened (the logic):** partial progress earns 20 XP because in
     this town, naming the next action *is* the success condition — completed,
      partial, blocked, and rescheduled are all valid endings. Watch the HUD
      quest card flip to *Take a short reset* — its single destination is the
      Recover view: work is banked, so the system foregrounds exactly one next
      thing instead of five equal buttons — the map, the dock, and the Council
      all follow the same shared rule.
   - **Leave and come back:** the quest card becomes a guardian-voiced
     **resume ritual** — your guardian greets you with your task, checkpoint,
     time so far, and the saved next action, with Resume / Edit plan /
     Something else. Nothing about your place is ever lost.

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
     score. Resuming restores your checkpoint, notes, and timer exactly. The
     **first recovery of a run pays 20 XP; further pauses pay nothing** — rest
     is rewarded once, not farmed.
   - **Say it:** *"No score, no failure, and leaving early is also a valid
     ending."*
8. Go to the **Park → Pocket of Green**. Pick **open-window observation**
   (three-step wizard: setting → how to confirm → how it went), **self-confirm**,
   **Done**.
   - **What just happened (the logic):** this is the real-world twin of the
     pond — 5–10 minutes with something green, in four settings (outside,
     window, indoor plant, image) so nobody is assumed able-bodied, outdoors,
     or on camera. An optional photo is checked *on your device* for greenery
     or daylight only — never location, identity, or mood — and an uncertain
     result just asks you to confirm manually. A denied camera skips straight
     to self-confirm. As with Ripples, only the first recovery pays.
   - **Say it:** *"Both paths earn identically — 20 XP on the first recovery,
     nothing after. The system must never pay more for photographic proof than
     for your word."*

## Act 5 — Memory and evidence (30 sec)

*Goal: keep a souvenir of the reset, then see the whole story written down.*

9. Click **Turn it into a Keepsake** (from Pocket of Green's done state).
   Follow the four-step wizard — policy → photo → prepare → approve: choose
   **Create keepsake, discard original**, tick the four privacy confirmations,
   **Generate**, approve the preview, and place it in the **Recovery Garden**.
   The step numbers and the `?` dot on every screen are first-timer aids —
   mention the stepper, not the details.
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
| What if I disagree with the plan? | Reject the proposal, rewrite any checkpoint, pick another blocker, drag a task yourself — approval is always explicit (Clock Tower Week Board, Library). |
| What if I'm too tired to work? | Say *"watch this"* — Daily Briefing → low energy bends guidance; Council recommends **Recover**; Exit Quest at Home closes the day with the next action kept. |
| Where is my data? | Settings or Home → **Export save (JSON)** / Delete local data. Local-first; photos optional, private, removable. |
| Does it work on a phone? | Same flow at 390px: Town List drawer, thumb D-pad, bottom sheet. Reduced-motion and high-contrast in Home and the top bar. |
| What proves the math? | `npm test` — 296 cases pin the 103% Thursday, the bands, parity, and no-auto-complete rules. |

## Troubleshooting (live-demo insurance)

- **Numbers differ from this script** (e.g. not 103%): someone edited the
  schedule text — Town Hall → Re-parse → Save restores it.
- **Reset between runs**: open `/reset` — wipes the save and session, then
  lands on `/game` with the seeded week. Or **Settings → Start the example
  week again** to reseed in place without leaving the town.
- **Stale state from a previous run**: Settings → **Start the example week again**.
- **No camera / file picker awkward on stage**: use self-confirm — that *is*
  the point (equal rewards), and say so.
- **Offline dare**: `npm run build; npm run preview`, then disconnect — the
  service worker registers **in production builds only** (`/sw.js`), the shell
  is runtime-cached, and saves persist. It will not work in `npm run dev`,
  which deliberately never registers a worker.

## Function reference (presenter-only — own notes, not for the audience)

Read this if you are new to the system. Each function is explained in plain
language: what it is, why it exists, and how to show it. Jargon is decoded on
first use. Key files are listed so you can quote exact paths when asked.

### Understand — see the week clearly

**Title + Kai intro** (`src/game/Game.tsx`, `src/game/layout.ts`).
What it is: the opening screen. The title hook tells you Thursday is at 103%
before you see any menus; on a brand-new save the first-run Kai dialogue then
leads you to Town Hall first ("Show me my week") so the plain-language list
precedes the math. Why it exists: a stressed student should meet an
explanation first, not a dashboard. How to show it: press Enter Campus Grove,
read Kai's two lines aloud, choose "Show me my week". The percentage is
calculated live from the seeded week, not typed in.

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
What it is: the math behind the 103%. Fixed commitments (lectures, shifts)
count once at face value and shrink your available minutes; each flexible task
adds a *weighted demand* = minutes × priority weight × mental-effort weight ×
urgency weight. Load % = (fixed minutes + weighted demand) ÷ waking minutes.
Bands: Open <60, Steady 60–80, Heavy 81–95, Overloaded 96–110, Unsustainable
>110. Why it exists: every number on screen must be explainable — "explain
every score" is a product rule. How to show it: open Understand, read one
row's arithmetic aloud (ERD: 120 × 1.25 × 1.20 × 1.15 ≈ 207).

**Daily Load + Load Weather** (`Places.tsx` → LoadPanel, `src/game/Campus.tsx`).
What it is: the same numbers expressed two ways — a breakdown panel (waking
minutes, fixed, available, weighted demand, top contributors) and ambient art on
the map (Library fog = mental load, fast clock = time pressure, parcels =
errands, café crowd = social, garden shade = physical). Why it exists: pressure
should be *felt* in the world, not just read in a table — but never as damage;
the town is never punished. How to show it: open Daily Load, then step back to
the map and point at the fog and parcels.

### Make space — reduce what can be reduced

**Clock Tower Week Board** (`src/game/ClockTower.tsx`, `src/domain/rebalance.ts`,
`src/domain/calendar.ts`). What it is: a real room on campus with a seven-day
planning board. Kai proposes moving flexible tasks with slack (low priority
first, never past deadlines, never fixed events) to a destination day, with
before/after percentages for both days; suggested moves open as a soft-outlined
auto-preview, and you approve all, some, or none. Below the proposal, the same
board is a drag-and-drop calendar — flexible tasks drag between days (fixed
ones never do), deadline guards refuse late moves, and Undo undoes. Why it
exists: students shouldn't have to spot the movable pieces themselves — but the
app must never move anything without explicit approval. How to show it: walk to
the Week Board, watch the preview open by itself, uncheck a move and watch
Thursday's after-value change, re-check, approve. Thursday 103% → 95%,
Saturday stays Open. (This replaced the old in-panel Rebalance Workshop — the
clock room and the board are the one true path now.)

**Backpack** (`Places.tsx` → Backpack). What it is: Thursday's tasks shown as
things you *carry* — locked badges for fixed commitments, flexible badges for
movable work, with minutes and weighted demand. Why it exists: workload as a
container you can lighten, not a verdict on you. How to show it: open it before
and after rebalancing — it gets visibly lighter.

### Do the work — one checkpoint with a guardian

**Library work plans** (`Loop.tsx` → Work, `src/domain/plans.ts`). What it is:
pick a task, answer what's blocking you (unclear start, too large, missing
knowledge/materials, low capacity, perfection pressure, something else), and a
message box opens with that guardian's opener and an editable checkpoint list
— Mira for understanding, Kai for planning, Sol for low capacity, Sky for
perfection pressure, Goh for materials. ← Back returns to the blocker list; a
"Work with" picker switches guardians with the blocker's own guardian routed
as the default. The first checkpoint is grounded in your brief's deliverables
when a brief exists. Why it exists: intimidating work starts when it becomes
one small, owned step. How to show it: pick "I do not know where to begin",
extract brief deliverables, rewrite a checkpoint title live, switch guardian
and back.

**Pace Session** (`Loop.tsx` → Session, `src/domain/guidance.ts`). What it is:
the focused workspace for one checkpoint: its definition of done, an optional
timer (untimed by default — a timer reaching zero never completes anything),
a scratchpad, six help modes (Plan, Explain, Brainstorm, Review, Debug, What
next?) under **Ask {your guardian}**, one guardian action button (Mira drafts
an outline, Kai splits the checkpoint, Sol shrinks it, Sky sits with you, Goh
adds a gathering list), and always-available escape routes (Pause & regulate,
Reduce the scope, Reschedule, Save & leave). Sessions end as completed,
partial, blocked, or rescheduled — all valid. Why it exists: help must arrive
*inside* the work, and stopping honestly must be rewarded, not punished. How
to show it: ask Mira to Explain (the answer references your task, not a canned
example), click her action button, pick Partial progress, save the next action.

**Resume ritual card** (`src/game/ResumeCard.tsx`). What it is: when a
checkpoint is open and no outcome is banked, the quest card becomes your
guardian's welcome-back — task, checkpoint, time so far, saved next action —
with Resume / Edit plan / Something else. Why it exists: returning must feel
like being handed your own place, not a restart. How to show it: save partial
progress, then leave the Session and come back to the map.

**Guardian Council** (`Places.tsx` → Council). What it is: when pressures
compete, the three most relevant guardians each give one short read of the
numbers (Mira names your largest contributor), and one recommendation is
foregrounded: do one checkpoint, make space, recover, gather what's
missing, or choose for yourself. Why it exists: one clear suggestion beats five
equal buttons when you're overloaded — but the student always decides. How to
show it: open it after the session; it should say Recover.

### Recover — rest without losing progress

**Gentle Ripples** (`src/game/panels/Ripples.tsx`, `src/domain/regulation.ts`).
What it is: the flagship mini-game at the Garden Pavilion. Tap the pond to make
ripples; petals drift, a fish swims, flowers bloom as you participate; an
optional breathing circle (inhale 4, hold 2, exhale 6) can be hidden. No score,
no failure, no minimum time; leaving early is a valid ending. It ends with an
optional Lighter / Same / Not sure response (a preference, never a health
score) and three return paths: resume, reduce scope, keep resting. The first
recovery of a run pays 20 XP; further pauses pay nothing. Why it exists:
regulation needs to be available before, during, and after work — and pausing
must never lose your place. How to show it: tap a few times, toggle the
breathing guide, finish, resume the checkpoint with notes intact.

**Pocket of Green** (`src/game/panels/Pocket.tsx`, `src/domain/photo.ts`).
What it is: the real-world quest at the Park — 5–10 minutes with something
green, via four settings (go outside, open window, indoor plant, nature image),
run as a three-step wizard (setting → confirm → outcome). Confirm by your own
word or an optional photo, which is checked *locally* for greenery/daylight
only. Outcomes: done, partly done, changed mind, choose another; a denied
camera falls back to self-confirm. Why it exists: recovery shouldn't require a
screen, proof, or able-bodied outdoors access — and photos must never earn
more than honesty. How to show it: pick window + self-confirm + Done, and say
the XP (20, once per run) is identical either way.

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
can become private pixel art, walked through a four-step wizard (policy →
photo → prepare → approve — each step numbered, each screen carrying a `?`
dot). You pick one of four explicit policies (verify and discard / keepsake
and discard original / save both privately / cancel), the image is redrawn
(which strips location metadata), you confirm a privacy checklist, a local
palette filter (or symbolic fallback with no photo) generates the art, and you
approve a preview before placing it in the Journal, Garden, town, mailbox, or
collection. Why it exists: memories without surveillance — verification and
art-making are separate, failure never blocks a keepsake, and photo users gain
zero advantage. How to show it: create-and-discard → generate → approve →
place in the Recovery Garden.

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
skipped kinds appear less often. The map, the dock, and the Council follow the
same shared rule, so they never disagree. Name it when it flips to "Take a short reset."

**Guardian dock** (`src/game/GuardianDock.tsx`). What it is: all five guardians
on the left rail, each showing what their own module currently says about your
week and one button for the screen worth opening right now. A guardian is
"waiting" only when something of theirs is genuinely open — the dock never
nags or counts down. Why it exists: guidance with a face, derived from the
domain layer rather than written copy. How to show it: hover Kai before the
rebalance ("3 things can move to Saturday"), then Mira after the session
("1 checkpoint still open").

**Home + Exit Quest** (`Places.tsx` → Home). What it is: Quiet Mode (less
motion, life, and effects), high contrast, capacity settings, save export
(JSON) and deletion — plus the Exit Quest: close the day intentionally with
progress recorded and the next action kept. Start here to reset the demo
(Delete local data) or to export the save.

**Town List** (`Places.tsx` → TownList, `src/game/layout.ts`). What it is: a
list that reaches every place on the map — nothing is pointer-only. It is the
keyboard and screen-reader path through the whole game. Mention it whenever you
walk somewhere: "or Town List, same destination."

**Saves + storage** (`src/game/state.ts`, `src/game/storage.ts`). What it is:
versioned saves in the browser (currently v4, migrated forward — never wiped)
behind an adapter, so production can swap in IndexedDB later. Mention it when
you reload mid-demo without fear.

**Offline shell** (`assets/app-runtime-v1/sw.js`,
`assets/app-runtime-v1/manifest.webmanifest`, `src/main.tsx`). What it is: the
app is an installable PWA whose shell is runtime-cached in **production
builds only** — `main.tsx` registers `/sw.js` behind `import.meta.env.PROD`,
so a built copy works with the Wi-Fi off while the dev server always serves
fresh code. Save it for the closing dare.

**`?` help dots and wizard steppers** (`src/game/panels/HelpDot.tsx`,
`src/game/help.ts`). What they are: every panel heading carries a `?` dot
explaining what the screen is, what to do, and which guardian helps and why
(with one live line that adapts to your actual week); multi-step flows (Pocket
of Green, Keepsakes) number their steps out loud. Why they exist: first-timers
never face a bare screen. How to show it: click the `?` next to any heading,
and point at "Step 2 of 3" in Pocket of Green.
