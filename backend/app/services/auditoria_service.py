from typing import Optional, Any
from sqlalchemy.orm import Session
from app.models.trazabilidad import Auditoria


class AuditoriaService:
    @staticmethod
    def registrar(
        db: Session,
        tabla_afectada: str,
        operacion: str,
        registro_id: Any,
        datos_anteriores: Optional[dict] = None,
        datos_nuevos: Optional[dict] = None,
        id_usuario: Optional[int] = None,
        ip_origen: Optional[str] = None
    ) -> Auditoria:
        """Registra un evento de auditoría con datos en formato JSONB."""
        registro = Auditoria(
            tabla_afectada=tabla_afectada,
            operacion=operacion,
            registro_id=str(registro_id),
            datos_anteriores=datos_anteriores,
            datos_nuevos=datos_nuevos,
            id_usuario=id_usuario,
            ip_origen=ip_origen
        )
        db.add(registro)
        db.flush()
        return registro


auditoria_service = AuditoriaService()

