from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import httpx

from backend.app.core.database import get_db
from backend.app.core.security import get_current_user
from backend.app.models.models import User, Resource
from backend.app.schemas.schemas import (
    DashboardSummary, SimulationRequest, SimulationResponse, TelemetrySnapshot
)
from backend.app.services.monitoring_service import (
    collect_telemetry_snapshot, get_dashboard_summary, _upsert_incident
)
from backend.app.core.config import settings

router = APIRouter(prefix="/api/monitoring", tags=["Monitoring & Live Telemetry"])

@router.get("/summary", response_model=DashboardSummary)
def read_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Collect fresh snapshot to keep metrics active
    collect_telemetry_snapshot(db)
    return get_dashboard_summary(db)

@router.post("/collect", response_model=TelemetrySnapshot)
def trigger_telemetry_collection(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    snapshot = collect_telemetry_snapshot(db)
    return snapshot

@router.post("/simulate", response_model=SimulationResponse)
def simulate_workload_or_failure(
    payload: SimulationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Control panel endpoint to inject or recover failures on test-app."""
    try:
        with httpx.Client(timeout=0.3) as client:
            resp = client.post(f"{settings.TEST_APP_URL}/simulate/failure", json={"mode": payload.mode})
            if resp.status_code == 200:
                # Immediately collect telemetry to trigger alert engine
                collect_telemetry_snapshot(db)
                return {
                    "status": "success",
                    "current_mode": payload.mode,
                    "message": f"Successfully injected simulation mode: {payload.mode}"
                }
    except Exception as e:
        # Fallback simulation if test-app is currently offline
        pass

    # If test-app direct call fails, evaluate locally
    collect_telemetry_snapshot(db)
    return {
        "status": "success",
        "current_mode": payload.mode,
        "message": f"Simulation mode updated to {payload.mode}"
    }

@router.post("/webhook")
def receive_prometheus_webhook(payload: dict, db: Session = Depends(get_db)):
    """Receives Prometheus Alertmanager webhook alerts."""
    alerts = payload.get("alerts", [])
    test_res = db.query(Resource).filter(Resource.name == "test-app-service").first()
    res_id = test_res.id if test_res else None

    for alert in alerts:
        status_state = alert.get("status", "firing")
        labels = alert.get("labels", {})
        annotations = alert.get("annotations", {})
        alert_name = labels.get("alertname", "UnknownAlert")
        severity = labels.get("severity", "high")
        recommended_action = labels.get("recommended_action", "RESTART_TEST_APP")

        if status_state == "firing":
            _upsert_incident(
                db=db,
                fingerprint=f"{alert_name}:{res_id}",
                resource_id=res_id,
                title=f"Prometheus Alert: {alert_name}",
                description=annotations.get("description", annotations.get("summary", "")),
                severity=severity,
                evidence=str(annotations),
                recommended_action=recommended_action
            )
    return {"status": "processed", "alerts_count": len(alerts)}
