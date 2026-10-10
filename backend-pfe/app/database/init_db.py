from app.database.connection import engine, Base, SessionLocal
from app.models import sensor, incident, threshold
from app.models.threshold import Threshold
from app.models.user import User
from app.services.security import hash_password
from app.database.connection import engine, Base
from app.models import incident, sensor, user, notification  # ← ajouter notification
from app.models.intervention_report import InterventionReport
INITIAL_THRESHOLDS = [
    ("TI-027",  "Temp Bouille",      "PN",           100.0, 112.0, "C"),
    ("FIC-001", "ACP 29% vers PN",   "PN",            48.0,  63.0, "m3/h"),
    ("FIC-002", "Liq Lavage AD01",   "PN",            47.0,  58.0, "m3/h"),
    ("FIC-003", "ACP 54% vers PN",   "PN",            46.0,  60.0, "m3/h"),
    ("FIC-004", "H2SO4 vers PN",     "PN",            48.0,  58.0, "m3/h"),
    ("RM-PN",   "Rapport Molaire",   "PN",             1.42,  1.58, "-"),
    ("TI-504",  "Temp AD01",         "Lavage",        55.0,  78.0, "C"),
    ("LIC-503", "Niveau AD01",       "Lavage",        35.0,  78.0, "%"),
    ("PDI-496", "Depression AD01",   "Lavage",        16.0,  24.0, "mm"),
    ("LIC-543", "Niveau AR02",       "Lavage",        35.0,  78.0, "%"),
    ("TI-138",  "Temp Gaz Sortie",   "Sechage",       88.0, 120.0, "C"),
    ("TI-216",  "Temp Produit",      "Sechage",       26.0,  34.0, "C"),
    ("HUM-TQ",  "Humidite",          "Sechage",        0.3,   2.9, "%"),
    ("FIC-384", "Enrobage AM04",     "Enrobage",      26.0,  34.0, "Kg/h"),
    ("PF-N",    "N (Azote)",         "PRODUIT FINI",  11.0,  12.2, "%"),
    ("PF-P2O5", "P2O5",              "PRODUIT FINI",  43.5,  46.5, "%"),
    ("PF-K2O",  "K2O",               "PRODUIT FINI",  14.0,  16.0, "%"),
    ("PF-TG24", "T.G [2-4]",         "PRODUIT FINI",  85.0,  95.0, "%"),
]

def create_tables():
    Base.metadata.create_all(bind=engine)
    _seed_thresholds()
    _seed_users()

def _seed_thresholds():
    db = SessionLocal()
    try:
        db.query(Threshold).delete()
        db.commit()
        for sid, name, ligne, vmin, vmax, unit in INITIAL_THRESHOLDS:
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
        print(f"OK {len(INITIAL_THRESHOLDS)} seuils initialises")
    except Exception as e:
        db.rollback()
        print(f"Erreur init seuils: {e}")
    finally:
        db.close()

def _seed_users():
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            users = [
                User(username="admin",     password=hash_password("admin123"), role="admin"),
                User(username="operateur", password=hash_password("1234"),     role="operateur"),
            ]
            db.add_all(users)
            db.commit()
            print("OK Utilisateurs crees : admin/admin123 et operateur/1234")
        else:
            print("OK Utilisateurs deja existants")
    except Exception as e:
        db.rollback()
        print(f"Erreur init users: {e}")
    finally:
        db.close()