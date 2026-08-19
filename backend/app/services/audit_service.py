from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from backend.app.models.models import AuditLog

def log_audit(
    db: Session,
    actor_id: Optional[int],
    actor_email: str,
    action: str,
    target: str,
    result: str,
    details: Optional[str] = None
) -> AuditLog:
    entry = AuditLog(
        actor_id=actor_id,
        actor_email=actor_email,
        action=action,
        target=target,
        result=result,
        details=details,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
