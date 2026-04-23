"""
Seed script — run from the backend/ directory:
    cd educompare-project/backend
    python seed.py

Populates all 5 tables from CSV files in data/templates/.
Uses merge() so it is safe to run multiple times (upsert by primary key).

Insertion order (respects foreign key constraints):
    1. country_rules
    2. universities
    3. programs
    4. requirements
    5. cost_and_finance
"""

import csv
import os
import sys
from datetime import date
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    sys.exit("ERROR: DATABASE_URL not set in .env")

from database import Base
from models import CostAndFinance, CountryRule, Program, Requirement, University

DATA_DIR = Path(__file__).parent.parent / "data" / "templates"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


# ---------- helpers ----------

def to_bool(val: str):
    v = val.strip().upper()
    if v == "TRUE":
        return True
    if v == "FALSE":
        return False
    return None


def to_str(val: str):
    s = val.strip()
    return s if s else None


def to_int(val: str):
    s = val.strip()
    return int(s) if s else None


def to_float(val: str):
    s = val.strip()
    return float(s) if s else None


def to_date(val: str):
    return date.fromisoformat(val.strip())


# ---------- seeders ----------

def seed_country_rules(db):
    file = DATA_DIR / "country_rules_template.csv"
    with open(file, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    for row in rows:
        db.merge(CountryRule(
            country_id=row["country_id"].strip(),
            country_name=row["country_name"].strip(),
            visa_type=row["visa_type"].strip(),
            part_time_allowed=to_bool(row["part_time_allowed"]),
            work_hour_limit=to_int(row["work_hour_limit"]),
            work_permit_required=to_bool(row["work_permit_required"]),
            min_hourly_wage=to_str(row["min_hourly_wage"]),
            currency=to_str(row["currency"]),
            post_study_work_visa=to_str(row["post_study_work_visa"]),
            visa_notes=to_str(row["visa_notes"]),
            source_url=row["source_url"].strip(),
            last_verified_date=to_date(row["last_verified_date"]),
        ))
    db.commit()
    print(f"  country_rules      : {len(rows)} rows")


def seed_universities(db):
    file = DATA_DIR / "universities_template.csv"
    with open(file, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    for row in rows:
        db.merge(University(
            university_id=row["university_id"].strip(),
            university_name=row["university_name"].strip(),
            country_id=row["country_id"].strip(),
            city=row["city"].strip(),
            university_type=row["university_type"].strip(),
            world_rank=to_str(row["world_rank"]),
            official_website=row["official_website"].strip(),
            contact_email=to_str(row["contact_email"]),
            teaching_style_score=to_str(row["teaching_style_score"]),
            source_url=row["source_url"].strip(),
            last_verified_date=to_date(row["last_verified_date"]),
        ))
    db.commit()
    print(f"  universities       : {len(rows)} rows")


def seed_programs(db):
    file = DATA_DIR / "programs_template.csv"
    with open(file, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    for row in rows:
        db.merge(Program(
            program_id=row["program_id"].strip(),
            university_id=row["university_id"].strip(),
            major_name=row["major_name"].strip(),
            degree_level=row["degree_level"].strip(),
            instruction_language=row["instruction_language"].strip(),
            duration_years=float(row["duration_years"].strip()),
            intake=row["intake"].strip(),
            application_deadline=to_date(row["application_deadline"]),
            source_url=row["source_url"].strip(),
            last_verified_date=to_date(row["last_verified_date"]),
        ))
    db.commit()
    print(f"  programs           : {len(rows)} rows")


def seed_requirements(db):
    file = DATA_DIR / "requirements_template.csv"
    with open(file, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    for row in rows:
        db.merge(Requirement(
            requirement_id=row["requirement_id"].strip(),
            program_id=row["program_id"].strip(),
            min_gpa=to_float(row["min_gpa"]),
            ielts_min=to_float(row["ielts_min"]),
            hsk_tocfl_min=to_str(row["hsk_tocfl_min"]),
            documents_required=to_str(row["documents_required"]),
            interview_required=to_bool(row["interview_required"]),
            portfolio_required=to_bool(row["portfolio_required"]),
            source_url=row["source_url"].strip(),
            last_verified_date=to_date(row["last_verified_date"]),
        ))
    db.commit()
    print(f"  requirements       : {len(rows)} rows")


def seed_costs(db):
    file = DATA_DIR / "cost_and_finance_template.csv"
    with open(file, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    for row in rows:
        db.merge(CostAndFinance(
            cost_id=row["cost_id"].strip(),
            program_id=row["program_id"].strip(),
            tuition_fee_per_semester=int(row["tuition_fee_per_semester"].strip()),
            application_fee=to_int(row["application_fee"]),
            insurance_fee=to_int(row["insurance_fee"]),
            avg_monthly_living_cost=int(row["avg_monthly_living_cost"].strip()),
            currency=row["currency"].strip(),
            source_url=row["source_url"].strip(),
            last_verified_date=to_date(row["last_verified_date"]),
        ))
    db.commit()
    print(f"  cost_and_finance   : {len(rows)} rows")


# ---------- main ----------

if __name__ == "__main__":
    print("Creating tables if they don't exist...")
    Base.metadata.create_all(engine)
    print("Tables ready.\n")

    db = SessionLocal()
    try:
        print("Seeding...")
        seed_country_rules(db)
        seed_universities(db)
        seed_programs(db)
        seed_requirements(db)
        seed_costs(db)
        print("\nAll done. Database is live.")
    except Exception as e:
        db.rollback()
        print(f"\nERROR: {e}")
        raise
    finally:
        db.close()
