import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.database import engine, Base
import app.models  # noqa: F401
from app.api.v1.router import api_router

# Configurar logging estructurado
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("inventory_api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Ciclo de vida de la aplicación: inicialización y limpieza."""
    logger.info("Iniciando Sistema de Gestión de Inventarios y Trazabilidad...")
    try:
        # Crea tablas si no existen (en producción se delega a migraciones con Alembic)
        Base.metadata.create_all(bind=engine)
        # Sincronización segura de columnas de almacenes si la tabla ya existía
        try:
            from sqlalchemy import text
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE almacenes ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'GENERAL';"))
                conn.execute(text("ALTER TABLE almacenes ADD COLUMN IF NOT EXISTS descripcion TEXT;"))
        except Exception as col_err:
            logger.warning(f"Aviso al asegurar columnas en almacenes: {col_err}")
        logger.info("Modelos de Base de Datos sincronizados.")
    except Exception as e:
        logger.warning(f"No se pudo conectar inmediatamente a la BD (¿contenedor iniciando?): {e}")
    yield
    logger.info("Deteniendo Sistema de Gestión de Inventarios...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API RESTful para la Gestión Integral de Inventarios, Despachos y Trazabilidad de Infraestructura.",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Manejador Global para Errores HTTP
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "status_code": exc.status_code,
            "message": exc.detail,
            "path": request.url.path,
        },
    )

# Manejador Global para Validaciones de Pydantic
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Error de validación en {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "status_code": 422,
            "message": "Error de validación en la carga útil",
            "errors": exc.errors(),
            "path": request.url.path,
        },
    )

# Manejador Global para Excepciones no controladas
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"Error interno no controlado en {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "status_code": 500,
            "message": "Ha ocurrido un error interno en el servidor",
            "path": request.url.path,
        },
    )

# Healthcheck
@app.get("/health", tags=["Salud del Sistema"])
def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "environment": "development"
    }

# Registrar Routers de la API v1
app.include_router(api_router, prefix=settings.API_V1_STR)

