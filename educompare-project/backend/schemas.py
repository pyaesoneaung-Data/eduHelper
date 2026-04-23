from pydantic import BaseModel, ConfigDict
from datetime import date


class UniversitySchema(BaseModel):
    university_id: str
    university_name: str
    country_id: str
    city: str | None = None
    university_type: str | None = None
    official_website: str | None = None
    contact_email: str | None = None
    source_url: str | None = None
    last_verified_date: date | None = None

    model_config = ConfigDict(from_attributes=True)


class ProgramSchema(BaseModel):
    program_id: str
    university_id: str
    major_name: str
    degree_level: str
    instruction_language: str
    duration_years: float | None = None
    intake: str | None = None
    application_deadline: date | None = None
    source_url: str | None = None
    last_verified_date: date | None = None

    model_config = ConfigDict(from_attributes=True)


class RequirementSchema(BaseModel):
    requirement_id: str
    program_id: str
    min_gpa: float | None = None
    ielts_min: float | None = None
    hsk_tocfl_min: str | None = None
    documents_required: str | None = None
    interview_required: bool | None = None
    portfolio_required: bool | None = None
    source_url: str | None = None
    last_verified_date: date | None = None

    model_config = ConfigDict(from_attributes=True)


class CountryRuleSchema(BaseModel):
    country_id: str
    country_name: str
    visa_type: str | None = None
    part_time_allowed: bool | None = None
    work_hour_limit: int | None = None
    work_permit_required: bool | None = None
    min_hourly_wage: str | None = None
    currency: str | None = None
    post_study_work_visa: str | None = None
    visa_notes: str | None = None
    source_url: str | None = None
    last_verified_date: date | None = None

    model_config = ConfigDict(from_attributes=True)


class CostAndFinanceSchema(BaseModel):
    cost_id: str
    program_id: str
    tuition_fee_per_semester: int
    application_fee: int | None = None
    insurance_fee: int | None = None
    avg_monthly_living_cost: int
    currency: str
    source_url: str | None = None
    last_verified_date: date | None = None

    model_config = ConfigDict(from_attributes=True)
