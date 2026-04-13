from fastapi import FastAPI
from sqlalchemy.orm import Session
from database import SessionLocal
from models import University, Program

app = FastAPI(title="EduCompare API")


@app.get("/")
def read_root():
    return {"message": "Welcome to EduCompare API"}


@app.get("/universities")
def get_universities():
    db: Session = SessionLocal()
    try:
        universities = db.query(University).all()
        return universities
    finally:
        db.close()


@app.get("/programs")
def get_programs():
    db: Session = SessionLocal()
    try:
        programs = db.query(Program).all()
        return programs
    finally:
        db.close()