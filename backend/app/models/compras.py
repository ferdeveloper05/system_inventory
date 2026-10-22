from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Integer, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Proveedores(Base):
    __tablename__ = "proveedores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    ruc_nit: Mapped[str] = mapped_column(String(30), unique=True, nullable=False, index=True)
    razon_social: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    contacto_nombre: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    telefono: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    direccion: Mapped[Optional[str]] = mapped_column(String(250), nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relaciones
    ordenes_compra: Mapped[List["Ordenes_Compra"]] = relationship("Ordenes_Compra", back_populates="proveedor")


class Ordenes_Compra(Base):
    __tablename__ = "ordenes_compra"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    numero_orden: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    id_proveedor: Mapped[int] = mapped_column(ForeignKey("proveedores.id"), nullable=False)
    fecha_emision: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    estado: Mapped[str] = mapped_column(String(30), default="PENDIENTE", nullable=False)  # PENDIENTE, APROBADA, RECEPCIONADA, CANCELADA
    total: Mapped[float] = mapped_column(Numeric(12, 2), default=0.00, nullable=False)
    observaciones: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relaciones
    proveedor: Mapped["Proveedores"] = relationship("Proveedores", back_populates="ordenes_compra")
    detalles: Mapped[List["Detalle_orden_compra"]] = relationship("Detalle_orden_compra", back_populates="orden_compra", cascade="all, delete-orphan")
    recepciones: Mapped[List["Recepciones"]] = relationship("Recepciones", back_populates="orden_compra")


class Detalle_orden_compra(Base):
    __tablename__ = "detalle_orden_compra"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    id_orden_compra: Mapped[int] = mapped_column(ForeignKey("ordenes_compra.id"), nullable=False)
    id_producto: Mapped[int] = mapped_column(ForeignKey("productos.id"), nullable=False)
    cantidad_solicitada: Mapped[int] = mapped_column(Integer, nullable=False)
    precio_unitario: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    subtotal: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)

    # Relaciones
    orden_compra: Mapped["Ordenes_Compra"] = relationship("Ordenes_Compra", back_populates="detalles")
    producto: Mapped["Productos"] = relationship("Productos", back_populates="detalles_orden")


class Recepciones(Base):
    __tablename__ = "recepciones"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    numero_recepcion: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    id_orden_compra: Mapped[Optional[int]] = mapped_column(ForeignKey("ordenes_compra.id"), nullable=True)
    id_almacen: Mapped[int] = mapped_column(ForeignKey("almacenes.id"), nullable=False)
    id_empleado_recibe: Mapped[int] = mapped_column(ForeignKey("empleados.id"), nullable=False)
    fecha_recepcion: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    estado: Mapped[str] = mapped_column(String(30), default="COMPLETADA", nullable=False)  # BORRADOR, COMPLETADA, ANULADA
    observaciones: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relaciones
    orden_compra: Mapped[Optional["Ordenes_Compra"]] = relationship("Ordenes_Compra", back_populates="recepciones")
    almacen: Mapped["Almacenes"] = relationship("Almacenes", back_populates="recepciones")
    empleado_recibe: Mapped["Empleados"] = relationship("Empleados", back_populates="recepciones")
    detalles: Mapped[List["Detalle_recepcion"]] = relationship("Detalle_recepcion", back_populates="recepcion", cascade="all, delete-orphan")
    movimientos: Mapped[List["Movimientos"]] = relationship("Movimientos", back_populates="recepcion")


class Detalle_recepcion(Base):
    __tablename__ = "detalle_recepcion"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    id_recepcion: Mapped[int] = mapped_column(ForeignKey("recepciones.id"), nullable=False)
    id_producto: Mapped[int] = mapped_column(ForeignKey("productos.id"), nullable=False)
    cantidad_recibida: Mapped[int] = mapped_column(Integer, nullable=False)
    estado_producto: Mapped[str] = mapped_column(String(50), default="CONFORME", nullable=False)  # CONFORME, DANADO, INCOMPLETO
    observaciones: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relaciones
    recepcion: Mapped["Recepciones"] = relationship("Recepciones", back_populates="detalles")
    producto: Mapped["Productos"] = relationship("Productos", back_populates="detalles_recepcion")

