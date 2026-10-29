from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.acceso import Usuarios
from app.models.catalogo import Productos, Categorias, Almacenes, Inventario
from app.schemas.productos import (
    ProductoCreate, ProductoUpdate, ProductoResponse,
    CategoriaCreate, CategoriaUpdate, CategoriaResponse,
    AlmacenSimpleResponse
)
from app.services.auditoria_service import auditoria_service

router = APIRouter()


def _build_producto_response(prod: Productos, db: Session) -> ProductoResponse:
    """Helper para construir la respuesta completa de un producto con stock total y almacén predeterminado."""
    total_stock = db.query(func.coalesce(func.sum(Inventario.stock_actual), 0)).filter(
        Inventario.id_producto == prod.id
    ).scalar() or 0

    cat_resp = None
    if prod.categoria:
        cat_resp = CategoriaResponse(
            id=prod.categoria.id,
            nombre=prod.categoria.nombre,
            codigo=prod.categoria.codigo,
            descripcion=prod.categoria.descripcion,
            activo=prod.categoria.activo,
            created_at=prod.categoria.created_at,
            total_productos=0
        )

    alm_resp = None
    if prod.almacen_predeterminado:
        alm_resp = AlmacenSimpleResponse(
            id=prod.almacen_predeterminado.id,
            codigo=prod.almacen_predeterminado.codigo,
            nombre=prod.almacen_predeterminado.nombre,
            tipo=prod.almacen_predeterminado.tipo or "GENERAL",
            ubicacion=prod.almacen_predeterminado.ubicacion
        )

    return ProductoResponse(
        id=prod.id,
        codigo=prod.codigo,
        nombre=prod.nombre,
        descripcion=prod.descripcion,
        unidad_medida=prod.unidad_medida,
        stock_minimo=prod.stock_minimo,
        stock_maximo=prod.stock_maximo,
        id_categoria=prod.id_categoria,
        id_almacen_predeterminado=prod.id_almacen_predeterminado,
        atributos=prod.atributos or {},
        activo=prod.activo,
        created_at=prod.created_at,
        updated_at=prod.updated_at,
        categoria=cat_resp,
        almacen_predeterminado=alm_resp,
        total_stock=int(total_stock)
    )


# ============================================================================
# 1. CATEGORÍAS (Definidas antes del comodín /{id_producto})
# ============================================================================

@router.get("/categorias", response_model=List[CategoriaResponse], summary="Listar categorías con conteo de productos")
def list_categorias(
    activo: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    query = db.query(Categorias)
    if activo is not None:
        query = query.filter(Categorias.activo == activo)

    categorias = query.order_by(Categorias.nombre.asc()).all()
    resultado: List[CategoriaResponse] = []
    for cat in categorias:
        total_prods = db.query(Productos).filter(Productos.id_categoria == cat.id).count()
        resultado.append(
            CategoriaResponse(
                id=cat.id,
                nombre=cat.nombre,
                codigo=cat.codigo,
                descripcion=cat.descripcion,
                activo=cat.activo,
                created_at=cat.created_at,
                total_productos=total_prods
            )
        )
    return resultado


@router.post("/categorias", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED, summary="Crear categoría")
def create_categoria(
    cat_in: CategoriaCreate,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    clean_codigo = cat_in.codigo.strip().upper()
    clean_nombre = cat_in.nombre.strip()

    existente_codigo = db.query(Categorias).filter(
        func.lower(func.trim(Categorias.codigo)) == clean_codigo.lower()
    ).first()

    if existente_codigo:
        if not existente_codigo.activo:
            existente_codigo.activo = True
            existente_codigo.nombre = clean_nombre
            existente_codigo.descripcion = cat_in.descripcion.strip() if cat_in.descripcion else None
            db.commit()
            db.refresh(existente_codigo)
            return CategoriaResponse(
                id=existente_codigo.id,
                nombre=existente_codigo.nombre,
                codigo=existente_codigo.codigo,
                descripcion=existente_codigo.descripcion,
                activo=existente_codigo.activo,
                created_at=existente_codigo.created_at,
                total_productos=0
            )
        raise HTTPException(status_code=400, detail=f"El código de categoría '{clean_codigo}' ya existe")

    existente_nombre = db.query(Categorias).filter(
        func.lower(func.trim(Categorias.nombre)) == clean_nombre.lower()
    ).first()
    if existente_nombre:
        raise HTTPException(status_code=400, detail=f"Ya existe una categoría con el nombre '{clean_nombre}'")

    cat = Categorias(
        nombre=clean_nombre,
        codigo=clean_codigo,
        descripcion=cat_in.descripcion.strip() if cat_in.descripcion else None,
        activo=cat_in.activo
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return CategoriaResponse(
        id=cat.id,
        nombre=cat.nombre,
        codigo=cat.codigo,
        descripcion=cat.descripcion,
        activo=cat.activo,
        created_at=cat.created_at,
        total_productos=0
    )


@router.get("/categorias/{id_categoria}", response_model=CategoriaResponse, summary="Obtener categoría por ID")
def get_categoria(
    id_categoria: int,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    cat = db.query(Categorias).filter(Categorias.id == id_categoria).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    total_prods = db.query(Productos).filter(Productos.id_categoria == cat.id).count()
    return CategoriaResponse(
        id=cat.id,
        nombre=cat.nombre,
        codigo=cat.codigo,
        descripcion=cat.descripcion,
        activo=cat.activo,
        created_at=cat.created_at,
        total_productos=total_prods
    )


@router.put("/categorias/{id_categoria}", response_model=CategoriaResponse, summary="Actualizar categoría")
def update_categoria(
    id_categoria: int,
    cat_in: CategoriaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    cat = db.query(Categorias).filter(Categorias.id == id_categoria).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    update_data = cat_in.model_dump(exclude_unset=True)
    if "codigo" in update_data and update_data["codigo"]:
        clean_cod = update_data["codigo"].strip().upper()
        if db.query(Categorias).filter(func.lower(Categorias.codigo) == clean_cod.lower(), Categorias.id != id_categoria).first():
            raise HTTPException(status_code=400, detail=f"El código '{clean_cod}' ya está en uso por otra categoría")
        update_data["codigo"] = clean_cod

    if "nombre" in update_data and update_data["nombre"]:
        clean_nom = update_data["nombre"].strip()
        if db.query(Categorias).filter(func.lower(Categorias.nombre) == clean_nom.lower(), Categorias.id != id_categoria).first():
            raise HTTPException(status_code=400, detail=f"El nombre '{clean_nom}' ya está en uso por otra categoría")
        update_data["nombre"] = clean_nom

    for field, val in update_data.items():
        setattr(cat, field, val)

    db.commit()
    db.refresh(cat)
    total_prods = db.query(Productos).filter(Productos.id_categoria == cat.id).count()
    return CategoriaResponse(
        id=cat.id,
        nombre=cat.nombre,
        codigo=cat.codigo,
        descripcion=cat.descripcion,
        activo=cat.activo,
        created_at=cat.created_at,
        total_productos=total_prods
    )


@router.patch("/categorias/{id_categoria}/toggle-activo", response_model=CategoriaResponse, summary="Alternar estado de categoría")
def toggle_activo_categoria(
    id_categoria: int,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    cat = db.query(Categorias).filter(Categorias.id == id_categoria).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    cat.activo = not cat.activo
    db.commit()
    db.refresh(cat)
    total_prods = db.query(Productos).filter(Productos.id_categoria == cat.id).count()
    return CategoriaResponse(
        id=cat.id,
        nombre=cat.nombre,
        codigo=cat.codigo,
        descripcion=cat.descripcion,
        activo=cat.activo,
        created_at=cat.created_at,
        total_productos=total_prods
    )


@router.delete("/categorias/{id_categoria}", status_code=status.HTTP_200_OK, summary="Eliminar categoría")
def delete_categoria(
    id_categoria: int,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    cat = db.query(Categorias).filter(Categorias.id == id_categoria).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    productos_count = db.query(Productos).filter(Productos.id_categoria == id_categoria).count()
    if productos_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede eliminar la categoría '{cat.nombre}' porque contiene {productos_count} producto(s) asociado(s). Reasigne o elimine los productos primero."
        )

    db.delete(cat)
    db.commit()
    return {"message": f"Categoría '{cat.nombre}' eliminada correctamente"}


# ============================================================================
# 2. PRODUCTOS
# ============================================================================

@router.get("/", response_model=List[ProductoResponse], summary="Listar productos con filtros y stock total")
def list_productos(
    skip: int = 0,
    limit: int = 150,
    categoria_id: Optional[int] = None,
    almacen_id: Optional[int] = None,
    search: Optional[str] = None,
    activo: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    query = db.query(Productos)

    if activo is not None:
        query = query.filter(Productos.activo == activo)

    if categoria_id:
        query = query.filter(Productos.id_categoria == categoria_id)

    if almacen_id:
        query = query.filter(
            or_(
                Productos.id_almacen_predeterminado == almacen_id,
                Productos.inventarios.any(Inventario.id_almacen == almacen_id)
            )
        )

    if search:
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(Productos.nombre).like(term),
                func.lower(Productos.codigo).like(term),
                func.lower(Productos.descripcion).like(term),
            )
        )

    productos = query.order_by(Productos.id.asc()).offset(skip).limit(limit).all()
    return [_build_producto_response(p, db) for p in productos]


@router.post("/", response_model=ProductoResponse, status_code=status.HTTP_201_CREATED, summary="Crear producto con atributos dinámicos")
def create_producto(
    prod_in: ProductoCreate,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    clean_codigo = prod_in.codigo.strip().upper()
    clean_nombre = prod_in.nombre.strip()

    if db.query(Productos).filter(func.lower(func.trim(Productos.codigo)) == clean_codigo.lower()).first():
        raise HTTPException(status_code=400, detail=f"El código de producto '{clean_codigo}' ya existe")

    # Verificar categoría existente
    cat = db.query(Categorias).filter(Categorias.id == prod_in.id_categoria).first()
    if not cat:
        raise HTTPException(status_code=400, detail="La categoría seleccionada no existe")

    # Verificar almacén predeterminado si se envió
    if prod_in.id_almacen_predeterminado:
        alm = db.query(Almacenes).filter(Almacenes.id == prod_in.id_almacen_predeterminado).first()
        if not alm:
            raise HTTPException(status_code=400, detail="El almacén de destino seleccionado no existe")

    prod = Productos(
        codigo=clean_codigo,
        nombre=clean_nombre,
        descripcion=prod_in.descripcion.strip() if prod_in.descripcion else None,
        unidad_medida=prod_in.unidad_medida.strip().upper(),
        stock_minimo=prod_in.stock_minimo,
        stock_maximo=prod_in.stock_maximo,
        id_categoria=prod_in.id_categoria,
        id_almacen_predeterminado=prod_in.id_almacen_predeterminado,
        atributos=prod_in.atributos or {},
        activo=prod_in.activo
    )
    db.add(prod)
    db.flush()

    # Si se asignó almacén predeterminado, crear registro de inventario inicial
    if prod_in.id_almacen_predeterminado:
        inv_existente = db.query(Inventario).filter(
            Inventario.id_producto == prod.id,
            Inventario.id_almacen == prod_in.id_almacen_predeterminado
        ).first()
        if not inv_existente:
            nuevo_inv = Inventario(
                id_almacen=prod_in.id_almacen_predeterminado,
                id_producto=prod.id,
                stock_actual=0,
                stock_reservado=0
            )
            db.add(nuevo_inv)

    auditoria_service.registrar(
        db=db,
        tabla_afectada="productos",
        operacion="INSERT",
        registro_id=prod.id,
        datos_anteriores=None,
        datos_nuevos={
            "codigo": prod.codigo,
            "nombre": prod.nombre,
            "id_categoria": prod.id_categoria,
            "id_almacen_predeterminado": prod.id_almacen_predeterminado,
            "atributos": prod.atributos
        },
        id_usuario=current_user.id
    )

    db.commit()
    db.refresh(prod)
    return _build_producto_response(prod, db)


@router.get("/{id_producto}", response_model=ProductoResponse, summary="Obtener producto por ID")
def get_producto(
    id_producto: int,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    prod = db.query(Productos).filter(Productos.id == id_producto).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return _build_producto_response(prod, db)


@router.put("/{id_producto}", response_model=ProductoResponse, summary="Actualizar producto")
def update_producto(
    id_producto: int,
    prod_in: ProductoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    prod = db.query(Productos).filter(Productos.id == id_producto).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    datos_anteriores = {
        "codigo": prod.codigo,
        "nombre": prod.nombre,
        "id_categoria": prod.id_categoria,
        "id_almacen_predeterminado": prod.id_almacen_predeterminado,
        "atributos": prod.atributos,
        "activo": prod.activo
    }

    update_data = prod_in.model_dump(exclude_unset=True)

    if "codigo" in update_data and update_data["codigo"]:
        clean_cod = update_data["codigo"].strip().upper()
        if db.query(Productos).filter(func.lower(Productos.codigo) == clean_cod.lower(), Productos.id != id_producto).first():
            raise HTTPException(status_code=400, detail=f"El código '{clean_cod}' ya pertenece a otro producto")
        update_data["codigo"] = clean_cod

    if "nombre" in update_data and update_data["nombre"]:
        update_data["nombre"] = update_data["nombre"].strip()

    if "unidad_medida" in update_data and update_data["unidad_medida"]:
        update_data["unidad_medida"] = update_data["unidad_medida"].strip().upper()

    if "id_categoria" in update_data and update_data["id_categoria"]:
        if not db.query(Categorias).filter(Categorias.id == update_data["id_categoria"]).first():
            raise HTTPException(status_code=400, detail="La categoría seleccionada no existe")

    if "id_almacen_predeterminado" in update_data and update_data["id_almacen_predeterminado"]:
        if not db.query(Almacenes).filter(Almacenes.id == update_data["id_almacen_predeterminado"]).first():
            raise HTTPException(status_code=400, detail="El almacén seleccionado no existe")

        # Asegurar inventario en el almacén predeterminado
        inv_existente = db.query(Inventario).filter(
            Inventario.id_producto == id_producto,
            Inventario.id_almacen == update_data["id_almacen_predeterminado"]
        ).first()
        if not inv_existente:
            db.add(Inventario(
                id_almacen=update_data["id_almacen_predeterminado"],
                id_producto=id_producto,
                stock_actual=0,
                stock_reservado=0
            ))

    for field, val in update_data.items():
        setattr(prod, field, val)

    auditoria_service.registrar(
        db=db,
        tabla_afectada="productos",
        operacion="UPDATE",
        registro_id=prod.id,
        datos_anteriores=datos_anteriores,
        datos_nuevos=update_data,
        id_usuario=current_user.id
    )

    db.commit()
    db.refresh(prod)
    return _build_producto_response(prod, db)


@router.patch("/{id_producto}/toggle-activo", response_model=ProductoResponse, summary="Alternar estado de producto")
def toggle_activo_producto(
    id_producto: int,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    prod = db.query(Productos).filter(Productos.id == id_producto).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    estado_anterior = prod.activo
    prod.activo = not prod.activo

    auditoria_service.registrar(
        db=db,
        tabla_afectada="productos",
        operacion="UPDATE",
        registro_id=prod.id,
        datos_anteriores={"activo": estado_anterior},
        datos_nuevos={"activo": prod.activo},
        id_usuario=current_user.id
    )

    db.commit()
    db.refresh(prod)
    return _build_producto_response(prod, db)


@router.delete("/{id_producto}", status_code=status.HTTP_200_OK, summary="Eliminar producto")
def delete_producto(
    id_producto: int,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    prod = db.query(Productos).filter(Productos.id == id_producto).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    stock_total = db.query(func.coalesce(func.sum(Inventario.stock_actual), 0)).filter(
        Inventario.id_producto == id_producto
    ).scalar() or 0

    if stock_total > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede eliminar el producto '{prod.nombre}' porque cuenta con {stock_total} unidades en existencia. Debe dar salida al stock antes de eliminarlo."
        )

    # Eliminar registros de inventario en cero
    db.query(Inventario).filter(Inventario.id_producto == id_producto).delete()

    auditoria_service.registrar(
        db=db,
        tabla_afectada="productos",
        operacion="DELETE",
        registro_id=prod.id,
        datos_anteriores={"codigo": prod.codigo, "nombre": prod.nombre},
        datos_nuevos=None,
        id_usuario=current_user.id
    )

    db.delete(prod)
    db.commit()
    return {"message": f"Producto '{prod.nombre}' ({prod.codigo}) eliminado correctamente"}
