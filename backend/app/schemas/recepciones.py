from datetime import datetime
from typing import List, Optional
from app.schemas.base import BaseSchema


# Schemas simples para relaciones anidadas en Recepciones
class AlmacenRecepcionResponse(BaseSchema):
    id: int
    codigo: str
    nombre: str
    tipo: Optional[str] = "GENERAL"
    ubicacion: Optional[str] = ""
    capacidad: Optional[int] = None


class DepartamentoRecepcionResponse(BaseSchema):
    id: int
    nombre: str


class EmpleadoRecepcionResponse(BaseSchema):
    id: int
    nombre: str
    apellido: str
    email: Optional[str] = None
    cargo: Optional[str] = None
    id_departamento: Optional[int] = None
    departamento: Optional[DepartamentoRecepcionResponse] = None


class CategoriaRecepcionResponse(BaseSchema):
    id: int
    nombre: str
    codigo: str


class ProductoRecepcionResponse(BaseSchema):
    id: int
    codigo: str
    nombre: str
    descripcion: Optional[str] = None
    unidad_medida: Optional[str] = "UNIDAD"
    id_categoria: Optional[int] = None
    categoria: Optional[CategoriaRecepcionResponse] = None


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
    producto: Optional[ProductoRecepcionResponse] = None


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


class RecepcionUpdate(BaseSchema):
    numero_recepcion: Optional[str] = None
    id_orden_compra: Optional[int] = None
    id_almacen: Optional[int] = None
    id_empleado_recibe: Optional[int] = None
    estado: Optional[str] = None
    observaciones: Optional[str] = None
    detalles: Optional[List[DetalleRecepcionCreate]] = None


class RecepcionResponse(RecepcionBase):
    id: int
    fecha_recepcion: datetime
    created_at: Optional[datetime] = None
    almacen: Optional[AlmacenRecepcionResponse] = None
    empleado_recibe: Optional[EmpleadoRecepcionResponse] = None
    detalles: List[DetalleRecepcionResponse] = []


class RecepcionAnular(BaseSchema):
    motivo: Optional[str] = None


class RecepcionStats(BaseSchema):
    total_recepciones: int
    total_items_recibidos: int
    total_completadas: int
    total_anuladas: int
    recepciones_hoy: int
