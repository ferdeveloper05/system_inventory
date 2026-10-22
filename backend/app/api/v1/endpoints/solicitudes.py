from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.acceso import Usuarios
from app.models.solicitudes import Solicitudes
from app.schemas.solicitudes import SolicitudCreate, SolicitudResponse
from app.services.solicitud_service import solicitud_service

router = APIRouter()


@router.get("/", response_model=List[SolicitudResponse], summary="Listar solicitudes de material")
def list_solicitudes(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    return db.query(Solicitudes).order_by(Solicitudes.fecha_solicitud.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=SolicitudResponse, status_code=status.HTTP_201_CREATED, summary="Crear solicitud")
def create_solicitud(
    solicitud_in: SolicitudCreate,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    return solicitud_service.crear_solicitud(db=db, solicitud_in=solicitud_in, id_usuario=current_user.id)


@router.post("/{id_solicitud}/despachar", response_model=SolicitudResponse, summary="Despachar y descontar inventario")
def despachar_solicitud(
    id_solicitud: int,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    return solicitud_service.despachar_solicitud(db=db, id_solicitud=id_solicitud, id_usuario=current_user.id)

