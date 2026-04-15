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