# CLAUDE.md

## Project Name

UniMatch / EduCompare

## Project Type

Portfolio-level full-stack and data-analyst project.

## Mission

Build a trustworthy student decision platform for comparing Thailand and Taiwan universities using verified data instead of agents or social media marketing.

## Core Product Goal

The app must help students:

* compare programs
* understand real costs
* review admission requirements
* understand legal work/visa rules
* identify scams or misleading promises

## Current Stage

The backend and core frontend logic are already working.

This Claude phase is for:

* frontend layout refinement
* structure alignment to Figma
* dashboard-style UX improvement
* responsive layout improvement
* theme/language structure support

This is NOT a backend rewrite phase.

---

## Backend Rules

Do NOT:

* change backend scoring logic
* move scoring logic into frontend
* invent fake endpoints
* break existing API integrations

Use existing backend endpoints as source of truth.

---

## Current Frontend Direction

The app should behave like a serious dashboard, not a marketing site.

Global layout should use:

* fixed left sidebar
* responsive main content area

Sidebar sections:

* Home
* Decision Hub
* Analytics
* Legal Info
* Red Flag Guide
* Settings
* Logout

Decision Hub should contain:

* Recommendation
* Compare
* Cost Calculator

Analytics should contain:

* Cost Overview
* Admission Overview
* Deadline Insights (placeholder)
* Ranking Insights (placeholder)

Sticky internal navigation is preferred for:

* Decision Hub section menu
* Analytics section menu

---

## Design Rules

* Low-to-mid fidelity only for now
* Focus on spacing, layout, hierarchy, and usability
* Do NOT overdesign
* Do NOT add heavy animation
* Keep the product serious, trustworthy, and data-first

---

## Assets

* Use SVG icons only
* Assets exist in the project
* Do NOT switch to PNG for UI icons

---

## Future Features

The system will later support:

* admin login
* admin dashboard
* multilingual support (English, Thai, Chinese)
* dark/light mode
* more analytics modules

Prepare structure for these features without overbuilding them now.

---

## Important UI Priorities

1. Match Figma layout structure as closely as possible
2. Keep all existing app logic working
3. Maintain responsiveness across desktop/tablet/mobile
4. Keep analytics and decision-making views easy to navigate
5. Use a dashboard information hierarchy

---

## Product Tone

The product must feel:

* trustworthy
* serious
* analytical
* clear

It must NOT feel:

* flashy
* gamified
* overly decorative
