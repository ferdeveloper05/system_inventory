from sqlalchemy.orm import Session
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
        # Verificar si ya existe el número de recepción
        existe = db.query(Recepciones).filter(Recepciones.numero_recepcion == recepcion_in.numero_recepcion).first()
        if existe:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe una recepción con el número {recepcion_in.numero_recepcion}"
            )

        recepcion = Recepciones(
            numero_recepcion=recepcion_in.numero_recepcion,
            id_orden_compra=recepcion_in.id_orden_compra,
            id_almacen=recepcion_in.id_almacen,
            id_empleado_recibe=recepcion_in.id_empleado_recibe,
            estado=recepcion_in.estado,
            observaciones=recepcion_in.observaciones,
        )
        db.add(recepcion)
        db.flush()

        # Procesar items
        for det in recepcion_in.detalles:
            detalle = Detalle_recepcion(
                id_recepcion=recepcion.id,
                id_producto=det.id_producto,
                cantidad_recibida=det.cantidad_recibida,
                estado_producto=det.estado_producto,
                observaciones=det.observaciones,
            )
            db.add(detalle)

            # Incrementar stock
            inventario_service.incrementar_stock(
                db=db,
                id_almacen=recepcion.id_almacen,
                id_producto=det.id_producto,
                cantidad=det.cantidad_recibida,
            )

            # Registrar Movimiento de entrada para trazabilidad
            movimiento = Movimientos(
                tipo_movimiento="ENTRADA",
                id_producto=det.id_producto,
                cantidad=det.cantidad_recibida,
                id_almacen_origen=None,
                id_almacen_destino=recepcion.id_almacen,
                id_recepcion=recepcion.id,
                id_solicitud=None,
                id_usuario=id_usuario,
                motivo=f"Entrada por Recepción #{recepcion.numero_recepcion}",
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
                "cantidad_items": len(recepcion_in.detalles),
            },
            id_usuario=id_usuario,
        )

        db.commit()
        db.refresh(recepcion)
        return recepcion


recepcion_service = RecepcionService()

