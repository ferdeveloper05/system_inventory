from datetime import datetime
from typing import Optional
from app.schemas.base import BaseSchema
from app.schemas.almacenes import AlmacenResponse
from app.schemas.productos import ProductoResponse


class InventarioBase(BaseSchema):
    id_almacen: int
    id_producto: int
    stock_actual: int = 0
    stock_reservado: int = 0
    ubicacion_pasillo: Optional[str] = None


class InventarioCreate(InventarioBase):
    pass


class InventarioUpdate(BaseSchema):
    stock_actual: Optional[int] = None
    stock_reservado: Optional[int] = None
    ubicacion_pasillo: Optional[str] = None


class InventarioResponse(InventarioBase):
    id: int
    updated_at: datetime
    almacen: Optional[AlmacenResponse] = None
    producto: Optional[ProductoResponse] = None

