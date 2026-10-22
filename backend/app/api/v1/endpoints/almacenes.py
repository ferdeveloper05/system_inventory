from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.acceso import Usuarios
from app.models.catalogo import Almacenes
from app.schemas.almacenes import AlmacenCreate, AlmacenUpdate, AlmacenResponse

router = APIRouter()


@router.get("/", response_model=List[AlmacenResponse], summary="Listar almacenes")
def list_almacenes(db: Session = Depends(get_db), current_user: Usuarios = Depends(get_current_user)):
    return db.query(Almacenes).filter(Almacenes.activo == True).all()


@router.post("/", response_model=AlmacenResponse, status_code=status.HTTP_201_CREATED, summary="Crear almacén")
def create_almacen(
    almacen_in: AlmacenCreate,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    if db.query(Almacenes).filter(Almacenes.codigo == almacen_in.codigo).first():
        raise HTTPException(status_code=400, detail="El código de almacén ya existe")
    alm = Almacenes(**almacen_in.model_dump())
    db.add(alm)
    db.commit()
    db.refresh(alm)
    return alm


@router.get("/{id_almacen}", response_model=AlmacenResponse, summary="Obtener almacén por ID")
def get_almacen(id_almacen: int, db: Session = Depends(get_db), current_user: Usuarios = Depends(get_current_user)):
    alm = db.query(Almacenes).filter(Almacenes.id == id_almacen).first()
    if not alm:
        raise HTTPException(status_code=404, detail="Almacén no encontrado")
    return alm

