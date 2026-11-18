from datetime import datetime
from typing import List, Optional
from app.schemas.base import BaseSchema


# -----------------------------------------------------------------------------
# Esquemas Livianos para Relaciones (evitan loops y optimizan serialización)
# -----------------------------------------------------------------------------

class CategoriaSimple(BaseSchema):
    id: int
    nombre: str
    codigo: str


class AlmacenSimple(BaseSchema):
    id: int
    codigo: str
    nombre: str
    tipo: str
    ubicacion: str


class DepartamentoSimple(BaseSchema):
    id: int
    nombre: str
    descripcion: Optional[str] = None


class EmpleadoSimple(BaseSchema):
    id: int
    nombre: str
    apellido: str
    email: str
    cargo: str
    id_departamento: int
    departamento: Optional[DepartamentoSimple] = None


class UsuarioSimple(BaseSchema):
    id: int
    username: str
    email: str
    empleado: Optional[EmpleadoSimple] = None


class ProductoSimple(BaseSchema):
    id: int
    codigo: str
    nombre: str
    unidad_medida: str
    id_categoria: int
    id_almacen_predeterminado: Optional[int] = None
    categoria: Optional[CategoriaSimple] = None
    almacen_predeterminado: Optional[AlmacenSimple] = None


# -----------------------------------------------------------------------------
# Esquemas de Detalle de Solicitud
# -----------------------------------------------------------------------------

class DetalleSolicitudCreate(BaseSchema):
    id_producto: int
    cantidad_solicitada: int
    id_almacen_despacho: Optional[int] = None
    observaciones_item: Optional[str] = None


class DetalleSolicitudDespachoItem(BaseSchema):
    id_producto: int
    cantidad_despachada: int
    id_almacen_despacho: int
    observaciones_item: Optional[str] = None


class DetalleSolicitudResponse(BaseSchema):
    id: int
    id_solicitud: int
    id_producto: int
    cantidad_solicitada: int
    cantidad_despachada: int = 0
    estado_item: str = "PENDIENTE"
    id_almacen_despacho: Optional[int] = None
    observaciones_item: Optional[str] = None
    producto: Optional[ProductoSimple] = None
    almacen_despacho: Optional[AlmacenSimple] = None


# -----------------------------------------------------------------------------
# Esquemas de Cabecera y Creación
# -----------------------------------------------------------------------------

class SolicitudCreate(BaseSchema):
    numero_solicitud: Optional[str] = None
    id_empleado_solicita: Optional[int] = None
    id_almacen_origen: Optional[int] = None
    motivo_justificacion: Optional[str] = None
    detalles: List[DetalleSolicitudCreate]


class SolicitudUpdateEstado(BaseSchema):
    estado: str  # Abierto, En Proceso, Entrega en Camino, Cerrado


class SolicitudDespachoPayload(BaseSchema):
    observaciones: Optional[str] = None
    comprobante_despacho_url: Optional[str] = None
    detalles: Optional[List[DetalleSolicitudDespachoItem]] = None


class SolicitudCierrePayload(BaseSchema):
    observaciones: Optional[str] = None
    comprobante_entrega_url: Optional[str] = None


# -----------------------------------------------------------------------------
# Esquema Completo de Respuesta
# -----------------------------------------------------------------------------

class SolicitudResponse(BaseSchema):
    id: int
    numero_solicitud: str
    id_empleado_solicita: int
    id_departamento_solicitante: Optional[int] = None
    id_almacen_origen: int
    fecha_solicitud: datetime
    estado: str  # Abierto, En Proceso, Entrega en Camino, Cerrado
    motivo_justificacion: Optional[str] = None

    # Trazabilidad de Estados y Aprobaciones
    aprobada_por_director: bool = False
    id_director_aprueba: Optional[int] = None
    fecha_aprobacion_director: Optional[datetime] = None

    id_director_infraestructura: Optional[int] = None
    fecha_aceptacion_infraestructura: Optional[datetime] = None

    id_usuario_despacha: Optional[int] = None
    fecha_despacho: Optional[datetime] = None
    comprobante_despacho_url: Optional[str] = None
    observaciones_despacho: Optional[str] = None

    id_usuario_recibe: Optional[int] = None
    fecha_cierre: Optional[datetime] = None
    comprobante_entrega_url: Optional[str] = None
    observaciones_entrega: Optional[str] = None

    created_at: datetime
    updated_at: datetime

    # Relaciones cargadas
    empleado_solicita: Optional[EmpleadoSimple] = None
    departamento_solicitante: Optional[DepartamentoSimple] = None
    almacen_origen: Optional[AlmacenSimple] = None
    director_aprueba: Optional[UsuarioSimple] = None
    director_infraestructura: Optional[UsuarioSimple] = None
    usuario_despacha: Optional[UsuarioSimple] = None
    usuario_recibe: Optional[UsuarioSimple] = None
    detalles: List[DetalleSolicitudResponse] = []


class SolicitudStats(BaseSchema):
    total_solicitudes: int
    total_abiertas: int
    total_pendientes_aprobacion_director: int
    total_listas_para_infraestructura: int
    total_en_proceso: int
    total_entrega_en_camino: int
    total_cerradas: int
