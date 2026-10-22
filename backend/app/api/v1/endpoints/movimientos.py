from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.acceso import Usuarios
from app.models.trazabilidad import Movimientos
from app.schemas.movimientos import MovimientoResponse

router = APIRouter()


@router.get("/", response_model=List[MovimientoResponse], summary="Kardex y registro histórico de movimientos")
def list_movimientos(
    skip: int = 0,
    limit: int = 100,
    tipo: Optional[str] = None,
    id_producto: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    query = db.query(Movimientos)
    if tipo:
        query = query.filter(Movimientos.tipo_movimiento == tipo)
    if id_producto:
        query = query.filter(Movimientos.id_producto == id_producto)
    return query.order_by(Movimientos.fecha_movimiento.desc()).offset(skip).limit(limit).all()

