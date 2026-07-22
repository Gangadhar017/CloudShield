from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="operator")  # 'admin' or 'operator'
    created_at = Column(DateTime, default=utcnow, nullable=False)

    # Relationships
    requested_remediations = relationship("RemediationJob", foreign_keys="RemediationJob.requested_by", back_populates="requester")
    approved_remediations = relationship("RemediationJob", foreign_keys="RemediationJob.approved_by", back_populates="approver")
    audit_logs = relationship("AuditLog", back_populates="actor")


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    resource_type = Column(String(100), nullable=False)  # 'application', 'storage_config', 'network_config', 'container_spec'
    endpoint_or_path = Column(String(500), nullable=True)
    status = Column(String(50), default="healthy", index=True, nullable=False)  # 'healthy', 'degraded', 'unhealthy'
    last_seen = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    # Relationships
    metrics = relationship("Metric", back_populates="resource", cascade="all, delete-orphan")
    findings = relationship("SecurityFinding", back_populates="resource")
    incidents = relationship("Incident", back_populates="resource")


class Metric(Base):
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False, index=True)
    metric_name = Column(String(100), nullable=False, index=True)  # 'cpu_usage', 'memory_usage', 'app_health', 'error_rate', 'latency_ms'
    value = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=utcnow, index=True, nullable=False)

    resource = relationship("Resource", back_populates="metrics")

    __table_args__ = (
        Index("idx_metric_resource_timestamp", "resource_id", "timestamp"),
    )


class SecurityFinding(Base):
    __tablename__ = "security_findings"

    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(String(50), index=True, nullable=False)  # 'SEC-001', 'SEC-002', etc.
    rule_name = Column(String(255), nullable=False)
    severity = Column(String(50), nullable=False, index=True)  # 'critical', 'high', 'medium', 'low'
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=True)
    target_file = Column(String(500), nullable=False)
    evidence = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=False)
    status = Column(String(50), default="open", index=True, nullable=False)  # 'open', 'resolved'
    first_detected = Column(DateTime, default=utcnow, nullable=False)
    last_observed = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    resource = relationship("Resource", back_populates="findings")
    remediations = relationship("RemediationJob", back_populates="finding")


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    fingerprint = Column(String(255), index=True, nullable=False)  # unique active key: 'rule_name + resource_id'
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String(50), default="high", index=True, nullable=False)  # 'critical', 'high', 'medium', 'low'
    status = Column(String(50), default="open", index=True, nullable=False)  # 'open', 'acknowledged', 'resolved'
    evidence = Column(Text, nullable=True)
    recommended_action = Column(String(100), nullable=True)  # 'RESTART_TEST_APP', etc.
    created_at = Column(DateTime, default=utcnow, index=True, nullable=False)
    resolved_at = Column(DateTime, nullable=True)

    resource = relationship("Resource", back_populates="incidents")
    remediations = relationship("RemediationJob", back_populates="incident")


class RemediationJob(Base):
    __tablename__ = "remediation_jobs"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    finding_id = Column(Integer, ForeignKey("security_findings.id"), nullable=True)
    target_resource = Column(String(255), nullable=False)
    action_type = Column(String(100), nullable=False)  # allowlisted identifier
    status = Column(String(50), default="pending", index=True, nullable=False)  # 'pending', 'approved', 'executing', 'succeeded', 'failed', 'timed_out'
    requested_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    before_evidence = Column(Text, nullable=True)
    after_evidence = Column(Text, nullable=True)
    verification_passed = Column(Boolean, default=False)
    error_details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    executed_at = Column(DateTime, nullable=True)

    incident = relationship("Incident", back_populates="remediations")
    finding = relationship("SecurityFinding", back_populates="remediations")
    requester = relationship("User", foreign_keys=[requested_by], back_populates="requested_remediations")
    approver = relationship("User", foreign_keys=[approved_by], back_populates="approved_remediations")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    actor_email = Column(String(255), nullable=False)
    action = Column(String(100), nullable=False, index=True)
    target = Column(String(255), nullable=False)
    result = Column(String(50), nullable=False, index=True)  # 'success', 'failure', 'rejected'
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=utcnow, index=True, nullable=False)

    actor = relationship("User", back_populates="audit_logs")
