# PaceTown — Hackathon Implementation Plan

## 1. Product Summary

**PaceTown** is a cozy, pixel-art workload and recovery game for university students. Students enter tasks, commitments and a short optional daily check-in. PaceTown estimates schedule pressure, explains what is causing it, proposes safer task arrangements and turns suitable recovery actions into quests.

The student's real-life decisions change an interactive virtual town. Buildings gain activity, residents respond, cosmetic options unlock and new environments become available as the student develops a more sustainable pace.

> **Find your pace. Grow your place.**

PaceTown is not a medical or burnout-diagnosis product. It is an explainable schedule-pressure and lifestyle-balancing tool.

---

## 2. Product Goal and Success Loop

The prototype must demonstrate this complete loop:

```text
Student adds commitments
        ↓
PaceTown calculates and explains daily load
        ↓
An overloaded day is detected
        ↓
The student approves a rebalance proposal
        ↓
PaceTown offers suitable recovery and action quests
        ↓
The student completes a real or in-app activity
        ↓
XP, coins and building progress are awarded
        ↓
The pixel-art town visibly becomes more active
```

The main judging story should take no more than three minutes while still allowing deeper exploration.

---

## 3. Audience and Product Principles

### Audience

PaceTown is for general university students, including students balancing classes, assignments, social commitments, errands, clubs, commuting and part-time work.

### Principles

1. **Support, never punish.** Missed quests do not remove progress, break streaks or damage the town.
2. **Explain every score.** Students can see which commitments created an overload warning.
3. **Propose, never take control.** Rebalancing changes require explicit approval.
4. **Respect different capacities.** Onboarding creates personalized defaults that remain editable.
5. **Keep wellbeing private.** No public comparisons, wellbeing leaderboards or mandatory proof.
6. **Make recovery flexible.** Quests can be replaced without penalty.
7. **Remain useful without AI.** Every AI-assisted feature has a deterministic local fallback.
8. **Remain accessible outside the map.** Every spatial interaction is mirrored in a semantic Town List.

---

## 4. Platform and Technical Direction

### First implementation

- Responsive browser-based application.
- Installable Progressive Web App.
- Runs and is fully testable locally before deployment work begins.
- Optimized for desktop and mobile browsers.
- No cloud service is required for the initial local demonstration.

### Technology

```text
React
TypeScript
Vite
React Router
Framer Motion
IndexedDB
Vitest + Testing Library
Playwright
PWA service worker
```

Use layered DOM and CSS for the isometric town rather than introducing a full game engine. Interactive buildings, props and characters are positioned as independent pixel-art elements over environment layers.

### Later adapters

- Supabase adapter for production authentication, PostgreSQL data and private image storage.
- Provider-neutral server adapter for language and vision models.
- Vercel deployment after local acceptance tests pass.
- Capacitor Android wrapper after the responsive PWA is stable.

---

## 5. Information Model

PaceTown separates **demands** from **protective resources** so percentages never mix opposite meanings.

### Demand areas

| Area | Meaning |
|---|---|
| Time | Total scheduled and estimated time pressure |
| Mental | Cognitive effort from study and complex work |
| Physical | Physically demanding commitments and movement needs |
| Social | Social commitments and desired connection |
| Errands | Administrative and practical responsibilities |

### Protective resources

| Resource | Meaning |
|---|---|
| Energy | Optional self-reported capacity for the current day |
| Recovery | Rest, sleep and restorative actions |

Outdoor activity is offered as one type of recovery action rather than presented as another burden.

### Display language

- **Daily Load** is schedule pressure and may exceed 100%.
- **Town Pace** summarizes capacity, recovery and imbalance.
- **Energy** is a self-reported signal, not a diagnosis.
- Each warning includes a plain-language explanation and contributing tasks.

---

## 6. Town and Navigation

The town is the primary game interface. A conventional navigation bar and Town List provide direct and accessible alternatives.

### Routes

```text
/                 Landing and authentication
/onboarding       Capacity calibration
/town             Interactive town and daily briefing
/planner          Tasks, calendar, forecast and rebalancing
/journal          Timeline, reflections and history
/shop             Cosmetics and customization
/profile          Preferences, accessibility and data controls
```

### Interactive locations

| Location | Function |
|---|---|
| Library | Mental load, study quests and focus timer |
| Clock Tower | Time capacity and weekly forecast |
| Gym | Physical commitments and movement quests |
| Café | Social commitments and connection quests |
| Market | Errands and coin shop |
| Home | Energy, sleep and recovery interactions |
| Park | Outdoor recovery and optional photo quests |
| Town Hall | Task entry, AI parsing and rebalancing |
| Post Office | Journal and activity history |

Selecting a location moves the avatar along a scripted route, focuses the camera and opens the relevant panel. Free-roaming movement is not required.

---

## 7. Core Screens and Flows

### Authentication

- Local sign-up, sign-in, sign-out and session persistence.
- Prominent **Explore Demo Town** path.
- Authentication is implemented behind an adapter so Supabase can replace local mode later.

### Onboarding

Collect editable defaults in approximately one minute:

- Typical waking and sleep hours.
- Class or work blocks.
- Approximate flexible hours.
- Preferred recovery activities.
- Accessibility and motion preferences.

### Daily briefing

- Optional energy rating from 1–5.
- Optional stress rating from 1–5.
- Optional sleep duration.
- Today's capacity, load explanation and three quests.
- A **Skip for now** action is always available.

### Planner

- Manual task form.
- Natural-language task entry.
- Day and week views.
- Load contribution per task.
- Forecast and overloaded-day explanation.
- Drag-and-drop rebalance preview with explicit confirmation.

### Journal

- Automatic private timeline of tasks, quests, purchases, upgrades and load changes.
- Optional mood check-in and short reflection.
- Privately retained quest photos only when the student explicitly chooses to save them.

### Shop

- Cosmetic-only purchases.
- Preview before purchase.
- Trees, paths, benches, building styles, outfits, lighting and weather effects.
- No premium currency or real-money purchases.

### Profile and settings

- Capacity defaults.
- Quest preferences.
- Audio and motion controls.
- High-contrast and Town List options.
- Export, reset and delete-local-data controls.

---

## 8. Task Model

```ts
type DemandCategory = "time" | "mental" | "physical" | "social" | "errands";
type Priority = "low" | "medium" | "high";
type Effort = "low" | "medium" | "high";

interface Task {
  id: string;
  title: string;
  category: DemandCategory;
  date: string;
  startTime?: string;
  deadline?: string;
  estimatedMinutes: number;
  priority: Priority;
  mentalEffort: Effort;
  flexibility: "fixed" | "flexible";
  minimumSessionMinutes?: number;
  notes?: string;
  status: "pending" | "completed";
  source: "manual" | "parsed" | "seeded";
}
```

Fixed tasks include classes, shifts and appointments. Flexible tasks may move only within valid availability and never beyond their deadline.

---

## 9. Workload Engine

The workload engine must remain deterministic, explainable and independently testable.

### Suggested weights

```text
Priority: low 0.80, medium 1.00, high 1.25
Mental effort: low 0.85, medium 1.00, high 1.20
Urgency: due today 1.30, due tomorrow 1.15, otherwise 1.00
```

### Calculation

```text
Weighted Demand
= Estimated Minutes × Priority Weight × Effort Weight × Urgency Weight

Daily Load Percentage
= Total Weighted Demand ÷ Personalized Available Minutes × 100
```

Fixed commitments reduce available minutes directly. The energy check-in adjusts the displayed risk guidance within a bounded range but does not conceal the raw time calculation.

### Load bands

| Load | Status |
|---:|---|
| Under 60% | Open |
| 60–80% | Steady |
| 81–95% | Heavy |
| 96–110% | Overloaded |
| Above 110% | Unsustainable schedule |

Every result includes:

- Available capacity.
- Weighted task demand.
- The largest contributing commitments.
- Any effect from the optional check-in.
- A statement that this is schedule guidance, not health assessment.

---

## 10. Rebalancing Engine

The engine minimizes the maximum daily load and avoids excessive context switching.

### Rules

1. Never move fixed commitments.
2. Never move work beyond its deadline.
3. Respect available time blocks and minimum session length.
4. Prefer moving low-priority tasks before high-priority work.
5. Prefer fewer, meaningful sessions over excessive splitting.
6. Return a proposal with before-and-after load values.
7. Apply changes only after explicit approval.
8. Allow the student to reject or edit every proposal.

The algorithm may use greedy local search for the hackathon: identify the peak day, rank movable tasks by flexibility and urgency, then test valid alternative slots until the peak load is reduced.

---

## 11. Quest System

Generate three daily quests:

1. A load-management quest addressing the largest current pressure.
2. A recovery quest based on energy, recent activity and preferences.
3. A student-choice quest selected from suitable alternatives.

### Quest examples

- Complete a 25-minute focus sprint.
- Move one flexible task from an overloaded day.
- Take ten minutes outside.
- Protect a short period with no work.
- Complete a grouped errand route.
- Plan a low-pressure social check-in.

Quests can be replaced without penalty. Frequently skipped types appear less often. Recovery actions come from a reviewed content library; AI may personalize wording but cannot invent medical advice.

---

## 12. Game Systems

### Core loop

```text
Check in → inspect town → choose action → complete action
→ earn resources → customize or upgrade → unlock interactions
```

### Rewards

| Activity | XP | Coins |
|---|---:|---:|
| Ordinary quest | 20–30 | 10–20 |
| Rebalancing quest | 35 | 25 |
| Weekly goal | 75 | 50 |

- Early player levels require 200 XP.
- Cosmetics cost approximately 50–300 coins.
- Building upgrades require category progress and cannot be purchased with coins alone.
- Coins never affect workload scores or recovery recommendations.

### World response

- High load produces faster clouds and a busier atmosphere.
- Low energy produces calmer lighting and resident support.
- Improved balance adds residents, wildlife and environmental activity.
- The town never deteriorates or removes earned progress.

### Residents

Create five recurring residents representing time, mental load, physical needs, social connection and errands. Dialogue is short, contextual and supportive rather than narrative-heavy.

### Purpose-linked interactions

- Focus timer.
- Task-sorting and rebalance interaction.
- Breathing or wind-down interaction.
- Optional photo verification.
- Town customization mode.

Do not add unrelated arcade mini-games or competitive wellbeing leaderboards.

---

## 13. Environments and Pixel-Art Direction

### Visual style

- Detailed modern isometric pixel art.
- Cozy proportions and readable silhouettes.
- Consistent perspective, tile scale, palette and lighting rules.
- Crisp nearest-neighbour scaling across devices.
- Layered transparent assets rather than a single flattened illustration.

### Environments

1. **Campus Grove** — default environment and first production target.
2. **Coastal Commons** — milestone unlock.
3. **Night Market** — milestone unlock.

All environments share progression and data. Switching environments never resets the town.

### Asset production order

1. Lock tile size, palette, camera and perspective.
2. Generate Campus Grove ground and environment layers.
3. Generate nine buildings with base, active and upgrade states.
4. Generate avatar, five residents and walking/idle/celebration frames.
5. Generate props and cosmetic shop items.
6. Validate scale and interaction in the browser.
7. Produce Coastal Commons and Night Market from the locked specification.

### Motion

- Scripted avatar travel.
- Swaying trees, water movement, smoke and ambient residents.
- Building activation and upgrade celebrations.
- Day/night and weather transitions.
- Optional environment audio and subtle effects.
- Reduced-motion mode replaces travel and large transitions with simple fades.

---

## 14. AI and Local Fallback Contracts

### Task parsing

Input:

```text
I have class tomorrow from 9 to 4, work from 6 to 10,
and my AI assignment is due Friday.
```

Output:

```ts
interface ParsedTaskResult {
  tasks: Partial<Task>[];
  ambiguities: string[];
  confidence: number;
}
```

The user reviews and edits parsed tasks before saving. Local mode uses deterministic date, time, duration and keyword parsing. A later provider adapter returns the same contract.

### Photo verification

```ts
interface PhotoVerificationResult {
  criteria: Array<{
    label: string;
    passed: boolean;
    confidence: number;
  }>;
  overall: "pass" | "uncertain" | "fail";
  explanation: string;
  source: "local" | "ai" | "manual";
}
```

Local mode analyses basic image properties and colour presence. Uncertain or failed results allow manual correction. Students choose between **Verify only** and **Save privately to journal**. Saved production photos must use private storage and have location metadata removed.

---

## 15. Local Data Architecture

Use IndexedDB repositories behind interfaces so production services can replace them later.

### Stores

```text
users
sessions
preferences
tasks
check_ins
quests
quest_history
journal_entries
inventory
purchases
town_progress
environment_state
photos
```

### Required adapters

```ts
interface AuthAdapter {}
interface DataRepository<T> {}
interface TaskParserAdapter {}
interface PhotoVerifierAdapter {}
interface AssetRepository {}
```

The UI and domain engines must not directly depend on IndexedDB, Supabase or a specific AI provider.

---

## 16. Accessibility, Privacy and Safety

- Semantic buttons, dialogs, forms and landmarks.
- Full keyboard access.
- Town List mirrors all spatial interactions.
- Status uses text and icons in addition to colour.
- Large touch targets and mobile-safe panels.
- High-contrast option.
- Reduced-motion support.
- Audio is muted until enabled.
- Quest photos are optional and private.
- No public wellbeing scores or social comparison.
- No medical claims, diagnosis or crisis assessment.
- Recovery suggestions come from reviewed templates.
- Students may skip check-ins and replace quests.
- Local data can be exported, reset or deleted.

When the user is overloaded, reduce the number of simultaneous prompts and foreground one recommended next action.

---

## 17. Responsive Behavior

### Desktop

- Central isometric town.
- Persistent summary rail and quest panel.
- Bottom forecast and contextual activity panel.

### Mobile

- Town occupies the upper interactive viewport.
- Swipeable bottom sheet contains briefing, quests and building details.
- Bottom navigation provides Town, Planner, Journal, Shop and Profile.
- Tap-to-focus replaces unrestricted panning.
- Town List is available from the same navigation.

The complete primary flow must work at approximately 390 px width without horizontal page scrolling.

---

## 18. Local Development Phases

### Phase 1 — Foundation

- Scaffold React, TypeScript and Vite.
- Add routing, design tokens, IndexedDB repositories and test setup.
- Implement local authentication and demo seed.

### Phase 2 — Domain engines

- Implement task model, workload calculation, quest generation and rebalancing.
- Write unit tests before connecting the UI.

### Phase 3 — Product flows

- Build onboarding, planner, check-in, forecast, AI parsing review and rebalance approval.

### Phase 4 — Game shell

- Build town camera, location interactions, avatar travel and building panels.
- Connect quests, XP, coins, inventory and upgrades.

### Phase 5 — Full feature set

- Build journal, shop, customization, photo verification, focus timer and recovery interactions.
- Add three selectable environments.

### Phase 6 — Accessibility and resilience

- Add Town List, keyboard behavior, reduced motion, offline support and error/fallback states.

### Phase 7 — Verification and polish

- Run automated tests.
- Test desktop and mobile in one bounded visual pass.
- Fix functional, accessibility and responsive defects.
- Re-run one final confirmation pass.

---

## 19. Four-Person Team Split

| Role | Primary responsibility |
|---|---|
| Product UI | Application shell, responsive flows and accessibility |
| Game and Art | Pixel-art pipeline, town renderer, motion and customization |
| Domain Logic | Workload, rebalancing, quests, progression and tests |
| Data and AI | IndexedDB, authentication, parsing, verification and adapters |

Integrate continuously around the shared demo flow rather than building isolated pages until the end.

---

## 20. Testing Plan

### Unit tests

- Workload weights and threshold boundaries.
- Fixed commitment capacity reduction.
- Rebalancing deadline and flexibility constraints.
- Quest selection and replacement rules.
- XP, coins, purchases and building progression.
- Parser and photo-verification result contracts.

### Integration tests

- Local account and demo session persistence.
- Task entry through manual and parsed flows.
- Rebalance preview, rejection and approval.
- Quest completion updating journal and town state.
- Cosmetic purchase and environment switching.
- Refresh restoring all persisted state.

### End-to-end tests

- New-user onboarding to first town visit.
- Seeded demo overload-to-recovery story.
- Mobile navigation and bottom-sheet interactions.
- Keyboard-only Town List journey.
- Reduced-motion and muted-audio behavior.
- Offline reload of previously visited application shell.

---

## 21. Local Acceptance Criteria

The first build is complete when:

- A user can register, sign in, sign out and use a seeded demo account.
- Onboarding creates editable capacity preferences.
- Natural-language input becomes editable task suggestions.
- Workload recalculates and explains its result.
- Rebalancing returns valid proposals and applies only approved changes.
- Three suitable daily quests appear and can be replaced.
- Focus, recovery and photo interactions can be completed.
- XP, coins, purchases and upgrades persist after refresh.
- Journal entries are created from meaningful events.
- Campus Grove, Coastal Commons and Night Market are selectable when unlocked.
- The town and Town List expose the same core functions.
- Desktop and mobile layouts complete the main journey.
- Reduced-motion, high-contrast and audio settings work.
- Automated domain and persistence tests pass.
- The application runs locally without mandatory cloud or AI services.

---

## 22. Demo Scenario

Use a fictional student named **Aina** while maintaining a general-university-student product position.

### Initial state

- Aina has lectures, an assignment, a club commitment, errands and a part-time shift.
- Thursday begins at 108% projected load.
- The Clock Tower and Town Hall indicate pressure without damaging the town.

### Demonstration

1. Enter a natural-language schedule.
2. Review and save the parsed tasks.
3. Open the weekly forecast and explain Thursday's load contributors.
4. Ask Town Hall to rebalance the week.
5. Approve moving eligible work while fixed commitments remain locked.
6. Show Thursday falling to a safer level.
7. Accept an outdoor recovery quest from the Park resident.
8. Complete local photo verification or correct an uncertain result.
9. Receive XP, coins and Park Growth.
10. Choose a Park upgrade and watch the town respond.
11. Open the Journal to show the complete history.
12. Switch to an unlocked environment to demonstrate progression.

---

## 23. Judging-Rubric Alignment

### Ideation

- Produce a problem tree, product mind map and end-to-end user flow.
- Document rejected alternatives and the reasons for the town-first direction.
- Record mentor feedback and resulting changes.

### Creativity

- Emphasize the distinction: PaceTown gamifies sustainable pacing rather than greater output.
- Demonstrate how the town is both navigation and feedback, not decorative gamification.

### Feasibility

- Show the locally running PWA, deterministic engines, adapters and automated tests.
- Explain the staged asset pipeline and provider-independent AI contracts.

### Design

- Demonstrate the complete flow in both the pixel-art town and accessible Town List.
- Show mobile responsiveness, reduced motion and non-colour status communication.

### Impact

- Use Aina's before-and-after story to make accumulated demands concrete.
- Explain how the architecture can later support campuses and additional recovery libraries without changing the core model.

---

## 24. Post-Local Roadmap

Only after local acceptance:

1. Add Supabase authentication, database and private image storage.
2. Connect one configured language-and-vision provider.
3. Deploy the web application to Vercel.
4. Validate the hosted build on a real mobile device.
5. Package the stable PWA for Android using Capacitor.
6. Add production monitoring, rate limits and data-retention controls.

This roadmap does not remove features from the local build; it replaces local adapters with production services.
