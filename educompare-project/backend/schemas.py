from pydantic import BaseModel
from datetime import date


class UniversitySchema(BaseModel):
    university_id: str
    university_name: str
    country_id: str
    city: str
    university_type: str
    official_website: str
    contact_email: str | None = None
    source_url: str
    last_verified_date: date

    class Config:
        orm_mode = True


class ProgramSchema(BaseModel):
    program_id: str
    university_id: str
    major_name: str
    degree_level: str
    instruction_language: str
    duration_years: float
    intake: str
    application_deadline: date
    source_url: str
    last_verified_date: date

    class Config:
        orm_mode = True