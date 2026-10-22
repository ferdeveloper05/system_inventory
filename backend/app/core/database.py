from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings


def resolve_database_url(url: str) -> str:
    """
    Normaliza la URL de conexión para PostgreSQL.
    Si se especifica 'postgresql://' sin driver:
    - Prioriza 'psycopg' (v3) si está instalado.
    - Si no está presente, hace fallback a 'postgresql+psycopg2://'.
    """
    if url.startswith("postgresql://"):
        try:
            import psycopg  # noqa: F401
            return url
        except ImportError:
            return url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url


# Engine configurado para PostgreSQL con detección automática de driver
engine = create_engine(
    resolve_database_url(settings.DATABASE_URL),
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Generador de sesión SQLAlchemy para inyección de dependencias en FastAPI.
    Garantiza el cierre automático de la conexión tras la petición.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


