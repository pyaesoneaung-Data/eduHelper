from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import University, Program, Requirement, CountryRule, CostAndFinance
from schemas import (
    UniversitySchema,
    ProgramSchema,
    RequirementSchema,
    CountryRuleSchema,
    CostAndFinanceSchema,
)

app = FastAPI(title="EduCompare API")


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
    
    ids = program_ids.split(",")

    programs = db.query(Program).filter(Program.program_id.in_(ids)).all()

    result = []

    for program in programs:
        university = db.query(University).filter(
            University.university_id == program.university_id
        ).first()

        cost = db.query(CostAndFinance).filter(
            CostAndFinance.program_id == program.program_id
        ).first()

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
        "estimated_total_yearly_cost": total_yearly_cost
    }

@app.get("/recommend/programs")
def recommend_programs(
    country_id: str | None = None,
    degree_level: str | None = None,
    instruction_language: str | None = None,
    max_budget: float | None = None,
    db: Session = Depends(get_db)
):
    programs = db.query(Program).all()
    recommendations = []

    for program in programs:
        university = db.query(University).filter(
            University.university_id == program.university_id
        ).first()

        cost = db.query(CostAndFinance).filter(
            CostAndFinance.program_id == program.program_id
        ).first()

        if not university or not cost:
            continue

        yearly_tuition = float(cost.tuition_fee_per_semester) * 2
        yearly_living = float(cost.avg_monthly_living_cost) * 12
        yearly_total = yearly_tuition + yearly_living

        score = 0

        if country_id and university.country_id == country_id:
            score += 30

        if degree_level and program.degree_level.lower() == degree_level.lower():
            score += 25

        if instruction_language and program.instruction_language.lower() == instruction_language.lower():
            score += 20

        if max_budget is not None and yearly_total <= max_budget:
            score += 25

        recommendations.append({
            "program_id": program.program_id,
            "major_name": program.major_name,
            "university_name": university.university_name,
            "country_id": university.country_id,
            "degree_level": program.degree_level,
            "instruction_language": program.instruction_language,
            "currency": cost.currency,
            "estimated_yearly_cost": yearly_total,
            "score": score
        })

    recommendations.sort(key=lambda x: x["score"], reverse=True)
    return recommendations