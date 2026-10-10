from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

    full_name = Column(String(100), nullable=True)
    prenom = Column(String(100), nullable=True)
    telephone = Column(String(30), nullable=True)
    departement = Column(String(100), nullable=True)
    site = Column(String(100), nullable=True)

    prenom = Column(String(100), nullable=True)
    telephone = Column(String(30), nullable=True)
    departement = Column(String(100), nullable=True)
    site = Column(String(100), nullable=True)

    role = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=True)

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    reset_token = Column(String, nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)