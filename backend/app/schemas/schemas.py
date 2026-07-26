from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, ConfigDict

# Auth Schemas
class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    role: str = "operator"

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    role: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

# Resource Schemas
class ResourceBase(BaseModel):
    name: str
    resource_type: str
    endpoint_or_path: Optional[str] = None
    status: str = "healthy"

class ResourceCreate(ResourceBase):
    pass

class ResourceResponse(ResourceBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    last_seen: datetime

# Metric Schemas
class MetricCreate(BaseModel):
    resource_id: int
    metric_name: str
    value: float

class MetricResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    resource_id: int
    metric_name: str
    value: float
    timestamp: datetime

class TelemetrySnapshot(BaseModel):
    timestamp: datetime
    cpu_usage: float
    memory_usage: float
    latency_ms: float
    error_rate: float
    app_health: float

# Security Finding Schemas
class SecurityFindingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    rule_id: str
    rule_name: str
    severity: str
    resource_id: Optional[int] = None
    target_file: str
    evidence: str
    recommendation: str
    status: str
    first_detected: datetime
    last_observed: datetime

class SecurityScanResponse(BaseModel):
    scanned_file: str
    total_findings: int
    new_findings: int
    resolved_findings: int
    findings: List[SecurityFindingResponse]

# Incident Schemas
class IncidentCreate(BaseModel):
    fingerprint: str
    resource_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    severity: str = "high"
    evidence: Optional[str] = None
    recommended_action: Optional[str] = None

class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    fingerprint: str
    resource_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    severity: str
    status: str
    evidence: Optional[str] = None
    recommended_action: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

class IncidentAcknowledge(BaseModel):
    status: str = "acknowledged"

# Remediation Schemas
class RemediationRequest(BaseModel):
    action_type: str  # Must match allowlist
    notes: Optional[str] = None

class RemediationApproval(BaseModel):
    approved: bool = True
    comment: Optional[str] = None

class RemediationJobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    incident_id: Optional[int] = None
    finding_id: Optional[int] = None
    target_resource: str
    action_type: str
    status: str
    requested_by: int
    approved_by: Optional[int] = None
    before_evidence: Optional[str] = None
    after_evidence: Optional[str] = None
    verification_passed: bool
    error_details: Optional[str] = None
    created_at: datetime
    executed_at: Optional[datetime] = None

# Audit Log Schemas
class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    actor_id: Optional[int] = None
    actor_email: str
    action: str
    target: str
    result: str
    details: Optional[str] = None
    timestamp: datetime

# Dashboard Summary Schema
class DashboardSummary(BaseModel):
    total_resources: int
    healthy_resources: int
    open_incidents: int
    active_findings: int
    system_status: str
    recent_metrics: List[TelemetrySnapshot]
    incident_severity_counts: Dict[str, int]
    finding_severity_counts: Dict[str, int]

# Simulation Schemas
class SimulationRequest(BaseModel):
    mode: str  # 'healthy', 'unhealthy', 'high_cpu', 'high_memory', 'high_error_rate', 'high_latency'

class SimulationResponse(BaseModel):
    status: str
    current_mode: str
    message: str
