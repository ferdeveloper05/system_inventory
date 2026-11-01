from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload, selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.acceso import Usuarios
from app.models.compras import Recepciones, Detalle_recepcion
from app.schemas.recepciones import (
    RecepcionCreate,
    RecepcionResponse,
    RecepcionAnular,
    RecepcionStats,
)
from app.services.recepcion_service import recepcion_service

router = APIRouter()


@router.get("/", response_model=List[RecepcionResponse], summary="Listar recepciones de inventario")
def list_recepciones(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    id_almacen: Optional[int] = Query(None, description="Filtrar por almacén destino"),
    estado: Optional[str] = Query(None, description="Filtrar por estado (COMPLETADA, ANULADA, BORRADOR)"),
    search: Optional[str] = Query(None, description="Búsqueda por número o notas"),
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    """
    Retorna la lista de recepciones registradas con sus almacenes,
    empleados receptores y productos recibidos cargados de forma optimizada.
    """
    query = (
        db.query(Recepciones)
        .options(
            joinedload(Recepciones.almacen),
            joinedload(Recepciones.empleado_recibe),
            selectinload(Recepciones.detalles).joinedload(Detalle_recepcion.producto)
        )
    )

    if id_almacen:
        query = query.filter(Recepciones.id_almacen == id_almacen)

    if estado and estado != "ALL":
        query = query.filter(Recepciones.estado == estado.upper())

    if search:
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(Recepciones.numero_recepcion).like(term),
                func.lower(Recepciones.observaciones).like(term)
            )
        )

    return query.order_by(Recepciones.fecha_recepcion.desc()).offset(skip).limit(limit).all()


@router.get("/stats", response_model=RecepcionStats, summary="Estadísticas generales de recepciones")
def get_recepciones_stats(
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    """Retorna métricas clave de entradas y recepciones para el dashboard y encabezados."""
    total_recepciones = db.query(func.count(Recepciones.id)).scalar() or 0
    total_completadas = (
        db.query(func.count(Recepciones.id))
        .filter(Recepciones.estado == "COMPLETADA")
        .scalar() or 0
    )
    total_anuladas = (
        db.query(func.count(Recepciones.id))
        .filter(Recepciones.estado == "ANULADA")
        .scalar() or 0
    )

    # Total unidades recibidas
    total_items = (
        db.query(func.sum(Detalle_recepcion.cantidad_recibida))
        .join(Recepciones, Recepciones.id == Detalle_recepcion.id_recepcion)
        .filter(Recepciones.estado == "COMPLETADA")
        .scalar() or 0
    )

    # Recepciones registradas en la fecha actual (UTC)
    hoy_inicio = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    recepciones_hoy = (
        db.query(func.count(Recepciones.id))
        .filter(Recepciones.fecha_recepcion >= hoy_inicio)
        .scalar() or 0
    )

    return RecepcionStats(
        total_recepciones=total_recepciones,
        total_items_recibidos=int(total_items),
        total_completadas=total_completadas,
        total_anuladas=total_anuladas,
        recepciones_hoy=recepciones_hoy,
    )


@router.get("/{id_recepcion}", response_model=RecepcionResponse, summary="Obtener detalle de una recepción")
def get_recepcion(
    id_recepcion: int,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    """Obtiene los detalles completos de una recepción física."""
    recepcion = recepcion_service.obtener_por_id(db=db, id_recepcion=id_recepcion)
    if not recepcion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recepción con ID {id_recepcion} no encontrada."
        )
    return recepcion


@router.post("/", response_model=RecepcionResponse, status_code=status.HTTP_201_CREATED, summary="Registrar nueva recepción")
def create_recepcion(
    recepcion_in: RecepcionCreate,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    """
    Registra una recepción de inventario en infraestructura:
    - Incrementa el stock en el almacén de destino.
    - Crea registros de movimiento en el Kardex.
    - Registra el evento en la bitácora de auditoría.
    """
    return recepcion_service.crear_recepcion(db=db, recepcion_in=recepcion_in, id_usuario=current_user.id)


@router.patch("/{id_recepcion}/anular", response_model=RecepcionResponse, summary="Anular una recepción y revertir inventario")
def anular_recepcion(
    id_recepcion: int,
    payload: Optional[RecepcionAnular] = None,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    """
    Anula una recepción previamente completada:
    - Reversa el stock ingresado del almacén destino.
    - Genera movimientos de trazabilidad de salida por anulación.
    - Registra auditoría con el motivo indicado.
    """
    motivo = payload.motivo if payload else None
    return recepcion_service.anular_recepcion(
        db=db,
        id_recepcion=id_recepcion,
        id_usuario=current_user.id,
        motivo=motivo
    )
