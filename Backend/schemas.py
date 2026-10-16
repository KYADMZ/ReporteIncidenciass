from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ReporteCreate(BaseModel):
    titulo: str = Field(min_length=3, max_length=150)
    descripcion: str = Field(min_length=5)
    categoria: str = Field(min_length=1, max_length=80)
    prioridad: str = "Media"


class ReporteUpdate(BaseModel):
    titulo: str | None = Field(default=None, max_length=150)
    descripcion: str | None = None
    categoria: str | None = None
    prioridad: str | None = None
    estado: str | None = None


class ReporteResponse(BaseModel):
    id: int
    titulo: str
    descripcion: str
    categoria: str
    prioridad: str
    estado: str
    fecha_creacion: datetime | None

    model_config = ConfigDict(from_attributes=True)