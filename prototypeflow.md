# PaceTown — Prototype Demo Flow

A scripted, repeatable walkthrough that proves the system works end to end.
One presenter, one browser, ~7 minutes. Every step is a **recording take**:
a block of `ACTION` and `SAY` lines in the exact order you perform them —
read top to bottom, do each action, say each line, and the take is done.
A short **Dev note** after each take explains the logic to the operator
(not for the camera). Every input below is **prefilled in the
app already** (the seeded demo week's schedule and brief) — you only paste if
you want to show the parser working from raw text; the reflect panel's
*What changed* note and next action you type live.

## Before you use it — the 10-minute outsider walkthrough

You have never seen PaceTown. This is the shortest honest tour. One loop,
no scores, no guilt:

> See your whole week as one number → move what can safely move → turn one
> scary task into one small step → work with a guardian beside you → rest
> on purpose → everything you did is written down for next time.

1. Open `http://localhost:5173/game` (or press **Start today's mission** on
   the landing page — the primary button plays immediately as a guest, no
   account needed). Kai greets you and — on a first run — walks you to
   **Town Hall**. Your week is already typed there in plain language; press
   **Save these commitments**. The number on the HUD is calculated from it,
   never written in.
2. Walk to the **Clock Tower** (or Town List → Clock Tower). The Week Board
   opens on Kai's suggestion: some tasks are softly outlined as previews.
   Compare Thursday before → after, then **Approve**. Nothing moved until
   you said so.
3. Walk to the **Library** and **Talk to Mira**. Pick one task from your
   open work, answer one short question (what is making it difficult), and
   she proposes one small checkpoint with a clear finish line. **Use this
   step**, then walk to your **study desk**.
4. The session is one checkpoint, one timer (optional), one scratchpad.
   **Ask Mira** when stuck — she answers from your task, not a canned
   example. When you stop: **Pause or record progress** → say how it went →
   leave a note. **Save and stand up**.
5. Leave and come back: the desk greets you with **Welcome back** — what you
   changed, your next action, time spent. The HUD card carries the same
   summary. Rest at the **Garden Pavilion** or the **Park** whenever you
   like; reading the **Post Office** journal shows the whole day honestly.

That is the whole system. Everything below is the same tour, scripted for a
presenter with timings.

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

> Database Systems lecture from 9 am to 12 pm, 90 minute commute, Film Society
> at 5 pm, café shift from 6 pm to 10 pm, ERD assignment due tomorrow takes
> 120 minutes, revise normalisation notes for 62 minutes, weekly groceries
> 45 minutes, bursary form due next week 30 minutes, laundry 30 minutes

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

## Act 1 — The week, understood (Steps 1–2, ~1.5 min)

*Goal: hook the viewer in the first ten seconds — your week already has a
number, and you're about to take control of it.*

**Recording basics:** walk with `W` `A` `S` `D` or arrow keys — the avatar
animates in the direction you walk — press `E` next to a glowing place to
enter it, `Esc` to step back out. On a phone, use the on-screen direction
pad. Lost? Open the **Town List** — every place is listed there. In the
blocks below, read the `ACTION` and `SAY` lines top to bottom and perform
them in that order — that is the take.

### Step 1 — Title → Town Hall

**Where you are:** fresh save via `/reset` → `/game` → the title screen,
Thursday at 103% in the title hook.

> **ACTION** Press **Enter Campus Grove**.
> **SAY** *"Ever feel like your week is already booked before you even wake
> up? That's the feeling this little town was built to fix. Your week has a
> number — right there, 103%. It's not a judgement and it's not a score. It's
> arithmetic. And in the next five minutes, I'm going to show you exactly
> what to do about it."*
> **ACTION** Click **Show me my week**. You land inside the Town Hall intake
> panel.
> **SAY** *"And notice — PaceTown doesn't throw a dashboard at you. It takes
> you to Town Hall, where your whole week is typed out in plain words.
> Because before you can fix a week, you have to actually see it."*

**Dev note:** the intro targets a brand-new save: it points at the
plain-language list, not the math, so the numbers' origin comes first. The
title hook above the button already reads *Thursday is at 103%* — computed
live from the seeded week, never typed in.
**→ Next:** Step 2 continues inside Town Hall.

### Step 2 — Save the parsed week

**Where you are:** inside the Town Hall intake panel from Step 1.

> **ACTION** Point at the parse preview: **9 commitments, confidence 1.00,
> and 3 visible assumptions** (e.g. "No deadline given for 'weekly groceries
> 45 minutes' — treated as flexible this week").
> **SAY** *"Nine commitments — all pulled from one sentence you typed. And
> look here: every guess the machine made is sitting right out in the open.
> No hidden assumptions. No silent surprises. That's the whole deal — nothing
> happens quietly in PaceTown."*
> **ACTION** Click **Review as editable list**, change one row (laundry 30 →
> 45 minutes), then click **Save these commitments**. Press `Esc` to step
> back to the campus map.
> **SAY** *"I just edited one thing — groceries get fifteen extra minutes —
> and the whole week downstream will respect that. You're the editor of your
> own schedule. PaceTown just does the bookkeeping. Now let's go make some
> room."*

**Dev note:** the seeded text parses into 9 commitments — fixed (lectures,
commute, shift, club: 570 minutes) and flexible (everything else) — and
Thursday computes as 570 fixed + 356 weighted flexible over 900 waking
minutes = **102.9%**. Over 100% means "more planned than fits", never
stress. The parser is local, splits on commas, maps keywords, reads clock
ranges, and surfaces every guess as an assumption.
**→ Next:** Step 3 walks to the Clock Tower from the campus map.

## Act 2 — Make space, with consent (Step 3, ~1 min)

*Goal: show that a full week can get lighter — and that nothing moves until
you say so.*

### Step 3 — Approve Kai's proposal

**Where you are:** on the campus map after Step 2 (commitments saved).

> **ACTION** Enter the **Clock Tower** (walk in, or Town List → Clock Tower;
> the quest card also routes you there). Walk to the **Week Board** — or talk
> to Kai, whose speech offers the board directly. The board opens on Kai's
> consent proposal: three Thursday tasks are **softly outlined** — bursary
> form, weekly groceries, laundry — with ghost previews already on Saturday.
> Fixed lectures, the café shift, and the club meeting sit **locked** with a
> ⌑ badge; the ERD assignment is never offered (due tomorrow).
> **SAY** *"This is where most planners quietly give up on you. Not here.
> Kai has already found three things that can safely move — the bursary form,
> groceries, the laundry. And everything you actually have to keep — your
> lecture, your shift — is locked. Visibly. Forever. Nothing gets guessed."*
> **ACTION** Pick a destination day (Friday/Saturday/Sunday options), compare
> the before/after loads, uncheck one move and watch Thursday's after-value
> change live, then click **Approve 3 moves**.
> **SAY** *"Watch this: Thursday goes from 103% down to 95%. Saturday goes
> from 10% to 18% — and stays completely open. We just gave Thursday back a
> real slice of its day, without touching one thing you have to keep. And
> nothing — nothing — moved until I pressed approve. That's consent, built
> into the app. You stay the boss of your own week."*
> **SAY** *"Or go fully manual: drag a task to another day yourself. Same
> rule — fixed things never move, deadlines are always respected."*
> **ACTION** Optional glance: open the **Backpack** — the load got lighter.
> Press `Esc` back to the campus map.

**Dev note:** the engine ranked flexible tasks (lowest priority first, most
deadline-slack first) and simulated moves until Thursday left the Overloaded
band; the result is a preview — the schedule is untouched until approval.
(103%/95% are rounded readings; precisely 102.9 → 94.6.) Underneath, the same
board is drag-and-drop with deadline guards and **Undo last move**. Numbers
assume the unedited seeded week.
**→ Next:** Step 4 walks to the Library from the campus map.
## Act 3 — One checkpoint, one session (Steps 4–7, ~2.5 min)

*Goal: turn the scariest assignment into one small, doable step — and prove
that leaving and coming back loses nothing.*

### Step 4 — One question, one proposal

**Where you are:** on the campus map after Step 3 (week rebalanced).

> **ACTION** Enter the **Library** (walk in, or Town List → Library). Walk to
> Mira and press `E` — **Talk to Mira**. Her open-work list opens on
> Thursday: a day switcher (‹ ›) and the day's unfinished commitments, three
> to a page (*"Showing 1–3 of 6 unfinished commitments"* after the approval —
> skip Act 2 and the same page shows 9). Pick the **ERD assignment**.
> **SAY** *"Okay — here's the moment. The assignment you've been avoiding.
> Let's make it boring. In the best possible way."*
> **ACTION** On the summary card, choose **Something is getting in the way**,
> then **What is making it difficult right now?** → choose ***I do not know
> where to start*** (More choices reveals the rest). Mira proposes **one
> checkpoint** — *"Start: Identify the entities and their attributes", 15
> minutes, done means "a rough attempt exists"* — then click **Use this
> step** (*"Your place is ready at the study desk"*).
> **SAY** *"One question. What's actually in the way? Not the whole
> assignment — just the reason it's scary. 'I don't know where to start.'
> That's allowed. And Mira hands you exactly one step: identify the
> entities. Fifteen minutes. Done means a rough attempt exists. One question,
> one proposal, one finish line — that's the whole trick to starting big
> work: make the first step so small you can't say no."*

**Dev note:** the proposal comes from the local `taskGuidance` module — one
task + blocker → one sensible first step, grounded in the pasted brief's
deliverables. Rough is expected; **Make it smaller** halves the minutes,
never below five. The Library is a walkable room: the in-progress task in
the list wears the badge *"You did this before — resume at your desk"*.
**→ Next:** Step 5 walks to the study desk.

### Step 5 — Tour the session workspace

**Where you are:** the desk hotspot reads "Your place is ready" after Step 4.

> **ACTION** Walk to the **study desk** (or press `E` beside it). Tour the
> workspace: **Done when** (the finish line), the two trail fields — **What
> changed so far** and **Saved next action**, pre-filled and editable live —
> a timer that follows the checkpoint's shape (count-down here; emptying
> never completes work), a **scratchpad**, and **Ask Mira**.
> **SAY** *"This is your desk now. One checkpoint, one finish line that tells
> you exactly what done means. A timer that will never fail you — it just
> counts; only you decide when it's done. Nothing here decides for you."*
> **ACTION** Type a stuck point into **Ask Mira** ("Why does a many-to-many
> relationship need another entity?") and press ask — she answers from your
> task, checkpoint, and brief. Read one line of her answer aloud.
> **SAY** *"Stuck? Ask Mira — in your own words. 'Why does a many-to-many
> relationship need another entity?' And she answers from your task, your
> checkpoint, your brief. Not a textbook. Your work. And every note you
> write here is saved as you type — nothing can get lost."*

**Dev note:** the trail fields write straight into the save on every
keystroke, so nothing typed here is lost by navigating away; the Ask-Mira
answer is routed by keywords into Plan/Explain/Brainstorm/Review/Debug/What
next? and grounded in your task.
**→ Next:** Step 6 stops the session from inside this workspace.

### Step 6 — Save progress, bank the next action

**Where you are:** inside the session from Step 5.

> **ACTION** Choose **Pause or record progress** → **Made some progress**.
> **SAY** *"Here's the part I love. You don't have to finish to win."*
> **ACTION** In the reflect panel, **What changed?** — type one line
> ("Listed the core entities"). **What is the easiest next action?** — keep
> *"Add the enrolment junction entity"*. Click **Save and stand up**.
> **SAY** *"Partial progress — twenty XP for showing up, fifteen more for
> naming the next step. Because in PaceTown, knowing exactly what to do next
> is the success condition. Watch the card — it flips to 'take a short
> reset'. The game already knows what you need next."*
> **ACTION** Pause and watch the HUD quest card flip to *Take a short
> reset*.

**Dev note:** completed, partial, blocked, and rescheduled are all valid
endings; with work banked the system foregrounds exactly one next thing —
map, dock, and Council all follow the same shared rule.
**→ Next:** Step 7 leaves and re-enters to prove nothing was lost.

### Step 7 — Leave and come back

**Where you are:** session saved, quest card showing *Take a short reset*.

> **ACTION** Press `Esc` to the campus map, walk back into the **Library**,
> and open the **study desk** again. The **Welcome back** panel shows the
> work title, what changed last time, the saved next action, and minutes so
> far — each on its own row — then click **Keep going**.
> **SAY** *"Now — the real test. Close it. Walk away. Come back. Welcome
> back. There's your task, your note, your next action, your minutes.
> Nothing lost, nothing to rebuild. It's like your desk kept your seat
> warm."*
> **ACTION** `Esc` to the map and point at the HUD resume card: task,
> checkpoint, time so far, next action, and *"Last time: …"* — with Resume /
> Edit plan / Something else.
> **SAY** *"And even before you walk in, the card already tells you where you
> left off — in your guardian's voice. That's what a calm week feels like:
> you always know exactly where you are."*

**Dev note:** the save holds checkpoint, notes, timer, and next action; the
desk panel and the HUD card read the same recorded items, so both surfaces
agree.
**→ Next:** Step 8 walks to the Garden Pavilion from the campus map.

## Act 4 — Recover both ways (Steps 8–9, ~1.5 min)

*Goal: rest is part of the loop — and it's never a reward you have to earn.*

### Step 8 — Ripples at the pond

**Where you are:** on the campus map after Step 7 (place intact).

> **ACTION** Go to the **Garden Pavilion** (walk in, or via **I need a
> reset** mid-session). Tap the pond a few times — ripples spread, petals
> drift, a fish swims, flowers bloom. Toggle the breathing guide (inhale 4,
> hold 2, exhale 6 — or hide it entirely).
> **SAY** *"Sometimes the smartest thing you can do is absolutely nothing.
> No score. No failure. No timer breathing down your neck. Just ripples,
> petals, and a minute that's completely yours. Even your breath gets a
> gentle circle — and it never makes you hold or chase anything."*
> **ACTION** Choose **Done for now → Lighter → Resume checkpoint**.
> **SAY** *"And when you're ready — one tap, and you're back at your
> checkpoint, exactly as you left it. Rest here never costs you your place."*

**Dev note:** participation — not points, speed, or duration — completes the
activity; the Lighter/Same/Not sure answer is a stored preference, never a
health score. Resuming restores checkpoint, notes, and timer exactly. The
**first recovery of a run pays 20 XP; further pauses pay nothing** — rest is
rewarded once, not farmed.
**→ Next:** Step 9 walks to the Park from the campus map.

### Step 9 — Pocket of Green

**Where you are:** on the campus map after Step 8 (checkpoint resumed).

> **ACTION** Go to the **Park → Pocket of Green**. Pick **open-window
> observation** (three-step wizard: setting → how to confirm → how it went),
> **self-confirm**, **Done**.
> **SAY** *"Take a real break — five minutes with something green. A window.
> A plant. A photo. Your choice, your setting, your word. No proof required.
> Your honesty is worth exactly as much as anyone's photo — that's not a
> policy, it's a promise."*

**Dev note:** the real-world twin of the pond — 5–10 minutes with something
green via four settings (outside, window, indoor plant, image). An optional
photo is checked *on-device* for greenery/daylight only; uncertain results
ask for manual confirmation, a denied camera falls back to self-confirm, and
only the first recovery pays.
**→ Next:** Step 10 starts from Pocket's done state.

## Act 5 — Memory and evidence (Steps 10–11, ~1 min)

*Goal: keep a souvenir and a record — proof that sustainable choices add
up.*

### Step 10 — A private keepsake

**Where you are:** in Pocket of Green's done state after Step 9.

> **ACTION** Click **Turn it into a Keepsake**. Follow the four-step wizard —
> policy → photo → generate → preview: choose **Create keepsake, discard
> original**, tick the four privacy confirmations, **Generate**, approve the
> preview, and place it in the **Recovery Garden**.
> **SAY** *"And if you want a souvenir of that — a private pixel keepsake,
> right here in your town. Your photo becomes art, and none of it is shared,
> tracked, or used to prove anything. Because a memory shouldn't have to
> prove itself."*

**Dev note:** the photo is redrawn into pixels (stripping location data) and
snapped to the town palette by a local filter — or drawn as a symbolic card
with no photo. Nothing is placed without preview approval; the original is
deleted exactly as chosen; the photo earned *nothing extra*. The step numbers
and `?` dots are first-timer aids.
**→ Next:** Step 11 walks to the Post Office from the campus map.

### Step 11 — Journal and closing

**Where you are:** on the campus map after Step 10 (keepsake placed).

> **ACTION** Open the **Journal** (Post Office). The seven-day strip opens
> first — point at it, pick today to filter — then read the timeline aloud:
> the rebalance with before/after values, the partial session with its
> reward, the recovery choice, the keepsake with its deletion state, and the
> next action waiting for next time. Glance up at the HUD: XP, coins, level,
> one garden plant grown, the Library fog eased.
> **SAY** *"And at the end of the day, the whole story is written down for
> you — the rebalance, the progress, the rest, the memory. Not a scoreboard.
> A record. With one garden plant that grew because you chose well."*
> **SAY** *"This is PaceTown. A town that grows when you take care of
> yourself — not when you push past your limit. No streaks, no shame, no
> guilt. Just a calmer way to get through the week. Find your pace. Grow
> your place."*

**Dev note:** the Journal is an automatic private timeline — no mood scores,
no streaks, no missed-day shame; empty days say so plainly. Nothing needs
reconstructing on return.
**→ Next:** end of demo. For another take, open `/reset` and start over at
Step 1.

## If the audience asks…

| Question | Answer to give (and where to click) |
|---|---|
| What if I disagree with the plan? | Dismiss the preview, shrink the proposal (**Make it smaller**), pick a different blocker for another proposal, drag a task yourself — approval is always explicit (Clock Tower Week Board, Library). |
| What if I'm too tired to work? | Say *"watch this"* — Daily Briefing → low energy bends guidance; Council recommends **Recover**; Exit Quest at Home closes the day with the next action kept. |
| Where is my data? | Settings or Home → **Export save (JSON)** / Delete local data. Local-first; photos optional, private, removable. |
| Does it work on a phone? | Same flow at 390px: Town List drawer, thumb D-pad, bottom sheet. Reduced-motion and high-contrast in Home and the top bar. |
| What proves the math? | `npm test` — 378 cases across 40 files pin the 103% Thursday, the bands, parity, and no-auto-complete rules. |

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
the town is never punished. The town also knows the hour: lamps light from
dusk onward (Quiet Mode leaves them dark). How to show it: open Daily Load,
then step back to the map and point at the fog and parcels.

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

### Do the work — one checkpoint at the study desk

**The Library room** (`src/game/Library.tsx`, `src/domain/taskGuidance.ts`).
What it is: a walkable room with three stations — Mira's desk, your study
desk, and an enchanted reference book. **Talk to Mira** opens your open work
for any day (day switcher, three per page); a task you left mid-flight wears
the badge **"You did this before — resume at your desk"**. Her summary card
then asks what is making it difficult, and the `taskGuidance` module proposes
exactly one checkpoint with a definition of done — **Use this step** or
**Make it smaller** (halves the minutes, never below five). Why it exists:
intimidating work starts when it becomes one small, owned step, and returning
work must announce itself instead of silently reopening. How to show it: pick
the ERD assignment, answer "I do not know where to start", halve the
checkpoint once, then Use this step.

**Pace Session** (`src/game/Library.tsx` session flow, `src/domain/guidance.ts`).
What it is: the focused workspace at the study desk for one checkpoint: its
definition of done under **Done when**, a timer that follows the checkpoint's
shape (count-down, count-up, or none — a timer reaching zero never completes
anything), a scratchpad, and **Ask Mira** — one free-text box whose answer is
routed by what you typed (Plan, Explain, Brainstorm, Review, Debug, What
next?) and grounded in your task, checkpoint, and brief. Stop with
**I'm finished…** (this checkpoint, or the whole task) or **Pause or record
progress** (some progress / stuck / stop for now); either way the reflect
step asks "What changed?" and the easiest next action before **Save and stand
up**. Sessions end as completed, partial, blocked, or rescheduled — all
valid. Why it exists: help must arrive *inside* the work, and stopping
honestly must be rewarded, not punished. How to show it: ask why a
many-to-many relationship needs a junction entity (she answers from your
brief), pick Partial progress, write the next action, save.

**Welcome back** (`src/game/Library.tsx` welcome flow, `src/game/ResumeCard.tsx`).
What it is: two halves of one return ritual. At the study desk, a panel —
what changed last time, the saved next action, minutes so far, and **Keep
going**. On the map, the quest card becomes your guardian's voice — task,
checkpoint, time so far, next action, and *"Last time: …"* — with Resume /
Edit plan / Something else. Why it exists: returning must feel like being
handed your own place, not a restart. How to show it: save partial progress,
leave the Library, and come back to the desk.

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
photo → generate → preview — each step numbered, each screen carrying a `?`
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

**Task guidance provider** (`src/domain/taskGuidance.ts`). What it is: the
module behind Mira's proposals — one interface, `propose`, that turns a task,
an intent (a blocker or simply "ready"), and the optional brief into one
checkpoint with a definition of done and a timer preference. The seeded
provider answers offline and deterministically; a remote provider can be
swapped in later and falls back to the local one on any failure. Mention it
if someone asks "where do the checkpoints come from."

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
versioned saves in the browser (currently v6, migrated forward — never wiped)
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
