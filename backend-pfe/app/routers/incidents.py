from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import Optional
from app.database.connection import get_db
from app.models.incident import Incident

router = APIRouter()

@router.get("/")
def list_incidents(
    status: Optional[str] = None,
    ligne:  Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Incident)
    if status:
        q = q.filter(Incident.status == status)
    if ligne:
        q = q.filter(Incident.ligne == ligne)
    return q.order_by(Incident.created_at.desc()).limit(200).all()

@router.patch("/{incident_id}")
def update_incident(
    incident_id:  int,
    status:       str           = Body(...),
    action_taken: Optional[str] = Body(None),
    db: Session = Depends(get_db)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        return {"error": "Incident non trouvé"}

    incident.status = status   # OUVERT | NOTIFIE | RESOLU

    if action_taken:
        incident.action_taken = action_taken

    if status == "RESOLU":
        from datetime import datetime
        incident.resolved_at = datetime.utcnow()
        # Marquer les notifications liées comme traitées
        from app.models.notification import Notification
        db.query(Notification).filter(
            Notification.incident_id == incident_id
        ).update({"status": "TRAITEE", "is_read": "true"})

    db.commit()
    return {"message": "Incident mis à jour", "id": incident_id, "status": status}