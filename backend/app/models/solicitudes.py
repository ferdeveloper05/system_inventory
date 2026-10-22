from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Solicitudes(Base):
    __tablename__ = "solicitudes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    numero_solicitud: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    id_empleado_solicita: Mapped[int] = mapped_column(ForeignKey("empleados.id"), nullable=False)
    id_almacen_origen: Mapped[int] = mapped_column(ForeignKey("almacenes.id"), nullable=False)
    fecha_solicitud: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    estado: Mapped[str] = mapped_column(String(30), default="PENDIENTE", nullable=False)  # PENDIENTE, APROBADA, DESPACHADA, RECHAZADA, CANCELADA
    motivo_justificacion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relaciones
    empleado_solicita: Mapped["Empleados"] = relationship("Empleados", back_populates="solicitudes")
    almacen_origen: Mapped["Almacenes"] = relationship("Almacenes", back_populates="solicitudes")
    detalles: Mapped[List["Detalle_solicitud"]] = relationship("Detalle_solicitud", back_populates="solicitud", cascade="all, delete-orphan")
    movimientos: Mapped[List["Movimientos"]] = relationship("Movimientos", back_populates="solicitud")


class Detalle_solicitud(Base):
    __tablename__ = "detalle_solicitud"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    id_solicitud: Mapped[int] = mapped_column(ForeignKey("solicitudes.id"), nullable=False)
    id_producto: Mapped[int] = mapped_column(ForeignKey("productos.id"), nullable=False)
    cantidad_solicitada: Mapped[int] = mapped_column(Integer, nullable=False)
    cantidad_despachada: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    estado_item: Mapped[str] = mapped_column(String(30), default="PENDIENTE", nullable=False)  # PENDIENTE, ATENDIDO, PARCIAL, CANCELADO

    # Relaciones
    solicitud: Mapped["Solicitudes"] = relationship("Solicitudes", back_populates="detalles")
    producto: Mapped["Productos"] = relationship("Productos", back_populates="detalles_solicitud")

