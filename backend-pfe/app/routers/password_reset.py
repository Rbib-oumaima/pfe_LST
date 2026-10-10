import secrets
import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.database.connection import get_db
from app.models.user import User
from app.services.security import hash_password
from app.schemas.auth import ForgotPasswordRequest, ResetPasswordRequest

router = APIRouter(prefix="/auth", tags=["Auth"])

def get_mail_config():
    return ConnectionConfig(
        MAIL_USERNAME   = os.getenv("SMTP_USER"),
        MAIL_PASSWORD   = os.getenv("SMTP_PASS"),
        MAIL_FROM       = os.getenv("SMTP_USER"),
        MAIL_PORT       = int(os.getenv("SMTP_PORT", 587)),
        MAIL_SERVER     = os.getenv("SMTP_HOST", "smtp.gmail.com"),
        MAIL_STARTTLS   = True,
        MAIL_SSL_TLS    = False,
        USE_CREDENTIALS = True,
    )

@router.post("/forgot-password")
async def forgot_password(
    data: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        return {"message": "Si cet email existe, un lien a ete envoye."}

    token = secrets.token_urlsafe(32)
    user.reset_token        = token
    user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
    db.commit()

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    reset_link   = f"{frontend_url}/reset-password?token={token}"

    message = MessageSchema(
        subject    = "Reinitialisation de votre mot de passe OCP",
        recipients = [data.email],
        body       = f"""
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8fafc;border-radius:12px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="background:#00A651;color:#fff;width:48px;height:48px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;margin:auto;">OCP</div>
          </div>
          <h2 style="color:#0d1b2e;text-align:center;">Reinitialisation du mot de passe</h2>
          <p style="color:#4a5568;">Bonjour <b>{user.username}</b>,</p>
          <p style="color:#4a5568;">Vous avez demande a reinitialiser votre mot de passe OCP Monitoring.</p>
          <p style="text-align:center;margin:32px 0;">
            <a href="{reset_link}" style="background:#00A651;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">
              Reinitialiser mon mot de passe
            </a>
          </p>
          <p style="color:#718096;font-size:13px;">Ce lien expire dans <b>1 heure</b>.</p>
          <p style="color:#718096;font-size:13px;">Si vous n avez pas fait cette demande, ignorez cet email.</p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/>
          <p style="color:#a0aec0;font-size:12px;text-align:center;">OCP Monitoring Â· Jorf Lasfar Â· 2026</p>
        </div>
        """,
        subtype = MessageType.html
    )

    fm = FastMail(get_mail_config())
    background_tasks.add_task(fm.send_message, message)
    return {"message": "Si cet email existe, un lien a ete envoye."}


@router.post("/reset-password")
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.reset_token == data.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Token invalide.")
    if user.reset_token_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token expire.")

    user.password           = hash_password(data.new_password)
    user.reset_token        = None
    user.reset_token_expiry = None
    db.commit()
    return {"message": "Mot de passe reinitialise avec succes."}