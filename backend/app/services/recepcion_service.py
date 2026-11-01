from typing import Optional
from sqlalchemy.orm import Session, joinedload, selectinload
from fastapi import HTTPException, status
from app.models.compras import Recepciones, Detalle_recepcion
from app.models.trazabilidad import Movimientos
from app.schemas.recepciones import RecepcionCreate
from app.services.inventario_service import inventario_service
from app.services.auditoria_service import auditoria_service


class RecepcionService:
    @staticmethod
    def crear_recepcion(db: Session, recepcion_in: RecepcionCreate, id_usuario: int) -> Recepciones:
        """
        Registra una recepción de mercancía, incrementa el inventario en el almacén destino,
        crea los movimientos de trazabilidad y audita la operación de forma atómica.
        """
        if not recepcion_in.detalles or len(recepcion_in.detalles) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La recepción debe incluir al menos un producto en el detalle."
            )

        # Verificar si ya existe el número de recepción
        clean_numero = recepcion_in.numero_recepcion.strip().upper()
        existe = db.query(Recepciones).filter(Recepciones.numero_recepcion == clean_numero).first()
        if existe:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe una recepción con el número {clean_numero}"
            )

        recepcion = Recepciones(
            numero_recepcion=clean_numero,
            id_orden_compra=recepcion_in.id_orden_compra,
            id_almacen=recepcion_in.id_almacen,
            id_empleado_recibe=recepcion_in.id_empleado_recibe,
            estado=recepcion_in.estado or "COMPLETADA",
            observaciones=recepcion_in.observaciones,
        )
        db.add(recepcion)
        db.flush()

        # Procesar items
        total_items = 0
        for det in recepcion_in.detalles:
            if det.cantidad_recibida <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"La cantidad recibida para cada producto debe ser mayor a 0."
                )

            detalle = Detalle_recepcion(
                id_recepcion=recepcion.id,
                id_producto=det.id_producto,
                cantidad_recibida=det.cantidad_recibida,
                estado_producto=det.estado_producto or "CONFORME",
                observaciones=det.observaciones,
            )
            db.add(detalle)
            total_items += det.cantidad_recibida

            # Incrementar stock únicamente si el estado de la recepción es COMPLETADA
            if recepcion.estado == "COMPLETADA":
                inventario_service.incrementar_stock(
                    db=db,
                    id_almacen=recepcion.id_almacen,
                    id_producto=det.id_producto,
                    cantidad=det.cantidad_recibida,
                )

                # Registrar Movimiento de entrada para trazabilidad (Kardex)
                movimiento = Movimientos(
                    tipo_movimiento="ENTRADA",
                    id_producto=det.id_producto,
                    cantidad=det.cantidad_recibida,
                    id_almacen_origen=None,
                    id_almacen_destino=recepcion.id_almacen,
                    id_recepcion=recepcion.id,
                    id_solicitud=None,
                    id_usuario=id_usuario,
                    motivo=f"Entrada por Recepción #{recepcion.numero_recepcion} ({det.estado_producto})",
                )
                db.add(movimiento)

        # Auditoría
        auditoria_service.registrar(
            db=db,
            tabla_afectada="recepciones",
            operacion="INSERT",
            registro_id=recepcion.id,
            datos_anteriores=None,
            datos_nuevos={
                "numero_recepcion": recepcion.numero_recepcion,
                "id_almacen": recepcion.id_almacen,
                "id_empleado_recibe": recepcion.id_empleado_recibe,
                "estado": recepcion.estado,
                "total_productos": len(recepcion_in.detalles),
                "total_unidades": total_items,
            },
            id_usuario=id_usuario,
        )

        db.commit()

        # Recargar con relaciones completas
        return (
            db.query(Recepciones)
            .options(
                joinedload(Recepciones.almacen),
                joinedload(Recepciones.empleado_recibe),
                selectinload(Recepciones.detalles).joinedload(Detalle_recepcion.producto)
            )
            .filter(Recepciones.id == recepcion.id)
            .first()
        )

    @staticmethod
    def anular_recepcion(db: Session, id_recepcion: int, id_usuario: int, motivo: Optional[str] = None) -> Recepciones:
        """
        Anula una recepción existente. Si la recepción estaba completada, revierte el stock
        en el inventario y genera los movimientos de egreso/ajuste correspondientes.
        """
        recepcion = (
            db.query(Recepciones)
            .options(
                joinedload(Recepciones.detalles),
                joinedload(Recepciones.almacen),
                joinedload(Recepciones.empleado_recibe)
            )
            .filter(Recepciones.id == id_recepcion)
            .first()
        )

        if not recepcion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Recepción con ID {id_recepcion} no encontrada."
            )

        if recepcion.estado == "ANULADA":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"La recepción #{recepcion.numero_recepcion} ya se encuentra anulada."
            )

        estado_anterior = recepcion.estado

        # Si estaba completada, revertir el inventario ingresado
        if estado_anterior == "COMPLETADA":
            for det in recepcion.detalles:
                inventario_service.decrementar_stock(
                    db=db,
                    id_almacen=recepcion.id_almacen,
                    id_producto=det.id_producto,
                    cantidad=det.cantidad_recibida,
                )

                # Registrar movimiento de salida por anulación
                movimiento = Movimientos(
                    tipo_movimiento="SALIDA",
                    id_producto=det.id_producto,
                    cantidad=det.cantidad_recibida,
                    id_almacen_origen=recepcion.id_almacen,
                    id_almacen_destino=None,
                    id_recepcion=recepcion.id,
                    id_solicitud=None,
                    id_usuario=id_usuario,
                    motivo=f"Anulación de Recepción #{recepcion.numero_recepcion}. Razón: {motivo or 'Reversión de ingreso'}",
                )
                db.add(movimiento)

        recepcion.estado = "ANULADA"
        if motivo:
            nota = f"[ANULACIÓN {id_usuario}]: {motivo.strip()}"
            recepcion.observaciones = f"{recepcion.observaciones}\n{nota}" if recepcion.observaciones else nota

        auditoria_service.registrar(
            db=db,
            tabla_afectada="recepciones",
            operacion="UPDATE",
            registro_id=recepcion.id,
            datos_anteriores={"estado": estado_anterior},
            datos_nuevos={"estado": "ANULADA", "motivo": motivo},
            id_usuario=id_usuario,
        )

        db.commit()

        return (
            db.query(Recepciones)
            .options(
                joinedload(Recepciones.almacen),
                joinedload(Recepciones.empleado_recibe),
                selectinload(Recepciones.detalles).joinedload(Detalle_recepcion.producto)
            )
            .filter(Recepciones.id == recepcion.id)
            .first()
        )

    @staticmethod
    def obtener_por_id(db: Session, id_recepcion: int) -> Optional[Recepciones]:
        """Obtiene una recepción por su ID con todas sus relaciones cargadas."""
        return (
            db.query(Recepciones)
            .options(
                joinedload(Recepciones.almacen),
                joinedload(Recepciones.empleado_recibe),
                selectinload(Recepciones.detalles).joinedload(Detalle_recepcion.producto)
            )
            .filter(Recepciones.id == id_recepcion)
            .first()
        )


recepcion_service = RecepcionService()
