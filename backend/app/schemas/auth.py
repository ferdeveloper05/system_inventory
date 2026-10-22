from typing import Optional
from pydantic import BaseModel, EmailStr
from app.schemas.base import BaseSchema


class Token(BaseSchema):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseSchema):
    sub: Optional[str] = None
    exp: Optional[int] = None
    role: Optional[str] = None
    user_id: Optional[int] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    nombre: str
    apellido: str
    telefono: Optional[str] = None
    cargo: Optional[str] = "Especialista de Infraestructura"


class CurrentUserResponse(BaseSchema):
    id: int
    username: str
    email: EmailStr
    activo: bool
    is_superuser: bool
    id_rol: int
    rol_nombre: Optional[str] = None
    id_empleado: Optional[int] = None
    nombre_completo: Optional[str] = None

