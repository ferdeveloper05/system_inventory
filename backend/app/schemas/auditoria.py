from datetime import datetime
from typing import Optional, Any, Dict
from app.schemas.base import BaseSchema


class AuditoriaResponse(BaseSchema):
    id: int
    tabla_afectada: str
    operacion: str
    registro_id: str
    datos_anteriores: Optional[Any] = None
    datos_nuevos: Optional[Any] = None
    id_usuario: Optional[int] = None
    ip_origen: Optional[str] = None
    fecha: datetime

