from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.catalogo import Inventario


class InventarioService:
    @staticmethod
    def get_or_create(db: Session, id_almacen: int, id_producto: int) -> Inventario:
        """Obtiene el registro de inventario o lo inicializa si no existe aún para el par (almacen, producto)."""
        inv = db.query(Inventario).filter(
            Inventario.id_almacen == id_almacen,
            Inventario.id_producto == id_producto
        ).first()

        if not inv:
            inv = Inventario(
                id_almacen=id_almacen,
                id_producto=id_producto,
                stock_actual=0,
                stock_reservado=0
            )
            db.add(inv)
            db.flush()
        return inv

    @staticmethod
    def incrementar_stock(db: Session, id_almacen: int, id_producto: int, cantidad: int) -> Inventario:
        """Aumenta las existencias físicas de un producto en un almacén."""
        if cantidad <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La cantidad a ingresar debe ser mayor a cero"
            )
        inv = InventarioService.get_or_create(db, id_almacen, id_producto)
        inv.stock_actual += cantidad
        db.flush()
        return inv

    @staticmethod
    def decrementar_stock(db: Session, id_almacen: int, id_producto: int, cantidad: int) -> Inventario:
        """Disminuye las existencias físicas validando que no quede en negativo."""
        if cantidad <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La cantidad a descontar debe ser mayor a cero"
            )
        inv = InventarioService.get_or_create(db, id_almacen, id_producto)
        if inv.stock_actual < cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente para producto ID {id_producto}. Disponible: {inv.stock_actual}, Solicitado: {cantidad}"
            )
        inv.stock_actual -= cantidad
        db.flush()
        return inv


inventario_service = InventarioService()

