from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.acceso import Usuarios
from app.models.catalogo import Productos, Categorias
from app.schemas.productos import (
    ProductoCreate, ProductoUpdate, ProductoResponse,
    CategoriaCreate, CategoriaResponse
)

router = APIRouter()


# Categorias
@router.get("/categorias", response_model=List[CategoriaResponse], summary="Listar categorías")
def list_categorias(db: Session = Depends(get_db), current_user: Usuarios = Depends(get_current_user)):
    return db.query(Categorias).filter(Categorias.activo == True).all()


@router.post("/categorias", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED, summary="Crear categoría")
def create_categoria(
    cat_in: CategoriaCreate,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    if db.query(Categorias).filter(Categorias.codigo == cat_in.codigo).first():
        raise HTTPException(status_code=400, detail="El código de categoría ya existe")
    cat = Categorias(**cat_in.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


# Productos
@router.get("/", response_model=List[ProductoResponse], summary="Listar productos")
def list_productos(
    skip: int = 0,
    limit: int = 100,
    categoria_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    query = db.query(Productos).filter(Productos.activo == True)
    if categoria_id:
        query = query.filter(Productos.id_categoria == categoria_id)
    return query.offset(skip).limit(limit).all()


@router.post("/", response_model=ProductoResponse, status_code=status.HTTP_201_CREATED, summary="Crear producto")
def create_producto(
    prod_in: ProductoCreate,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    if db.query(Productos).filter(Productos.codigo == prod_in.codigo).first():
        raise HTTPException(status_code=400, detail="El código de producto ya existe")
    prod = Productos(**prod_in.model_dump())
    db.add(prod)
    db.commit()
    db.refresh(prod)
    return prod


@router.get("/{id_producto}", response_model=ProductoResponse, summary="Obtener producto por ID")
def get_producto(
    id_producto: int,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    prod = db.query(Productos).filter(Productos.id == id_producto).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return prod

