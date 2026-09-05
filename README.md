# PaceTown

PaceTown is a cozy pixel-art guided-work and recovery game for university students. It helps students understand schedule pressure, turn intimidating work into manageable checkpoints, work alongside supportive guardians, regulate stress through short mini-games, and preserve a clear next action for later.

## Core experience

PaceTown is not a generic wellbeing dashboard or a collection of relaxation games. Its central playable loop is:

```text
Understand total load
→ reduce what can be reduced
→ get help handling what remains
→ recover intentionally
→ save progress and grow the town
```

The planner explains and reduces external workload. Guided Pace Sessions are one response for work that remains; they do not define the entire product. Digital mini-games and real-world recovery quests are equal options before, during, and after work. Optional IRL photos can be privately transformed into PaceTown-styled pixel-art Keepsakes for the Journal, Recovery Garden, and town collection, without giving photo users greater rewards.

## Current status

This repository is a **functional local-first prototype**: the full §24 vertical slice runs
in the browser with no cloud, AI provider, or Google Calendar required.

- Product and implementation plans, asset-completion checklist, and generated art
- Portrait-faithful v3 character bases and v4 animation packages (player + 5 guardians)
- 62-sheet production runtime library, manifests, review boards, and validation report
- Deterministic asset-processing and preview tools
- Landing page (`/`): interactive live town that plays itself until you take the
  controls, a synthesised ambient score, and the seeded week's real numbers
  computed on the page by the domain layer
- Accounts (`/signup`, `/login`): register, email sign-in, a clearly labelled
  local simulation of Google sign-in, and an **Explore Demo Town** guest path
  that needs no account. Browser-only; see "Accounts" below
- Onboarding (`/welcome`): four steps that replace the seeded student's week
  with your own — waking hours, your day parsed live as you type it, preferred
  recovery, and motion/contrast/theme. Skippable, and editable afterwards
- Settings and Shop: capacity, session length, recovery preferences,
  accessibility and data controls; plus cosmetic-only town appearance bought
  with earned coins
- Mentor demo (`/demo`): campus movement, Sky dialogue, guided breathing activity
- Campus Grove (`/town`): seeded Thursday at 103%, explainable Daily Load, the
  Clock Tower's seven-day Week Board (Kai's consent-first move proposal plus
  drag-and-drop — nothing moves until you approve), selective consent-based
  rebalancing, pixel-dialogue Library work plans with a guardian picker (the
  blocker's own guardian routed first), full Pace Sessions (timer, scratchpad,
  help modes, pause-and-regulate, one guardian action button), a guardian-voiced
  resume ritual, all five regulation mini-games, Pocket of Green IRL quest with
  local photo verification, private keepsake pipeline with local pixel filter and
  symbolic fallback, quests, XP/coins, Recovery Garden, Journal, Future Mailbox,
  Backpack, Guardian Council, Quiet Mode, Exit Quest, versioned saves, export,
  and an offline PWA shell
- 296 automated tests across 32 files in the domain, account, theme and UI
  layers (`npm test`)
- Lint, typecheck, test and build enforced in CI on every push and PR

## Run PaceTown

### Requirements

- [Node.js](https://nodejs.org/) 24 or newer (CI uses Node 24)
- npm 10 or newer, included with Node.js

### Setup

```powershell
git clone https://github.com/CSL06/PaceTown.git
cd PaceTown
npm install
npm run dev
```

Open `http://localhost:5173/` in a browser. Vite will print a different address in the terminal if port `5173` is already occupied.

### Developer shortcuts

`http://localhost:5173/reset` wipes the save and session in one go — the quick
clean-run reset between demo passes (see `prototypeflow.md`).

### Demo walkthrough

1. Move the player with the arrow keys or `W`, `A`, `S`, and `D`. On a phone, use the on-screen direction buttons.
2. Walk near Sky and press `E` or `Enter`, or open **Town List** and choose **Sky's Tea Corner**.
3. Continue Sky's conversation and select **Try one calming breath**.
4. Complete the guided inhale, hold, and exhale cycle, then return to campus.
5. Use **Motion on/off** to demonstrate the reduced-motion experience.

### Production build

```powershell
npm run build
npm run preview
```

The compiled demo is written to `dist/`, which is intentionally excluded from Git.

### Tests

```powershell
npm test
npm run test:watch
```

296 cases across 32 files. They cover the arithmetic, and they pin the product
promises so those cannot quietly rot: self/photo confirmation parity, no
timer/mini-game/AI academic completion, rebalance previews never mutating tasks,
bounded energy guidance, and the seeded 103% Thursday.

### Campus Grove walkthrough (`/town`)

1. Press **Enter Campus Grove**. The title hook reads Thursday at **103%** — calculated
   live from the seeded week, never typed in — and Kai's first-run intro offers
   **Show me my week**, leading to Town Hall's plain-language list before any numbers.
2. Enter the sunlit **Clock Tower**. Its seven-day **Week Board** opens on Kai's
   proposal: three flexible Thursday tasks are softly outlined, with their preview
   blocks already on Saturday; fixed commitments sit locked and the ERD assignment
   due tomorrow is never offered. Compare the before/after loads and approve —
   Thursday falls from **103% to 95%** (Heavy), Saturday goes from **10% to 18%**
   and stays Open — or uncheck moves and reject. Nothing moves until you approve
   it. The same board is a drag-and-drop calendar: flexible tasks drag, fixed ones
   never do, deadline guards refuse late moves, and **Undo last move** is one click.
3. At the **Library**, pick *I do not know where to begin*. A message box opens like
   a dialogue with Mira — her opener and the editable work plan; **← Back** returns
   to the blocker list so the choice is never a trap, and **Work with** switches
   guardians with the blocker's own guardian routed as the default. Start a
   20-minute checkpoint Pace Session with Mira.
4. Ask Mira to *Explain*, record **Partial progress**, and save
   *Add the enrolment junction entity* as the next action.
5. Pause into **Gentle Ripples**, then take Sol's **Pocket of Green** (self-confirm or
   optional photo — equal rewards).
6. Turn the quest into a private **Keepsake** (create-and-discard keeps only the pixel art),
   then open the **Journal**: rebalance, work, recovery, keepsake, deletion state, and next
   action are all recorded. One Recovery Garden plant has grown.

Reload at any point: you return to the title screen with progress intact (versioned
`localStorage` saves under `pacetown.game`). **Export save (JSON)** and
**Delete local data** live at Home; `http://localhost:5173/reset` wipes the save
and session in one go.

## Accounts

Campus Grove sits behind an account so the app can greet a returning student and
so a future server has a person to attach a save to. **The implementation is
browser-only and is not production authentication.**

- Accounts live in `localStorage` under `pacetown.accounts`; the session lives
  under `pacetown.session`. Clearing site data removes both.
- Passwords are salted and stretched with PBKDF2-SHA256 (120k iterations) via
  `crypto.subtle` before storage, and a plain hash on insecure origins. No
  plaintext password is ever written. This is hygiene, not a security boundary —
  anyone with the browser can read the store.
- "Continue with Google" is a clearly labelled local simulation. It asks for the
  profile a provider would return and **never asks for a Google password**.
- Wrong-password and unknown-account failures return one identical message, so
  the form cannot be used to discover who has an account.

`src/auth/session.ts` is the single seam. Every function is async and returns a
`Result` rather than throwing, so pointing it at Supabase, Firebase or a bespoke
API is a change of implementation with no change to any call site. The React
layer never reads `localStorage` directly — it reads `useAuth()`.

Behaviour is covered by `src/auth/session.test.ts`.

### Demo scope

The mentor demo (`/demo`) is intentionally narrow: visual direction, campus exploration, an
accessible list alternative, a supportive Sky interaction, and one stress-reduction
activity. The full product loop lives in Campus Grove (`/town`), which is local-first and
works offline after the first visit (runtime-cached PWA shell). Google Calendar, generative
NPC conversations, and cloud sync remain planned production adapters — every AI-assisted
feature already has a deterministic local fallback, and the app never requires one.

## Start here

- `PACETOWN_PROJECT_VISION.md`
- `PACETOWN_VISION_MERMAID.md`
- `PaceTown_Hackathon_Implementation_Plan.md`
- `assets/PACETOWN_ASSET_COMPLETION_CHECKLIST.md`
- `assets/app-runtime-v1/README.md`
- `assets/production/character-redesign-v3/README.md`
- `assets/production/runtime-assets-v1/README.md`
- `assets/production/runtime-assets-v1/pacetown-runtime-assets-v1-manifest.json`
- `assets/third-party/ASSET_MANIFEST.md`

## Third-party assets

Downloaded asset packs and archives are intentionally excluded from Git. Follow `assets/third-party/ASSET_MANIFEST.md` to retrieve them from their original sources and review the applicable licenses before distribution.

## Asset tooling

PowerShell tools generate the legacy animation-grid references and visual compatibility boards. The v3 exact-grid character previews use the bundled workspace Python runtime and Pillow:

```powershell
& "C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" .\tools\build_character_redesign_previews.py
& "C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" .\tools\build_player_animation_v4.py --character player
& "C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" .\tools\build_pacetown_runtime_assets_v1.py
& "C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" .\tools\validate_pacetown_assets_v1.py
```
