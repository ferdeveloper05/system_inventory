import json
from typing import List, Optional
from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.acceso import Usuarios
from app.models.solicitudes import Solicitudes
from app.schemas.solicitudes import (
    DetalleSolicitudDespachoItem,
    SolicitudCreate,
    SolicitudDespachoPayload,
    SolicitudCierrePayload,
    SolicitudResponse,
    SolicitudStats,
)
from app.services.solicitud_service import (
    solicitud_service,
    check_es_administrador,
    es_director,
    es_analista,
    user_es_de_infraestructura,
    get_user_department_id,
    get_user_role_name,
)

router = APIRouter()


# ============================================================================
# 1. LISTADO Y ESTADÍSTICAS (VISIBILIDAD TOTAL Y CONTROL DE ACCESO)
# ============================================================================

@router.get("/stats", response_model=SolicitudStats, summary="Estadísticas de solicitudes según perfil")
def get_solicitudes_stats(
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    """
    Retorna los conteos de solicitudes según el estado del ciclo de vida.
    - Director de Infraestructura y Administradores tienen visibilidad global.
    - Usuarios de departamentos solicitantes visualizan las métricas de su área.
    """
    return solicitud_service.get_stats(db=db, current_user=current_user)


@router.get("/", response_model=List[SolicitudResponse], summary="Listar solicitudes de material con permisos por rol")
def list_solicitudes(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    estado: Optional[str] = Query(None, description="Filtrar por estado (Abierto, En Proceso, Entrega en Camino, Cerrado)"),
    id_departamento: Optional[int] = Query(None, description="Filtrar por departamento solicitante"),
    search: Optional[str] = Query(None, description="Búsqueda por número de solicitud o justificación"),
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    """
    Listado de solicitudes con control de acceso por Rol y Departamento:
    1. Director de Infraestructura y Administradores: Visibilidad global de todas las solicitudes.
    2. Analistas de Infraestructura: Visibilidad de solicitudes enviadas a infraestructura (Abierto aprobadas, En Proceso, Entrega en Camino, Cerrado).
    3. Analistas y Directores de Departamentos Solicitantes: Visibilidad exclusiva de las solicitudes de su respectivo departamento.
    """
    query = solicitud_service.get_query_optimizada(db)

    # Aplicación de reglas de visibilidad y control de acceso
    if not check_es_administrador(current_user):
        if user_es_de_infraestructura(current_user):
            # Personal de Infraestructura
            if not es_director(current_user):
                # Analistas de infraestructura ven las que ya entraron a su órbita o las de su propio departamento
                query = query.filter(
                    or_(
                        solicitudes_aprobadas_infraestructura_filtro(),
                        Solicitudes.id_departamento_solicitante == get_user_department_id(current_user)
                    )
                )
            # El Director de Infraestructura tiene acceso global de supervisión (sin filtros de área)
        else:
            # Personal de Departamentos Solicitantes (Analista o Director)
            user_dep_id = get_user_department_id(current_user)
            if user_dep_id:
                query = query.filter(Solicitudes.id_departamento_solicitante == user_dep_id)
            elif current_user.empleado:
                query = query.filter(Solicitudes.id_empleado_solicita == current_user.empleado.id)
            else:
                return []

    # Filtros adicionales opcionales
    if estado and estado.upper() != "ALL":
        query = query.filter(func.lower(Solicitudes.estado) == estado.lower())

    if id_departamento:
        query = query.filter(Solicitudes.id_departamento_solicitante == id_departamento)

    if search:
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(Solicitudes.numero_solicitud).like(term),
                func.lower(Solicitudes.motivo_justificacion).like(term),
                func.lower(Solicitudes.observaciones_despacho).like(term),
                func.lower(Solicitudes.observaciones_entrega).like(term),
            )
        )

    return query.order_by(Solicitudes.fecha_solicitud.desc()).offset(skip).limit(limit).all()


def solicitudes_aprobadas_infraestructura_filtro():
    """Filtro para solicitudes visibles para analistas de infraestructura."""
    return or_(
        (Solicitudes.estado == "Abierto") & (Solicitudes.aprobada_por_director == True),
        Solicitudes.estado.in_(["En Proceso", "Entrega en Camino", "Cerrado"])
    )


# ============================================================================
# 2. SUBIDA INDEPENDIENTE DE EVIDENCIAS FOTOGRÁFICAS
# ============================================================================

@router.post("/upload-evidencia", summary="Subir fotografía de evidencia (comprobante o conformidad)")
def upload_evidencia(
    file: UploadFile = File(..., description="Archivo de imagen (JPG, PNG o WEBP)"),
    current_user: Usuarios = Depends(get_current_user)
):
    """
    Guarda una imagen en el servidor de archivos estáticos y retorna su URL pública accesible.
    """
    url = solicitud_service.guardar_archivo_evidencia(file)
    return {
        "success": True,
        "url": url,
        "filename": file.filename,
    }


# ============================================================================
# 3. CONSULTA INDIVIDUAL
# ============================================================================

@router.get("/{id_solicitud}", response_model=SolicitudResponse, summary="Obtener detalle completo de solicitud")
def get_solicitud(
    id_solicitud: int,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    """Retorna la solicitud con su trazabilidad completa, aprobaciones, despachos y evidencias."""
    solicitud = solicitud_service.get_solicitud_by_id(db, id_solicitud)

    # Validar permisos de lectura
    if not check_es_administrador(current_user):
        if not user_es_de_infraestructura(current_user):
            user_dep_id = get_user_department_id(current_user)
            if user_dep_id and solicitud.id_departamento_solicitante != user_dep_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No tiene autorización para visualizar solicitudes de otro departamento."
                )

    return solicitud


# ============================================================================
# 4. CREACIÓN Y APROBACIÓN INTERNA (ESTADO 'ABIERTO')
# ============================================================================

@router.post("/", response_model=SolicitudResponse, status_code=status.HTTP_201_CREATED, summary="Crear solicitud de material")
def create_solicitud(
    solicitud_in: SolicitudCreate,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    """
    Paso 1: Creación y Aprobación Interna -> Estado 'Abierto'
    - Si la crea un Analista: Registra los ítems requeridos. Queda pendiente de aprobación interna
      (aprobada_por_director = False) hasta que el Director de su departamento la revise.
    - Si la crea directamente el Director del Departamento Solicitante: Al ser la máxima autoridad de la
      unidad, nace automáticamente aprobada (aprobada_por_director = True) en estado 'Abierto' hacia Infraestructura.
    """
    return solicitud_service.crear_solicitud(db=db, solicitud_in=solicitud_in, current_user=current_user)


@router.post("/{id_solicitud}/aprobar-director", response_model=SolicitudResponse, summary="Aprobación interna por Director Solicitante")
def aprobar_solicitud_director(
    id_solicitud: int,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    """
    Paso 1 (Transición): El Director del Departamento Solicitante revisa y aprueba internamente la solicitud
    de su analista, enviándola formalmente al Departamento de Infraestructura en estado 'Abierto'.
    """
    return solicitud_service.aprobar_por_director_solicitante(
        db=db,
        id_solicitud=id_solicitud,
        current_user=current_user
    )


# ============================================================================
# 5. ACEPTACIÓN POR INFRAESTRUCTURA (ESTADO 'EN PROCESO')
# ============================================================================

@router.post("/{id_solicitud}/aceptar-infraestructura", response_model=SolicitudResponse, summary="Aceptación por Director de Infraestructura")
def aceptar_solicitud_infraestructura(
    id_solicitud: int,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    """
    Paso 2: Aceptación por Infraestructura -> Estado 'En Proceso'
    El Director del Departamento de Infraestructura visualiza solicitudes en estado 'Abierto'
    aprobadas por su departamento, verifica disponibilidad y las acepta para ejecución operativa.
    """
    return solicitud_service.aceptar_por_infraestructura(
        db=db,
        id_solicitud=id_solicitud,
        current_user=current_user
    )


# ============================================================================
# 6. RECOLECCIÓN, DESCUENTO DE STOCK Y COMPROBANTE (ESTADO 'ENTREGA EN CAMINO')
# ============================================================================

@router.post("/{id_solicitud}/despachar", response_model=SolicitudResponse, summary="Despachar, descontar inventario y adjuntar comprobante")
def despachar_solicitud(
    id_solicitud: int,
    foto_comprobante: Optional[UploadFile] = File(None, description="Fotografía como comprobante de despacho físico"),
    comprobante_url: Optional[str] = Form(None, description="URL previa del comprobante si ya fue subido"),
    observaciones: Optional[str] = Form(None, description="Observaciones o notas de recolección y despacho"),
    items_json: Optional[str] = Form(None, description="JSON array con [{id_producto, cantidad_despachada, id_almacen_despacho}]"),
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    """
    Paso 3: Recolección, Descuento de Stock y Comprobante -> Estado 'Entrega en Camino'
    - Analista o Director del Departamento de Infraestructura ejecutan el despacho.
    - Se descuenta atómicamente el inventario de los almacenes especializados correspondientes.
    - Se asientan movimientos de salida en el Kardex.
    - Se exige obligatoriamente la fotografía como comprobante de despacho.
    """
    # Determinar la URL de la evidencia fotográfica
    url_final = None
    if foto_comprobante and foto_comprobante.filename:
        url_final = solicitud_service.guardar_archivo_evidencia(foto_comprobante)
    elif comprobante_url and comprobante_url.strip():
        url_final = comprobante_url.strip()

    if not url_final:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Validación crítica: Es obligatorio adjuntar una fotografía como comprobante de despacho."
        )

    # Parsear desglose de despacho por ítem si fue suministrado
    items_despacho = None
    if items_json and items_json.strip():
        try:
            parsed = json.loads(items_json)
            items_despacho = [DetalleSolicitudDespachoItem(**it) for it in parsed]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Formato inválido en items_json de despacho: {str(e)}"
            )

    return solicitud_service.despachar_solicitud(
        db=db,
        id_solicitud=id_solicitud,
        current_user=current_user,
        comprobante_url=url_final,
        observaciones=observaciones,
        items_despacho=items_despacho,
    )


# ============================================================================
# 7. CONFORMIDAD Y CIERRE (ESTADO 'CERRADO')
# ============================================================================

@router.post("/{id_solicitud}/cerrar", response_model=SolicitudResponse, summary="Conformidad de entrega y cierre definitivo de solicitud")
def cerrar_solicitud(
    id_solicitud: int,
    foto_conformidad: Optional[UploadFile] = File(None, description="Fotografía de conformidad con los productos entregados"),
    comprobante_url: Optional[str] = Form(None, description="URL previa de la fotografía si ya fue subida"),
    observaciones: Optional[str] = Form(None, description="Observaciones finales de la recepción de insumos"),
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    """
    Paso 4: Conformidad y Cierre -> Estado 'Cerrado'
    - Personal del Departamento Solicitante (Analista o Director) recibe los insumos físicos.
    - Sube fotografía de conformidad obligatoria.
    - Confirma la recepción, pasando la solicitud al estado 'Cerrado'.
    - Bloquea cualquier modificación posterior.
    """
    url_final = None
    if foto_conformidad and foto_conformidad.filename:
        url_final = solicitud_service.guardar_archivo_evidencia(foto_conformidad)
    elif comprobante_url and comprobante_url.strip():
        url_final = comprobante_url.strip()

    if not url_final:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Validación crítica: Es obligatorio adjuntar una fotografía de conformidad con los productos recibidos para cerrar la solicitud."
        )

    return solicitud_service.confirmar_recepcion_y_cerrar(
        db=db,
        id_solicitud=id_solicitud,
        current_user=current_user,
        comprobante_url=url_final,
        observaciones=observaciones,
    )


# ============================================================================
# 8. ELIMINACIÓN / CANCELACIÓN EN FASE INICIAL (SOLO EN ESTADO 'ABIERTO')
# ============================================================================

@router.delete("/{id_solicitud}", status_code=status.HTTP_200_OK, summary="Cancelar o eliminar solicitud abierta")
def delete_solicitud(
    id_solicitud: int,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    """
    Permite anular o eliminar una solicitud únicamente mientras permanezca en estado 'Abierto'.
    Una vez aceptada ('En Proceso'), en tránsito ('Entrega en Camino') o cerrada ('Cerrado'),
    queda estrictamente protegida por reglas de auditoría y trazabilidad de inventario.
    """
    solicitud = solicitud_service.get_solicitud_by_id(db, id_solicitud)

    if solicitud.estado != "Abierto":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede eliminar una solicitud en estado '{solicitud.estado}'. Solo se permite en estado 'Abierto'."
        )

    # Validar permisos: Creador, Director de su departamento o Administrador
    if not check_es_administrador(current_user):
        user_dep_id = get_user_department_id(current_user)
        if user_dep_id and solicitud.id_departamento_solicitante != user_dep_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permiso para eliminar una solicitud de otro departamento."
            )

    db.delete(solicitud)
    db.commit()
    return {"message": f"Solicitud #{solicitud.numero_solicitud} eliminada correctamente"}
