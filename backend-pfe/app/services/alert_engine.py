"""
alert_engine.py
---------------
Compare les dernieres valeurs capteurs avec les seuils configures.
Cree automatiquement des incidents si un seuil est franchi.
"""

from sqlalchemy.orm import Session

from app.models.sensor import SensorReading
from app.models.threshold import Threshold
from app.models.incident import Incident

from app.services.sensor_service import get_live_readings


def get_active_alerts(db: Session):
    """
    Compare live readings vs thresholds.
    retourne les alertes actives et Cree des incidents si necessaire.
    """

    live = get_live_readings(db)

    thresholds = {

        t.sensor_id: t

        for t in db.query(Threshold)

        .filter(Threshold.is_active == True)

        .all()
    }

    alerts = []

    # =========================
    # ANALYSE DES CAPTEURS
    # =========================

    for reading in live:

        sid = reading["sensor_id"]

        if sid not in thresholds:
            continue

        thr = thresholds[sid]

        breached = False

        severity = "AVERTISSEMENT"

        description = ""

        # =========================
        # DEPASSEMENT MAX
        # =========================

        if (

            thr.max_value is not None

            and reading["value"] > thr.max_value
        ):

            breached = True

            severity = (

                "CRITIQUE"

                if reading["value"] > thr.max_value * 1.1

                else "AVERTISSEMENT"
            )

            description = (

                f"Valeur {reading['value']} "

                f"{reading['unit']} depasse "

                f"le seuil max "

                f"{thr.max_value} {thr.unit}"
            )

        # =========================
        # DEPASSEMENT MIN
        # =========================

        elif (

            thr.min_value is not None

            and reading["value"] < thr.min_value
        ):

            breached = True

            severity = (

                "CRITIQUE"

                if reading["value"] < thr.min_value * 0.9

                else "AVERTISSEMENT"
            )

            description = (

                f"Valeur {reading['value']} "

                f"{reading['unit']} en dessous "

                f"du seuil min "

                f"{thr.min_value} {thr.unit}"
            )

        # =========================
        # CREATION ALERTES
        # =========================

        if breached:

            alerts.append({

                "sensor_id":
                    sid,

                "sensor_name":
                    reading["sensor_name"],

                "ligne":
                    reading["ligne"],

                "value":
                    reading["value"],

                "unit":
                    reading["unit"],

                "severity":
                    severity,

                "description":
                    description,

                "timestamp":
                    reading["timestamp"]
            })

            # =========================
            # VERIFIER INCIDENT EXISTANT
            # =========================

            existing = db.query(Incident).filter(

                Incident.sensor_id == sid,

                Incident.status == "OUVERT",

                Incident.description == description

            ).first()

            # =========================
            # CREATION INCIDENT
            # =========================

            if not existing:

                incident = Incident(

                    ligne=reading["ligne"],

                    sensor_id=sid,

                    sensor_name=reading["sensor_name"],

                    value=str(reading["value"]),

                    threshold_value=str(

                        thr.max_value
                        or
                        thr.min_value
                    ),

                    severity=severity,

                    description=description
                )

                db.add(incident)

                db.commit()

    return alerts