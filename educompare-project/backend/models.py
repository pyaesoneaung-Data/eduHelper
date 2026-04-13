from sqlalchemy import Column, String, Text, Date, Numeric, ForeignKey
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