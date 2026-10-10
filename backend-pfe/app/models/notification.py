from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from app.database.connection import Base

class Notification(Base):
    __tablename__ = "notifications"

    id            = Column(Integer, primary_key=True, index=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    incident_id   = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    sender_role   = Column(String, default="operateur")
    receiver_role = Column(String, default="technicien")
    urgence       = Column(String, default="NORMALE")
    message       = Column(Text)
    is_read       = Column(String, default="false")
    status        = Column(String, default="EN_ATTENTE")