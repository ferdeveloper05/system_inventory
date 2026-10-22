from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Departamento(Base):
    __tablename__ = "departamentos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    descripcion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relaciones
    empleados: Mapped[List["Empleados"]] = relationship("Empleados", back_populates="departamento")


class Roles(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    descripcion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relaciones
    usuarios: Mapped[List["Usuarios"]] = relationship("Usuarios", back_populates="rol")


class Empleados(Base):
    __tablename__ = "empleados"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    apellido: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False, index=True)
    telefono: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    cargo: Mapped[str] = mapped_column(String(100), nullable=False)
    id_departamento: Mapped[int] = mapped_column(ForeignKey("departamentos.id"), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relaciones
    departamento: Mapped["Departamento"] = relationship("Departamento", back_populates="empleados")
    usuario: Mapped[Optional["Usuarios"]] = relationship("Usuarios", back_populates="empleado", uselist=False)
    recepciones: Mapped[List["Recepciones"]] = relationship("Recepciones", back_populates="empleado_recibe")
    solicitudes: Mapped[List["Solicitudes"]] = relationship("Solicitudes", back_populates="empleado_solicita")


class Usuarios(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    id_empleado: Mapped[Optional[int]] = mapped_column(ForeignKey("empleados.id"), unique=True, nullable=True)
    id_rol: Mapped[int] = mapped_column(ForeignKey("roles.id"), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relaciones
    rol: Mapped["Roles"] = relationship("Roles", back_populates="usuarios")
    empleado: Mapped[Optional["Empleados"]] = relationship("Empleados", back_populates="usuario")
    movimientos: Mapped[List["Movimientos"]] = relationship("Movimientos", back_populates="usuario")
    auditorias: Mapped[List["Auditoria"]] = relationship("Auditoria", back_populates="usuario")

