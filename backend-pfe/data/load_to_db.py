# backend-pfe/app/database/init_db.py
from app.database.connection import engine, Base, SessionLocal
from app.models import sensor, incident, threshold
from app.models.threshold import Threshold

INITIAL_THRESHOLDS = [
    ("LIC-503", "Niveau AD01",      "Lavage",       30.0,  80.0,  "%"),
    ("TI-027",  "Temp Bouille",     "PN",            95.0, 115.0,  "C"),
    ("TI-138",  "Temp Gaz Sortie",  "Sechage",       85.0, 130.0,  "C"),
    ("FIC-001", "ACP 29% vers PN",  "PN",            50.0,  65.0,  "m3/h"),
    ("PF-N",    "N (Azote)",        "PRODUIT FINI",  10.5,  12.5,  "%"),
    ("PF-P2O5", "P2O5",             "PRODUIT FINI",  43.0,  47.0,  "%"),
    ("PF-K2O",  "K2O",              "PRODUIT FINI",  13.5,  16.5,  "%"),
    ("PF-TG24", "T.G [2-4]",        "PRODUIT FINI",  84.0,  96.0,  "%"),
    ("TI-504",  "Temp AD01",        "Lavage",         50.0,  80.0,  "C"),
    ("PDI-496", "Depression AD01",  "Lavage",         15.0,  25.0,  "mm"),
    ("TI-216",  "Temp Produit",     "Sechage",        25.0,  35.0,  "C"),
    ("RM-PN",   "Rapport Molaire",  "PN",              1.4,   1.6,  "-"),
]

def create_tables():
    Base.metadata.create_all(bind=engine)
    _seed_thresholds()

def _seed_thresholds():
    db = SessionLocal()
    try:
        for sid, name, ligne, vmin, vmax, unit in INITIAL_THRESHOLDS:
            exists = db.query(Threshold).filter(
                Threshold.sensor_id == sid
            ).first()
            if not exists:
                db.add(Threshold(
                    sensor_id=sid,
                    sensor_name=name,
                    ligne=ligne,
                    min_value=vmin,
                    max_value=vmax,
                    unit=unit,
                    is_active=True
                ))
        db.commit()
        print(f"Seuils initialisés : {len(INITIAL_THRESHOLDS)} capteurs")
    except Exception as e:
        db.rollback()
        print(f"Erreur init seuils: {e}")
    finally:
        db.close()