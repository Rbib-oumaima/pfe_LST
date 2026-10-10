from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.threshold import Threshold
from app.dependencies.auth import get_current_user

router = APIRouter()

@router.get("/")
def list_thresholds(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Threshold).all()

@router.post("/")
def create_threshold(
    sensor_id: str = Body(...), sensor_name: str = Body(...),
    ligne: str = Body(...), min_value: float = Body(None),
    max_value: float = Body(None), unit: str = Body(...),
    db: Session = Depends(get_db), current_user = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Acces refuse")
    existing = db.query(Threshold).filter(Threshold.sensor_id == sensor_id).first()
    if existing:
        existing.min_value = min_value
        existing.max_value = max_value
        db.commit()
        return {"message": "Seuil mis a jour", "id": existing.id}
    threshold = Threshold(sensor_id=sensor_id, sensor_name=sensor_name, ligne=ligne, min_value=min_value, max_value=max_value, unit=unit)
    db.add(threshold)
    db.commit()
    db.refresh(threshold)
    return threshold

@router.put("/{threshold_id}")
def update_threshold(
    threshold_id: int,
    sensor_name: str = Body(...), ligne: str = Body(...),
    min_value: float = Body(None), max_value: float = Body(None),
    unit: str = Body(...),
    db: Session = Depends(get_db), current_user = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Acces refuse")
    threshold = db.query(Threshold).filter(Threshold.id == threshold_id).first()
    if not threshold:
        raise HTTPException(status_code=404, detail="Seuil introuvable")
    threshold.sensor_name = sensor_name
    threshold.ligne = ligne
    threshold.min_value = min_value
    threshold.max_value = max_value
    threshold.unit = unit
    db.commit()
    db.refresh(threshold)
    return threshold

@router.delete("/{threshold_id}")
def delete_threshold(threshold_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Acces refuse")
    threshold = db.query(Threshold).filter(Threshold.id == threshold_id).first()
    if not threshold:
        raise HTTPException(status_code=404, detail="Seuil introuvable")
    db.delete(threshold)
    db.commit()
    return {"message": "Seuil supprime", "id": threshold_id}