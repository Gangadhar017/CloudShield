import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

database_url = settings.DATABASE_URL

# Handle SQLite vs Postgres connection args
connect_args = {}
if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(database_url, connect_args=connect_args)
    # Test connection
    with engine.connect() as conn:
        pass
except Exception as e:
    logger.warning(f"Could not connect to configured DATABASE_URL ({database_url}): {e}. Falling back to SQLite.")
    database_url = "sqlite:///./cloudshield.db"
    engine = create_engine(database_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from backend.app.models import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
