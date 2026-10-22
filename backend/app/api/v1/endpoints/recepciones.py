from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.acceso import Usuarios
from app.models.compras import Recepciones
from app.schemas.recepciones import RecepcionCreate, RecepcionResponse
from app.services.recepcion_service import recepcion_service

router = APIRouter()


@router.get("/", response_model=List[RecepcionResponse], summary="Listar recepciones de inventario")
def list_recepciones(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    return db.query(Recepciones).order_by(Recepciones.fecha_recepcion.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=RecepcionResponse, status_code=status.HTTP_201_CREATED, summary="Registrar nueva recepción")
def create_recepcion(
    recepcion_in: RecepcionCreate,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    return recepcion_service.crear_recepcion(db=db, recepcion_in=recepcion_in, id_usuario=current_user.id)

