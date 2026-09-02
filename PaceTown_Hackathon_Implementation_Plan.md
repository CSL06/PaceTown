# PaceTown — Hackathon Implementation Plan

## 1. Product Summary

**PaceTown** is a cozy, pixel-art workload, guided-work, and recovery game for university students. Students enter tasks, commitments, assignment briefs, and a short optional daily check-in. PaceTown estimates schedule pressure, explains what is causing it, proposes safer task arrangements, helps the student turn intimidating work into a manageable next step, and embeds recovery actions into the work cycle.

The student's real-life decisions change an interactive virtual town. Buildings gain activity, residents respond, cosmetic options unlock and new environments become available as the student develops a more sustainable pace.

> **Find your pace. Grow your place.**

The town is not a decorative dashboard. It is the playable interface for deciding what to do, beginning real work, getting unstuck, regulating pressure, and preserving progress between sessions.

PaceTown is not a medical, therapy, or burnout-diagnosis product. It is an explainable schedule-pressure, guided-work, and recovery-support tool.

---

## 2. Product Goal and Success Loop

The prototype must demonstrate this complete loop:

```text
Student adds commitments across mental, time, physical,
social, and errand demands
        ↓
PaceTown calculates and explains daily load
        ↓
PaceTown foregrounds the safest practical response
        ↓
Make space by rebalancing
        OR
Get help handling one task through a guided Pace Session
        OR
Recover before deciding what comes next
        ↓
The student explicitly chooses, edits, or declines the recommendation
        ↓
PaceTown supports the chosen action
        ↓
Partial progress and the next starting point are saved
        ↓
The student intentionally continues, reschedules, or recovers
        ↓
XP, coins, building progress, and a calmer town reflect sustainable progress
```

The main judging story should take no more than three minutes and must show progress on a real task, not only a changed schedule or completed relaxation activity.

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
9. **Help with the work itself.** Every pressure insight should lead to a practical next action, guided work, or deliberate recovery choice.
10. **Reward sustainable progress.** Reward starting, meaningful checkpoints, asking for help, realistic replanning, and intentional stopping—not raw hours or constant output.
11. **Preserve academic agency.** AI may explain, scaffold, review, and guide, but the student sees, edits, and owns every plan and submitted artifact.
12. **Foreground recovery when capacity is low.** When recovery is the safest practical next action, make it the primary recommendation while preserving choices to continue, shorten, reschedule, or decline.

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

Use layered DOM and CSS for the top-down three-quarter town rather than introducing a full game engine. Interactive buildings, props, and characters are positioned as independent pixel-art elements over environment layers. Existing Phaser-compatible atlas metadata may be converted or reused as build-time frame data, but Phaser is not a runtime requirement for the hackathon.

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
/session/:taskId  Guided Pace Session for one real task
/journal          Timeline, reflections and history
/collection       Private Pace Keepsakes and placement
/shop             Cosmetics and customization
/profile          Preferences, accessibility and data controls
```

### Interactive locations

| Location | Function |
|---|---|
| Library / Mira | Understand material, organize research, and create study checkpoints |
| Clock Tower / Kai | Choose priorities, estimate time, run Pace Sessions, and rebalance schedules |
| Garden/Gym pavilion / Sol | Physical commitments, movement quests, scope reduction, protected breaks, and recovery interactions |
| Café / Sky | Body-doubling-style work sessions, gentle check-ins, and connection quests |
| Market / Goh | Materials, errands, submission checklists, and loose ends |
| Home | Energy, sleep, quiet mode, and recovery interactions |
| Park | Outdoor recovery and optional photo quests |
| Town Hall | Task entry, brief intake, AI parsing, and work-plan review |
| Post Office | Journal, session history, saved next actions, and private reflections |
| Campus entrance | Spawn, orientation, and direct access to the Town List |

Selecting a location moves the avatar along a scripted route, focuses the camera and opens the relevant panel. Free-roaming movement is not required.

Campus Grove is the only environment required for the hackathon vertical slice. Coastal Commons and Night Market remain post-core progression goals.

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
- Today's capacity, load explanation, one foregrounded recommendation, and up to three quests.
- A **Skip for now** action is always available.

### Planner

- Manual task form.
- Natural-language task entry.
- Optional assignment-brief or rubric intake.
- Day and week views.
- Load contribution per task.
- Forecast and overloaded-day explanation.
- Drag-and-drop rebalance preview with explicit confirmation.

### Work-plan review

- Extract or manually enter deliverables without silently changing the student's work.
- Ask what is blocking progress: unclear start, excessive scope, missing knowledge or materials, low capacity, or perfection pressure.
- Break the chosen task into editable checkpoints with a clear definition of done.
- Recommend one checkpoint that fits the student's available time and current energy.
- Let the student shorten, reorder, replace, or reject every suggestion.

### Guided Pace Session

- Attach each session to one real task and one concrete checkpoint.
- Show the intended output and optional timebox instead of a generic productivity timer.
- Keep the selected guardian available for contextual questions, explanation, brainstorming, review, or a saved next step.
- Allow **I am stuck**, **Reduce the scope**, **Pause and regulate**, **Reschedule**, and **Stop here** at all times.
- Save partial progress and the next starting action even when the checkpoint is unfinished.
- End with an intentional choice to continue, schedule the next session, or recover.

### Regulation activities

- Offer Firefly Stories, Chime Drift, Gentle Ripples, Warm Cup, and Night Lanterns before, during, or after work.
- Use them as short transition and regulation mechanics, not substitutes for completing real responsibilities.
- Provide no accuracy grade, failure state, streak loss, or countdown pressure.
- Let students report **lighter**, **the same**, or **not sure** without presenting the response as a health measurement.

### Journal

- Automatic private timeline of tasks, Pace Sessions, saved next actions, regulation choices, quests, purchases, upgrades, and load changes.
- Optional mood check-in and short reflection.
- Privately retained quest photos only when the student explicitly chooses to save them.

### Keepsake collection

- Private grid of generated, locally stylized, and symbolic Pace Keepsakes.
- Filter by Garden, Café, Library, Market, path, weather, and postcard categories.
- Preview, rename with application text, place, move, download, or delete a keepsake.
- Show whether the original photo was discarded or privately retained.
- No public feed, rarity pressure, trading, or completion percentage.

### Shop

- Supporting progression feature after the core vertical slice works.
- Cosmetic-only purchases.
- Preview before purchase.
- Trees, paths, benches, building styles, outfits, lighting and weather effects.
- No premium currency or real-money purchases.

### Profile and settings

- Capacity defaults.
- Quest preferences.
- Guardian, mini-game, session-timer, and recommendation preferences.
- Default photo handling, face-preservation, and keepsake-generation preferences; confirm sensitive choices at the moment of use.
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
  externalEventId?: string;
  status: "pending" | "completed";
  source: "manual" | "parsed" | "seeded" | "calendar";
}

type BlockerKind =
  | "unclear_start"
  | "too_large"
  | "missing_knowledge"
  | "missing_materials"
  | "low_capacity"
  | "perfection_pressure"
  | "other";

interface WorkPlan {
  id: string;
  taskId: string;
  objective: string;
  blocker?: BlockerKind;
  deliverables: string[];
  checkpoints: Checkpoint[];
  source: "manual" | "local" | "ai";
  status: "draft" | "active" | "completed";
}

interface Checkpoint {
  id: string;
  title: string;
  definitionOfDone: string;
  estimatedMinutes: number;
  status: "pending" | "active" | "partial" | "completed" | "blocked";
}

interface PaceSession {
  id: string;
  taskId: string;
  checkpointId: string;
  guardianId: "mira" | "kai" | "sol" | "sky" | "goh";
  plannedMinutes?: number;
  startedAt: string;
  endedAt?: string;
  outcome?: "partial" | "completed" | "blocked" | "rescheduled";
  progressNote?: string;
  nextAction?: string;
  regulationActivity?: string;
  assistanceUsed?: Array<"plan" | "explain" | "brainstorm" | "review" | "debug" | "encourage">;
}

type RegulationActivityId =
  | "firefly_stories"
  | "chime_drift"
  | "gentle_ripples"
  | "warm_cup"
  | "night_lanterns";

interface RegulationSession {
  id: string;
  activityId: RegulationActivityId;
  relatedPaceSessionId?: string;
  placement: "before_work" | "mid_session" | "after_work" | "standalone";
  startedAt: string;
  endedAt?: string;
  completed: boolean;
  response?: "lighter" | "same" | "not_sure";
  reducedMotion: boolean;
  muted: boolean;
}

type IrlRecoveryActivityId =
  | "short_walk"
  | "sit_outside"
  | "green_space"
  | "prepare_drink"
  | "stretch_move"
  | "grouped_errand"
  | "prepare_materials"
  | "write_and_put_away"
  | "social_check_in"
  | "notice_something_calming";

interface RecoveryActivitySession {
  id: string;
  mode: "digital" | "irl" | "hybrid";
  digitalActivityId?: RegulationActivityId;
  irlActivityId?: IrlRecoveryActivityId;
  relatedPaceSessionId?: string;
  status: "offered" | "accepted" | "partial" | "completed" | "declined";
  confirmation: "self" | "photo" | "none";
  response?: "lighter" | "same" | "not_sure";
}

type PhotoHandlingChoice =
  | "verify_and_discard"
  | "keepsake_and_discard_original"
  | "save_both_privately"
  | "cancel";

interface PaceKeepsake {
  id: string;
  recoveryActivitySessionId: string;
  category: "garden" | "cafe" | "library" | "market" | "path" | "weather" | "postcard";
  generatedImageRef: string;
  originalPhotoRef?: string;
  source: "local_filter" | "ai_generated" | "symbolic_fallback";
  placement?: "collection" | "journal" | "recovery_garden" | "town" | "future_mailbox";
  createdAt: string;
}
```

Fixed tasks include classes, shifts and appointments. Flexible tasks may move only within valid availability and never beyond their deadline.

Assignment text and work artifacts are optional. The student must be able to create and complete a work plan using only a title and manually entered checkpoints.

---

## 9. Guided Pace Session Engine

The Pace Session is the primary guided-work mechanic within the broader workload-management loop. It helps the student handle one responsibility that remains after PaceTown has made the total load visible and offered opportunities to rebalance or recover. It must not dominate the product positioning or turn PaceTown into a generic AI homework assistant.

### Session preparation

1. Choose one real task.
2. Identify the immediate blocker or skip the question.
3. Select or edit one checkpoint with a visible definition of done.
4. Choose a guardian and optional timebox.
5. Start directly or use a short regulation activity first.

### Session state machine

```text
PREPARE
  → ACTIVE
      → HELP_REQUESTED → ACTIVE
      → REGULATING → ACTIVE
      → SCOPE_REDUCED → ACTIVE
      → COMPLETED | PARTIAL | BLOCKED | RESCHEDULED
  → WRAP_UP
  → CONTINUE | SCHEDULE_NEXT | RECOVER | RETURN_TO_TOWN
```

- The current checkpoint, notes, elapsed time, and assistant context persist through refresh or accidental navigation.
- Returning from a mini-game restores the exact session state and offers **Resume**, **Change the plan**, or **Stop here**.
- A timer reaching zero never ends the session automatically and never marks the checkpoint complete.
- The student can finish without writing a reflection; only the outcome and next-action choice are required.

### Assistance behavior

- **Mira — Understand:** explain concepts, organize research, and create study checkpoints.
- **Kai — Plan:** prioritize work, estimate time, run sessions, and rebalance schedules.
- **Sol — Sustain:** notice fatigue, reduce scope, protect breaks, and suggest recovery.
- **Sky — Accompany:** provide body-doubling-style presence, gentle check-ins, and low-pressure encouragement.
- **Goh — Complete:** organize materials, errands, submission checks, and unfinished details.

The assistant may help interpret requirements, explain, brainstorm, outline, quiz, review, debug, or propose next steps. It must distinguish suggestions from the student's own work, avoid claiming that generated output satisfies an academic requirement, and keep every checkpoint editable.

### Blocker-specific interventions

| Blocker | First response | Optional guardian action |
|---|---|---|
| Unclear start | Identify the smallest observable first action | Mira extracts requirements or creates an outline |
| Task too large | Reduce the checkpoint until it fits the available time | Kai splits or reschedules the remaining work |
| Missing knowledge | Identify the exact concept or question | Mira explains, quizzes, or builds a learning path |
| Missing materials | Produce a short collection checklist | Goh gathers requirements and tracks missing items |
| Low capacity | Offer a shorter session, low-effort action, or recovery first | Sol protects a break and reduces prompts |
| Perfection pressure | Define a rough or incomplete first version | Sky starts a low-pressure body-doubling session |
| Other | Let the student describe or skip it | Offer manual planning without AI interpretation |

### Work-with-me interface

- Display one checkpoint, its definition of done, and the next physical or digital action.
- Provide an optional count-up or count-down timer, both hidden by default when the student prefers untimed work.
- Keep a compact scratchpad for notes, links, questions, and pasted excerpts without becoming a full document editor.
- Provide context-aware help modes: **Plan**, **Explain**, **Brainstorm**, **Review**, **Debug**, and **What next?**
- Let the student attach a brief or rubric, but never require an upload.
- Keep town animation, rewards, and unrelated quests out of the focused work area.
- Offer a persistent escape route: **Pause**, **Save and leave**, or **End session**.

### Session completion

A session succeeds when the student makes an intentional transition, including partial progress, asking for help, identifying a blocker, producing a checkpoint, rescheduling realistically, or stopping at the planned limit. Raw elapsed time is never the sole success condition.

Every completed session records what changed, what remains, and the easiest next starting action. This eliminates the need to reconstruct context at the next visit.

### Resume ritual

When the student returns, the guardian summarizes only:

1. The task and last checkpoint.
2. What the student recorded as completed or partial.
3. The saved next action.
4. One choice: resume it, edit it, or choose something else.

The resume screen must not begin with missed-time messaging, overdue shame, a streak warning, or a long historical summary.

---

## 10. Workload Engine

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

### Primary-response selection

After explaining load, PaceTown ranks three response families:

1. **Make space** when valid movement, reduction, or grouping can materially lower pressure.
2. **Handle what remains** when one meaningful checkpoint fits the student's available capacity.
3. **Recover first** when optional self-report and schedule context indicate that another work session is not the most sustainable immediate recommendation.

When recovery is ranked first, the interface foregrounds one suitable in-app or real-world option while preserving **Continue**, **Shorten the task**, **Reschedule**, **Choose another response**, and **Decline**. This is capacity-aware guidance, not a medical conclusion. Every recommendation includes a short explanation of the inputs that caused it.

---

## 11. Rebalancing Engine

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

## 12. Quest System

Generate up to three daily quests, but foreground only one recommended action when load or self-reported stress is high:

1. A work-progress or load-management quest addressing the largest current pressure.
2. A recovery quest based on energy, recent activity, and preferences.
3. An optional student-choice quest selected from suitable alternatives.

### Quest examples

- Complete a 25-minute focus sprint.
- Finish one named checkpoint in a Pace Session.
- Turn an assignment brief into an editable work plan.
- Save a clear next action after partial progress.
- Move one flexible task from an overloaded day.
- Take ten minutes outside.
- Protect a short period with no work.
- Complete a grouped errand route.
- Plan a low-pressure social check-in.

Quests can be replaced without penalty. Frequently skipped types appear less often. Recovery actions come from a reviewed content library; AI may personalize wording but cannot invent medical advice. Mini-games may satisfy a regulation quest, but never mark an unrelated academic task complete.

### Quest completion

- Work quests complete through an explicit checkpoint update by the student, not elapsed time alone.
- Schedule quests complete when the student approves the relevant planner change.
- In-app regulation quests complete through participation without performance scoring.
- Real-world recovery quests use self-confirmation by default.
- Optional photo verification can support a chosen quest, but it is never mandatory; uncertain results allow manual correction.
- A quest may be abandoned, replaced, or deferred without losing XP already earned elsewhere or changing the town negatively.

---

## 13. Game Systems

### Core loop

```text
Check in → inspect the town's pressure signals → choose one real task
→ define a manageable checkpoint → work with a guardian
→ regulate when needed → save progress and the next action
→ intentionally continue, reschedule, or stop
→ earn resources and grow a calmer, more active town
```

### Backpack mechanic

The Backpack is the student's tangible workload container. Tasks appear as recognizable objects such as books, laptops, calendars, uniforms, parcels, groceries, and invitation cards.

- Backpack weight reflects scheduled demand, never the student's worth or resilience.
- Opening it reveals fixed commitments, flexible work, deadlines, and incomplete checkpoints.
- Students can inspect an item, carry it into a Pace Session, move it through the Rebalance Workshop, or deliberately leave it for later.
- The backpack becomes visually lighter when work is completed or safely rescheduled; it never bursts, breaks, or humiliates the student.

### Load Weather

Load Weather turns explainable workload categories into ambient town conditions. It is feedback, not punishment.

- Mental load: Library fog, drifting pages, or reduced visual clarity.
- Time pressure: faster Clock Tower motion, moving clouds, and wind lines.
- Physical load or low energy: warmer shade, slower avatar pacing, and fewer prompts.
- Social load: Café crowd density and soundscape changes, respecting individual preferences.
- Errands: parcel stacks and busier Market paths.
- Recovery and improved balance: calmer light, water, wildlife, and resident activity.

Every effect has a text/icon equivalent in the Daily Briefing and Town List. Effects never depict destruction, failure, dead plants, danger, or permanent decline.

### Guardian Council

The Council is the decision point when several kinds of pressure compete.

- Each guardian contributes one short interpretation from their specialty.
- The Council recommends one primary action and exposes alternatives without presenting all options at equal visual weight.
- Possible outcomes are **Do one checkpoint**, **Make space**, **Recover first**, **Gather what is missing**, or **Choose for myself**.
- Ringing the Council bell never applies a schedule change automatically.

### Rebalance Workshop

The Workshop represents schedule changes as movable task objects on a weekly path.

- Fixed commitments are visibly locked.
- Flexible tasks show valid destinations before they can be moved.
- Before-and-after Daily Load values and affected deadlines remain visible.
- The student can accept all, accept selected changes, edit, or reject the proposal.
- Approved changes update both the planner and the task's next Pace Session recommendation.

### Recovery Garden

The Garden is persistent evidence of sustainable behaviors, not a streak garden.

- Work checkpoints, intentional recovery, realistic rescheduling, and asking for help contribute different growth resources.
- Plants have only neutral and positive growth states; nothing wilts because the student was absent.
- Students choose placements and cosmetic growth without affecting workload calculations.
- The first playable build needs one plot and one visible growth step; the full vision expands to multiple plants, wildlife, lighting, and seasons.

### Future Mailbox and Journal Postcards

- At the end of a session, students may send their future self a one-line next action or supportive note.
- The Mailbox surfaces that message at the next relevant session, not as a pushy notification.
- Journal Postcards summarize meaningful moments: a checkpoint, a rebalance, a recovery choice, a garden change, or a completed week.
- Postcards are private, editable, deletable, and never generated with embedded text inside raster artwork.

### Pace Keepsakes collection

Pace Keepsakes turn an optional IRL quest photo into private, PaceTown-styled pixel art that can become part of the student's town and memory collection.

```text
Complete or partially complete an IRL recovery quest
→ self-confirm or optionally verify with a photo
→ choose whether to create a keepsake
→ remove metadata and review crop/privacy warnings
→ generate or locally stylize a pixel-art memory
→ review the result
→ place it in the Collection, Journal, Recovery Garden,
Town, or Future Mailbox
```

Possible transformations include:

- Flower or greenery → Recovery Garden plant card or decoration.
- Warm drink → Café shelf keepsake.
- Sky or outdoor view → weather, lighting, or postcard memory.
- Walk → path-memory tile.
- Prepared study materials → Library desk keepsake.
- Completed errand → Market stamp or parcel token.
- Meaningful object → private Future Mailbox postcard.

The generated asset is a stylized memory, not a literal record or verification result. Verification and keepsake generation are separate operations. A failed or uncertain verification never blocks generation, and an attractive generated result never proves that a quest was completed.

Students choose one explicit photo policy:

- **Verify and discard:** use the photo for optional verification, then delete it.
- **Create keepsake and discard original:** retain only the generated art.
- **Save both privately:** retain the original and generated version in private storage.
- **Cancel:** retain nothing.

Keepsakes are cosmetic and optional. Photo users receive no extra XP, coins, rarity, or progression advantage over self-confirmation. The collection has no limited-time items, completion pressure, public gallery, or requirement to collect every activity.

### Quiet Mode, Calm Corner, and Exit Quest

- **Quiet Mode** reduces motion, ambient residents, prompts, effects, and audio while keeping all core actions available.
- **Calm Corner** provides direct access to regulation mini-games without requiring a high load score or active task.
- **Exit Quest** helps the student stop: record progress, choose a next action, close the session, and leave without a guilt message.

### Google Calendar terminal

- Calendar connection remains optional and is represented through an in-town terminal plus a conventional settings flow.
- Imported events are reviewed before they affect capacity.
- Fixed and flexible states remain visible and editable where permissions allow.
- Sync failure, denied permission, expiry, conflicts, and offline mode have explicit non-destructive states.
- The hackathon may use seeded calendar data; live Google integration is not required for the local vertical slice.

### Rewards

| Activity | XP | Coins |
|---|---:|---:|
| Begin a planned Pace Session | 10 | 5 |
| Meaningful or partial checkpoint | 20–30 | 10–20 |
| Identify a blocker and save a next action | 15 | 10 |
| Rebalancing quest | 35 | 25 |
| Intentional recovery quest | 20 | 15 |
| Weekly goal | 75 | 50 |

- Early player levels require 200 XP.
- Cosmetics cost approximately 50–300 coins.
- Building upgrades require category progress and cannot be purchased with coins alone.
- Coins never affect workload scores or recovery recommendations.
- Do not scale rewards directly with hours worked or number of consecutive days.
- Do not award task completion from timer duration, AI output, or mini-game completion alone.

### World response

- Mental overload creates fog around the Library.
- Time pressure speeds the Clock Tower, clouds, and ambient movement.
- Errand pressure stacks parcels around the Market.
- Social pressure changes Café activity without assuming that more or less social contact is universally better.
- Low energy softens lighting, reduces simultaneous prompts, and increases resident support.
- Improved balance adds residents, wildlife and environmental activity.
- Completing real checkpoints restores activity in the relevant district; deliberate recovery adds calm environmental details.
- The town never deteriorates or removes earned progress.

### Residents

Create five recurring guardians with functional specialties defined by the Pace Session engine. Dialogue remains short and contextual, but each guardian must offer a distinct action rather than merely narrating a score.

### Purpose-linked interactions

- Task-to-checkpoint path building.
- Optional focus timer attached to a checkpoint.
- Contextual **I am stuck** assistance.
- Task-sorting and rebalance interaction.
- Five short regulation mini-games available at meaningful transitions.
- Saved partial-progress and next-action ritual.
- Optional photo verification.
- Town customization mode.

Do not add unrelated arcade mini-games or competitive wellbeing leaderboards.

---

## 14. Recovery and Regulation Activity Specifications

Recovery is offered through two equal paths: short digital mini-games and IRL micro-quests. The student chooses based on location, mobility, weather, privacy, time, and current capacity. Neither path receives better rewards or is treated as more legitimate.

The five mini-games are short, replayable regulation activities. IRL quests encourage actions such as going outside, moving away from the desk, preparing something, completing a manageable errand, or making a low-pressure social connection. Both paths support transitions into, through, and out of real work. They are not clinical treatments, proof of recovery, or replacements for changing an unsafe workload.

### Activity choice

When recovery is recommended, present one digital and one IRL option when both are contextually suitable:

> “Would you rather pause here with Gentle Ripples, or step outside for a short reset?”

- **Do something here** opens a digital mini-game.
- **Do something away from the screen** starts an IRL micro-quest.
- **Choose another** shows alternatives without penalty.
- **Not now** returns to the previous decision point.
- Never assume outdoor access, safe weather, privacy, mobility, or available materials.

### Shared interaction contract

- Typical duration: 45–120 seconds, with no minimum required duration.
- Entry points: Calm Corner, guardian suggestion, pre-session preparation, mid-session pause, post-session wind-down, or a standalone choice.
- Exit is always available; leaving early does not fail the activity or remove rewards.
- Completion uses participation or a gentle final interaction, never speed, precision, score, or comparison.
- Audio starts muted and every audio cue has an equivalent visual cue.
- Reduced-motion mode substitutes fades, light pulses, or static state changes for drifting, expanding, or parallax motion.
- The student may choose **lighter**, **the same**, or **not sure** afterward; this response tunes future suggestions but is not a health score.
- Returning to an active Pace Session restores the same checkpoint, scratchpad, and next-action state.
- Each game can be replaced or hidden in preferences without penalty.

### Firefly Stories — reframe and settle

**Best moment:** uncertainty, discouragement, perfection pressure, or post-session reflection.

**Play:** The student opens Mira's Enchanted Storybook in a quiet Library scene. Fireflies reveal five short illustrated story fragments about rest, uncertainty, loneliness, persistence, or self-kindness. The student follows any firefly, reads or skips a brief reflection, and places one light on the page.

**End:** The page becomes gently illuminated and offers **Return to work**, **Save a thought**, or **Rest here**. There are no wrong paths, reading tests, or required written reflections.

**Accessibility:** Silent visual cues are primary; reduced motion replaces flying paths with appearing lights; all story text is semantic HTML rather than embedded in imagery.

### Chime Drift — slow a pressured transition

**Best moment:** time pressure, context switching, or a rushed start.

**Play:** In Kai's Clock Tower, notes or visual waves arrive at a slow, predictable pace. The student may tap, click, press a key, or simply watch as each wave passes the clock hand. Interaction layers a gentle chime and warm light but does not judge timing accuracy.

**End:** The clock hand settles and Kai offers **Choose one next action**, **Rebalance**, or **Return**.

**Accessibility:** Full visual-wave mode works muted; reduced motion uses discrete light states; input timing windows are deliberately generous and never scored.

### Gentle Ripples — paced sensory pause

**Best moment:** before cognitively demanding work, after an interruption, or during a mid-session pause.

**Play:** At Sol's fountain, the student taps or holds to create expanding ripples, floating petals, fish movement, and slowly opening flowers. An optional breathing circle can guide a comfortable pace, but breath holding and performance targets are never required.

**End:** The water clears and the student chooses **Resume checkpoint**, **Reduce its scope**, or **Continue resting**.

**Accessibility:** The breathing guide can be disabled; reduced motion uses a soft light pulse and static flower-state changes; keyboard, pointer, and touch inputs are equivalent.

### Warm Cup — prepare a transition ritual

**Best moment:** beginning a body-doubling session, taking a planned break, or ending work for the day.

**Play:** At Sky's Café counter, the student chooses a drink base and a small sequence—pour, stir, add an ingredient, and sit by the window. The sequence is unhurried and cannot be ruined. Rain, steam, and quiet company create a brief sensory transition.

**End:** Sky asks whether to **Work together**, **Schedule later**, or **Sit a little longer**. The finished cup can appear beside the next Pace Session as a cosmetic reminder.

**Accessibility:** Every step has a one-action alternative; ingredients are not presented as medical remedies; reduced motion uses static steam frames and crossfades.

### Night Lanterns — externalize and release

**Best moment:** unresolved thoughts, deciding what can wait, or closing a session.

**Play:** At Goh's evening stall, the student chooses a symbol or optional private phrase for a concern, selects a lantern, lights it, and places it in the scene. The concern can be converted into a saved next action, scheduled for later, or released without being stored.

**End:** The lantern joins the night scene and Goh offers **Put it in the Backpack**, **Send it to the Future Mailbox**, or **Leave it here**.

**Accessibility:** High-contrast symbols avoid color-only meaning; text remains optional and private; reduced motion keeps the lantern stationary while its light changes.

### IRL recovery micro-quests

IRL activities are deliberately small and adaptable:

| Need | Digital option | IRL option |
|---|---|---|
| Mental overload | Firefly Stories | Write down one concern or sit somewhere quiet |
| Time pressure | Chime Drift | Take a short screen-free pause |
| Cognitive fatigue | Gentle Ripples | Walk outside, sit outdoors, or notice nearby greenery |
| Difficult transition | Warm Cup | Prepare a real drink and step away from the desk |
| Unresolved thoughts | Night Lanterns | Write the thought down and put it away until later |
| Social pressure | Café interaction | Send a low-pressure message or speak with someone trusted |
| Errand accumulation | Market sorting | Complete one grouped errand route |
| Work setup friction | Backpack inspection | Prepare the physical materials for one checkpoint |

Each quest supports **Done**, **Partly done**, **Changed my mind**, and **Choose another**. Self-confirmation is the default. An optional photo may verify or memorialize the activity, but is never required.

### Detailed IRL quest catalogue

All IRL quests use the same completion baseline:

- **Done:** 20 XP and 15 coins.
- **Partly done:** 10 XP and 8 coins.
- **Changed my mind / Choose another:** no penalty and no loss of existing progress.
- Self-confirmation and photo confirmation grant identical rewards.
- Photo verification checks only the stated visible criteria; it does not confirm location, duration, emotional state, or identity.
- Uncertain or failed verification always allows manual confirmation.
- Never request GPS, continuous camera access, identifiable people, addresses, vehicle plates, private documents, or dangerous positioning.
- Outdoor quests must check the student's stated preference and present an indoor or mobility-compatible alternative. The app does not infer whether weather, time of day, or surroundings are safe.

#### IRL-01 — Pocket of Green

- **Guardian:** Sol.
- **Recommend when:** cognitive fatigue, prolonged screen time, or the student chooses outdoor recovery.
- **Instruction:** Step outside, approach an open window, or move near an indoor plant for 5–10 minutes. Notice one piece of greenery, sky, light, or another calming detail.
- **Optional photo prompt:** Capture the detail itself without people, addresses, or private spaces.
- **Visible verification criteria:** greenery, sky, daylight, plant, or nature-like detail is present; otherwise return **uncertain**, not **fail**, when context is ambiguous.
- **Indoor/access alternative:** Observe an indoor plant, window view, nature image, or a personally calming object from the current position.
- **Keepsake:** Garden plant card, sky postcard, window-light card, or ambient Garden decoration.
- **Return choices:** Resume checkpoint, schedule the next action, recover longer, or return to town.

#### IRL-02 — Look Up, Find the Sky

- **Guardian:** Kai.
- **Recommend when:** time pressure, tunnel vision, or a rushed transition.
- **Instruction:** Move to a safe view of the sky or look through a window for 2–5 minutes. Notice its color, light, or cloud movement without needing to describe it.
- **Optional photo prompt:** Photograph the sky or light while avoiding faces, house numbers, and vehicle plates.
- **Visible verification criteria:** sky, clouds, daylight, sunset, or a window-lit composition.
- **Indoor/access alternative:** Observe changing light, a ceiling projection, or a supplied sky scene.
- **Keepsake:** Weather card, Clock Tower lighting card, or Journal postcard.
- **Return choices:** Choose one next action, open the Rebalance Workshop, or remain paused.

#### IRL-03 — One Gentle Loop

- **Guardian:** Sol.
- **Recommend when:** the student wants movement, has been stationary, or needs a transition between tasks.
- **Instruction:** Take a comfortable 5–10 minute walk or movement loop in a place that already feels safe and accessible. Distance and speed do not matter.
- **Optional photo prompt:** Capture a path, shoe-level view, landmark detail, or destination without photographing strangers.
- **Visible verification criteria:** path, floor route, footwear, outdoor detail, or destination object; never attempt to verify distance or movement speed.
- **Indoor/access alternative:** Move through an indoor route, change rooms, perform comfortable seated movement, or choose Gentle Ripples.
- **Keepsake:** Path-memory tile, stepping stone, campus-route postcard, or Garden decoration.
- **Return choices:** Resume, shorten the checkpoint, choose a low-effort task, or recover longer.

#### IRL-04 — Make the Warm Cup

- **Guardian:** Sky.
- **Recommend when:** beginning a gentle work session, taking a planned break, or transitioning out of work.
- **Instruction:** Prepare a drink you already consider appropriate and safe, then spend a moment away from the work screen. No ingredient is described as a treatment.
- **Optional photo prompt:** Photograph the cup, preparation surface, or steam without including people or private documents.
- **Visible verification criteria:** cup, mug, bottle, drink, or preparation setting.
- **Indoor/access alternative:** Refill water, prepare another familiar drink, or complete the digital Warm Cup activity.
- **Keepsake:** Café shelf cup, table decoration, rain-window postcard, or session-side cosmetic cup.
- **Return choices:** Work together with Sky, schedule later, sit longer, or return to town.

#### IRL-05 — Ready the Space

- **Guardian:** Mira or Goh.
- **Recommend when:** missing materials, setup friction, or an unclear physical starting point.
- **Instruction:** Spend 3–7 minutes placing only the materials needed for the current checkpoint within reach and moving one unrelated distraction aside.
- **Optional photo prompt:** Photograph the prepared workspace only after hiding names, screens, documents, notifications, and identifying details.
- **Visible verification criteria:** study or work materials arranged in a workspace; screens and documents trigger a privacy review instead of automatic processing.
- **Indoor/access alternative:** Create a digital checklist, open the required files, or use the Backpack inspection point.
- **Keepsake:** Library desk decoration, prepared-tool card, Backpack charm, or checkpoint postcard.
- **Return choices:** Start the checkpoint, ask what comes first, or stop after preparation.

#### IRL-06 — One Errand, One Route

- **Guardian:** Goh.
- **Recommend when:** errands are accumulating and one safe grouped route can reduce pressure.
- **Instruction:** Choose one small errand or combine compatible errands on a route the student already intends to take. The quest must not encourage unnecessary travel or spending.
- **Optional photo prompt:** Capture a non-sensitive completion detail such as a reusable bag, purchased item, receipt with all personal/payment details hidden, or destination object.
- **Visible verification criteria:** generic errand object, bag, parcel, or safely redacted receipt; never inspect financial values or identity information.
- **Indoor/access alternative:** Complete an online administrative errand, prepare the items needed, or schedule the route for later.
- **Keepsake:** Market stamp, parcel token, satchel charm, or route postcard.
- **Return choices:** Mark the errand done or partial, group another existing errand, or stop.

#### IRL-07 — Put It Somewhere Safe

- **Guardian:** Goh.
- **Recommend when:** unresolved thoughts are interfering with stopping or switching tasks.
- **Instruction:** Write one concern or next action on paper and place it somewhere intentional for later. The written content never needs to be shown to PaceTown.
- **Optional photo prompt:** Photograph the folded or face-down note, container, or placement—not the written content.
- **Visible verification criteria:** folded paper, notebook cover, envelope, box, or symbolic placement; do not read or extract text.
- **Indoor/access alternative:** Save a private Future Mailbox message or complete Night Lanterns.
- **Keepsake:** Lantern card, sealed-envelope sprite, Future Mailbox postcard, or desk token.
- **Return choices:** End the session, schedule the next action, or rest.

#### IRL-08 — Small Movement Reset

- **Guardian:** Sol.
- **Recommend when:** the student requests movement or a break from one position.
- **Instruction:** Choose 2–5 minutes of comfortable movement that already feels safe: stretch, change posture, roll shoulders, stand, or perform a seated alternative. PaceTown does not prescribe intensity or form.
- **Optional photo prompt:** Photograph a safe non-identifying object associated with the reset, such as shoes, a mat, chair, or open space; never require a body photo.
- **Visible verification criteria:** relevant object or space only; the system does not attempt to judge movement quality.
- **Indoor/access alternative:** Any comfortable posture change, seated motion, or digital Gentle Ripples.
- **Keepsake:** Garden wind-chime card, movement ribbon, shoe/path token, or light-ray decoration.
- **Return choices:** Resume, choose a shorter checkpoint, or recover longer.

#### IRL-09 — Gentle Reach-Out

- **Guardian:** Sky.
- **Recommend when:** the student wants connection and has opted into social suggestions.
- **Instruction:** Send a low-pressure message, reply to someone, or briefly speak with a trusted person. The student chooses the person and content.
- **Optional photo prompt:** Use a symbolic photo such as two cups, a shared place, or an object associated with connection. Never request screenshots, messages, faces, or contact details.
- **Visible verification criteria:** symbolic connection objects only; no analysis of relationships or communication content.
- **Indoor/access alternative:** Draft without sending, schedule a future check-in, write a private note, or choose a Café interaction.
- **Keepsake:** Café table card, paired-cup token, warm-window postcard, or friendship-light decoration.
- **Return choices:** Return to work, remain in the Café, schedule later, or stop.

#### IRL-10 — Notice One Good Detail

- **Guardian:** Mira.
- **Recommend when:** the student wants a very small recovery action without leaving their location.
- **Instruction:** Spend 1–3 minutes noticing one color, texture, object, sound, or patch of light that feels worth remembering. No positive emotion is required.
- **Optional photo prompt:** Capture the chosen non-sensitive detail.
- **Visible verification criteria:** any safe object, texture, light, or scene; semantic matching is intentionally broad.
- **Indoor/access alternative:** Use a supplied scene, describe the detail privately, or skip the activity.
- **Keepsake:** General postcard, palette swatch card, window-light token, or Journal memory tile.
- **Return choices:** Resume, save the memory, choose another recovery action, or stop.

### Hybrid recovery activities

Hybrid activities begin in PaceTown, continue away from the screen, and return to a relevant location:

- Warm Cup can invite the student to prepare a real drink and return for a body-doubling session with Sky.
- Gentle Ripples can lead into a short outdoor reset and return to Sol's Garden.
- Night Lanterns can turn a concern into a physical note, then save its next action in the Future Mailbox.
- An outdoor photo can become a private Recovery Garden postcard or collectible keepsake after the student returns.

The app must preserve the active checkpoint while the student is away and provide **Resume**, **Reschedule**, **Recover longer**, or **Stop here** on return.

### Recommendation logic

Recommendations use the task blocker, pressure category, session placement, recent choices, and explicit preferences:

| Context | Digital suggestion | IRL alternative |
|---|---|---|
| Unclear start or perfection pressure | Firefly Stories or Warm Cup | Write one rough first action or prepare a drink |
| Time pressure or context switching | Chime Drift | Short screen-free pause |
| Mid-session tension or cognitive fatigue | Gentle Ripples | Brief walk, outdoor sit, or movement break |
| Body-doubling preference or gentle start | Warm Cup | Prepare a real drink or low-pressure check-in |
| Unresolved task at session end | Night Lanterns | Write the concern down and put it away |
| Errand pressure | Market sorting | One grouped errand route |

The recommendation is always optional. Frequently skipped activities are offered less often, and the system never infers a diagnosis from preferences or usage.

### Hackathon implementation boundary

Gentle Ripples is the required fully interactive digital mini-game for the vertical slice because it works before, during, and after a Pace Session and has clear muted and reduced-motion variants. One outdoor or away-from-screen IRL quest must also be fully usable through self-confirmation and optional photo capture. The other four mini-games require navigable preview states and documented integration contracts; implement them fully only after the task-to-session loop, Gentle Ripples, and the IRL quest path pass acceptance.

---

## 15. Environments and Pixel-Art Direction

### Visual style

- Detailed modern top-down three-quarter pixel art; never isometric.
- `32 × 32 px` world grid with portrait-faithful `64 × 96 px` hero character cells.
- Cozy proportions and readable silhouettes.
- Consistent perspective, tile scale, palette and lighting rules.
- Crisp nearest-neighbour scaling across devices.
- Layered transparent assets rather than a single flattened illustration.

### Environments

1. **Campus Grove** — the only environment required for the hackathon.
2. **Coastal Commons** — post-core milestone unlock.
3. **Night Market** — post-core milestone unlock.

All environments share progression and data. Switching environments never resets the town.

Campus Grove contains the Library, Clock Tower, Garden, Café, Market, Home, Town Hall, Post Office, Guardian Council plaza, Recovery Garden, Future Mailbox, Calm Corner, and Rebalance Workshop. These can be visually compact interaction zones rather than separate large maps.

### Asset production order

1. Follow `assets/PACETOWN_ASSET_COMPLETION_CHECKLIST.md` as the authoritative visual specification.
2. Configure nearest-neighbour rendering and assemble Campus Grove from approved third-party sources.
3. Convert the portrait-faithful v3 character bases into the required animation sheets.
4. Produce only the interactive objects and mini-game foregrounds required by the vertical slice.
5. Validate character scale, interaction states, accessibility labels, and reduced motion in the browser.
6. Add cosmetics, secondary districts, Coastal Commons, and Night Market only after the core Pace Session works.

### Motion

- Scripted avatar travel.
- Swaying trees, water movement, smoke and ambient residents.
- Building activation and upgrade celebrations.
- Day/night and weather transitions.
- Optional environment audio and subtle effects.
- Reduced-motion mode replaces travel and large transitions with simple fades.

---

## 16. AI and Local Fallback Contracts

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

### Work guidance

```ts
interface WorkGuideRequest {
  task: Task;
  assignmentText?: string;
  blocker?: BlockerKind;
  availableMinutes?: number;
  requestedHelp: "plan" | "explain" | "brainstorm" | "review" | "debug" | "next_step";
}

interface WorkGuideResult {
  summary: string;
  deliverables: string[];
  suggestedCheckpoints: Array<Pick<Checkpoint, "title" | "definitionOfDone" | "estimatedMinutes">>;
  assumptions: string[];
  questions: string[];
  confidence: number;
  source: "local" | "ai";
}
```

AI guidance is a proposal, never an automatic task mutation or claim of correctness. The student reviews checkpoints before saving them. Local mode provides blocker-specific templates, manual checkpoint editing, timer support, and saved next actions, so Pace Sessions remain useful without an AI provider.

### Calendar import and synchronization

```ts
interface CalendarImportResult {
  events: Array<{
    externalEventId: string;
    title: string;
    start: string;
    end: string;
    calendarName: string;
  }>;
  conflicts: string[];
  source: "seeded" | "google";
}
```

Imported events remain a review queue until the student confirms which calendars and events affect capacity. Calendar sync never changes flexible work silently. Local mode uses seeded events and exercises the same ready, syncing, complete, denied, expired, conflict, and offline UI contract as a later Google adapter.

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

### Pace Keepsake generation

```ts
interface KeepsakeGenerationRequest {
  recoveryActivitySessionId: string;
  sanitizedImageRef: string;
  category: PaceKeepsake["category"];
  photoHandling: PhotoHandlingChoice;
  preservePeople: boolean;
}

interface KeepsakeGenerationResult {
  status: "generated" | "local_fallback" | "needs_review" | "failed";
  generatedImageRef?: string;
  suggestedPlacements: PaceKeepsake["placement"][];
  privacyWarnings: string[];
  source: "local_filter" | "ai_generated" | "symbolic_fallback";
}
```

Before external generation, remove location metadata and warn about faces, documents, screens, addresses, or identifiable locations. Default to cropping people out or converting them into anonymous silhouettes; preserving identifiable people requires a separate explicit choice.

The generation prompt must apply the canonical `32 px` grid, hard pixel clusters, dark-navy outlines, PaceTown palette, simplified composition, and no embedded text, logos, or invented people. Outputs require a student preview before entering the collection or town.

If image generation is unavailable or declined, offer a deterministic local pixelation and palette-reduction filter, a symbolic quest-category keepsake, or a pre-made postcard frame. Generation failure never reverses quest completion or rewards.

---

## 17. Local Data Architecture

Use IndexedDB repositories behind interfaces so production services can replace them later.

### Stores

```text
users
auth_sessions
preferences
tasks
work_plans
checkpoints
pace_sessions
session_messages
regulation_sessions
recovery_activity_sessions
check_ins
quests
quest_history
journal_entries
inventory
purchases
town_progress
environment_state
photos
keepsakes
keepsake_jobs
calendar_connections
calendar_events
```

### Required adapters

```ts
interface AuthAdapter {}
interface DataRepository<T> {}
interface TaskParserAdapter {}
interface WorkGuideAdapter {}
interface PhotoVerifierAdapter {}
interface KeepsakeGeneratorAdapter {}
interface AssetRepository {}
interface CalendarAdapter {}
```

The UI and domain engines must not directly depend on IndexedDB, Supabase or a specific AI provider.

---

## 18. Accessibility, Privacy and Safety

- Semantic buttons, dialogs, forms and landmarks.
- Full keyboard access.
- Town List mirrors all spatial interactions.
- Status uses text and icons in addition to colour.
- Large touch targets and mobile-safe panels.
- High-contrast option.
- Reduced-motion support.
- Audio is muted until enabled.
- Quest photos are optional and private.
- Self-confirmation and photo confirmation receive equivalent rewards.
- Strip EXIF and location metadata before verification, storage, or external generation.
- Show warnings and crop/redaction controls for faces, documents, screens, addresses, and identifiable locations.
- Treat verification, original-photo retention, keepsake generation, and generated-art placement as separate consent decisions.
- Delete temporary image inputs after the selected flow completes; retain originals only under **Save both privately**.
- Generated keepsakes remain private unless a future sharing feature obtains separate explicit consent.
- No public wellbeing scores or social comparison.
- No medical claims, diagnosis or crisis assessment.
- Recovery suggestions come from reviewed templates.
- Students may skip check-ins and replace quests.
- Assignment briefs, session notes, and assistant conversations remain private local data by default.
- Students can use Pace Sessions without uploading assignment content.
- AI suggestions expose assumptions and remain editable; generated output never silently becomes submitted work.
- The interface must never imply that time spent, a mini-game result, or an AI response proves that academic work is complete.
- Local data can be exported, reset or deleted.

When the user is overloaded, reduce the number of simultaneous prompts and foreground one recommended next action.

---

## 19. Responsive Behavior

### Desktop

- Central top-down three-quarter town.
- Persistent summary rail and quest panel.
- Contextual task, checkpoint, and Pace Session panel.

### Mobile

- Town occupies the upper interactive viewport.
- Swipeable bottom sheet contains the current task, checkpoint, session controls, and building details.
- Bottom navigation provides Town, Planner, Journal, Shop and Profile.
- Tap-to-focus replaces unrestricted panning.
- Town List is available from the same navigation.
- Guided sessions remain usable with the town animation hidden so the work area has adequate space.

The complete primary flow must work at approximately 390 px width without horizontal page scrolling.

---

## 20. Local Development Phases

### Phase 1 — Foundation

- Scaffold React, TypeScript and Vite.
- Add routing, design tokens, IndexedDB repositories and test setup.
- Implement the demo seed and a minimal local session; full account flows may follow the vertical slice.

### Phase 2 — Domain engines

- Implement tasks, work plans, checkpoints, Pace Sessions, recovery activities, Pace Keepsakes, workload calculation, quest generation, and rebalancing.
- Write unit tests before connecting the UI.

### Phase 3 — Core guided-work vertical slice

- Build task intake, blocker selection, editable checkpoint generation, the guided session workspace, saved partial progress, and the continue/reschedule/recover ending.
- Implement deterministic local work-guidance templates before connecting an AI provider.

### Phase 4 — Town and regulation shell

- Build town camera, location interactions, avatar travel and building panels.
- Connect district pressure effects, guardian specialties, one polished regulation mini-game, one IRL recovery quest, optional photo capture, one Keepsake placement, quests, XP, and one visible town upgrade.

### Phase 5 — Planning and supporting flows

- Build onboarding, planner, check-in, forecast, AI task parsing, rebalance approval, journal, optional photo verification, AI keepsake generation, and deterministic keepsake fallbacks.
- Add the remaining regulation mini-games only after the full task-to-session loop works.

### Phase 6 — Accessibility and resilience

- Add Town List, keyboard behavior, reduced motion, offline support and error/fallback states.
- Verify Pace Sessions work without AI, animation, audio, assignment uploads, or a precise timer.

### Phase 7 — Verification and polish

- Run automated tests.
- Test desktop and mobile in one bounded visual pass.
- Fix functional, accessibility and responsive defects.
- Re-run one final confirmation pass.
- Add cosmetics, shop depth, and secondary environments only if the core acceptance criteria already pass.

---

## 21. Four-Person Team Split

| Role | Primary responsibility |
|---|---|
| Product and Session UI | Application shell, guided workspace, responsive flows, and accessibility |
| Game and Art | Town renderer, pressure feedback, guardian interactions, and regulation mini-game |
| Domain Logic | Work plans, sessions, workload, rebalancing, quests, progression, and tests |
| Data and AI | IndexedDB, task/brief parsing, work guidance, local fallbacks, and adapters |

Integrate continuously around the shared demo flow rather than building isolated pages until the end.

---

## 22. Testing Plan

### Unit tests

- Workload weights and threshold boundaries.
- Fixed commitment capacity reduction.
- Rebalancing deadline and flexibility constraints.
- Blocker-to-guidance mapping and checkpoint validation.
- Pace Session partial, completed, blocked, and rescheduled outcomes.
- Saved next-action behavior.
- Mini-game entry placement, early exit, completion, response, reduced-motion, and muted-audio behavior.
- Regulation recommendation preferences and skip-frequency rules.
- IRL quest Done, Partly done, Changed my mind, and Choose another outcomes.
- Catalogue validation requiring every IRL quest to define guardian, trigger, instruction, duration, optional photo prompt, visible verification criteria, indoor/access alternative, Keepsake mapping, and return choices.
- Recommendation filtering that never assumes safe weather, outdoor access, mobility, privacy, or materials.
- Reward parity between self-confirmation and photo confirmation.
- Photo-handling transitions for verify/discard, keepsake/discard, save both, and cancel.
- Keepsake generation, fallback, placement, and deletion rules.
- Quest selection and replacement rules.
- Reward rules that prevent timer-only or mini-game-only academic completion.
- Task-parser, work-guide, and photo-verification result contracts.

### Integration tests

- Local account and demo session persistence.
- Task entry through manual and parsed flows.
- Assignment-brief intake through manual, local-fallback, and AI-guided flows.
- Work-plan review, checkpoint selection, session completion, and session resumption.
- Mid-session regulation returning to the same checkpoint.
- Gentle Ripples returning through resume, reduce-scope, and continue-resting paths.
- Quiet Mode, Calm Corner, Future Mailbox, and Exit Quest state changes.
- IRL quest self-confirmation without camera permission.
- Verify-and-discard removing the temporary input after processing.
- Keepsake generation remaining independent from quest verification.
- AI generation failure falling back without reversing quest completion or rewards.
- Rebalance preview, rejection and approval.
- Quest completion updating journal and town state.
- Refresh restoring all persisted state.

### End-to-end tests

- New-user onboarding to first town visit.
- Seeded demo overload-to-guided-work-to-recovery story.
- Student completes or partially completes a real checkpoint and sees a saved next action.
- Mobile navigation and bottom-sheet interactions.
- Keyboard-only Town List journey.
- Reduced-motion and muted-audio behavior.
- Mini-game keyboard, touch, pointer, and early-exit paths.
- Optional photo-to-keepsake flow with metadata removal, preview, placement, and deletion.
- Offline reload of previously visited application shell.

---

## 23. Local Acceptance Criteria

The first build is complete when:

- A user can enter the seeded demo immediately; local account and onboarding flows remain editable supporting features.
- Natural-language input becomes editable task suggestions.
- Workload recalculates and explains its result.
- Rebalancing returns valid proposals and applies only approved changes.
- A student can describe or skip a blocker and receive an editable work plan.
- A student can select a concrete checkpoint with a definition of done.
- A Pace Session supports contextual help, optional timing, partial progress, stopping, and rescheduling.
- The completed session saves a progress note and the next starting action.
- At least one regulation mini-game works before, during, and after a Pace Session without grades or failure states.
- Gentle Ripples supports muted, reduced-motion, keyboard, pointer, touch, early-exit, and return-to-session flows.
- Firefly Stories, Chime Drift, Warm Cup, and Night Lanterns have navigable preview states and defined return paths for the hackathon.
- **Pocket of Green** is fully implemented with outdoor, window, indoor-plant, nature-image, self-confirmation, optional-photo, Partly done, Changed my mind, and camera-denied paths.
- A student can convert an optional sanitized photo into a reviewed PaceTown-styled keepsake, discard the original, and place the result in the private Collection or Recovery Garden.
- The local symbolic/pixel-filter fallback completes the same collection flow when AI generation is unavailable.
- Photo use never increases XP, coins, rarity, or progression compared with self-confirmation.
- The Backpack, Load Weather, Guardian Council, Rebalance Workshop, Recovery Garden, Future Mailbox, Calm Corner, Quiet Mode, and Exit Quest each appear in the Town or Town List with their core action available.
- The system never marks academic work complete from elapsed time, AI output, or mini-game completion alone.
- Up to three suitable daily quests appear and can be replaced; only one is foregrounded under high pressure.
- XP, coins, and at least one visible town upgrade persist after refresh.
- Journal entries are created from meaningful events.
- The town and Town List expose the same core functions.
- Desktop and mobile layouts complete the main journey.
- Reduced-motion, high-contrast and audio settings work.
- Automated session, workload, guidance-fallback, and persistence tests pass.
- The application runs locally without mandatory cloud or AI services.

---

## 24. Demo Scenario

Use a fictional student named **Aina** while maintaining a general-university-student product position.

### Initial state

- **Mental:** Aina has not started a cognitively demanding database assignment because she does not know where to begin.
- **Time:** Lectures, a part-time shift, and the approaching assignment deadline leave little flexible capacity.
- **Physical:** A long commute and low self-reported energy reduce what is realistic today.
- **Social:** A fixed club commitment occupies part of Thursday evening.
- **Errands:** Groceries and an administrative form remain unfinished.
- Thursday begins at 108% projected load.
- Library fog, a faster Clock Tower, softer Garden cues, Café activity, and Market parcels communicate the five contributing areas without damaging the town.

### Demonstration

1. Enter a natural-language schedule containing mental, time, physical, social, and errand demands.
2. Review and save the parsed commitments.
3. Show Thursday's 108% load through the five affected districts, Backpack objects, and a concise contributor explanation.
4. Ask Kai to move the flexible administrative form while lectures, the shift, club meeting, and deadline remain locked.
5. Show the Backpack becoming slightly lighter and Thursday moving toward a safer level.
6. Choose the database assignment that remains and identify **I do not know where to begin** as the blocker.
7. Paste or use the seeded assignment brief; review its extracted deliverables and editable checkpoints.
8. Select **Identify the entities and relationships** as a 20-minute checkpoint.
9. Start a Pace Session with Mira, ask one contextual question, and record partial progress on the ERD.
10. Save **Add the enrolment junction entity** as the next starting action.
11. Use Gentle Ripples as a short transition and choose to reschedule rather than continue immediately.
12. Accept Sol's **Pocket of Green** quest and show its outdoor, open-window, indoor-plant, and digital alternatives plus equal self-confirmation and photo-confirmation choices.
13. Use a seeded Pocket of Green photo to demonstrate **Create keepsake and discard original**; show metadata removal, privacy review, a generated pixel-art Recovery Garden card, and the approval screen.
14. Place the keepsake in the private Recovery Garden collection without granting extra rewards for the photo.
15. Receive sustainable-progress rewards and show the Library clearing, the Backpack lightening, and one Recovery Garden plant growing.
16. Open the Journal to show the rebalanced load, real work performed, recovery choice, keepsake, original-photo deletion state, and next action ready for the next session.

---

## 25. Judging-Rubric Alignment

### Ideation

- Produce a problem tree, product mind map and end-to-end user flow.
- Document rejected alternatives and the reasons for the town-first direction.
- Record mentor feedback and resulting changes.

### Creativity

- Emphasize the distinction: PaceTown gamifies sustainable pacing rather than greater output.
- Demonstrate how the town is navigation, pressure feedback, a guided workspace, and a place to regulate—not decorative gamification.
- Show that the product bridges the gap between knowing a schedule is overloaded and being able to start the work.

### Feasibility

- Show the locally running PWA, deterministic workload/session engines, local guidance fallback, adapters, and automated tests.
- Explain the staged asset pipeline and provider-independent AI contracts.

### Design

- Demonstrate the complete flow in both the pixel-art town and accessible Town List.
- Show mobile responsiveness, reduced motion and non-colour status communication.

### Impact

- Use Aina's before-and-after story to show both a safer plan and tangible progress on the assignment that was causing pressure.
- Explicitly show that PaceTown recognizes mental, time, physical, social, and errand demands before recommending rebalancing, guided work, or recovery.
- Include one real-world outdoor or protected-rest option so recovery is not represented only by an on-screen mini-game.
- Explain how the architecture can later support campuses and additional recovery libraries without changing the core model.

---

## 26. Post-Local Roadmap

Only after local acceptance:

1. Add Supabase authentication, database and private image storage.
2. Connect one configured language-and-vision provider.
3. Add richer document/rubric intake and institution-configurable academic-integrity guidance.
4. Add the remaining mini-games, shop depth, Coastal Commons, and Night Market.
5. Deploy the web application to Vercel.
6. Validate the hosted build on a real mobile device.
7. Package the stable PWA for Android using Capacitor.
8. Add production monitoring, rate limits and data-retention controls.

This roadmap does not remove features from the local build; it replaces local adapters with production services.
