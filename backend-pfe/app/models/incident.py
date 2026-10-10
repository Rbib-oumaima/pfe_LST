from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.sql import func
from app.database.connection import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    ligne = Column(String, index=True)
    sensor_id = Column(String)
    sensor_name = Column(String)
    value = Column(String)
    threshold_value = Column(String)
    severity = Column(String)           # CRITIQUE, AVERTISSEMENT
    status = Column(String, default="OUVERT")   # OUVERT, RESOLU
    description = Column(Text)
    action_taken = Column(Text, nullable=True)
