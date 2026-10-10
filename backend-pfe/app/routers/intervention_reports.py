from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.intervention_report import InterventionReport
from app.models.user import User
from app.services.security import get_current_user

router = APIRouter(
    prefix="/reports",
    tags=["Rapports d'intervention"]
)


@router.get("/")
def get_reports(db: Session = Depends(get_db)):
    rapports = db.query(InterventionReport).all()

    return [
        {
            "id": r.id,
            "incident_id": r.incident_id,
            "technicien_id": r.technicien_id,
            "ligne": r.ligne,
            "capteur": r.capteur,
            "date_intervention": r.date_intervention,
            "type_intervention": r.type_intervention,
            "cause": r.cause,
            "heure_debut": r.heure_debut,
            "heure_fin": r.heure_fin,
            "description": r.description,
            "action_effectuee": r.action_effectuee,
            "pieces": r.pieces,
            "recommandations": r.recommandations,
            "duree": r.duree,
            "risque": r.risque,
            "statut": r.statut,
            "created_at": r.created_at,
        }
        for r in rapports
    ]


@router.post("/")
def create_report(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    rapport = InterventionReport(
        incident_id=data["incident_id"],
        technicien_id=current_user.id,

        ligne=data.get("ligne"),
        capteur=data.get("capteur"),

        date_intervention=data.get("date_intervention"),
        type_intervention=data.get("type_intervention"),

        cause=data.get("cause"),
        heure_debut=data.get("heure_debut"),
        heure_fin=data.get("heure_fin"),

        description=data.get("description"),
        action_effectuee=data.get("action_effectuee"),

        pieces=data.get("pieces"),
        recommandations=data.get("recommandations"),

        duree=data.get("duree"),
        risque=data.get("risque"),
        statut=data.get("statut", "Soumis"),
    )

    db.add(rapport)
    db.commit()
    db.refresh(rapport)

    return {
        "message": "Rapport créé avec succès",
        "id": rapport.id
    }
@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rapport = db.query(InterventionReport).filter(
        InterventionReport.id == report_id
    ).first()

    if not rapport:
        return {
            "message": "Rapport introuvable"
        }

    db.delete(rapport)
    db.commit()

    return {
        "message": "Rapport supprimé avec succès"
    }