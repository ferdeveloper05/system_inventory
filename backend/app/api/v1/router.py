from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    usuarios,
    productos,
    almacenes,
    inventario,
    recepciones,
    solicitudes,
    movimientos,
    auditoria,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Autenticación & Seguridad"])
api_router.include_router(usuarios.router, prefix="/usuarios", tags=["Gestión de Accesos & Usuarios"])
api_router.include_router(productos.router, prefix="/productos", tags=["Catálogo de Productos & Activos"])
api_router.include_router(almacenes.router, prefix="/almacenes", tags=["Almacenes & Sedes"])
api_router.include_router(inventario.router, prefix="/inventario", tags=["Existencias & Stock"])
api_router.include_router(recepciones.router, prefix="/recepciones", tags=["Entradas & Recepciones"])
api_router.include_router(solicitudes.router, prefix="/solicitudes", tags=["Salidas & Solicitudes"])
api_router.include_router(movimientos.router, prefix="/movimientos", tags=["Kardex & Movimientos"])
api_router.include_router(auditoria.router, prefix="/auditoria", tags=["Auditoría & Trazabilidad"])

