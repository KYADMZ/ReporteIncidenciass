import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import declarative_base, sessionmaker

# En Render usaremos el disco persistente.
# En local, seguiremos usando Backend/Reportes.db.
RENDER_DATA_DIR = os.getenv("RENDER_DATA_DIR")

if RENDER_DATA_DIR:
    database_path = Path(RENDER_DATA_DIR) / "Reportes.db"
else:
    database_path = Path(__file__).resolve().with_name("Reportes.db")

DATABASE_URL = URL.create(
    "sqlite",
    database=str(database_path)
)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()