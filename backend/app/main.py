import os
import sys

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.core.database import init_db, SessionLocal
from backend.app.api.auth import router as auth_router
from backend.app.api.resources import router as resources_router
from backend.app.api.incidents import router as incidents_router
from backend.app.api.findings import router as findings_router
from backend.app.api.monitoring import router as monitoring_router
from backend.app.api.remediation import router as remediation_router
from backend.app.api.audit import router as audit_router
from backend.app.seed import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize schema
    init_db()
    # Seed default Admin, Operator, and initial resources
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="CloudShield API",
    description="Unified Platform for Cloud Monitoring, Security Assessment, and Auto-Remediation",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local dev frontends
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health & Version Check Endpoints
@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

@app.get("/api/version", tags=["System"])
def version_check():
    return {
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "project": settings.PROJECT_NAME
    }

# Register Routers
app.include_router(auth_router)
app.include_router(resources_router)
app.include_router(incidents_router)
app.include_router(findings_router)
app.include_router(monitoring_router)
app.include_router(remediation_router)
app.include_router(audit_router)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", settings.BACKEND_PORT))
    uvicorn.run(app, host="0.0.0.0", port=port)
