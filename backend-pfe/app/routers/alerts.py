from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.alert_engine import get_active_alerts
from fastapi import Depends
from app.dependencies.auth import get_current_user
router = APIRouter()

@router.get("/active")
def active_alerts(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)):
    """Retourne toutes les alertes actives (seuils dÃ©passÃ©s)."""
    return get_active_alerts(db)
