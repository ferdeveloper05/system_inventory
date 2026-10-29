from datetime import datetime
from typing import Optional, Dict, Any, List
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
    total_productos: Optional[int] = 0


# Productos
class AlmacenSimpleResponse(BaseSchema):
    id: int
    codigo: str
    nombre: str
    tipo: str
    ubicacion: str


class ProductoBase(BaseSchema):
    codigo: str
    nombre: str
    descripcion: Optional[str] = None
    unidad_medida: str = "UNIDAD"
    stock_minimo: int = 5
    stock_maximo: int = 1000
    id_categoria: int
    id_almacen_predeterminado: Optional[int] = None
    atributos: Optional[Dict[str, Any]] = None
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
    id_almacen_predeterminado: Optional[int] = None
    atributos: Optional[Dict[str, Any]] = None
    activo: Optional[bool] = None


class ProductoResponse(ProductoBase):
    id: int
    created_at: datetime
    updated_at: datetime
    categoria: Optional[CategoriaResponse] = None
    almacen_predeterminado: Optional[AlmacenSimpleResponse] = None
    total_stock: Optional[int] = 0
