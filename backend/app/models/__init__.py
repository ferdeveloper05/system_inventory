from app.core.database import Base
from app.models.acceso import Departamento, Roles, Empleados, Usuarios
from app.models.catalogo import Categorias, Almacenes, Categoria_Almacen, Productos, Inventario
from app.models.compras import Proveedores, Ordenes_Compra, Detalle_orden_compra, Recepciones, Detalle_recepcion
from app.models.solicitudes import Solicitudes, Detalle_solicitud
from app.models.trazabilidad import Movimientos, Auditoria

__all__ = [
    "Base",
    # Accesos
    "Departamento",
    "Roles",
    "Empleados",
    "Usuarios",
    # Catálogo & Almacén
    "Categorias",
    "Almacenes",
    "Categoria_Almacen",
    "Productos",
    "Inventario",
    # Entradas & Compras
    "Proveedores",
    "Ordenes_Compra",
    "Detalle_orden_compra",
    "Recepciones",
    "Detalle_recepcion",
    # Salidas & Solicitudes
    "Solicitudes",
    "Detalle_solicitud",
    # Trazabilidad & Control
    "Movimientos",
    "Auditoria",
]

