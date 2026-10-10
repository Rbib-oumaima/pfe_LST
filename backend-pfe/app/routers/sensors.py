from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.services.sensor_service import get_live_readings, get_historical_readings

router = APIRouter()

@router.get("/live")
def live_sensors(ligne: Optional[str] = None, db: Session = Depends(get_db)):
    """Retourne les derniÃ¨res mesures de chaque capteur (ou par ligne)."""
    return get_live_readings(db, ligne)

@router.get("/history")
def sensor_history(
    sensor_id: str,
    limit: int = Query(default=100, le=1000),
    db: Session = Depends(get_db)
):
    """Retourne l'historique d'un capteur spÃ©cifique."""
    return get_historical_readings(db, sensor_id, limit)

@router.get("/lines")
def get_lines():
    """Retourne la liste des lignes disponibles."""
    return ["PN", "Granulateur", "Lavage", "SÃ©chage", "Enrobage", "PRODUIT FINI"]
