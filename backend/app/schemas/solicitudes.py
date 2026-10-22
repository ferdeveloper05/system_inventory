from datetime import datetime
from typing import List, Optional
from app.schemas.base import BaseSchema
from app.schemas.productos import ProductoResponse
from app.schemas.almacenes import AlmacenResponse
from app.schemas.usuarios import EmpleadoResponse


class DetalleSolicitudBase(BaseSchema):
    id_producto: int
    cantidad_solicitada: int
    cantidad_despachada: int = 0
    estado_item: str = "PENDIENTE"


class DetalleSolicitudCreate(BaseSchema):
    id_producto: int
    cantidad_solicitada: int


class DetalleSolicitudResponse(DetalleSolicitudBase):
    id: int
    id_solicitud: int
    producto: Optional[ProductoResponse] = None


class SolicitudBase(BaseSchema):
    numero_solicitud: str
    id_empleado_solicita: int
    id_almacen_origen: int
    estado: str = "PENDIENTE"
    motivo_justificacion: Optional[str] = None


class SolicitudCreate(BaseSchema):
    numero_solicitud: str
    id_empleado_solicita: int
    id_almacen_origen: int
    motivo_justificacion: Optional[str] = None
    detalles: List[DetalleSolicitudCreate]


class SolicitudUpdateEstado(BaseSchema):
    estado: str  # APROBADA, DESPACHADA, RECHAZADA, CANCELADA


class SolicitudResponse(SolicitudBase):
    id: int
    fecha_solicitud: datetime
    created_at: datetime
    updated_at: datetime
    almacen_origen: Optional[AlmacenResponse] = None
    empleado_solicita: Optional[EmpleadoResponse] = None
    detalles: List[DetalleSolicitudResponse] = []

