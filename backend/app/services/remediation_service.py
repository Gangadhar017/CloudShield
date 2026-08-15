from datetime import datetime, timezone
from typing import Optional, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.app.models.models import RemediationJob, Incident, SecurityFinding, User
from backend.app.services.audit_service import log_audit
from backend.app.services.scanner_service import run_security_scan
from remediation.actions import ACTION_REGISTRY
from backend.app.core.config import settings

def create_remediation_request(
    db: Session,
    user: User,
    action_type: str,
    incident_id: Optional[int] = None,
    finding_id: Optional[int] = None,
    notes: Optional[str] = None
) -> RemediationJob:
    # 1. Validate action is strictly in allowlist
    if action_type not in ACTION_REGISTRY:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Action '{action_type}' is not permitted. Must be an allowlisted action."
        )

    target_name = "System"

    # 2. Prevent duplicate pending requests
    if incident_id:
        incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            raise HTTPException(status_code=404, detail="Incident not found")
        target_name = f"Incident #{incident.id}: {incident.title}"
        existing = db.query(RemediationJob).filter(
            RemediationJob.incident_id == incident_id,
            RemediationJob.status.in_(["pending", "approved", "executing"])
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="A remediation job is already pending for this incident.")

    if finding_id:
        finding = db.query(SecurityFinding).filter(SecurityFinding.id == finding_id).first()
        if not finding:
            raise HTTPException(status_code=404, detail="Security finding not found")
        target_name = f"Finding #{finding.id}: {finding.rule_id} ({finding.rule_name})"
        existing = db.query(RemediationJob).filter(
            RemediationJob.finding_id == finding_id,
            RemediationJob.status.in_(["pending", "approved", "executing"])
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="A remediation job is already pending for this finding.")

    job = RemediationJob(
        incident_id=incident_id,
        finding_id=finding_id,
        target_resource=target_name,
        action_type=action_type,
        status="pending",
        requested_by=user.id,
        error_details=notes,
        created_at=datetime.now(timezone.utc)
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    log_audit(
        db, actor_id=user.id, actor_email=user.email,
        action="REMEDIATION_REQUESTED", target=target_name,
        result="success", details=f"Action: {action_type}. Job ID: {job.id}"
    )

    return job

def approve_remediation_job(
    db: Session,
    admin_user: User,
    job_id: int,
    approved: bool = True,
    comment: Optional[str] = None
) -> RemediationJob:
    job = db.query(RemediationJob).filter(RemediationJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Remediation job not found")

    if job.status not in ["pending"]:
        raise HTTPException(status_code=400, detail=f"Job cannot be approved in current status: {job.status}")

    job.approved_by = admin_user.id
    if approved:
        job.status = "approved"
        action_name = "REMEDIATION_APPROVED"
        res_label = "success"
    else:
        job.status = "failed"
        job.error_details = f"Rejected by admin: {comment or 'No comment'}"
        action_name = "REMEDIATION_REJECTED"
        res_label = "rejected"

    db.commit()
    db.refresh(job)

    log_audit(
        db, actor_id=admin_user.id, actor_email=admin_user.email,
        action=action_name, target=job.target_resource,
        result=res_label, details=f"Job #{job.id}. Comment: {comment or 'None'}"
    )

    return job

def execute_remediation_job(
    db: Session,
    admin_user: User,
    job_id: int
) -> RemediationJob:
    job = db.query(RemediationJob).filter(RemediationJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Remediation job not found")

    if job.status not in ["approved", "pending"]:
        raise HTTPException(status_code=400, detail=f"Job must be approved before execution (current: {job.status})")

    # Mark as approved if executing directly by admin
    if not job.approved_by:
        job.approved_by = admin_user.id

    job.status = "executing"
    job.executed_at = datetime.now(timezone.utc)
    db.commit()

    action_fn = ACTION_REGISTRY.get(job.action_type)
    if not action_fn:
        job.status = "failed"
        job.error_details = f"Action handler '{job.action_type}' not found in registry"
        db.commit()
        return job

    # Execute action
    try:
        if job.action_type == "RESTART_TEST_APP":
            exec_result = action_fn(test_app_url=settings.TEST_APP_URL)
        else:
            exec_result = action_fn()
    except Exception as e:
        exec_result = {
            "success": False,
            "verification_passed": False,
            "before_evidence": "Unknown",
            "after_evidence": f"Execution error: {str(e)}",
            "error": str(e)
        }

    job.before_evidence = str(exec_result.get("before_evidence", ""))
    job.after_evidence = str(exec_result.get("after_evidence", ""))
    job.verification_passed = bool(exec_result.get("verification_passed", False))
    job.error_details = exec_result.get("error")

    now = datetime.now(timezone.utc)

    # Post-Action Verification check
    if job.verification_passed:
        job.status = "succeeded"

        # If it was an Incident, resolve it
        if job.incident_id:
            incident = db.query(Incident).filter(Incident.id == job.incident_id).first()
            if incident:
                incident.status = "resolved"
                incident.resolved_at = now

        # If it was a config fix, re-scan to trigger automated verification
        if job.action_type.startswith("FIX_SEC_"):
            run_security_scan(db, actor_email="remediation-verifier", actor_id=admin_user.id)
            if job.finding_id:
                finding = db.query(SecurityFinding).filter(SecurityFinding.id == job.finding_id).first()
                if finding:
                    finding.status = "resolved"

        log_audit(
            db, actor_id=admin_user.id, actor_email=admin_user.email,
            action="REMEDIATION_EXECUTED", target=job.target_resource,
            result="success",
            details=f"Job #{job.id} verified and resolved. After: {job.after_evidence}"
        )
    else:
        # Failure retention: Incident stays OPEN!
        job.status = "failed"
        log_audit(
            db, actor_id=admin_user.id, actor_email=admin_user.email,
            action="REMEDIATION_EXECUTION_FAILED", target=job.target_resource,
            result="failure",
            details=f"Job #{job.id} failed verification: {job.error_details}"
        )

    db.commit()
    db.refresh(job)
    return job
