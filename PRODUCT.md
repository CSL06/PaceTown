# PaceTown Product Brief

<!-- impeccable:product-schema 1 -->

This brief records the current product decisions. Statements marked **inferred** come from the repository plans and the latest mentor-demo request; they should be validated with the team and mentor.

## Platform

Responsive browser-based progressive web app, designed to remain open on a student's phone. **Inferred:** the hackathon prototype runs locally in a modern browser first.

## Stack

React, TypeScript, and Vite, with a layered DOM/CSS town rather than a full game engine for the first implementation. This follows the existing implementation plan.

## Users

University students balancing coursework, part-time work, social commitments, errands, and their physical and mental wellbeing.

## Product Purpose

PaceTown helps students notice accumulated pressure and take a small stress-reducing action before they reach burnout. The product is a supportive place, not a productivity scoreboard.

## Positioning

A cozy, town-first stress companion where students can talk with supportive NPCs, see what is contributing to stress, and try restorative activities. The experience supports and suggests; it never diagnoses, shames, or punishes.

## Operating Context

The immediate deliverable is a mentor-ready vertical slice: one campus, one player, Sky at a tea counter, a short supportive conversation, and one guided breathing activity. It must work on desktop and phone.

## Capabilities and Constraints

- Current slice: keyboard and touch movement, proximity interaction, Sky dialogue, one breathing activity, accessible direct navigation, and local demo state.
- Current slice excludes Google Calendar, cloud accounts, generative AI conversations, additional NPCs, and games.
- Characters must keep exact pixel scaling and whole-body silhouettes; no cropped or procedurally separated limbs.
- The full campus scene is a concept-art backdrop for the mentor prototype, not the final collision-ready tilemap.
- **Open decision:** final hosting, free asset-pack assembly, and production map technology.

## Brand Commitments

- Name: PaceTown.
- Promise: “Find your pace. Grow your place.”
- Cozy but mature pixel-art world with warm amber, moss green, cream, teal, plum, and ink-navy UI.
- Sky remains visually consistent with the approved glasses, dark hair, plum clothing, and gentle guide role.

## Evidence on Hand

The repository contains the product and implementation plans, a campus style master, a production asset checklist, approved player assets, and Sky's whole-body guardian animation package. There is not yet user research or evidence supporting clinical claims.

## Product Principles

- Reduce stress, not just workload.
- Offer one manageable next step.
- Explain patterns without diagnosing.
- Ask permission before using personal calendar or wellbeing data.
- Keep the spatial town and a direct list-based alternative equally usable.

## Accessibility and Inclusion

Keyboard and touch controls, visible focus, semantic controls, readable contrast, reduced-motion support, screen-reader status updates, and no meaning conveyed by color alone.
