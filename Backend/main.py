from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

if __package__:
    from .database import Base, engine, get_db
    from .models import Reporte
    from .schemas import ReporteCreate, ReporteUpdate, ReporteResponse
else:
    from database import Base, engine, get_db
    from models import Reporte
    from schemas import ReporteCreate, ReporteUpdate, ReporteResponse

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Reporte de Incidencias")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        #"https://Render
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/reportes", response_model=list[ReporteResponse])
def listar_reportes(db: Session = Depends(get_db)):
    return db.query(Reporte).order_by(
        Reporte.id.desc()
    ).all()


@app.post(
    "/api/reportes",
    response_model=ReporteResponse,
    status_code=201
)
def crear_reporte(
    datos: ReporteCreate,
    db: Session = Depends(get_db)
):
    reporte = Reporte(**datos.model_dump())
    db.add(reporte)
    db.commit()
    db.refresh(reporte)
    return reporte


@app.patch(
    "/api/reportes/{reporte_id}",
    response_model=ReporteResponse
)
def actualizar_reporte(
    reporte_id: int,
    datos: ReporteUpdate,
    db: Session = Depends(get_db)
):
    reporte = db.get(Reporte, reporte_id)

    if not reporte:
        raise HTTPException(404, "Reporte no encontrado")

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(reporte, campo, valor)

    db.commit()
    db.refresh(reporte)
    return reporte


@app.delete("/api/reportes/{reporte_id}", status_code=204)
def eliminar_reporte(
    reporte_id: int,
    db: Session = Depends(get_db)
):
    reporte = db.get(Reporte, reporte_id)

    if not reporte:
        raise HTTPException(404, "Reporte no encontrado")

    db.delete(reporte)
    db.commit()