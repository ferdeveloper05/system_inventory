from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.acceso import Usuarios
from app.models.catalogo import Almacenes, Inventario, Categoria_Almacen, Categorias
from app.schemas.almacenes import AlmacenCreate, AlmacenResponse, AlmacenUpdate, CategoriaSimple
from app.services.auditoria_service import auditoria_service

router = APIRouter()

# Catálogo oficial de tipos de almacenes según la lógica de infraestructura:
# - Comida (perecederos)
# - Productos de limpieza
# - Equipos de tecnología
# - Papelería
# - Mantenimiento y herramientas
# - Almacén general / recepción
TIPOS_ALMACEN: List[Dict[str, Any]] = [
    {
        "id": "ALIMENTOS",
        "nombre": "Comida & Perecederos",
        "descripcion": "Alimentos, refrigerios, café, bebidas e insumos perecederos de cafetería y comedor.",
        "badge_color": "emerald",
        "icono": "UtensilsCrossed",
        "prefix": "ALM-ALIM-"
    },
    {
        "id": "LIMPIEZA",
        "nombre": "Productos de Limpieza & Aseo",
        "descripcion": "Detergentes, desinfectantes, papel higiénico, químicos de aseo e insumos sanitarios.",
        "badge_color": "cyan",
        "icono": "Sparkles",
        "prefix": "ALM-LIMP-"
    },
    {
        "id": "TECNOLOGIA",
        "nombre": "Equipos de Tecnología & TI",
        "descripcion": "Computadores, servidores, laptops, periféricos, cables, hardware y consumibles técnicos.",
        "badge_color": "indigo",
        "icono": "Laptop",
        "prefix": "ALM-TEC-"
    },
    {
        "id": "PAPELERIA",
        "nombre": "Papelería & Suministros de Oficina",
        "descripcion": "Hojas, carpetas, bolígrafos, archivadores, tóners de impresión y material de escritorio.",
        "badge_color": "amber",
        "icono": "FileText",
        "prefix": "ALM-PAP-"
    },
    {
        "id": "MANTENIMIENTO",
        "nombre": "Mantenimiento & Herramientas",
        "descripcion": "Herramientas manuales/eléctricas, repuestos de fontanería, electricidad, pintura y ferretería.",
        "badge_color": "purple",
        "icono": "Wrench",
        "prefix": "ALM-MANT-"
    },
    {
        "id": "GENERAL",
        "nombre": "Almacén General / Recepción",
        "descripcion": "Centro de recepción de infraestructura para acopio temporal, inspección y enrutamiento a almacenes específicos.",
        "badge_color": "slate",
        "icono": "Warehouse",
        "prefix": "ALM-GEN-"
    }
]


def _build_almacen_response(alm: Almacenes, db: Session) -> AlmacenResponse:
    """Helper para construir la respuesta completa de un almacén con métricas y categorías asociadas."""
    total_prods = db.query(Inventario).filter(Inventario.id_almacen == alm.id).count()
    stock_sum = db.query(func.coalesce(func.sum(Inventario.stock_actual), 0)).filter(
        Inventario.id_almacen == alm.id
    ).scalar() or 0

    porcentaje = None
    if alm.capacidad and alm.capacidad > 0:
        porcentaje = round((stock_sum / alm.capacidad) * 100, 1)

    # Categorías vinculadas
    categorias_rel = (
        db.query(Categorias)
        .join(Categoria_Almacen, Categoria_Almacen.id_categoria == Categorias.id)
        .filter(Categoria_Almacen.id_almacen == alm.id)
        .all()
    )

    categorias_list = [
        CategoriaSimple(id=c.id, nombre=c.nombre, codigo=c.codigo)
        for c in categorias_rel
    ]

    return AlmacenResponse(
        id=alm.id,
        codigo=alm.codigo,
        nombre=alm.nombre,
        tipo=alm.tipo or "GENERAL",
        ubicacion=alm.ubicacion,
        capacidad=alm.capacidad,
        descripcion=alm.descripcion,
        activo=alm.activo,
        created_at=alm.created_at,
        total_productos=total_prods,
        stock_total=int(stock_sum),
        porcentaje_ocupacion=porcentaje,
        categorias=categorias_list
    )


# ============================================================================
# 1. METADATA Y SUB-RECURSOS ESTÁTICOS
# ============================================================================

@router.get("/tipos", summary="Listar catálogo de tipos de almacenes")
def get_tipos_almacen(current_user: Usuarios = Depends(get_current_user)):
    """Retorna los tipos de almacenes definidos en la lógica de negocio de infraestructura."""
    return TIPOS_ALMACEN


# ============================================================================
# 2. CRUD ALMACENES
# ============================================================================

@router.get("/", response_model=List[AlmacenResponse], summary="Listar almacenes con estadísticas")
def list_almacenes(
    activo: Optional[bool] = None,
    tipo: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    query = db.query(Almacenes)

    if activo is not None:
        query = query.filter(Almacenes.activo == activo)

    if tipo and tipo != "ALL":
        query = query.filter(Almacenes.tipo == tipo)

    if search:
        search_term = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(Almacenes.nombre).like(search_term),
                func.lower(Almacenes.codigo).like(search_term),
                func.lower(Almacenes.ubicacion).like(search_term),
            )
        )

    almacenes = query.order_by(Almacenes.id.asc()).all()
    return [_build_almacen_response(alm, db) for alm in almacenes]


@router.post("/", response_model=AlmacenResponse, status_code=status.HTTP_201_CREATED, summary="Crear almacén")
def create_almacen(
    almacen_in: AlmacenCreate,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    clean_codigo = almacen_in.codigo.strip().upper()
    clean_nombre = almacen_in.nombre.strip()

    existente_codigo = db.query(Almacenes).filter(
        func.lower(func.trim(Almacenes.codigo)) == clean_codigo.lower()
    ).first()

    if existente_codigo:
        if not existente_codigo.activo:
            existente_codigo.activo = True
            existente_codigo.nombre = clean_nombre
            existente_codigo.tipo = almacen_in.tipo or "GENERAL"
            existente_codigo.ubicacion = almacen_in.ubicacion.strip()
            existente_codigo.capacidad = almacen_in.capacidad
            existente_codigo.descripcion = almacen_in.descripcion.strip() if almacen_in.descripcion else None
            
            # Actualizar categorías asociadas
            if almacen_in.ids_categorias is not None:
                db.query(Categoria_Almacen).filter(Categoria_Almacen.id_almacen == existente_codigo.id).delete()
                for cat_id in almacen_in.ids_categorias:
                    db.add(Categoria_Almacen(id_almacen=existente_codigo.id, id_categoria=cat_id))

            db.commit()
            db.refresh(existente_codigo)
            return _build_almacen_response(existente_codigo, db)

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un almacén con el código '{clean_codigo}'"
        )

    existente_nombre = db.query(Almacenes).filter(
        func.lower(func.trim(Almacenes.nombre)) == clean_nombre.lower()
    ).first()
    if existente_nombre:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un almacén registrado con el nombre '{clean_nombre}'"
        )

    alm = Almacenes(
        codigo=clean_codigo,
        nombre=clean_nombre,
        tipo=almacen_in.tipo or "GENERAL",
        ubicacion=almacen_in.ubicacion.strip(),
        capacidad=almacen_in.capacidad,
        descripcion=almacen_in.descripcion.strip() if almacen_in.descripcion else None,
        activo=almacen_in.activo
    )
    db.add(alm)
    db.flush()

    # Asociar categorías de producto correspondientes
    if almacen_in.ids_categorias:
        for cat_id in almacen_in.ids_categorias:
            db.add(Categoria_Almacen(id_almacen=alm.id, id_categoria=cat_id))

    auditoria_service.registrar(
        db=db,
        tabla_afectada="almacenes",
        operacion="INSERT",
        registro_id=alm.id,
        datos_anteriores=None,
        datos_nuevos={
            "codigo": alm.codigo,
            "nombre": alm.nombre,
            "tipo": alm.tipo,
            "ubicacion": alm.ubicacion,
            "capacidad": alm.capacidad,
            "ids_categorias": almacen_in.ids_categorias
        },
        id_usuario=current_user.id
    )
    db.commit()
    db.refresh(alm)

    return _build_almacen_response(alm, db)


@router.get("/{id_almacen}", response_model=AlmacenResponse, summary="Obtener almacén por ID")
def get_almacen(
    id_almacen: int,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    alm = db.query(Almacenes).filter(Almacenes.id == id_almacen).first()
    if not alm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Almacén no encontrado")
    return _build_almacen_response(alm, db)


@router.put("/{id_almacen}", response_model=AlmacenResponse, summary="Actualizar almacén")
def update_almacen(
    id_almacen: int,
    almacen_in: AlmacenUpdate,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    alm = db.query(Almacenes).filter(Almacenes.id == id_almacen).first()
    if not alm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Almacén no encontrado")

    datos_anteriores = {
        "codigo": alm.codigo,
        "nombre": alm.nombre,
        "tipo": alm.tipo,
        "ubicacion": alm.ubicacion,
        "capacidad": alm.capacidad,
        "activo": alm.activo,
    }

    update_data = almacen_in.model_dump(exclude_unset=True)

    if "codigo" in update_data and update_data["codigo"]:
        clean_codigo = update_data["codigo"].strip().upper()
        existente = db.query(Almacenes).filter(
            func.lower(func.trim(Almacenes.codigo)) == clean_codigo.lower(),
            Almacenes.id != id_almacen
        ).first()
        if existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe otro almacén con el código '{clean_codigo}'"
            )
        update_data["codigo"] = clean_codigo

    if "nombre" in update_data and update_data["nombre"]:
        clean_nombre = update_data["nombre"].strip()
        existente = db.query(Almacenes).filter(
            func.lower(func.trim(Almacenes.nombre)) == clean_nombre.lower(),
            Almacenes.id != id_almacen
        ).first()
        if existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe otro almacén con el nombre '{clean_nombre}'"
            )
        update_data["nombre"] = clean_nombre

    if "ubicacion" in update_data and update_data["ubicacion"]:
        update_data["ubicacion"] = update_data["ubicacion"].strip()

    if "descripcion" in update_data and update_data["descripcion"] is not None:
        update_data["descripcion"] = update_data["descripcion"].strip() or None

    # Manejar actualización de categorías asignadas
    if "ids_categorias" in update_data:
        ids_cats = update_data.pop("ids_categorias")
        db.query(Categoria_Almacen).filter(Categoria_Almacen.id_almacen == id_almacen).delete()
        if ids_cats:
            for cat_id in ids_cats:
                db.add(Categoria_Almacen(id_almacen=id_almacen, id_categoria=cat_id))

    for field, value in update_data.items():
        setattr(alm, field, value)

    auditoria_service.registrar(
        db=db,
        tabla_afectada="almacenes",
        operacion="UPDATE",
        registro_id=alm.id,
        datos_anteriores=datos_anteriores,
        datos_nuevos=update_data,
        id_usuario=current_user.id
    )

    db.commit()
    db.refresh(alm)
    return _build_almacen_response(alm, db)


@router.patch("/{id_almacen}/toggle-activo", response_model=AlmacenResponse, summary="Alternar estado activo de almacén")
def toggle_activo_almacen(
    id_almacen: int,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    alm = db.query(Almacenes).filter(Almacenes.id == id_almacen).first()
    if not alm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Almacén no encontrado")

    estado_anterior = alm.activo
    alm.activo = not alm.activo

    auditoria_service.registrar(
        db=db,
        tabla_afectada="almacenes",
        operacion="UPDATE",
        registro_id=alm.id,
        datos_anteriores={"activo": estado_anterior},
        datos_nuevos={"activo": alm.activo},
        id_usuario=current_user.id
    )

    db.commit()
    db.refresh(alm)
    return _build_almacen_response(alm, db)


@router.delete("/{id_almacen}", status_code=status.HTTP_200_OK, summary="Eliminar almacén")
def delete_almacen(
    id_almacen: int,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    alm = db.query(Almacenes).filter(Almacenes.id == id_almacen).first()
    if not alm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Almacén no encontrado")

    # Regla de negocio crítica: No permitir eliminar si contiene stock físico
    stock_actual = db.query(func.coalesce(func.sum(Inventario.stock_actual), 0)).filter(
        Inventario.id_almacen == id_almacen
    ).scalar() or 0

    if stock_actual > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede eliminar el almacén '{alm.nombre}' porque contiene {stock_actual} unidades de producto en stock. Debe transferir o dar salida a los artículos antes de eliminarlo."
        )

    # Eliminar vínculos de categorías
    db.query(Categoria_Almacen).filter(Categoria_Almacen.id_almacen == id_almacen).delete()

    auditoria_service.registrar(
        db=db,
        tabla_afectada="almacenes",
        operacion="DELETE",
        registro_id=alm.id,
        datos_anteriores={"codigo": alm.codigo, "nombre": alm.nombre, "tipo": alm.tipo},
        datos_nuevos=None,
        id_usuario=current_user.id
    )

    db.delete(alm)
    db.commit()
    return {"message": f"Almacén '{alm.nombre}' ({alm.codigo}) eliminado correctamente"}
