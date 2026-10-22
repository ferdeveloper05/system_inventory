from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_password_hash
from app.models.acceso import Usuarios, Roles, Empleados, Departamento
from app.schemas.auth import Token, CurrentUserResponse, RegisterRequest
from app.services.auth_service import auth_service
from app.services.auditoria_service import auditoria_service

router = APIRouter()


@router.post("/register", response_model=CurrentUserResponse, status_code=status.HTTP_201_CREATED, summary="Registro público de nuevos usuarios")
def register(
    register_in: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Registra un nuevo usuario en el sistema.
    Asigna o inicializa departamento y rol correspondientes, y vincula la ficha de empleado.
    """
    # 1. Validar unicidad de username y email
    if db.query(Usuarios).filter(Usuarios.username == register_in.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario ya está registrado en el sistema"
        )
    if db.query(Usuarios).filter(Usuarios.email == register_in.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La dirección de correo electrónico ya se encuentra registrada"
        )

    # 2. Determinar si es el primer usuario para asignarle rol Admin
    total_usuarios = db.query(Usuarios).count()
    is_first_user = total_usuarios == 0

    # 3. Obtener o crear Roles base si no existen
    target_role_name = "ADMINISTRADOR" if is_first_user else "OPERADOR"
    rol = db.query(Roles).filter(Roles.nombre == target_role_name).first()
    if not rol:
        rol = Roles(
            nombre=target_role_name,
            descripcion="Administrador total del sistema" if is_first_user else "Operador de almacén e infraestructura",
            activo=True
        )
        db.add(rol)
        db.flush()

    # 4. Obtener o crear Departamento base si no existe
    departamento = db.query(Departamento).filter(Departamento.nombre == "Infraestructura").first()
    if not departamento:
        departamento = Departamento(
            nombre="Infraestructura",
            descripcion="Departamento principal de Infraestructura y Operaciones TI",
            activo=True
        )
        db.add(departamento)
        db.flush()

    # 5. Crear Empleado vinculado
    empleado = Empleados(
        nombre=register_in.nombre,
        apellido=register_in.apellido,
        email=register_in.email,
        telefono=register_in.telefono,
        cargo=register_in.cargo or "Operador de Infraestructura",
        id_departamento=departamento.id,
        activo=True
    )
    db.add(empleado)
    db.flush()

    # 6. Crear Usuario
    usuario = Usuarios(
        username=register_in.username,
        email=register_in.email,
        hashed_password=get_password_hash(register_in.password),
        id_empleado=empleado.id,
        id_rol=rol.id,
        activo=True,
        is_superuser=is_first_user
    )
    db.add(usuario)
    db.flush()

    # 7. Registrar Auditoría
    auditoria_service.registrar(
        db=db,
        tabla_afectada="usuarios",
        operacion="INSERT",
        registro_id=usuario.id,
        datos_anteriores=None,
        datos_nuevos={"username": usuario.username, "rol": rol.nombre, "is_superuser": usuario.is_superuser},
        id_usuario=usuario.id
    )

    db.commit()
    db.refresh(usuario)

    nombre_completo = f"{empleado.nombre} {empleado.apellido}"
    return CurrentUserResponse(
        id=usuario.id,
        username=usuario.username,
        email=usuario.email,
        activo=usuario.activo,
        is_superuser=usuario.is_superuser,
        id_rol=usuario.id_rol,
        rol_nombre=rol.nombre,
        id_empleado=usuario.id_empleado,
        nombre_completo=nombre_completo
    )


@router.post("/login", response_model=Token, summary="Inicio de sesión de usuarios")
def login(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """Genera token de acceso JWT con credenciales válidas."""
    user = auth_service.authenticate(db, username=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )
    token = auth_service.generate_token_for_user(user)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=CurrentUserResponse, summary="Perfil del usuario autenticado")
def get_me(current_user: Usuarios = Depends(get_current_user)):
    """Retorna información detallada del usuario logueado en la sesión actual."""
    nombre_completo = None
    if current_user.empleado:
        nombre_completo = f"{current_user.empleado.nombre} {current_user.empleado.apellido}"

    return CurrentUserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        activo=current_user.activo,
        is_superuser=current_user.is_superuser,
        id_rol=current_user.id_rol,
        rol_nombre=current_user.rol.nombre if current_user.rol else None,
        id_empleado=current_user.id_empleado,
        nombre_completo=nombre_completo,
    )

