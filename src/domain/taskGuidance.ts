/**
 * Provider-neutral guidance for turning one real commitment into one sensible
 * Pace Session. The seeded provider makes the demo coherent offline; a remote
 * provider can later implement the same interface and fall back here.
 */

import type { ActivityKind, BlockerKind, GuardianId, Task } from './types'

export type GuidanceIntent =
  | 'ready' | 'unclear_start' | 'too_large' | 'missing_knowledge'
  | 'missing_materials' | 'low_capacity' | 'perfection_pressure'
  | 'timing_conflict' | 'decision_block' | 'social_energy'
  | 'motivation' | 'preparation' | 'cleanup_pressure'

export interface GuidanceOption {
  id: GuidanceIntent
  label: string
}

export interface TaskGuidanceContext {
  brief?: string
  deliverables?: string[]
}

export interface GuidanceRequest {
  task: Task
  intent: GuidanceIntent
  context?: TaskGuidanceContext
  studentInput?: string
}

export interface GuidanceCheckpoint {
  title: string
  definitionOfDone: string
  estimatedMinutes: number
  timerPreference: 'down' | 'up' | 'none'
}

export interface GuidanceProposal {
  activityKind: ActivityKind
  guardian: GuardianId
  canonicalBlocker: BlockerKind
  message: string
  checkpoint: GuidanceCheckpoint
  source: 'seeded-local' | 'rules-local' | 'ai'
}

export interface GuidanceProvider {
  propose(request: GuidanceRequest): Promise<GuidanceProposal>
}

const option = (id: GuidanceIntent, label: string): GuidanceOption => ({ id, label })

const OPTIONS: Record<ActivityKind, GuidanceOption[]> = {
  assignment: [option('unclear_start', 'I do not know where to start'), option('missing_knowledge', 'I do not understand something'), option('too_large', 'It feels too large'), option('perfection_pressure', 'I am worried it will not be good enough'), option('low_capacity', 'I have low energy')],
  study: [option('missing_knowledge', 'One concept is not clicking'), option('unclear_start', 'I do not know what to revise first'), option('too_large', 'There is too much to review'), option('low_capacity', 'I have low energy')],
  lecture: [option('preparation', 'I need to prepare'), option('missing_materials', 'I am missing something I need'), option('missing_knowledge', 'I do not understand the topic'), option('low_capacity', 'I have low energy')],
  tutorial: [option('preparation', 'I need to prepare'), option('missing_materials', 'I am missing something I need'), option('missing_knowledge', 'I do not understand the topic'), option('low_capacity', 'I have low energy')],
  lab: [option('preparation', 'I need to prepare'), option('missing_materials', 'I am missing something I need'), option('missing_knowledge', 'I am stuck on the technical part'), option('low_capacity', 'I have low energy')],
  meeting: [option('preparation', 'I do not know what to bring'), option('unclear_start', 'I do not know what update to give'), option('timing_conflict', 'There is a timing conflict'), option('social_energy', 'I have low social energy')],
  shift: [option('preparation', 'I need to prepare'), option('timing_conflict', 'I have a timing or travel problem'), option('missing_materials', 'I am missing a required item'), option('low_capacity', 'I have low capacity')],
  commute: [option('preparation', 'I need to check the route'), option('timing_conflict', 'I am running late'), option('missing_materials', 'I am missing something I need'), option('low_capacity', 'The journey feels physically difficult')],
  exercise: [option('low_capacity', 'I do not have much energy'), option('too_large', 'The planned version feels too demanding'), option('missing_materials', 'I am missing equipment or space'), option('motivation', 'I am struggling to begin')],
  errand: [option('unclear_start', 'I do not know the first physical action'), option('missing_materials', 'I am missing information or an item'), option('too_large', 'There are too many separate steps'), option('motivation', 'I keep putting it off'), option('low_capacity', 'I have low energy')],
  admin: [option('unclear_start', 'I do not know which section comes next'), option('missing_materials', 'I am missing information or a document'), option('too_large', 'The form feels too long'), option('perfection_pressure', 'I am worried about entering something incorrectly')],
  meal: [option('decision_block', 'I do not know what to make'), option('missing_materials', 'I am missing ingredients'), option('too_large', 'There are too many steps'), option('cleanup_pressure', 'Cleanup feels overwhelming'), option('low_capacity', 'I have low energy')],
  social: [option('social_energy', 'I do not have enough social energy'), option('timing_conflict', 'I need to change or shorten the plan'), option('perfection_pressure', 'I am anxious about responding'), option('low_capacity', 'I need a lower-effort version')],
  household: [option('unclear_start', 'I do not know the first physical action'), option('missing_materials', 'I am missing something I need'), option('too_large', 'The whole job feels too large'), option('motivation', 'I keep putting it off'), option('low_capacity', 'I have low energy')],
  general: [option('unclear_start', 'I do not know where to begin'), option('too_large', 'It feels too large'), option('missing_materials', 'I am missing something'), option('low_capacity', 'I have low energy')],
}

export function guidanceOptionsFor(task: Task): GuidanceOption[] {
  return OPTIONS[activityKindOf(task)]
}

export function activityKindOf(task: Task): ActivityKind {
  if (task.activityKind) return task.activityKind
  const title = task.title.toLowerCase()
  if (title.includes('meal') || title.includes('cook')) return 'meal'
  if (title.includes('lecture') || title.includes('class')) return 'lecture'
  if (title.includes('tutorial')) return 'tutorial'
  if (title.includes('lab')) return 'lab'
  if (title.includes('assignment') || title.includes('essay') || title.includes('coursework')) return 'assignment'
  if (title.includes('revise') || title.includes('study')) return 'study'
  if (title.includes('meeting')) return 'meeting'
  if (title.includes('shift')) return 'shift'
  if (title.includes('commute') || title.includes('travel')) return 'commute'
  if (title.includes('gym') || title.includes('run') || title.includes('workout')) return 'exercise'
  if (title.includes('form') || title.includes('application')) return 'admin'
  if (title.includes('laundry') || title.includes('clean')) return 'household'
  if (task.category === 'errands') return 'errand'
  if (task.category === 'social') return 'social'
  return 'general'
}

interface ReadyProfile {
  title: string
  done: string
  minutes?: number
  timer: GuidanceCheckpoint['timerPreference']
  message: string
}

/** Every unique seeded title has an intentional no-blocker session. */
const SEEDED_READY: Record<string, ReadyProfile> = {
  'algorithms lecture': { title: 'Attend the lecture and capture three useful points', done: 'The lecture is attended and three points or questions are recorded.', timer: 'up', message: 'You are ready. I will keep one useful outcome visible while you attend.' },
  'gym': { title: 'Do the planned workout', done: 'The planned workout or an intentionally shorter version is complete.', timer: 'up', message: 'Start with the version that fits today. A shorter version still counts.' },
  'design tutorial': { title: 'Attend the tutorial and capture its next action', done: 'The tutorial is attended and one next action is recorded.', timer: 'up', message: 'You know where to be. We will only preserve the next useful action.' },
  'pharmacy': { title: 'Collect the pharmacy item', done: 'The required medication or pharmacy item has been collected, or the next collection step is known.', timer: 'none', message: 'This is a practical errand. The item—not a perfect process—is the finish line.' },
  'project meeting': { title: 'Attend with one update and leave with one next action', done: 'One update was shared and one next action was recorded.', timer: 'up', message: 'The meeting only needs one useful input and one useful output.' },
  'laundry': { title: 'Start one load of laundry', done: 'One load has been started. Folding can be a separate task.', timer: 'none', message: 'Only the first physical cycle belongs to this session.' },
  'database systems lecture': { title: 'Attend and capture one concept to revisit', done: 'The lecture is attended and one concept or question is recorded.', timer: 'up', message: 'You are ready. Listening and keeping one question is enough.' },
  'commute': { title: 'Complete the journey safely', done: 'You arrived, or made a safe alternative travel decision.', timer: 'none', message: 'This session asks for no productivity. Getting there safely is the task.' },
  'film society': { title: 'Take part in Film Society', done: 'You attended, or intentionally communicated a change of plan.', timer: 'none', message: 'Being present is the commitment. There is nothing to optimise.' },
  'café shift': { title: 'Complete the scheduled café shift', done: 'The shift is complete and any necessary handover has been made.', timer: 'up', message: 'Your shift is already defined. I will not turn it into extra homework.' },
  'erd assignment': { title: 'Identify the entities and their attributes', done: 'A rough entity list exists, with a possible key and attributes for each.', minutes: 20, timer: 'down', message: 'The brief gives us a clear first checkpoint. Rough is expected.' },
  'revise normalisation notes': { title: 'Review one normalisation concept and write one example', done: 'One concept is explained in your own words with one example.', minutes: 20, timer: 'down', message: 'One concept is enough for this session. The rest stays outside.' },
  'weekly groceries': { title: 'Buy the essential grocery list', done: 'The essential groceries are bought, substituted, or intentionally deferred.', timer: 'none', message: 'Essentials first. Optional items do not decide whether this is done.' },
  'bursary form': { title: 'Complete the next unfinished section', done: 'One form section is completed or its missing information is identified.', minutes: 15, timer: 'down', message: 'We will handle one section, not the whole form at once.' },
  'software lab': { title: 'Complete the lab and record unresolved errors', done: 'The lab session is attended and unresolved errors are recorded for follow-up.', timer: 'up', message: 'The goal is a traceable attempt, not pretending every error is solved.' },
  'dinner with friends': { title: 'Follow through on the dinner plan', done: 'You attended, or intentionally communicated a change of plan.', timer: 'none', message: 'The plan is social, not productive. Presence or clear communication completes it.' },
  'morning run': { title: 'Do the planned run or its minimum version', done: 'The planned run or a safe, intentionally shorter version is complete.', timer: 'up', message: 'Start at today’s pace. Distance is not a judgement.' },
  'family dinner': { title: 'Be present for the family dinner', done: 'You attended, or intentionally communicated a change of plan.', timer: 'none', message: 'Being present is enough. This does not need a productivity outcome.' },
  'meal prep': { title: 'Prepare one meal or reusable meal component', done: 'One meal, or one useful component such as rice, vegetables, protein or sauce, is prepared.', timer: 'none', message: 'We are making food, not completing coursework. One useful component counts.' },
  'call family': { title: 'Call family or arrange another time', done: 'The call happened, or a clear message arranged another time.', timer: 'none', message: 'Connection or clear communication is the finish line.' },
}

const cp = (title: string, done: string, minutes: number, timerPreference: GuidanceCheckpoint['timerPreference']): GuidanceCheckpoint =>
  ({ title, definitionOfDone: done, estimatedMinutes: minutes, timerPreference })

function readyCheckpoint(task: Task): { profile: ReadyProfile; seeded: boolean } {
  const known = SEEDED_READY[task.title.toLowerCase()]
  if (known) return { profile: known, seeded: task.source === 'seeded' }
  const kind = activityKindOf(task)
  const defaults: Record<ActivityKind, ReadyProfile> = {
    lecture: { title: `Attend ${task.title} and capture one takeaway`, done: 'The session is attended and one takeaway is recorded.', timer: 'up', message: 'You are ready to attend.' },
    tutorial: { title: `Attend ${task.title} and record the next action`, done: 'The tutorial is attended and one next action is recorded.', timer: 'up', message: 'You are ready to attend.' },
    lab: { title: `Work through ${task.title}`, done: 'A traceable attempt exists and unresolved errors are recorded.', timer: 'up', message: 'A real attempt is the goal.' },
    assignment: { title: `Do the first visible part of ${task.title}`, done: 'One visible part exists in rough form.', timer: 'down', message: 'Start the first visible part.' },
    study: { title: `Review one part of ${task.title}`, done: 'One concept is explained in your own words.', timer: 'down', message: 'One concept is enough.' },
    meeting: { title: `Attend ${task.title} with one update`, done: 'One update and one next action are recorded.', timer: 'up', message: 'One useful exchange is enough.' },
    shift: { title: `Complete ${task.title}`, done: 'The scheduled shift and necessary handover are complete.', timer: 'up', message: 'The shift already defines the work.' },
    commute: { title: `Complete ${task.title} safely`, done: 'The journey or a safe alternative is complete.', timer: 'none', message: 'Getting there safely is the task.' },
    exercise: { title: `Do ${task.title} at today’s pace`, done: 'The planned or minimum viable version is complete.', timer: 'up', message: 'A smaller safe version counts.' },
    errand: { title: `Complete ${task.title}`, done: 'The item is obtained or the next practical step is known.', timer: 'none', message: 'The practical outcome is the finish line.' },
    admin: { title: `Complete the next part of ${task.title}`, done: 'One section is complete or its missing information is known.', timer: 'down', message: 'One section at a time.' },
    meal: { title: `Prepare one part of ${task.title}`, done: 'One meal or reusable component is prepared.', timer: 'none', message: 'One useful food component counts.' },
    social: { title: `Follow through on ${task.title}`, done: 'You participated or clearly communicated a change.', timer: 'none', message: 'Presence or communication is enough.' },
    household: { title: `Start the first physical part of ${task.title}`, done: 'One complete physical cycle is done.', timer: 'none', message: 'Only one physical cycle belongs here.' },
    general: { title: `Do ${task.title}`, done: 'You decide when the commitment is complete.', timer: 'down', message: 'You know what to do; I will keep it visible.' },
  }
  return { profile: defaults[kind], seeded: false }
}

function canonical(intent: GuidanceIntent): BlockerKind {
  if (intent === 'ready') return 'ready'
  if (intent === 'too_large') return 'too_large'
  if (intent === 'missing_knowledge') return 'missing_knowledge'
  if (intent === 'missing_materials' || intent === 'preparation') return 'missing_materials'
  if (intent === 'low_capacity' || intent === 'social_energy') return 'low_capacity'
  if (intent === 'perfection_pressure') return 'perfection_pressure'
  return 'unclear_start'
}

function blockerCheckpoint(task: Task, intent: GuidanceIntent, context?: TaskGuidanceContext): GuidanceCheckpoint {
  const kind = activityKindOf(task)
  if (kind === 'meal') {
    if (intent === 'decision_block') return cp('Choose one meal from food already available', 'One realistic meal is chosen.', 5, 'none')
    if (intent === 'missing_materials') return cp('Write the shortest essential ingredient list', 'Only the ingredients required for one meal are listed.', 5, 'none')
    if (intent === 'cleanup_pressure') return cp('Choose a one-pot or low-cleanup option', 'One meal option and its smallest cleanup plan are chosen.', 5, 'none')
    if (intent === 'low_capacity') return cp('Make the easiest available food', 'You have something adequate to eat; complexity does not count.', 10, 'none')
    return cp('Prepare only one meal component', 'One useful component is prepared. The rest can wait.', 15, 'none')
  }
  if (kind === 'commute') {
    if (intent === 'timing_conflict') return cp('Choose the safest realistic departure plan', 'A departure time and route are chosen, or someone has been notified.', 5, 'none')
    if (intent === 'missing_materials') return cp('Gather the travel essentials', 'Keys, fare, phone and required items are ready.', 5, 'none')
    return cp('Check the route and next departure', 'The route, departure and fallback are known.', 5, 'none')
  }
  if (kind === 'social') {
    if (intent === 'social_energy' || intent === 'low_capacity') return cp('Choose a lower-effort version of the plan', 'A shorter visit, call, message or intentional decline is chosen.', 5, 'none')
    if (intent === 'timing_conflict') return cp('Send one clear timing message', 'The other person knows whether, when or how the plan changes.', 5, 'none')
    return cp('Write the message you need to send', 'A clear, kind response exists and is ready to send.', 5, 'none')
  }
  if (kind === 'exercise') {
    if (intent === 'missing_materials') return cp('Choose an equipment-free alternative', 'A safe alternative using the available space is chosen.', 5, 'none')
    if (intent === 'low_capacity' || intent === 'too_large') return cp('Do the minimum viable movement', 'Five gentle minutes are complete, or you intentionally stop for safety.', 5, 'up')
    return cp('Put on the first required item and begin gently', 'The session has begun; duration can be decided after two minutes.', 5, 'up')
  }
  if (kind === 'shift') {
    if (intent === 'timing_conflict') return cp('Confirm travel and notify the right person if needed', 'The departure plan or delay message is settled.', 5, 'none')
    if (intent === 'low_capacity') return cp('Prepare the essentials and identify one possible break', 'Required items are ready and one sustainable pause is identified.', 10, 'none')
    return cp('Gather everything required for the shift', 'Clothing, travel plan and required items are ready.', 10, 'none')
  }
  if (kind === 'lecture' || kind === 'tutorial' || kind === 'lab') {
    if (intent === 'missing_knowledge') return cp('Write the one question you want the session to answer', 'One specific question is written in plain language.', 5, 'none')
    if (intent === 'low_capacity') return cp('Attend for one useful takeaway', 'You attended and captured one point; complete notes are not required.', task.estimatedMinutes, 'up')
    return cp('Prepare the materials and one question', 'Required materials are ready and one question is written.', 10, 'none')
  }
  if (kind === 'meeting') {
    if (intent === 'timing_conflict') return cp('Send one clear availability update', 'Everyone affected knows the timing or proposed alternative.', 5, 'none')
    if (intent === 'social_energy') return cp('Prepare one short update and one question', 'You can contribute without carrying the whole conversation.', 10, 'none')
    return cp('Write the one update you need to give', 'A two-sentence update and one desired next action exist.', 10, 'none')
  }
  if (kind === 'errand') {
    if (intent === 'missing_materials') return cp(`List what ${task.title} requires`, 'The required item, information, location and payment method are known.', 5, 'none')
    if (intent === 'too_large') return cp(`Do only the essential part of ${task.title}`, 'The single essential outcome is completed or ready to execute.', 10, 'none')
    return cp(`Prepare to leave for ${task.title}`, 'The required item or list is ready and the first destination is known.', 5, 'none')
  }
  if (kind === 'admin') {
    if (intent === 'missing_materials') return cp(`List the missing information for ${task.title}`, 'Each missing document or fact is named with one source.', 10, 'none')
    if (intent === 'perfection_pressure') return cp('Complete only the fields you can verify', 'Known fields are filled; uncertain fields remain clearly marked.', 15, 'down')
    return cp(`Open ${task.title} and complete one section`, 'One section is complete or its exact blocker is recorded.', 15, 'down')
  }
  if (kind === 'household') {
    if (intent === 'missing_materials') return cp(`Gather what ${task.title} needs`, 'The required supplies are together or one substitute is chosen.', 5, 'none')
    if (intent === 'low_capacity' || intent === 'too_large') return cp(`Do one small cycle of ${task.title}`, 'One contained physical cycle is complete; the rest can wait.', 10, 'none')
    return cp(`Start the first physical action for ${task.title}`, 'The first machine, container or surface is underway.', 5, 'none')
  }
  if (kind === 'assignment' || kind === 'study') {
    if (intent === 'missing_knowledge') return cp(`Name the exact question blocking ${task.title}`, 'One specific concept question is written.', 10, 'down')
    if (intent === 'too_large') return cp(`Choose one part of ${task.title} for today`, 'One part is named as today’s complete scope.', 10, 'down')
    if (intent === 'perfection_pressure') return cp(`Make a deliberately rough start on ${task.title}`, 'A rough version exists; quality does not count yet.', 15, 'down')
    if (intent === 'low_capacity') return cp(`Read one part of ${task.title}`, 'One part has been read and one note is captured.', 10, 'down')
    const firstDeliverable = context?.deliverables?.find((item) => item.trim())
    if (firstDeliverable) return cp(`Start: ${firstDeliverable}`, `A rough attempt exists for “${firstDeliverable}”.`, 15, 'down')
    return cp(`Find the first visible action in ${task.title}`, 'One observable first action is written and started.', 10, 'down')
  }
  return cp(`Take the first physical action for ${task.title}`, 'One visible action is complete.', 10, 'down')
}

export const localTaskGuidanceProvider: GuidanceProvider = {
  async propose(request) {
    const kind = activityKindOf(request.task)
    if (request.intent === 'ready') {
      const { profile, seeded } = readyCheckpoint(request.task)
      return {
        activityKind: kind,
        guardian: 'mira',
        canonicalBlocker: 'ready',
        message: profile.message,
        checkpoint: cp(profile.title, profile.done, profile.minutes ?? request.task.estimatedMinutes, profile.timer),
        source: seeded ? 'seeded-local' : 'rules-local',
      }
    }
    const checkpoint = blockerCheckpoint(request.task, request.intent, request.context)
    return {
      activityKind: kind,
      guardian: request.intent === 'low_capacity' || request.intent === 'social_energy' ? 'sol' : 'mira',
      canonicalBlocker: canonical(request.intent),
      message: kind === 'meal'
        ? 'This is a food task. We will solve the practical obstacle and stop there.'
        : kind === 'commute'
          ? 'This is a travel task. Safety and arrival come before productivity.'
          : `We will make one part of ${request.task.title} easier to begin.`,
      checkpoint,
      source: request.task.source === 'seeded' ? 'seeded-local' : 'rules-local',
    }
  },
}

/** A remote backend can be passed here later. Any failure remains coherent and private. */
export function createGuidanceProvider(primary?: GuidanceProvider): GuidanceProvider {
  if (!primary) return localTaskGuidanceProvider
  return {
    async propose(request) {
      try {
        return await primary.propose(request)
      } catch {
        return localTaskGuidanceProvider.propose(request)
      }
    },
  }
}
