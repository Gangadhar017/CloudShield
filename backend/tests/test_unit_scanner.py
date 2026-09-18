import os
import pytest
from backend.app.services.scanner_service import evaluate_rules, load_yaml

def test_sec_001_public_storage():
    # Positive test: public access enabled
    config_unsafe = {"storage": {"public_access": True, "encryption_required": True, "algorithm": "AES-256"}}
    violations = evaluate_rules(config_unsafe)
    assert any(v["rule_id"] == "SEC-001" for v in violations)

    # Negative test: public access disabled
    config_safe = {"storage": {"public_access": False, "encryption_required": True, "algorithm": "AES-256"}}
    violations = evaluate_rules(config_safe)
    assert not any(v["rule_id"] == "SEC-001" for v in violations)

def test_sec_002_missing_encryption():
    # Positive: encryption missing or not AES-256
    config_unsafe = {"storage": {"public_access": False, "encryption_required": False, "algorithm": "NONE"}}
    violations = evaluate_rules(config_unsafe)
    assert any(v["rule_id"] == "SEC-002" for v in violations)

    # Negative: AES-256 encryption enabled
    config_safe = {"storage": {"public_access": False, "encryption_required": True, "algorithm": "AES-256"}}
    violations = evaluate_rules(config_safe)
    assert not any(v["rule_id"] == "SEC-002" for v in violations)

def test_sec_003_wildcard_iam():
    # Positive: wildcard in actions
    config_unsafe = {"iam": {"actions": ["*"], "resources": ["arn:aws:s3:::bucket/*"]}}
    violations = evaluate_rules(config_unsafe)
    assert any(v["rule_id"] == "SEC-003" for v in violations)

    # Negative: granular actions
    config_safe = {"iam": {"actions": ["s3:GetObject", "s3:PutObject"], "resources": ["arn:aws:s3:::bucket/*"]}}
    violations = evaluate_rules(config_safe)
    assert not any(v["rule_id"] == "SEC-003" for v in violations)

def test_sec_004_unrestricted_ingress():
    # Positive: 0.0.0.0/0 on SSH port 22
    config_unsafe = {"network": {"ingress_rules": [{"port": 22, "cidr": "0.0.0.0/0"}]}}
    violations = evaluate_rules(config_unsafe)
    assert any(v["rule_id"] == "SEC-004" for v in violations)

    # Negative: restricted CIDR 10.0.0.0/8
    config_safe = {"network": {"ingress_rules": [{"port": 22, "cidr": "10.0.0.0/8"}]}}
    violations = evaluate_rules(config_safe)
    assert not any(v["rule_id"] == "SEC-004" for v in violations)

def test_sec_005_privileged_container():
    # Positive: privileged = True
    config_unsafe = {"container": {"privileged": True}}
    violations = evaluate_rules(config_unsafe)
    assert any(v["rule_id"] == "SEC-005" for v in violations)

    # Negative: privileged = False
    config_safe = {"container": {"privileged": False}}
    violations = evaluate_rules(config_safe)
    assert not any(v["rule_id"] == "SEC-005" for v in violations)

def test_load_yaml_malformed_and_missing():
    # Missing file
    success, data, err = load_yaml("non_existent_file_path.yaml")
    assert not success
    assert "not found" in err.lower()

    # Empty dictionary handles safely
    violations = evaluate_rules({})
    assert len(violations) > 0  # Missing encryption triggers
