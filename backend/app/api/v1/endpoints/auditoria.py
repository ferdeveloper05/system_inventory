from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.acceso import Usuarios
from app.models.trazabilidad import Auditoria
from app.schemas.auditoria import AuditoriaResponse

router = APIRouter()


@router.get("/", response_model=List[AuditoriaResponse], summary="Historial de eventos de auditoría")
def list_auditoria(
    skip: int = 0,
    limit: int = 100,
    tabla: Optional[str] = None,
    operacion: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    query = db.query(Auditoria)
    if tabla:
        query = query.filter(Auditoria.tabla_afectada == tabla)
    if operacion:
        query = query.filter(Auditoria.operacion == operacion)
    return query.order_by(Auditoria.fecha.desc()).offset(skip).limit(limit).all()

