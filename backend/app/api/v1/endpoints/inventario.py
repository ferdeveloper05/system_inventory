from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.acceso import Usuarios
from app.models.catalogo import Inventario
from app.schemas.inventario import InventarioResponse

router = APIRouter()


@router.get("/", response_model=List[InventarioResponse], summary="Consultar stock en almacenes")
def get_inventarios(
    id_almacen: Optional[int] = None,
    id_producto: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    query = db.query(Inventario)
    if id_almacen:
        query = query.filter(Inventario.id_almacen == id_almacen)
    if id_producto:
        query = query.filter(Inventario.id_producto == id_producto)
    return query.all()

