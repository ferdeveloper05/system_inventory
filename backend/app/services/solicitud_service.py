from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.solicitudes import Solicitudes, Detalle_solicitud
from app.models.trazabilidad import Movimientos
from app.schemas.solicitudes import SolicitudCreate
from app.services.inventario_service import inventario_service
from app.services.auditoria_service import auditoria_service


class SolicitudService:
    @staticmethod
    def crear_solicitud(db: Session, solicitud_in: SolicitudCreate, id_usuario: int) -> Solicitudes:
        """Crea una solicitud de material/activo en estado PENDIENTE."""
        existe = db.query(Solicitudes).filter(Solicitudes.numero_solicitud == solicitud_in.numero_solicitud).first()
        if existe:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe una solicitud con el número {solicitud_in.numero_solicitud}"
            )

        solicitud = Solicitudes(
            numero_solicitud=solicitud_in.numero_solicitud,
            id_empleado_solicita=solicitud_in.id_empleado_solicita,
            id_almacen_origen=solicitud_in.id_almacen_origen,
            estado="PENDIENTE",
            motivo_justificacion=solicitud_in.motivo_justificacion,
        )
        db.add(solicitud)
        db.flush()

        for item in solicitud_in.detalles:
            detalle = Detalle_solicitud(
                id_solicitud=solicitud.id,
                id_producto=item.id_producto,
                cantidad_solicitada=item.cantidad_solicitada,
                cantidad_despachada=0,
                estado_item="PENDIENTE",
            )
            db.add(detalle)

        auditoria_service.registrar(
            db=db,
            tabla_afectada="solicitudes",
            operacion="INSERT",
            registro_id=solicitud.id,
            datos_anteriores=None,
            datos_nuevos={"numero_solicitud": solicitud.numero_solicitud, "estado": "PENDIENTE"},
            id_usuario=id_usuario,
        )

        db.commit()
        db.refresh(solicitud)
        return solicitud

    @staticmethod
    def despachar_solicitud(db: Session, id_solicitud: int, id_usuario: int) -> Solicitudes:
        """
        Aprueba y despacha la solicitud, descontando el inventario del almacén origen
        y registrando los movimientos de salida y trazabilidad.
        """
        solicitud = db.query(Solicitudes).filter(Solicitudes.id == id_solicitud).first()
        if not solicitud:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitud no encontrada")

        if solicitud.estado == "DESPACHADA":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La solicitud ya fue despachada")

        # Verificar y descontar cada item
        for det in solicitud.detalles:
            inventario_service.decrementar_stock(
                db=db,
                id_almacen=solicitud.id_almacen_origen,
                id_producto=det.id_producto,
                cantidad=det.cantidad_solicitada,
            )
            det.cantidad_despachada = det.cantidad_solicitada
            det.estado_item = "ATENDIDO"

            # Movimiento de SALIDA
            movimiento = Movimientos(
                tipo_movimiento="SALIDA",
                id_producto=det.id_producto,
                cantidad=det.cantidad_solicitada,
                id_almacen_origen=solicitud.id_almacen_origen,
                id_almacen_destino=None,
                id_recepcion=None,
                id_solicitud=solicitud.id,
                id_usuario=id_usuario,
                motivo=f"Despacho de Solicitud #{solicitud.numero_solicitud}",
            )
            db.add(movimiento)

        estado_anterior = solicitud.estado
        solicitud.estado = "DESPACHADA"

        auditoria_service.registrar(
            db=db,
            tabla_afectada="solicitudes",
            operacion="UPDATE",
            registro_id=solicitud.id,
            datos_anteriores={"estado": estado_anterior},
            datos_nuevos={"estado": "DESPACHADA"},
            id_usuario=id_usuario,
        )

        db.commit()
        db.refresh(solicitud)
        return solicitud


solicitud_service = SolicitudService()

