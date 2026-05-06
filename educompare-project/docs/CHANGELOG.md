# Changelog

All changes made after receiving this project from the original developer.


---

### 96. Legal Info — restore accordion with independent multi-open state and visa notes first

**Reason:** Accordion is the right pattern for this page — students come to check one or two specific countries, not read all three in parallel. Sequential deep reading per country suits expand/collapse. The two previous attempts (horizontal card grid, vertical card stack) both moved away from this and felt wrong.

**Key improvements over the original accordion:**
1. Each country now has independent open/closed state (using a `Set` of open IDs). Previously only one could be open at a time — now you can open two countries and compare them side by side.
2. Visa notes moved to the TOP of the expanded section so the most important warning is seen first, not buried.
3. Collapsed row simplified — just country name + part-time badge + arrow. No "View rules" text hint, no "Has visa notes" badge cluttering the row.

**What changed:**
- `LegalGuardrailPage.jsx`: replaced `selectedCountry` (single ID) state with `openIds` (a `Set`). `toggleCountry` adds/removes from the Set rather than toggling a single value. Accordion structure restored. Visa notes rendered first inside the expanded detail. Collapsed row has name, part-time badge, and arrow only. "Compare countries" planned feature card moved to bottom.
- `index.css`: removed card grid classes, restored accordion CSS (`.legal-country-list`, `.legal-country-item`, `.legal-country-toggle`, `.legal-country-toggle-name`, `.legal-country-toggle-arrow`, `.legal-country-item--open`, `.legal-country-detail`). Kept badge styles and visa notes styles from previous pass.

**Files changed:** `frontend/src/pages/LegalGuardrailPage.jsx`, `frontend/src/index.css`

---

### 95. Legal Info — switch from horizontal card grid to vertical full-width cards

**Reason:** The 3-column horizontal grid made each country card narrow, causing the detail fields inside to feel cramped. Full-width vertical stacking gives each country card the same comfortable reading width the old accordion had, while still keeping all three countries visible without any clicking.

**What changed:**
- `index.css`: `.legal-cards-grid` changed from `display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))` to `display: flex; flex-direction: column`. `.legal-country-card-head` changed from column to `flex-row` (name + badge on one line, aligned center). Card padding adjusted to `22px 24px`.

**Files changed:** `frontend/src/index.css`

---

### 94. Admission chart — revert to single y-axis; Legal Info — remove accordion

**Reason:**
- User preferred single y-axis on the admission chart — the dual-axis approach added visual complexity that was not wanted.
- Legal Info accordion forced students to click each country one at a time, preventing any side-by-side comparison. With only 3 countries and a small set of fields, all content should be immediately visible. The "Compare Countries" planned feature card moved to the bottom since it is no longer needed as a navigation instruction.

**What changed:**
- `AdmissionAnalyticsPage.jsx`: reverted `AdmissionComparisonChart` back to a single `<YAxis>` (no `yAxisId` props). Removed right-side axis, right margin reduced to 16. Bar `name` props kept as "GPA" and "IELTS" (no axis labels in legend). Footer note simplified to "GPA: 0–4.0 scale · IELTS: 0–9.0 scale".
- `LegalGuardrailPage.jsx`: accordion pattern removed entirely. `selectedCountry` state and `toggleCountry` function removed. Replaced `legal-country-list` + accordion items with a `legal-cards-grid` showing all three country cards expanded by default. Visa notes shown at top of each card with accent styling. "Compare countries" planned feature card moved to bottom. `formatWorkHourLimit` helper removed (merged inline into Part-time work field).
- `index.css`: removed all accordion CSS (`.legal-country-list`, `.legal-country-item`, `.legal-country-toggle`, `.legal-country-toggle-meta`, `.legal-country-toggle-hint`, `.legal-country-toggle-arrow`, `.legal-country-item--open`, `.legal-country-detail`, `.legal-badge--note`). Added `.legal-cards-grid`, `.legal-country-card`, `.legal-country-card-head`, `.legal-country-card-name`, `.legal-badge-row`.

**Files changed:** `frontend/src/pages/AdmissionAnalyticsPage.jsx`, `frontend/src/pages/LegalGuardrailPage.jsx`, `frontend/src/index.css`

---

### 93. Home — Remove "What's in the database" section; Admission chart legend cleanup

**Reason:**
- The database stats panel ("Taiwan 5 programs / Thailand 5 programs / Singapore 5 programs") shows raw record counts that highlight a current dataset limitation rather than platform value. A first-time student visitor seeing "5 programs" is more likely to question depth than feel reassured. Data provenance is already covered on the About page, which is the appropriate place.
- Admission chart legend showed "GPA (left axis)" / "IELTS (right axis)" — redundant since the axis labels already identify which scale is left and right.

**What changed:**
- `HomePage.jsx`: removed the `home-snapshot-panel` section entirely. Also removed the now-unused `countryCounts` `useMemo` computation.
- `AdmissionAnalyticsPage.jsx`: changed Bar `name` props from `"GPA (left axis)"` / `"IELTS (right axis)"` back to `"GPA"` / `"IELTS"`.

**Files changed:** `frontend/src/pages/HomePage.jsx`, `frontend/src/pages/AdmissionAnalyticsPage.jsx`

---

### 92. UX Fixes — 11-Item Pass (Dates, Detail Page, Charts, Legal, Settings)

**Reason:** UX audit identified 11 issues across the app. All fixed in this pass.

**Fix 1 — Best Value name truncation (Home)**
- `index.css`: `.value-leaderboard-name` replaced `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` with `overflow-wrap: break-word` so long university names wrap rather than get clipped.

**Fix 2 — ISO date format display (4 files)**
- `utils/date.js`: added `formatDate(dateStr)` — converts "2026-01-15" → "15 Jan 2026" using `parseISODateOnly` (timezone-safe) + `toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })`.
- Applied `formatDate()` in: `DeadlineInsightsPage.jsx` (3 occurrences), `ProgramDetailPage.jsx` (deadline field), `CompareTable.jsx` (left and right deadline cells), `ResultCard.jsx` (deadline field).

**Fix 3 — Program Detail: repeated program name**
- `ProgramDetailPage.jsx`: removed the redundant `<dt>Program</dt><dd>{major_name}</dd>` field from the Program Information card — `major_name` is already shown in the `<h1>` via PageHeader.

**Fix 4 — Program Detail: documents semicolons → bulleted list**
- `ProgramDetailPage.jsx`: `documents_required` field now splits on `";"`, trims each item, and renders as a `<ul>` with `className="doc-list"`.
- `index.css`: added `.doc-list` and `.doc-list li` styles (left-padded, minor bottom margin).

**Fix 5 — Program Detail: no estimated yearly cost**
- `ProgramDetailPage.jsx`: added `calcEstimatedYearlyCost(cost)` helper — `(tuition_fee_per_semester × 2) + (avg_monthly_living_cost × 12)`. Rendered as the first item in the Cost Information card with a parenthetical note showing the formula. Only shown if both tuition and living cost data exist.

**Fix 6 — Program Detail: navigation dead end**
- `ProgramDetailPage.jsx`: added `.program-detail-actions` bar below the card grid with three links — "Back to recommendations", "Compare programs", "Cost calculator".
- `index.css`: added `.program-detail-actions` (flex, wrap, gap) and `.btn-secondary` (inline bordered link button) styles.

**Fix 7 — Cost Overview: Singapore $12,49 truncation**
- `index.css`: increased `.cost-columns-grid` `minmax(130px, 1fr)` → `minmax(160px, 1fr)` so each country column is wide enough. Added `white-space: nowrap` to `.cost-col-amount` to prevent partial rendering.

**Fix 8 — Admission Overview: GPA and IELTS on same y-axis**
- `AdmissionAnalyticsPage.jsx`: replaced single `<YAxis>` with dual axes — `yAxisId="gpa"` left (domain 0–4, blue ticks) and `yAxisId="ielts"` right (domain 0–9, green ticks). Each `<Bar>` now references its correct axis. Chart right margin increased to 48 to accommodate the right axis. Legend updated to "GPA (left axis)" and "IELTS (right axis)". Footnote updated.

**Fix 9 — Admission Overview: program tables not discoverable**
- `AdmissionAnalyticsPage.jsx`: added a `.section-heading` block with "Program Rankings" title and description immediately above the `.admission-bottom-grid`. Users now see a clear label before the tables when scrolling.

**Fix 10 — Legal Info: visa notes hidden inside collapsed row**
- `LegalGuardrailPage.jsx`: visa notes moved to the top of the expanded section (first element seen on open). Added status badges on the collapsed row — "Part-time allowed" (green), "No part-time" (red), "Has visa notes" (blue accent) — so users see key facts before expanding. Visa notes block now uses `.legal-visa-notes--prominent` variant (accent-colored border + tinted background).
- `index.css`: added `.legal-country-toggle-meta`, `.legal-badge`, `.legal-badge--ok`, `.legal-badge--no`, `.legal-badge--note`, and `.legal-visa-notes--prominent`.

**Fix 11 — Settings: Admin section visible to all users**
- `AppShellContext.jsx`: added `IS_ADMIN_KEY = 'unimatch-is-admin'` constant. `isAdmin` state reads from localStorage (defaults to `false`). Exposed as `isAdmin` in context value. Dependency added to `useMemo`.
- `SettingsPage.jsx`: Admin InfoCard wrapped in `{isAdmin ? (...) : null}` — hidden for regular users, shown only if localStorage flag is set. Prepares structure for the future admin auth system.

**Files changed:** `frontend/src/utils/date.js`, `frontend/src/pages/DeadlineInsightsPage.jsx`, `frontend/src/pages/ProgramDetailPage.jsx`, `frontend/src/pages/AdmissionAnalyticsPage.jsx`, `frontend/src/pages/LegalGuardrailPage.jsx`, `frontend/src/pages/SettingsPage.jsx`, `frontend/src/components/CompareTable.jsx`, `frontend/src/components/ResultCard.jsx`, `frontend/src/context/AppShellContext.jsx`, `frontend/src/index.css`

---

### 91. Backend — Rate Limiting via slowapi

**Reason:** Five endpoints load full dataset joins from the database on every request with no throttle. Without limits, any client could hammer these in a loop and exhaust DB connections or slow the server for everyone.

**What changed:**
- `requirements.txt`: added `slowapi>=0.1.9,<1.0`
- `main.py`: imported `Limiter`, `_rate_limit_exceeded_handler`, `get_remote_address`, `RateLimitExceeded` from slowapi. Created `limiter = Limiter(key_func=get_remote_address)`, assigned to `app.state.limiter`, registered `RateLimitExceeded` exception handler (returns HTTP 429 with JSON body).
- Added `request: Request` param (required by slowapi) + `@limiter.limit()` decorator to the five heavy routes:
  - `/recommend/programs` — 20/minute (loads all programs, universities, costs, requirements into memory)
  - `/analytics/cost-overview` — 20/minute (3-table JOIN across full dataset)
  - `/analytics/best-value-programs` — 20/minute (3-table JOIN + requirements lookup)
  - `/analytics/admission-overview` — 20/minute (3-table JOIN across full dataset)
  - `/analytics/ranking-overview` — 30/minute (universities-only, lighter)
- Simple read endpoints (`/universities`, `/programs`, `/costs`, `/requirements`, `/country-rules`, `/programs/{id}`, `/compare/programs`, `/cost-summary`) left unlimited — they are cheap indexed queries.
- Rate limiting is per IP address, in-memory (no Redis needed). Limits reset after 1 minute.

**Files changed:** `backend/requirements.txt`, `backend/main.py`

---

### 90. Security Audit — Findings Log (No Action Taken Except #91)

**Reason:** Full security review of frontend and backend. Results logged here as a reference for what was checked and what needs attention before production.

**Confirmed secure (no issues found):**
- SQL injection: all queries use SQLAlchemy ORM — no raw SQL or string interpolation
- Input validation: Pydantic `Query()` enforces types and ranges on all user-controlled params (GPA 0–4.0, IELTS 0–9.0, budget ≥ 0, limit 1–50, date ISO format)
- XSS: no `dangerouslySetInnerHTML` anywhere; all output goes through React's default escaping
- sessionStorage: only non-sensitive data stored (form inputs, program IDs, cost figures — no tokens or PII)
- localStorage: only UI preferences (theme, language, currency, sidebar state)
- Error responses: HTTPExceptions return generic messages — no stack traces or DB schema leaked
- Frontend env: `frontend/.env` contains only `VITE_API_BASE_URL=http://localhost:8000`, no secrets
- API base URL: read from `import.meta.env.VITE_API_BASE_URL` with localhost fallback
- .gitignore: both `.env` files properly excluded, confirmed via `git check-ignore`
- Build config: Vite does not expose source maps in production by default
- Dependencies: all packages current — FastAPI 0.115+, SQLAlchemy 2.0+, Pydantic 2.0+, React 19, no known critical CVEs

**Issues identified — action required before production:**
1. **No authentication on any route** (HIGH): every backend endpoint is publicly accessible. Admin pages (`AdminLoginPage`, `AdminDashboardPage`) are wired as routes but contain no real auth logic — they are intentional placeholders. Implement JWT auth before building real admin functionality.
2. **CORS locked to localhost** (MEDIUM): `allow_origin_regex=r"http://localhost:\d+"` is correct for dev but will block all requests from a real domain on deployment. Swap to `allow_origins=["https://yourdomain.com"]` before deploying.
3. **Database credentials in `backend/.env`** (MEDIUM): real Neon PostgreSQL connection string (username + password + host) stored in plain text. File is correctly gitignored so it has not been committed, but the password should be rotated before deployment. Add a `backend/.env.example` with placeholder values for documentation.
4. **No rate limiting** (MEDIUM): addressed in entry #91 above.

**Files changed:** None — audit only.

---

### 89. Project Audit — Dead Code and Unused Asset Inventory (No Action Taken)

**Reason:** Routine audit of all source files, components, pages, CSS classes, and assets to identify anything unreferenced or unused. No files were deleted or modified — this entry records findings only so future cleanup sessions have a written baseline.

**Findings:**
- `App.css` (140 lines): never imported anywhere. Leftover from original Vite template. Contains old class names (`.result-card`, `.score`, `.recommend-btn`) and hardcoded dark palette from early dev. Safe to delete when ready.
- `AnalyticsPlaceholderPage.jsx`: component is useful and correct, but the import in `App.jsx` is dead — it is imported on line 8 but never placed in any route element. Should either be wired to the two placeholder analytics routes (Deadline Insights, Ranking Insights) or the import removed until then.
- `SectionNav.jsx`: complete, functional sticky nav component with NavLink and active state. Zero imports reference it. Deliberately prepared for the "sticky internal navigation" CLAUDE.md calls for under Decision Hub and Analytics. Keep — not dead by accident.
- `frontend/src/assets/icons/` (9 SVG files): `analytics.svg`, `decision_hub.svg`, `home.svg`, `language.svg`, `legal.svg`, `logout.svg`, `moon.svg`, `setting.svg`, `warning.svg` — none imported. App uses lucide-react instead. Kept in case the icon system changes.
- `frontend/src/assets/logo/logo.svg` (full logo with text): not imported anywhere. Only the two text-free variants are used (`logo_dark_without_text.svg`, `logo_light_without_text.svg`).
- `frontend/src/assets/react.svg`, `vite.svg`, `hero.png`: zero references. Vite template leftovers plus an unused hero image.
- University logo PNGs (16 files, folder renamed by user): `U001_ntu.png` through `U015-Suss.png`. Not referenced in any source file. Prepared for when program cards or university profile pages show real logos. Keep.
- Orphan CSS classes in `index.css` (no JSX usage): `.comparison-bars`, `.comparison-country`, `.comparison-country-head`, `.home-welcome-copy`, `.home-welcome-side`, `.reality-not-permitted`, `.search-result-card-active`, `.info-card-muted`, and the `.section-nav*` family (tied to the unused SectionNav component).

**Files changed:** None — audit only.

---

### 88. Decision Hub — Add Clear Button to All Three Tool Pages

**Reason:** With sessionStorage state persistence added in earlier entries, users had no way to reset a page once results were loaded. The only escape was closing and reopening the tab or manually clearing browser storage. A Clear button gives users a one-click way to start a fresh search.

**What changed:**
- `RecommendationPage.jsx`: Added "Clear" button in `action-row` beside "Get recommendations". On click: resets `formData` to all-empty defaults, clears `results`, sets `hasSearched` to `false`, clears `error`, removes sessionStorage key. Disabled when form is untouched and no results exist.
- `CompareProgramsPage.jsx`: Added "Clear" button beside "Compare programs". On click: resets `programIds` to `{ first: '', second: '' }`, clears `rows`, clears `error`, removes sessionStorage key. Disabled when both selects are empty and no comparison rows exist.
- `CostCalculatorPage.jsx`: Added "Clear" button beside "Calculate yearly cost". On click: resets `programId` to empty string, clears `summary`, clears `error`, removes sessionStorage key. Disabled when nothing is selected and no summary is shown.
- `index.css`: Added `.secondary-button:disabled { opacity: 0.45; cursor: not-allowed; }` — previously the disabled state had no visual style.

**Files changed:** `frontend/src/pages/RecommendationPage.jsx`, `frontend/src/pages/CompareProgramsPage.jsx`, `frontend/src/pages/CostCalculatorPage.jsx`, `frontend/src/index.css`

---

### 87. Decision Hub — Compare Programs and Cost Calculator Improvements

**Reason:** Both pages had three related problems:
1. Program selects listed all programs in a flat list with no grouping — hard to scan when 15 programs from three countries are mixed together.
2. Neither page preserved state across back navigation, so returning from a program detail page reset the form and cleared results.
3. Dead-end navigation: the compare table had no link to individual program detail pages, and the calculator result had no way to drill into the selected program.

**What changed:**
- `CompareProgramsPage.jsx`: Added `COUNTRY_NAMES`, `COUNTRY_ORDER` constants and a `programsByCountry` useMemo. Both program selects now use `<optgroup>` labels (Taiwan / Thailand / Singapore). Added sessionStorage restore on mount and save after a successful comparison (`unimatch_compare` key).
- `CostCalculatorPage.jsx`: Same optgroup grouping applied to the single program select. Added sessionStorage restore on mount and save after calculation (`unimatch_calculator` key). Removed the second InfoCard ("Interpretation note") — replaced with a single muted paragraph note and a `Link` to the full program detail page directly inside the result InfoCard.
- `CompareTable.jsx`: Column headers now use the program's `major_name` as a `<Link>` to `/programs/:id`, with the university name displayed below it in muted text (`.compare-table-uni`). Removed the redundant "Program" data row since it's now in the header.
- `index.css`: Added `.compare-table-uni` style for the university subtitle in table column headers.

**Files changed:** `frontend/src/pages/CompareProgramsPage.jsx`, `frontend/src/pages/CostCalculatorPage.jsx`, `frontend/src/components/CompareTable.jsx`, `frontend/src/index.css`

---

### 86. ResultCard — Redesign for Better UX

**Reason:** The old card had three UX problems: (1) a raw score badge ("40 / 75 pts") that means nothing to a student, (2) a "Match breakdown" section that listed every criterion including failures ("Budget —", "Deadline —") with four rows of dashes per card, and (3) a "View program detail" link isolated at the very bottom — the worst placement for a primary action.

**What changed:**
- Program title (`<h3>`) is now wrapped in a `<Link>` — clicking the title navigates to the program detail page. This is the natural primary action.
- Removed the score badge (`40 / 75 pts`) entirely.
- Removed the full "Match breakdown" list. Replaced with a "Requirements met" section that shows **only the criteria that scored positive** as small pill tags (e.g. "GPA", "IELTS"). If nothing matched, one quiet italic note — "No requirements matched your profile — shown for reference." — replaces four rows of dashes.
- Removed the `View program detail` text link from the card footer.
- Removed unused `MAX_SCORE` constant. Renamed `SCORE_LABELS` → `CRITERIA_LABELS` for clarity.
- CSS: `.result-card-header` changed from `flex / space-between` (needed to push badge right) to `grid / gap 4px`. Removed `.score-badge`, `.score-max`, `.score-breakdown`, `.score-earned`, `.score-zero`. Added `.result-title-link`, `.match-tags`, `.match-tags-label`, `.match-tags-row`, `.match-tag`, `.result-no-match`. Removed stale mobile override that stacked the old flex header.

**Files changed:** `frontend/src/components/ResultCard.jsx`, `frontend/src/index.css`

---

### 85. Performance — Session Cache, useMemo for universityMap, Stale-fetch Cleanup

**Reason:** Three optimisation issues found during codebase audit:
1. `getPrograms()`, `getUniversities()`, `getCountryRules()`, `getCostOverviewAnalytics()`, `getAdmissionAnalytics()`, and `getBestValuePrograms()` were re-fetched from the backend on every page navigation — these are reference data that don't change during a session.
2. `universityMap` in `CostCalculatorPage` and `CompareProgramsPage` was rebuilt via `.reduce()` on every render without memoisation, even when `universities` hadn't changed.
3. `ProgramDetailPage`'s `useEffect` had no cleanup: if the user navigated away (or `programId` changed) before the fetch resolved, the stale result would still attempt to call `setData` / `setError`.

**What changed:**
- `api.js`: Added `withCache(key, fetcher)` helper that stores the Promise in a session-scoped Map. First caller initiates the request; subsequent callers share the same in-flight promise — no duplicate network calls. Failures are evicted from the cache so they can retry. Parameterised calls (e.g. `getPrograms({ country_id: 'C001' })`) bypass the cache and always hit the network.
- `CostCalculatorPage.jsx` + `CompareProgramsPage.jsx`: Added `useMemo` import; wrapped `universityMap` derivation so it only recomputes when `universities` changes.
- `ProgramDetailPage.jsx`: Added `cancelled` flag in `useEffect` cleanup so stale responses after navigation or `programId` change are silently dropped.

**Files changed:** `frontend/src/api/api.js`, `frontend/src/pages/CostCalculatorPage.jsx`, `frontend/src/pages/CompareProgramsPage.jsx`, `frontend/src/pages/ProgramDetailPage.jsx`

---

### 84. Decision Hub — Fix Back Button Navigation and Restore Recommendation State

**Reason:** Two bugs found during testing:
1. `BackButton` on ProgramDetailPage used `fallback="/"` (Home), so opening a program URL directly (bookmarked, refreshed tab) sent the user to Home instead of Decision Hub.
2. Navigating from RecommendationPage to a program detail and clicking Back unmounted the Recommendation component, wiping all form inputs and search results. Users had to redo their search every time.

**What changed:**
- `ProgramDetailPage.jsx`: `<BackButton fallback="/" />` → `<BackButton fallback="/decision-hub" />` so the fallback lands in the right section.
- `RecommendationPage.jsx`: Added `sessionStorage` state persistence. On mount, restores `formData`, `results`, and `hasSearched` from `unimatch_recommendation` key if present. After a successful search, writes the current state to sessionStorage. Survives back navigation; clears automatically when the browser tab is closed.

**Files changed:** `frontend/src/pages/ProgramDetailPage.jsx`, `frontend/src/pages/RecommendationPage.jsx`

---

### 83. Sidebar — Fix Icon Spacing Jump Between Expanded and Collapsed States

**Reason:** Collapsing the sidebar caused a dramatic visual jump: item gap went from 4px → 16px and item height from 44px → 52px simultaneously. This made the icons spread out noticeably when collapsed, which felt inconsistent with the expanded rhythm.

**What changed:**
- `.sidebar-collapsed .sidebar-nav` and `.sidebar-collapsed .sidebar-footer` gap: `16px` → `6px`
- `.sidebar-collapsed .sidebar-link` size: `52×52` → `44×44` (matches expanded height)
- `.sidebar-collapsed .sidebar-collapse-btn` size: `52×52` → `44×44`
- `.sidebar-collapsed .sidebar-group-btn` size: `52×52` → `44×44`

Result: expanded and collapsed states now share the same 44px item height and near-identical gap (4px expanded, 6px collapsed), so the transition feels smooth rather than jarring.

**Files changed:** `frontend/src/index.css`

---

### 82. About Page — Remove Sticky Nav and Accordion; Hide Currency Toggle

**Reason:** Horizontal sticky nav doesn't match how documentation/reading pages work — it adds noise without aiding navigation for a page this length. Accordion methodology creates unnecessary friction: users have to click to read, and it makes future additions (formulas, detail, links per phase) structurally awkward. Currency toggle is irrelevant on the About page and adds visual clutter.

**What changed:**
- Removed `.about-page-nav` sticky horizontal nav and all related CSS.
- Replaced accordion methodology with flat always-visible phase cards (`.about-phase-card`): number badge + title in a header row, full description below with left padding to align under the title. Easy to extend with any content in the future.
- Removed all accordion CSS: `.about-accordion-list`, `.about-accordion-item`, `.about-accordion-trigger`, `.about-accordion-number`, `.about-accordion-title`, `.about-accordion-chevron`, `.about-accordion-body`. Also removed `useState` and `ChevronDown` imports from the page.
- Added `isAboutPage` check in `Layout.jsx` (`location.pathname.startsWith('/about')`) and added `&& !isAboutPage` to the currency toggle condition — currency toggle now hidden on About page.

**Files changed:** `frontend/src/pages/AboutPage.jsx`, `frontend/src/index.css`, `frontend/src/components/Layout.jsx`

---

### 81. About Page — Restructure with Sticky Nav, Stats, and Accordion Methodology

**Reason:** The first rewrite (entry #80) improved the content and removed AI filler but still used a flat document structure with no visual hierarchy or navigation — all sections had equal weight and the methodology was a plain numbered list. The user wanted the page to feel navigable (like "multiple sections"), methodology to be expandable/collapsible, and the second builder's name corrected to Kaung Khant Lin (no nickname).

**What changed:**
- Added `.about-page-nav`: sticky horizontal nav bar with 5 anchor links — Mission | Features | Methodology | Data & Sources | Team. Sits just below the page heading and stays visible while scrolling.
- Restructured into 5 clear `id`-anchored sections, each with a `border-bottom` underline heading to visually separate them.
- Mission section: story prose + 4-item stats row (Countries · Programs · Data verified · Status) replacing the old bottom fact strip.
- Methodology: replaced flat phase cards with an **accordion** — 6 phases, all collapsed by default, click to expand. Uses `useState(new Set())` to allow multiple open simultaneously. Chevron icon rotates 180° when open.
- Second builder: renamed from "Zaw Myo Aung / K-Hab" → **Kaung Khant Lin**, no nickname field.
- Builder info simplified: removed `.about-builder-name-row` and `.about-nickname`, `h4` directly in `.about-builder-info`.
- `about-feature-card` titles changed from `h3` → `h4` to respect heading hierarchy.
- New CSS classes (all `var(--*)` tokens): `.about-page-nav`, `.about-page-nav-link`, `.about-prose`, `.about-stats-row`, `.about-stat`, `.about-stat-value`, `.about-stat-label`, `.about-accordion-list`, `.about-accordion-item`, `.about-accordion-trigger`, `.about-accordion-number`, `.about-accordion-title`, `.about-accordion-chevron`, `.about-accordion-body`.
- Removed: `.about-fact-strip`, `.about-fact-item`, `.about-phase-list`, `.about-phase-item`, `.about-phase-badge`, `.about-phase-content`, `.about-builder-name-row`, `.about-nickname`.

**Files changed:** `frontend/src/pages/AboutPage.jsx`, `frontend/src/index.css`

---

### 80. About Page — Full Rewrite (Remove AI Slop, Align to Design System)

**Reason:** The previous About page was AI-generated filler — hero section with a giant photo placeholder, fake footer with non-existent links (Help Center, FAQ, Privacy Policy, contact@unimatch.app), MVP section listing unbuilt features, hardcoded hex colors (#2563eb, #1f2937, etc.) ignoring CSS variables, and a custom font/color system inconsistent with the rest of the app.

**What was removed:**
- Hero section (photo placeholder + two CTA buttons — this is a dashboard page, not a website)
- Mission / Focus / Growth cards row
- "Why UniMatch?" two-column section with second photo placeholder
- MVP cards section (listed unbuilt features like Major Matcher, Accessibility Filters)
- CTA banner ("Helping students choose with confidence")
- Full fake page footer (4 columns, fake links, fake email, fake GitHub URL)
- All `about-*` CSS with hardcoded hex colors (~450 lines removed)
- All responsive `about-*` overrides in media queries

**What was built:**
- Standard `page-stack` + `section-heading` matching all other pages
- Story prose block using `data-freshness-note` class
- Two-column "What it does" / "Who it's for" feature cards
- Methodology expanded to 6 real phases (Problem & Scope → Research → Cleaning → Backend → Frontend → Testing), each with 2–3 honest sentences about what actually happened
- Data & Sources — 3 source cards (Official Sources, Rankings, Exchange Rates)
- Platform facts strip — 4 items: Countries, Stack, Data verified, Status
- Team — 2 builder cards with clean circular avatar placeholders (no text inside), name, nickname (K-Hab), role, GitHub link
- New minimal CSS (all `var(--*)` tokens, no hardcoded colors): `.about-two-col`, `.about-feature-card`, `.about-phase-list`, `.about-phase-item`, `.about-phase-badge`, `.about-sources-row`, `.about-source-card`, `.about-fact-strip`, `.about-fact-item`, `.about-team-grid`, `.about-team-card`, `.about-avatar`, `.about-builder-name-row`, `.about-nickname`

**Files changed:** `frontend/src/pages/AboutPage.jsx`, `frontend/src/index.css`

---

### 79. Admission Overview — Wording and UX Polish

**Reason:** Several labels and copy lines used technical jargon ("backend", "intake cycle"), an ambiguous metric name ("Avg GPA" could mean student GPA not the requirement), a wordy chart footnote, and a literal "x" character as a status checkmark.

**What changed:**
- Page description: removed "backend" jargon → "Compare GPA and IELTS admission thresholds across Taiwan, Thailand, and Singapore."
- Data freshness note: "intake cycle recorded at that time" → "admission requirements recorded at that time."
- Country card metric label: "Avg GPA" → "Avg. Min. GPA" (accurately reflects `average_min_gpa` — the average of each program's minimum required GPA).
- Chart footnote: "GPA is out of 4.0 · IELTS is out of 9.0 — bars reflect values on their respective scales." → "GPA: 0–4.0 scale · IELTS: 0–9.0 scale" (shorter, same information).
- Status badge: `'x'` → `'✓'` so the Completed indicator looks like a proper checkmark.
- Programs table titles: "Lowest-Barrier Programs" → "Easiest Programs to Enter", "Highest-Barrier Programs" → "Most Competitive Programs" (student-facing language, no jargon).

**Files changed:** `frontend/src/pages/AdmissionAnalyticsPage.jsx`

---

### 78. Sidebar — Make UniMatch Logo and Name Clickable (Link to Home)

**Reason:** The sidebar brand area (logo + "UniMatch" text) was a plain `<div>` with no interaction. Users expect clicking a product logo to return them to the home page — this is a standard navigation pattern.

**What changed:**
- Wrapped `.sidebar-brand` div in a `<Link to="/">` (React Router), importing `Link` alongside the existing `NavLink`.
- Added `onClick={closeSidebar}` so the mobile sidebar closes on navigation.
- Added `aria-label="Go to home page"` for accessibility.
- Added `text-decoration: none` and `cursor: pointer` to `.sidebar-brand` in CSS so it doesn't render as an underlined anchor.

**Files changed:** `frontend/src/components/Sidebar.jsx`, `frontend/src/index.css`

---

### 77. Admission Overview — Replace Custom Bar Chart with Recharts Grouped Vertical Bar Chart

**Reason:** The handwritten CSS bar chart (horizontal fills on `<div>` elements) was fragile, didn't respect theme variables, and couldn't render gracefully when data was missing for one country. Replacing with a proper Recharts `BarChart` gives themed tooltips, a legend, correct axis labels, and consistent behavior with the rest of the analytics pages.

**What changed:**
- Added `ADMISSION_TOOLTIP_STYLE` constant (uses CSS vars: `--panel-bg`, `--border`, `--text`).
- Added `AdmissionComparisonChart` component using `<BarChart>` (grouped, not stacked): GPA bar (`var(--accent)`) and IELTS bar (`#5a9e7a`), both with `radius={[3,3,0,0]}`. Legend at top-right. Height 280px.
- `barData` maps country keys → `{ country, gpa, ielts }` with `isAvailable()` guard so missing values produce `undefined` (bar omitted, no crash).
- Removed `ComparisonRow` component entirely (no longer needed).
- Removed `comparisonMax` useMemo (no longer needed).
- Replaced the old comparison section JSX with `<AdmissionComparisonChart countryKeys={countryKeys} countryData={countryData} />`.
- Removed all now-unused CSS classes from `index.css`: `.admission-comparison-legend`, `.admission-legend-item`, `.admission-legend-swatch`, `.comparison-stack`, `.comparison-row`, `.comparison-label`, `.comparison-bars`, `.comparison-country`, `.comparison-country-head`, `.comparison-track`, `.comparison-fill`, `.comparison-fill-gpa`, `.comparison-fill-ielts`, `.admission-axis-label`.
- Added a note below chart: "GPA is out of 4.0 · IELTS is out of 9.0 — bars reflect values on their respective scales."

**Files changed:** `frontend/src/pages/AdmissionAnalyticsPage.jsx`, `frontend/src/index.css`

---

### 76. Admission Snapshot — Replace Country Abbreviations with Real Flags

**Reason:** TW/TH/SG text abbreviations in country snapshot cards were placeholder stand-ins. Real flag SVGs are clearer, more professional, and immediately recognisable.

**What changed:**
- Installed `react-country-flag` (1 package, 0 vulnerabilities).
- Replaced `COUNTRY_MARKER` constant with `COUNTRY_CODE` (same values, clearer name).
- Replaced `{COUNTRY_MARKER[key]}` text span with `<ReactCountryFlag countryCode={...} svg />` inside the existing flag container span. SVG sized 34×22px to fit the 36×24px container.
- Updated `.admission-snapshot-flag` CSS: removed text-specific properties (`font-size`, `font-weight`, `letter-spacing`), added `overflow: hidden` so SVG clips cleanly within the border.

**Files changed:** `frontend/src/pages/AdmissionAnalyticsPage.jsx`, `frontend/src/index.css`, `frontend/package.json`

---

### 75. Admission Overview — Fix Light/Dark Mode (Replace All Hardcoded Colors)

**Reason:** Every CSS rule on the Admission Overview page used hardcoded hex values (#ffffff, #bdbdbd, #222222, etc.) instead of CSS variables, so the page was completely unresponsive to light/dark theme switching.

**Replacements made across all admission CSS rules:**
- `#ffffff` → `var(--panel-bg)`
- `#f3f3f3`, `#f7f7f7`, `#eeeeee` (soft backgrounds) → `var(--panel-soft)`
- `#bdbdbd`, `#d0d0d0`, `#9c9c9c`, `#999999`, `#777777` (borders) → `var(--border)`
- `#222222`, `#333333` (text) → `var(--text)`
- `#555555` (muted text) → `var(--muted)`
- GPA fill/swatch `#cfcfcf` (light gray — invisible in dark mode) → `var(--accent)`
- IELTS fill/swatch `#eeeeee` (near-white — invisible in dark mode) → `#5a9e7a` (green, clearly distinct from accent blue)
- `.admission-program-link` `color: #222222; text-decoration: underline` → `color: var(--accent)` (matches `.text-link` used elsewhere)

**Files changed:** `frontend/src/index.css`

---

### 74. Cost Overview — Move "All values in USD" Next to Page Title

**Reason:** The currency indicator was floating at the right of the filter pills row, disconnected from context. Moving it next to the page title sets the currency expectation immediately before the student sees any data.

**What changed:**
- Wrapped `<h2>` in a `.section-heading-title-row` flex div (align-items: baseline, gap: 12px) so the badge sits on the same baseline as the heading.
- Added `<span className="page-currency-badge">All values in USD</span>` inline after the h2.
- Removed the span from the `analytics-controls-row`.
- Added CSS: `.section-heading-title-row` (flex, baseline, gap) and `.page-currency-badge` (small caps style, muted color).

**Files changed:** `frontend/src/pages/AnalyticsPage.jsx`, `frontend/src/index.css`

---

### 73. Cost Overview — Remove KPI Cards; Reorder Page Sections

**Reason:** KPI cards were redundant — every number they showed is now covered by the visualizations. Exchange Rate card was at the top before any cost data, which is wrong UX — students need costs first, rates are reference. Cheapest Programs sat between charts and reality check, breaking the analytical flow.

**KPI cards removed:**
- Deleted `KpiCards` component function entirely.
- Removed JSX usage from render.
- Removed `formatDisplayCost` import (only used by KpiCards).
- "Excludes application and insurance fees" footnote moved to directly below the Cost Breakdown + Pie grid — where it is contextually relevant.

**New page order:**
1. Filter pills
2. Cost Breakdown + Cost Share By Country (pie)
3. Footnote (fees disclaimer)
4. Tuition vs Living + Monthly Commitment charts
5. Monthly Reality Check
6. Key Observations
7. Cheapest Programs ← moved to end as "act on it" step
8. Exchange Rate Reference ← moved to very bottom as reference material

**Files changed:** `frontend/src/pages/AnalyticsPage.jsx`

---

### 72. Cost Overview — Copy & Label Review Pass

**Reason:** Text across the page was either vague, technical, redundant, or made assumptions about students' financial situations. Pass focused on clarity first, then conciseness — keeping enough context that students understand without information overload.

**Changes (13 total, text only — no logic changes):**
- Page description: clearer second sentence — "See how part-time income stacks up against monthly costs."
- Data freshness note: condensed to one line, removed redundant "Figures reflect the intake cycle recorded at that time."
- KPI eyebrow: "Country Averages" → "Average costs across all programs"
- Cost Breakdown eyebrow: added "months" after ×12 for clarity
- Monthly Commitment eyebrow: replaced formula ("Tuition ÷ 12 + monthly living") with plain English
- Cheapest Programs eyebrow: removed internal "source: cost overview dataset" suffix
- Monthly Reality Check eyebrow: replaced redundant subtitle with "How far part-time income goes each month"
- Annual gap line: "from savings or family" → "gap to cover" (removes financial assumption)
- Reality check footnote: removed preachy second sentence, kept the reference disclaimer only
- No-permit static note: "international university students" → "international students on a student visa" (clearer on why)
- Key Observations eyebrow: "Auto-generated from current data" → "Based on your selected countries"
- Insight #1: removed "among selected countries" (implied), restructured to "at $X/yr"
- Insight #3: simplified — removed "the highest among selected countries" qualifier, shortened to "can cover about X%"
- Insight #4 (no-permit): "budget must rely fully on savings or family support" → "full living costs must be covered without part-time income"

**Files changed:** `frontend/src/pages/AnalyticsPage.jsx`

---

### 71. Monthly Reality Check — Hide No-Permit Country Rows

**Reason:** Countries that don't permit part-time work produced blank, confusing rows (empty progress bar, savings-only text) that added noise without insight. The persistent note at the bottom already handles the communication clearly.

**What changed:**
- Filter in `rows` changed from `.filter(Boolean)` to `.filter((r) => r !== null && r.partTimeAllowed !== false)` — countries with `part_time_allowed: false` are excluded from the rendered list entirely.
- Removed dead JSX branches inside the row that only fired when `partTimeAllowed === false` (badge, savings verdict block) — no longer reachable.
- Simplified remaining row JSX: removed all `partTimeAllowed &&` guards since every rendered row is guaranteed to allow part-time work.

**Files changed:** `frontend/src/pages/AnalyticsPage.jsx`

---

### 70. Monthly Reality Check — Persistent No-Work-Permit Warning

**Reason:** When Thailand appeared in the reality check with no part-time data, the row looked blank and confusing. Students needed a clear, always-visible notice about which countries don't permit part-time work — regardless of whether that country is currently selected in the filter.

**What changed:**
- Added `noWorkCountries` computation in `MonthlyRealityCheck` using `COUNTRY_ORDER` (full list, not filtered) and `rulesMap` — so it reflects actual backend data and works automatically if rules change.
- Added `<p className="reality-static-note">` at the bottom of the InfoCard: e.g. **Thailand** does not permit part-time work for international university students. Always visible.
- Grammar-aware: uses "does" for one country, "do" for multiple.
- Added `.reality-static-note` CSS: left-border style (`border-left: 2px solid var(--border)`), muted text, bold country name in `var(--text)` for emphasis.

**Files changed:** `frontend/src/pages/AnalyticsPage.jsx`, `frontend/src/index.css`

---

### 69. Cost Overview — Remove Annual Cost Breakdown; Chart Polish

**Reason:** Annual Cost Breakdown (custom CSS bar chart) was made redundant by the new Recharts horizontal stacked bar. Legend at chart bottom looked disconnected. Both new charts were too short at 220px.

**Removed:** `StackedCostBar` component and its JSX usage — component definition and render call both deleted.

**Tuition vs Living bar — legend moved to top right:** `verticalAlign="top"` + `align="right"` on `<Legend>`. Changed `wrapperStyle` from `paddingTop` to `paddingBottom` so the spacing sits between legend and chart.

**Both charts — height increased:** 220px → 280px on both `<ResponsiveContainer>` instances for better vertical breathing room.

**Files changed:** `frontend/src/pages/AnalyticsPage.jsx`

---

### 68. Cost Overview — Tuition vs Living Bar + Monthly Commitment Bar

**Reason:** Added a second two-panel row below the existing Cost Breakdown / Cost Share section. Left panel shows a horizontal stacked bar chart (Tuition vs Living Cost per country); right panel shows a vertical bar chart of monthly commitment per country. Both are filtered by the country pills.

**Left — Tuition vs Living Cost (horizontal stacked bar):**
- Recharts `BarChart layout="vertical"` with two stacked `<Bar stackId="a">` components.
- Tuition segment: `var(--accent)` (blue). Living Cost segment: `#c9a071` (warm orange) — matches colors already used in the Cost Breakdown table above.
- `XAxis type="number"` with `$Xk` tick formatter. `YAxis type="category"` with country names (width 75px).
- `CartesianGrid` vertical lines only. Legend at bottom with square icons.
- Themed tooltip showing tuition $, living $, country name as header.

**Right — Monthly Commitment (vertical single bar):**
- Recharts `BarChart` standard vertical layout. Single `<Bar>` with per-bar `<Cell>` colors matching the pie chart country colors (Taiwan blue, Thailand orange, Singapore green) for visual consistency.
- `YAxis` with `$X,XXX` tick formatter. `XAxis` with country short names.
- `CartesianGrid` horizontal lines only. No legend (single series, axis labels sufficient).
- Themed tooltip: `$X,XXX/mo` format. Monthly value derived as `(tuitionUSD / 12) + livingMonthlyUSD` — same logic as existing KPI card, new independent component.

**New CSS:** `.cost-charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px }` — no height cascade needed since both panels use `ResponsiveContainer`.

**Recharts import updated** to include `BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend`.

**Files changed:** `frontend/src/pages/AnalyticsPage.jsx`, `frontend/src/index.css`, `docs/CHANGELOG.md`

---

### 67. Cost Overview — Left Table Space-Evenly; Pie Tooltip Shows Country Name

**Reason:** Left table columns used `justify-content: center` which floated the two content blocks (header + breakdown) in the exact middle of tall cells, looking disconnected and cramped. Pie chart tooltip suppressed the country name (`labelStyle: display:none`), leaving users unable to identify which country a hovered slice belongs to without cross-referencing the legend.

**Left table — vertical distribution:**
- Changed `.cost-column` `justify-content: center` → `justify-content: space-evenly` so equal whitespace appears above, between, and below the header and breakdown blocks — intentional use of the full cell height instead of floating content in the middle.

**Pie chart — tooltip country label:**
- Removed `labelStyle={{ display: 'none' }}` from `<Tooltip>` in `CountryCostPie`.
- Replaced with themed `labelStyle={{ color: 'var(--text)', fontWeight: 600, marginBottom: 2 }}` so Recharts renders the country name as a styled header at the top of the tooltip box.

**Files changed:** `frontend/src/index.css`, `frontend/src/pages/AnalyticsPage.jsx`

---

### 66. Cost Overview — Left Table Center + Fill Height; Pie Thicker Ring + % on Slices

**Reason:** Left cost-breakdown table content was left-aligned and cramped into the top of the card despite the card having height from stretching to match the pie chart. Pie chart ring was too thin and the % was shown in the legend rather than directly on the slices where it is immediately readable.

**Left table — center alignment:**
- Added `text-align: center; justify-content: center` to `.cost-column` — text inherits center alignment, content is vertically centred within the cell height.
- Added `align-items: center` to `.cost-col-header` and `.cost-col-item` — country name, total, and breakdown labels are centred within their own flex containers.

**Left table — fill card height:**
- Added `.cost-overview-viz-grid > .info-card:first-child { display: flex; flex-direction: column }` — left InfoCard becomes a flex column so its content wrapper can grow.
- Added `> div:last-child { flex: 1 }` — the children wrapper div fills remaining card height after the title.
- Added `height: 100%` to `.cost-columns-grid` — the grid fills the flex wrapper, so each column cell gets the full available height. `justify-content: center` on each column then centres the header + breakdown block vertically.

**Pie chart — thicker ring:**
- `innerRadius` 58 → 48 (ring width increases from 32 px to 42 px).

**Pie chart — % on slices instead of legend:**
- Added `renderPctLabel` function: calculates midpoint of each slice (`innerRadius + (outerRadius - innerRadius) × 0.5`) and renders white bold text at that position using SVG `<text>`.
- Added `label={renderPctLabel}` and `labelLine={false}` to `<Pie>` — percentage appears inside each coloured ring segment.
- Removed `pct` calculation and `pie-legend-pct` span from legend — legend now shows only country name + USD amount.

**Files changed:** `frontend/src/pages/AnalyticsPage.jsx`, `frontend/src/index.css`

---

### 65. Cost Overview — Pie Chart: Remove Center Total, Show Combined Total Below Chart

**Reason:** CSS absolute overlay for the center circle conflicted with Recharts' internal tooltip event handling, causing the tooltip to not fire. Recharts does not have a reliable built-in API for a true inner-circle decoration in a donut chart without fighting SVG stacking and pointer-event routing. Decision: drop the center element entirely and show the combined total as a clean labelled line directly below the pie area — honest, readable, no library conflict.

**Changes:**
- Removed `pie-donut-wrapper` div and `pie-donut-center` div from JSX.
- Removed `.pie-donut-wrapper` and `.pie-donut-center` CSS rules.
- `<ResponsiveContainer>` now sits directly inside `.pie-chart-area` with no extra wrapper — this restores normal Recharts tooltip pointer-event routing.
- Added `<p className="pie-combined-total">` below the chart: label "Combined total" in muted text + the USD sum in bold tabular text.
- Added `.pie-combined-total` and `.pie-combined-total span` CSS using `var(--muted)` / `var(--text)` so it adapts to both themes.

**Files changed:** `frontend/src/pages/AnalyticsPage.jsx`, `frontend/src/index.css`

---

### 64. Cost Overview — Pie Center Label: Replace Broken Recharts Label with CSS Overlay

**Reason:** Recharts `<Label position="center">` inside `<Pie>` receives `viewBox.cx/cy` as SVG-internal pixel coordinates that do not reliably match the rendered DOM center — the text was visibly off-center. The fix is to not fight the library and instead use a CSS absolute-position overlay on the wrapper div. Because the pie always renders at `cx="50%" cy="50%"`, the SVG center and the DOM center of its container are the same, making `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)` perfectly accurate.

**Changes:**
- Removed `<Label>` from inside `<Pie>` and removed `Label` from the recharts import.
- Wrapped `<ResponsiveContainer>` in a `.pie-donut-wrapper` div (`position: relative`).
- Added a `.pie-donut-center` div inside the wrapper: `position: absolute`, centred with `translate(-50%, -50%)`, `pointer-events: none` so it does not block tooltip hover on the slices.
- Text: "Total" — small caps, muted colour, letter-spaced. Uses `var(--muted)` so it adapts to light/dark theme.

**Files changed:** `frontend/src/pages/AnalyticsPage.jsx`, `frontend/src/index.css`

---

### 63. Cost Overview — Pie Chart: Restore Right Legend, Remove Slice Labels, Clean Center

**Reason:** Previous pass (#62) mistakenly removed the right-side legend and added country name labels directly on the pie slices. User feedback: keep the right legend (it shows name + amount + %), remove cluttered slice labels, and put only "TOTAL" text in the center hole — no dollar amount. The donut center should be clean and readable; actual values are in the legend and tooltip.

**Changes:**
- Removed `label` and `labelLine` props from `<Pie>` (no slice labels).
- Removed `renderSliceLabel` helper function (no longer needed).
- Restored `.pie-chart-layout` flex wrapper with pie on the left and `.pie-legend` on the right.
- Restored custom legend: colour dot + country name + USD amount + % per entry.
- Center `<Label>` now shows only "TOTAL" (single `<text>` element, small caps, muted colour, vertically centred with `dominantBaseline="central"`). Dollar amount removed from center.
- Tooltip remains for hover interaction — users can inspect exact values by hovering slices.
- `ResponsiveContainer` height set to 220px (no label overhang needed).

**Files changed:** `frontend/src/pages/AnalyticsPage.jsx`

---

### 62. Cost Overview — Pie Slice Labels + Center Total; Left Table Divider + More Breathing Room

**Reason:** Two visual issues after the previous polish pass: (1) the pie chart had no country labels on the slices — the right-side legend was the only way to read which slice was which, making the chart feel incomplete; the friend's mockup explicitly showed country names near each slice and "Total" in the donut center. (2) The left cost-breakdown columns felt cramped with no visual separator between Tuition and Living Cost.

**Pie chart slice labels + center total:**
- Removed the custom `.pie-chart-layout` / `.pie-legend` JSX wrapper (right-side legend). Country identification now lives on the slices themselves.
- Added `label={renderSliceLabel}` to `<Pie>` — renders country name as SVG `<text>` with `fill="var(--muted)"` so it inherits the active light/dark theme.
- Added `labelLine={{ stroke: 'var(--border)', strokeWidth: 1 }}` so the connecting lines also use the theme border colour.
- Added `<Label content={...} position="center">` inside `<Pie>` — renders two SVG text lines in the donut hole: "TOTAL" (small caps, muted) and the USD sum (larger, bold, text colour). Uses CSS vars so it renders correctly in both themes.
- Increased `ResponsiveContainer` height from 200 → 260 to give enough room for labels outside the outer ring.
- Removed unused `Legend` import from recharts; added `Label`.

**Left table — center divider + breathing room:**
- `.cost-column` padding: `14px 16px` → `20px 18px`; gap: `12px` → `18px`. More vertical air between the header and breakdown.
- `.cost-col-breakdown` gap: `8px` → `0`. Spacing is now handled by padding on the items themselves.
- `.cost-col-item`: added `padding: 0 10px`. First child (Tuition): `padding-left: 0; border-right: 1px solid var(--border)`. Last child (Living Cost): `padding-right: 0`. This creates a clean visible center divider line between the two sub-columns.

**Files changed:** `frontend/src/pages/AnalyticsPage.jsx`, `frontend/src/index.css`

---

### 61. Cost Overview — Pie Chart Polish: Legend Right, Themed Tooltip, Equal Card Heights

**Reason:** After building the two-panel layout (#60), three visual issues were found: (1) the left card was shorter than the right because `align-items: start` prevented grid stretch; (2) the Recharts default tooltip used hardcoded white/black colours that ignored the app's light/dark theme; (3) the Recharts `<Legend>` rendered below the pie and overlapped with it at normal heights.

**Equal heights:**
- Changed `align-items: start` → `align-items: stretch` in `.cost-overview-viz-grid`. Grid default stretch makes both cards the same height — the taller right card sets the row height and the left card's border box matches it. No changes to InfoCard needed.

**Legend moved to right side:**
- Removed Recharts `<Legend>` component entirely. Replaced with a custom JSX `.pie-legend` div rendered to the right of the pie area inside a `.pie-chart-layout` flex row.
- Layout: `.pie-chart-area` takes `flex: 1 1 0` (fills remaining space), `.pie-legend` takes `flex: 0 0 auto` (wraps content).
- Each legend item: colour dot + country name + USD amount + % share, all in separate lines for scannability.
- Removed unused `Legend` from the Recharts import.

**Tooltip theming:**
- Added `contentStyle`, `itemStyle`, and `labelStyle` props to `<Tooltip>` using CSS custom properties (`var(--panel-bg)`, `var(--border)`, `var(--text)`). CSS variables work in inline styles in modern browsers, so this correctly inherits the active theme without JS.
- Set `labelStyle={{ display: 'none' }}` to suppress the redundant slice name header Recharts adds above the value row.

**Responsive:**
- Added `.pie-chart-layout { flex-direction: column }` at `≤760px` so the pie and legend stack vertically on mobile.

**Files changed:** `frontend/src/pages/AnalyticsPage.jsx`, `frontend/src/index.css`

---

### 60. Cost Overview — Country Cost Columns + Pie Chart, USD-Only Page

**Reason:** The Cost Overview page lacked a direct at-a-glance comparison of each country's total yearly cost split into tuition vs. living. Students need to see the composition side by side (not just bar proportions) and understand how each country relates to the others as a share of overall cost. The global currency toggle was also confusing on this page because the existing stacked bar already needed USD for fair cross-country proportions — a student could switch to "local" and see three different currencies, which is hard to compare. Making the page USD-only removes the ambiguity entirely.

**New components:**
- `CountryCostColumns` — shows each selected country as a vertical column. Each column has: country name, total annual cost ($), then two sub-columns for Tuition and Living Cost with both USD amounts and percentages of that country's total. Responds to the country filter (deselected countries disappear). Data: `average_yearly_tuition` + `average_monthly_living_cost × 12`, converted to USD.
- `CountryCostPie` (Recharts `PieChart`) — donut chart showing each selected country's total annual cost as a slice of the combined cost across all selected countries. Each slice colour is consistent with the country identity used elsewhere. Legend shows: country name, USD amount, and % share. Also responds to the country filter.
- Both components are placed in a `.cost-overview-viz-grid` two-column layout above the existing Annual Cost Breakdown section.

**USD-only page:**
- Removed `currency` and `toggleCurrency` from `useAppShell()` destructure in `AnalyticsPage`. Hardcoded `const displayCurrency = 'USD'`. All existing components (`StackedCostBar`, `MonthlyRealityCheck`, `InsightsCard`, etc.) continue to receive `displayCurrency` as a prop — no internal changes to those components needed.
- Removed the "Showing USD · Switch to local →" toggle from the controls row. Replaced with a static "All values in USD" label.
- Removed unused `isUSD` constant and `useAppShell` import from `AnalyticsPage`.

**Topbar currency toggle hidden on Cost Overview:**
- Added `isCostOverviewPage = location.pathname === '/analytics'` in `Layout.jsx`.
- Wrapped the currency label + button in the topbar with `{!isCostOverviewPage ? (...) : null}`. Language and Theme toggles remain visible on all pages.
- Uses exact path match (`=== '/analytics'`) so other analytics sub-routes (`/analytics/admission`, etc.) are unaffected.

**Recharts installed:**
- `npm install recharts` (v2) — chosen for React-native API, single package covering Pie/Bar/Line charts for future analytics modules.

**CSS added (`index.css`):**
- `.cost-overview-viz-grid` — 1:1 two-column grid, aligns items to top.
- `.cost-columns-grid` — `auto-fit` grid with `minmax(130px, 1fr)` so it naturally adjusts to 1, 2, or 3 columns based on selected countries.
- `.cost-column`, `.cost-col-header`, `.cost-col-country`, `.cost-col-total`, `.cost-col-breakdown`, `.cost-col-item`, `.cost-col-label`, `.cost-col-amount`, `.cost-col-pct` — layout and typography for the column cards.
- `.cost-col-tuition .cost-col-amount` uses `var(--accent)` (blue), `.cost-col-living .cost-col-amount` uses `#c9a071` (warm orange) — same colours as the stacked bar fills for visual consistency.
- Responsive: at `≤760px`, `.cost-overview-viz-grid` and `.cost-columns-grid` collapse to single column; `.cost-column` border switches from right to bottom.

**Files changed:** `frontend/src/pages/AnalyticsPage.jsx`, `frontend/src/components/Layout.jsx`, `frontend/src/index.css`, `frontend/package.json`

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
