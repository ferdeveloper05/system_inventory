import os
import uuid
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional, Dict, Any

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.acceso import Departamento, Empleados, Roles, Usuarios
from app.models.catalogo import Almacenes, Productos, Inventario
from app.models.solicitudes import Solicitudes, Detalle_solicitud
from app.models.trazabilidad import Movimientos
from app.schemas.solicitudes import (
    SolicitudCreate,
    DetalleSolicitudDespachoItem,
    SolicitudStats,
)
from app.services.inventario_service import inventario_service
from app.services.auditoria_service import auditoria_service

# Directorio para almacenar fotografías y comprobantes
UPLOADS_DIR = Path(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "solicitudes")))


# ============================================================================
# FUNCIONES AUXILIARES DE ROLES Y DEPARTAMENTOS
# ============================================================================

def get_user_role_name(user: Usuarios) -> str:
    """Retorna el nombre normalizado del rol del usuario."""
    if user.is_superuser:
        return "ADMINISTRADOR"
    if user.rol and user.rol.nombre:
        return user.rol.nombre.strip().upper()
    return ""


def check_es_administrador(user: Usuarios) -> bool:
    """Verifica si el usuario autenticado tiene privilegios de administrador o superusuario."""
    if not user:
        return False
    if user.is_superuser:
        return True
    rol = get_user_role_name(user)
    return rol in ["ADMINISTRADOR", "ADMIN", "SUPERADMIN"]


def es_director(user: Usuarios) -> bool:
    """Verifica si el usuario tiene rol de Director o Administrador."""
    if check_es_administrador(user):
        return True
    rol = get_user_role_name(user)
    return "DIRECTOR" in rol


def es_analista(user: Usuarios) -> bool:
    """Verifica si el usuario tiene rol de Analista."""
    rol = get_user_role_name(user)
    return "ANALISTA" in rol


def es_departamento_infraestructura(dep_nombre: Optional[str]) -> bool:
    """Verifica si un nombre de departamento corresponde a Infraestructura / Operaciones."""
    if not dep_nombre:
        return False
    nombre_norm = dep_nombre.strip().upper()
    return "INFRAESTRUCTURA" in nombre_norm or "OPERACIONES" in nombre_norm


def get_user_department_name(user: Usuarios) -> Optional[str]:
    """Retorna el nombre del departamento asignado al empleado del usuario."""
    if user.empleado and user.empleado.departamento:
        return user.empleado.departamento.nombre
    return None


def get_user_department_id(user: Usuarios) -> Optional[int]:
    """Retorna el ID del departamento asignado al empleado del usuario."""
    if user.empleado:
        return user.empleado.id_departamento
    return None


def user_es_de_infraestructura(user: Usuarios) -> bool:
    """Determina si el usuario pertenece al departamento de infraestructura o es Administrador."""
    if check_es_administrador(user):
        return True
    return es_departamento_infraestructura(get_user_department_name(user))


# ============================================================================
# SERVICIO PRINCIPAL DE SOLICITUDES Y DESPACHO
# ============================================================================

class SolicitudService:

    @staticmethod
    def guardar_archivo_evidencia(file: UploadFile) -> str:
        """
        Almacena de forma segura en disco la evidencia fotográfica y retorna la URL pública.
        """
        UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
        extension = Path(file.filename).suffix if file.filename else ".jpg"
        if not extension or extension.lower() not in [".jpg", ".jpeg", ".png", ".webp"]:
            extension = ".jpg"
        
        safe_filename = f"{uuid.uuid4().hex}_{datetime.now().strftime('%Y%m%d%H%M%S')}{extension}"
        file_path = UPLOADS_DIR / safe_filename
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return f"/uploads/solicitudes/{safe_filename}"

    @classmethod
    def get_query_optimizada(cls, db: Session):
        """Retorna la consulta base con todas las relaciones cargadas eficientemente."""
        return (
            db.query(Solicitudes)
            .options(
                joinedload(Solicitudes.empleado_solicita).joinedload(Empleados.departamento),
                joinedload(Solicitudes.departamento_solicitante),
                joinedload(Solicitudes.almacen_origen),
                joinedload(Solicitudes.director_aprueba).joinedload(Usuarios.empleado),
                joinedload(Solicitudes.director_infraestructura).joinedload(Usuarios.empleado),
                joinedload(Solicitudes.usuario_despacha).joinedload(Usuarios.empleado),
                joinedload(Solicitudes.usuario_recibe).joinedload(Usuarios.empleado),
                selectinload(Solicitudes.detalles)
                .joinedload(Detalle_solicitud.producto)
                .joinedload(Productos.categoria),
                selectinload(Solicitudes.detalles)
                .joinedload(Detalle_solicitud.almacen_despacho),
            )
        )

    @classmethod
    def get_solicitud_by_id(cls, db: Session, id_solicitud: int) -> Solicitudes:
        """Busca una solicitud por su ID con todas sus relaciones cargadas."""
        solicitud = cls.get_query_optimizada(db).filter(Solicitudes.id == id_solicitud).first()
        if not solicitud:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Solicitud con ID {id_solicitud} no encontrada."
            )
        return solicitud

    @classmethod
    def crear_solicitud(
        cls,
        db: Session,
        solicitud_in: SolicitudCreate,
        current_user: Usuarios
    ) -> Solicitudes:
        """
        Paso 1: Creación y Aprobación Interna -> Estado 'Abierto'
        - Si la crea un Analista: estado 'Abierto' con aprobada_por_director = False.
        - Si la crea un Director: estado 'Abierto' con aprobada_por_director = True.
        """
        if not solicitud_in.detalles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La solicitud debe incluir al menos un producto."
            )

        # 1. Determinar empleado y departamento solicitante
        id_empleado = solicitud_in.id_empleado_solicita
        id_departamento = None

        if not id_empleado:
            if current_user.empleado:
                id_empleado = current_user.empleado.id
                id_departamento = current_user.empleado.id_departamento
            else:
                # Si el usuario es admin y no tiene empleado asignado, buscar primer empleado o rechazar
                primer_emp = db.query(Empleados).filter(Empleados.activo == True).first()
                if primer_emp:
                    id_empleado = primer_emp.id
                    id_departamento = primer_emp.id_departamento
                else:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="No se encontró un empleado activo para asociar a la solicitud."
                    )
        else:
            emp = db.query(Empleados).filter(Empleados.id == id_empleado).first()
            if not emp:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empleado solicitante no existe.")
            id_departamento = emp.id_departamento

        # 2. Determinar almacén origen base
        id_almacen_origen = solicitud_in.id_almacen_origen
        if not id_almacen_origen:
            almacen_gen = db.query(Almacenes).filter(Almacenes.activo == True).first()
            if not almacen_gen:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No existen almacenes configurados.")
            id_almacen_origen = almacen_gen.id

        # 3. Generar número único de solicitud si no se suministró
        numero_solicitud = solicitud_in.numero_solicitud
        if not numero_solicitud:
            now_str = datetime.now().strftime("%Y%m%d")
            random_suf = uuid.uuid4().hex[:4].upper()
            numero_solicitud = f"SOL-{now_str}-{random_suf}"

        # Validar duplicado
        if db.query(Solicitudes).filter(Solicitudes.numero_solicitud == numero_solicitud).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe una solicitud con el número {numero_solicitud}."
            )

        # 4. Jerarquía de Aprobación Interna según rol
        es_director_creador = es_director(current_user)
        ahora = datetime.now(timezone.utc)

        if es_director_creador:
            # Director: Nace automáticamente aprobada
            aprobada_director = True
            id_director_aprueba = current_user.id
            fecha_aprobacion = ahora
            operacion_audit = "CREACION_Y_AUTOAPROBACION_DIRECTOR"
        else:
            # Analista: Pendiente de aprobación interna del Director de su departamento
            aprobada_director = False
            id_director_aprueba = None
            fecha_aprobacion = None
            operacion_audit = "CREACION_SOLICITUD_ANALISTA"

        solicitud = Solicitudes(
            numero_solicitud=numero_solicitud,
            id_empleado_solicita=id_empleado,
            id_departamento_solicitante=id_departamento,
            id_almacen_origen=id_almacen_origen,
            fecha_solicitud=ahora,
            estado="Abierto",
            motivo_justificacion=solicitud_in.motivo_justificacion,
            aprobada_por_director=aprobada_director,
            id_director_aprueba=id_director_aprueba,
            fecha_aprobacion_director=fecha_aprobacion,
        )
        db.add(solicitud)
        db.flush()

        # 5. Insertar ítems
        for item in solicitud_in.detalles:
            if item.cantidad_solicitada <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="La cantidad solicitada de cada ítem debe ser mayor a cero."
                )
            prod = db.query(Productos).filter(Productos.id == item.id_producto).first()
            if not prod:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto con ID {item.id_producto} no existe."
                )

            alm_despacho = item.id_almacen_despacho or prod.id_almacen_predeterminado or id_almacen_origen

            detalle = Detalle_solicitud(
                id_solicitud=solicitud.id,
                id_producto=item.id_producto,
                cantidad_solicitada=item.cantidad_solicitada,
                cantidad_despachada=0,
                estado_item="PENDIENTE",
                id_almacen_despacho=alm_despacho,
                observaciones_item=item.observaciones_item,
            )
            db.add(detalle)

        # 6. Registrar en Bitácora de Auditoría
        auditoria_service.registrar(
            db=db,
            tabla_afectada="solicitudes",
            operacion=operacion_audit,
            registro_id=solicitud.id,
            datos_anteriores=None,
            datos_nuevos={
                "numero_solicitud": solicitud.numero_solicitud,
                "estado": "Abierto",
                "aprobada_por_director": aprobada_director,
                "usuario_creador": current_user.username,
                "rol": get_user_role_name(current_user),
                "departamento": get_user_department_name(current_user),
                "items_count": len(solicitud_in.detalles),
            },
            id_usuario=current_user.id,
        )

        db.commit()
        return cls.get_solicitud_by_id(db, solicitud.id)

    @classmethod
    def aprobar_por_director_solicitante(
        cls,
        db: Session,
        id_solicitud: int,
        current_user: Usuarios
    ) -> Solicitudes:
        """
        Paso 1 (Aprobación Interna):
        El Director del Departamento Solicitante aprueba la solicitud de su Analista.
        Pasa formalmente al estado 'Abierto' hacia el Departamento de Infraestructura.
        """
        solicitud = cls.get_solicitud_by_id(db, id_solicitud)

        if solicitud.estado != "Abierto":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No se puede aprobar internamente una solicitud en estado '{solicitud.estado}'."
            )

        if solicitud.aprobada_por_director:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La solicitud ya ha sido aprobada previamente por el Director de la unidad."
            )

        # Validación de jerarquía: Debe ser Director o Administrador
        if not es_director(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operación restringida: Solo un Director de departamento o Administrador puede aprobar internamente esta solicitud."
            )

        # Validación de departamento: Debe coincidir con el departamento solicitante (salvo administrador)
        if not check_es_administrador(current_user):
            user_dep_id = get_user_department_id(current_user)
            if user_dep_id and solicitud.id_departamento_solicitante and user_dep_id != solicitud.id_departamento_solicitante:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Operación no autorizada: Solo el Director del mismo Departamento Solicitante o un Administrador puede aprobar esta petición."
                )

        solicitud.aprobada_por_director = True
        solicitud.id_director_aprueba = current_user.id
        solicitud.fecha_aprobacion_director = datetime.now(timezone.utc)
        solicitud.estado = "Abierto"

        auditoria_service.registrar(
            db=db,
            tabla_afectada="solicitudes",
            operacion="APROBACION_DIRECTOR_SOLICITANTE",
            registro_id=solicitud.id,
            datos_anteriores={"aprobada_por_director": False},
            datos_nuevos={
                "aprobada_por_director": True,
                "estado": "Abierto",
                "director_aprobador": current_user.username,
                "rol": get_user_role_name(current_user),
                "departamento": get_user_department_name(current_user),
            },
            id_usuario=current_user.id,
        )

        db.commit()
        return cls.get_solicitud_by_id(db, solicitud.id)

    @classmethod
    def aceptar_por_infraestructura(
        cls,
        db: Session,
        id_solicitud: int,
        current_user: Usuarios
    ) -> Solicitudes:
        """
        Paso 2: Aceptación por Infraestructura -> Estado 'En Proceso'
        El Director del Departamento de Infraestructura visualiza solicitudes en estado 'Abierto'
        aprobadas por su respectivo director y las acepta.
        """
        solicitud = cls.get_solicitud_by_id(db, id_solicitud)

        if solicitud.estado != "Abierto":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"La solicitud se encuentra en estado '{solicitud.estado}'. Solo se pueden aceptar solicitudes en estado 'Abierto'."
            )

        if not solicitud.aprobada_por_director:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La solicitud no ha sido aprobada formalmente por el Director del Departamento Solicitante."
            )

        # Validación de jerarquía: Debe ser Director y de Infraestructura (o Administrador)
        if not check_es_administrador(current_user):
            if not es_director(current_user):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Solo el Director de Infraestructura o Administrador tiene autoridad para aceptar solicitudes."
                )
            if not user_es_de_infraestructura(current_user):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Operación no autorizada: Solo el personal del Departamento de Infraestructura puede aceptar solicitudes."
                )

        solicitud.estado = "En Proceso"
        solicitud.id_director_infraestructura = current_user.id
        solicitud.fecha_aceptacion_infraestructura = datetime.now(timezone.utc)

        auditoria_service.registrar(
            db=db,
            tabla_afectada="solicitudes",
            operacion="ACEPTACION_INFRAESTRUCTURA",
            registro_id=solicitud.id,
            datos_anteriores={"estado": "Abierto"},
            datos_nuevos={
                "estado": "En Proceso",
                "director_infraestructura": current_user.username,
                "rol": get_user_role_name(current_user),
                "departamento": get_user_department_name(current_user),
            },
            id_usuario=current_user.id,
        )

        db.commit()
        return cls.get_solicitud_by_id(db, solicitud.id)

    @classmethod
    def despachar_solicitud(
        cls,
        db: Session,
        id_solicitud: int,
        current_user: Usuarios,
        comprobante_url: str,
        observaciones: Optional[str] = None,
        items_despacho: Optional[List[DetalleSolicitudDespachoItem]] = None,
    ) -> Solicitudes:
        """
        Paso 3: Recolección, Descuento de Stock y Comprobante -> Estado 'Entrega en Camino'
        - Analista o Director de Infraestructura ejecutan la recolección y despacho.
        - Descuenta atómicamente el stock físico de cada almacén especializado.
        - Registra movimientos de salida en el Kardex.
        - Exige fotografía como comprobante de despacho.
        """
        solicitud = cls.get_solicitud_by_id(db, id_solicitud)

        if solicitud.estado == "Cerrado":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La solicitud está Cerrada. Cualquier modificación posterior se encuentra bloqueada."
            )

        if solicitud.estado == "Entrega en Camino":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La solicitud ya fue despachada y se encuentra en camino de entrega."
            )

        if solicitud.estado != "En Proceso":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"La solicitud debe estar en estado 'En Proceso' para poder ejecutarse el despacho. Estado actual: '{solicitud.estado}'."
            )

        # Validación de roles: Tanto un Analista como el propio Director de Infraestructura (o Superadmin)
        if not user_es_de_infraestructura(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operación no autorizada: Solo el equipo del Departamento de Infraestructura (Analista o Director) puede despachar insumos."
            )

        # Validación crítica de evidencia fotográfica
        if not comprobante_url or not comprobante_url.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Es obligatorio adjuntar una fotografía como comprobante del despacho físico de materiales."
            )

        # Mapa de ítems a despachar si se enviaron detalles específicos
        items_map: Dict[int, DetalleSolicitudDespachoItem] = {}
        if items_despacho:
            for it in items_despacho:
                items_map[it.id_producto] = it

        ahora = datetime.now(timezone.utc)
        dep_solicitante_nombre = (
            solicitud.departamento_solicitante.nombre
            if solicitud.departamento_solicitante
            else f"Dep #{solicitud.id_departamento_solicitante}"
        )

        # Procesar y descontar stock atómicamente para cada ítem
        resumen_despacho = []
        for det in solicitud.detalles:
            cant_a_despachar = det.cantidad_solicitada
            almacen_id = det.id_almacen_despacho or solicitud.id_almacen_origen

            if det.id_producto in items_map:
                override = items_map[det.id_producto]
                cant_a_despachar = override.cantidad_despachada
                almacen_id = override.id_almacen_despacho
                if override.observaciones_item:
                    det.observaciones_item = override.observaciones_item

            if cant_a_despachar <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"La cantidad despachada para el producto ID {det.id_producto} debe ser mayor a cero."
                )

            # Verificar y descontar stock en el almacén especializado
            inventario_service.decrementar_stock(
                db=db,
                id_almacen=almacen_id,
                id_producto=det.id_producto,
                cantidad=cant_a_despachar,
            )

            det.cantidad_despachada = cant_a_despachar
            det.id_almacen_despacho = almacen_id
            det.estado_item = "ATENDIDO"

            # Registrar movimiento de SALIDA en Kardex
            movimiento = Movimientos(
                tipo_movimiento="SALIDA",
                id_producto=det.id_producto,
                cantidad=cant_a_despachar,
                id_almacen_origen=almacen_id,
                id_almacen_destino=None,
                id_recepcion=None,
                id_solicitud=solicitud.id,
                id_usuario=current_user.id,
                motivo=f"Despacho Solicitud #{solicitud.numero_solicitud} hacia {dep_solicitante_nombre}",
            )
            db.add(movimiento)

            resumen_despacho.append({
                "id_producto": det.id_producto,
                "cantidad": cant_a_despachar,
                "id_almacen": almacen_id,
            })

        # Actualizar estado de la solicitud
        solicitud.estado = "Entrega en Camino"
        solicitud.id_usuario_despacha = current_user.id
        solicitud.fecha_despacho = ahora
        solicitud.comprobante_despacho_url = comprobante_url.strip()
        if observaciones:
            solicitud.observaciones_despacho = observaciones.strip()

        auditoria_service.registrar(
            db=db,
            tabla_afectada="solicitudes",
            operacion="DESPACHO_ENTREGA_EN_CAMINO",
            registro_id=solicitud.id,
            datos_anteriores={"estado": "En Proceso"},
            datos_nuevos={
                "estado": "Entrega en Camino",
                "comprobante_despacho": solicitud.comprobante_despacho_url,
                "despachado_por": current_user.username,
                "rol": get_user_role_name(current_user),
                "departamento": get_user_department_name(current_user),
                "items_despachados": resumen_despacho,
            },
            id_usuario=current_user.id,
        )

        db.commit()
        return cls.get_solicitud_by_id(db, solicitud.id)

    @classmethod
    def confirmar_recepcion_y_cerrar(
        cls,
        db: Session,
        id_solicitud: int,
        current_user: Usuarios,
        comprobante_url: str,
        observaciones: Optional[str] = None
    ) -> Solicitudes:
        """
        Paso 4: Conformidad y Cierre -> Estado 'Cerrado'
        - El personal del Departamento Solicitante (Analista o Director) recibe insumos.
        - Exige fotografía de conformidad con los productos entregados.
        - Pasa a 'Cerrado' y bloquea modificaciones posteriores.
        """
        solicitud = cls.get_solicitud_by_id(db, id_solicitud)

        if solicitud.estado == "Cerrado":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La solicitud ya se encuentra Cerrada y confirmada."
            )

        if solicitud.estado != "Entrega en Camino":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Solo se puede dar conformidad a solicitudes en estado 'Entrega en Camino'. Estado actual: '{solicitud.estado}'."
            )

        # Validación: Solo personal del Departamento Solicitante (o Administrador)
        if not check_es_administrador(current_user):
            user_dep_id = get_user_department_id(current_user)
            if user_dep_id and solicitud.id_departamento_solicitante and user_dep_id != solicitud.id_departamento_solicitante:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Operación no autorizada: Solo el personal del Departamento Solicitante o un Administrador puede firmar conformidad y cerrar la solicitud."
                )

        # Validación crítica de evidencia fotográfica de conformidad
        if not comprobante_url or not comprobante_url.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Es obligatorio adjuntar una fotografía de conformidad con los productos entregados para cerrar la solicitud."
            )

        ahora = datetime.now(timezone.utc)
        solicitud.estado = "Cerrado"
        solicitud.id_usuario_recibe = current_user.id
        solicitud.fecha_cierre = ahora
        solicitud.comprobante_entrega_url = comprobante_url.strip()
        if observaciones:
            solicitud.observaciones_entrega = observaciones.strip()

        auditoria_service.registrar(
            db=db,
            tabla_afectada="solicitudes",
            operacion="CIERRE_CONFORMIDAD_ENTREGA",
            registro_id=solicitud.id,
            datos_anteriores={"estado": "Entrega en Camino"},
            datos_nuevos={
                "estado": "Cerrado",
                "comprobante_entrega": solicitud.comprobante_entrega_url,
                "recibido_por": current_user.username,
                "rol": get_user_role_name(current_user),
                "departamento": get_user_department_name(current_user),
                "fecha_cierre": ahora.isoformat(),
            },
            id_usuario=current_user.id,
        )

        db.commit()
        return cls.get_solicitud_by_id(db, solicitud.id)

    @classmethod
    def get_stats(cls, db: Session, current_user: Usuarios) -> SolicitudStats:
        """
        Retorna estadísticas clave del módulo con control de permisos y visibilidad:
        Director de Infraestructura y Admin ven globales; otros ven su departamento.
        """
        query = db.query(Solicitudes)

        # Si no es de infraestructura ni admin, filtrar por su departamento
        if not user_es_de_infraestructura(current_user):
            user_dep_id = get_user_department_id(current_user)
            if user_dep_id:
                query = query.filter(Solicitudes.id_departamento_solicitante == user_dep_id)

        total = query.count()
        abiertas = query.filter(Solicitudes.estado == "Abierto").count()
        pendientes_dir = query.filter(Solicitudes.estado == "Abierto", Solicitudes.aprobada_por_director == False).count()
        listas_infra = query.filter(Solicitudes.estado == "Abierto", Solicitudes.aprobada_por_director == True).count()
        en_proceso = query.filter(Solicitudes.estado == "En Proceso").count()
        en_camino = query.filter(Solicitudes.estado == "Entrega en Camino").count()
        cerradas = query.filter(Solicitudes.estado == "Cerrado").count()

        return SolicitudStats(
            total_solicitudes=total,
            total_abiertas=abiertas,
            total_pendientes_aprobacion_director=pendientes_dir,
            total_listas_para_infraestructura=listas_infra,
            total_en_proceso=en_proceso,
            total_entrega_en_camino=en_camino,
            total_cerradas=cerradas,
        )


solicitud_service = SolicitudService()
