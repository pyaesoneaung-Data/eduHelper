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

---

## Current Stage

Frontend polish and architecture is largely complete. The focus now shifts to:

* adding real content to placeholder pages (Deadline Insights, Ranking Insights)
* multilingual support scaffolding (EN / TH / ZH)
* dark/light mode toggle wiring (tokens are ready, theme switching needs a UI control)
* admin login and admin dashboard (future phase)
* any remaining responsive edge cases

What is already done and should NOT be re-done:

* Global layout: fixed left sidebar + responsive main content area
* Sidebar collapse/expand with flyout menus for sub-pages
* All sidebar sections and sub-pages: Home, Decision Hub (Recommendation, Compare, Cost Calculator), Analytics (Cost Overview, Admission Overview, Deadline Insights, Ranking Insights), Legal Info, Red Flag Guide, Settings
* Design token system (`tokens.css` + semantic aliases in `index.css :root`)
* Apple-scale border-radius applied globally via tokens
* All border-radius, spacing, typography, shadows, and colors use tokens — no raw values
* Dark mode color tokens defined; light mode is the default
* Analytics pages: Cost Overview, Admission Overview, Deadline Insights, Ranking Insights
* All inline styles in JSX replaced with CSS utility classes
* Table component pattern standardized
* Flyout hover-gap fix (opacity + pointer-events transition delay)

This is NOT a backend rewrite phase. Backend scoring logic must not be touched.

---

## Backend Rules

Do NOT:

* change backend scoring logic
* move scoring logic into frontend
* invent fake endpoints
* break existing API integrations

Use existing backend endpoints as source of truth.

---

## Frontend Architecture

### Layout

The app behaves like a serious dashboard, not a marketing site.

* Fixed left sidebar (`Sidebar.jsx`) — collapsible, with flyout menus in collapsed state
* Responsive main content area (`.dashboard-main`)
* Topbar (`Topbar.jsx`) — shows page title and theme/language controls (future)

### Page Title Pattern

There are two patterns — use the right one for each page type:

**Top-level pages** (Home, Settings, Legal Info, Red Flag Guide, About): use `.topbar-section-greeting` in the topbar. No in-page `<PageHeader>` or `<h1>`. The topbar IS the title.

**Analytics sub-pages** (Cost Overview, Admission Overview, Deadline Insights, Ranking Insights): use `.section-heading` + `<h2>` at the top of the page content. These are sub-pages, not top-level sections.

Never mix the two patterns. Never add a redundant heading if the topbar already shows the title.

---

## Design Token System

Single source of truth: `frontend/src/styles/tokens.css`

All CSS values must use tokens. Never write raw pixel values for radius, spacing, font size, or color.

Allowed exceptions (intentional non-token values):
* `0` (zero — no unit needed)
* `50%` (circle / ellipse shapes)
* `2px` or `3px` only for micro-detail borders or chart bar radius

### Border Radius — Apple Scale

```
--radius-xs:   6px   (chips, badges, small inputs)
--radius-sm:   10px  (buttons, tags, small cards)
--radius-md:   14px  (standard cards, panels, table shells)
--radius-lg:   20px  (large cards, modals, drawers)
--radius-xl:   28px  (sheets, overlays, hero containers)
--radius-pill: 999px (pill buttons, avatars, full-round elements)
```

### Spacing — 4px base grid

```
--space-1: 4px  --space-2: 8px   --space-3: 12px  --space-4: 16px
--space-5: 20px --space-6: 24px  --space-8: 32px  --space-10: 40px
--space-12: 48px --space-16: 64px
```

### Typography

Font: Inter. Scale: `--text-2xl` (28px) down to `--text-2xs` (11px). Weights: regular/medium/semibold/bold via `--weight-*`. Line heights via `--leading-*`.

---

## Established CSS Patterns

### Table Shell

```css
.table-shell {
  border-radius: var(--radius-md);
  overflow-x: auto;               /* scroll horizontally — NEVER overflow:hidden */
  -webkit-overflow-scrolling: touch;
}
```

Never set `overflow:hidden` on a `.table-shell` or any wrapper that contains a scrollable table — it clips columns.

### Sidebar Flyout (collapsed mode)

Flyout menus use opacity + pointer-events with a transition delay so the cursor can cross the gap without the menu disappearing:

```css
.sidebar-flyout {
  opacity: 0;
  pointer-events: none;
  transition: opacity 100ms ease 120ms, pointer-events 0s linear 220ms;
}
.sidebar-collapsed .sidebar-group:hover .sidebar-flyout {
  opacity: 1;
  pointer-events: auto;
  transition: opacity 80ms ease 0ms, pointer-events 0s linear 0ms;
}
```

The 120ms delay on hide keeps the flyout open while the cursor crosses the `--flyout-offset` (10px) gap. Do not revert to `display:none` toggling.

### Chart Tooltip Style

Tooltip style objects in JSX must use CSS variables, not raw values:

```js
const TOOLTIP_STYLE = {
  background: 'var(--panel-bg)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-xs)',
  color: 'var(--text)',
  fontSize: 'var(--text-sm)',
}
```

### Country Flag (ReactCountryFlag)

Use `width: '100%', height: '100%', display: 'block'` so the flag fills its container without white edges:

```jsx
<ReactCountryFlag
  countryCode="TW"
  svg
  style={{ width: '100%', height: '100%', display: 'block' }}
  title="Taiwan"
/>
```

The container must have `overflow: hidden` and a fixed size. Do not add background color to the container.

---

## Design Rules

* Follow Apple design proportions — generous, soft, consistent
* Focus on spacing, layout, hierarchy, and usability
* Do NOT overdesign
* Do NOT add heavy animation — `--transition-ui: 150ms ease` is the ceiling
* Keep the product serious, trustworthy, and data-first
* No em dashes (`—`) in displayed strings; use `:` or `,` instead
* No inline styles in JSX — move all visual properties to CSS classes

---

## Assets

* Use SVG icons only
* Assets exist in the project
* Do NOT switch to PNG for UI icons

---

## Changelog Requirement

Every code change must be logged to `docs/CHANGELOG.md` before finishing a session. Follow the existing entry format (date, entry number, description, files changed).

---

## Future Features

The system will later support:

* admin login and admin dashboard
* multilingual support (English, Thai, Chinese) — token/class structure should be prepared
* dark/light mode toggle (dark tokens already defined in `tokens.css`)
* Deadline Insights — real data and chart (currently placeholder)
* Ranking Insights — real data and chart (currently placeholder)
* more analytics modules

Prepare structure for these features without overbuilding them now.

---

## Important UI Priorities

1. Keep all existing app logic working — do not break what works
2. Use the token system for every visual value — no raw values
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
