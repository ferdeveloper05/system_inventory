from datetime import datetime
from typing import Optional
from app.schemas.base import BaseSchema
from app.schemas.productos import ProductoResponse
from app.schemas.almacenes import AlmacenResponse


class MovimientoBase(BaseSchema):
    tipo_movimiento: str  # ENTRADA, SALIDA, TRANSFERENCIA, AJUSTE
    id_producto: int
    cantidad: int
    id_almacen_origen: Optional[int] = None
    id_almacen_destino: Optional[int] = None
    id_recepcion: Optional[int] = None
    id_solicitud: Optional[int] = None
    motivo: Optional[str] = None


class MovimientoCreate(MovimientoBase):
    pass


class MovimientoResponse(MovimientoBase):
    id: int
    id_usuario: int
    fecha_movimiento: datetime
    created_at: datetime
    producto: Optional[ProductoResponse] = None
    almacen_origen: Optional[AlmacenResponse] = None
    almacen_destino: Optional[AlmacenResponse] = None

