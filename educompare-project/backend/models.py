from sqlalchemy import Column, String, Text, Date, Numeric, ForeignKey, Boolean, Integer
from database import Base


class University(Base):
    __tablename__ = "universities"

    university_id = Column(String, primary_key=True, index=True)
    university_name = Column(String)
    country_id = Column(String)
    city = Column(String)
    university_type = Column(String)
    world_rank = Column(String, nullable=True)
    official_website = Column(Text)
    contact_email = Column(String, nullable=True)
    teaching_style_score = Column(String, nullable=True)
    source_url = Column(Text)
    last_verified_date = Column(Date)


class Program(Base):
    __tablename__ = "programs"

    program_id = Column(String, primary_key=True, index=True)
    university_id = Column(String, ForeignKey("universities.university_id"))
    major_name = Column(String)
    degree_level = Column(String)
    instruction_language = Column(String)
    duration_years = Column(Numeric)
    intake = Column(String)
    application_deadline = Column(Date)
    source_url = Column(Text)
    last_verified_date = Column(Date)


class Requirement(Base):
    __tablename__ = "requirements"

    requirement_id = Column(String, primary_key=True, index=True)
    program_id = Column(String, ForeignKey("programs.program_id"))
    min_gpa = Column(Numeric, nullable=True)
    ielts_min = Column(Numeric, nullable=True)
    hsk_tocfl_min = Column(String, nullable=True)
    documents_required = Column(Text, nullable=True)
    interview_required = Column(Boolean, nullable=True)
    portfolio_required = Column(Boolean, nullable=True)
    source_url = Column(Text)
    last_verified_date = Column(Date)


class CountryRule(Base):
    __tablename__ = "country_rules"

    country_id = Column(String, primary_key=True, index=True)
    country_name = Column(String)
    visa_type = Column(String)
    part_time_allowed = Column(Boolean, nullable=True)
    work_hour_limit = Column(Integer, nullable=True)
    work_permit_required = Column(Boolean, nullable=True)
    min_hourly_wage = Column(String, nullable=True)
    currency = Column(String, nullable=True)
    post_study_work_visa = Column(String, nullable=True)
    visa_notes = Column(Text, nullable=True)
    source_url = Column(Text)
    last_verified_date = Column(Date)


class CostAndFinance(Base):
    __tablename__ = "cost_and_finance"

    cost_id = Column(String, primary_key=True, index=True)
    program_id = Column(String, ForeignKey("programs.program_id"))
    tuition_fee_per_semester = Column(Integer)
    application_fee = Column(Integer, nullable=True)
    insurance_fee = Column(Integer, nullable=True)
    avg_monthly_living_cost = Column(Integer)
    currency = Column(String)
    source_url = Column(Text)
    last_verified_date = Column(Date)