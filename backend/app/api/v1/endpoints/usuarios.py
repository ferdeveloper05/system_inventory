from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_password_hash
from app.models.acceso import Usuarios, Roles, Empleados, Departamento
from app.schemas.usuarios import (
    UsuarioCreate, UsuarioResponse,
    RolCreate, RolResponse,
    EmpleadoCreate, EmpleadoResponse,
    DepartamentoCreate, DepartamentoResponse
)

router = APIRouter()


# Usuarios
@router.get("/", response_model=List[UsuarioResponse], summary="Listar usuarios")
def list_usuarios(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    return db.query(Usuarios).offset(skip).limit(limit).all()


@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED, summary="Crear usuario")
def create_usuario(
    usuario_in: UsuarioCreate,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    if db.query(Usuarios).filter(Usuarios.username == usuario_in.username).first():
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está registrado")
    if db.query(Usuarios).filter(Usuarios.email == usuario_in.email).first():
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    user = Usuarios(
        username=usuario_in.username,
        email=usuario_in.email,
        hashed_password=get_password_hash(usuario_in.password),
        id_rol=usuario_in.id_rol,
        id_empleado=usuario_in.id_empleado,
        activo=usuario_in.activo,
        is_superuser=usuario_in.is_superuser,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# Departamentos
@router.get("/departamentos", response_model=List[DepartamentoResponse], summary="Listar departamentos")
def list_departamentos(db: Session = Depends(get_db), current_user: Usuarios = Depends(get_current_user)):
    return db.query(Departamento).all()


@router.post("/departamentos", response_model=DepartamentoResponse, status_code=status.HTTP_201_CREATED, summary="Crear departamento")
def create_departamento(dep_in: DepartamentoCreate, db: Session = Depends(get_db), current_user: Usuarios = Depends(get_current_user)):
    dep = Departamento(**dep_in.model_dump())
    db.add(dep)
    db.commit()
    db.refresh(dep)
    return dep


# Roles
@router.get("/roles", response_model=List[RolResponse], summary="Listar roles")
def list_roles(db: Session = Depends(get_db), current_user: Usuarios = Depends(get_current_user)):
    return db.query(Roles).all()


# Empleados
@router.get("/empleados", response_model=List[EmpleadoResponse], summary="Listar empleados")
def list_empleados(db: Session = Depends(get_db), current_user: Usuarios = Depends(get_current_user)):
    return db.query(Empleados).all()


@router.post("/empleados", response_model=EmpleadoResponse, status_code=status.HTTP_201_CREATED, summary="Crear empleado")
def create_empleado(emp_in: EmpleadoCreate, db: Session = Depends(get_db), current_user: Usuarios = Depends(get_current_user)):
    emp = Empleados(**emp_in.model_dump())
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return emp

