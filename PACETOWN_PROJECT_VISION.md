# PaceTown — Project Vision

> **Find your pace. Grow your place.**

Visual companion: [`PACETOWN_VISION_MERMAID.md`](PACETOWN_VISION_MERMAID.md)

## 1. Vision

PaceTown is a cozy pixel-art guided-work and recovery game for university students. It helps a student move from:

> “There is too much to do, I feel overwhelmed, and I do not know where to begin.”

to:

> “I understand what is creating pressure, I have one manageable next action, I can get help while doing it, and I can stop or recover without losing progress.”

PaceTown is not a productivity dashboard decorated with game art. It is a playable support environment where planning, working, getting unstuck, regulating pressure, and recovering are all part of one continuous experience.

The student's real responsibilities become objects, paths, weather, quests, and changes within a personal town. Supportive guardians help the student understand work, choose a realistic action, work through it, and preserve context for the next session. Short regulation mini-games help the student settle before work, pause when stuck, transition between demands, or close a difficult session.

The goal is not to make students constantly productive. The goal is to help them maintain a sustainable pace while making meaningful progress on what matters.

## 2. The problem PaceTown addresses

University stress is rarely caused by a single assignment. It often comes from accumulated demands:

- Classes, deadlines, revision, and group projects.
- Employment, commuting, clubs, appointments, and errands.
- Unclear instructions or work that feels too large to start.
- Difficulty estimating how long work will take.
- Context switching and competing priorities.
- Low energy, insufficient recovery, or social pressure.
- Losing track of where to resume after an interrupted session.

Traditional planners can show the work but may not help a student begin it. Focus timers can measure time but may not clarify what to do. Relaxation games can provide a break but may leave the underlying responsibility untouched. General AI assistants can help produce content but may ignore capacity, scheduling pressure, continuity, and the student's need to remain in control.

PaceTown connects these missing pieces.

The product hierarchy is deliberately broader than assignment assistance:

```text
Understand total load
→ reduce what can be reduced
→ get help handling what remains
→ recover intentionally
```

Guided work is one response within the stress-and-workload system. PaceTown must never be pitched primarily as “upload an assignment and let AI help complete it.”

## 3. Product promise

PaceTown helps students:

1. **See pressure clearly** without turning it into a diagnosis.
2. **Reduce avoidable pressure** through explainable, consent-based rebalancing.
3. **Choose one manageable action** instead of facing the entire workload at once.
4. **Get practical help while working** through planning, explanation, brainstorming, review, debugging, or quiet accompaniment.
5. **Regulate pressure when needed** through short, non-competitive mini-games.
6. **Preserve partial progress** and return through a clear next action.
7. **Build a comforting town** through sustainable choices rather than relentless output.

When recovery is the safest practical next action, PaceTown foregrounds recovery while preserving the student's choices to continue, shorten the task, reschedule, choose a different response, or decline.

## 4. What PaceTown is not

PaceTown is not:

- A medical, therapy, burnout-diagnosis, or crisis-assessment product.
- A leaderboard for wellbeing, productivity, focus time, or completed assignments.
- A system that automatically rearranges a student's life.
- A streak app that punishes absence.
- A generic chatbot placed beside a calendar.
- A collection of unrelated arcade games.
- A tool that marks academic work complete because a timer ended or AI generated an answer.
- A replacement for professional, institutional, academic, or personal support.

## 5. Audience

The primary audience is general university students, including students balancing:

- Classes and independent study.
- Assignments, examinations, and projects.
- Part-time work and commuting.
- Clubs and social commitments.
- Household, administrative, and personal errands.
- Different energy levels, access needs, and preferred ways of recovering.

The system does not assume that every student has the same capacity, schedule, social needs, mobility, or response to a recovery activity.

## 6. The complete experience loop

```text
Enter or import mental, time, physical, social,
and errand commitments
        ↓
See explainable Daily Load through the town and planner
        ↓
Choose or edit the recommended response
        ↓
Make space by rebalancing
        OR
Get help handling one responsibility
        OR
Recover before deciding what comes next
        ↓
If working: identify the blocker, review one checkpoint,
and work alongside a guardian
        ↓
If recovering: use an in-app activity or choose a real-world action
        ↓
Complete, make partial progress, recover, identify a blocker,
or reschedule realistically
        ↓
Save what changed and the easiest next action
        ↓
Continue, recover, or stop intentionally
        ↓
Grow a calmer and more active town
```

Every piece of information should lead to an action. A chart may explain pressure, but the town must help the student respond to it.

## 7. Six connected product pillars

### 7.1 Understand

PaceTown calculates Daily Load from time, priority, mental effort, urgency, fixed commitments, and personalized available capacity. It explains the result in plain language and names the largest contributors.

The result is schedule guidance, not a judgment about how stressed or capable the student ought to feel.

### 7.2 Make space

The Rebalance Workshop proposes safer placements for flexible work while respecting fixed events, deadlines, availability, and minimum useful session lengths. Every move remains a preview until the student explicitly approves it.

### 7.3 Do the work

Guided Pace Sessions turn a real task into one visible checkpoint. The student can work with a guardian, use contextual help, record partial progress, and leave with a saved next action.

### 7.4 Regulate

Five short mini-games support preparation, mid-session pauses, transitions, and closure. They contain no high score, accuracy judgment, failure state, or competitive comparison.

### 7.5 Reflect and return

The Journal, Future Mailbox, and saved session context ensure the student does not need to reconstruct everything after a break. Reflection is optional and concise.

### 7.6 Grow

Real progress, asking for help, intentional recovery, realistic rescheduling, and healthy stopping contribute to a persistent town. Growth never decays because the student was absent.

## 8. Daily Load and Town Pace

PaceTown separates demands from protective resources.

### Demand areas

| Area | Meaning | Town expression |
|---|---|---|
| Time | Scheduled and estimated time pressure | Clock Tower speed, wind, and cloud movement |
| Mental | Cognitive effort from study and complex work | Library fog and drifting pages |
| Physical | Physically demanding commitments and movement needs | Avatar pacing, shade, and Garden cues |
| Social | Commitments and desired connection | Café activity and soundscape |
| Errands | Administrative and practical responsibilities | Market parcels and busy paths |

### Protective resources

| Resource | Meaning |
|---|---|
| Energy | Optional self-reported capacity for the current day |
| Recovery | Rest, sleep, and restorative actions |

### Display language

- **Daily Load** describes weighted schedule demand and may exceed 100%.
- **Town Pace** summarizes capacity, recovery, and imbalance.
- **Energy** is optional self-reporting, not diagnosis.
- **Load Weather** communicates the categories spatially and visually.
- Every effect also has a text and icon representation.

Suggested load bands are Open below 60%, Steady at 60–80%, Heavy at 81–95%, Overloaded at 96–110%, and Unsustainable Schedule above 110%.

The deterministic starting calculation is:

```text
Weighted Demand
= Estimated Minutes × Priority Weight × Mental-Effort Weight × Urgency Weight

Daily Load Percentage
= Total Weighted Demand ÷ Personalized Available Minutes × 100
```

Suggested weights are 0.80/1.00/1.25 for low/medium/high priority, 0.85/1.00/1.20 for low/medium/high mental effort, and 1.30/1.15/1.00 for due today/due tomorrow/later. Fixed commitments reduce available minutes directly. Optional energy input adjusts guidance within a bounded range but never hides the raw time calculation.

Rebalancing minimizes the highest daily load and avoids excessive context switching. It never moves fixed commitments, crosses deadlines, ignores availability, or splits work below its useful minimum session. Lower-priority flexible work moves before urgent high-priority work, and every proposal includes before-and-after values plus explicit approval.

The town never becomes damaged, frightening, or permanently degraded. Pressure changes atmosphere and activity; it does not punish the student.

## 9. Guided Pace Sessions

A Pace Session is the central guided-work mechanic and the bridge between planning and meaningful progress. It is one of three primary responses—make space, handle what remains, or recover—and must not eclipse the broader stress-and-workload experience.

### Preparing a session

The student:

1. Chooses one real task.
2. Selects why it is difficult, or skips the question.
3. Reviews an editable work plan.
4. Chooses one checkpoint with a clear definition of done.
5. Selects a guardian and optional timebox.
6. Starts directly or regulates first.

### Recognized blockers

| Blocker | PaceTown response |
|---|---|
| I do not know where to begin | Identify the smallest observable first action |
| The task is too large | Reduce or divide the checkpoint |
| I do not understand something | Identify the exact concept and offer explanation or practice |
| I am missing materials or information | Create a short gathering checklist |
| I have low capacity | Offer a smaller action, later slot, or recovery first |
| I am worried it will not be good enough | Define a deliberately rough first version |
| Something else | Allow description or manual planning without interpretation |

### Working together

The focused interface shows:

- One current checkpoint.
- Its definition of done.
- The next physical or digital action.
- An optional count-up or count-down timer.
- A small scratchpad for notes, links, excerpts, and questions.
- Guardian help modes: Plan, Explain, Brainstorm, Review, Debug, and What next?
- Persistent actions for I am stuck, Reduce the scope, Pause and regulate, Save and leave, Reschedule, and Stop here.

The guardian stays available without flooding the student with prompts. The work area suppresses unrelated town animation, rewards, quests, and shop messaging.

### Ending and resuming

A session can end as completed, partial, blocked, or rescheduled. Each is a valid outcome.

The student records:

- What changed.
- What remains.
- The easiest next starting action.

On return, PaceTown shows only the last checkpoint, recorded progress, and saved next action. It does not lead with missed days, overdue shame, streak loss, or a long history.

## 10. Guardians as functional companions

The guardians are not mascots that repeat dashboard values. Each changes what the student can do.

### Mira — Understand

Mira is the adult neko-maid Library guardian. She helps interpret briefs, organize research, explain concepts, build study checkpoints, quiz understanding, and reframe perfection pressure. Her visual identity uses dark hair, glasses, cat ears and tail, a modest navy-and-cream librarian uniform, teal ribbon, bell, and book satchel.

### Kai — Plan

Kai keeps the Clock Tower. He helps select priorities, estimate time, build session boundaries, forecast load, and rebalance flexible work. His key object is the Musical Clock.

### Sol — Sustain

Sol cares for the Garden. He helps reduce scope, notice fatigue without diagnosing it, protect breaks, choose low-effort actions, and return from regulation activities.

### Sky — Accompany

Sky is the Café guardian. He provides quiet body-doubling-style presence, gentle check-ins, low-pressure encouragement, and social-connection quests. His identity is locked to the supplied reference: center-parted black hair, round glasses, dusty-rose cardigan, cream shirt, and sky-blue apron.

### Goh — Complete

Goh manages the Market. He helps gather materials, group errands, track submission requirements, perform final checks, and close loose ends without turning everything into another urgent demand.

### Player identity

The default student avatar has warm medium-brown skin, short tousled burgundy hair, a sage overshirt, cream T-shirt, plum backpack, and gold pins. The final system should support inclusive customization without changing workload capacity or rewards.

### Supporting identity locks

- Kai has side-swept chestnut hair, a cream rolled-sleeve shirt, amber waistcoat, dark tie, and brass pocket chain.
- Sol has warm deep-brown skin, short natural curls, a cream shirt, olive gardening overalls, amber neckerchief, and leaf pin.
- Goh has warm medium skin, tidy black hair, a rust-red campus jacket, cream shirt, dark trousers, olive messenger strap, and clipboard satchel.

### Guardian Council

When several pressures compete, the Council provides one short interpretation from each relevant guardian and foregrounds one recommendation:

- Do one checkpoint.
- Make space.
- Recover first.
- Gather what is missing.
- Choose for myself.

The Council proposes; the student decides.

## 11. Digital and IRL recovery activities

Recovery is offered through two equal paths: digital mini-games and IRL micro-quests. The student chooses based on location, mobility, weather, privacy, time, and capacity. Neither path receives better rewards or is treated as more legitimate.

When both are suitable, PaceTown presents one of each:

> “Would you rather pause here with Gentle Ripples, or step outside for a short reset?”

Digital activities can appear before work, when stuck, between unrelated tasks, after a session, or as a standalone choice in the Calm Corner. IRL activities help the student step away from the screen, move, prepare something, complete a small errand, spend time outside, or connect with someone.

Shared rules:

- Typical duration is 45–120 seconds, with no required minimum.
- The student may leave at any time without failure.
- Participation, not performance, completes the interaction.
- Audio begins muted and has visual equivalents.
- Reduced-motion alternatives replace drifting or expanding motion.
- The optional response is Lighter, The same, or Not sure.
- The response personalizes suggestions but is never interpreted as a health score.
- Returning to work restores the same checkpoint and notes.
- Self-confirmation and optional photo confirmation receive equal rewards.

### Firefly Stories

Mira opens an enchanted book in a quiet Library scene. Fireflies reveal short illustrated fragments about rest, uncertainty, loneliness, persistence, and self-kindness. The student follows any light, reads or skips the reflection, and places one glow on the page.

It ends with Return to work, Save a thought, or Rest here. There are no comprehension tests or required reflections.

### Chime Drift

Kai's Clock Tower presents slow notes or visual waves. The student may tap, press a key, click, or simply watch as each passes the clock hand. Interaction layers soft sound and light without scoring timing accuracy.

It ends with Choose one next action, Rebalance, or Return.

### Gentle Ripples

At Sol's fountain, taps or holds create ripples, petals, fish movement, and opening flowers. An optional breathing circle offers a comfortable pace but never requires breath holding or matching.

It ends with Resume checkpoint, Reduce its scope, or Continue resting. This is the fully interactive mini-game required for the hackathon vertical slice.

### Warm Cup

At Sky's Café, the student chooses a drink base, pours, stirs, adds an ingredient, and sits by the window. The ritual cannot be ruined. Ingredients are sensory and cosmetic, never presented as medical remedies.

It ends with Work together, Schedule later, or Sit a little longer.

### Night Lanterns

At Goh's stall, the student chooses a symbol or optional private phrase for a concern, selects a lantern, lights it, and places it in the evening scene. The concern may become a saved next action, move to the Future Mailbox, or be released without storage.

It ends with Put it in the Backpack, Send it to the Future Mailbox, or Leave it here.

### IRL micro-quests

| Need | Digital option | IRL option |
|---|---|---|
| Mental overload | Firefly Stories | Write down one concern or sit somewhere quiet |
| Time pressure | Chime Drift | Take a short screen-free pause |
| Cognitive fatigue | Gentle Ripples | Walk outside, sit outdoors, or notice nearby greenery |
| Difficult transition | Warm Cup | Prepare a real drink and step away from the desk |
| Unresolved thoughts | Night Lanterns | Write the thought down and put it away |
| Social pressure | Café interaction | Send a low-pressure message or speak with someone trusted |
| Errand accumulation | Market sorting | Complete one grouped errand route |
| Work setup friction | Backpack inspection | Prepare the materials for one checkpoint |

Each IRL quest offers Done, Partly done, Changed my mind, and Choose another. Outdoor access is never assumed, and every outdoor activity has an indoor, mobility-compatible, or digital alternative.

The initial named quest catalogue is:

| Quest | Guardian | Duration | Optional photo | Keepsake examples |
|---|---|---:|---|---|
| Pocket of Green | Sol | 5–10 min | Greenery, sky, window light, or calming detail | Plant card, sky postcard, Garden decoration |
| Look Up, Find the Sky | Kai | 2–5 min | Sky, clouds, sunset, or window-lit scene | Weather card, Clock Tower lighting card |
| One Gentle Loop | Sol | 5–10 min | Path, footwear, landmark detail, or destination object | Path tile, stepping stone, route postcard |
| Make the Warm Cup | Sky | 5–10 min | Cup, drink, steam, or preparation surface | Café cup, table decoration, rain-window postcard |
| Ready the Space | Mira or Goh | 3–7 min | Privacy-reviewed study materials or workspace | Library desk item, Backpack charm |
| One Errand, One Route | Goh | Flexible | Bag, parcel, redacted receipt, or destination detail | Market stamp, parcel token, route postcard |
| Put It Somewhere Safe | Goh | 2–5 min | Folded or face-down note, envelope, or container | Lantern card, envelope sprite, Mailbox postcard |
| Small Movement Reset | Sol | 2–5 min | Shoes, mat, chair, or safe open space; never a required body photo | Movement ribbon, path token, light-ray decoration |
| Gentle Reach-Out | Sky | Flexible | Symbolic connection object; never messages, faces, or contact details | Paired-cup token, warm-window postcard |
| Notice One Good Detail | Mira | 1–3 min | Safe object, texture, light, color, or scene | Memory tile, palette card, general postcard |

Every quest defines exact instructions, recommendation triggers, visible-only verification criteria, privacy exclusions, indoor/access alternatives, return choices, and Keepsake outputs in the implementation plan. Photo verification never attempts to prove duration, location, emotional state, distance, exercise quality, or identity.

### Hybrid activities

- Warm Cup can begin in the Café, continue while the student prepares a real drink, and return to a session with Sky.
- Gentle Ripples can lead into a short outdoor reset and return to Sol's Garden.
- Night Lanterns can become a physical note that is stored as a next action in the Future Mailbox.
- An optional quest photo can become a private pixel-art keepsake for the Journal, Garden, or town.

## 12. The town as the game interface

Campus Grove is the first and only environment required for the hackathon. It contains compact interaction zones rather than requiring unrestricted exploration.

### Key locations and objects

| Location or object | Purpose |
|---|---|
| Campus entrance | Spawn, orientation, and direct Town List access |
| Library, Story Bench, and Enchanted Storybook | Understanding, studying, Firefly Stories |
| Clock Tower and Musical Clock | Forecasting, sessions, rebalancing, Chime Drift |
| Garden/Gym pavilion and Ripple Fountain | Physical commitments, movement, recovery, scope reduction, Gentle Ripples |
| Café and Tea Counter | Body doubling, social support, Warm Cup |
| Market and Lantern Stall | Errands, completion checks, Night Lanterns |
| Park | Outdoor recovery and optional photo quests |
| Town Hall | Task intake, assignment briefs, work-plan review |
| Rebalance Workshop | Consent-based movement of flexible tasks |
| Guardian Council plaza | One recommendation when pressures compete |
| Home | Energy, sleep, Quiet Mode, and session closure |
| Recovery Garden | Persistent non-destructive growth |
| Future Mailbox | Messages and next actions for a future session |
| Post Office / Journal board | Private timeline and postcards |
| Calm Corner | Direct access to regulation without prerequisites |
| Exit Quest noticeboard | Save progress and stop intentionally |
| Calendar terminal | Optional import and synchronization review |
| Backpack inspection point | Tangible workload inspection |

Selecting a destination moves the avatar along a scripted route, focuses the camera, and opens the relevant activity. Free-roaming movement is not required. Every destination also exists in the semantic Town List.

## 13. Backpack, Load Weather, and Rebalance Workshop

### Backpack

Tasks appear as books, laptops, calendars, clocks, sports bags, cups, invitations, groceries, parcels, laundry, transport passes, work uniforms, appointment cards, or generic task objects.

The Backpack shows workload as something carried, not something the student is. Fixed commitments use locks; flexible work uses ribbons; deadlines use clear indicators. The student can inspect an item, bring it into a Pace Session, move it through rebalancing, or leave it for later.

### Load Weather

Load Weather changes fog, wind, pages, parcels, lighting, clouds, crowds, and ambient movement. It makes pressure visible without depicting damage or danger. Quiet Mode can reduce or remove these effects.

### Rebalance Workshop

Flexible task objects move between valid calendar spaces. Fixed events remain visibly locked. Before-and-after load, deadlines, and affected checkpoints remain visible. The student can accept all, accept selected changes, edit, or reject.

## 14. Quests, real-world actions, and Pace Keepsakes

PaceTown offers up to three daily quests while foregrounding only one recommendation under high pressure:

1. A work-progress or load-management quest.
2. A recovery quest.
3. An optional student-choice quest.

Examples include:

- Complete one named checkpoint.
- Create a rough first version.
- Save a clear next action.
- Move one flexible task.
- Complete a grouped errand route.
- Take ten minutes outside.
- Protect a short no-work period.
- Plan a low-pressure social check-in.

Quests can be replaced or skipped without penalty. Frequently skipped types appear less often.

Photo verification is optional. Local mode may inspect basic image properties, but uncertain or failed results allow manual correction. The student chooses Verify only or Save privately to journal. Production storage must be private and remove location metadata.

### Pace Keepsakes

After an IRL quest, the student may turn a photo into private PaceTown-styled pixel art:

```text
Complete or partially complete an IRL quest
→ self-confirm or optionally verify with a photo
→ choose “Turn into a Keepsake”
→ remove metadata and review privacy warnings
→ generate or locally stylize a pixel-art memory
→ preview it
→ place it in the Collection, Journal, Recovery Garden,
Town, or Future Mailbox
```

Examples include:

- Greenery becoming a Recovery Garden plant card or decoration.
- A warm drink becoming a Café shelf keepsake.
- A sky or outdoor view becoming a weather or postcard memory.
- A walk becoming a path-memory tile.
- Prepared study materials becoming a Library desk keepsake.
- A completed errand becoming a Market stamp.

Photo verification and keepsake generation are separate. A failed or uncertain verification does not block a keepsake, and generated art never proves that a quest was completed.

The student explicitly chooses:

- **Verify and discard** — process the photo for optional verification, then delete it.
- **Create keepsake and discard original** — retain only the generated art.
- **Save both privately** — retain the original and generated version.
- **Cancel** — retain nothing.

Before processing, PaceTown removes location metadata and warns about faces, documents, screens, addresses, and identifiable locations. People are cropped out or converted into anonymous silhouettes by default. Generated results require preview approval before placement.

If AI generation is unavailable or declined, PaceTown offers a deterministic pixelation and palette-reduction filter, a symbolic quest-category keepsake, or a pre-made postcard frame. Generation failure never reverses quest completion or rewards.

## 15. Progression and rewards

PaceTown rewards sustainable behaviors:

- Beginning a planned session.
- Completing or partially completing a meaningful checkpoint.
- Identifying a blocker.
- Asking for help.
- Saving a next action.
- Rebalancing unrealistic work.
- Taking intentional recovery.
- Stopping at a planned boundary.

It does not reward raw hours, constant activity, or consecutive-day streaks.

XP supports levels, coins support cosmetic purchases, and category progress supports building upgrades. Coins never influence workload or recovery recommendations. Cosmetics include trees, paths, benches, building styles, outfits, lighting, and weather effects; there is no premium currency or real-money purchase system.

Suggested hackathon reward values are:

| Activity | XP | Coins |
|---|---:|---:|
| Begin a planned Pace Session | 10 | 5 |
| Meaningful or partial checkpoint | 20–30 | 10–20 |
| Identify a blocker and save a next action | 15 | 10 |
| Rebalancing quest | 35 | 25 |
| Intentional recovery quest | 20 | 15 |
| Weekly goal | 75 | 50 |

Early levels require approximately 200 XP and cosmetics cost approximately 50–300 coins. These values are balancing defaults, not measures of personal worth or task importance.

### Recovery Garden

The Garden grows from work progress, recovery, replanning, and help-seeking. It has no dead, failed, or wilted states. Future growth includes plants, trees, herbs, water plants, benches, lamps, stepping stones, birdbaths, wind chimes, wildlife, lighting, and a garden-complete celebration.

### Journal Postcards

Private postcards record significant moments without becoming a public achievement feed. They may represent guardians, story themes, Council decisions, garden growth, calendar rebalancing, or a generated session summary. The student can edit, save, or delete them.

### Future Mailbox

Students may send a next action or supportive note to their future self. It appears at the next relevant moment rather than through guilt-driven reminders.

### Pace Keepsakes collection

Keepsakes form a private collection organized around Garden, Café, Library, Market, path, weather, and postcard memories. Students can preview, name with application text, place, move, download, or delete them.

Keepsakes are cosmetic memories, not proof or scarce rewards. The collection has no public feed, trading, rarity pressure, limited-time items, or completion requirement. Students who self-confirm receive the same XP, coins, and progression as students who use photos.

## 16. Core screens

```text
/                 Landing, local authentication, and Explore Demo Town
/onboarding       Capacity calibration and preferences
/town             Interactive town and Daily Briefing
/planner          Tasks, calendar, forecast, and rebalancing
/session/:taskId  Guided Pace Session
/journal          Session history, reflections, and postcards
/collection       Private Pace Keepsakes and placement
/shop             Cosmetics and customization
/profile          Capacity, accessibility, privacy, and data controls
```

### Daily Briefing

The student may enter energy, stress, and sleep information or skip. The screen shows capacity, a concise load explanation, one primary recommendation, and up to three quests.

### Planner

The planner supports manual tasks, natural-language entry, optional brief or rubric intake, day/week views, load contribution, forecast, and rebalancing previews.

### Journal

The private timeline records tasks, sessions, saved next actions, regulation choices, quests, purchases, upgrades, and load changes. Mood and reflection are optional.

### Collection

The private collection shows generated, locally stylized, and symbolic keepsakes. It records whether an original was discarded or retained and supports placement in the Journal, Recovery Garden, town, or Future Mailbox.

### Profile

Preferences include capacity defaults, guardian and quest choices, mini-game visibility, timer behavior, audio, motion, contrast, Town List, export, reset, and deletion.

## 17. AI as an optional capability

AI may:

- Parse natural-language commitments.
- Extract assignment deliverables.
- Suggest editable checkpoints.
- Explain concepts.
- Brainstorm and outline.
- Review a draft against supplied criteria.
- Debug code or reasoning.
- Recommend a next action.
- Personalize reviewed quest wording.
- Assist optional photo verification.
- Transform an explicitly submitted and sanitized photo into a reviewed PaceTown-styled keepsake.

AI may not:

- Apply schedule changes without approval.
- Silently mutate tasks or checkpoints.
- Claim generated work satisfies a course requirement.
- Mark work complete on the student's behalf.
- Diagnose wellbeing or invent medical advice.
- Turn private content into public or shared data.
- Retain an original photo or place generated art without the student's explicit choice.

Local fallbacks provide deterministic task parsing, blocker-specific checkpoint templates, manual editing, optional timers, saved next actions, reviewed recovery content, seeded calendar events, and manual photo correction. The product must remain coherent without an AI provider.

For keepsakes, local fallback uses deterministic pixelation, palette reduction, symbolic category art, or pre-made postcard frames. AI availability never controls quest completion, rewards, or collection access.

## 18. Academic agency

The student owns the work and decides how assistance is used. PaceTown separates:

- The student's source material.
- Assistant suggestions.
- The student's accepted plan.
- The student's actual progress record.

Assumptions and ambiguities remain visible. Students can edit or reject plans, request a simpler explanation, and use a session without uploading any document. Future institutional deployments may configure guidance around local academic-integrity expectations.

## 19. Accessibility, privacy, and safety

### Accessibility

- Semantic buttons, forms, dialogs, landmarks, and live regions.
- Full keyboard operation.
- Town List parity for every spatial interaction.
- Text and icons in addition to color.
- Large touch targets and a complete 390 px mobile flow.
- High-contrast and reduced-motion modes.
- Muted-by-default audio with visual equivalents and captions/descriptions.
- Mini-games operable by keyboard, touch, pointer, or observation where appropriate.
- Guided sessions usable with town animation hidden.

### Privacy

- Local-first storage through IndexedDB.
- Assignment briefs and assistant conversations remain private by default.
- Uploading task content is optional.
- Quest photos are optional, private, and removable.
- Self-confirmed and photo-confirmed recovery receive equal rewards.
- Verification, original-photo retention, keepsake generation, and placement are separate consent decisions.
- EXIF and location metadata are removed before verification, storage, or external processing.
- Faces, documents, screens, addresses, and identifiable locations trigger crop or redaction warnings.
- Temporary inputs are deleted after the selected flow; originals persist only under Save both privately.
- Generated keepsakes remain private by default.
- Export, reset, and delete-local-data controls.
- No public wellbeing score, leaderboard, or mandatory proof.

### Safety and tone

- No medical claims or diagnosis.
- No punitive imagery, dead plants, destructive weather, or shame language.
- No forced check-ins, recovery activities, reflections, or schedule changes.
- When pressure is high, reduce choices and foreground one recommendation.
- Recovery content comes from reviewed templates.
- Mini-game responses are preferences and reflections, not clinical measurements.

## 20. Visual and audio identity

The canonical visual system is:

- `32 × 32 px` world grid.
- `64 × 96 px` portrait-faithful hero character cells, bottom-aligned to the world grid.
- Top-down three-quarter perspective, never isometric.
- Hard pixel edges, no antialiasing, and integer nearest-neighbour scaling.
- One-native-pixel dark-navy outlines.
- Sage, dusk teal, warm amber, dusty rose, cream, muted plum, stone, and water teal.
- Warm late-afternoon default lighting with calm, stressed, and evening overlays.
- A comforting, playful tone mature enough for university students.

Campus Grove is the default world and first production target. Coastal Commons and Night Market are later milestone environments that share all data and progression; switching environments never resets the town.

Generated images must not contain embedded text, logos, watermarks, photorealism, or accidental Google branding. Application text, controls, charts, focus rings, and standard navigation icons should be semantic HTML, CSS, or SVG.

Audio includes campus ambience, district loops, mini-game ambience, footsteps, interaction cues, page turns, chimes, ripples, pouring, lantern lighting, notifications, Calendar sync, postcards, and Quiet Mode. Audio remains muted until enabled.

## 21. Asset strategy and current state

The repository currently contains the planning suite, generated art, third-party source packs, deterministic asset tools, production references, and a mentor-review React/Vite vertical slice with campus movement, a Sky interaction, a guided breathing activity, a semantic Town List, and reduced-motion support.

Ready or substantially covered:

- Campus composition and style reference.
- Player and five guardian dialogue portraits.
- Portrait-faithful v3 four-direction `64 × 96 px` bases.
- Complete v4 animation packages for the player and five guardians: 240 frames and 108 Phaser animation definitions.
- A 62-sheet production-formatted runtime library covering interactive objects, all five mini-games, workload UI, application states, ambient life, Recovery Garden progression, postcards, Calendar art, overlays, effects, and PWA icons.
- Aggregate and per-sheet manifests, atlas metadata, visual review boards, a campus integration scene, and a passing validation report.
- Generic terrain, interiors, UI panels, input prompts, and lighting sources from documented third-party packs.

Still required for the core experience:

- Connect the completed character, object, mini-game, workload, scheduling, and application-state assets to the React runtime.
- Assemble the production Campus Grove tilemap and collision data from the approved sources.
- Add the required audio and muted visual equivalents.
- Pace Keepsake frames, category treatments, local stylization presets, and private collection states.

Preferred third-party sources are Styloo for campus interiors, Kauzz for selected 32 px exterior pieces, Pix-Quest at exact 2× for the Recovery Garden, Kenney Pixel Adventure for UI, Kenney Input Prompts, and Kenney Light Masks. Tiny Town is for minimaps and prototypes only. Ghost Data's CC BY-SA pack remains excluded unless the project owner explicitly accepts its obligations.

## 22. Technical direction

The first implementation is a responsive, installable, local-first PWA using:

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

The town uses layered DOM and CSS rather than requiring a full game engine. Buildings, characters, props, weather, and interaction markers remain independent pixel-art layers. Existing atlas metadata can be converted into build-time frame definitions.

Domain code remains separate from storage and providers through adapters for authentication, repositories, task parsing, work guidance, photo verification, keepsake generation, assets, and Calendar integration.

Later production adapters may add Supabase, a provider-neutral language/vision service, Google Calendar, Vercel hosting, and a Capacitor Android wrapper.

## 23. Responsive experience

Desktop uses a central town, concise summary rail, quest panel, and contextual task/session workspace.

Mobile keeps the town in the upper viewport and uses a swipeable bottom sheet for the current task, checkpoint, session controls, and building details. Bottom navigation exposes Town, Planner, Journal, Shop, and Profile. Tap-to-focus replaces unrestricted panning.

The focused work area can hide or reduce town animation on every device.

## 24. Hackathon vertical slice

The hackathon should prove one complete, polished path rather than a broad collection of shallow screens.

### Required

- Seeded demo student and schedule.
- Explainable workload calculation.
- Town-based Load Weather.
- One overloaded day and consent-based rebalance proposal.
- Task and optional assignment-brief intake.
- Blocker selection.
- Editable work plan and one checkpoint.
- Guided Pace Session with at least one contextual help interaction.
- Partial progress and saved next action.
- Fully interactive Gentle Ripples before, during, and after work.
- A fully usable **Pocket of Green** quest with outdoor, open-window, indoor-plant, nature-image, self-confirmation, optional-photo, partial, changed-mind, and camera-denied paths.
- Separate Verify and discard, Create keepsake and discard original, Save both privately, and Cancel paths.
- One reviewed photo-to-pixel-art Pace Keepsake with a local fallback and private placement.
- Preview/return states for the other four mini-games.
- Backpack, Guardian Council, Rebalance Workshop, Recovery Garden, Future Mailbox, Calm Corner, Quiet Mode, and Exit Quest actions.
- XP, coins, and one persistent visible town-growth response.
- Journal entry showing work, recovery, and the next action.
- Town List, keyboard path, reduced motion, muted audio, mobile layout, offline shell, and local fallbacks.

### Deferred until the core works

- Deep shop and cosmetic catalog.
- Full live Google Calendar authentication.
- All character animation variants.
- Complete Recovery Garden catalog.
- Ambient NPC and animal collection.
- Coastal Commons and Night Market.
- Production cloud services and Android packaging.

## 25. Demonstration story

Aina's load spans all five demand areas. Mental pressure comes from an unstarted database assignment. Lectures, a part-time shift, and its deadline create time pressure. A long commute and low self-reported energy affect physical capacity. A fixed club meeting adds social demand. Groceries and an administrative form add errands. Thursday is at 108% projected load. The Library has fog, the Clock Tower moves faster, the Garden softens, Café activity changes, and parcels appear in the Market, but the town is not damaged.

Kai first proposes moving the flexible administrative form while fixed lectures, the shift, club meeting, and assignment deadline remain locked. Aina approves that one change, lowering Thursday's load and slightly lightening the Backpack.

Aina then chooses the database assignment that remains and says she does not know where to begin. She reviews a seeded brief, confirms its deliverables, and selects a 20-minute checkpoint: identify the entities and relationships.

Mira begins a Pace Session and helps Aina understand one many-to-many relationship. Aina records partial progress and saves “Add the enrolment junction entity” as the next action.

Aina enters Gentle Ripples for a short transition, returns to the same checkpoint, and decides to reschedule rather than continue immediately. Sol then foregrounds **Pocket of Green**, offering an outdoor reset, open-window observation, indoor plant, or digital alternative while preserving the option to decline.

The demo shows that self-confirmation and optional photo confirmation receive equal rewards. Using a seeded Pocket of Green photo, Aina chooses **Create keepsake and discard original**. PaceTown removes metadata, shows the privacy review, generates a palette-locked pixel-art Garden postcard, asks for approval, deletes the original input, and places the keepsake privately in the Recovery Garden collection.

The Library fog clears slightly, the Backpack becomes lighter, one Recovery Garden plant grows, rewards are granted for sustainable progress rather than photo use, and the Journal records the rebalance, work, recovery choice, keepsake, deletion state, and next action.

This demonstration proves that PaceTown does more than report pressure: it helps the student understand, begin, progress, regulate, and return.

## 26. Success criteria

The product succeeds when a student can truthfully say:

- I know what is creating the pressure.
- I understand why PaceTown suggested this action.
- I can change or reject the suggestion.
- I know the next manageable step.
- I can get help without leaving the work context.
- I can pause without losing progress.
- I can return without reconstructing everything.
- The game rewards a sustainable decision, not endless productivity.

For the hackathon, success is demonstrated through a reliable local flow, automated domain and persistence tests, desktop and mobile completion, accessible alternatives, and a coherent three-minute judging story.

## 27. Long-term world

After the core experience is accepted:

1. Add Supabase authentication, database, and private media storage.
2. Connect provider-neutral language and vision services.
3. Add live Google Calendar synchronization.
4. Expand document and rubric intake with configurable academic-integrity guidance.
5. Complete all five mini-games and their audio/visual packages.
6. Expand IRL quest templates, private Pace Keepsake categories, collection placement, and local stylization options.
7. Expand the Recovery Garden, postcards, ambient students, animals, cosmetics, and town customization.
8. Unlock Coastal Commons and Night Market without resetting progression.
9. Deploy to Vercel, validate on real mobile devices, and package the stable PWA for Android with Capacitor.
10. Add production monitoring, rate limits, retention controls, and institution-ready privacy policies.

The long-term vision remains the same: a private, accessible, comforting place that helps students handle both the work in front of them and the pressure surrounding it.
