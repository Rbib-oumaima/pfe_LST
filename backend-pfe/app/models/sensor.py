from sqlalchemy import Column, Integer, Float, String, DateTime
from sqlalchemy.sql import func
from app.database.connection import Base

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    ligne = Column(String, index=True)           # L1, L2, L3 (PN, Granulateur, etc.)
    sensor_id = Column(String, index=True)        # FIC-001, TI-027 ...
    sensor_name = Column(String)                  # Label lisible
    value = Column(Float)
    unit = Column(String)                         # Â°C, m3/h, T/h, %
