from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user, get_password_hash
from app.models.acceso import Departamento, Empleados, Roles, Usuarios
from app.schemas.usuarios import (
    DepartamentoCreate,
    DepartamentoResponse,
    DepartamentoUpdate,
    EmpleadoCreate,
    EmpleadoResponse,
    EmpleadoUpdate,
    RolCreate,
    RolResponse,
    RolUpdate,
    UsuarioCreate,
    UsuarioResponse,
    UsuarioUpdate,
)
from app.services.auditoria_service import auditoria_service
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

router = APIRouter()


# ============================================================================
# 1. DEPARTAMENTOS
# IMPORTANT: Static sub-routes must be registered BEFORE wildcard /{id_usuario}
# ============================================================================

@router.get("/departamentos", response_model=List[DepartamentoResponse], summary="Listar departamentos")
def list_departamentos(
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    return db.query(Departamento).order_by(Departamento.nombre.asc()).all()


@router.post("/departamentos", response_model=DepartamentoResponse, status_code=status.HTTP_201_CREATED, summary="Crear departamento")
def create_departamento(
    dep_in: DepartamentoCreate,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    clean_nombre = dep_in.nombre.strip()
    existente = db.query(Departamento).filter(
        func.lower(func.trim(Departamento.nombre)) == func.lower(clean_nombre)
    ).first()

    if existente:
        if not existente.activo:
            existente.activo = True
            if dep_in.descripcion is not None:
                existente.descripcion = dep_in.descripcion
            db.commit()
            db.refresh(existente)
            return existente
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un departamento con el nombre '{existente.nombre}'"
        )

    dep = Departamento(
        nombre=clean_nombre,
        descripcion=dep_in.descripcion,
        activo=dep_in.activo
    )
    db.add(dep)
    db.commit()
    db.refresh(dep)
    return dep


@router.put("/departamentos/{id_departamento}", response_model=DepartamentoResponse, summary="Actualizar departamento")
def update_departamento(
    id_departamento: int,
    dep_in: DepartamentoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    dep = db.query(Departamento).filter(Departamento.id == id_departamento).first()
    if not dep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Departamento no encontrado")

    update_data = dep_in.model_dump(exclude_unset=True)
    if "nombre" in update_data and update_data["nombre"]:
        clean_nombre = update_data["nombre"].strip()
        existente = db.query(Departamento).filter(
            func.lower(func.trim(Departamento.nombre)) == func.lower(clean_nombre),
            Departamento.id != id_departamento
        ).first()
        if existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe otro departamento con el nombre '{existente.nombre}'"
            )
        update_data["nombre"] = clean_nombre

    for field, value in update_data.items():
        setattr(dep, field, value)

    db.commit()
    db.refresh(dep)
    return dep


@router.delete("/departamentos/{id_departamento}", status_code=status.HTTP_200_OK, summary="Eliminar departamento")
def delete_departamento(
    id_departamento: int,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    dep = db.query(Departamento).filter(Departamento.id == id_departamento).first()
    if not dep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Departamento no encontrado")

    empleados_count = db.query(Empleados).filter(Empleados.id_departamento == id_departamento).count()
    if empleados_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede eliminar el departamento '{dep.nombre}' porque tiene {empleados_count} empleado(s) asociado(s). Reasigne a los empleados primero."
        )

    db.delete(dep)
    db.commit()
    return {"message": f"Departamento '{dep.nombre}' eliminado correctamente"}


# ============================================================================
# 2. ROLES / CONTROL DE ACCESO
# ============================================================================

@router.get("/roles", response_model=List[RolResponse], summary="Listar roles")
def list_roles(
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    return db.query(Roles).order_by(Roles.id.asc()).all()


@router.post("/roles", response_model=RolResponse, status_code=status.HTTP_201_CREATED, summary="Crear rol")
def create_rol(
    rol_in: RolCreate,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    clean_nombre = rol_in.nombre.strip()
    existente = db.query(Roles).filter(
        func.lower(func.trim(Roles.nombre)) == func.lower(clean_nombre)
    ).first()

    if existente:
        if not existente.activo:
            existente.activo = True
            if rol_in.descripcion is not None:
                existente.descripcion = rol_in.descripcion
            db.commit()
            db.refresh(existente)
            return existente
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un rol con el nombre '{existente.nombre}'"
        )

    rol = Roles(
        nombre=clean_nombre,
        descripcion=rol_in.descripcion,
        activo=rol_in.activo
    )
    db.add(rol)
    db.commit()
    db.refresh(rol)
    return rol


@router.put("/roles/{id_rol}", response_model=RolResponse, summary="Actualizar rol")
def update_rol(
    id_rol: int,
    rol_in: RolUpdate,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    rol = db.query(Roles).filter(Roles.id == id_rol).first()
    if not rol:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rol no encontrado")

    update_data = rol_in.model_dump(exclude_unset=True)
    if "nombre" in update_data and update_data["nombre"]:
        clean_nombre = update_data["nombre"].strip()
        existente = db.query(Roles).filter(
            func.lower(func.trim(Roles.nombre)) == func.lower(clean_nombre),
            Roles.id != id_rol
        ).first()
        if existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe otro rol con el nombre '{existente.nombre}'"
            )
        update_data["nombre"] = clean_nombre

    for field, value in update_data.items():
        setattr(rol, field, value)

    db.commit()
    db.refresh(rol)
    return rol


@router.delete("/roles/{id_rol}", status_code=status.HTTP_200_OK, summary="Eliminar rol")
def delete_rol(
    id_rol: int,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    rol = db.query(Roles).filter(Roles.id == id_rol).first()
    if not rol:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rol no encontrado")

    usuarios_count = db.query(Usuarios).filter(Usuarios.id_rol == id_rol).count()
    if usuarios_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede eliminar el rol '{rol.nombre}' porque está asignado a {usuarios_count} usuario(s). Modifique los roles de los usuarios antes de eliminarlo."
        )

    db.delete(rol)
    db.commit()
    return {"message": f"Rol '{rol.nombre}' eliminado correctamente"}


# ============================================================================
# 3. EMPLEADOS
# ============================================================================

@router.get("/empleados", response_model=List[EmpleadoResponse], summary="Listar empleados")
def list_empleados(
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    return db.query(Empleados).order_by(Empleados.apellido.asc(), Empleados.nombre.asc()).all()


@router.post("/empleados", response_model=EmpleadoResponse, status_code=status.HTTP_201_CREATED, summary="Crear empleado")
def create_empleado(
    emp_in: EmpleadoCreate,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    clean_email = emp_in.email.strip().lower()
    if db.query(Empleados).filter(func.lower(Empleados.email) == clean_email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El email del empleado ya está registrado")

    emp_data = emp_in.model_dump()
    emp_data["email"] = clean_email
    emp = Empleados(**emp_data)
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empleado no encontrado")

    datos_anteriores = {
        "nombre": emp.nombre,
        "apellido": emp.apellido,
        "email": emp.email,
        "telefono": emp.telefono,
        "cargo": emp.cargo,
        "id_departamento": emp.id_departamento,
        "activo": emp.activo,
    }

    update_data = emp_in.model_dump(exclude_unset=True)
    if "email" in update_data and update_data["email"]:
        clean_email = update_data["email"].strip().lower()
        existente = db.query(Empleados).filter(
            func.lower(Empleados.email) == clean_email,
            Empleados.id != id_empleado
        ).first()
        if existente:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El email ya pertenece a otro empleado")
        update_data["email"] = clean_email

    for field, value in update_data.items():
        setattr(emp, field, value)

    auditoria_service.registrar(
        db=db,
        tabla_afectada="empleados",
        operacion="UPDATE",
        registro_id=emp.id,
        datos_anteriores=datos_anteriores,
        datos_nuevos=update_data,
        id_usuario=current_user.id
    )

    db.commit()
    db.refresh(emp)
    return emp


@router.delete("/empleados/{id_empleado}", status_code=status.HTTP_200_OK, summary="Eliminar empleado")
def delete_empleado(
    id_empleado: int,
    db: Session = Depends(get_db),
    current_user: Usuarios = Depends(get_current_user)
):
    emp = db.query(Empleados).filter(Empleados.id == id_empleado).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empleado no encontrado")

    usuario_asociado = db.query(Usuarios).filter(Usuarios.id_empleado == id_empleado).first()
    if usuario_asociado:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede eliminar el empleado '{emp.nombre} {emp.apellido}' porque tiene una cuenta de usuario vinculada ({usuario_asociado.username})."
        )

    auditoria_service.registrar(
        db=db,
        tabla_afectada="empleados",
        operacion="DELETE",
        registro_id=emp.id,
        datos_anteriores={"nombre": emp.nombre, "apellido": emp.apellido, "email": emp.email},
        datos_nuevos=None,
        id_usuario=current_user.id
    )

    db.delete(emp)
    db.commit()
    return {"message": f"Empleado '{emp.nombre} {emp.apellido}' eliminado correctamente"}


# ============================================================================
# 4. USUARIOS
# Notice: Wildcard routes /{id_usuario} are placed AFTER static subpaths
# ============================================================================

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
    clean_username = usuario_in.username.strip()
    clean_email = usuario_in.email.strip().lower()

    if db.query(Usuarios).filter(func.lower(Usuarios.username) == clean_username.lower()).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El nombre de usuario ya está registrado")
    if db.query(Usuarios).filter(func.lower(Usuarios.email) == clean_email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El email ya está registrado")

    user = Usuarios(
        username=clean_username,
        email=clean_email,
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    datos_anteriores = {
        "email": user.email,
        "id_rol": user.id_rol,
        "id_empleado": user.id_empleado,
        "activo": user.activo,
    }

    if usuario_in.email is not None:
        clean_email = usuario_in.email.strip().lower()
        if clean_email != user.email:
            existente = db.query(Usuarios).filter(
                func.lower(Usuarios.email) == clean_email,
                Usuarios.id != id_usuario
            ).first()
            if existente:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El email ya está en uso por otro usuario")
            user.email = clean_email

    if usuario_in.id_rol is not None:
        user.id_rol = usuario_in.id_rol

    if usuario_in.id_empleado is not None:
        existente_emp = db.query(Usuarios).filter(
            Usuarios.id_empleado == usuario_in.id_empleado,
            Usuarios.id != id_usuario
        ).first()
        if existente_emp:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El empleado seleccionado ya tiene una cuenta de usuario asignada")
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    if user.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No puedes desactivar tu propia cuenta actual")

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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    if user.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No puedes eliminar tu propia cuenta actual")

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
