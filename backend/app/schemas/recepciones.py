from datetime import datetime
from typing import List, Optional
from app.schemas.base import BaseSchema
from app.schemas.productos import ProductoResponse
from app.schemas.almacenes import AlmacenResponse
from app.schemas.usuarios import EmpleadoResponse


# Detalle Recepción
class DetalleRecepcionBase(BaseSchema):
    id_producto: int
    cantidad_recibida: int
    estado_producto: str = "CONFORME"
    observaciones: Optional[str] = None


class DetalleRecepcionCreate(DetalleRecepcionBase):
    pass


class DetalleRecepcionResponse(DetalleRecepcionBase):
    id: int
    id_recepcion: int
    producto: Optional[ProductoResponse] = None


# Recepción
class RecepcionBase(BaseSchema):
    numero_recepcion: str
    id_orden_compra: Optional[int] = None
    id_almacen: int
    id_empleado_recibe: int
    estado: str = "COMPLETADA"
    observaciones: Optional[str] = None


class RecepcionCreate(RecepcionBase):
    detalles: List[DetalleRecepcionCreate]


class RecepcionResponse(RecepcionBase):
    id: int
    fecha_recepcion: datetime
    created_at: datetime
    almacen: Optional[AlmacenResponse] = None
    empleado_recibe: Optional[EmpleadoResponse] = None
    detalles: List[DetalleRecepcionResponse] = []

