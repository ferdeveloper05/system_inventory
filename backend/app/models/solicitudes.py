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
    id_departamento_solicitante: Mapped[Optional[int]] = mapped_column(ForeignKey("departamentos.id"), nullable=True, index=True)
    id_almacen_origen: Mapped[int] = mapped_column(ForeignKey("almacenes.id"), nullable=False)
    fecha_solicitud: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    estado: Mapped[str] = mapped_column(String(30), default="Abierto", nullable=False)  # Abierto, En Proceso, Entrega en Camino, Cerrado
    motivo_justificacion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # 1. Aprobación Interna por Director del Departamento Solicitante
    aprobada_por_director: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    id_director_aprueba: Mapped[Optional[int]] = mapped_column(ForeignKey("usuarios.id"), nullable=True)
    fecha_aprobacion_director: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # 2. Aceptación por Director del Departamento de Infraestructura
    id_director_infraestructura: Mapped[Optional[int]] = mapped_column(ForeignKey("usuarios.id"), nullable=True)
    fecha_aceptacion_infraestructura: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # 3. Recolección y Despacho por Infraestructura
    id_usuario_despacha: Mapped[Optional[int]] = mapped_column(ForeignKey("usuarios.id"), nullable=True)
    fecha_despacho: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    comprobante_despacho_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    observaciones_despacho: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # 4. Conformidad y Cierre por Departamento Solicitante
    id_usuario_recibe: Mapped[Optional[int]] = mapped_column(ForeignKey("usuarios.id"), nullable=True)
    fecha_cierre: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    comprobante_entrega_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    observaciones_entrega: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relaciones
    empleado_solicita: Mapped["Empleados"] = relationship("Empleados", back_populates="solicitudes")
    departamento_solicitante: Mapped[Optional["Departamento"]] = relationship("Departamento")
    almacen_origen: Mapped["Almacenes"] = relationship("Almacenes", back_populates="solicitudes")
    director_aprueba: Mapped[Optional["Usuarios"]] = relationship("Usuarios", foreign_keys=[id_director_aprueba])
    director_infraestructura: Mapped[Optional["Usuarios"]] = relationship("Usuarios", foreign_keys=[id_director_infraestructura])
    usuario_despacha: Mapped[Optional["Usuarios"]] = relationship("Usuarios", foreign_keys=[id_usuario_despacha])
    usuario_recibe: Mapped[Optional["Usuarios"]] = relationship("Usuarios", foreign_keys=[id_usuario_recibe])
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
    id_almacen_despacho: Mapped[Optional[int]] = mapped_column(ForeignKey("almacenes.id"), nullable=True)
    observaciones_item: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relaciones
    solicitud: Mapped["Solicitudes"] = relationship("Solicitudes", back_populates="detalles")
    producto: Mapped["Productos"] = relationship("Productos", back_populates="detalles_solicitud")
    almacen_despacho: Mapped[Optional["Almacenes"]] = relationship("Almacenes", foreign_keys=[id_almacen_despacho])

