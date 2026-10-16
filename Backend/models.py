from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func

from database import Base


class Reporte(Base):
    __tablename__ = "Reportes"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(150), nullable=False)
    descripcion = Column(Text, nullable=False)
    categoria = Column(String(80), nullable=False)
    prioridad = Column(String(20), default="Media")
    estado = Column(String(20), default="Nueva")
    fecha_creacion = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )