from datetime import datetime
from typing import Optional
from app.schemas.base import BaseSchema


class AlmacenBase(BaseSchema):
    codigo: str
    nombre: str
    tipo: str = "GENERAL"
    ubicacion: str
    capacidad: Optional[int] = None
    descripcion: Optional[str] = None
    activo: bool = True


class AlmacenCreate(AlmacenBase):
    pass


class AlmacenUpdate(BaseSchema):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    tipo: Optional[str] = None
    ubicacion: Optional[str] = None
    capacidad: Optional[int] = None
    descripcion: Optional[str] = None
    activo: Optional[bool] = None


class AlmacenResponse(AlmacenBase):
    id: int
    created_at: datetime
    total_productos: Optional[int] = 0
    stock_total: Optional[int] = 0
    porcentaje_ocupacion: Optional[float] = None
