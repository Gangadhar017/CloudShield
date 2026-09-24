import os
import pytest
from unittest.mock import patch
from backend.app.models.models import Incident, SecurityFinding, RemediationJob

def test_scenario_a_app_recovery_workflow(client, admin_headers, operator_headers, db_session):
    # 1. Simulate failure detected: create an open incident
    incident = Incident(
        fingerprint="ApplicationUnavailable:1",
        resource_id=1,
        title="Critical: Application Health Probe Outage",
        severity="critical",
        status="open",
        evidence="Health returned 500",
        recommended_action="RESTART_TEST_APP"
    )
    db_session.add(incident)
    db_session.commit()
    db_session.refresh(incident)

    # 2. Operator requests remediation
    res_req = client.post(
        f"/api/incidents/{incident.id}/remediation-requests",
        json={"action_type": "RESTART_TEST_APP", "notes": "Health probe failing"},
        headers=operator_headers
    )
    assert res_req.status_code == 200
    job_id = res_req.json()["id"]
    assert res_req.json()["status"] == "pending"

    # 3. Duplicate request prevention check
    res_dup = client.post(
        f"/api/incidents/{incident.id}/remediation-requests",
        json={"action_type": "RESTART_TEST_APP"},
        headers=operator_headers
    )
    assert res_dup.status_code == 400

    # 4. Admin executes the remediation job (mocking successful recovery action)
    mock_result = {
        "success": True,
        "verification_passed": True,
        "before_evidence": "HTTP 500: Outage",
        "after_evidence": "HTTP 200 OK: Healthy",
        "error": None
    }
    with patch.dict("remediation.actions.ACTION_REGISTRY", {"RESTART_TEST_APP": lambda **kw: mock_result}):
        res_exec = client.post(f"/api/remediation/{job_id}/execute", headers=admin_headers)
        assert res_exec.status_code == 200
        data = res_exec.json()
        assert data["status"] == "succeeded"
        assert data["verification_passed"] is True

    # 5. Incident must now be marked RESOLVED
    db_session.refresh(incident)
    assert incident.status == "resolved"
    assert incident.resolved_at is not None

def test_scenario_b_config_remediation_workflow(client, admin_headers, operator_headers, db_session):
    # 1. Create a security finding for SEC-001
    finding = SecurityFinding(
        rule_id="SEC-001",
        rule_name="Public Storage Access Enabled",
        severity="high",
        target_file="test_target.yaml",
        evidence="storage.public_access = true",
        recommendation="Disable public access",
        status="open"
    )
    db_session.add(finding)
    db_session.commit()
    db_session.refresh(finding)

    # 2. Operator requests config fix
    res_req = client.post(
        f"/api/findings/{finding.id}/remediation-requests",
        json={"action_type": "FIX_SEC_001"},
        headers=operator_headers
    )
    assert res_req.status_code == 200
    job_id = res_req.json()["id"]

    # 3. Admin approves and executes
    mock_result = {
        "success": True,
        "verification_passed": True,
        "before_evidence": "storage.public_access was true",
        "after_evidence": "Patched storage.public_access = false",
        "error": None
    }
    with patch.dict("remediation.actions.ACTION_REGISTRY", {"FIX_SEC_001": lambda **kw: mock_result}):
        with patch("backend.app.services.remediation_service.run_security_scan"):
            res_exec = client.post(f"/api/remediation/{job_id}/execute", headers=admin_headers)
            assert res_exec.status_code == 200
            assert res_exec.json()["status"] == "succeeded"

    # 4. Finding is now resolved
    db_session.refresh(finding)
    assert finding.status == "resolved"

def test_failure_retention_when_action_fails(client, admin_headers, operator_headers, db_session):
    """
    CRITICAL EXIT TEST:
    If remediation fails verification, the incident must remain OPEN
    and the action marked failed or timed out.
    """
    incident = Incident(
        fingerprint="UnstableApp:1",
        resource_id=1,
        title="Unstable App Failure",
        severity="high",
        status="open",
        evidence="Outage",
        recommended_action="SIMULATE_FAILED_ACTION"
    )
    db_session.add(incident)
    db_session.commit()
    db_session.refresh(incident)

    # Request failure simulation action
    res_req = client.post(
        f"/api/incidents/{incident.id}/remediation-requests",
        json={"action_type": "SIMULATE_FAILED_ACTION"},
        headers=operator_headers
    )
    job_id = res_req.json()["id"]

    # Execute failed action
    res_exec = client.post(f"/api/remediation/{job_id}/execute", headers=admin_headers)
    assert res_exec.status_code == 200
    job_data = res_exec.json()
    assert job_data["status"] == "failed"
    assert job_data["verification_passed"] is False

    # Incident must STILL be OPEN!
    db_session.refresh(incident)
    assert incident.status == "open"
