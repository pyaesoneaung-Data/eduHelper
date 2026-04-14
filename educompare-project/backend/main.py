from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import University, Program
from schemas import UniversitySchema, ProgramSchema

app = FastAPI(title="EduCompare API")


@app.get("/")
def read_root():
    return {"message": "Welcome to EduCompare API"}


# ✅ Universities with filter
@app.get("/universities", response_model=list[UniversitySchema])
def get_universities(country_id: str = None, db: Session = Depends(get_db)):
    query = db.query(University)

    if country_id:
        query = query.filter(University.country_id == country_id)

    return query.all()


# ✅ Programs with filter
@app.get("/programs", response_model=list[ProgramSchema])
def get_programs(degree_level: str = None, db: Session = Depends(get_db)):
    query = db.query(Program)

    if degree_level:
        query = query.filter(Program.degree_level == degree_level)

    return query.all()