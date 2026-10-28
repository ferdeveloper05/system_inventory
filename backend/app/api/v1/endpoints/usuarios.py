from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_password_hash
from app.models.acceso import Usuarios, Roles, Empleados, Departamento
from app.schemas.usuarios import (
    UsuarioCreate, UsuarioUpdate, UsuarioResponse,
    RolCreate, RolResponse,
    EmpleadoCreate, EmpleadoUpdate, EmpleadoResponse,
    DepartamentoCreate, DepartamentoUpdate, DepartamentoResponse
)
from app.services.auditoria_service import auditoria_service

router = APIRouter()


# ==========================================
# Usuarios
# ==========================================
@router.get("/", response_model=List[UsuarioResponse], summary="Listar usuarios")
def list_usuarios(
    skip: int = 0,
    limit: int = 100,
    activo: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    query = db.query(Usuarios)
    if activo is not None:
        query = query.filter(Usuarios.activo == activo)
    return query.order_by(Usuarios.id.asc()).offset(skip).limit(limit).all()


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
    db.flush()

    auditoria_service.registrar(
        db=db,
        tabla_afectada="usuarios",
        operacion="INSERT",
        registro_id=user.id,
        datos_anteriores=None,
        datos_nuevos={"username": user.username, "email": user.email, "id_rol": user.id_rol},
        id_usuario=current_user.id
    )
    db.commit()
    db.refresh(user)
    return user


@router.get("/{id_usuario}", response_model=UsuarioResponse, summary="Obtener usuario por ID")
def get_usuario(
    id_usuario: int,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    user = db.query(Usuarios).filter(Usuarios.id == id_usuario).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


@router.put("/{id_usuario}", response_model=UsuarioResponse, summary="Actualizar usuario")
def update_usuario(
    id_usuario: int,
    usuario_in: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    user = db.query(Usuarios).filter(Usuarios.id == id_usuario).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    datos_anteriores = {
        "email": user.email,
        "id_rol": user.id_rol,
        "id_empleado": user.id_empleado,
        "activo": user.activo,
    }

    if usuario_in.email is not None and usuario_in.email != user.email:
        existente = db.query(Usuarios).filter(Usuarios.email == usuario_in.email, Usuarios.id != id_usuario).first()
        if existente:
            raise HTTPException(status_code=400, detail="El email ya está en uso por otro usuario")
        user.email = usuario_in.email

    if usuario_in.id_rol is not None:
        user.id_rol = usuario_in.id_rol

    if usuario_in.id_empleado is not None:
        # Validar si el empleado ya está asociado a otro usuario
        existente_emp = db.query(Usuarios).filter(
            Usuarios.id_empleado == usuario_in.id_empleado,
            Usuarios.id != id_usuario
        ).first()
        if existente_emp:
            raise HTTPException(status_code=400, detail="El empleado seleccionado ya tiene una cuenta de usuario asignada")
        user.id_empleado = usuario_in.id_empleado

    if usuario_in.activo is not None:
        user.activo = usuario_in.activo

    if usuario_in.password:
        user.hashed_password = get_password_hash(usuario_in.password)

    auditoria_service.registrar(
        db=db,
        tabla_afectada="usuarios",
        operacion="UPDATE",
        registro_id=user.id,
        datos_anteriores=datos_anteriores,
        datos_nuevos={
            "email": user.email,
            "id_rol": user.id_rol,
            "id_empleado": user.id_empleado,
            "activo": user.activo,
        },
        id_usuario=current_user.id
    )
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{id_usuario}/toggle-activo", response_model=UsuarioResponse, summary="Alternar estado activo de usuario")
def toggle_activo_usuario(
    id_usuario: int,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    user = db.query(Usuarios).filter(Usuarios.id == id_usuario).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes desactivar tu propia cuenta actual")

    estado_anterior = user.activo
    user.activo = not user.activo

    auditoria_service.registrar(
        db=db,
        tabla_afectada="usuarios",
        operacion="UPDATE",
        registro_id=user.id,
        datos_anteriores={"activo": estado_anterior},
        datos_nuevos={"activo": user.activo},
        id_usuario=current_user.id
    )
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{id_usuario}", status_code=status.HTTP_200_OK, summary="Eliminar usuario")
def delete_usuario(
    id_usuario: int,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    user = db.query(Usuarios).filter(Usuarios.id == id_usuario).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propia cuenta actual")

    # Auditoría antes de eliminar
    auditoria_service.registrar(
        db=db,
        tabla_afectada="usuarios",
        operacion="DELETE",
        registro_id=user.id,
        datos_anteriores={"username": user.username, "email": user.email},
        datos_nuevos=None,
        id_usuario=current_user.id
    )
    db.delete(user)
    db.commit()
    return {"message": f"Usuario {user.username} eliminado correctamente"}


# ==========================================
# Departamentos
# ==========================================
@router.get("/departamentos", response_model=List[DepartamentoResponse], summary="Listar departamentos")
def list_departamentos(db: Session = Depends(get_db), current_user: Usuarios = Depends(get_current_user)):
    return db.query(Departamento).order_by(Departamento.nombre.asc()).all()


@router.post("/departamentos", response_model=DepartamentoResponse, status_code=status.HTTP_201_CREATED, summary="Crear departamento")
def create_departamento(dep_in: DepartamentoCreate, db: Session = Depends(get_db), current_user: Usuarios = Depends(get_current_user)):
    if db.query(Departamento).filter(Departamento.nombre == dep_in.nombre).first():
        raise HTTPException(status_code=400, detail="Ya existe un departamento con ese nombre")
    dep = Departamento(**dep_in.model_dump())
    db.add(dep)
    db.commit()
    db.refresh(dep)
    return dep


# ==========================================
# Roles
# ==========================================
@router.get("/roles", response_model=List[RolResponse], summary="Listar roles")
def list_roles(db: Session = Depends(get_db), current_user: Usuarios = Depends(get_current_user)):
    return db.query(Roles).order_by(Roles.id.asc()).all()


@router.post("/roles", response_model=RolResponse, status_code=status.HTTP_201_CREATED, summary="Crear rol")
def create_rol(rol_in: RolCreate, db: Session = Depends(get_db), current_user: Usuarios = Depends(get_current_user)):
    if db.query(Roles).filter(Roles.nombre == rol_in.nombre).first():
        raise HTTPException(status_code=400, detail="Ya existe un rol con ese nombre")
    rol = Roles(**rol_in.model_dump())
    db.add(rol)
    db.commit()
    db.refresh(rol)
    return rol


# ==========================================
# Empleados
# ==========================================
@router.get("/empleados", response_model=List[EmpleadoResponse], summary="Listar empleados")
def list_empleados(db: Session = Depends(get_db), current_user: Usuarios = Depends(get_current_user)):
    return db.query(Empleados).order_by(Empleados.apellido.asc(), Empleados.nombre.asc()).all()


@router.post("/empleados", response_model=EmpleadoResponse, status_code=status.HTTP_201_CREATED, summary="Crear empleado")
def create_empleado(emp_in: EmpleadoCreate, db: Session = Depends(get_db), current_user: Usuarios = Depends(get_current_user)):
    if db.query(Empleados).filter(Empleados.email == emp_in.email).first():
        raise HTTPException(status_code=400, detail="El email del empleado ya está registrado")
    emp = Empleados(**emp_in.model_dump())
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return emp


@router.put("/empleados/{id_empleado}", response_model=EmpleadoResponse, summary="Actualizar empleado")
def update_empleado(
    id_empleado: int,
    emp_in: EmpleadoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    emp = db.query(Empleados).filter(Empleados.id == id_empleado).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    update_data = emp_in.model_dump(exclude_unset=True)
    if "email" in update_data and update_data["email"] != emp.email:
        existente = db.query(Empleados).filter(Empleados.email == update_data["email"], Empleados.id != id_empleado).first()
        if existente:
            raise HTTPException(status_code=400, detail="El email ya pertenece a otro empleado")

    for field, value in update_data.items():
        setattr(emp, field, value)

    db.commit()
    db.refresh(emp)
    return emp

