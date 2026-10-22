from datetime import datetime
from typing import Optional
from app.schemas.base import BaseSchema


class AlmacenBase(BaseSchema):
    codigo: str
    nombre: str
    ubicacion: str
    capacidad: Optional[int] = None
    activo: bool = True


class AlmacenCreate(AlmacenBase):
    pass


class AlmacenUpdate(BaseSchema):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    ubicacion: Optional[str] = None
    capacidad: Optional[int] = None
    activo: Optional[bool] = None


class AlmacenResponse(AlmacenBase):
    id: int
    created_at: datetime

