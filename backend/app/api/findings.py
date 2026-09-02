from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.security import get_current_user
from backend.app.models.models import SecurityFinding, User
from backend.app.schemas.schemas import (
    SecurityFindingResponse, SecurityScanResponse, RemediationRequest, RemediationJobResponse
)
from backend.app.services.scanner_service import run_security_scan, reset_sample_config, DEFAULT_TARGET_PATH
from backend.app.services.remediation_service import create_remediation_request

router = APIRouter(prefix="/api/findings", tags=["Security Findings & Policy Scanner"])

@router.get("", response_model=List[SecurityFindingResponse])
def list_findings(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(SecurityFinding)
    if status:
        query = query.filter(SecurityFinding.status == status)
    if severity:
        query = query.filter(SecurityFinding.severity == severity)
    return query.order_by(SecurityFinding.id.asc()).offset(skip).limit(limit).all()

@router.post("/scan", response_model=SecurityScanResponse)
def trigger_security_scan(
    target_file: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    file_to_scan = target_file or DEFAULT_TARGET_PATH
    scan_result = run_security_scan(
        db=db,
        target_file=file_to_scan,
        actor_email=current_user.email,
        actor_id=current_user.id
    )
    return scan_result

@router.post("/reset-sample")
def reset_sample_configuration(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Demo helper: Resets target_infrastructure.yaml back to its vulnerable state and scans."""
    ok = reset_sample_config()
    if not ok:
        raise HTTPException(status_code=500, detail="Could not reset sample config file.")
    
    scan_result = run_security_scan(
        db=db,
        target_file=DEFAULT_TARGET_PATH,
        actor_email=current_user.email,
        actor_id=current_user.id
    )
    return {
        "status": "success",
        "message": "Sample configuration reset to vulnerable baseline",
        "scan_result": scan_result
    }

@router.post("/{finding_id}/remediation-requests", response_model=RemediationJobResponse)
def request_finding_remediation(
    finding_id: int,
    payload: RemediationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = create_remediation_request(
        db=db,
        user=current_user,
        action_type=payload.action_type,
        finding_id=finding_id,
        notes=payload.notes
    )
    return job
