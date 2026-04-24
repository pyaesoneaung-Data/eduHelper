#frontend
from fastapi.middleware.cors import CORSMiddleware

#backend
from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from datetime import date
from models import University, Program, Requirement, CountryRule, CostAndFinance
from schemas import (
    UniversitySchema,
    ProgramSchema,
    RequirementSchema,
    CountryRuleSchema,
    CostAndFinanceSchema,
)


app = FastAPI(title="EduCompare API")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to EduCompare API"}


@app.get("/universities", response_model=list[UniversitySchema])
def get_universities(country_id: str = None, db: Session = Depends(get_db)):
    query = db.query(University)

    if country_id:
        query = query.filter(University.country_id == country_id)

    return query.all()


@app.get("/programs", response_model=list[ProgramSchema])
def get_programs(degree_level: str = None, db: Session = Depends(get_db)):
    query = db.query(Program)

    if degree_level:
        query = query.filter(Program.degree_level == degree_level)

    return query.all()


@app.get("/requirements", response_model=list[RequirementSchema])
def get_requirements(program_id: str = None, db: Session = Depends(get_db)):
    query = db.query(Requirement)

    if program_id:
        query = query.filter(Requirement.program_id == program_id)

    return query.all()


@app.get("/country-rules", response_model=list[CountryRuleSchema])
def get_country_rules(country_id: str = None, db: Session = Depends(get_db)):
    query = db.query(CountryRule)

    if country_id:
        query = query.filter(CountryRule.country_id == country_id)

    return query.all()


@app.get("/costs", response_model=list[CostAndFinanceSchema])
def get_costs(currency: str = None, program_id: str = None, db: Session = Depends(get_db)):
    query = db.query(CostAndFinance)

    if currency:
        query = query.filter(CostAndFinance.currency == currency)

    if program_id:
        query = query.filter(CostAndFinance.program_id == program_id)

    return query.all()

@app.get("/programs/{program_id}")
def get_program_detail(program_id: str, db: Session = Depends(get_db)):
    
    program = db.query(Program).filter(Program.program_id == program_id).first()
    
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    university = db.query(University).filter(
        University.university_id == program.university_id
    ).first()

    requirements = db.query(Requirement).filter(
        Requirement.program_id == program_id
    ).all()

    cost = db.query(CostAndFinance).filter(
        CostAndFinance.program_id == program_id
    ).first()

    return {
        "program": program,
        "university": university,
        "requirements": requirements,
        "cost": cost
    }

@app.get("/compare/programs")
def compare_programs(program_ids: str, db: Session = Depends(get_db)):

    ids = [pid.strip() for pid in program_ids.split(",") if pid.strip()]

    if not (2 <= len(ids) <= 4):
        raise HTTPException(
            status_code=422,
            detail="program_ids must contain 2 to 4 comma-separated program IDs."
        )

    programs = db.query(Program).filter(Program.program_id.in_(ids)).all()

    # Pre-load universities and costs for only the requested programs (3 queries total)
    university_ids = [p.university_id for p in programs]
    universities = db.query(University).filter(University.university_id.in_(university_ids)).all()
    university_map = {u.university_id: u for u in universities}

    costs = db.query(CostAndFinance).filter(CostAndFinance.program_id.in_(ids)).all()
    cost_map = {c.program_id: c for c in costs}

    result = []

    for program in programs:
        university = university_map.get(program.university_id)
        cost = cost_map.get(program.program_id)

        result.append({
            "program_id": program.program_id,
            "major_name": program.major_name,
            "university": university.university_name if university else None,
            "degree_level": program.degree_level,
            "tuition_fee": cost.tuition_fee_per_semester if cost else None,
            "currency": cost.currency if cost else None,
            "living_cost": cost.avg_monthly_living_cost if cost else None
        })

    return result

@app.get("/cost-summary")
def cost_summary(program_id: str, db: Session = Depends(get_db)):
    
    cost = db.query(CostAndFinance).filter(
        CostAndFinance.program_id == program_id
    ).first()

    if not cost:
        raise HTTPException(status_code=404, detail="Cost not found")

    yearly_tuition = cost.tuition_fee_per_semester * 2
    yearly_living = cost.avg_monthly_living_cost * 12

    total_yearly_cost = yearly_tuition + yearly_living

    return {
        "program_id": program_id,
        "currency": cost.currency,
        "tuition_per_semester": cost.tuition_fee_per_semester,
        "yearly_tuition": yearly_tuition,
        "monthly_living_cost": cost.avg_monthly_living_cost,
        "yearly_living_cost": yearly_living,
        "estimated_total_yearly_cost": total_yearly_cost,
        "application_fee": cost.application_fee,
        "insurance_fee": cost.insurance_fee,
    }

@app.get("/recommend/programs")
def recommend_programs(
    country_id: str | None = None,
    degree_level: str | None = None,
    instruction_language: str | None = None,
    max_budget: float | None = Query(default=None, ge=0, description="Maximum yearly budget in native currency (TWD or THB)"),
    user_gpa: float | None = Query(default=None, ge=0.0, le=4.0, description="Student GPA on a 0.0–4.0 scale"),
    user_ielts: float | None = Query(default=None, ge=0.0, le=9.0, description="Student IELTS band score (0.0–9.0)"),
    preferred_deadline_before: str | None = None,
    limit: int = Query(default=10, ge=1, le=50, description="Number of results to return (1–50)"),
    offset: int = Query(default=0, ge=0, description="Pagination offset"),
    db: Session = Depends(get_db)
):
    if not any([
        country_id,
        degree_level,
        instruction_language,
        max_budget is not None,
        user_gpa is not None,
        user_ielts is not None,
        preferred_deadline_before
    ]):
        return {
            "detail": "Please provide at least one recommendation criterion."
        }

    # Pre-load all data into maps — avoids N+1 (was 3N+1 queries, now 4 total)
    programs = db.query(Program).all()

    all_universities = db.query(University).all()
    university_map = {u.university_id: u for u in all_universities}

    all_costs = db.query(CostAndFinance).all()
    cost_map = {c.program_id: c for c in all_costs}

    all_requirements = db.query(Requirement).all()
    req_map = {r.program_id: r for r in all_requirements}

    recommendations = []

    deadline_limit = None
    if preferred_deadline_before:
        try:
            deadline_limit = date.fromisoformat(preferred_deadline_before)
        except ValueError:
            raise HTTPException(
                status_code=422,
                detail="preferred_deadline_before must be a valid ISO date in YYYY-MM-DD format."
            )

    for program in programs:
        university = university_map.get(program.university_id)
        cost = cost_map.get(program.program_id)
        requirement = req_map.get(program.program_id)

        if not university or not cost:
            continue

        # ✅ STRICT FILTERS
        if country_id and university.country_id != country_id:
            continue

        if degree_level and program.degree_level.lower() != degree_level.lower():
            continue

        if instruction_language and program.instruction_language.lower() != instruction_language.lower():
            continue

        yearly_tuition = float(cost.tuition_fee_per_semester) * 2
        yearly_living = float(cost.avg_monthly_living_cost) * 12
        yearly_total = yearly_tuition + yearly_living

        score = 0

        score_breakdown = {
            "budget_fit": 0,
            "gpa_fit": 0,
            "ielts_fit": 0,
            "deadline_fit": 0
        }

        # Budget scoring
        if max_budget is not None and yearly_total <= max_budget:
            score += 25
            score_breakdown["budget_fit"] = 25

        # GPA scoring
        if requirement and user_gpa is not None and requirement.min_gpa is not None:
            if user_gpa >= float(requirement.min_gpa):
                score += 20
                score_breakdown["gpa_fit"] = 20

        # IELTS scoring
        if requirement and user_ielts is not None and requirement.ielts_min is not None:
            if user_ielts >= float(requirement.ielts_min):
                score += 20
                score_breakdown["ielts_fit"] = 20

        # Deadline scoring
        if deadline_limit and program.application_deadline is not None:
            if program.application_deadline <= deadline_limit:
                score += 10
                score_breakdown["deadline_fit"] = 10

        recommendations.append({
            "program_id": program.program_id,
            "major_name": program.major_name,
            "university_name": university.university_name,
            "country_id": university.country_id,
            "degree_level": program.degree_level,
            "instruction_language": program.instruction_language,
            "currency": cost.currency,
            "estimated_yearly_cost": yearly_total,
            "required_min_gpa": float(requirement.min_gpa) if requirement and requirement.min_gpa is not None else None,
            "required_ielts": float(requirement.ielts_min) if requirement and requirement.ielts_min is not None else None,
            "application_deadline": program.application_deadline,
            "score": score,
            "score_breakdown": score_breakdown
        })

    recommendations.sort(key=lambda x: x["score"], reverse=True)
    return recommendations[offset: offset + limit]


@app.get("/analytics/cost-overview")
def analytics_cost_overview(db: Session = Depends(get_db)):
    country_rules = db.query(CountryRule).all()
    country_name_map = {
        rule.country_id: (rule.country_name or "").strip().lower() for rule in country_rules
    }
    fallback_country_names = {
        "C001": "taiwan",
        "C002": "thailand",
        "C003": "singapore",
    }

    records = (
        db.query(Program, University, CostAndFinance)
        .join(University, University.university_id == Program.university_id)
        .join(CostAndFinance, CostAndFinance.program_id == Program.program_id)
        .all()
    )

    if not records:
        return {"countries": {}}

    # Build groups dynamically — adding a new country requires no code change
    country_groups = {name: [] for name in country_name_map.values() if name}

    for program, university, cost in records:
        normalized_name = country_name_map.get(university.country_id, "").lower()

        if not normalized_name:
            normalized_name = fallback_country_names.get(university.country_id, "")

        if normalized_name in country_groups:
            country_groups[normalized_name].append((program, university, cost))

    def summarize_country(label: str, entries: list[tuple[Program, University, CostAndFinance]]):
        if not entries:
            return {
                "country_id": None,
                "country_name": label.title(),
                "currency": None,
                "average_yearly_cost": 0,
                "average_yearly_tuition": 0,
                "average_monthly_living_cost": 0,
                "cheapest_programs": [],
            }

        totals = []

        for program, university, cost in entries:
            yearly_tuition = float(cost.tuition_fee_per_semester) * 2
            monthly_living_cost = float(cost.avg_monthly_living_cost)
            yearly_cost = yearly_tuition + (monthly_living_cost * 12)

            totals.append({
                "program_id": program.program_id,
                "major_name": program.major_name,
                "university_name": university.university_name,
                "currency": cost.currency,
                "yearly_tuition": yearly_tuition,
                "monthly_living_cost": monthly_living_cost,
                "yearly_cost": yearly_cost,
                "country_id": university.country_id,
            })

        cheapest_programs = sorted(totals, key=lambda item: item["yearly_cost"])[:5]

        average_yearly_cost = sum(item["yearly_cost"] for item in totals) / len(totals)
        average_yearly_tuition = sum(item["yearly_tuition"] for item in totals) / len(totals)
        average_monthly_living_cost = sum(item["monthly_living_cost"] for item in totals) / len(totals)

        return {
            "country_id": totals[0]["country_id"],
            "country_name": label.title(),
            "currency": totals[0]["currency"],
            "average_yearly_cost": round(average_yearly_cost, 2),
            "average_yearly_tuition": round(average_yearly_tuition, 2),
            "average_monthly_living_cost": round(average_monthly_living_cost, 2),
            "cheapest_programs": [
                {
                    "program_id": item["program_id"],
                    "major_name": item["major_name"],
                    "university_name": item["university_name"],
                    "yearly_cost": round(item["yearly_cost"], 2),
                    "currency": item["currency"],
                }
                for item in cheapest_programs
            ],
        }

    return {
        "countries": {
            name: summarize_country(name, entries)
            for name, entries in country_groups.items()
        }
    }


@app.get("/analytics/best-value-programs")
def best_value_programs(db: Session = Depends(get_db)):
    # Single JOIN for programs + universities + costs (no duplicates)
    records = (
        db.query(Program, University, CostAndFinance)
        .join(University, University.university_id == Program.university_id)
        .join(CostAndFinance, CostAndFinance.program_id == Program.program_id)
        .all()
    )

    # Fetch all requirements once and build a lookup map (avoids N+1)
    all_requirements = db.query(Requirement).all()
    req_map = {}
    for req in all_requirements:
        if req.program_id not in req_map:
            req_map[req.program_id] = req

    result = []
    for program, university, cost in records:
        req = req_map.get(program.program_id)
        yearly_cost = float(cost.tuition_fee_per_semester) * 2 + float(cost.avg_monthly_living_cost) * 12
        result.append({
            "program_id": program.program_id,
            "university_id": university.university_id,
            "university_name": university.university_name,
            "country_id": university.country_id,
            "yearly_cost": round(yearly_cost, 2),
            "currency": cost.currency,
            "min_gpa": float(req.min_gpa) if req and req.min_gpa is not None else None,
            "ielts_min": float(req.ielts_min) if req and req.ielts_min is not None else None,
        })

    return result


@app.get("/analytics/admission-overview")
def analytics_admission_overview(db: Session = Depends(get_db)):
    records = (
        db.query(Requirement, Program, University)
        .join(Program, Program.program_id == Requirement.program_id)
        .join(University, University.university_id == Program.university_id)
        .all()
    )

    country_rules = db.query(CountryRule).all()
    country_name_map = {
        rule.country_id: (rule.country_name or "").strip().lower() for rule in country_rules
    }
    fallback_country_names = {
        "C001": "taiwan",
        "C002": "thailand",
        "C003": "singapore",
    }

    # Build groups dynamically — adding a new country requires no code change
    country_groups = {name: [] for name in country_name_map.values() if name}

    for requirement, program, university in records:
        normalized_name = country_name_map.get(university.country_id, "").lower()

        if not normalized_name:
            normalized_name = fallback_country_names.get(university.country_id, "")

        if normalized_name in country_groups:
            country_groups[normalized_name].append((requirement, program, university))

    def summarize_country(label: str, entries: list[tuple[Requirement, Program, University]]):
        gpa_values = [
            float(requirement.min_gpa)
            for requirement, _, _ in entries
            if requirement.min_gpa is not None
        ]
        ielts_values = [
            float(requirement.ielts_min)
            for requirement, _, _ in entries
            if requirement.ielts_min is not None
        ]

        ranked_programs = []

        for requirement, program, university in entries:
            if requirement.min_gpa is None or requirement.ielts_min is None:
                continue

            ranked_programs.append({
                "program_id": program.program_id,
                "major_name": program.major_name,
                "university_name": university.university_name,
                "country_id": university.country_id,
                "min_gpa": float(requirement.min_gpa),
                "ielts_min": float(requirement.ielts_min),
            })

        easiest_programs = sorted(
            ranked_programs,
            key=lambda item: (item["min_gpa"], item["ielts_min"], item["major_name"]),
        )[:5]

        hardest_programs = sorted(
            ranked_programs,
            key=lambda item: (item["min_gpa"], item["ielts_min"], item["major_name"]),
            reverse=True,
        )[:5]

        return {
            "country_id": entries[0][2].country_id if entries else None,
            "country_name": label.title(),
            "average_min_gpa": round(sum(gpa_values) / len(gpa_values), 2) if gpa_values else None,
            "average_ielts": round(sum(ielts_values) / len(ielts_values), 2) if ielts_values else None,
            "max_gpa": round(max(gpa_values), 2) if gpa_values else None,
            "min_gpa": round(min(gpa_values), 2) if gpa_values else None,
            "max_ielts": round(max(ielts_values), 2) if ielts_values else None,
            "min_ielts": round(min(ielts_values), 2) if ielts_values else None,
            "easiest_programs": easiest_programs,
            "hardest_programs": hardest_programs,
        }

    return {
        "countries": {
            name: summarize_country(name, entries)
            for name, entries in country_groups.items()
        }
    }


RANKING_COUNTRY_NAMES = {
    "C001": "Taiwan",
    "C002": "Thailand",
    "C003": "Singapore",
}


@app.get("/analytics/ranking-overview")
def analytics_ranking_overview(db: Session = Depends(get_db)):
    universities = db.query(University).all()

    ranked = []
    for u in universities:
        raw = str(u.world_rank).strip() if u.world_rank else ""
        if not raw:
            continue
        try:
            rank_int = int(raw)
        except ValueError:
            continue
        ranked.append({
            "university_id": u.university_id,
            "university_name": u.university_name,
            "country_id": u.country_id,
            "country_name": RANKING_COUNTRY_NAMES.get(u.country_id, u.country_id),
            "city": u.city,
            "university_type": u.university_type,
            "world_rank": rank_int,
            "official_website": u.official_website,
        })

    ranked.sort(key=lambda x: x["world_rank"])
    return {"universities": ranked}
