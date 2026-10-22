from datetime import datetime
from typing import Optional
from app.schemas.base import BaseSchema


# Categorías
class CategoriaBase(BaseSchema):
    nombre: str
    codigo: str
    descripcion: Optional[str] = None
    activo: bool = True


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(BaseSchema):
    nombre: Optional[str] = None
    codigo: Optional[str] = None
    descripcion: Optional[str] = None
    activo: Optional[bool] = None


class CategoriaResponse(CategoriaBase):
    id: int
    created_at: datetime


# Productos
class ProductoBase(BaseSchema):
    codigo: str
    nombre: str
    descripcion: Optional[str] = None
    unidad_medida: str = "UNIDAD"
    stock_minimo: int = 5
    stock_maximo: int = 1000
    id_categoria: int
    activo: bool = True


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(BaseSchema):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    unidad_medida: Optional[str] = None
    stock_minimo: Optional[int] = None
    stock_maximo: Optional[int] = None
    id_categoria: Optional[int] = None
    activo: Optional[bool] = None


class ProductoResponse(ProductoBase):
    id: int
    created_at: datetime
    updated_at: datetime
    categoria: Optional[CategoriaResponse] = None

