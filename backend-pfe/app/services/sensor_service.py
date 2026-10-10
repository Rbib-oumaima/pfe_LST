import csv
import os
import time
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from app.models.sensor import SensorReading
from app.database.connection import SessionLocal

CSV_PATH = "/app/data/capteurs.csv"

# ================================
# CACHE EN MEMOIRE (instantane)
# ================================
_live_cache = {}   # { sensor_id: { ...reading } }
_hist_cache = {}   # { sensor_id: [ ...readings ] }
_cache_time = 0
CACHE_TTL   = 10   # secondes

def update_live_cache(readings: list):
    global _live_cache, _cache_time
    new_cache = {}
    for r in readings:
        sid = r["sensor_id"]
        if sid not in new_cache or r["timestamp"] > new_cache[sid]["timestamp"]:
            new_cache[sid] = r
    _live_cache = new_cache
    _cache_time = time.time()

def get_live_readings(db: Session, ligne: str = None):
    global _live_cache, _cache_time

    # Retourne le cache si encore valide
    if _live_cache and time.time() - _cache_time < CACHE_TTL:
        data = list(_live_cache.values())
        if ligne:
            return [r for r in data if r["ligne"] == ligne]
        return data

    # Sinon requete SQL optimisee : prend seulement les 500 dernieres lignes
    try:
        results = (
            db.query(SensorReading)
            .order_by(SensorReading.timestamp.desc())
            .limit(500)
            .all()
        )
        readings = [
            {
                "id":          r.id,
                "timestamp":   r.timestamp.isoformat(),
                "ligne":       r.ligne,
                "sensor_id":   r.sensor_id,
                "sensor_name": r.sensor_name,
                "value":       r.value,
                "unit":        r.unit
            }
            for r in results
        ]
        update_live_cache(readings)
        data = list(_live_cache.values())
        if ligne:
            return [r for r in data if r["ligne"] == ligne]
        return data
    except Exception as e:
        print(f"Erreur get_live_readings: {e}")
        return list(_live_cache.values())


def get_historical_readings(db: Session, sensor_id: str, limit: int = 100):
    # Cache historique par sensor
    cache_key = f"{sensor_id}_{limit}"
    if cache_key in _hist_cache:
        cached = _hist_cache[cache_key]
        if time.time() - cached["time"] < 30:
            return cached["data"]

    try:
        results = (
            db.query(SensorReading)
            .filter(SensorReading.sensor_id == sensor_id)
            .order_by(SensorReading.timestamp.desc())
            .limit(limit)
            .all()
        )
        data = [
            {
                "timestamp": r.timestamp.isoformat(),
                "value":     r.value,
                "unit":      r.unit
            }
            for r in results
        ]
        _hist_cache[cache_key] = {"data": data, "time": time.time()}
        return data
    except Exception as e:
        print(f"Erreur get_historical_readings: {e}")
        return []


def load_csv_to_db():
    db = SessionLocal()
    try:
        if not os.path.exists(CSV_PATH):
            print(f"CSV introuvable: {CSV_PATH}")
            return

        # Verifie si deja charge
        count = db.query(func.count(SensorReading.id)).scalar()
        if count > 1000:
            print(f"CSV deja charge ({count} lignes) - skip")
            return

        with open(CSV_PATH, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            batch = []
            for i, row in enumerate(reader):
                try:
                    ts = datetime.strptime(row["timestamp"], "%Y-%m-%d %H:%M")
                except ValueError:
                    try:
                        ts = datetime.strptime(row["timestamp"], "%Y-%m-%dT%H:%M")
                    except ValueError:
                        continue
                batch.append(SensorReading(
                    timestamp=ts,
                    ligne=row["ligne"],
                    sensor_id=row["sensor_id"],
                    sensor_name=row["sensor_name"],
                    value=float(row["value"]),
                    unit=row["unit"]
                ))
                if len(batch) >= 2000:
                    db.bulk_save_objects(batch)
                    db.commit()
                    batch = []
            if batch:
                db.bulk_save_objects(batch)
                db.commit()
        print("CSV charge avec succes")
    except Exception as e:
        print(f"Erreur chargement CSV: {e}")
        db.rollback()
    finally:
        db.close()