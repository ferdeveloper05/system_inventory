from datetime import datetime
from typing import Optional
from pydantic import EmailStr
from app.schemas.base import BaseSchema


# Departamentos
class DepartamentoBase(BaseSchema):
    nombre: str
    descripcion: Optional[str] = None
    activo: bool = True


class DepartamentoCreate(DepartamentoBase):
    pass


class DepartamentoUpdate(BaseSchema):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    activo: Optional[bool] = None


class DepartamentoResponse(DepartamentoBase):
    id: int
    created_at: datetime


# Roles
class RolBase(BaseSchema):
    nombre: str
    descripcion: Optional[str] = None
    activo: bool = True


class RolCreate(RolBase):
    pass


class RolResponse(RolBase):
    id: int
    created_at: datetime


# Empleados
class EmpleadoBase(BaseSchema):
    nombre: str
    apellido: str
    email: EmailStr
    telefono: Optional[str] = None
    cargo: str
    id_departamento: int
    activo: bool = True


class EmpleadoCreate(EmpleadoBase):
    pass


class EmpleadoResponse(EmpleadoBase):
    id: int
    created_at: datetime
    departamento: Optional[DepartamentoResponse] = None


# Usuarios
class UsuarioBase(BaseSchema):
    username: str
    email: EmailStr
    id_rol: int
    id_empleado: Optional[int] = None
    activo: bool = True
    is_superuser: bool = False


class UsuarioCreate(UsuarioBase):
    password: str


class UsuarioUpdate(BaseSchema):
    email: Optional[EmailStr] = None
    id_rol: Optional[int] = None
    id_empleado: Optional[int] = None
    activo: Optional[bool] = None
    password: Optional[str] = None


class UsuarioResponse(UsuarioBase):
    id: int
    created_at: datetime
    updated_at: datetime
    rol: Optional[RolResponse] = None
    empleado: Optional[EmpleadoResponse] = None

