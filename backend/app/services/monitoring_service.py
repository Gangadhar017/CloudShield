import random
import re
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import httpx
from sqlalchemy.orm import Session

from backend.app.models.models import Metric, Resource, Incident, SecurityFinding
from backend.app.core.config import settings

def parse_prometheus_metrics(raw_text: str) -> Dict[str, float]:
    """Parse Prometheus text-format metrics."""
    metrics = {}
    for line in raw_text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        # Match 'metric_name{labels} value' or 'metric_name value'
        match = re.match(r"^([a-zA-Z_:][a-zA-Z0-9_:]*)\s*(\{.*\})?\s+([0-9eE\.\+\-]+)$", line)
        if match:
            metric_name = match.group(1)
            val = float(match.group(3))
            metrics[metric_name] = val
    return metrics

def collect_telemetry_snapshot(db: Session) -> Dict[str, Any]:
    """Collect real telemetry from test-app or generate calibrated metrics."""
    resource = db.query(Resource).filter(Resource.name == "test-app-service").first()
    if not resource:
        resource = Resource(
            name="test-app-service",
            resource_type="application",
            endpoint_or_path=settings.TEST_APP_URL,
            status="healthy"
        )
        db.add(resource)
        db.commit()
        db.refresh(resource)

    cpu_val = 24.5
    mem_val = 45.2
    health_val = 1.0
    latency_val = 42.0
    error_rate = 0.0

    # Try fetching real metrics from test-app
    try:
        with httpx.Client(timeout=0.3) as client:
            resp = client.get(f"{settings.TEST_APP_URL}/metrics")
            if resp.status_code == 200:
                parsed = parse_prometheus_metrics(resp.text)
                cpu_val = parsed.get("app_cpu_usage_percent", cpu_val)
                mem_val = parsed.get("app_memory_usage_percent", mem_val)
                health_val = parsed.get("app_health_status", health_val)
                latency_val = parsed.get("app_request_latency_ms", latency_val)
            # Check /health probe
            h_resp = client.get(f"{settings.TEST_APP_URL}/health")
            if h_resp.status_code != 200:
                health_val = 0.0
    except Exception:
        # If test-app is not reachable, mark as unavailable
        health_val = 0.0

    now = datetime.now(timezone.utc)

    # Update resource status
    if health_val == 0.0:
        resource.status = "unhealthy"
    elif cpu_val > 80.0 or mem_val > 85.0 or latency_val > 1000.0:
        resource.status = "degraded"
    else:
        resource.status = "healthy"
    resource.last_seen = now

    # Store time-series metrics
    m_cpu = Metric(resource_id=resource.id, metric_name="cpu_usage", value=cpu_val, timestamp=now)
    m_mem = Metric(resource_id=resource.id, metric_name="memory_usage", value=mem_val, timestamp=now)
    m_health = Metric(resource_id=resource.id, metric_name="app_health", value=health_val, timestamp=now)
    m_lat = Metric(resource_id=resource.id, metric_name="latency_ms", value=latency_val, timestamp=now)
    db.add_all([m_cpu, m_mem, m_health, m_lat])
    db.commit()

    # Threshold evaluation and Alert deduplication
    evaluate_threshold_rules(db, resource, cpu_val, mem_val, health_val, latency_val)

    return {
        "timestamp": now,
        "cpu_usage": cpu_val,
        "memory_usage": mem_val,
        "app_health": health_val,
        "latency_ms": latency_val,
        "error_rate": error_rate
    }

def evaluate_threshold_rules(
    db: Session,
    resource: Resource,
    cpu: float,
    mem: float,
    health: float,
    latency: float
):
    now = datetime.now(timezone.utc)

    # 1. Health check breach
    if health == 0.0:
        _upsert_incident(
            db=db,
            fingerprint=f"ApplicationUnavailable:{resource.id}",
            resource_id=resource.id,
            title="Critical: Application Health Probe Outage",
            description="The test application failed continuous health checks (/health returned 500 or connection refused).",
            severity="critical",
            evidence=f"app_health_status = 0.0, Resource: {resource.name}",
            recommended_action="RESTART_TEST_APP"
        )

    # 2. High CPU breach (> 80%)
    if cpu > 80.0:
        _upsert_incident(
            db=db,
            fingerprint=f"HighCPUUtilization:{resource.id}",
            resource_id=resource.id,
            title="High CPU Utilization Alert",
            description=f"CPU utilization sustained above configured threshold at {cpu:.1f}%.",
            severity="high",
            evidence=f"cpu_usage = {cpu:.1f}% (Threshold: 80.0%)",
            recommended_action="RESTART_TEST_APP"
        )

    # 3. High Latency breach (> 1000ms)
    if latency > 1000.0:
        _upsert_incident(
            db=db,
            fingerprint=f"HighRequestLatency:{resource.id}",
            resource_id=resource.id,
            title="Elevated HTTP Request Latency",
            description=f"Observed service response latency spiked to {latency:.1f}ms.",
            severity="medium",
            evidence=f"latency = {latency:.1f}ms (Threshold: 1000.0ms)",
            recommended_action="RESTART_TEST_APP"
        )

def _upsert_incident(
    db: Session,
    fingerprint: str,
    resource_id: int,
    title: str,
    description: str,
    severity: str,
    evidence: str,
    recommended_action: str
):
    """Stable fingerprint-based deduplication to prevent alert storms."""
    existing = db.query(Incident).filter(
        Incident.fingerprint == fingerprint,
        Incident.status.in_(["open", "acknowledged"])
    ).first()

    if existing:
        existing.evidence = evidence
        existing.description = description
    else:
        new_inc = Incident(
            fingerprint=fingerprint,
            resource_id=resource_id,
            title=title,
            description=description,
            severity=severity,
            status="open",
            evidence=evidence,
            recommended_action=recommended_action,
            created_at=datetime.now(timezone.utc)
        )
        db.add(new_inc)
    db.commit()

def get_dashboard_summary(db: Session) -> Dict[str, Any]:
    resources = db.query(Resource).all()
    total_res = len(resources)
    healthy_res = sum(1 for r in resources if r.status == "healthy")

    open_incidents = db.query(Incident).filter(Incident.status.in_(["open", "acknowledged"])).all()
    active_findings = db.query(SecurityFinding).filter(SecurityFinding.status == "open").all()

    # System Status logic
    if any(i.severity == "critical" for i in open_incidents) or any(f.severity == "critical" for f in active_findings):
        system_status = "Critical"
    elif open_incidents or active_findings or (total_res > healthy_res):
        system_status = "Degraded"
    else:
        system_status = "Healthy"

    # Incident counts by severity
    inc_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for i in open_incidents:
        sev = i.severity.lower()
        if sev in inc_counts:
            inc_counts[sev] += 1

    # Finding counts by severity
    find_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for f in active_findings:
        sev = f.severity.lower()
        if sev in find_counts:
            find_counts[sev] += 1

    # Recent metrics (last 20 snapshots)
    recent_metrics = []
    test_res = db.query(Resource).filter(Resource.name == "test-app-service").first()
    if test_res:
        metrics_rows = db.query(Metric).filter(
            Metric.resource_id == test_res.id
        ).order_by(Metric.timestamp.desc()).limit(80).all()

        # Group by timestamp
        groups = {}
        for m in reversed(metrics_rows):
            ts = m.timestamp.isoformat()
            if ts not in groups:
                groups[ts] = {"timestamp": m.timestamp, "cpu_usage": 25.0, "memory_usage": 45.0, "latency_ms": 40.0, "app_health": 1.0, "error_rate": 0.0}
            if m.metric_name == "cpu_usage":
                groups[ts]["cpu_usage"] = m.value
            elif m.metric_name == "memory_usage":
                groups[ts]["memory_usage"] = m.value
            elif m.metric_name == "latency_ms":
                groups[ts]["latency_ms"] = m.value
            elif m.metric_name == "app_health":
                groups[ts]["app_health"] = m.value

        recent_metrics = list(groups.values())[-20:]

    return {
        "total_resources": total_res,
        "healthy_resources": healthy_res,
        "open_incidents": len(open_incidents),
        "active_findings": len(active_findings),
        "system_status": system_status,
        "recent_metrics": recent_metrics,
        "incident_severity_counts": inc_counts,
        "finding_severity_counts": find_counts
    }
