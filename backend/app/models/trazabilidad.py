from datetime import datetime, timezone
from typing import Optional, Any
from sqlalchemy import String, DateTime, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Movimientos(Base):
    __tablename__ = "movimientos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tipo_movimiento: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # ENTRADA, SALIDA, TRANSFERENCIA, AJUSTE
    id_producto: Mapped[int] = mapped_column(ForeignKey("productos.id"), nullable=False, index=True)
    cantidad: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # FKs de almacén nulables para soportar entradas externas, salidas a consumo o transferencias
    id_almacen_origen: Mapped[Optional[int]] = mapped_column(ForeignKey("almacenes.id"), nullable=True, index=True)
    id_almacen_destino: Mapped[Optional[int]] = mapped_column(ForeignKey("almacenes.id"), nullable=True, index=True)
    
    # Referencias nulables a los documentos fuente
    id_recepcion: Mapped[Optional[int]] = mapped_column(ForeignKey("recepciones.id"), nullable=True, index=True)
    id_solicitud: Mapped[Optional[int]] = mapped_column(ForeignKey("solicitudes.id"), nullable=True, index=True)
    
    id_usuario: Mapped[int] = mapped_column(ForeignKey("usuarios.id"), nullable=False)
    fecha_movimiento: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    motivo: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relaciones
    producto: Mapped["Productos"] = relationship("Productos", back_populates="movimientos")
    almacen_origen: Mapped[Optional["Almacenes"]] = relationship("Almacenes", foreign_keys=[id_almacen_origen])
    almacen_destino: Mapped[Optional["Almacenes"]] = relationship("Almacenes", foreign_keys=[id_almacen_destino])
    recepcion: Mapped[Optional["Recepciones"]] = relationship("Recepciones", back_populates="movimientos")
    solicitud: Mapped[Optional["Solicitudes"]] = relationship("Solicitudes", back_populates="movimientos")
    usuario: Mapped["Usuarios"] = relationship("Usuarios", back_populates="movimientos")


class Auditoria(Base):
    __tablename__ = "auditoria"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tabla_afectada: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    operacion: Mapped[str] = mapped_column(String(20), nullable=False, index=True)  # INSERT, UPDATE, DELETE
    registro_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    datos_anteriores: Mapped[Optional[Any]] = mapped_column(JSONB, nullable=True)
    datos_nuevos: Mapped[Optional[Any]] = mapped_column(JSONB, nullable=True)
    id_usuario: Mapped[Optional[int]] = mapped_column(ForeignKey("usuarios.id"), nullable=True, index=True)
    ip_origen: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    fecha: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # Relaciones
    usuario: Mapped[Optional["Usuarios"]] = relationship("Usuarios", back_populates="auditorias")

