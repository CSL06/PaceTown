# PaceTown — Presentation Video Flow (record the live site)

A scripted, repeatable guide for recording a **presentation video with the live
website as your visual**. One presenter, one browser, one continuous take of
roughly **4–5 minutes**. Every scene is written the same way: what you **do** on
screen, what you **say** while doing it, and the little beat that hands the
viewer smoothly into the next scene.

The narration is deliberately warm and plain — it should sound like a friend
showing you something, not a spec sheet. Its job is to make a brand-new viewer
want to open the site and press the button themselves.

**Story spine of the whole video** (keep this in your head while you record):

> *Your week is already overbooked before it starts → PaceTown turns it into one
> honest number → moves what can safely move (only with your yes) → turns the
> scariest task into one small step → lets you work with a guardian beside you →
> lets you rest without losing your place → writes it all down so tomorrow is
> easier. No streaks. No shame. Just a calmer way through the week.*

The features you must land on (each is covered by a scene below):

1. **Live landing page** — the town is already alive before you touch anything.
2. **One-click entry** — a real week, no sign-up, no form, no wizard.
3. **Town Hall plain-language intake** — the parser and its visible assumptions.
4. **Daily Load** — every number is arithmetic you can read.
5. **Kai's consent-first rebalancing** — locked things stay locked; nothing moves
   until you approve it.
6. **Mira's one-checkpoint plan** — a scary assignment becomes one small step.
7. **The Pace Session** — Done-when, notes that save as you type, Ask Mira,
   partial progress as a real win.
8. **Welcome back continuity** — leaving and returning loses nothing.
9. **Recovery both ways** — Gentle Ripples (in-app) and Pocket of Green
   (real world), no proof, no shame.
10. **Journal & growth** — the whole day is written down; sustainable choices grow
    the town.

---

## Before you press record

### Run the app

```powershell
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173/`). If you are hosting a
deployed build instead, use that URL everywhere this script says `localhost`.

### Start from a clean, seeded week

The whole demo relies on the **seeded example week** being fresh. Two ways:

- **Easiest:** record in a **fresh private/incognito window** (or a brand-new
  browser profile). A brand-new visitor gets the seeded week automatically, which
  is exactly the experience the video sells.
- **Between takes:** once you have a browser open, visit
  `http://localhost:5173/reset` — it wipes the save and session and drops you back
  on the presenter front door with the seeded week. (Or, from inside the town:
  **Settings → Start the example week again** reseeds in place without leaving.)

> **Rule of thumb:** if a number on screen is not roughly what this script
> expects, do a reset and start the scene again. Nothing here is typed in; every
> figure is **computed live from the seeded week**, so they are stable *on a fresh
> save*.

### Recording setup that makes life easy

| Setting | Suggestion |
|---|---|
| Screen capture | 1080p (1920×1080), the browser window only, no taskbar clutter |
| Window size | Keep the game stage tall; the pixel town looks best near-fullscreen. Do **not** capture at a tiny window — text gets unreadable |
| Mouse | Big or obvious cursor; move it slowly; hover before you click |
| Audio | One clear mic; record narration in a second pass if your voice shakes live |
| Pace | This is the #1 tip: **talk slower than feels natural**, pause after each click so viewers can follow |
| Read the numbers | Say the percentage you *actually see* (this script uses ≈ for that reason). Do a practice run first, then re-record clean |
| Captions | Adding burned-in captions later helps a lot; keep scenes short so captions are easy |
| URL | If viewers should find you later, say the URL once in the opening and once at the end |

### Numbers cheat sheet (what you can expect on a fresh week)

| Where | What appears | Note |
|---|---|---|
| Landing hero | `Thursday mission · 103% capacity`, "Kai found 3 flexible commitments" | computed from the same seeded week as the game |
| Town title card | `Thursday is at 103%` | after you click Start today's mission |
| Town Hall parse | 9 commitments · confidence 1.00 · 3 visible assumptions | reads the same sentence every run |
| Understand panel | `Thursday is at 102.9%` with the full formula | read one row aloud: the ERD is `120 × 1.25 × 1.20 × 1.15 ≈ 207` |
| Kai's proposal | 3 tasks can move to Saturday; fixed items locked | destination day is optional |
| After approve | Thursday ≈ **95%**, Saturday rises and stays Open | the drop is the whole point |
| Session / HUD | one checkpoint, timer, notes, then the card flips to *Take a short reset* | |
| Recovery | first recovery of the run pays 20 XP; later pauses pay nothing | |

---

## The take, scene by scene

Format reminder: **ACTION** is what you do on screen, **SAY** is your narration
(read it in your own voice, not word-for-word stiff), **BEAT** is the quiet
moment/handoff into the next scene. Say and do in order; when in doubt, do the
action first and *then* talk about it.

---

### Scene 0 — Open on the living town · [0:00 → ~0:20]

> **Narrator goal:** hook in the first ten seconds. No "hi my name is", no menus —
> straight into the surprising idea: *your week already has a number.*

**On screen:** the landing page at `/`. The little town is already moving on its
own — the camera drifting, lamps and life flickering.

- **ACTION** Let the landing page play for a few seconds untouched.
- **SAY**
  *"Thursday is already 103% full… and it's not even Thursday yet. Sound familiar?
  That number up there is your whole week, turned into one honest reading — and
  the tiny town in front of you was built to do something about it."*
- **ACTION** Slowly move the cursor to the amber button **Start today's mission**
  (hover, pause), then click.
- **SAY**
  *"This is PaceTown — a cozy pixel campus that helps you see what's really on your
  plate, make room where you safely can, and get through the scary stuff one small
  step at a time. And watch this — no account, no form, no onboarding maze. One
  click and we're in."*
- **BEAT** Let the town scene load and land before you talk again. This is the
  "wow, it just played" moment — give it a half-second of silence.

---

### Scene 1 — Meet the town and Kai · [~0:20 → ~0:45]

> **Narrator goal:** introduce the space as a *place* with helpers, not a
> dashboard. Set up the idea that a real week is waiting for you.

**On screen:** the in-game title card — PaceTown, the tagline, "Thursday is at
103%", and the five guardians standing in a row.

- **ACTION** Let the title card show. Point at the five guardian portraits.
- **SAY**
  *"Every one of these five is here to help with a different kind of problem — one
  understands your work, one plans your time, one helps you rest, one keeps you
  company, one closes loose ends. They're not pets and they're not judges — they're
  guides. Your week is already in here, waiting."*
- **ACTION** Click **Enter Campus Grove**.
- **SAY** *"And there's Kai — he keeps the Clock Tower, and he watches the numbers
  so you don't have to. On a first visit he doesn't hand you a dashboard — he walks
  you to Town Hall first, so you can see the week itself before you see any math."*
- **ACTION** Read Kai's lines as they appear; when the choice comes up, click
  **Show me my week**.
- **BEAT** The Town Hall intake opens. Do not talk over the transition — let the
  viewer land in the room with you.

---

### Scene 2 — Town Hall: the week in plain words · [~0:45 → ~1:35]

> **Narrator goal:** prove nothing is hardcoded and nothing happens in secret. The
> schedule is typed in plain language, parsed live, and every guess is shown.

**On screen:** Town Hall intake — the week textarea already filled, the parse
summary ("9 commitments · confidence 1.00"), the three visible assumptions.

- **ACTION** Point at the text box; hover and read a phrase or two aloud as you
  scan (Database lecture 9 to 12, ERD assignment due tomorrow 120 minutes…).
- **SAY**
  *"Here's the thing — I never filled in a spreadsheet. This whole week is one
  sentence I typed. 'Database lecture from nine to twelve, ERD assignment due
  tomorrow, ninety-minute commute, film club at five…' A parser reads it and turns
  it into real commitments."*
- **ACTION** Point at the bottom: *9 commitments, confidence 1.00*, then the
  *Assumptions kept visible* list.
- **SAY**
  *"Nine commitments, full confidence. And look down here — three assumptions it
  had to make, sitting right out in the open. Nothing in PaceTown happens quietly.
  If the machine guesses, you see the guess."*
- **ACTION** Click **Review as editable list**. Hover over a row.
- **SAY**
  *"And every single thing is now a row I own. I can change the time, the day,
  the type, even remove things — you're the editor of your own week, PaceTown just
  does the bookkeeping. I'll leave the numbers alone, because I want you to see
  exactly where they come from."*
- **ACTION** Click **Save these commitments**. The Understand panel opens:
  **"Thursday is at 102.9%"** with the formula and the contributor table.
- **SAY**
  *"Saved. And now the honest part — here is exactly why Thursday is at 102.9%.
  Fixed things like your lecture count once, at their real length. Flexible tasks
  add a weighted demand — priority, effort, urgency. See the ERD assignment? 120
  minutes, times 1.25 for priority, 1.2 for effort, 1.15 because it's due
  tomorrow — that's roughly 207 weighted minutes. It's not a vibe and it's not a
  judgement. It's arithmetic. Every number in this town is arithmetic you can read."*
- **ACTION** Press `Esc` to step back onto the campus map.
- **BEAT** Pause on the map. If Load Weather is visible, let it sit for a second —
  it is your cue for the next line.

---

### Scene 3 — Make space, with your permission · [~1:35 → ~2:25]

> **Narrator goal:** show that an overbooked week can get lighter — and that
> nothing ever moves behind your back. This is the product's most distinctive idea.

**On screen:** the campus map. Buildings glow; the HUD quest card points you to the
Clock Tower.

- **ACTION** Walk your character toward the **Clock Tower** (`W`/`A`/`S`/`D`, `E`
  to enter — or use **☰ Town List → Clock Tower** and say "or the Town List, same
  destination, nothing is pointer-only").
- **SAY**
  *"That's the Clock Tower — Kai's place. And it's where an impossible week starts
  to breathe. The board is already waiting with a suggestion for us."*
- **ACTION** Enter and reach the **Week Board**. Let Kai's proposal appear — three
  tasks softly outlined as previews. Point at them: the bursary form, weekly
  groceries, laundry — with their ghosted copies already sitting on Saturday.
- **SAY**
  *"Look at what Kai found. Three things on Thursday that can safely move — the
  bursary form, groceries, the laundry. They're outlined as previews, not moved.
  And the things you actually have to keep — your lecture, your café shift, the
  film club — are locked, visibly, with a badge. Even the assignment? It's due
  tomorrow, so Kai won't even offer it. Nothing gets guessed, nothing gets forced."*
- **ACTION** Hover the destination picker (Saturday), pause over the
  before/after numbers, then click **Approve 3 moves**.
- **SAY**
  *"Here's the moment of trust: Thursday goes from 103 percent down to about 95 —
  we gave it back a real slice of its day. Saturday picks up a little and still
  has room. And nothing — nothing — moved until I pressed approve. That's consent,
  built into the software. You stay the boss of your own week."*
- **ACTION** Optional quick glance: open the **Backpack** (it got lighter) then
  `Esc` back to the map.
- **BEAT** Let the map show again. The HUD now points toward the Library — your
  cue. Walk toward it as you speak your next line.

---

### Scene 4 — One question, one checkpoint · [~2:25 → ~3:05]

> **Narrator goal:** turn the scariest task into something you can actually start.
> This is where viewers recognize their own avoided assignment.

**On screen:** the campus walk to the Library, then the Library's inner room and
Mira.

- **ACTION** Walk to the **Library** (or Town List → Library), approach **Mira**,
  and press `E` / click **Talk to Mira**. Her open-work list opens on Thursday.
- **SAY**
  *"This is Mira — she keeps the Library, and she's brilliant at the thing most
  planners ignore: actually starting. Here's my open work for Thursday. And there
  it is — the assignment I've been avoiding all week. The ERD coursework. Let's
  make it boring, in the best possible way."*
- **ACTION** Pick the **ERD assignment**. On the summary card choose
  **Something is getting in the way**, then choose the blocker **I do not know
  where to start** (reveal more choices if needed).
- **SAY**
  *"One question. Not 'tell me your whole life' — just: what's actually in the way?
  'I don't know where to start.' That's allowed. That's honest. And watch what she
  does with it."*
- **ACTION** Let Mira's proposal appear. Point at the checkpoint: *Identify the
  entities and their attributes — 15 minutes, done means a rough attempt exists.*
  Hover **Make it smaller** without clicking (mention it), then click
  **Use this step**.
- **SAY**
  *"One checkpoint. Not the whole assignment — one step: identify the entities.
  Fifteen minutes, and 'done' means a rough attempt exists. Not perfect. Not
  submitted. A rough attempt. And if that still feels big, there's always 'make it
  smaller' — it halves the minutes. Big scary work starts the same way every time:
  you shrink the first step until you can't say no to it."*
- **ACTION** Follow the prompt to your **study desk** ("Your place is ready").
- **BEAT** Stop at the desk before clicking anything — the workspace reveal is
  next.

---

### Scene 5 — The study desk: work with a guardian beside you · [~3:05 → ~3:45]

> **Narrator goal:** show the focused workspace and the help that arrives *inside*
> the work — not in a separate app.

**On screen:** the study desk — the checkpoint with **Done when**, two trail
fields, a timer, a scratchpad, and **Ask Mira**.

- **ACTION** Press `E` at the desk / open the session. Tour the workspace slowly.
- **SAY**
  *"This is the whole game in one desk. Right here is my finish line — 'Done when: a
  rough attempt exists.' Next to it, two fields that write themselves as I go:
  what's changed so far, and the easiest next action. They save on every keystroke —
  nothing I type here can get lost. There's a timer if I want one, a scratchpad for
  thinking out loud… and that button, Ask Mira, for the exact moment I get stuck."*
- **ACTION** Click **Ask Mira**, type a real stuck question:
  *"Why does a many-to-many relationship need a junction entity?"* — then send it.
  Read one or two lines of her answer aloud.
- **SAY**
  *"Stuck? I can just ask, in my own words. 'Why does a many-to-many relationship
  need a junction entity?' And she answers from my task, my checkpoint, my brief —
  not a canned tutorial. It's help that arrives inside the work, exactly where
  you're stuck."*
- **ACTION** Hover the **timer** and the **Pause or record progress** button but
  do not click yet.
- **SAY**
  *"And here's my favorite part of the whole design: when the timer runs out, it
  never marks anything done. Only I decide when something's done. A tool that
  respects you like that — you don't find it every day."*
- **BEAT** Small pause. Then move to stop the session — the next beat proves that
  stopping honestly is a win, not a failure.

---

### Scene 6 — Save progress, bank the next action · [~3:45 → ~4:15]

> **Narrator goal:** partial progress is a valid, rewarded ending. The viewer
> learns they never have to finish to win.

**On screen:** inside the session at the study desk.

- **ACTION** Click **Pause or record progress**, then choose **Made some progress**.
- **SAY** *"I haven't finished — and that's fine. Watch."*
- **ACTION** In the reflect panel, type under **What changed?**:
  *"Listed the core entities."* For the easiest next action, keep/draft
  *"Draft the enrolment junction entity."*
- **SAY**
  *"This is what I actually got done, and — more importantly — the exact next
  action, so future-me never has to figure out where to restart. Knowing what to do
  next is the whole success condition."*
- **ACTION** Click **Save and stand up**. Let the reward toast appear, then pause
  and watch the HUD quest card flip to *Take a short reset*.
- **SAY**
  *"A reward for showing up and naming the next step — and look at the card: it
  already knows the smartest thing to do next is a short reset. Not another task.
  A reset. The game is telling me to rest on purpose."*
- **BEAT** Let the card flip register on camera. This is a lovely "the system is
  looking out for me" moment.

---

### Scene 7 — Leave, come back, nothing is lost · [~4:15 → ~4:40]

> **Narrator goal:** continuity. Walk away, return, and everything is exactly where
> you left it — in the guardian's voice.

**On screen:** the campus, then the Library again.

- **ACTION** Press `Esc` to the map, walk back into the **Library**, and return to
  the **study desk**. The **Welcome back** panel appears.
- **SAY**
  *"Now the real test — close it, walk away, come back. There it is: my task, what
  I changed last time, my saved next action, even my minutes. It's like my desk kept
  my seat warm. I never have to rebuild anything."*
- **ACTION** Click **Keep going** briefly, then `Esc` back to the map. Point at the
  HUD resume card showing the same summary with *Last time: …* and Resume / Edit
  plan / Something else.
- **SAY**
  *"And even before I walk in, the card on the map already tells me where I left
  off — in Mira's voice. That's what a calm week feels like: you always know exactly
  where you are."*
- **BEAT** A beat of quiet. The HUD card offers recovery — that is your cue to
  walk toward the garden.

---

### Scene 8 — Rest on purpose: Gentle Ripples · [~4:40 → ~5:05]

> **Narrator goal:** rest is legitimate, never earned, never scored. One beautiful
> in-app pause, then a clean return to the work.

**On screen:** the walk to the Garden Pavilion, then the pond.

- **ACTION** Walk to the **Garden Pavilion** (or use the recovery prompt on the HUD
  card). Open **Gentle Ripples**. Tap the pond a few times — ripples, petals, a
  fish. Toggle the breathing guide (inhale 4 / hold 2 / exhale 6) and back.
- **SAY**
  *"Sometimes the smartest thing you can do is absolutely nothing. No score, no
  combo meter, no failing — just ripples, petals, and a minute that's yours. Even
  your breath gets a gentle circle if you want it. And if you'd rather skip straight
  to resting, the Calm Corner keeps all five of these activities in one place — no
  prerequisites, because you should never have to earn a break."*
- **ACTION** Finish: choose **Done for now → Lighter → Resume checkpoint**.
- **SAY**
  *"And when you're ready — one tap, and I'm back at my checkpoint exactly as I left
  it, notes and all. Rest here never costs you your place."*
- **BEAT** Pause. Now step outside — the next scene happens in the real world, and
  that contrast is the point.

---

### Scene 9 — Rest in the real world: Pocket of Green · [~5:05 → ~5:30]

> **Narrator goal:** recovery can happen away from the screen, and the app trusts
> you. No photo is ever worth more than your word.

**On screen:** the Park, then Pocket of Green's wizard.

- **ACTION** Walk to the **Park**. Pick an open-window setting,
  then choose **self-confirm** (your word, no photo), then **Done**.
- **SAY**
  *"Not every reset needs a screen. This is Pocket of Green — five minutes with
  something actually green. Out the window, a plant, a quick walk — your choice.
  And notice: it asks me to confirm on my word. No photo required, no proof, no
  points for filming a leaf. Your honesty is worth exactly as much as anyone's
  photo — that's not a policy, it's a promise."*
- **ACTION** Briefly hover the optional photo step (but don't take one) so the
  viewer sees it exists.
- **SAY**
  *"If you do want a photo, it's checked on your own device for 'is it green, is it
  daylight' — nothing leaves your browser. And if you'd like a souvenir, there's
  even a private pixel keepsake you can grow into your town."*
- **BEAT** This scene ends gently — you can let the completed quest sit for a
  second before the closing.

---

### Scene 10 — The Journal and the closing · [~5:30 → ~6:00]

> **Narrator goal:** end on the record of the day and the promise of the product.
> Land the tagline. Tell people where to try it.

**On screen:** the Post Office / **Journal**.

- **ACTION** Open the **Journal** (Post Office). Let the seven-day strip show, then
  read today's entries down the timeline: the rebalance with its before/after
  values, the partial session and its reward, the recovery, the saved next action.
- **SAY**
  *"And at the end of the day, the whole story is written down for me — not a
  scoreboard, a record. The rebalance, the progress, the rest, the next action
  waiting for next time. No streaks, no missed-day guilt, no 'you should have done
  more.' Just what happened, honestly."*
- **ACTION** Glance up at the HUD: XP, coins, level — and if there's time, the
  sprout in the Recovery Garden.
- **SAY**
  *"See that? The garden grew because I chose well today — because I made space,
  started something real, and rested on purpose. That's the whole idea of
  PaceTown: a town that grows when you take care of yourself — not when you push
  past your limit."*
- **ACTION** Pause, look into the camera (or hold on the town), and deliver the
  closing line slowly.
- **SAY**
  *"If your week ever feels 103 percent full… this is the place to make some room.
  No account, no card, no catch — your data stays in your browser, and it even
  works offline. Find your pace. Grow your place. Try PaceTown today."*
- **BEAT** Hold the final shot for 2–3 seconds before you stop recording.

---

## If you want extra b-roll (optional, after the main take)

Cut these in anywhere; each is a 10–15 second clip with its own voice-over.

- **The "live parser" beat.** On the landing page scroll to the **Try it**
  section, type any made-up day ("lab report 90 minutes, gym 45…") and watch it
  parse into commitments live. Say: *"You can try the parser right on the website
  before you even sign up."*
- **Guardian cast beat.** Scroll the landing's guardian section and name all five.
  Says the "no shame" promise out loud.
- **Offline dare.** Run `npm run build; npm run preview`, then disconnect Wi-Fi
  mid-town and reload — the app keeps working. Say: *"Installed like an app, runs
  with the Wi-Fi off — your week stays yours."*
- **On a phone.** Re-record the opening scenes at a narrow width (or a real phone):
  the Town List drawer, the thumb D-pad, the bottom sheet. Say: *"Same town, same
  week — on your phone."*
- **Accessibility beat.** From Home/Settings open **Quiet Mode** and
  **High contrast**. Say: *"Less motion, stronger contrast — the whole town works
  for the way you need to see it."*
- **Try-it-now beat.** End on a straight screenshot of the landing URL with the
  button — freeze on **Start today's mission**.

---

## Quick reference while you record

### The pitch, in one breath

*"Your week is too heavy → one honest number → move what can move (with your yes) →
one small step → work with a guardian → rest without losing your place → it's all
written down. No streaks, no shame, no guilt."*

### The five guardians (only say what's true on screen)

| Guardian | Place | One-liner for the video |
|---|---|---|
| Mira | Library | turns a scary task into one checkpoint you can start |
| Kai | Clock Tower | finds what can safely move — and never moves it without your yes |
| Sol | Garden & Park | makes rest legitimate and keeps scope human |
| Sky | Café | quiet company while you work |
| Goh | Market | closes the loose ends, errands, and final checks |

### Feature coverage checklist (tick these off as you record)

| Scene | Feature shown | Referenced in |
|---|---|---|
| 0 | Live landing town, seeded mission, one-click play | `README.md` Routes & "the first button plays"; `src/landing/Landing.tsx` |
| 1 | Guest entry, title hook, guardian cast | `README.md` (Routes); `src/game/Game.tsx` title |
| 2 | Plain-language intake, assumptions, editable list, Daily Load formula | `README.md` "How Load Is Calculated"; `src/domain/parse.ts`, `workload.ts` |
| 3 | Consent-first rebalance, locked items, week board | `README.md` (Clock Tower); `src/domain/rebalance.ts` |
| 4 | Blocker routing → one checkpoint + done-when | `README.md` "Blocker Routing"; `src/domain/taskGuidance.ts` |
| 5 | Pace Session: Done-when, autosave trail, Ask Mira, timer never completes | `README.md` "How a Pace Session Works"; `src/domain/guidance.ts` |
| 6 | Partial progress is a valid, rewarded outcome | `README.md` principles "Rest is legitimate work" |
| 7 | Welcome-back continuity and resume card | `README.md` demo flow step 8 |
| 8 | Gentle Ripples + Calm Corner (no prerequisites) | `README.md` places; `src/domain/regulation.ts` |
| 9 | Pocket of Green, self-confirm parity, private keepsake seed | `README.md` data/privacy; `src/domain/photo.ts` |
| 10 | Journal, HUD progression, Recovery Garden | `README.md` places (Post Office, Recovery Garden) |

### Troubleshooting (live-recording insurance)

- **Numbers look off (not ≈103)?** The save isn't fresh. Visit `/reset` and start
  the scene again, or use **Settings → Start the example week again**.
- **Missed a click / misspoke?** Don't restart the whole video — scenes are short;
  re-record just that scene and cut it in. The reset note above makes every scene
  independently re-shootable.
- **Camera/photo awkward on stage?** Use self-confirm — that *is* the point (equal
  rewards), and say so.
- **Where does data live?** In the browser (`pacetown.game`), exportable as JSON
  from Home/Settings. Photos never leave the device.
- **Question: "is it AI?"** Ask Mira answers from local templates grounded in your
  task and brief — clearly labelled, deterministic, no cloud provider. Say that.
- **Question: "does it work offline?"** Yes, in the production build (`npm run
  build; npm run preview`), thanks to the cached offline shell. The dev server
  always serves fresh code and never registers the worker.
- **Prove the math holds up?** The suite pins every number and promise:
  `npm test` — hundreds of cases across the domain and game tests.

---

*This script pairs with `README.md` (product loop, routes, places) and
`CAMPUS_GROVE.md` (play guide) for anything you want to explain deeper. Keep the
recording natural, keep the pauses, and let the town do the charming.*
