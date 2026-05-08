# CloudShield: Problem Statement and Motivation

## 1. Project Title
**CloudShield: Design and Development of an Intelligent Cloud Security, Monitoring and Auto-Remediation Platform**

## 2. Academic Context
- **Domain:** Cloud Computing, DevOps Automation, DevSecOps, and Infrastructure Reliability Engineering
- **Project Type:** Web-based Cloud Operations and Security Management Platform
- **Team Size:** 4 Students (B.Tech Final Year Capstone Project)
- **Target Timeline:** 24 Weeks (6 Months)
- **Mandatory Cloud Budget:** ₹0 (Local-first architecture using Docker Compose, Prometheus, FastAPI, and React)

---

## 3. Executive Problem Statement
Modern cloud applications demand continuous telemetry monitoring, baseline security compliance, and swift incident mitigation to preserve high availability and protect sensitive cloud assets. In real-world enterprise infrastructure, operations and security teams face severe operational friction:

1. **Fragmented Tooling:** Performance metrics are captured in one system (e.g., Prometheus/Datadog), misconfigurations are flagged by separate security scanners (e.g., Prowler/Checkov), and alerts are triaged in isolated ticketing software (e.g., Jira/PagerDuty).
2. **Alert Fatigue & High Mean Time to Detect (MTTD):** Without automated correlation and fingerprint-based deduplication, recurring transient failures flood operator consoles, obscuring genuine critical outages.
3. **Delayed Manual Response & High Mean Time to Remediate (MTTR):** Operations personnel must manually correlate an incident, identify the offending component, craft recovery scripts, and verify whether the fix succeeded—introducing human error and extended downtime.
4. **Lack of Controlled & Auditable Remediation:** Uncontrolled automation poses catastrophic risks of rogue shell execution or accidental infrastructure destruction, while purely manual remediation suffers from delays and lack of tamper-proof audit trails.

**CloudShield** solves this core problem by delivering a unified, local-first platform that seamlessly bridges the gap between **Real-Time Telemetry Monitoring**, **Rule-Based Security Policy Evaluation**, **Intelligent Incident Correlation**, and **Safe, Allowlisted, Pre-Approved Auto-Remediation with Closed-Loop Verification**.

---

## 4. Key Innovation: Closed-Loop Remediation
Unlike existing open-source monitoring dashboards that terminate at detection (merely reporting "CPU is High" or "Storage is Public"), CloudShield implements a deterministic 6-stage lifecycle:

```text
[1. Detection Engine] 
         │ (Threshold breach or Policy violation)
         ▼
[2. Action Proposal] 
         │ (Maps problem to strict allowlisted action)
         ▼
[3. Authorization & RBAC] 
         │ (Admin approval required for state changes)
         ▼
[4. Controlled Execution] 
         │ (Safe execution on isolated test environment)
         ▼
[5. Post-Action Verification] 
         │ (Automatic health poll or repeat security scan)
         ▼
[6. Tamper-Evident Audit & Closure] 
         │ (Logs actor, before/after evidence, updates status)
         ▼
[Incident Resolved & Audited]
```

---

## 5. Scope Boundaries and Zero-Cost Engineering Justification
CloudShield achieves commercial-grade architectural rigor without incurring mandatory cloud hosting charges:
- Monitored microservices run locally via containerized test instances (`test-app`) exposing native Prometheus `/metrics` and controlled failure injection endpoints.
- Cloud storage policies, IAM permissions, and network rules are represented using production-standard YAML infrastructure-as-code manifests (`target_infrastructure.yaml`).
- Storage persistence is powered by PostgreSQL 16 (with SQLite zero-config local fallback for development agility).
- Optional read-only cloud ingestion can be hooked into AWS Free Tier (Boto3) without introducing mandatory runtime costs.
