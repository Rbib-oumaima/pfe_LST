"""
Simulateur temps rÃ©el â€” lit le CSV et insÃ¨re de nouvelles valeurs toutes les 10s
en comparant avec les seuils pour gÃ©nÃ©rer des incidents.
"""
import time
import random
import os
import sys

# Ajouter le rÃ©pertoire parent au path
sys.path.insert(0, '/app')

from app.database.connection import SessionLocal
from app.models.sensor import SensorReading
from app.models.incident import Incident
from app.models.threshold import Threshold
from datetime import datetime, timezone

# Plages de simulation par capteur
CAPTEURS = [
    # (sensor_id, sensor_name, ligne, valeur_normale, ecart_max, unit)
    ("TI-027",  "Temp Bouille",         "PN",           108.0, 15.0, "C"),
    ("FIC-001", "ACP 29% contre PN",    "PN",            55.0,  12.0, "m3/h"),
    ("FIC-002", "Liquide Lavage AD01",  "PN",            52.0,  13.0, "m3/h"),
    ("FIC-003", "ACP 54% contre PN",    "PN",            52.0,  12.0, "m3/h"),
    ("FIC-004", "H2SO4 vers PN",        "PN",            52.0,  12.0, "m3/h"),
    ("TI-504",  "Temp AD01",            "Lavage",        65.0,  15.0, "C"),
    ("LIC-503", "Niveau AD01",          "Lavage",        50.0,  30.0, "%"),
    ("PDI-496", "Depression AD01",      "Lavage",        20.0,   6.0, "mm"),
    ("LIC-543", "Niveau AR02",          "Lavage",        50.0,  30.0, "%"),
    ("TI-138",  "Temp Gaz Sortie",      "Sechage",       95.0,  30.0, "C"),
    ("TI-216",  "Temp Produit",         "Sechage",       30.0,   7.0, "C"),
    ("HUM-TQ",  "Humidite",             "Sechage",        1.5,   1.8, "%"),
    ("FIC-384", "Enrobage vers AM04",   "Enrobage",      30.0,   8.0, "Kg/h"),
    ("PF-N",    "N (Azote)",            "PRODUIT FINI",  11.5,   1.5, "%"),
    ("PF-P2O5", "P2O5",                 "PRODUIT FINI",  45.0,   3.0, "%"),
    ("PF-K2O",  "K2O",                  "PRODUIT FINI",  15.0,   2.5, "%"),
    ("PF-TG24", "T.G [2-4]",            "PRODUIT FINI",  90.0,   8.0, "%"),
]

def generer_valeur(valeur_normale, ecart_max):
    """GÃ©nÃ¨re une valeur simulÃ©e avec distribution gaussienne."""
    return round(random.gauss(valeur_normale, ecart_max / 3), 2)

def verifier_seuils(db, sensor_id, sensor_name, ligne, valeur, unit):
    """VÃ©rifie si la valeur dÃ©passe un seuil et crÃ©e un incident si besoin."""
    seuil = db.query(Threshold).filter(
        Threshold.sensor_id == sensor_id,
        Threshold.is_active == True
    ).first()

    if not seuil:
        return

    severity = None
    description = None

    if seuil.min_value is not None and valeur < seuil.min_value:
        ecart = abs(valeur - seuil.min_value)
        pct = (ecart / seuil.min_value) * 100
        severity = "CRITIQUE" if pct > 10 else "AVERTISSEMENT"
        description = f"Valeur {valeur} {unit} en dessous du seuil min {seuil.min_value} {unit}"

    elif seuil.max_value is not None and valeur > seuil.max_value:
        ecart = abs(valeur - seuil.max_value)
        pct = (ecart / seuil.max_value) * 100
        severity = "CRITIQUE" if pct > 10 else "AVERTISSEMENT"
        description = f"Valeur {valeur} {unit} dÃ©passe le seuil max {seuil.max_value} {unit}"

    if severity:
        incident = Incident(
            sensor_id=sensor_id,
            sensor_name=sensor_name,
            ligne=ligne,
            value=str(valeur),
            severity=severity,
            description=description,
            threshold_value=str(seuil.max_value or seuil.min_value),
            status="OUVERT",
            created_at=datetime.now(timezone.utc)
        )
        db.add(incident)

def simuler_cycle():
    """Un cycle de simulation â€” insÃ¨re de nouvelles lectures pour tous les capteurs."""
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        for sensor_id, sensor_name, ligne, valeur_normale, ecart_max, unit in CAPTEURS:
            valeur = generer_valeur(valeur_normale, ecart_max)

            # InsÃ©rer la lecture
            reading = SensorReading(
                sensor_id=sensor_id,
                sensor_name=sensor_name,
                ligne=ligne,
                value=valeur,
                unit=unit,
                timestamp=now
            )
            db.add(reading)

            # VÃ©rifier les seuils
            verifier_seuils(db, sensor_id, sensor_name, ligne, valeur, unit)

        db.commit()
        print(f"âœ… Cycle simulÃ© : {len(CAPTEURS)} capteurs â€” {now.strftime('%H:%M:%S')}", flush=True)

    except Exception as e:
        db.rollback()
        print(f"âŒ Erreur simulation : {e}", flush=True)
    finally:
        db.close()

if __name__ == "__main__":
    print("ðŸš€ Simulateur dÃ©marrÃ© â€” cycle toutes les 10 secondes", flush=True)
    # Attendre que le backend soit prÃªt
    time.sleep(5)
    while True:
        simuler_cycle()
        time.sleep(10)