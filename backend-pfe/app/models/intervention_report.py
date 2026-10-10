from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database.connection import Base

class InterventionReport(Base):
    __tablename__ = "intervention_reports"

    id = Column(Integer, primary_key=True, index=True)

    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    technicien_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    ligne = Column(String(100))
    capteur = Column(String(100))

    date_intervention = Column(DateTime(timezone=True))
    type_intervention = Column(String(100))

    cause = Column(String(100))
    heure_debut = Column(String(20))
    heure_fin = Column(String(20))

    description = Column(Text)
    action_effectuee = Column(Text)

    pieces = Column(Text)
    recommandations = Column(Text)

    duree = Column(String(50))
    risque = Column(String(50))

    statut = Column(String(50), default="Soumis")

    created_at = Column(DateTime(timezone=True), server_default=func.now())