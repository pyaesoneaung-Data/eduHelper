# Changelog

All changes made after receiving this project from the original developer.


---

### 59. Settings Page — Fix Misleading "Account" Card + Title Case

**Reason:** The Settings page had an "Account" card with the text "You are signed in. Sign out when you're done using the platform." This is factually wrong — the platform has no student authentication and no account system by design. Students visiting Settings would see this and either be confused or assume they need an account. Also found "Display currency" card title in sentence case.

**Changes:**
- `InfoCard title="Account"` → `title="Admin"`. The logout link is not a student feature — it is an admin-only utility intentionally placed here rather than in the main sidebar.
- Removed "You are signed in. Sign out when you're done using the platform." → replaced with "Admin access only. Use this to sign out of an active admin session." This is honest and scoped correctly.
- "Display currency" → "Display Currency" (Title Case, consistent with rest of Settings page).

**Context:** Students use UniMatch without creating accounts. The `/logout` route and `LogoutPage` exist exclusively for the future admin dashboard. Logout lives in Settings to keep it out of the main student navigation flow.

**Files changed:** `frontend/src/pages/SettingsPage.jsx`

---

### 58. Sidebar — Icon Size Standardised + getSectionLabel Gaps Fixed

**Reason:** Sidebar icons jumped from 22 px (expanded) to 28 px (collapsed) — a 27% size change with no transition — making the expand/collapse feel unfinished. Also found that `getSectionLabel` in Layout.jsx returned "Home" for `/about`, `/admin/*`, and `/programs/:id`, causing the topbar to display the wrong section label on those pages.

**Icon size fix (CSS):**
- Root cause: `.sidebar-link-icon` base size was 22 px, then overridden to 28 px in three separate collapsed-mode rules (`.sidebar-collapsed .sidebar-link-icon`, `.sidebar-collapsed .sidebar-group-btn .sidebar-link-icon`).
- Fix: raised the base to **24 px** and set all three collapsed-mode overrides to the same 24 px. The collapsed sidebar button (52×52 px) and expanded link row (44 px tall) both accommodate 24 px icons comfortably — no transition needed, no jump.

**getSectionLabel gaps (Layout.jsx):**
- Added missing cases:
  - `/about` → `'About'`
  - `/admin` → `'Admin'`
  - `/programs` → `'Program Detail'`
- All three previously fell through to the `'Home'` default, mislabelling the topbar on those pages.
- Note: Logout is intentionally absent from the main sidebar. It was moved to the Settings page as an admin-only utility. Students do not have accounts on this platform — the product is account-free by design. The logout route exists for future admin dashboard use only.

**Files changed:** `frontend/src/index.css`, `frontend/src/components/Layout.jsx`

---

### 57. Cost Overview — Persist Country Filter + toggleCountry Guard

**Reason:** The country filter pills reset to all-three selected every time the student navigated away and returned to Cost Overview. A student who deselected Thailand to compare only Taiwan vs Singapore would find their choice lost on every page visit. Also found a subtle state-pollution edge case in `toggleCountry`.

**localStorage persistence (JSX):**
- Added `COUNTRY_FILTER_KEY = 'unimatch-cost-filter'` constant — follows the same naming convention as `AppShellContext` keys (`unimatch-theme`, `unimatch-currency`, etc.).
- `selectedCountries` now uses a lazy initializer: reads from `localStorage`, JSON-parses, validates it is a non-empty array of known country keys, and falls back to `[...COUNTRY_ORDER]` on any error (parse failure, quota exceeded, null, malformed data).
- Added a dedicated `useEffect([selectedCountries])` that writes the selection to `localStorage` on every change — same pattern `AppShellContext` uses for theme and currency.
- Currency toggle was already persisted via `AppShellContext` — no change needed there.

**toggleCountry guard (JSX):**
- Previously, clicking a pill for a country absent from the backend response could silently add it to `selectedCountries` state even though `activeSelected` filtered it out — state pollution.
- Added: `if (!availableCountries.includes(key)) return prev` before the add branch. Only countries confirmed present in the current backend response can be selected.

**Files changed:** `frontend/src/pages/AnalyticsPage.jsx`

---

---

### 56. Analytics Pages — Readability Fixes + Title Case Pass

**Reason:** Two issues found across Cost Overview and Admission Overview: (1) key text sizes in the stacked bar and reality check were below readable threshold — breakdown labels at 0.75rem, stat labels at 0.72rem, annual note at 0.78rem; (2) all InfoCard titles were in sentence case ("Annual cost breakdown", "Monthly reality check") rather than Title Case, inconsistent with page headings and dashboard conventions.

**Font size increases (CSS):**
- `.stacked-bar-breakdown`: 0.75rem → 0.83rem. The per-country tuition/living breakdown text was the smallest text on the page — now reads comfortably.
- `.reality-stat-label`: 0.72rem → 0.80rem. "MONTHLY LIVING" and "PART-TIME INCOME" labels in uppercase were nearly unreadable at 0.72rem.
- `.reality-verdict-annual`: 0.78rem → 0.83rem. The yearly projection note needed more weight to land alongside the monthly verdict.

**Title Case fixes (AnalyticsPage.jsx):**
- "USD reference rates" → "USD Reference Rates"
- eyebrow "Country averages" → "Country Averages"
- "Annual cost breakdown" → "Annual Cost Breakdown"
- "Monthly reality check" → "Monthly Reality Check"
- eyebrow "Part-time work vs monthly living costs" → "Part-Time Work vs Monthly Living Costs"
- "Key observations" → "Key Observations"
- "Cheapest programs" → "Cheapest Programs"

**Wording fix (AnalyticsPage.jsx):**
- "Part-time max" label → "Part-time income". "Max" implied an upper bound which was confusing; "income" is what the figure represents.

**Title Case fixes (AdmissionAnalyticsPage.jsx):**
- "Admission requirement comparison" → "Admission Requirement Comparison"
- "Lowest-barrier programs" → "Lowest-Barrier Programs"
- "Highest-barrier programs" → "Highest-Barrier Programs"
- "Insights" → "Key Insights" (aligned with Cost Overview's "Key Observations")

**Eyebrow convention:** Data-label eyebrows that contain source references or dates kept sentence case ("As of April 2026 · Source: XE.com", "Top 5 lowest yearly cost per country · source: cost overview dataset"). Subtitle-type eyebrows got Title Case.

**Files changed:** `frontend/src/index.css`, `frontend/src/pages/AnalyticsPage.jsx`, `frontend/src/pages/AdmissionAnalyticsPage.jsx`

---

---

### 55. Cost Overview — Student-First UX Rethink

**Reason:** Critique of whether the page actually served students surfaced five concrete issues: bar height too thick (28px), "Per semester" metric is redundant and not universally accurate, students think in monthly terms not yearly, composition toggle added unnecessary control complexity, and page flow didn't match student decision order.

**Changes:**

**1. Bar height 28px → 18px (CSS)**
- `.reality-track-shell` height reduced from 28px to 18px. 28px was too chunky and read visually as a UI element rather than a data bar. 18px is a clear middle ground — readable and proportionate.

**2. KPI cards — "Per semester" → "Monthly commitment" (JSX)**
- Removed `perSemester` (yearly tuition ÷ 2) — redundant, and assumes all universities charge per semester which isn't universally true.
- Added `monthlyCommitment` = (yearly tuition ÷ 12) + monthly living. This is the single most actionable number for a student: it's what they tell their family they need each month. Handles null-safe fallback if either component is missing.
- Row order: Yearly cost → Yearly tuition → Monthly living → Monthly commitment. "Monthly commitment" is last because it synthesises the two rows above it.

**3. Stacked bar — removed composition toggle, percentages always visible (JSX + CSS)**
- Removed `barMode` state, the segmented control, and all toggle logic. Three controls (country pills, currency toggle, bar mode toggle) was too many for a first-time visitor.
- Percentages that were only visible in "Show split" mode now always appear in the breakdown text: "Tuition: 180,000 TWD (42%) · Living: 247,440 TWD (58%)". Same insight, less interaction required.
- Removed CSS: `.stacked-bar-controls`, `.stacked-bar-mode-toggle`, `.stacked-mode-btn`, `.stacked-mode-btn-active`.

**4. Reality check verdict — two lines instead of one (JSX + CSS)**
- The combined "X% covered — ~429/month needed (~5,148/year)" sentence was too dense.
- Split into two lines: primary verdict (monthly) and secondary note (yearly in muted smaller text).
- Gap: "59% covered — ~429 USD/month still needed" + "~5,148 USD/year from savings or family"
- Surplus: "Fully covered — ~109 USD/month left over" + "~1,308 USD/year surplus"
- Not permitted: "~570 USD/month from savings or family" + "~6,840 USD/year total"
- Added CSS: `.reality-verdict-block` (flex column, gap 3px), `.reality-verdict-annual` (0.78rem, 400 weight, muted).
- `.reality-verdict` margin removed (block container handles spacing now).

**5. Section reorder — cheapest programs before reality check (JSX)**
- Old: stacked bar → reality check → cheapest programs → insights
- New: stacked bar → cheapest programs → reality check → insights
- Students want to see real affordable options immediately after seeing averages. The reality check (survival planning) is a second-stage question once they've identified candidate programs.

**Files changed:** `frontend/src/pages/AnalyticsPage.jsx`, `frontend/src/index.css`

---

---

### 54. Cost Overview — Composition Toggle, Yearly Projections, Cheapest Programs Table, Taller Reality Bar

**Reason:** Four improvements approved in planning session to make Cost Overview visualizations more informative and interactive for students comparing budgets across countries.

**Changes:**

**1. StackedCostBar — composition toggle (JSX + CSS)**
- Added `barMode` state (`'comparison'` | `'composition'`) with a segmented two-button toggle inside the card.
- **Compare total mode** (default): bar outer width = proportion of total yearly cost in USD — existing behavior.
- **Show split mode**: all bar outer widths = 100%; focus shifts to tuition vs living colour split within each bar. Breakdown text also shows percentages: "Tuition: 180,000 TWD (42%) · Living: 247,440 TWD (58%)".
- Context sentence below toggle updates per mode: "Bar widths show total yearly cost in USD" / "All bars at 100% — shows tuition vs living split".
- CSS: `.stacked-bar-controls`, `.stacked-bar-mode-toggle`, `.stacked-mode-btn`, `.stacked-mode-btn-active`.

**2. MonthlyRealityCheck — yearly projections (JSX)**
- Gap verdict now appends yearly amount: "59% covered — ~429 USD/month still needed from savings or family (~5,148 USD/year)."
- Surplus verdict: "Fully covered — ~109 USD/month left over (~1,308 USD/year)."
- Not-permitted verdict: "All 570 USD/month must come from savings or family support (~6,840 USD/year)."
- Gives students a full-year budget picture without requiring manual multiplication.

**3. CheapestProgramsTable — new component (JSX + CSS)**
- New component reads `countryData[key].cheapest_programs` (already in `/analytics/cost-overview` response, top 5 per country).
- Renders one table per selected country (filtered by active country selection), with columns: Program (linked to `/programs/:id`), University, Yearly cost (respects USD/local currency toggle).
- Shown between MonthlyRealityCheck and InsightsCard in the page flow.
- Returns `null` when no programs are available — zero render if data missing.
- CSS: `.cheapest-programs-sections`, `.cheapest-country-section`, `.cheapest-country-label`.

**4. Reality check bar — height increase (CSS)**
- `.reality-track-shell` height: 14px → 28px. Taller bar reads more clearly as a progress indicator representing coverage percentage.

**Files changed:** `frontend/src/pages/AnalyticsPage.jsx`, `frontend/src/index.css`

---

---

### 53. Cost Overview — Pill Hover Fix + Reality Check Redesign

**Reason:** Country pill hover was still broken due to CSS cascade — `.country-pill:hover` (specificity 0,2,0) was overriding `.country-pill-active` (specificity 0,1,0), causing active pills to show accent-soft background with white text on hover — unreadable. Monthly reality check had a "MONTHLY GAP" stat that said "Covered ✓" — a label/value contradiction — plus two separate notes per country that required the student to mentally assemble the meaning.

**Pill hover fix (CSS):**
- Root cause: `.country-pill:hover` wins over `.country-pill-active` on specificity. Fixed by explicitly re-stating `background`, `border-color`, `color` in `.country-pill-active:hover` so it wins cascade as last rule with equal specificity.
- Active pill hover: blue background maintained, white text maintained, `filter: brightness(0.88)` darkens slightly to signal "clickable/will deselect." No opacity (opacity fades text too).
- Inactive pill hover: border turns accent, text turns accent. No background change — cleaner signal of "will be selected."

**Monthly reality check redesign (JSX):**
- Removed "MONTHLY GAP" stat entirely — the label said "gap" but the value said "Covered ✓", a confusing contradiction.
- Replaced the three-stat grid (living + part-time + gap) with two stats (living + part-time max) + one verdict sentence below the bar.
- Verdict sentences are plain English: "Fully covered — ~109 USD/month left over." / "59% covered — ~429 USD/month still needed from savings or family." / "All 570 USD/month must come from savings or family support."
- "surplus" → "left over" (more natural).
- "Part-time income" → "Part-time max" with `~` prefix (signals estimate, not guaranteed).
- "Not permitted" badge → "Part-time not permitted" (self-explanatory without needing context from the header).
- "max 20 hrs/wk allowed" → "max 20 hrs/wk" (shorter).
- Added `.reality-verdict` CSS class (0.88rem, 500 weight, 1.4 line-height).

**Files changed:** `frontend/src/pages/AnalyticsPage.jsx`, `frontend/src/index.css`

---

---

### 52. Cost Overview — Readability Polish

**Reason:** Country filter hover was unreadable (dark text on blue for active pills). KPI labels repeated "Avg" three times per card. Reality check had jargon labels and inline basis notes that cluttered each country row.

**Changes:**

- **Country pills hover**: inactive pill now shows accent-soft background + accent text on hover (clear "will select" signal). Active pill shows `opacity: 0.78` on hover (dim to signal "will deselect") with white text preserved.
- **KPI card labels**: removed "Avg" prefix from "Avg yearly cost", "Avg yearly tuition", "Avg monthly living" → "Yearly cost", "Yearly tuition", "Monthly living". Added `eyebrow="Country averages"` to each card so the averaging context is stated once, not repeated per row.
- **Stacked bar**: removed eyebrow "Tuition vs living expenses" — the legend immediately below already communicates this. Title + legend is enough.
- **Reality check eyebrow**: "How much of monthly living costs can part-time work offset?" → "Part-time work vs monthly living costs" (shorter, scannable).
- **"Part-time ref" label**: → "Part-time income". "Ref" is jargon; "income" is what it represents.
- **Inline coverage note**: removed ` · Reference: NT$183/hr × 20 hrs/wk` from per-country coverage line. This detail belongs in the bottom disclaimer, not repeated per country. `refBasis` removed from row return object and destructuring.
- **Bottom disclaimer**: tightened from 3 verbose sentences to 2 short ones. Same meaning, half the words.

**Files changed:** `frontend/src/pages/AnalyticsPage.jsx`, `frontend/src/index.css`

---

---

### 51. Analytics UX Fixes — Code Review Pass

**Scope:** AnalyticsPage.jsx (6 fixes) + AdmissionAnalyticsPage.jsx (2 fixes). Found by reading code only, no runtime needed.

**AnalyticsPage.jsx fixes:**

| # | Severity | Issue | Fix |
|---|---|---|---|
| 1 | High | Stacked bar native mode: `maxTotal` compared raw TWD vs THB vs SGD values — Singapore bar rendered ~8% wide, falsely appearing nearly free | Compute `totalUSD` per row and use `maxTotalUSD` for `outerWidth`. Display labels still show local currency. Segment proportions (tuition/living split) use display-currency ratio, which is valid within a single country. Native mode caption updated: "Bar widths use USD proportions for a fair cross-country comparison." |
| 2 | Medium | Reality check: "Covered ✓" shown when part-time > living cost, hiding the surplus amount | Added `surplusDisplay = max(-(living - partTime), 0)`. Gap label now shows `Covered ✓ (+X TWD surplus)` when surplus > 0, `Covered ✓` when break-even. |
| 3 | Medium | Insights: "the highest among selected countries" rendered when only 1 country allows part-time — trivially true, grammatically misleading | `qualifier` now empty string when `coverageRows.length === 1`. Sentence ends cleanly without the redundant phrase. |
| 4 | Medium | `Promise.all` for analytics + rules: if country-rules API fails, entire page went blank even if cost analytics loaded | Replaced with `Promise.allSettled`. Analytics failure → error state. Rules failure → silent degradation (reality check shows without part-time data). |
| 5 | Low | `partTimeCurr` declared and re-assigned but never consumed in JSX | Removed. |
| 6 | Low | `native` included in StackedCostBar row return but not used in render destructuring | Removed from return object. |

**AdmissionAnalyticsPage.jsx fixes:**

| # | Severity | Issue | Fix |
|---|---|---|---|
| 7 | Medium | Backend returns `program_id` in easiest/hardest programs — table showed plain text names with no way to navigate to the program | Wrapped `major_name` in `<Link to={/programs/${program.program_id}}>` matching the DeadlineInsightsPage pattern. Added `import { Link } from 'react-router-dom'`. |
| 8 | Low | No `data-freshness-note` — inconsistent with AnalyticsPage which has one | Added the same note below the section heading. |

**Files changed:** `frontend/src/pages/AnalyticsPage.jsx`, `frontend/src/pages/AdmissionAnalyticsPage.jsx`

---

---

### 50. Cost Overview — Full Page Rebuild

**Reason:** The previous Cost Overview page showed only 6 flat KPI cards and two basic bar charts. It did not answer the real questions a student has: "How much total?", "Where does the money go?", "Can part-time work help?", and "What am I not seeing here?" The page was rebuilt from scratch to directly answer all four.

**What changed:**

- **Country filter pills** — select/deselect Taiwan, Thailand, Singapore. Min 1 always selected. All sections react immediately.
- **Exchange rate reference** — moved above the KPI cards (USD mode only), so context is set before numbers appear.
- **KPI cards** — redesigned from 6 flat cards to one card per selected country, each showing 4 metrics: avg yearly cost, avg yearly tuition, per-semester cost, avg monthly living cost. Uses `kpi-metric-row` layout (label + value inline).
- **Viz 1: Annual Cost Breakdown** — stacked horizontal bar per country. Each bar = tuition segment + living segment. Outer bar width is proportional to the most expensive country (so bars are directly comparable). Breakdown numbers shown below each bar.
- **Viz 2: Monthly Reality Check** — per country: monthly living cost, part-time income reference, coverage %, gap remaining. Coverage shown as a green fill bar. `part_time_allowed` from `getCountryRules()` controls whether income is shown or "Not permitted" label appears.
- **Auto-generated insights** — 3–5 factual observations generated from the data at render time. Covers: cheapest country, cost ratio, best part-time offset %, non-permitted work countries, tuition composition share.
- **Disclaimer** — "Excludes application and insurance fees. Use Cost Calculator for full estimate." shown below KPI cards.
- **Part-time note** — Reference income is based on statutory minimum wage × legal hour limit. Clearly labeled "Reference only."

**Data sources used:**
- `getCostOverviewAnalytics()` → `/analytics/cost-overview` (unchanged endpoint)
- `getCountryRules()` → `/country-rules` (new call added to this page)
- Static `PART_TIME_REFERENCE` constants: Taiwan TWD 15,840/mo, Thailand THB 10,400/mo, Singapore SGD 780/mo

**Design decisions:**
- Proportional-to-max scaling for stacked bars — allows both total cost comparison and composition in one view
- `cheapest_programs` from backend skipped — program-level data belongs in Admission Overview or Compare, not country-level Cost Overview
- `ComparisonRow` component removed — replaced by `StackedCostBar`
- `formatDisplayCost` from `currency.js` used throughout (replaces local `formatValue` helper)

**Files changed:** `frontend/src/pages/AnalyticsPage.jsx` (full rewrite), `frontend/src/index.css` (new classes appended)

---

---

### 49. Back Button — Reusable Component Added Across All Entry-Point Pages

**Reason:** Students reaching pages via search results, recommendation cards, or direct URLs had no visible way to return without using the browser's own back button. Investigated every page and identified which ones genuinely need it (deep pages only — sidebar-navigated section pages don't need it since the sidebar provides full navigation context).

**New component:** `src/components/BackButton.jsx`
- Uses `navigate(-1)` from React Router v6 when `window.history.state?.idx > 0` — meaning a previous app page exists in the session history
- Falls back to `fallback` prop (default `"/"`) when opened via direct URL or new tab with no history
- Uses Lucide `ArrowLeft` icon
- Sits above `PageHeader` as the first element in the `page-stack`

**Pages updated:**
| Page | Reason |
|---|---|
| `ProgramDetailPage` | Reached from search, recommendation results, compare table, deadline page — most critical |
| `NotFoundPage` | Secondary escape alongside existing "Return home" link |
| `AdminLoginPage` | Placeholder page with no other exit |
| `AdminDashboardPage` | Placeholder page with no other exit |

**Pages intentionally skipped:** All sidebar-navigated pages (Decision Hub, Analytics, Legal, Red Flags, Settings, About) — sidebar handles all navigation there, a back button would be redundant.

**CSS added:** `.back-button` — inline-flex, transparent, muted color, hovers to full text color. Quiet, non-intrusive.

**Files changed:** `frontend/src/components/BackButton.jsx` (new), `frontend/src/index.css`, `frontend/src/pages/ProgramDetailPage.jsx`, `frontend/src/pages/NotFoundPage.jsx`, `frontend/src/pages/AdminLoginPage.jsx`, `frontend/src/pages/AdminDashboardPage.jsx`

---

---

### 48. Dead Files Deleted — Navbar.jsx and Home.jsx

**Action:** Deleted `src/components/Navbar.jsx` and `src/pages/Home.jsx` — confirmed unused via import scan. Neither file was referenced by any other file in the project.

---

---

### 47. Dead Files Identified — Navbar.jsx and Home.jsx

**Finding:** Two legacy files confirmed unused via import scan:
- `src/components/Navbar.jsx` — old flat top-navigation bar from pre-sidebar era. Contains obsolete flat route links (`/recommend`, `/compare`). Not imported anywhere.
- `src/pages/Home.jsx` — one-line re-export stub (`export { default } from './HomePage'`). Left behind when the file was renamed to `HomePage.jsx`. Not imported anywhere.

**Action:** No code changed. Both files are safe to delete. Flagged for cleanup.

---

---

### 46. Logo — Remove Circle Container

**Reason:** The `border-radius: 999px` + `background: var(--panel-soft)` + `padding` container clipped the corners of the new logo SVGs. Since the new logos are theme-aware and designed to sit directly on the panel background, the container is unnecessary.

**Changes:**
- `.sidebar-logo`: removed `border-radius`, `background`, `padding`; size adjusted to `36px` clean; added `flex-shrink: 0`
- `.home-search-logo`: removed `border-radius`, `background`, `padding`; size adjusted to `28px` clean; added `object-fit: contain`

**Files changed:** `frontend/src/index.css`

---

---

### 45. Logo — Theme-Aware SVGs + "UniMatch" Brand Name in Sidebar

**Reason:** Old `logo.svg` had hardcoded black fill, breaking in dark mode. Two new theme-specific files provided: `logo_light_without_text.svg` (black fill, for light mode) and `logo_dark_without_text.svg` (#F0F0F0 fill, for dark mode). Sidebar expanded state also had blank space next to the logo with no brand identity.

**Changes:**
- `Sidebar.jsx`: removed `logoIcon` import; imports `logoLight` and `logoDark`; reads `theme` from `useAppShell()`; computes `logoSrc = theme === 'dark' ? logoDark : logoLight`; added `<span className="sidebar-brand-name">UniMatch</span>` next to logo — hidden via visually-hidden CSS when collapsed, visible when expanded
- `HomePage.jsx`: same logo import + theme switch for the search bar badge
- `index.css`: added `align-items: center; gap: 10px` to `.sidebar-brand`; added `.sidebar-brand-name` (bold, no-wrap); added `.sidebar-collapsed .sidebar-brand-name` visually-hidden rule

**Files changed:** `frontend/src/components/Sidebar.jsx`, `frontend/src/pages/HomePage.jsx`, `frontend/src/index.css`

---

---

### 44. Home Page — Redesign Grid Layout for Two User Types

**Reason:** The previous layout served neither new users (no clear guided entry) nor purposeful users (search was stretched across 2 cols and looked awkward). Platform Summary contained internal documentation, not student-facing content.

**New grid:**
```
Row 1: [Search col 1] [Quick Actions col 2] [Leaderboard col 3, rows 1-2]
Row 2: [Country Snapshot cols 1-2]          [Leaderboard cont.]
```

- **Search (col 1, row 1)** — single column, comfortable width for purposeful users
- **Where to start / Quick Actions (col 2, row 1)** — new dedicated panel with 3 action cards, each with a one-line description. Serves new discovery users who don't know what to search yet
- **Best Value Universities (col 3, rows 1-2)** — unchanged, passive useful data
- **Country Snapshot (cols 1-2, row 2)** — replaces Platform Summary. Three big-number stat blocks (Taiwan / Thailand / Singapore program counts). Context without documentation

**Removed:** `home-welcome-panel` and `home-about-panel` (Platform Summary bullet points now live on About page)

**Added CSS:** `.home-actions-panel`, `.home-action-cards`, `.home-action-card`, `.home-action-card-title`, `.home-action-card-desc`, `.home-snapshot-panel`, `.home-country-grid`, `.home-country-card`, `.home-country-name`, `.home-country-count`, `.home-country-label`

**Files changed:** `frontend/src/pages/HomePage.jsx`, `frontend/src/index.css`

---

---

### 43. Home Page — Reorder Grid for Student-First UX

**Reason:** Original order (Welcome → Search → Platform Summary → Leaderboard) put marketing copy above the two most useful student-facing elements. Students arrive with questions, not wanting to read mission statements first.

**New visual order:**
1. Trust strip (unchanged)
2. **University Explorer** (row 1, cols 1–2) — search is the primary action
3. **Best Value Universities** (col 3, rows 1–2) — instant affordable-program signal
4. **Quick actions / Make an informed decision** (row 2, col 1) — orientation after student has context
5. **Platform Summary** (row 2, col 2) — metadata last

**CSS:** `home-search-panel` gets `grid-column: 1/3; grid-row: 1`; `home-welcome-panel` moves to `grid-column: 1; grid-row: 2`; `home-about-panel` gets `grid-column: 2; grid-row: 2`; mobile reset updated.

**Files changed:** `frontend/src/pages/HomePage.jsx`, `frontend/src/index.css`

---

---

### 42. University Explorer — Simplified Search UX

**Reason:** Previous attempt to add a Coursera-style search (floating dropdown, `isSearchActive` state, `mousedown` outside-click handler, `searchContainerRef`) introduced two bugs: results rendered outside the ref caused the University Explorer panel to expand, and the `mousedown` handler unmounted result cards before their `click` event could fire, making links unclickable.

**Fix:** Removed all active-state complexity and rewrote the search section with a simple `searchTerm.trim()` conditional:
- No search term → recent searches shown as chip buttons (`.recent-search-chip`), plus a program count hint
- Has term → inline `search-result-card` results, or no-match message if nothing found
- No `isSearchActive` state, no `searchContainerRef`, no `mousedown` handler
- Result links are always clickable and panel layout never shifts

**Files changed:**
- `frontend/src/pages/HomePage.jsx`

---

---

### 41. Icons — Replaced All Nav Icons with Lucide React

> **Action required:** Run `npm install lucide-react` inside `educompare-project/frontend/` before starting the dev server, or the app will crash on import.

**Reason:** Existing SVG icon files were basic placeholders with inconsistent quality. Lucide React provides a clean, MIT-licensed, consistent stroke icon set. Icons now inherit `currentColor` — they respond correctly to theme and CSS color without any filter hacks.

**Icon mapping:**

| Location | Old SVG | Lucide component |
|---|---|---|
| Home | `home.svg` | `House` |
| Decision Hub | `decision_hub.svg` | `Compass` |
| Analytics | `analytics.svg` | `BarChart2` |
| Legal Info | `legal.svg` | `Scale` |
| Red Flag Guide | `warning.svg` | `ShieldAlert` |
| Settings (footer) | `setting.svg` | `Settings` |
| About (footer) | `language.svg` (placeholder) | `Info` |
| Topbar language toggle | `language.svg` | `Languages` |
| Topbar theme toggle | `moon.svg` | `Moon` |

**Changes:**

- `frontend/src/components/Sidebar.jsx`:
  - Removed all 7 SVG icon imports from `assets/icons/`
  - Added `import { BarChart2, Compass, House, Info, Scale, Settings, ShieldAlert } from 'lucide-react'`
  - `navConfig` and `footerLinks` now store Lucide component references (e.g. `icon: House`) instead of SVG import variables
  - Render: `const Icon = item.icon` then `<Icon className="sidebar-link-icon" aria-hidden="true" />` — dynamic component pattern
  - `IconImage` import kept (still used for the logo SVG)

- `frontend/src/components/Layout.jsx`:
  - Removed `languageIcon`, `moonIcon` SVG imports and `IconImage` import
  - Added `import { Languages, Moon } from 'lucide-react'`
  - Replaced both `<IconImage>` topbar icon usages with `<Languages>` and `<Moon>`

- `frontend/src/index.css`:
  - Removed `filter: invert(1)` from dark-mode rule for `.sidebar-link-icon` and `.topbar-icon` — this was a workaround for black SVGs; Lucide icons use `currentColor` and invert correctly with the theme automatically

**Old SVG files:** Left in place at `assets/icons/` — not deleted, not imported. Safe to remove later once your friend confirms icons look good.

---

---

### 40. Collapsed Sidebar — CSS Fly-out Submenu for Group Navigation

**Reason:** In collapsed (icon-only) mode, Decision Hub and Analytics group icons gave no hint that sub-pages existed underneath them. Students could only reach sub-pages by expanding the sidebar first.

**Solution:** Pure CSS hover fly-out — no JavaScript required. When the sidebar is collapsed and the student hovers a group icon, a floating panel appears to the right listing all sub-pages. Hovering the panel itself keeps it visible (the panel is a DOM child of the group so the parent `:hover` stays active — no gap, no JS timer needed).

**Changes:**

- `frontend/src/components/Sidebar.jsx`:
  - Added `<div className="sidebar-flyout">` inside each group render (always in DOM, display:none by default)
  - Fly-out contains: group title (small uppercase label), divider, all children as `NavLink`s
  - Uses same `sidebar-flyout-link` / `sidebar-flyout-link-active` classes for active styling
  - Marked `aria-hidden="true"` since it duplicates the expanded sub-links (screen readers use expanded mode)

- `frontend/src/index.css`:
  - `.sidebar-flyout { display: none }` — hidden in all modes by default
  - `.sidebar-collapsed .sidebar-group { position: relative }` — added to existing rule so fly-out can be absolutely positioned relative to the group
  - `.sidebar-collapsed .sidebar-group:hover .sidebar-flyout` — reveals panel: `position: absolute; left: 100%; top: 0` (right edge of sidebar), `min-width: 188px`, panel-bg background, border, border-radius: 10px, box-shadow, z-index: 100
  - Added `.sidebar-flyout-title`, `.sidebar-flyout-divider`, `.sidebar-flyout-link`, `.sidebar-flyout-link-active`

**Result:** Collapsed sidebar now fully navigable. Hovering Decision Hub or Analytics icon shows all sub-pages instantly. No sidebar expansion required.

---

---

### 39. About Page — Placeholder Under Settings in Sidebar Footer

**Reason:** Added a simple About page accessible from the sidebar footer, below Settings.

**Changes:**

- `frontend/src/pages/AboutPage.jsx` — new placeholder page with: project description InfoCards, platform details (version, dataset date, country count), data source note, disclaimer
- `frontend/src/App.jsx` — added `GET /about` route and `AboutPage` import
- `frontend/src/components/Sidebar.jsx`:
  - `footerLink` (single object) → `footerLinks` (array)
  - Added `{ to: '/about', label: 'About', icon: languageIcon }` entry (language.svg used as placeholder icon)
  - Footer renders `footerLinks.map(...)` instead of a single NavLink

---

---

### 38. Sidebar — Nested Groups Replace Secondary Navigation Bars

**Reason:** Decision Hub and Analytics each had a horizontal secondary nav bar (SectionNav) at the top of their content area. This created two navigation systems for students to learn. Folding sub-items directly into the sidebar gives one consistent navigation pattern throughout the app.

**Changes:**

- `frontend/src/components/Sidebar.jsx` — full rewrite:
  - `navItems` array replaced with typed `navConfig` array: `{ type: 'link' }` for flat links, `{ type: 'group' }` for expandable sections
  - Decision Hub group: children are Recommendation, Compare, Cost Calculator
  - Analytics group: children are Cost Overview, Admission Overview, Deadline Insights, Ranking Insights
  - `openGroups` state (Set) tracks which groups are expanded; initialized from current path on mount
  - `useEffect` auto-expands the correct group when path changes (handles direct navigation / browser back)
  - `toggleGroup(key)` flips open/closed for expanded sidebar
  - `handleGroupClick(item)`: when sidebar is collapsed (icon-only), clicking a group navigates directly to its `defaultTo` child; when expanded, it toggles the group
  - Group button shows chevron (›) that rotates 90° when open
  - Active group button gets `sidebar-group-btn-active` class (matches sidebar-link hover style)
  - Sub-links use `NavLink` with `sidebar-sub-link` / `sidebar-sub-link-active` classes
  - Removed `t()` translation wrapper on labels (labels are plain strings; i18n can be re-added later)
  - Added `useNavigate` import

- `frontend/src/pages/AnalyticsLayoutPage.jsx` — simplified to `<Outlet />` only (removed PageHeader, SectionNav, section-shell wrapper)

- `frontend/src/pages/DecisionHubLayoutPage.jsx` — simplified to `<Outlet />` only (removed PageHeader, SectionNav, section-shell wrapper)

- `frontend/src/pages/AnalyticsPage.jsx`:
  - Added data freshness note here since AnalyticsLayoutPage no longer renders it

- `frontend/src/index.css`:
  - Added `.sidebar-group`, `.sidebar-group-btn`, `.sidebar-group-btn-active`
  - Added `.sidebar-group-chevron`, `.sidebar-group-chevron-open` (rotates on open)
  - Added `.sidebar-group-children` (indented container for sub-links)
  - Added `.sidebar-sub-link`, `.sidebar-sub-link-active`
  - Added collapsed overrides: group centered at 52×52px, chevron hidden, children never rendered (handled in JSX)

**Result:** Students see one sidebar with expandable Decision Hub and Analytics groups. No horizontal tab bars. Collapsing the sidebar still works — group icons navigate directly to their default child.

---

---

### 37. Ranking Insights Page — QS World University Rankings

**Reason:** Singapore universities have verified QS World University Rankings data (`world_rank` field in the University model). The Ranking Insights route was previously a static placeholder. Now that real data exists, the page shows it.

**Changes:**

- `backend/main.py`:
  - Added `GET /analytics/ranking-overview` endpoint
  - Queries all universities, filters to those with a non-empty `world_rank`, parses rank as integer, sorts ascending
  - Returns `{ universities: [...] }` with `university_id`, `university_name`, `country_id`, `country_name`, `city`, `university_type`, `world_rank`, `official_website`
  - Adds `RANKING_COUNTRY_NAMES` map: `C001→Taiwan`, `C002→Thailand`, `C003→Singapore`

- `frontend/src/api/api.js`:
  - Added `getRankingOverview()` calling `GET /analytics/ranking-overview`

- `frontend/src/pages/RankingInsightsPage.jsx` — new file:
  - Fetches ranking data and groups by `country_name`
  - Shows a data source InfoCard: QS World University Rankings 2025, link to topuniversities.com
  - Shows one InfoCard per country with a ranked table (QS Rank, University name linked to official site, City, Type)
  - Ranks ≤100 highlighted with accent color; others shown in muted
  - Shows a "Pending ranking data" InfoCard listing Taiwan and Thailand as pending
  - Countries with no ranked data are skipped in the ranked section entirely

- `frontend/src/App.jsx`:
  - Replaced static `AnalyticsPlaceholderPage` on `/analytics/ranking` with `RankingInsightsPage`
  - Added `import RankingInsightsPage` at top

- `frontend/src/index.css`:
  - Added `.ranking-rank-cell` — bold rank number, muted by default
  - Added `.ranking-rank-top` — accent color for ranks ≤100
  - Added `.pending-country-tags` and `.pending-country-tag` — pill tags for pending countries

**Result:** `/analytics/ranking` now shows a live table of Singapore's 4 QS-ranked universities (NUS #8, NTU #12, SMU #511, SUTD #519), with a clear source attribution and a pending notice for Taiwan and Thailand.

---

## [2026-04-19] — Kaung Khant Lin

---

### 36. Deadline Handling Consistency — Shared Date Utility (Date-Only Logic)

**Reason:** Deadline overdue checks were inconsistent across pages. Some places compared full DateTime (`new Date(deadline) < new Date()`), while others used date-only comparisons. This could produce different red-warning results around timezone/day-boundary edges.

**Changes:**

- `frontend/src/utils/date.js` — new shared utility file:
  - Added `parseISODateOnly(dateStr)` to parse `YYYY-MM-DD` into local date-only values
  - Added `getTodayAtStartOfDay()` to normalize "today" to midnight
  - Added `isDeadlinePassed(dateStr)` as the single shared overdue check

- `frontend/src/components/ResultCard.jsx`:
  - Removed local `isDeadlinePassed()` implementation
  - Imported shared `isDeadlinePassed` from `utils/date`
  - Recommendation card deadline red-warning now uses date-only logic

- `frontend/src/components/CompareTable.jsx`:
  - Removed local `isDeadlinePassed()` implementation
  - Imported shared `isDeadlinePassed` from `utils/date`
  - Compare table deadline row now uses the same date-only overdue rule

- `frontend/src/pages/DeadlineInsightsPage.jsx`:
  - Replaced raw `new Date(...)` comparisons with shared date utility functions
  - Added parsed deadline field (`parsed_deadline`) for stable sorting/filtering
  - Updated upcoming/passed split to compare date-only values consistently
  - Updated `daysUntil()` and `daysSince()` to use parsed date-only values

- `frontend/src/pages/ProgramDetailPage.jsx`:
  - Removed local deadline helper implementation
  - Imported shared `isDeadlinePassed` from `utils/date`
  - Program Detail overdue label now follows the same rule as Recommendation, Compare, and Deadline Insights

**Result:** Overdue deadline styling is now computed by one shared date-only rule across all major deadline surfaces.

---

### 35. Singapore (C003) — Full Platform Rollout

**Problem:** Singapore universities added to CSV data but the entire frontend and both backend analytics endpoints were hardcoded to Taiwan and Thailand only. SGD was missing from the currency utility entirely, causing `NaN` costs for all Singapore programs across every page.

**Decision:** Make the system data-driven wherever possible. Backend analytics endpoints now build country groups dynamically from the database — adding a future 4th country requires zero backend changes. Frontend analytics pages loop over `Object.keys(data.countries)` instead of reading by hardcoded key. Only the budget conversion logic (which maps country IDs to currency codes) and display labels remain explicit.

**Exchange rates used (source: XE.com, 19 April 2026):**
- 1 USD = 1.27282557 SGD
- 1 SGD = 0.78560070 USD

**Changes:**

- `frontend/src/utils/currency.js`:
  - Added `SGD: 0.78560070` to `TO_USD`
  - Added `SGD: 1.27282557` to `FROM_USD`

- `frontend/src/components/ResultCard.jsx`:
  - Added `C003: 'Singapore'` to `COUNTRY_NAMES`

- `frontend/src/pages/ProgramDetailPage.jsx`:
  - Added `C003: 'Singapore'` to `COUNTRY_NAMES`

- `frontend/src/pages/DeadlineInsightsPage.jsx`:
  - Added `C003: 'Singapore'` to `COUNTRY_NAMES`

- `frontend/src/pages/HomePage.jsx`:
  - Added `C003: 'Singapore'` to `COUNTRY_NAMES`
  - Trust strip: added Singapore
  - University Explorer description: added Singapore
  - Platform Summary: added Singapore records count

- `frontend/src/components/Layout.jsx`:
  - Topbar currency label: `'TWD · THB'` → `'Local'` (scales to any number of countries)
  - Toggle button aria-labels updated accordingly

- `frontend/src/pages/RecommendationPage.jsx`:
  - Budget label, `formatBudgetPreview`, and `handleSubmit` all updated for C003/SGD
  - "No country selected" budget preview now includes SGD alongside TWD and THB
  - Result section currency label: `'TWD · THB'` → `'local currencies'`
  - Toggle button text updated

- `backend/main.py` — `analytics_cost_overview` and `analytics_admission_overview`:
  - Moved `country_rules` query to before the records query so it can drive the empty-state response
  - `country_groups` dict now built dynamically from `country_name_map` values
  - Added `C003: 'singapore'` to `fallback_country_names`
  - Return statement now iterates all groups: `{name: summarize(...) for name, entries in country_groups.items()}`
  - Singapore data is no longer silently dropped

- `frontend/src/pages/AnalyticsPage.jsx` — full rewrite:
  - Added `COUNTRY_CURRENCY`, `COUNTRY_LABEL`, `COUNTRY_FILL_CLASS` lookup maps
  - All KPI cards, comparison bars, and exchange rate card now driven by `Object.keys(data.countries)`
  - `ComparisonRow` now accepts `entries: [{key, value, currency}]` array instead of hardcoded taiwan/thailand props
  - Removed `CheapestProgramsTable` and cheapest programs two-column grid
  - Exchange rate card simplified: USD mode shows 3 rates (TWD, THB, SGD); Local mode shows a brief note with XE.com link
  - Removed `TWD_TO_THB` and `THB_TO_TWD` imports (no longer used)

- `frontend/src/pages/AdmissionAnalyticsPage.jsx` — full rewrite:
  - Added `COUNTRY_LABEL`, `COUNTRY_FILL_CLASS` lookup maps
  - KPI cards and comparison bars now driven by `Object.keys(data.countries)`
  - `ComparisonRow` updated to same `entries` array pattern
  - `mergeRankedPrograms` now merges all countries from `countryData` (not just taiwan + thailand)
  - `buildInsights` now finds lowest/highest across all countries dynamically

- `frontend/src/pages/SettingsPage.jsx`:
  - Display currency button label: "Native" → "Local" to match the topbar which also shows "Local"
  - Display currency description updated: was hardcoded "Taiwan in TWD and Thailand in THB" — now lists all three: "Taiwan in TWD, Thailand in THB, Singapore in SGD"
  - Description reworded to explain USD mode as useful for cross-country comparison

- `frontend/src/pages/LegalGuardrailPage.jsx`:
  - "Compare countries" planned feature card text updated: removed stale text saying the tool was removed "because it only worked while the platform has exactly two countries" and "when a third country is added" — both were factually wrong after Singapore was added
  - Card now simply states the feature is planned and directs users to the country list in the meantime

- `frontend/src/index.css`:
  - Added `.comparison-fill-singapore { background: #7ab5a0 }` (muted sage green)

---

---

### 34. Sidebar — Expand/Collapse + Logout Moved to Settings

**Problem:** Sidebar was icon-only (96px) with hidden labels, making navigation unclear. Logout lived in the sidebar footer but Settings is the more appropriate home for session management.

**Design decision:** Default sidebar is expanded (200px) with visible labels — students should see what each nav item does on first visit. A `‹`/`›` toggle at the sidebar bottom replaces the logout button. Collapse preference is persisted to localStorage. The `.sidebar-collapsed` class on `.dashboard-shell` drives all CSS changes via the `--rail-width` custom property cascade — no JS-controlled inline styles.

**Changes:**

- `frontend/src/context/AppShellContext.jsx`:
  - Added `SIDEBAR_COLLAPSED_KEY` localStorage key
  - Added `isSidebarCollapsed` state (default `false` = expanded)
  - Added `toggleSidebarCollapsed` action
  - Persisted collapse state to localStorage via `useEffect`
  - Added `isSidebarCollapsed` and `toggleSidebarCollapsed` to context value and `useMemo` deps

- `frontend/src/components/Layout.jsx`:
  - Applied `sidebar-collapsed` class to `.dashboard-shell` when `isSidebarCollapsed` is true
  - Renamed topbar label "Mode" → "Theme"

- `frontend/src/components/Sidebar.jsx`:
  - Removed `logoutIcon` import and logout from `footerItems`
  - Removed logout `NavLink` from sidebar footer
  - Added `‹`/`›` collapse toggle button at the bottom of the sidebar footer
  - Button uses `.sidebar-collapse-icon` + `.sidebar-link-label` so it hides/shows label exactly like nav links

- `frontend/src/pages/SettingsPage.jsx`:
  - Updated page description to student-facing copy: "Adjust how the platform looks and displays information for you."
  - Added Account `InfoCard` at the bottom with "Sign out" link (`Link to="/logout"`)
  - Imported `Link` from react-router-dom

- `frontend/src/index.css`:
  - Changed `--rail-width` from `96px` → `200px` (expanded default)
  - Added `.sidebar-collapsed { --rail-width: 96px }` — single override cascades to sidebar width and main content margin simultaneously
  - Updated `.sidebar-panel` — `align-items: stretch` (was `center`)
  - Split `.sidebar-brand, .sidebar-footer` shared rule into two separate rules — brand gets `flex-start` + padding, footer gets `align-items: stretch`
  - Updated `.sidebar-nav` — `align-items: stretch`, `gap: 4px`, horizontal padding
  - Updated `.sidebar-link` — full-width, `flex-start`, `height: 44px`, padding, font weight/size, color
  - Updated `.sidebar-link-icon` — `22px` (was `28px`) with `flex-shrink: 0`
  - Updated `.sidebar-link-label` — now visible by default (`flex: 1`, ellipsis overflow); removed sr-only clip
  - Added `.sidebar-collapse-btn` — same layout as `.sidebar-link` but muted color, for the toggle button
  - Added `.sidebar-collapse-icon` — sized wrapper for the `‹`/`›` character
  - Added `.sidebar-collapsed .sidebar-*` overrides — restores icon-only layout (52px square links, centered, hidden labels) when collapsed
  - Added `.danger-text-button` — inline link style with danger color for the Settings page sign-out link

---

---

### 33. Recommendation Page — Budget Input UX (Currency-Aware + Progressive Disclosure)

**Problem:** Three issues with the budget field:
1. Number had no formatting after typing — `200000` showed as-is with no commas, hard to read
2. Students who think in USD had no way to use the budget field — it expected native currency (TWD/THB) with no conversion
3. Hint text and context notes showed upfront before the student typed anything — form felt cluttered before any interaction

**Design decision:** The existing topbar currency toggle (USD ↔ TWD · THB) already captures the student's currency preference for the whole app. The budget input should follow that same preference — no second currency control anywhere.

**Changes:**

- `frontend/src/pages/RecommendationPage.jsx`:
  - Added `convertCurrency` import from `utils/currency`
  - Budget label now reads `displayCurrency` from `useAppShell()` — the same topbar preference already used everywhere else
  - Label suffix shows current currency: `Maximum yearly budget (USD)` or `(TWD)` or `(THB)` based on topbar setting and country selected
  - `formatBudgetPreview(rawValue, isUSD, countryId)` — formats the entered amount and shows conversion:
    - USD mode + Taiwan: `$5,000 USD ≈ 157,494 TWD/yr`
    - USD mode + Thailand: `$5,000 USD ≈ 159,537 THB/yr`
    - USD mode + no country: `$5,000 USD ≈ 157,494 TWD · 159,537 THB/yr`
    - Native mode + country: `200,000 TWD/yr` (formatted with commas — solves the readability issue)
  - Budget preview and "Covers tuition + living costs combined." note appear **only after the student types a value** — nothing shown when field is empty
  - GPA scale hint (`4.0 scale — 80% ≈ 3.2, 70% ≈ 2.8`) appears **only after the student types a GPA value**
  - `handleSubmit` converts budget to native before sending to backend when `displayCurrency === 'USD'` (converts to THB if Thailand selected, TWD otherwise)
  - When `displayCurrency` is native, budget is sent as-is — no conversion needed

- `frontend/src/index.css`:
  - Added `.label-unit` — small muted style for the `(USD)` / `(TWD)` / `(THB)` suffix in the label
  - Added `.budget-hints` — flex column wrapper for preview + context note
  - Added `.budget-preview` — accent-coloured formatted preview line (e.g. `$5,000 USD ≈ 157,494 TWD/yr`)

---

---

### 32. Full Site Performance and UX Audit — Five Fixes

**Reason:** Pre-recording audit found five issues: internal DB ID leaking in the loading title, program IDs visible in the compare table, 5 redundant API calls on compare submit, developer-facing description text in two more pages, and three pages showing a completely blank screen while loading.

---

**Fix 1 — ProgramDetailPage: "Loading program P001..." → "Loading..."**

- `frontend/src/pages/ProgramDetailPage.jsx`
- The loading title used `` `Loading program ${programId}...` `` which exposed the internal database ID (P001, P002) to users during the 1–2s API load time. Students see this as a broken error message, not a loading state.
- Changed to `'Loading...'`
- Also cleaned the PageHeader description from developer notes to student-facing copy

---

**Fix 2 — CompareTable: program IDs removed from column headers and rows**

- `frontend/src/components/CompareTable.jsx`
- Table column headers were `{left.program_id}` / `{right.program_id}` — showing "P001" / "P002" to students
- First data row was `{ label: 'Program ID', ... }` — another internal ID exposure
- Column headers changed to use `{left.university}` / `{right.university}` — shows university name, which is meaningful
- "Program ID" row removed from dataRows entirely

---

**Fix 3 — CompareProgramsPage: 5 API calls reduced to 2**

- `frontend/src/pages/CompareProgramsPage.jsx`
- Previous flow on compare submit: `getComparePrograms` (1) → `getProgramDetail` × 2 (2) → `getRequirements` × 2 (2) = **5 calls**
- `getRequirements` was redundant — `getProgramDetail` already returns `requirements` in its response
- `getComparePrograms` was also redundant — all its fields are already in `getProgramDetail`
- New flow: **2 parallel `getProgramDetail` calls** → same data, 60% fewer API calls
- Removed unused `getComparePrograms` and `getRequirements` imports
- `toRow()` helper maps `getProgramDetail` response shape to the fields `CompareTable` expects

---

**Fix 4 — Developer-speak text removed from Compare and Cost Calculator**

- `frontend/src/pages/CompareProgramsPage.jsx` — section heading and FormSection description rewritten for students
- `frontend/src/pages/CostCalculatorPage.jsx` — same; removed "endpoint", "backend-calculated", "live program" language

---

**Fix 5 — Blank loading state on three pages**

- `frontend/src/pages/AnalyticsPage.jsx`
- `frontend/src/pages/AdmissionAnalyticsPage.jsx`
- `frontend/src/pages/LegalGuardrailPage.jsx`
- All three showed a completely blank page (`{data ? ... : null}`) while the API call was in flight
- Added `{!data && !error ? <p className="muted-text">Loading...</p> : null}` before the data block on each — gives users immediate visual feedback that something is happening

---

---

### 31. Neon DB Idle Connection Fix — SQLAlchemy Pool Settings

**Problem:** After ~5 minutes of inactivity, Neon DB (free tier serverless PostgreSQL) auto-suspends its compute. SQLAlchemy's connection pool held the old connections without knowing they were dead. The next API call tried to reuse a stale connection, failed, and returned a 500 — causing the frontend to show "data could not be loaded" until the user refreshed.

**Root cause:** `create_engine(DATABASE_URL)` with no pool configuration — no pre-ping, no recycle timer.

**Fix:**

- `backend/database.py`
- Added `pool_pre_ping=True` — SQLAlchemy silently runs `SELECT 1` before handing a connection to any endpoint. If the connection is dead (Neon closed it during suspend), SQLAlchemy discards it and creates a fresh one before the request is processed. The endpoint never sees the stale connection.
- Added `pool_recycle=280` — any connection older than 280 seconds is proactively replaced. Neon suspends at ~300 seconds, so connections are recycled just before that threshold, preventing stale connections from accumulating in the pool.
- **Result:** After inactivity, the first request reconnects automatically — no error, no refresh needed. Neon's cold-start wake-up (1–2 seconds) is absorbed by the pre-ping reconnect.

---

---

### 30. Deadline Insights Page — Review and Fixes

**Reason:** Page was functional but had four issues: raw country IDs showing in both tables, grammar errors ("1 days ago"), no handling of the "Due today" edge case, and no way for students to click from a deadline directly to the program detail.

---

**Fix 1 — Country code → country name**

- `frontend/src/pages/DeadlineInsightsPage.jsx`
- Added `COUNTRY_NAMES` map (`C001 → Taiwan`, `C002 → Thailand`)
- Both the upcoming table and the passed table now show "Taiwan" / "Thailand" instead of raw IDs
- Fallback to raw `country_id` if an unknown code appears

---

**Fix 2 — Grammar: singular vs plural days**

- `frontend/src/pages/DeadlineInsightsPage.jsx`
- Replaced raw `{daysSince(...)} days ago` and `{daysUntil(...)} days left` with two helper functions:
  - `formatDaysLeft(n)` — returns `"Due today"` for 0, `"1 day left"` for 1, `"N days left"` otherwise
  - `formatDaysSince(n)` — returns `"1 day ago"` for 1, `"N days ago"` otherwise
- Applied to both tables and the "Next closing deadline" KPI card

---

**Fix 3 — "0 days left" edge case**

- `frontend/src/pages/DeadlineInsightsPage.jsx`
- If today is the deadline date, `daysUntil()` returns `0`. Previously this showed "0 days left".
- `formatDaysLeft(0)` now returns `"Due today"` instead

---

**Fix 4 — Program name links to detail page**

- `frontend/src/pages/DeadlineInsightsPage.jsx`
- Added `Link` import from `react-router-dom`
- Program name cells in both tables are now `<Link>` to `/programs/${p.program_id}`
- The "Next closing deadline" KPI card program name is also a link
- Students can now go directly from a closing deadline to the full program detail without extra navigation

---

---

### 29. Backend Input Validation + Home Search CSS Fix

**Reason:** `/recommend/programs` accepted out-of-range and negative numeric inputs with no guard. A bad `preferred_deadline_before` string would crash the endpoint with an unhandled 500. `/compare/programs` had no count guard on the IDs list. The home search results container had a CSS bug making the gap between cards silently ignored.

---

**Fix 1 — `/recommend/programs`: numeric query parameter bounds**

- `backend/main.py`
- Added `Query` import from FastAPI
- `user_gpa`: bounded `ge=0.0, le=4.0` — IELTS-style scale; negative values and values above 4.0 now return a clean 422
- `user_ielts`: bounded `ge=0.0, le=9.0` — IELTS max is 9.0; out-of-range values return 422
- `max_budget`: bounded `ge=0` — negative budget makes no sense; now returns 422
- `limit`: bounded `ge=1, le=50` — prevents `limit=0` (empty response) and `limit=99999` (full table dump)
- `offset`: bounded `ge=0` — negative offset is undefined behaviour
- All bounds include descriptions that appear in the FastAPI `/docs` Swagger UI

---

**Fix 2 — `/recommend/programs`: date crash guard**

- `backend/main.py`
- `preferred_deadline_before` is a raw string parsed with `date.fromisoformat()`. Previously any invalid string (e.g. `"2026/01/01"` or `"next-month"`) caused an unhandled exception → **500 Internal Server Error**
- Wrapped in `try/except ValueError` — now returns **422** with a clear message: `"preferred_deadline_before must be a valid ISO date in YYYY-MM-DD format."`

---

**Fix 3 — `/compare/programs`: ID count validation**

- `backend/main.py`
- No count guard existed — could pass 1 ID (compare nothing against nothing) or 50 IDs (unexpected load)
- Added: `if not (2 <= len(ids) <= 4): raise HTTPException(422, ...)`
- Empty strings from trailing commas now filtered out with `if pid.strip()` during split

---

**Fix 4 — Home search results: CSS gap bug**

- `frontend/src/index.css`
- `.search-results` had `gap: 10px` but no `display: flex` — `gap` is a flex/grid-only property and was silently ignored, causing result cards to stack with zero spacing
- Added `display: flex; flex-direction: column;` so the gap renders correctly

---

---

### 28. Recommendation Page — Student-Facing UX Fixes

**Reason:** The country code `C002` was leaking into result cards. Multiple text strings in the Recommendation page were developer-facing notes written during build, not student-facing copy. Score breakdown display was ambiguous. Empty state was the same message before and after submitting.

---

**Fix 1 — Country code displayed as raw ID in result cards**

- `frontend/src/components/ResultCard.jsx`
- `item.country_id` was rendered directly, showing `C001` or `C002` to students
- Added `COUNTRY_NAMES` map (`C001 → Taiwan`, `C002 → Thailand`) and resolved the label before render
- Fallback to raw `country_id` if an unknown code appears

---

**Fix 2 — Score badge clarified**

- `frontend/src/components/ResultCard.jsx`
- Changed from `45 / 75` to `45 / 75 pts` — added "pts" so the number reads as points, not a fraction

---

**Fix 3 — Match breakdown labels and visual**

- `frontend/src/components/ResultCard.jsx`
- `"Score breakdown"` heading → `"Match breakdown"`
- Score key labels changed from `budget fit` / `gpa fit` (lowercase, technical) to `Budget` / `GPA` / `IELTS` / `Deadline` via `SCORE_LABELS` map
- Earned points show as `+25` in accent colour (`.score-earned`)
- Zero / not-evaluated items show as `—` in muted colour (`.score-zero`) — removes confusion between "not entered" and "didn't qualify"
- Added `.score-earned` and `.score-zero` CSS classes to `index.css`

---

**Fix 4 — All developer-speak text replaced**

- `frontend/src/pages/RecommendationPage.jsx`
- Page heading description was: `"Country, degree level, and instruction language remain strict backend filters. Budget, GPA, and IELTS are sent as scoring inputs only."` → Now: student-facing explanation of how filters vs. scoring work
- FormSection description was: `"Use the live dataset and existing recommendation endpoint without recreating backend logic in the frontend."` → Now: `"All fields are optional — fill in what you know. More inputs give more accurate results."`
- Results heading description: `"Results are sorted by backend score."` → `"Programs ranked by how well they match your profile."`

---

**Fix 5 — Meaningful empty state before and after search**

- `frontend/src/pages/RecommendationPage.jsx`
- Added `hasSearched` state, set to `true` on first submit
- Before search: `"Fill in your profile above and click Get recommendations."`
- After search with zero results: `"No programs matched your criteria. Try broadening your filters."`
- When results exist: added result count line `"Showing 8 programs matching your profile."`

---

---

### 27. Full Project Audit — Five Fixes

**Reason:** Pre-shipping audit of the full backend and frontend identified five real issues: two N+1 query bugs (performance), schema/model type mismatches (silent 500 risk), a budget input with no currency context (wrong results with no feedback), and missing 404 differentiation on the program detail page.

---

**Fix 1 — `/recommend/programs`: N+1 eliminated**

- `backend/main.py`
- Was: 3 separate DB queries inside a Python loop for every program — `3N + 1` total (151 queries for 50 programs)
- Now: 4 bulk queries before the loop, results stored in lookup maps (`university_map`, `cost_map`, `req_map`)
- Scoring logic, filters, and response shape unchanged — only data fetching changed

---

**Fix 2 — `/compare/programs`: N+1 eliminated**

- `backend/main.py`
- Was: 2 separate queries per program ID inside the loop
- Now: 3 queries total — programs, then universities and costs filtered by the specific IDs only
- Also added `.strip()` to each ID in the split to guard against accidental whitespace

---

**Fix 3 — `schemas.py`: nullable fields aligned with models**

- `backend/schemas.py`
- SQLAlchemy columns are nullable by default unless `nullable=False` is set. Several Pydantic schemas had non-optional fields for columns that are nullable in the models — any record with a null in those fields would cause a silent 500.
- Changes:
  - `ProgramSchema`: `duration_years`, `intake`, `application_deadline`, `source_url`, `last_verified_date` → all `| None = None`
  - `UniversitySchema`: `city`, `university_type`, `official_website`, `source_url`, `last_verified_date` → all `| None = None`
  - `RequirementSchema`: `source_url`, `last_verified_date` → `| None = None`
  - `CountryRuleSchema`: `visa_type`, `source_url`, `last_verified_date` → `| None = None`; `min_hourly_wage` type corrected from `float | None` → `str | None` (model stores String, not Numeric)
  - `CostAndFinanceSchema`: `source_url`, `last_verified_date` → `| None = None`; core cost fields (`tuition_fee_per_semester`, `avg_monthly_living_cost`, `currency`) kept required

---

**Fix 4 — Recommendation budget input: currency context added**

- `frontend/src/pages/RecommendationPage.jsx`
- The budget field sent a raw number to the backend, which compares it against native currency costs (TWD or THB). A user thinking in USD would get zero results with no explanation.
- Now: placeholder dynamically shows the expected currency based on country selection (`e.g. 200000 TWD` / `e.g. 200000 THB` / generic fallback)
- A muted hint paragraph always shows below the input explaining which currency to use, updating when country is selected

---

**Fix 5 — `ProgramDetailPage`: 404 differentiation**

- `frontend/src/pages/ProgramDetailPage.jsx`
- Previously the catch block gave the same message for network errors and 404s. The page title also stayed as "Loading program X..." even when an error had occurred.
- Now: catches `err?.response?.status === 404` separately and shows `Program "X" was not found in the database.` vs the generic server error message
- PageHeader title now shows `'Program not found'` when `error` is set, instead of the loading string

---

## Deferred / Future Revisit

Items recorded here are intentionally not built yet. They are parked for a future session. Do not mix these with the change log above.

---

---

### 26. Home Page — Leaderboard Rows Left Non-Clickable (Intentional Decision)

**Decision:** Leaderboard rows are static display — not linked anywhere.

**Reason:** Each row represents a university, but the only available destination is a single program detail page (the best-value program for that university). Clicking "Assumption University" and landing on one specific program page creates a mismatch — users expect university-level information, not a single program. Without a university detail page, making rows clickable would be misleading.

**When to revisit:** Add row links when a university detail page exists (showing all programs at that university). Alternatively, add a small clearly-labelled "View program →" secondary link on each row so the destination is explicit.

---

---

### 25. Home Page — Best Value Universities Leaderboard

**Reason:** The old leaderboard ranked universities by program count (visibility metric), which had no student decision value. Replaced with a value score based on cost, GPA, and IELTS accessibility — the three factors students care most about when choosing where to apply.

**Formula:** `value_score = round((cost_score + gpa_score + ielts_score) / 3)`
Each metric is normalised to 0–100 across all programs before averaging:
- `cost_score = (max_cost − cost) / (max_cost − min_cost) × 100` — cheaper = higher
- `gpa_score = (max_gpa − gpa) / (max_gpa − min_gpa) × 100` — lower GPA req = higher
- `ielts_score = (max_ielts − ielts) / (max_ielts − min_ielts) × 100` — lower IELTS req = higher
- Null GPA / IELTS treated as 0 (no requirement = most accessible)
- All costs converted to USD via `convertCurrency()` before normalisation — fair cross-currency ranking
- Per university: the program with the highest value score represents that university

**Architecture decision:** Split between backend (data assembly) and frontend (scoring logic).
- Backend does the efficient JOIN: programs + universities + costs (inner), requirements (lookup map, avoids N+1)
- Frontend does normalisation and ranking using existing `convertCurrency()` — keeps exchange rate logic in one place and avoids duplicating rates in Python

**Changes:**

- `backend/main.py`:
  - New endpoint `GET /analytics/best-value-programs`
  - Returns flat array of per-program records: university_name, country_id, yearly_cost, currency, min_gpa, ielts_min
  - 2 DB queries total: one JOIN (program + university + cost), one bulk requirements fetch with a lookup map

- `frontend/src/api/api.js`:
  - Added `getBestValuePrograms()` — calls `/analytics/best-value-programs`

- `frontend/src/pages/HomePage.jsx`:
  - Removed `buildUniversitySummaries`, `spotlightUniversities`, `remainingUniversities`
  - Added `getBestValuePrograms` to `Promise.all` in `useEffect` (3 parallel calls total)
  - Added `rawValueData` state, `valueLeaderboard` useMemo
  - Added `buildValueLeaderboard()` function — normalises, scores, groups by university, returns top 6
  - Added `formatLeaderboardCost()` — respects user's currency preference (USD or native)
  - Replaced podium + list JSX with ranked list: rank number, university name, cost/yr, GPA, IELTS, score
  - All other page sections (search, platform summary, welcome panel) unchanged

- `frontend/src/index.css`:
  - Removed: `.leaderboard-podium`, `.podium-item`, `.podium-circle`, `.podium-circle-main`, `.podium-name`, `.podium-bar`, `.podium-bar-second`, `.podium-bar-third`, `.podium-bar-main`, `.leaderboard-list`, `.leaderboard-row`, `.leaderboard-name`, `.leaderboard-subtext`, `.leaderboard-country`
  - Added: `.value-leaderboard`, `.value-leaderboard-row`, `.value-leaderboard-rank`, `.value-leaderboard-info`, `.value-leaderboard-name`, `.value-leaderboard-meta`, `.value-leaderboard-score`
  - Cleaned up stale references to `.podium-name` and `.leaderboard-list p` from shared margin-reset rules

---

---

### 24. Decision Hub — Remove Program ID from Dropdowns

**Reason:** The Compare and Cost Calculator dropdowns were showing the internal program ID (e.g. P001) alongside the university and program name. IDs are meaningful to developers but add noise for users who just want to pick a program by name.

**Changes:**
- `frontend/src/pages/CompareProgramsPage.jsx`:
  - Both "First program" and "Second program" dropdowns: removed `(${program.program_id})` suffix
  - Label now reads `University Name — Program Name`

- `frontend/src/pages/CostCalculatorPage.jsx`:
  - "Program" dropdown: same change
  - Label now reads `University Name — Program Name`

- Also changed separator from hyphen `-` to em dash `—` for cleaner visual separation between university and program name.

---

---

### 23. Currency UX — Four Flow Improvements

**Reason:** Full UX audit of currency preference across all cost-showing pages revealed four problems: ambiguous "Native" label, navigation friction from "Change in Settings →" links, a silent mislead in CompareTable when comparing cross-currency programs, and no currency context at all on the Recommendation results.

**Changes:**

- `frontend/src/components/Layout.jsx`:
  - Topbar currency value changed from "Native" → "TWD · THB" so users see exactly what they'll get, not developer language

- `frontend/src/pages/AnalyticsPage.jsx`:
  - Removed `Link` import (no longer needed)
  - Added `toggleCurrency` to `useAppShell()` destructuring
  - Replaced "Change in Settings →" link with inline `<button className="text-button">` that calls `toggleCurrency` directly — no navigation required, costs update on the spot

- `frontend/src/pages/ProgramDetailPage.jsx`:
  - Removed `Link` import (no longer needed)
  - Added `toggleCurrency` to `useAppShell()` destructuring
  - Same inline toggle pattern as Analytics

- `frontend/src/pages/CostCalculatorPage.jsx`:
  - Removed `Link` import (no longer needed)
  - Added `toggleCurrency` to `useAppShell()` destructuring
  - Same inline toggle pattern

- `frontend/src/components/CompareTable.jsx`:
  - Added `toggleCurrency` to `useAppShell()` destructuring
  - Added `hasMixedCurrencies` check: `left.currency !== right.currency && displayCurrency === 'native'`
  - When true, shows a warning above the table: "These programs use different currencies (TWD / THB) — cost figures are not directly comparable. Switch to USD for a fair comparison →"

- `frontend/src/pages/RecommendationPage.jsx`:
  - Added `useAppShell` import
  - Added `currency: displayCurrency, toggleCurrency` to destructuring
  - When results are present, shows a one-line currency hint above the card grid with inline toggle

- `frontend/src/index.css`:
  - Added `.text-button` — button reset (no border/background/padding) with `font: inherit` and `color: var(--accent)`, hover adds underline. Used wherever a `<button>` needs to look like an inline text link without navigating away

---

---

### 22. Topbar — Currency Quick-Toggle Button

**Reason:** Currency preference was only accessible in Settings. Adding a one-click toggle to the topbar lets users switch between USD and native currencies from any page, following the same interaction pattern as the Language and Mode buttons.

**Changes:**
- `frontend/src/components/Layout.jsx`:
  - Added `currency` and `toggleCurrency` to the destructured values from `useAppShell()`
  - Added a "Currency / USD · Native" label+button block to `topbar-actions`, positioned before Language
  - Button uses a `$` text character (`.topbar-currency-symbol`) instead of an SVG since no currency icon exists in the asset set
  - `aria-label` and `title` describe the switch action contextually ("Switch to native currencies" / "Switch to USD")

- `frontend/src/index.css`:
  - Added `.topbar-currency-symbol` — 18×18px flex container, 15px bold `$`, matches `.topbar-icon` sizing so all three topbar buttons align visually

**UX note:** All three topbar action groups (Currency, Language, Mode) are hidden when the user is on the Settings page. The Settings page already contains the full preference controls, so showing duplicates in the topbar creates redundancy and confusion. Hiding them signals Settings as the authoritative control panel. Shortcuts are for every other page; Settings is the home base.

---

---

### 21. Settings — Thai Language Option Removed

**Reason:** Thai language translation is not ready and showing an incomplete option misleads users. Removed completely from UI and code.

**Changes:**
- `frontend/src/i18n/translations.js`:
  - Removed entire `th` translation block
  - Removed `thai` key from `language` section in both `en` and `zh` objects

- `frontend/src/context/AppShellContext.jsx`:
  - Updated `cycleLanguage`: was `en → th → zh → en`, now `en → zh → en`
  - Added localStorage guard: if a user had `language: 'th'` stored from before, it now falls back to `'en'` instead of breaking

- `frontend/src/pages/SettingsPage.jsx`:
  - Removed the Thai button from the Language card
  - Language card now shows English and Chinese only

---

---

### 20. Currency Preference — Native / USD Toggle

**Problem:** All costs were shown in TWD and THB. A student from any other country has no feel for what 273,281 TWD or 421,094 THB means in real terms. USD is the universal reference most international users understand.

**Decision:** Toggle between Native (each country's own currency) and USD (everything converted). Three-option selector (TWD / THB / USD) was considered and rejected — selecting TWD to view Thailand costs in TWD serves no real user need. Native vs. USD maps directly to the two real choices a user makes.

**Exchange rates used (source: XE.com, 19 April 2026):**
- 1 TWD = 0.03174725 USD → 1 USD = 31.49878342 TWD
- 1 THB = 0.03134062 USD → 1 USD = 31.90746633 THB

**Changes:**
- `frontend/src/utils/currency.js` — new file:
  - `convertCurrency(amount, fromCurrency, toCurrency)` — converts via USD as pivot. Adding a new currency means adding one rate constant
  - `formatDisplayCost(amount, nativeCurrency, displayCurrency)` — formats with conversion
  - Exports `TWD_TO_THB`, `THB_TO_TWD`, `FROM_USD`, `EXCHANGE_RATE_DATE` — consolidates all rate constants in one place

- `frontend/src/context/AppShellContext.jsx`:
  - Added `CURRENCY_STORAGE_KEY = 'unimatch-currency'`
  - Added `currency` state (default: `'USD'`), persisted to localStorage
  - Exposed `currency` and `setCurrency` in context value — available to any component via `useAppShell()`

- `frontend/src/pages/SettingsPage.jsx`:
  - Added Display currency InfoCard with Native / USD toggle buttons
  - Same `option-button` pattern as Theme and Language
  - Note: "More options will be added as the platform expands"

- `frontend/src/pages/AnalyticsPage.jsx`:
  - Reads `currency` from `useAppShell()` as `displayCurrency`
  - `toDisplay(amount, nativeCurrency)` helper converts or passes through based on preference
  - All KPI cards, comparison rows, and cheapest program tables now reflect selected currency
  - Exchange rate card adapts: Native shows TWD↔THB rates + avg conversions; USD shows all four directions (1 USD→TWD, 1 USD→THB, 1 TWD→USD, 1 THB→USD)
  - Comparison bars: Native keeps "not exchange-rate adjusted" disclaimer; USD removes it and says "bar widths are directly comparable" — because they now are
  - Cheapest programs table: Currency column removed (redundant when all rows share one currency), yearly cost converts
  - "Change in Settings →" link added below section heading so users can switch without navigating away

- `frontend/src/components/ResultCard.jsx`:
  - Added `useAppShell` + `convertCurrency` imports
  - Updated `formatCost(value, currency)` → `formatCost(value, nativeCurrency, displayCurrency)` — converts to USD when selected
  - Applied to `estimated_yearly_cost`

- `frontend/src/components/CompareTable.jsx`:
  - Same `formatCost` update
  - Applied to `tuition_fee` and `living_cost` for both compared programs
  - Each program uses its own native currency — correct for cross-country comparisons

- `frontend/src/pages/ProgramDetailPage.jsx`:
  - Same `formatCost` update
  - Applied to all 4 cost fields (tuition, living, application fee, insurance)
  - Added "Costs converted to USD / Change in Settings →" note inside the cost InfoCard

- `frontend/src/pages/CostCalculatorPage.jsx`:
  - Same `formatCost` update
  - Applied to all 7 cost fields (tuition per semester, yearly tuition, monthly living, yearly living, total yearly, application fee, insurance fee)
  - Added "Costs converted to USD / Change in Settings →" note above the cost breakdown

---

---

### 19. Legal Info Page — Scalable Country-List Redesign

**Problem:** The page was hardcoded for exactly Taiwan and Thailand — the two work rights summary cards at the top were named directly, and the comparison table only triggered for those two countries. Adding a third country would require manually editing the code.

**Friend's direction:** Show a list of countries users can click to read the legal info and insights. Future-proof for more countries.

**User flow decisions:**
- Rejected "country cards at top → click → reveal" — hides content behind an extra interaction, bad for informational reading
- Rejected "all detail visible at once with jump-to anchor links" — too much scrolling, visa notes in a cramped dl column are unreadable
- Final flow: Warning → Planned feature note → Accordion list (click country → detail expands)

**Compare table decision:**
- Removed the hardcoded Taiwan vs Thailand comparison table
- It only worked because there are exactly two countries — would silently become stale when a third country is added
- Replaced with a "Planned feature" InfoCard explaining the decision and describing what a proper Compare Countries tool in Decision Hub would look like

**Changes:**
- `frontend/src/pages/LegalGuardrailPage.jsx`:
  - Removed hardcoded "Work rights Taiwan" and "Work rights Thailand" summary cards
  - Removed `partTimeSummary()` and `findCountryRule()` helpers — no longer needed
  - Removed hardcoded Taiwan vs Thailand comparison table
  - Removed `taiwanRule` and `thailandRule` derived variables
  - Added "Planned feature" InfoCard explaining why the compare table was removed and what comes next
  - Moved "Important reminder" warning to the top — first thing the student sees
  - Country rules now rendered as an accordion: vertical list, click a country to expand its full detail, click again to collapse
  - Visa notes pulled out of the dl grid and rendered as a full-width left-bordered paragraph block — readable for long text
  - Source link rendered separately below the notes
  - All rendering is dynamic from `rules.map()` — adding a country to the DB adds a row automatically

- `frontend/src/index.css`:
  - Removed leftover `.home-country-*` styles from a reverted Countries panel experiment
  - Added `.legal-country-list`, `.legal-country-item`, `.legal-country-toggle` — accordion structure
  - Added `.legal-country-item--open` — accent color on country name when expanded
  - Added `.legal-country-detail` — expandable detail panel
  - Added `.legal-visa-notes` — full-width left-bordered block for long visa note text
  - Added `.legal-source` — source link row below the notes

---

---

### 18. Legal Info Page — Five Fixes + Country Comparison Table

**Problems:**
1. Card titles "Taiwan check" / "Thailand check" — test/QA language, not user-facing
2. Thailand work rights showed "Very limited or restricted work rights listed" — backend enum language in the UI
3. `part_time_allowed: false` rendered as "No or restricted" — `false` is definitively No, not ambiguous
4. `work_hour_limit: 'Not listed'` for Thailand — when part-time is not permitted, "Not applicable" is correct
5. No way to compare countries side by side even though the friend specifically requested compare capability

**Changes:**
- `frontend/src/pages/LegalGuardrailPage.jsx`:
  - Removed "Countries covered" KPI card (just showed "2" — no value)
  - Renamed "Taiwan check" → "Taiwan", "Thailand check" → "Thailand"
  - Added `partTimeSummary(rule)` — generates clean summary text for the work rights cards
  - Added `formatPartTime(rule)` — `true → "Yes — up to X hrs/week"`, `false → "No"`, `null → "Not listed"`
  - Added `formatWorkHourLimit(rule)` — shows hrs/week if available, "Not applicable" if part-time not allowed, "Not listed" as last resort
  - Added side-by-side comparison table (Taiwan vs Thailand): visa type, part-time work, work permit, post-study visa — rendered between the summary cards and detail cards, only shown when both rules are loaded
  - Page title changed to "Work and visa rules by country" — clearer and user-facing
  - Guardrail card renamed "Important reminder" with "Before you decide" eyebrow — removes jargon
  - Removed "Country" row from detail cards (redundant — the card title already shows the country)

---

---

### 17. Home Page — Leaderboard (Under Review — Not Changed)

**Problem:** The leaderboard section is meaningless with the current dataset — every university has exactly 1 program, making the podium a purely alphabetical list that implies prestige where none exists.

**Status:** Reverted to original leaderboard. Three options were prepared and sent to the friend for his decision:
- Option A: Upcoming Deadlines widget (top 3 soonest programs, links to Deadline Insights)
- Option B: Programs at a Glance — two-column directory, Taiwan | Thailand, no ranking
- Option C: Remove the section entirely

**No code changes were made.** Leaderboard remains as the original developer built it.

---

---

### 16. Home Page — University Explorer Search UX

**Problem:** The University Explorer had two UX issues:
1. Five programs were shown by default even before the user typed anything — this was noisy and unhelpful for first-time visitors who haven't expressed intent yet
2. No memory between visits — a user who searches "NTU" on one visit had to retype it every time

**Changes:**
- `frontend/src/pages/HomePage.jsx`:
  - Removed leftover "View detail" button from the search bar — it was a dead remnant of the removed featured program concept, silently linking to P001 with no context
  - Removed `featuredProgram` variable (was `enrichedPrograms[0]`) — no longer needed
  - `searchResults` useMemo now returns `[]` when `searchTerm` is empty — no results shown before the user types
  - Added `saveSearch(term)` function — saves the searched term to `localStorage` (key: `educompare_recent_searches`, max 5, most recent first, deduped)
  - Recent searches chips shown below the search bar when the search box is empty — clicking a chip restores the term and triggers live results
  - Idle state (no search, no recent) shows program count: "10 programs loaded — type a university or major name to search."
  - While loading: "Loading program data…"
  - Result cards call `saveSearch()` on click so only terms that produced a result the user acted on are saved
  - No-match message now quotes the search term: `No programs match "xyz" — try a different university or major name.`
  - Search panel description changed from developer-facing copy to user-facing: "Search by university name or major to explore programs across Taiwan and Thailand."

- `frontend/src/index.css`:
  - Added `.recent-searches` — flex column container for the label and chip row
  - Added `.recent-search-chips` — flex-wrap row for the chips
  - Added `.recent-search-chip` — pill-shaped button with border, soft background, hover accent state

---

---

### 15. Cost Summary Endpoint — Missing Application and Insurance Fees

**Problem:** The `/cost-summary` backend endpoint did not return `application_fee` or `insurance_fee` fields even though the data exists in the database. The Cost Calculator always showed "Not listed" for both fields regardless of the program selected.

**Changes:**
- `backend/main.py` — added two fields to the `/cost-summary` response:
  ```python
  "application_fee": cost.application_fee,
  "insurance_fee": cost.insurance_fee,
  ```
  This is a purely additive change. No existing fields or logic were modified.

---

---

### 14. Deadline Insights — Real Page Built from Live Data

**Problem:** The Deadline Insights tab showed a static placeholder message. Real deadline data existed in the database but was unused.

**Changes:**
- `frontend/src/pages/DeadlineInsightsPage.jsx` — new file. Fetches programs and universities, enriches with university name and country, then:
  - Splits programs into upcoming (deadline ≥ today) and passed (deadline < today)
  - Shows KPI cards: upcoming count, passed count, next closing deadline with days remaining
  - Upcoming programs table sorted soonest first with days remaining
  - Passed programs table sorted most recently closed first with days since, deadline dates in red
- `frontend/src/App.jsx` — replaced the `AnalyticsPlaceholderPage` on the `/analytics/deadlines` route with `DeadlineInsightsPage`

---

---

### 13. Analytics — Currency Bar Disclaimer Strengthened

**Problem:** Comparison bars in Cost Overview compared raw TWD and THB numbers directly. The old disclaimer was too subtle. Bar widths could be misread as a currency-converted comparison.

**Changes:**
- `frontend/src/pages/AnalyticsPage.jsx` — updated disclaimer text in the Country comparison InfoCard to explicitly state bars are **not exchange-rate adjusted** and numbers should be used instead of bar lengths for cost comparison.

---

---

### 12. Analytics — Data Freshness Note

**Problem:** No indication anywhere in the UI of when the data was last verified. For a trust-first product, this matters.

**Changes:**
- `frontend/src/pages/AnalyticsLayoutPage.jsx` — added a bordered note below the page header:
  *"Dataset verified April 2026 — sourced from official university and government websites."*
- `frontend/src/index.css` — added `.data-freshness-note` style (left border, muted text, small font)

---

---

### 11. Cost Overview — Exchange Rate Reference Card

**Problem:** Students looking at 273,281 TWD vs 421,094 THB had no way to mentally compare them. The currencies were shown correctly but without context of how they relate.

**Decision:** Hardcoded rate with a clear date label and link to source — better than a live API for a portfolio project with static data.

**Rates used (source: XE.com, 19 April 2026):**
- 1 TWD = 1.0164 THB
- 1 THB = 0.9839 TWD

**Changes:**
- `frontend/src/pages/AnalyticsPage.jsx`:
  - Added `TWD_TO_THB`, `THB_TO_TWD`, `EXCHANGE_RATE_DATE` constants at the top
  - Added `ExchangeRateCard` component showing:
    - Both exchange rate directions (1 TWD → THB, 1 THB → TWD)
    - Each country's avg yearly cost converted into the other currency
    - Date label, source credit, and link to XE.com for verification
    - Disclaimer to verify before making financial decisions
  - Card placed **between the KPI cards and the Country comparison bars** — so users get currency context before encountering the bars, not after
- `frontend/src/index.css` — added `.exchange-rate-grid`, `.exchange-rate-pair`, `.exchange-rate-value`, `.exchange-rate-arrow`, `.exchange-rate-converted` styles

---

---

### 10. Home Page — Country Code Display and Grammar Fix

**Problem:**
1. Search results showed raw country codes (`C001`, `C002`) instead of readable names
2. Leaderboard showed "1 programs" instead of "1 program"

**Changes:**
- `frontend/src/pages/HomePage.jsx`:
  - Added `COUNTRY_NAMES` constant mapping `C001 → Taiwan`, `C002 → Thailand`
  - Search result cards now show `Bachelor • English • Taiwan` instead of `Bachelor • English • C001`
  - Falls back to raw code if country is unknown (safe for future countries)
  - Leaderboard program count now uses correct singular/plural: `1 program`, `2 programs`

---

---

### 9. Home Page — Welcome Panel Redesign (Closing Soon)

**Problem:** The welcome panel had two issues:
1. "Welcome Back" heading is wrong for first-time visitors — implies a returning user
2. "Featured program" always showed P001 (NTU IBA) because it was just the first program in the API response — not actually featured for any meaningful reason

**Options considered:**

| Option | Description | Decision |
|---|---|---|
| A | Show program with soonest upcoming deadline — deadline urgency, auto-updates daily | Initially chosen, then revised |
| B | Remove featured program entirely, replace with 3 quick action buttons | ✅ **Final choice (friend's decision)** |
| C | Keep P001 as-is | Rejected — no value |

**Why Option B (revised from A):** Option A was initially implemented but the friend reviewed it and chose Option B instead. The quick action buttons are simpler, directly useful, and avoid any "featured" concept that could mislead. A first-time visitor immediately sees what they can do — not a random or deadline-driven program they may not care about.

**Changes:**
- `frontend/src/pages/HomePage.jsx`:
  - Removed `today` module-level constant (no longer needed)
  - Removed `featuredProgram` deadline-based useMemo — reverted to simple `enrichedPrograms[0] ?? null` for the search bar link only
  - Removed `daysUntilDeadline` useMemo
  - Heading changed from `"Welcome Back"` → `"Make an informed decision"` (kept from Option A — correct for all users)
  - Replaced the entire right side of the welcome panel with 3 quick action links:
    - → Get a recommendation (`/decision-hub/recommendation`)
    - → Compare programs (`/decision-hub/compare`)
    - → Check costs (`/decision-hub/cost-calculator`)
  - Label changed to `"Where to start"`
- `frontend/src/index.css` — added `.home-quick-actions`, `.home-action-link`, `.home-action-arrow` styles (bordered links, subtle hover state)

---

---

### 8. Program Detail Page — Four Fixes

**Problems:**
1. Page title showed raw ID: "Program overview for P004" — program name not available until data loads
2. Country displayed as code: "C001" instead of "Taiwan"
3. All cost numbers unformatted: `74900 TWD` instead of `74,900 TWD`
4. Interview required showed "No or not listed" even when value was explicitly `false` — should be "No". "Not listed" should only appear for `null`

**Changes:**
- `frontend/src/pages/ProgramDetailPage.jsx`:
  - Added `COUNTRY_NAMES` map (`C001 → Taiwan`, `C002 → Thailand`)
  - Added `formatCost(value, currency)` helper using `toLocaleString()`
  - Added `formatBool(value)` helper: `true → Yes`, `false → No`, `null → Not listed`
  - Title now shows `data.program.major_name` once loaded, falls back to "Loading program P004..." while fetching
  - Country now shows readable name
  - All 4 cost fields (tuition, living, application fee, insurance) now formatted with commas
  - Interview required now uses `formatBool()` for precise Yes / No / Not listed display

---

---

### 7. CostCalculatorPage — Number Formatting

**Problem:** Cost summary page displayed raw integers (`297040 TWD`) without comma separators.

**Changes:**
- `frontend/src/pages/CostCalculatorPage.jsx` — all cost fields now use `Number(value).toLocaleString()`:
  - Tuition per semester
  - Yearly tuition
  - Monthly living cost
  - Yearly living cost
  - Total yearly cost
  - Application fee
  - Insurance fee

---

---

### 6. CompareTable — Number Formatting and Deadline Warning

**Problem:** Same two issues as ResultCard:
1. Cost numbers had no comma separators (`58520 TWD`, `135135 THB`)
2. Expired deadlines showed no warning in the comparison table

**Changes:**
- `frontend/src/components/CompareTable.jsx`:
  - Added `isDeadlinePassed()` and `formatCost()` helpers
  - Tuition and living cost now formatted with commas: `58,520 TWD`
  - Deadline row rendered separately to allow per-cell CSS class
  - Expired deadlines show in red: `2026-01-15 — Deadline passed`
  - Refactored `dataRows` from array-of-tuples to array-of-objects for clarity

---

---

### 5. ResultCard — Deadline Warning, Score Context, Number Formatting

**Problem:** Three UX issues on the Recommendation page:
1. Programs with expired deadlines showed no warning — students could apply to programs they can no longer join
2. Costs showed raw numbers (`450270 THB`) that were hard to read
3. Score badge showed `40` with no context — users did not know the maximum was 75

**Changes:**
- `frontend/src/components/ResultCard.jsx`:
  - Added `isDeadlinePassed()` helper — compares deadline date to today
  - Expired deadlines now show in red: `2026-03-31 — Deadline passed`
  - Cost now formatted with commas: `450,270 THB`
  - Score badge now shows `40 / 75` with a muted `/ 75` suffix

- `frontend/src/index.css`:
  - Added `.deadline-passed` — uses `--danger` color (red), bold weight
  - Added `.score-max` — small muted label for the `/ 75` text
  - Updated `.score-badge` — adjusted sizing and layout for the new format

---

---

### 4. Frontend Environment File

**Problem:** No `frontend/.env` file existed. The API base URL fell back to `http://127.0.0.1:8000` (hardcoded in `api.js`). This caused inconsistency and was not portable across machines.

**Changes:**
- `frontend/.env` — new file. Sets `VITE_API_BASE_URL=http://localhost:8000`
- `.gitignore` — added `educompare-project/frontend/.env` so credentials are never committed

**Note:** Restart the Vite dev server after changing `.env` for changes to take effect.

---

---

### 3. CORS Fix — Allow Any Localhost Port

**Problem:** Backend CORS was hardcoded to `http://localhost:5173`. When Vite started on port 5174 (because 5173 was already occupied), all API calls were blocked with `Access-Control-Allow-Origin` errors.

**Changes:**
- `backend/main.py` — replaced hardcoded `allow_origins` list with `allow_origin_regex`:
  ```python
  # Before
  allow_origins=["http://localhost:5173"]

  # After
  allow_origin_regex=r"http://localhost:\d+"
  ```
  This accepts any localhost port without needing manual updates.

---

---

### 2. Data Ingestion — Seeder Script

**Problem:** The project had no way to load data. All CSV files in `data/templates/` existed but nothing read them into the database. All API endpoints returned empty arrays.

**Changes:**
- `backend/seed.py` — new file. Python script that:
  - Creates all 5 tables if they don't exist (`Base.metadata.create_all`)
  - Reads all 5 CSV template files
  - Inserts records in foreign-key-safe order: `country_rules → universities → programs → requirements → cost_and_finance`
  - Uses `db.merge()` so it is safe to run multiple times (upsert by primary key)
  - Handles nullable fields, booleans (`TRUE`/`FALSE`/empty), dates, and integers correctly

**How to run:**
```bash
cd educompare-project/backend
python seed.py
```

**Data loaded:**
- 2 country rules (Taiwan, Thailand)
- 10 universities (5 Taiwan, 5 Thailand)
- 10 programs (all English-taught Bachelor degrees)
- 10 admission requirements
- 10 cost and finance records

---

---

### 1. Cloud Database — Neon DB

**Problem:** Project had no cloud database. Backend required a local PostgreSQL setup on every machine.

**Changes:**
- `backend/.env` — replaced local PostgreSQL connection string with Neon DB (cloud PostgreSQL, ap-southeast-1 region)
- Database name: `neondb` (Neon project named `educompare_db`)

---

---
