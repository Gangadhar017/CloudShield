from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.security import get_current_user, require_admin
from backend.app.models.models import RemediationJob, User
from backend.app.schemas.schemas import (
    RemediationJobResponse, RemediationApproval
)
from backend.app.services.remediation_service import (
    approve_remediation_job, execute_remediation_job
)

router = APIRouter(prefix="/api/remediation", tags=["Controlled Auto-Remediation"])

@router.get("", response_model=List[RemediationJobResponse])
def list_remediation_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(RemediationJob)
    if status:
        query = query.filter(RemediationJob.status == status)
    return query.order_by(RemediationJob.id.desc()).offset(skip).limit(limit).all()

@router.get("/{job_id}", response_model=RemediationJobResponse)
def get_remediation_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = db.query(RemediationJob).filter(RemediationJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Remediation job not found")
    return job

@router.post("/{job_id}/approve", response_model=RemediationJobResponse)
def approve_job(
    job_id: int,
    payload: RemediationApproval,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Admin-only endpoint to approve or reject a proposed remediation action."""
    job = approve_remediation_job(
        db=db,
        admin_user=current_user,
        job_id=job_id,
        approved=payload.approved,
        comment=payload.comment
    )
    return job

@router.post("/{job_id}/execute", response_model=RemediationJobResponse)
def execute_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Admin-only endpoint to execute an approved allowlisted remediation routine."""
    job = execute_remediation_job(
        db=db,
        admin_user=current_user,
        job_id=job_id
    )
    return job
