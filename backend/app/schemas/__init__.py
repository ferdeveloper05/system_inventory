from app.schemas.base import BaseSchema
from app.schemas.auth import Token, TokenPayload, LoginRequest, CurrentUserResponse
from app.schemas.usuarios import (
    DepartamentoCreate, DepartamentoUpdate, DepartamentoResponse,
    RolCreate, RolResponse,
    EmpleadoCreate, EmpleadoUpdate, EmpleadoResponse,
    UsuarioCreate, UsuarioUpdate, UsuarioResponse
)
from app.schemas.productos import (
    CategoriaCreate, CategoriaResponse,
    ProductoCreate, ProductoUpdate, ProductoResponse
)
from app.schemas.almacenes import AlmacenCreate, AlmacenUpdate, AlmacenResponse
from app.schemas.inventario import InventarioCreate, InventarioUpdate, InventarioResponse
from app.schemas.recepciones import RecepcionCreate, RecepcionResponse, DetalleRecepcionCreate, DetalleRecepcionResponse
from app.schemas.solicitudes import SolicitudCreate, SolicitudUpdateEstado, SolicitudResponse, DetalleSolicitudResponse
from app.schemas.movimientos import MovimientoCreate, MovimientoResponse
from app.schemas.auditoria import AuditoriaResponse

__all__ = [
    "BaseSchema",
    "Token", "TokenPayload", "LoginRequest", "CurrentUserResponse",
    "DepartamentoCreate", "DepartamentoResponse",
    "RolCreate", "RolResponse",
    "EmpleadoCreate", "EmpleadoResponse",
    "UsuarioCreate", "UsuarioUpdate", "UsuarioResponse",
    "CategoriaCreate", "CategoriaResponse",
    "ProductoCreate", "ProductoUpdate", "ProductoResponse",
    "AlmacenCreate", "AlmacenUpdate", "AlmacenResponse",
    "InventarioCreate", "InventarioUpdate", "InventarioResponse",
    "RecepcionCreate", "RecepcionResponse", "DetalleRecepcionCreate", "DetalleRecepcionResponse",
    "SolicitudCreate", "SolicitudUpdateEstado", "SolicitudResponse", "DetalleSolicitudResponse",
    "MovimientoCreate", "MovimientoResponse",
    "AuditoriaResponse",
]

