from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.services.security import hash_password
from app.dependencies.auth import get_current_user 
router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/")
def get_users(db: Session = Depends(get_db)):

    users = db.query(User).all()

    return [
        {
            "id": u.id,
            "username": u.username,
            "full_name": u.full_name, 
            "prenom": u.prenom,
            "telephone": u.telephone,
            "departement": u.departement,
            "site": u.site,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at,
        }
        for u in users
    ]
@router.get("/me")
def get_me(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.username == current_user["username"]
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Utilisateur introuvable"
        )

    return {
    "id": user.id,
    "username": user.username,
    "full_name": user.full_name,
    "prenom": user.prenom,
    "telephone": user.telephone,
    "departement": user.departement,
    "site": user.site,
    "email": user.email,
    "role": user.role,
    "is_active": user.is_active,
    "created_at": user.created_at,
}
@router.post("/")
def create_user(data: dict, db: Session = Depends(get_db)):

    existing = db.query(User).filter(
        User.username == data["username"]
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Nom d'utilisateur déjà utilisé"
        )

    user = User(
        username=data["username"],
        password=hash_password(data["password"]),
        full_name=data.get("full_name"),
        email=data.get("email"),
        role=data["role"],
        is_active=True
    )

    db.add(user)
    db.commit()

    return {"message": "Utilisateur ajouté"}
@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Utilisateur introuvable"
        )

    db.delete(user)
    db.commit()

    return {
        "message": "Utilisateur supprimé"
    }


@router.put("/{user_id}")
@router.put("/{user_id}")
def update_user(
    user_id: int,
    data: dict,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Utilisateur introuvable"
        )

    user.full_name = data.get(
        "full_name",
        user.full_name
    )

    user.username = data.get(
        "username",
        user.username
    )

    user.email = data.get(
        "email",
        user.email
    )

    user.role = data.get(
        "role",
        user.role
    )

    user.prenom = data.get(
        "prenom",
        user.prenom
    )

    user.telephone = data.get(
        "telephone",
        user.telephone
    )

    user.departement = data.get(
        "departement",
        user.departement
    )

    user.site = data.get(
        "site",
        user.site
    )

    if data.get("password"):
        user.password = hash_password(
            data["password"]
        )

    db.commit()

    return {
        "message": "Utilisateur modifié"
    }