---
name: PaceTown
description: A warm pixel-campus world for small, supportive stress-reduction moments.
colors:
  amber-action: "#e7a23b"
  ink-night: "#182738"
  ink-surface: "#243a4e"
  cream-paper: "#f7edcf"
  paper-light: "#fff8e4"
  tea-teal: "#4f9c98"
  garden-moss: "#607d4c"
  sky-plum: "#6d4968"
typography:
  display:
    fontFamily: "Georgia, Times New Roman, serif"
    fontSize: "clamp(1.3rem, 2vw, 1.72rem)"
    fontWeight: 700
    lineHeight: 1
  body:
    fontFamily: "Verdana, Geneva, Tahoma, sans-serif"
    fontSize: "0.76rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Verdana, Geneva, Tahoma, sans-serif"
    fontSize: "0.68rem"
    fontWeight: 800
    lineHeight: 1.2
rounded:
  square: "0px"
  orb: "999px"
spacing:
  compact: "4px"
  small: "8px"
  medium: "16px"
  large: "32px"
components:
  button-primary:
    backgroundColor: "{colors.amber-action}"
    textColor: "{colors.ink-night}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0.68rem 0.92rem"
  panel-paper:
    backgroundColor: "{colors.paper-light}"
    textColor: "{colors.ink-night}"
    rounded: "{rounded.square}"
    padding: "1rem"
  panel-night:
    backgroundColor: "{colors.ink-surface}"
    textColor: "{colors.cream-paper}"
    rounded: "{rounded.square}"
    padding: "1rem"
---

# Design System: PaceTown

## Overview

**Creative North Star: “The Gentle Campus Pause”**

PaceTown places a detailed, warm university town at the center and lets the interface behave like a quiet frame around it. The visual system is cozy without becoming childish: tactile pixel assets carry the personality, while square cream-and-ink panels keep guidance legible and calm.

The world should feel inhabited before it feels instrumented. Support appears as a nearby character, tea corner, or small activity—not as a wall of metrics.

**Key Characteristics:**

- A real pixel-art environment is the focal material.
- Ink-night framing gives warm campus colors room to glow.
- Cream paper panels make conversations feel personal and contained.
- Amber marks one available action; teal marks calm progress.
- Whole-body characters remain crisp and uncropped.

## Colors

Warm restoration colors sit inside a deep blue frame; accents are reserved for actions, progress, and character identity.

### Primary

- **Lantern Amber:** the single decisive action color for primary buttons and active cues.

### Secondary

- **Tea Teal:** breathing progress, calm-state rings, and restrained supporting detail.
- **Garden Moss:** restorative notes and campus-nature associations.

### Tertiary

- **Sky Plum:** character-linked emphasis for Sky without competing with the action color.

### Neutral

- **Ink Night:** page framing, structural borders, and high-contrast text on paper.
- **Ink Surface:** raised night panels and list cards.
- **Cream Paper:** labels and compact UI fragments placed over the world.
- **Paper Light:** conversation and activity surfaces where longer copy needs maximum clarity.

**The Lantern Rule.** Amber identifies the clearest next action and should not become general decoration.

## Typography

**Display Font:** Georgia with Times New Roman and serif fallbacks  
**Body Font:** Verdana with Geneva, Tahoma, and sans-serif fallbacks

**Character:** Georgia provides a quiet storybook voice for names and headings; Verdana keeps compact game UI and accessibility text highly readable.

### Hierarchy

- **Display:** bold, compact serif headings for the brand, character name, activity title, and panel title.
- **Body:** small but open sans-serif text with approximately 1.5 line height for instructions and supportive copy.
- **Label:** sturdy sans-serif text for buttons, name tags, and concise controls.

**The Two-Voice Rule.** Serif carries warmth and narrative; sans-serif carries controls and status. Do not introduce a third decorative face.

## Layout

Desktop uses a full-height application frame with the campus stage as the dominant region and a narrow Town List rail on the right. The stage preserves a 3:2 presentation and remains fully visible in the first viewport. At 960px the Town List becomes an off-canvas panel. At 620px the stage fills the height below the header, crops the wide campus deliberately, and adds thumb-reachable movement controls.

Overlays use a clear focus order: world, contextual interaction, dialogue sheet, then breathing activity. Character positions are percentage-based so they remain attached to the campus composition as it reflows.

## Elevation & Depth

The world supplies painted depth; interface depth is structural and pixel-like. Night panels use tonal separation, while important paper surfaces use a crisp dark border and short offset shadow. Blurred ambient shadows are reserved for large overlays.

### Shadow Vocabulary

- **World frame:** a deep ambient shadow plus a subtle inner highlight around the campus.
- **Pixel lift:** a short, hard ink offset for primary buttons, small labels, and dialogue panels.
- **Modal separation:** a broad dark overlay with restrained blur behind the breathing card.

**The Real-Material Rule.** Do not imitate painted scenery with CSS gradients when a pixel-art environment or object should carry the moment.

## Shapes

Primary surfaces are square and bordered, echoing pixel geometry. Circular shapes are limited to meaningfully round elements such as character ground shadows, breathing orbs, and status dots. Cards do not use generic soft rounding.

## Components

### Buttons

- **Shape:** square, ink-bordered, and compact.
- **Primary:** lantern amber with ink text and a short pixel lift.
- **Hover / Focus:** slightly brighter amber, a one-pixel lift, and a visible cream focus outline.
- **Text:** transparent, underlined, and used only for low-commitment alternatives.

### Chips

- **Style:** night-surface container with a small status square and two-level text.
- **State:** status always includes words; color is never the only signal.

### Cards / Containers

- **Corner Style:** square.
- **Background:** ink surfaces for navigation and paper-light for focused conversation.
- **Shadow Strategy:** tonal separation at rest; structural offset only for focused surfaces.
- **Border:** thin cream transparency on night surfaces and solid ink on paper.
- **Internal Padding:** typically one medium spacing step.

### Navigation

Town List is persistent on wide screens and a labeled drawer on narrow screens. Every spatial activity must also have a direct list entry. Active entries use a complete amber border, never a decorative side stripe.

### Character Interaction

Name tags use cream or pale-green paper with a strong ink border. Character sprites retain a 64×96 canvas, pixel rendering, and whole-body silhouette. Movement translates the intact sprite; it does not split or crop limbs.

### Breathing Activity

The activity is a paper-light focus card with a teal-and-amber orb, a plain-language phase label, visible progress, pause control, reduced-motion support, and a safety exit.

## Do's and Don'ts

### Do:

- **Do** let the campus and characters carry most of the visual personality.
- **Do** keep one obvious amber action per focused panel.
- **Do** provide list navigation alongside spatial movement.
- **Do** keep character pixels crisp and entire bodies inside their source frames.
- **Do** label prototype or synthetic wellbeing states clearly.

### Don't:

- **Don't** turn the experience into a dashboard-first productivity tool.
- **Don't** use emoji as production game icons; use the pixel-object language.
- **Don't** use decorative side stripes as card accents.
- **Don't** add rounded SaaS cards, gradient text, or extra display fonts.
- **Don't** communicate stress, safety, or completion through color alone.
