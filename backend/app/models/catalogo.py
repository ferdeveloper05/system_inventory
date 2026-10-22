from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Integer, Numeric, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Categorias(Base):
    __tablename__ = "categorias"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    codigo: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    descripcion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relaciones
    productos: Mapped[List["Productos"]] = relationship("Productos", back_populates="categoria")
    categorias_almacen: Mapped[List["Categoria_Almacen"]] = relationship("Categoria_Almacen", back_populates="categoria")


class Almacenes(Base):
    __tablename__ = "almacenes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    codigo: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    ubicacion: Mapped[str] = mapped_column(String(200), nullable=False)
    capacidad: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relaciones
    inventarios: Mapped[List["Inventario"]] = relationship("Inventario", back_populates="almacen")
    categorias_almacen: Mapped[List["Categoria_Almacen"]] = relationship("Categoria_Almacen", back_populates="almacen")
    recepciones: Mapped[List["Recepciones"]] = relationship("Recepciones", back_populates="almacen")
    solicitudes: Mapped[List["Solicitudes"]] = relationship("Solicitudes", back_populates="almacen_origen")


class Categoria_Almacen(Base):
    __tablename__ = "categoria_almacen"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    id_categoria: Mapped[int] = mapped_column(ForeignKey("categorias.id"), nullable=False)
    id_almacen: Mapped[int] = mapped_column(ForeignKey("almacenes.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("id_categoria", "id_almacen", name="unique_categoria_almacen"),
    )

    # Relaciones
    categoria: Mapped["Categorias"] = relationship("Categorias", back_populates="categorias_almacen")
    almacen: Mapped["Almacenes"] = relationship("Almacenes", back_populates="categorias_almacen")


class Productos(Base):
    __tablename__ = "productos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    codigo: Mapped[str] = mapped_column(String(60), unique=True, nullable=False, index=True)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    descripcion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    unidad_medida: Mapped[str] = mapped_column(String(30), default="UNIDAD", nullable=False)
    stock_minimo: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    stock_maximo: Mapped[int] = mapped_column(Integer, default=1000, nullable=False)
    id_categoria: Mapped[int] = mapped_column(ForeignKey("categorias.id"), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relaciones
    categoria: Mapped["Categorias"] = relationship("Categorias", back_populates="productos")
    inventarios: Mapped[List["Inventario"]] = relationship("Inventario", back_populates="producto")
    detalles_orden: Mapped[List["Detalle_orden_compra"]] = relationship("Detalle_orden_compra", back_populates="producto")
    detalles_recepcion: Mapped[List["Detalle_recepcion"]] = relationship("Detalle_recepcion", back_populates="producto")
    detalles_solicitud: Mapped[List["Detalle_solicitud"]] = relationship("Detalle_solicitud", back_populates="producto")
    movimientos: Mapped[List["Movimientos"]] = relationship("Movimientos", back_populates="producto")


class Inventario(Base):
    __tablename__ = "inventario"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    id_almacen: Mapped[int] = mapped_column(ForeignKey("almacenes.id"), nullable=False)
    id_producto: Mapped[int] = mapped_column(ForeignKey("productos.id"), nullable=False)
    stock_actual: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    stock_reservado: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    ubicacion_pasillo: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # CONSTRAINT unique_almacen_producto
    __table_args__ = (
        UniqueConstraint("id_almacen", "id_producto", name="unique_almacen_producto"),
    )

    # Relaciones
    almacen: Mapped["Almacenes"] = relationship("Almacenes", back_populates="inventarios")
    producto: Mapped["Productos"] = relationship("Productos", back_populates="inventarios")

