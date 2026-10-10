from sqlalchemy import Column, Integer, Float, String, Boolean
from app.database.connection import Base

class Threshold(Base):
    __tablename__ = "thresholds"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String, unique=True, index=True)
    sensor_name = Column(String)
    ligne = Column(String)
    min_value = Column(Float, nullable=True)
    max_value = Column(Float, nullable=True)
    unit = Column(String)
    is_active = Column(Boolean, default=True)
