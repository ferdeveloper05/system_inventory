from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.acceso import Usuarios
from app.core.security import verify_password, get_password_hash, create_access_token


class AuthService:
    @staticmethod
    def authenticate(db: Session, username: str, password: str) -> Optional[Usuarios]:
        """Valida credenciales de usuario."""
        user = db.query(Usuarios).filter(Usuarios.username == username).first()
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    def generate_token_for_user(user: Usuarios) -> str:
        """Crea JWT con datos del rol y sub."""
        claims = {
            "role": user.rol.nombre if user.rol else "USER",
            "user_id": user.id,
            "email": user.email,
        }
        return create_access_token(subject=user.username, extra_claims=claims)


auth_service = AuthService()

