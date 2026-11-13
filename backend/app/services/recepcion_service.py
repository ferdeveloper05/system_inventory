from typing import Optional
from sqlalchemy.orm import Session, joinedload, selectinload
from fastapi import HTTPException, status
from app.models.compras import Recepciones, Detalle_recepcion, Ordenes_Compra
from app.models.catalogo import Almacenes, Productos
from app.models.acceso import Empleados
from app.models.trazabilidad import Movimientos
from app.schemas.recepciones import RecepcionCreate, RecepcionUpdate
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

        # 1. Validar que el número de recepción no esté duplicado
        clean_numero = recepcion_in.numero_recepcion.strip().upper()
        existe = db.query(Recepciones).filter(Recepciones.numero_recepcion == clean_numero).first()
        if existe:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe una recepción registrada con el número {clean_numero}."
            )

        # 2. Validar existencia del almacén de destino
        almacen = db.query(Almacenes).filter(Almacenes.id == recepcion_in.id_almacen).first()
        if not almacen:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El almacén de destino seleccionado (ID #{recepcion_in.id_almacen}) no existe."
            )

        # 3. Validar existencia del empleado receptor
        empleado = db.query(Empleados).filter(Empleados.id == recepcion_in.id_empleado_recibe).first()
        if not empleado:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El empleado responsable seleccionado (ID #{recepcion_in.id_empleado_recibe}) no existe."
            )

        # 4. Manejo seguro de Orden de Compra para evitar violación de Foreign Key
        valid_id_oc = None
        obs_final = recepcion_in.observaciones or ""
        if recepcion_in.id_orden_compra:
            oc = db.query(Ordenes_Compra).filter(Ordenes_Compra.id == recepcion_in.id_orden_compra).first()
            if oc:
                valid_id_oc = oc.id
            else:
                # Si no existe la OC en la tabla, se conserva la referencia en observaciones
                ref_nota = f"[Ref. OC #{recepcion_in.id_orden_compra}]"
                obs_final = f"{obs_final}\n{ref_nota}".strip() if obs_final else ref_nota

        # 5. Validar cada ítem del detalle antes de insertar
        for det in recepcion_in.detalles:
            if det.cantidad_recibida <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="La cantidad recibida para cada producto debe ser mayor a 0."
                )

            prod = db.query(Productos).filter(Productos.id == det.id_producto).first()
            if not prod:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El producto con ID #{det.id_producto} no existe en el catálogo."
                )

        # 6. Crear la cabecera de la Recepción
        recepcion = Recepciones(
            numero_recepcion=clean_numero,
            id_orden_compra=valid_id_oc,
            id_almacen=recepcion_in.id_almacen,
            id_empleado_recibe=recepcion_in.id_empleado_recibe,
            estado=recepcion_in.estado or "COMPLETADA",
            observaciones=obs_final or None,
        )
        db.add(recepcion)
        db.flush()

        # 7. Crear los ítems del detalle e incrementar stock
        total_items = 0
        for det in recepcion_in.detalles:
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

        # 8. Auditoría
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

        # 9. Recargar con todas las relaciones anidadas
        return (
            db.query(Recepciones)
            .options(
                joinedload(Recepciones.almacen),
                joinedload(Recepciones.empleado_recibe).joinedload(Empleados.departamento),
                selectinload(Recepciones.detalles)
                .joinedload(Detalle_recepcion.producto)
                .joinedload(Productos.categoria),
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
                detail=f"Recepción con ID #{id_recepcion} no encontrada."
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
                joinedload(Recepciones.empleado_recibe).joinedload(Empleados.departamento),
                selectinload(Recepciones.detalles)
                .joinedload(Detalle_recepcion.producto)
                .joinedload(Productos.categoria),
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
                joinedload(Recepciones.empleado_recibe).joinedload(Empleados.departamento),
                selectinload(Recepciones.detalles)
                .joinedload(Detalle_recepcion.producto)
                .joinedload(Productos.categoria),
            )
            .filter(Recepciones.id == id_recepcion)
            .first()
        )


    @staticmethod
    def actualizar_recepcion(
        db: Session,
        id_recepcion: int,
        recepcion_in: RecepcionUpdate,
        id_usuario: int
    ) -> Recepciones:
        """
        Permite a un administrador modificar una recepción existente, corrigiendo
        el almacén de destino, el responsable, notas o los productos y cantidades recibidas.
        Reconcilia automáticamente el inventario (descontando del almacén origen y sumando al nuevo)
        y asienta los movimientos de trazabilidad y auditoría.
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
                detail=f"Recepción con ID #{id_recepcion} no encontrada."
            )

        old_almacen_id = recepcion.id_almacen
        old_estado = recepcion.estado
        old_detalles = [{"id_producto": d.id_producto, "cantidad": d.cantidad_recibida} for d in recepcion.detalles]
        datos_anteriores = {
            "numero_recepcion": recepcion.numero_recepcion,
            "id_almacen": recepcion.id_almacen,
            "id_empleado_recibe": recepcion.id_empleado_recibe,
            "estado": recepcion.estado,
            "observaciones": recepcion.observaciones,
            "items": old_detalles
        }

        # 1. Si se actualiza el número de recepción, verificar unicidad
        if recepcion_in.numero_recepcion:
            clean_num = recepcion_in.numero_recepcion.strip().upper()
            if clean_num != recepcion.numero_recepcion:
                duplicado = db.query(Recepciones).filter(Recepciones.numero_recepcion == clean_num).first()
                if duplicado:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Ya existe otra recepción con el número {clean_num}."
                    )
                recepcion.numero_recepcion = clean_num

        # 2. Validar almacén destino objetivo
        target_almacen_id = recepcion_in.id_almacen if recepcion_in.id_almacen is not None else old_almacen_id
        if target_almacen_id != old_almacen_id:
            alm_exists = db.query(Almacenes).filter(Almacenes.id == target_almacen_id).first()
            if not alm_exists:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El nuevo almacén seleccionado (ID #{target_almacen_id}) no existe."
                )

        # 3. Validar empleado receptor si cambia
        if recepcion_in.id_empleado_recibe is not None:
            emp_exists = db.query(Empleados).filter(Empleados.id == recepcion_in.id_empleado_recibe).first()
            if not emp_exists:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El nuevo empleado seleccionado (ID #{recepcion_in.id_empleado_recibe}) no existe."
                )
            recepcion.id_empleado_recibe = recepcion_in.id_empleado_recibe

        # 4. Manejo de Orden de Compra si se modifica
        if recepcion_in.id_orden_compra is not None:
            if recepcion_in.id_orden_compra > 0:
                oc = db.query(Ordenes_Compra).filter(Ordenes_Compra.id == recepcion_in.id_orden_compra).first()
                if oc:
                    recepcion.id_orden_compra = oc.id
                else:
                    ref_nota = f"[Ref. OC #{recepcion_in.id_orden_compra}]"
                    recepcion.observaciones = f"{recepcion.observaciones}\n{ref_nota}".strip() if recepcion.observaciones else ref_nota
                    recepcion.id_orden_compra = None
            else:
                recepcion.id_orden_compra = None

        if recepcion_in.observaciones is not None:
            recepcion.observaciones = recepcion_in.observaciones.strip() if recepcion_in.observaciones else None

        target_estado = recepcion_in.estado or old_estado

        # 5. RECONCILIACIÓN DE INVENTARIO
        # Si la recepción previa estaba completada, revertimos el stock del almacén anterior
        if old_estado == "COMPLETADA":
            for old_det in recepcion.detalles:
                inventario_service.decrementar_stock(
                    db=db,
                    id_almacen=old_almacen_id,
                    id_producto=old_det.id_producto,
                    cantidad=old_det.cantidad_recibida
                )

        # Si se envían nuevos detalles de productos
        if recepcion_in.detalles is not None:
            if len(recepcion_in.detalles) == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="La recepción debe incluir al menos un producto en el detalle."
                )

            # Validar que todos los productos existan y tengan cantidad > 0
            for det in recepcion_in.detalles:
                if det.cantidad_recibida <= 0:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="La cantidad recibida para cada producto debe ser mayor a 0."
                    )
                prod = db.query(Productos).filter(Productos.id == det.id_producto).first()
                if not prod:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"El producto con ID #{det.id_producto} no existe en el catálogo."
                    )

            # Eliminar ítems anteriores
            for old_det in list(recepcion.detalles):
                db.delete(old_det)
            db.flush()

            # Agregar nuevos ítems
            for new_det in recepcion_in.detalles:
                detalle = Detalle_recepcion(
                    id_recepcion=recepcion.id,
                    id_producto=new_det.id_producto,
                    cantidad_recibida=new_det.cantidad_recibida,
                    estado_producto=new_det.estado_producto or "CONFORME",
                    observaciones=new_det.observaciones,
                )
                db.add(detalle)
            db.flush()

        # Actualizar almacén y estado
        recepcion.id_almacen = target_almacen_id
        recepcion.estado = target_estado

        # Si el nuevo estado es COMPLETADA, sumamos el stock en el nuevo almacén destino
        if target_estado == "COMPLETADA":
            for det in recepcion.detalles:
                inventario_service.incrementar_stock(
                    db=db,
                    id_almacen=target_almacen_id,
                    id_producto=det.id_producto,
                    cantidad=det.cantidad_recibida
                )

        # 6. Registrar movimiento de trazabilidad en Kardex
        if old_almacen_id != target_almacen_id:
            tipo_mov = "TRANSFERENCIA"
            motivo_mov = f"Reubicación por edición administrativa de Recepción #{recepcion.numero_recepcion} (Almacén #{old_almacen_id} -> Almacén #{target_almacen_id})"
            for det in recepcion.detalles:
                db.add(Movimientos(
                    tipo_movimiento=tipo_mov,
                    id_producto=det.id_producto,
                    cantidad=det.cantidad_recibida,
                    id_almacen_origen=old_almacen_id,
                    id_almacen_destino=target_almacen_id,
                    id_recepcion=recepcion.id,
                    id_solicitud=None,
                    id_usuario=id_usuario,
                    motivo=motivo_mov
                ))
        else:
            tipo_mov = "AJUSTE"
            motivo_mov = f"Ajuste por edición administrativa de Recepción #{recepcion.numero_recepcion}"
            for det in recepcion.detalles:
                db.add(Movimientos(
                    tipo_movimiento=tipo_mov,
                    id_producto=det.id_producto,
                    cantidad=det.cantidad_recibida,
                    id_almacen_origen=None,
                    id_almacen_destino=target_almacen_id,
                    id_recepcion=recepcion.id,
                    id_solicitud=None,
                    id_usuario=id_usuario,
                    motivo=motivo_mov
                ))

        # 7. Registrar auditoría
        auditoria_service.registrar(
            db=db,
            tabla_afectada="recepciones",
            operacion="UPDATE",
            registro_id=recepcion.id,
            datos_anteriores=datos_anteriores,
            datos_nuevos={
                "numero_recepcion": recepcion.numero_recepcion,
                "id_almacen": recepcion.id_almacen,
                "id_empleado_recibe": recepcion.id_empleado_recibe,
                "estado": recepcion.estado,
                "observaciones": recepcion.observaciones,
                "total_items": len(recepcion.detalles)
            },
            id_usuario=id_usuario
        )

        db.commit()

        return (
            db.query(Recepciones)
            .options(
                joinedload(Recepciones.almacen),
                joinedload(Recepciones.empleado_recibe).joinedload(Empleados.departamento),
                selectinload(Recepciones.detalles)
                .joinedload(Detalle_recepcion.producto)
                .joinedload(Productos.categoria),
            )
            .filter(Recepciones.id == recepcion.id)
            .first()
        )

    @staticmethod
    def eliminar_recepcion(db: Session, id_recepcion: int, id_usuario: int) -> dict:
        """
        Elimina completamente una recepción del sistema.
        Reversa el stock físico en el almacén de destino (si estaba COMPLETADA),
        desvincula movimientos de trazabilidad y registra el evento en auditoría.
        """
        recepcion = (
            db.query(Recepciones)
            .options(
                joinedload(Recepciones.detalles),
                joinedload(Recepciones.movimientos),
                joinedload(Recepciones.almacen)
            )
            .filter(Recepciones.id == id_recepcion)
            .first()
        )

        if not recepcion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Recepción con ID #{id_recepcion} no encontrada."
            )

        num_rec = recepcion.numero_recepcion
        alm_id = recepcion.id_almacen
        alm_nombre = recepcion.almacen.nombre if recepcion.almacen else f"Almacén #{alm_id}"
        detalles_info = [{"id_producto": d.id_producto, "cantidad": d.cantidad_recibida} for d in recepcion.detalles]

        datos_anteriores = {
            "numero_recepcion": num_rec,
            "id_almacen": alm_id,
            "almacen_nombre": alm_nombre,
            "estado": recepcion.estado,
            "items": detalles_info
        }

        # 1. Si estaba completada, revertir las existencias físicas en el inventario
        if recepcion.estado == "COMPLETADA":
            for det in recepcion.detalles:
                inventario_service.decrementar_stock(
                    db=db,
                    id_almacen=alm_id,
                    id_producto=det.id_producto,
                    cantidad=det.cantidad_recibida
                )

                # Registrar movimiento de salida por eliminación definitiva en el Kardex
                db.add(Movimientos(
                    tipo_movimiento="SALIDA",
                    id_producto=det.id_producto,
                    cantidad=det.cantidad_recibida,
                    id_almacen_origen=alm_id,
                    id_almacen_destino=None,
                    id_recepcion=None,
                    id_solicitud=None,
                    id_usuario=id_usuario,
                    motivo=f"Eliminación definitiva de Recepción #{num_rec} ({alm_nombre})"
                ))

        # 2. Desvincular movimientos previos para evitar violación de FK
        for mov in recepcion.movimientos:
            mov.id_recepcion = None
            mov.motivo = f"[DOC ELIMINADO] {mov.motivo or ''}".strip()

        # 3. Registrar en bitácora de auditoría
        auditoria_service.registrar(
            db=db,
            tabla_afectada="recepciones",
            operacion="DELETE",
            registro_id=id_recepcion,
            datos_anteriores=datos_anteriores,
            datos_nuevos=None,
            id_usuario=id_usuario
        )

        # 4. Eliminar el registro (cascada borra los detalles_recepcion)
        db.delete(recepcion)
        db.commit()

        return {
            "message": f"Recepción #{num_rec} eliminada completamente del sistema y stock revertido.",
            "id": id_recepcion,
            "numero_recepcion": num_rec
        }


recepcion_service = RecepcionService()
