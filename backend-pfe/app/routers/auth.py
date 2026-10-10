from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, ForgotPasswordRequest, ResetPasswordRequest
from app.services.security import verify_password, create_access_token, hash_password
import secrets, smtplib, os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable")
    if not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Mot de passe incorrect")
    token = create_access_token({"sub": user.username, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "role": user.role}


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        # Ne pas reveler si l email existe ou pas
        return {"message": "Si cet email existe, un lien a ete envoye."}

    # Generer token
    token = secrets.token_urlsafe(32)
    user.reset_token        = token
    user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
    db.commit()

    # Envoyer email
    try:
        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.getenv("SMTP_USER", "")
        smtp_pass = os.getenv("SMTP_PASS", "")
        frontend  = os.getenv("FRONTEND_URL", "http://localhost:3000")

        reset_link = f"{frontend}/reset-password?token={token}"

        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Reinitialisation de votre mot de passe OCP"
        msg["From"]    = smtp_user
        msg["To"]      = data.email

        html = f"""
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px">
          <img src="{frontend}/logo_ocp.png" height="50" style="margin-bottom:20px"/>
          <h2 style="color:#0d1b2e">Reinitialisation du mot de passe</h2>
          <p style="color:#64748b">Vous avez demande a reinitialiser votre mot de passe OCP Monitoring.</p>
          <a href="{reset_link}" style="display:inline-block;margin:20px 0;padding:14px 28px;background:#00A651;color:#fff;border-radius:8px;text-decoration:none;font-weight:700">
            Reinitialiser mon mot de passe
          </a>
          <p style="color:#94a3b8;font-size:12px">Ce lien expire dans 1 heure. Si vous n avez pas fait cette demande, ignorez cet email.</p>
        </div>
        """
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, data.email, msg.as_string())

    except Exception as e:
        print(f"Email error: {e}")

    return {"message": "Si cet email existe, un lien a ete envoye."}


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == data.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Token invalide")
    if user.reset_token_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token expire")
    user.password           = hash_password(data.new_password)
    user.reset_token        = None
    user.reset_token_expiry = None
    db.commit()
    return {"message": "Mot de passe reinitialise avec succes"}
@router.post("/change-password")
def change_password(
    data: dict,
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

    if not verify_password(
        data["old_password"],
        user.password
    ):
        raise HTTPException(
            status_code=400,
            detail="Ancien mot de passe incorrect"
        )
    if len(data["new_password"]) < 8:
       raise HTTPException(
        status_code=400,
        detail="Minimum 8 caractères"
    )
    if not any(c.isupper() for c in data["new_password"]):
       raise HTTPException(
        status_code=400,
        detail="Une majuscule est obligatoire"
    )
    if not any(c.isdigit() for c in data["new_password"]):
       raise HTTPException(
        status_code=400,
        detail="Un chiffre est obligatoire"
    )

    user.password = hash_password(
        data["new_password"]
    )

    db.commit()

    return {
        "message": "Mot de passe modifié avec succès"
    }