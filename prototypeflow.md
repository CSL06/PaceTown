# PaceTown — Presentation Video Flow (record the live site)

A scripted guide for a **presentation video with the live website as your
visual**. One presenter, one browser, one continuous take of roughly **5–6
minutes**.

This version is built for **two-phase recording**:

- **Phase 1 — Screen.** Record the browser silently, following the numbered
  **ACTIONS** in each scene. No talking. Just clean, slow clicks.
- **Phase 2 — Voice.** Record the **VOICEOVER** separately, in your own voice.
  It is written to sound like a person, not a spec sheet.
- **Phase 3 — Edit.** Lay the voice track over the screen take. The numbered
  actions are your edit points; each voiceover paragraph lines up with the
  action group above it.

The narration is deliberately warm and plain. Its job is to make a brand-new
viewer want to open the site and press the button themselves.

**Story spine of the whole video** (keep this in your head while you record):

> *Your week is already overbooked before it starts → PaceTown turns it into one
> honest number → moves what can safely move, only with your yes → turns the
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
| Window size | Keep the game stage tall; the pixel town looks best near-fullscreen. Do **not** capture at a tiny window, text gets unreadable |
| Mouse | Big or obvious cursor; move it slowly; hover before you click |
| Audio | **Two-phase:** record the screen silently first, then record the narration as a clean second pass. Editing the two together sounds far better than talking live |
| Pace | Talk slower than feels natural, and pause after each click so viewers can follow |
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

Every scene has two parts:

- **PART A — SCREEN (record silently).** Numbered actions, in order. Record
  these once, with no narration.
- **PART B — VOICEOVER (record separately).** Read it naturally, in your own
  voice. Each paragraph lines up with the matching group of actions and becomes
  your edit points.

---

### Scene 0 — Open on the living town · [0:00 → ~0:20]

> **Narrator goal:** hook in the first ten seconds. No "hi my name is", no menus.
> Straight into the surprising idea: *your week already has a number.*

**PART A — SCREEN (silent)**

1. Start on the landing page at `/`. Let the little town move on its own for a
   few seconds.
2. Slowly move the cursor to the amber button **Start today's mission**. Hover,
   pause, then click.
3. Let the loading settle into the town title card.
4. Stop. Hold on the title card.

**PART B — VOICEOVER**

> "Okay, this feeling you probably know. Your week is already full, and it's
> only Monday. Up here, PaceTown reads it as one number. Thursday is sitting at
> a hundred and three percent. Not a grade. Not a judgement. Just the math of
> everything you already have planned.
>
> And this little town was built to help you do something about it. No sign-up,
> no forms. I'll just press this button, and we're in."

---

### Scene 1 — Meet the town and Kai · [~0:20 → ~0:45]

> **Narrator goal:** introduce the space as a *place* with helpers, not a
> dashboard. Set up the idea that a real week is already waiting.

**PART A — SCREEN (silent)**

1. On the title card, move the cursor along the five guardian portraits slowly.
2. Click **Enter Campus Grove**.
3. Let Kai's first-run dialogue appear. Read it on screen, then click
   **Show me my week**.
4. Let Town Hall open. Stop.

**PART B — VOICEOVER**

> "Meet the five of them. One helps you understand the work, one plans your
> time, one gets you to rest, one keeps you company, and one ties up the loose
> ends. They're not pets, and they're definitely not judges. They're guides.
>
> And there's the number again. Thursday, a hundred and three percent. Kai keeps
> the Clock Tower. And on a first visit, he doesn't dump a dashboard on you. He
> walks you to Town Hall first, so you actually see your week before you see any
> math."

---

### Scene 2 — Town Hall: the week in plain words · [~0:45 → ~1:35]

> **Narrator goal:** prove nothing is hardcoded and nothing happens in secret.
> The schedule is typed in plain language, parsed live, and every guess is shown.

**PART A — SCREEN (silent)**

1. Point at the week textarea; hover and scan a phrase or two.
2. Point at the summary: *9 commitments, confidence 1.00*.
3. Point at the *Assumptions kept visible* list.
4. Click **Review as editable list**. Hover a row.
5. Click **Save these commitments**. Let the Understand panel appear with
   **"Thursday is at 102.9%"**.
6. Slow the cursor along the formula row for the ERD assignment.
7. Press `Esc` back to the map. Stop on the map.

**PART B — VOICEOVER**

> "So here's my whole week. I typed it as one sentence. 'Database lecture nine
> to twelve, ERD assignment due tomorrow, ninety minute commute, film club at
> five.' That's it. PaceTown read it and turned it into real commitments. Nine
> of them. And see this? It had to assume three things, so it's telling me.
> Those assumptions are right here, out in the open. Nothing gets hidden.
>
> And every line is editable. If I want to change a time, or move a day, I just
> do. It's my week.
>
> Now I'll save it. And here's the part I actually care about. Thursday is at a
> hundred and two point nine percent. Why? Fixed things like my lecture count
> once, at their real length. Flexible stuff gets weighted by priority, effort,
> and how soon it's due. My ERD assignment? A hundred and twenty minutes, times
> one point two five, times one point two, times one point one five. Around two
> hundred and seven weighted minutes. This isn't a vibe. It's arithmetic you can
> read."

---

### Scene 3 — Make space, with your permission · [~1:35 → ~2:25]

> **Narrator goal:** show that an overbooked week can get lighter, and that
> nothing ever moves behind your back. This is the product's most distinctive idea.

**PART A — SCREEN (silent)**

1. Walk the character to the **Clock Tower** (`W`/`A`/`S`/`D`, `E` to enter), or
   use **☰ Town List → Clock Tower**.
2. Reach the **Week Board**. Let Kai's proposal appear: three tasks softly
   outlined as previews.
3. Move the cursor across the three outlined tasks, then across the locked items.
4. Hover the destination picker (Saturday), then pause over the before/after
   numbers.
5. Click **Approve 3 moves**. Let the new numbers land.
6. Optional: open the **Backpack** briefly, then `Esc` back to the map. Stop.

**PART B — VOICEOVER**

> "This is the Clock Tower, and this is the idea I really want you to remember.
> Kai has already found three things that can move. The bursary form, groceries,
> the laundry. They're outlined, like a preview. Not moved.
>
> And everything you actually have to keep? Locked. The lecture, the shift, the
> club. Even the assignment, because it's due tomorrow. Kai won't even offer it.
>
> Now watch. Thursday drops from a hundred and three down to about ninety five.
> Saturday picks some up, and still has room. But nothing moved until I pressed
> approve. That's consent, built into the software. You stay in charge of your
> own week."

---

### Scene 4 — One question, one checkpoint · [~2:25 → ~3:05]

> **Narrator goal:** turn the scariest task into something you can actually
> start. This is where viewers recognize their own avoided assignment.

**PART A — SCREEN (silent)**

1. Walk to the **Library** (or Town List → Library). Approach **Mira** and press
   `E` / click **Talk to Mira**.
2. Pick the **ERD assignment** from the open-work list.
3. On the summary card, choose **Something is getting in the way**.
4. Choose the blocker **I do not know where to start**.
5. Let Mira's proposal appear. Point at the checkpoint: *Identify the entities
   and their attributes, 15 minutes, done means a rough attempt exists.*
6. Hover **Make it smaller** without clicking, then click **Use this step**.
7. Follow the prompt to the **study desk**. Stop at the desk.

**PART B — VOICEOVER**

> "Okay. The assignment I've been avoiding all week. Let's make it boring, in
> the best possible way.
>
> This is Mira, and her whole job is getting you started. She doesn't ask for my
> life story, just one question. What's actually in the way? For me, it's 'I
> don't know where to start.' That's allowed.
>
> And look what she comes back with. One step. Identify the entities. Fifteen
> minutes. And 'done' means a rough attempt exists. Not perfect. Not submitted. A
> rough attempt. And if even that feels like too much, there's a button that
> makes it smaller. Because that's how big scary work actually starts. You shrink
> the first step until you can't say no to it."

---

### Scene 5 — The study desk: a guardian beside you · [~3:05 → ~3:45]

> **Narrator goal:** show the focused workspace and the help that arrives
> *inside* the work, not in a separate app.

**PART A — SCREEN (silent)**

1. Press `E` at the desk to open the session. Slowly move the cursor across:
   **Done when**, the two trail fields, the timer, the scratchpad.
2. Click **Ask Mira**. Type the question:
   *"Why does a many-to-many relationship need a junction entity?"* Send it.
3. Let her answer appear. Hold on it for a moment.
4. Hover the **timer** and the **Pause or record progress** button, without
   clicking. Stop.

**PART B — VOICEOVER**

> "Honestly, this one desk is the whole game. Right here is my finish line, in
> plain words. Next to it, two little fields that save themselves as I type.
> What's changed so far, and the easiest next action. Nothing I write here can
> get lost. There's a timer too, if I want one.
>
> And here's the button I love. Ask Mira. Watch. 'Why does a many-to-many
> relationship need a junction entity?' She answers from my task, my checkpoint,
> my brief. Not a canned tutorial. Help that shows up right where you're stuck.
>
> And one more thing. When that timer runs out, it never marks anything done.
> Only I can do that. A tool that trusts you like that is rare."

---

### Scene 6 — Save progress, bank the next action · [~3:45 → ~4:15]

> **Narrator goal:** partial progress is a valid, rewarded ending. The viewer
> learns they never have to finish to win.

**PART A — SCREEN (silent)**

1. Click **Pause or record progress**, then choose **Made some progress**.
2. In the reflect panel, type under **What changed?**:
   *"Listed the core entities."*
3. In the next-action field, type: *"Draft the enrolment junction entity."*
4. Click **Save and stand up**. Let the reward toast appear.
5. Hold on the HUD quest card as it flips to *Take a short reset*. Stop.

**PART B — VOICEOVER**

> "So I haven't finished. And that's the point. I'll pick 'made some progress,'
> and write down what actually changed, plus the one thing to do next. That's
> the whole win condition here. Knowing what to do next.
>
> Save it. And look at the card. It doesn't shove another task at me. It says
> the smartest next move is a short reset. The game is telling me to rest on
> purpose."

---

### Scene 7 — Leave, come back, nothing is lost · [~4:15 → ~4:40]

> **Narrator goal:** continuity. Walk away, return, and everything is exactly
> where you left it, in the guardian's voice.

**PART A — SCREEN (silent)**

1. Press `Esc` to the map, walk back into the **Library**, and return to the
   **study desk**. Let the **Welcome back** panel appear.
2. Slowly move the cursor across: the work title, what changed, the next action,
   the minutes.
3. Click **Keep going** briefly, then `Esc` back to the map.
4. Point at the HUD resume card, showing the same summary with *Last time: …*
   and Resume / Edit plan / Something else. Stop.

**PART B — VOICEOVER**

> "Now the real test. I'll walk away. Close the whole thing. And come back.
>
> There it is. My task, what I changed last time, my next action, even my
> minutes. It's like my desk kept my seat warm. I never have to rebuild
> anything. And even before I open it, the card on the map tells me where I left
> off, in Mira's voice. That's what I mean by a calmer week. You always know
> exactly where you are."

---

### Scene 8 — Rest on purpose: Gentle Ripples · [~4:40 → ~5:05]

> **Narrator goal:** rest is legitimate, never earned, never scored. One
> beautiful in-app pause, then a clean return to the work.

**PART A — SCREEN (silent)**

1. Walk to the **Garden Pavilion**, or use the recovery prompt on the HUD card.
2. Open **Gentle Ripples**. Tap the pond a few times: ripples, petals, a fish.
3. Toggle the breathing guide (inhale 4 / hold 2 / exhale 6) and back.
4. Finish: choose **Done for now → Lighter → Resume checkpoint**.
5. Let the session reappear, notes intact. Stop.

**PART B — VOICEOVER**

> "Sometimes the smartest thing you can do is nothing at all. No score. No
> combo meter. Nothing to fail. Just ripples, petals, and a fish. Even your
> breath gets a little circle, if you want it. And if five options feels better
> than one, the Calm Corner keeps all of them together. No prerequisites. You
> should never have to earn a break.
>
> And when I'm ready, one tap puts me right back at my checkpoint. Notes and all.
> Resting here never costs you your place."

---

### Scene 9 — Rest in the real world: Pocket of Green · [~5:05 → ~5:30]

> **Narrator goal:** recovery can happen away from the screen, and the app
> trusts you. No photo is ever worth more than your word.

**PART A — SCREEN (silent)**

1. Walk to the **Park**. Open **Pocket of Green**.
2. Pick the **open-window** setting, then choose **self-confirm** (your word, no
   photo), then **Done**.
3. Briefly hover the optional photo step, without taking one.
4. Stop on the completed quest.

**PART B — VOICEOVER**

> "Not every reset needs a screen. This is Pocket of Green. Five minutes with
> something actually green. Out the window, a plant, a quick walk. Your call.
>
> And notice, it just takes my word for it. No photo required. No proof. Your
> honesty is worth exactly as much as anyone's photo. That's not a policy. It's
> a promise.
>
> And if you do want a photo, it's checked right here on your device. Nothing
> leaves your browser. You can even turn it into a little pixel keepsake for
> your town."

---

### Scene 10 — The Journal and the closing · [~5:30 → ~6:00]

> **Narrator goal:** end on the record of the day and the promise of the product.
> Land the tagline. Tell people where to try it.

**PART A — SCREEN (silent)**

1. Open the **Journal** (Post Office). Let the seven-day strip show.
2. Move the cursor down today's timeline: the rebalance with before/after
   values, the partial session and its reward, the recovery, the saved next
   action.
3. Glance up at the HUD: XP, coins, level. If there's time, show the sprout in
   the Recovery Garden.
4. Settle on a calm final shot of the town. Hold for 2–3 seconds, then stop.

**PART B — VOICEOVER**

> "And at the end of the day, the whole thing is written down. Not a scoreboard.
> A record. The rebalance, the progress, the rest, the next action waiting for
> me. No streaks, no missed-day guilt. Just what actually happened.
>
> And the garden grew, because I chose well today. I made space. I started
> something real. I rested.
>
> That's PaceTown. A town that grows when you take care of yourself. Not when
> you push past your limit. So if your week ever feels a hundred and three
> percent full, this is the place to make some room. Find your pace. Grow your
> place."

---

## If you want extra b-roll (optional, after the main take)

Cut these in anywhere; each is a 10–15 second clip with its own voice-over.

- **The "live parser" beat.** On the landing page scroll to the **Try it**
  section, type any made-up day ("lab report 90 minutes, gym 45…") and watch it
  parse into commitments live. Say: *"You can try the parser right on the website
  before you even sign up."*
- **Guardian cast beat.** Scroll the landing's guardian section and name all five.
  Say the "no shame" promise out loud.
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

*"Your week is too heavy → one honest number → move what can move, with your yes
→ one small step → work with a guardian → rest without losing your place → it's
all written down. No streaks, no shame, no guilt."*

### The five guardians (only say what's true on screen)

| Guardian | Place | One-liner for the video |
|---|---|---|
| Mira | Library | turns a scary task into one checkpoint you can start |
| Kai | Clock Tower | finds what can safely move, and never moves it without your yes |
| Sol | Garden & Park | makes rest legitimate and keeps scope human |
| Sky | Café | quiet company while you work |
| Goh | Market | closes the loose ends, errands, and final checks |

### Feature coverage checklist (tick these off as you record)

| Scene | Feature shown |
|---|---|
| 0 | Live landing town, seeded mission, one-click play |
| 1 | Guest entry, title hook, guardian cast |
| 2 | Plain-language intake, assumptions, editable list, Daily Load formula |
| 3 | Consent-first rebalance, locked items, week board |
| 4 | Blocker routing to one checkpoint with a definition of done |
| 5 | Pace Session: Done-when, autosaving trail, Ask Mira, timer never completes |
| 6 | Partial progress is a valid, rewarded outcome |
| 7 | Welcome-back continuity and the resume card |
| 8 | Gentle Ripples and Calm Corner (no prerequisites) |
| 9 | Pocket of Green, self-confirm parity, private keepsake seed |
| 10 | Journal, HUD progression, Recovery Garden |

### Troubleshooting (live-recording insurance)

- **Numbers look off (not ≈103)?** The save isn't fresh. Visit `/reset` and start
  the scene again, or use **Settings → Start the example week again**.
- **Missed a click or flubbed the voice?** Two-phase recording makes this easy:
  re-shoot just the screen take for that scene, or re-read just that paragraph.
  Every scene is independently re-shootable.
- **Camera or photo awkward to demo?** Use self-confirm. That *is* the point
  (equal rewards), and say so.
- **Where does data live?** In the browser (`pacetown.game`), exportable as JSON
  from Home/Settings. Photos never leave the device.
- **Question: "is it AI?"** Ask Mira answers from local templates grounded in your
  task and brief, clearly labelled, deterministic, no cloud provider. Say that.
- **Question: "does it work offline?"** Yes, in the production build (`npm run
  build; npm run preview`), thanks to the cached offline shell. The dev server
  always serves fresh code and never registers the worker.
- **Prove the math holds up?** The suite pins every number and promise:
  `npm test`, hundreds of cases across the domain and game tests.

---

*This script pairs with `README.md` (product loop, routes, places) and
`CAMPUS_GROVE.md` (play guide) for anything you want to explain deeper. Record the
screen once, record the voice separately, and let the town do the charming.*
