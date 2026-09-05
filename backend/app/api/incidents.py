from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.security import get_current_user
from backend.app.models.models import Incident, User
from backend.app.schemas.schemas import (
    IncidentResponse, IncidentAcknowledge, RemediationRequest, RemediationJobResponse
)
from backend.app.services.remediation_service import create_remediation_request

router = APIRouter(prefix="/api/incidents", tags=["Incidents & Alerts"])

@router.get("", response_model=List[IncidentResponse])
def list_incidents(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Incident)
    if status:
        query = query.filter(Incident.status == status)
    if severity:
        query = query.filter(Incident.severity == severity)
    return query.order_by(Incident.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.post("/{incident_id}/acknowledge", response_model=IncidentResponse)
def acknowledge_incident(
    incident_id: int,
    payload: IncidentAcknowledge,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    incident.status = "acknowledged"
    db.commit()
    db.refresh(incident)
    return incident

@router.post("/{incident_id}/remediation-requests", response_model=RemediationJobResponse)
def request_incident_remediation(
    incident_id: int,
    payload: RemediationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = create_remediation_request(
        db=db,
        user=current_user,
        action_type=payload.action_type,
        incident_id=incident_id,
        notes=payload.notes
    )
    return job
