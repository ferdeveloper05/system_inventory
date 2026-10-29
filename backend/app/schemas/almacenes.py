from datetime import datetime
from typing import Optional, List
from app.schemas.base import BaseSchema


class CategoriaSimple(BaseSchema):
    id: int
    nombre: str
    codigo: str


class AlmacenBase(BaseSchema):
    codigo: str
    nombre: str
    tipo: str = "GENERAL"  # ALIMENTOS, LIMPIEZA, TECNOLOGIA, PAPELERIA, MANTENIMIENTO, GENERAL
    ubicacion: str
    capacidad: Optional[int] = None
    descripcion: Optional[str] = None
    activo: bool = True


class AlmacenCreate(AlmacenBase):
    ids_categorias: Optional[List[int]] = None


class AlmacenUpdate(BaseSchema):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    tipo: Optional[str] = None
    ubicacion: Optional[str] = None
    capacidad: Optional[int] = None
    descripcion: Optional[str] = None
    activo: Optional[bool] = None
    ids_categorias: Optional[List[int]] = None


class AlmacenResponse(AlmacenBase):
    id: int
    created_at: datetime
    total_productos: Optional[int] = 0
    stock_total: Optional[int] = 0
    porcentaje_ocupacion: Optional[float] = None
    categorias: Optional[List[CategoriaSimple]] = []
