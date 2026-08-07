import os
import shutil
import yaml
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session

from backend.app.models.models import SecurityFinding, Resource
from backend.app.services.audit_service import log_audit

DEFAULT_POLICIES_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../../security-rules/policies.yaml")
)
DEFAULT_TARGET_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../../security-rules/samples/target_infrastructure.yaml")
)
BACKUP_TARGET_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../../security-rules/samples/unsafe_backup.yaml")
)

def load_yaml(file_path: str) -> Tuple[bool, Any, str]:
    if not os.path.exists(file_path):
        return False, None, f"File not found: {file_path}"
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
            return True, data or {}, ""
    except Exception as e:
        return False, None, f"YAML parse error in {file_path}: {str(e)}"

def evaluate_rules(config: Dict[str, Any]) -> List[Dict[str, Any]]:
    violations = []

    # SEC-001: Public Storage Access
    storage = config.get("storage", {}) if isinstance(config, dict) else {}
    if isinstance(storage, dict) and storage.get("public_access") is True:
        violations.append({
            "rule_id": "SEC-001",
            "rule_name": "Public Storage Access Enabled",
            "severity": "high",
            "evidence": f"storage.public_access = {storage.get('public_access')} (Bucket: {storage.get('bucket_name', 'unknown')})",
            "recommendation": "Set storage.public_access to false and restrict bucket policy to authenticated roles."
        })

    # SEC-002: Missing Storage Encryption
    if isinstance(storage, dict):
        enc_req = storage.get("encryption_required")
        algo = storage.get("algorithm", "NONE")
        if enc_req is not True or str(algo).upper() != "AES-256":
            violations.append({
                "rule_id": "SEC-002",
                "rule_name": "Missing Storage Encryption Requirement",
                "severity": "medium",
                "evidence": f"storage.encryption_required = {enc_req}, algorithm = '{algo}'",
                "recommendation": "Configure encryption_required: true and algorithm: AES-256."
            })

    # SEC-003: Wildcard IAM Permissions
    iam = config.get("iam", {}) if isinstance(config, dict) else {}
    if isinstance(iam, dict):
        actions = iam.get("actions", [])
        resources = iam.get("resources", [])
        has_wildcard_actions = any(a == "*" or (isinstance(a, str) and ":*" in a) for a in actions)
        has_wildcard_res = any(r == "*" for r in resources)
        if has_wildcard_actions or has_wildcard_res:
            violations.append({
                "rule_id": "SEC-003",
                "rule_name": "Wildcard IAM Administrative Permissions",
                "severity": "critical",
                "evidence": f"iam.actions = {actions}, iam.resources = {resources} (Role: {iam.get('role_name', 'unknown')})",
                "recommendation": "Replace wildcard '*' with granular actions like s3:GetObject, ec2:DescribeInstances."
            })

    # SEC-004: Unrestricted Inbound Access on Sensitive Ports
    network = config.get("network", {}) if isinstance(config, dict) else {}
    if isinstance(network, dict):
        ingress = network.get("ingress_rules", [])
        sensitive_ports = [22, 3389, 5432]
        open_sensitive = []
        if isinstance(ingress, list):
            for rule in ingress:
                if isinstance(rule, dict):
                    port = rule.get("port")
                    cidr = rule.get("cidr")
                    if port in sensitive_ports and cidr == "0.0.0.0/0":
                        open_sensitive.append(f"Port {port} open to 0.0.0.0/0")
        if open_sensitive:
            violations.append({
                "rule_id": "SEC-004",
                "rule_name": "Unrestricted Inbound Network Access on Sensitive Ports",
                "severity": "high",
                "evidence": f"Sensitive ports exposed: {', '.join(open_sensitive)} (SG: {network.get('security_group_name', 'unknown')})",
                "recommendation": "Restrict ingress CIDR from 0.0.0.0/0 to authorized internal VPC/subnets (e.g. 10.0.0.0/8)."
            })

    # SEC-005: Privileged Container Execution
    container = config.get("container", {}) if isinstance(config, dict) else {}
    if isinstance(container, dict) and container.get("privileged") is True:
        violations.append({
            "rule_id": "SEC-005",
            "rule_name": "Privileged Execution Enabled in Container Spec",
            "severity": "high",
            "evidence": f"container.privileged = true (Service: {container.get('service_name', 'unknown')})",
            "recommendation": "Disable container.privileged (set to false) and adhere to non-root least-privilege standards."
        })

    return violations

def run_security_scan(
    db: Session,
    target_file: str = DEFAULT_TARGET_PATH,
    actor_email: str = "system",
    actor_id: int = None
) -> Dict[str, Any]:
    success, config_data, err_msg = load_yaml(target_file)
    if not success:
        log_audit(
            db, actor_id=actor_id, actor_email=actor_email,
            action="SECURITY_SCAN_FAILED", target=target_file,
            result="failure", details=err_msg
        )
        return {
            "scanned_file": target_file,
            "total_findings": 0,
            "new_findings": 0,
            "resolved_findings": 0,
            "error": err_msg,
            "findings": []
        }

    violations = evaluate_rules(config_data)
    violated_rule_ids = {v["rule_id"] for v in violations}

    # Find resource to link
    resource = db.query(Resource).filter(Resource.name == "target-cloud-config").first()
    resource_id = resource.id if resource else None

    # Fetch existing findings for this file
    existing_findings = db.query(SecurityFinding).filter(
        SecurityFinding.target_file == target_file
    ).all()
    existing_map = {f.rule_id: f for f in existing_findings}

    now = datetime.now(timezone.utc)
    new_count = 0
    resolved_count = 0

    # Upsert active violations
    for v in violations:
        rule_id = v["rule_id"]
        if rule_id in existing_map:
            finding = existing_map[rule_id]
            finding.last_observed = now
            finding.evidence = v["evidence"]
            finding.status = "open"
        else:
            finding = SecurityFinding(
                rule_id=rule_id,
                rule_name=v["rule_name"],
                severity=v["severity"],
                resource_id=resource_id,
                target_file=target_file,
                evidence=v["evidence"],
                recommendation=v["recommendation"],
                status="open",
                first_detected=now,
                last_observed=now
            )
            db.add(finding)
            new_count += 1

    # Check for resolved findings (previously open, but rule is no longer violated)
    for rule_id, finding in existing_map.items():
        if rule_id not in violated_rule_ids and finding.status == "open":
            finding.status = "resolved"
            finding.last_observed = now
            resolved_count += 1

    db.commit()

    # Re-fetch all findings for this file
    all_findings = db.query(SecurityFinding).filter(
        SecurityFinding.target_file == target_file
    ).order_by(SecurityFinding.id.asc()).all()

    log_audit(
        db, actor_id=actor_id, actor_email=actor_email,
        action="SECURITY_SCAN_COMPLETED", target=target_file,
        result="success",
        details=f"Scan complete. Active violations: {len(violations)}, Resolved: {resolved_count}, New: {new_count}"
    )

    return {
        "scanned_file": target_file,
        "total_findings": len(violations),
        "new_findings": new_count,
        "resolved_findings": resolved_count,
        "findings": all_findings
    }

def reset_sample_config() -> bool:
    if os.path.exists(BACKUP_TARGET_PATH):
        shutil.copyfile(BACKUP_TARGET_PATH, DEFAULT_TARGET_PATH)
        return True
    return False
