# **PaceTown** by TEAM 1000011

**Team:** TAN HONG SHENG, HEW ZHI HENG, GOH SHENG KAI, CHUAH SHANG LOONG

**Problem Statement:** Stress & Workload Manager

**Video Presentation:** [Unlisted Youtube Link]

**Presentation Slides:** [Public Link]

## **1. Project Overview**

**The Problem.** University stress is rarely caused by a single assignment. It accumulates from classes, deadlines and revision; part time work, commuting, clubs and errands; unclear instructions and work that feels too large to start; difficulty estimating how long things take; context switching and competing priorities; low energy and insufficient recovery; and losing track of where to resume after an interrupted session. The stakeholders are general university students balancing coursework, part time work, social commitments, errands, and their physical and mental wellbeing at the same time.

Similar apps exist, and each falls short in a specific way: traditional planners (such as Notion or Google Calendar) show the work but do not help a student begin it; focus timers (such as Forest or Pomodoro apps) measure time but do not clarify what to do; relaxation games provide a break but leave the underlying responsibility untouched; and general AI assistants can produce content but ignore capacity, scheduling pressure, continuity, and the student's need to remain in control. PaceTown connects these missing pieces and is deliberately never pitched as an upload and complete tool.

**Our Solution.** PaceTown is a cozy, browser only pixel art game where a student's real week becomes a readable campus town. It calculates an explainable Daily Load, proposes safe calendar moves that need explicit approval, turns one scary task into one checkpoint with a guardian beside you, rewards honest stopping and intentional rest, and writes everything down so returning never means reconstructing. No cloud, no AI provider, and no streaks required.

Feature set:

* Plain language week intake with visible parser assumptions and editable commitments
* Explainable Daily Load: weighted demand, load bands, and Load Weather on the map
* Walkable Clock Tower with a week long Week Board: consent previews, destination comparison, drag and drop, deadline guards, and undo
* Walkable Library: Mira's open work list, blocker routing, single checkpoint proposals, and definitions of done
* Guided Pace Sessions: timers, scratchpad, saved progress notes, contextual help, and completed, partial, blocked, or rescheduled outcomes
* Welcome back desk summary, open work resume badge, and guardian spoken HUD resume ritual
* Guardian picker with routed defaults, one real action button per guardian, and a Guardian Council that proposes without ever applying changes
* Fullscreen recovery scenes (Gentle Ripples, Chime Drift, Warm Cup, Firefly Stories, Night Lanterns) plus the Pocket of Green real world quest with local photo checks
* Private Keepsakes with local pixel filter or symbolic fallback, Collection, Recovery Garden, Future Mailbox, and a week long Journal
* Backpack, Daily Briefing, Town List, Settings, Shop, Quiet Mode, High Contrast, versioned saves, JSON export, and a reset demo shortcut

### Who it serves

General university students, especially those balancing classes with part time work, commuting, clubs, and errands, and students with different energy levels, access needs, and recovery preferences. The system never assumes the same capacity, schedule, social needs, or mobility for everyone: every recovery path has an indoor alternative, every place has a Town List equivalent, and every check in can be skipped.

### Before and after this product

Before: Thursday reads 103% and the student sees only a wall of tasks, so the assignment waits another day. After: the same Thursday reads 95% with consent, one checkpoint has a finish line, a guardian sits through the session, the note and next action are saved, and returning feels like being handed back your own desk.

## **2. Ideation & Process**

### **2.1 Ideas We Considered**

Major alternatives weighed during the project, in decision order. Chosen ideas are listed first.

| Idea | Why it was dropped / kept |
| :---- | :---- |
| A (Chosen) — One campus (Campus Grove), one player, one complete understand, make space, work, recover, return loop | Kept: the smallest slice that still demonstrates the full product promise end to end |
| B (Chosen) — Deterministic browser only rules for everything (parsing, load, rebalance, guidance, photo checks) | Kept: runs with no cloud or AI; every assisted feature has a local fallback, so the demo cannot break on connectivity |
| C (Chosen) — Guardians as functional companions with distinct actions, plus consent gated changes | Kept: differentiates the product from dashboards and mascot apps; every change needs explicit approval |
| D — Coastal Commons and Night Market as extra environments | Dropped for the slice; documented as post core progression goals that share all data and progression |
| E — Full game engine (Phaser) for the town renderer | Dropped: a layered DOM and CSS town keeps the build light and testable; Phaser atlases are reused as build time frame data only |
| F — Live Google Calendar integration | Deferred: seeded calendar data stands in; the adapter seam is kept for later |
| G — Cloud AI conversations for guardian help | Deferred: deterministic local guidance ships instead; a remote provider can be swapped in behind the same interface |

### **2.2 Ideation Boards**

> 🎨 **Interactive Visual Ideation Board:** [Open Interactive Board (Live Webpage)](https://htmlpreview.github.io/?https://github.com/CSL06/PaceTown/blob/main/ideation-board.html)  
> *(Click the interactive link to explore the live corkboard with animated gameplay anchors, guardian portraits, and full study citations)*

![PaceTown Living Ideation Board](docs/ideation-board.png)

*The PaceTown Ideation Board maps our entire design process from root problem to working vertical slice:*
* **1. Multi-Layer Problem Tree & Guardian Mindmap:** Deconstructs the 5 whys of student burnout (time blindness, cognitive dread, shame, rest guilt, life admin) and branches each to a specialized guardian (Kai, Mira, Sky, Sol, Goh) with its mechanical solution.
* **2. The Restorative Pace Loop:** Traces the 5-phase student journey across live prototype environments (Campus Grove ➔ Clock Tower ➔ Library ➔ Pond ➔ Café) demonstrating how context is preserved without stress.
* **3. Market Research & Behavioral Grounding:** Grounds our gamification in a 2023 ScienceDirect study of 318 Malaysian users (55% continuance variance explained by usefulness and habit) and precedents like *Focus Friend* and cozy MMORPG co-presence.
* **4. Concept Matrix (Breadth of Exploration):** Contrasts PaceTown against 3 dropped alternative paradigms (*The Strict Warden*, *Study Tamagotchi*, *Cloud AI Ghostwriter*), detailing why punitive and auto-completion models were rejected.
* **5. Prototype Evolution Track:** Details our visual and mechanical pivots across 4 iterations (V1 red alert wireframe ➔ V2 sprawling map ➔ V3 autonomous scheduler ➔ V4 consent-gated restorative slice).

---

### **2.3 Mentor Consultation**

| Date | Mentor | Feedback Received | What Was Changed |
| :---- | :---- | :---- | :---- |
| 4 Sept 2026 | Scope, Precedents &amp; Value Distinction Mentor | *"Gamifying workflow and stress management is fully in-scope and differentiates the project. Ground the approach with established precedents (MMORPG mechanics, desktop companions, Focus Friend) and clearly define what makes the solution distinct and better beyond having a game aesthetic."* | Articulated our core value distinction: active capacity protection with consent-gated rebalancing and zero-guilt recovery (rather than passive task tracking). Grounded the gamified loop in behavioral research (ScienceDirect 2023 study). |
| 11 Sept 2026 | Demo Presentation &amp; Time Management Mentor | *"Bundle features into 2–3 clear conceptual groups (Smart Time Management, Guided Productivity, Stress Relief/Recovery). Highlight purpose over mechanics: communicate why features matter to an exhausted student, not micro form clicks. Use short engaging clips and provide an interactive link for judges."* | Streamlined product narrative into 3 core pillars; reframed all documentation around student emotional impact; embedded focused visual prototype clips; provided direct one-click interactive links to the live prototype and standalone ideation board. |

Log each session with its date, mentor, concrete feedback, and the resulting change. Feedback the team respectfully declined still counts: record the reason it did not fit the product promise.

## **3. Design & Prototype**

**UI Prototype:** [Open UI Prototype](https://pacetown.vercel.app/)

Key screens from the running prototype. 

![Campus Grove map](assets/readme/main.gif)
*The walkable town. Every place is reachable on foot or from the Town List; load shows as weather, not damage.*

![Clock Tower planning room](assets/readme/town%20clock.gif)
*Kai's Week Board opens on a consent preview: softly outlined suggested moves, locked fixed events, before and after loads, and Approve or Dismiss. A manual drag and drop calendar sits underneath.*

![Library study room](assets/readme/library.gif)
*Talk to Mira, choose from the open work list with resume badges, answer the blocker question, use one checkpoint proposal, then work at the study desk with timer, scratchpad, saved notes, and Ask Mira.*

![Gentle Ripples water](assets/readme/pond.gif)
*Tap the pond to make ripples: petals drift, a fish swims, flowers bloom with participation. No score, no failure, no minimum time; leaving early is valid, and only the first recovery of a run pays.*

![Warm Cup ritual](assets/app-runtime-v1/game/recovery/backgrounds/warm-cup.png)
*Choose a drink, pour, stir, and sit by the window in an unruinable four step ritual with Sky keeping quiet company. Same contract as every recovery scene: no score and no wrong order.*

## Guardian System

Guardians are functional product guides. Each specializes in a different
decision; they do not diagnose, judge, or pretend to be an AI homework
replacement.

<table>
  <thead>
    <tr><th>Guardian</th><th>Location</th><th>Role</th><th>What the student gets</th></tr>
  </thead>
  <tbody>
    <tr>
      <td><img src="assets/app-runtime-v1/game/portraits/mira.webp" width="64" alt="Mira" /><br /><strong>Mira</strong></td>
      <td>Library</td><td>Understand</td>
      <td>Brief interpretation, concept explanation, research organization, and a clear checkpoint.</td>
    </tr>
    <tr>
      <td><img src="assets/app-runtime-v1/game/portraits/kai.webp" width="64" alt="Kai" /><br /><strong>Kai</strong></td>
      <td>Clock Tower</td><td>Plan</td>
      <td>Capacity framing, priority decisions, safe calendar moves, and before/after load previews.</td>
    </tr>
    <tr>
      <td><img src="assets/app-runtime-v1/game/portraits/sol.webp" width="64" alt="Sol" /><br /><strong>Sol</strong></td>
      <td>Garden / Park</td><td>Sustain</td>
      <td>Smaller actions, protected breaks, equal recovery choices, and non-clinical capacity support.</td>
    </tr>
    <tr>
      <td><img src="assets/app-runtime-v1/game/portraits/sky.webp" width="64" alt="Sky" /><br /><strong>Sky</strong></td>
      <td>Café</td><td>Accompany</td>
      <td>Quiet body-doubling-style presence, gentle check-ins, and low-pressure encouragement.</td>
    </tr>
    <tr>
      <td><img src="assets/app-runtime-v1/game/portraits/goh.webp" width="64" alt="Goh" /><br /><strong>Goh</strong></td>
      <td>Market</td><td>Complete</td>
      <td>Material gathering, grouped errands, submission checks, and loose-end closure.</td>
    </tr>
  </tbody>
</table>

## **4. What Makes It Different**

* **Consent previews, not auto scheduling.** The engine simulates moves and shows before and after values; nothing mutates until the student approves. Most planners either do nothing or rearrange silently.
* **One checkpoint, not a project plan.** Mira proposes exactly one small step with a visible definition of done; Make it smaller is always one click.
* **Return is a designed moment.** Welcome back desk summary, open work resume badge, and a guardian spoken HUD card (task, checkpoint, time, last note, next action). No other student tool treats resuming as a first class feature.
* **Honest stopping is rewarded.** Partial, blocked, and rescheduled are valid, paid outcomes; the first recovery pays once and can never be farmed.
* **Photo parity.** Self confirmation and photo confirmation earn identically; keepsakes never prove a quest happened.
* **Deterministic and offline.** Every number is explainable and every AI style feature has a local fallback, so the demo cannot break on connectivity.

Comparison against the named existing solutions:

|  | PaceTown | Planners / timers | Relaxation games | General AI assistants |
| --- | --- | --- | --- | --- |
| Shows total load | Yes, explained | Partially | No | No |
| Helps begin work | Yes, one checkpoint | Rarely | No | Sometimes, no capacity awareness |
| Safe rescheduling | Yes, consent previews | Manual only | N/A | No |
| Preserves context | Yes, resume ritual | Rarely | No | No |
| Rest without guilt | Yes, rewarded once | No | Yes, but responsibility untouched | No |

## **5. Technical Architecture & Feasibility**

**Tech stack**

| Layer | Choice | Why we chose it | Constraints expected |
| --- | --- | --- | --- |
| Frontend | React + TypeScript + Vite | Component model fits panels and scenes; strict types catch state shape drift; fast dev loop for a demo | Bundle size grows with scenes; code splitting used on heavy routes |
| Town rendering | Layered DOM and CSS pixel art, no game engine | Keeps the build light, testable with Testing Library, and accessible (keyboard, focus, screen reader) | Not a full engine; complex physics or map work would need a rework |
| Persistence | localStorage behind a storage adapter (pacetown.game, versioned and migrated) | Zero backend for the slice; single device demo works offline | Single device only; IndexedDB or a server is an explicit later swap |
| Auth | Browser only local accounts and guest demo path | No hosted auth to operate; guest path opens the demo in one click | Clearly not production authentication; a hosted provider is a later adapter |
| Tests | Vitest, jsdom, and Testing Library (378 tests, 40 files); Playwright E2E | jsdom covers panels and scenes fast; Playwright covers real browser flows | Playwright browsers must be installed locally for E2E |
| Quality gates | ESLint, token checks, TypeScript build, Vitest, and Vite build in CI | Catches drift before merge; all green on main | CI needs Node 24; offline PWA shell registers in production builds only |
| Hosting | Static build (dist, git ignored) served by any static host; npm run preview locally | No server code exists, so any static host works | No backend, so nothing to scale; deployment infrastructure is outside the slice |

**System architecture diagram**

```mermaid
flowchart TB
  UI[src/game and src/landing<br/>React scenes and panels]
  STATE[GameState + localStorage adapter<br/>versioned browser save]
  DOMAIN[src/domain<br/>pure deterministic rules]
  ASSETS[assets/app-runtime-v1<br/>runtime art and audio]
  UI --> STATE
  UI --> DOMAIN
  UI --> ASSETS
  STATE --> DOMAIN
```

**Build plan & scope**

Already built in this slice: intake and parsing, Daily Load and Load Weather, the Clock Tower Week Board with consent flow, the Library guided work loop with sessions and outcomes, welcome back continuity, all five recovery scenes, Pocket of Green with local photo checks, the keepsake pipeline, Journal, Mailbox, Backpack, Council, and Garden, settings and shop, accessibility, versioned saves, JSON export, reset, and the offline PWA shell.

Explicitly out of scope: hosted authentication and multi device sync, IndexedDB or server backed repositories, live Google Calendar, cloud AI conversations, deep shop progression and production town upgrades, the full Recovery Garden catalog and long term social features, Android packaging, and production deployment infrastructure.

**Resources and time**

A four person student team built this slice with zero cost tooling: React, TypeScript, Vite, Vitest, Testing Library, Playwright, and static hosting, with all art generated in house or sourced from credited packs. Frontend, domain modeling, pixel art pipeline, and QA verification were covered inside the team. The scope above is deliberately one campus loop because that is what fits a hackathon window honestly; every deferred item has a named seam (storage adapter, guidance provider interface, data driven districts) so a follow up build starts from working code, not from scratch.

**Where it can go next**

The same loop scales without redesign: more student groups with different capacity profiles, additional districts sharing all data and progression, institution onboarding that imports a real week, and installable PWA distribution already in place. Each step reuses the consent, parity, and no shame contracts, so growth never requires weakening the product promise.
