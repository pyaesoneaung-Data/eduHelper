# AGENTS.md

## Project Identity

Project Name: **UniMatch (EduCompare)**
Type: Data-driven web application
Goal: Portfolio-level full-stack project (Data Analyst + Backend + Product Thinking)

---

# 🧠 PROJECT OVERVIEW (CRITICAL CONTEXT)

## Problem Statement

Many first-generation international students from middle-class families want to study abroad but lack reliable guidance. They are often misled by dishonest education agents and social media marketing.

Agents promote:

* low-tier universities as "top-ranked"
* misleading "cheap tuition" claims
* false promises about part-time jobs

Students later discover:

* real living costs are much higher
* job opportunities are restricted or illegal
* they are financially trapped

This project directly addresses that problem.

---

## Mission

To build a **data-driven transparency platform** that replaces agent-based advice with verified, structured, and comparable university data.

---

## Solution Approach

A web-based system that provides:

* Verified cost breakdown (tuition + hidden costs)
* Admission requirement clarity (GPA, IELTS, deadlines)
* Legal work/visa rules per country
* Side-by-side comparison of programs
* Recommendation engine based on student profile

This is NOT a marketing website.
This is a **data product**.

---

## Target Users

* First-generation international students
* Middle-class families
* Students considering Thailand and Taiwan

---

## Data Philosophy (IMPORTANT)

* Always prioritize **truth over appearance**
* Avoid marketing-style language
* Show realistic costs and constraints
* Highlight risks where relevant

---

# 🎯 MVP SCOPE (WHAT MUST BE SUPPORTED)

## 1. Real-Cost Calculator

Purpose: Expose hidden costs

Frontend must show:

* Tuition per semester
* Yearly tuition
* Monthly living cost
* Yearly living cost
* Total yearly cost

If available:

* Application fee
* Insurance fee

Goal:

> Show real financial burden, not just tuition

---

## 2. Side-by-Side Major Matcher

Purpose: Compare programs directly

Must support:

* Compare 2 programs
* Show:

  * University
  * Degree
  * Tuition
  * Living cost
  * Requirements (GPA, IELTS)
  * Deadlines

If data exists:

* Teaching style
* International ratio

---

## 3. Legal Guardrail Dashboard

Purpose: Prevent illegal or misleading expectations

Must show:

* Country rules
* Part-time work allowed
* Work hour limits
* Work permit requirements
* Visa notes

Examples:

* Taiwan → 20 hrs/week with permit
* Thailand → very limited work rights

---

## 4. Recommendation System

Purpose: Match student to programs

### STRICT FILTERS (DO NOT CHANGE)

* country_id
* degree_level
* instruction_language

### SCORING FACTORS

* budget_fit
* gpa_fit
* ielts_fit
* deadline_fit

IMPORTANT:

* DO NOT revert to soft matching for filters
* DO NOT mix filtering and scoring logic

---

## 5. Accessibility-Based Filtering

(If supported by data)

* English-taught programs
* Low cost / low deposit
* Scholarship availability
* No application fee

---

## 6. Red Flag Checklist (STATIC UI)

Must include:

* "Guaranteed admission fee" = red flag
* Verify official sources
* Tuition ≠ total cost
* Check legal work rights

---

# ⚙️ TECH STACK

Backend:

* FastAPI
* SQLAlchemy
* PostgreSQL

Frontend:

* React (Vite)
* Axios

---

# 📁 PROJECT STRUCTURE

backend/

* main.py → API routes
* models.py → DB models
* schemas.py → Pydantic schemas
* database.py → DB connection

frontend/

* src/pages/
* src/components/
* src/api/

---

# 🚨 BACKEND RULES (STRICT)

* DO NOT change database schema unless explicitly asked
* DO NOT rename endpoints
* DO NOT remove fields from responses
* ALWAYS reuse existing endpoints

---

# 🔗 AVAILABLE ENDPOINTS

* GET /universities
* GET /programs
* GET /requirements
* GET /country-rules
* GET /costs
* GET /programs/{program_id}
* GET /compare/programs
* GET /cost-summary
* GET /recommend/programs

---

# 🎨 FRONTEND RULES

* Low-fidelity UI (simple, clean, minimal)
* Focus on clarity and usability
* No heavy UI libraries
* No over-design
* No fake/mock data

# Analytics Extension (Portfolio Priority)

This project is also intended to support **Data Analyst portfolio positioning**, not only full-stack/backend positioning.

The product should include an analytics/dashboard layer that helps users compare Thailand and Taiwan using real summarized insights.

## Analytics Goals

The analytics layer should answer questions like:

* Which country is more affordable overall?
* What is the average yearly cost in Taiwan vs Thailand?
* Which programs are the cheapest?
* Which programs have lower GPA / IELTS barriers?
* Which deadlines are approaching soon?
* Which country offers more affordable English-taught bachelor options?

## Analytics Principles

* Do NOT add random charts just for appearance
* Every chart must answer a real user decision question
* Prioritize clarity and insight over visual complexity
* Use real backend data only
* Do NOT invent metrics that are not supported by current data

## Analytics Features to Prioritize

1. Cost comparison dashboard
2. Admission requirement comparison
3. Deadline insights
4. Recommendation insight breakdown
5. Ranking comparison ONLY if ranking data is standardized from one source

## Cost Dashboard Requirements

The app should support analytics showing:

* average yearly cost by country
* average tuition by country
* average monthly living cost by country
* cheapest programs in each country
* total cost comparisons for Taiwan vs Thailand

## Admission Analytics Requirements

The app should support:

* GPA requirement comparison
* IELTS requirement comparison
* lowest-barrier programs
* highest-barrier programs

## Deadline Analytics Requirements

The app should support:

* upcoming deadlines
* programs closing soon
* deadline month comparisons

## Ranking Data Warning

Do NOT create ranking charts unless ranking data is standardized from a single source.
Mixed rankings must not be visualized as if they are directly comparable.

## Architecture Rule for Analytics

Prefer backend summary endpoints for analytics rather than doing all analytics calculations only in the frontend.

Recommended pattern:

* backend summary/analytics endpoints
* frontend dashboard page consuming those endpoints

## UI Rule for Analytics

Analytics UI should remain low-fidelity, clean, and trustworthy.
Use:

* KPI cards
* simple bar charts
* summary tables
* clear labels

Do NOT use overly decorative dashboards.


Must include pages:

* Home
* Recommendation
* Program Detail
* Cost Calculator
* Compare Programs
* Legal Guardrail
* Red Flag Checklist

---

# 🧠 UX PRINCIPLES

* Trust > beauty
* Clarity > complexity
* Data > decoration

The UI should feel:

* serious
* informative
* transparent

NOT:

* flashy
* gamified
* overly colorful

---

# 🧩 CODING STYLE

* Keep code simple and readable
* Avoid unnecessary abstraction
* Avoid overengineering
* Prefer clarity over cleverness

---

# ⚠️ WHEN GENERATING CODE

ALWAYS:

* Use real backend endpoints
* Keep components modular but simple
* Ensure code runs immediately
* Maintain existing architecture

NEVER:

* invent fake data
* redesign backend without instruction
* break existing API contracts

---

# 🎯 FINAL PRIORITY

This is a **portfolio project**.

Success =

* Working system
* Clear logic
* Real-world problem solving
* Honest data presentation

NOT:

* animations
* complex UI
* visual effects
