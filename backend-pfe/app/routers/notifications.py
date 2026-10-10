from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database.connection import get_db
from app.models.notification import Notification
from app.models.incident import Incident

router = APIRouter()

@router.post("/")
def create_notification(
    incident_id:   int = Body(...),
    message:       str = Body(...),
    urgence:       str = Body("NORMALE"),
    sender_role:   str = Body("operateur"),
    receiver_role: str = Body("technicien"),
    db: Session = Depends(get_db)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident non trouvé")
    incident.status = "NOTIFIE"
    db.commit()
    notif = Notification(
        incident_id=incident_id, message=message, urgence=urgence,
        sender_role=sender_role, receiver_role=receiver_role,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif

@router.get("/")
def list_notifications(
    receiver_role: Optional[str] = None,
    status:        Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Notification)
    if receiver_role:
        q = q.filter(Notification.receiver_role == receiver_role)
    if status:
        q = q.filter(Notification.status == status)
    return q.order_by(Notification.created_at.desc()).limit(100).all()

@router.patch("/{notif_id}/read")
def mark_read(notif_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification non trouvée")
    notif.is_read = "true"
    db.commit()
    return {"message": "Notification lue", "id": notif_id}

@router.patch("/{notif_id}/traiter")
def mark_traited(notif_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification non trouvée")
    notif.status = "TRAITEE"
    notif.is_read = "true"
    db.commit()
    return {"message": "Notification traitée", "id": notif_id}

@router.get("/unread-count")
def unread_count(receiver_role: str = "technicien", db: Session = Depends(get_db)):
    count = db.query(Notification).filter(
        Notification.receiver_role == receiver_role,
        Notification.is_read == "false"
    ).count()
    return {"count": count}