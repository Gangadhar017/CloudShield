# CloudShield: Functional & Non-Functional Requirements Specification

## 1. System Users & Role-Based Access Control (RBAC)
CloudShield enforces strict Role-Based Access Control to prevent privilege escalation:

| Role | Permissions & Operational Boundary |
| :--- | :--- |
| **Administrator (`admin`)** | Full read/write access. Can manage users, trigger configuration scans, request remediation actions, **approve pending remediation jobs**, execute remediation, and inspect immutable audit logs. |
| **Operator (`operator`)** | Operational viewer and requester. Can view live metrics, active incidents, and security findings; acknowledge incidents; and **submit remediation requests**. Operators **cannot approve or execute** remediation jobs. |
| **System/Daemon** | Autonomous background worker. Polls metrics from Prometheus, evaluates thresholds, ingests webhooks, and maintains resource heartbeats. |

---

## 2. Seven Mandatory Functional Use Cases

### UC-1: Secure Authentication and Session Management
- **Description:** Users log in via email and password, receive a digitally signed JWT access token, and establish an authenticated session.
- **Actors:** Administrator, Operator.
- **Pre-conditions:** User account exists in database with bcrypt-hashed credentials.
- **Post-conditions:** Token stored in client memory/cookies; UI updates to show authenticated state and user role badge.

### UC-2: Live Telemetry and Health Monitoring
- **Description:** System continuously ingests CPU utilization, memory allocation, request counts, error rates, and health status from instrumented applications.
- **Actors:** Operator, Administrator, System.
- **Pre-conditions:** Monitored application (`test-app`) is active and exposing `/metrics`.
- **Post-conditions:** Telemetry is stored as time-series metrics snapshots and plotted on live dashboard graphs.

### UC-3: Threshold Breach Alert & Fingerprint-Based Incident Generation
- **Description:** When an operational metric breaches configured thresholds (e.g., CPU > 80% or health endpoint failures), an incident is automatically generated.
- **Actors:** System.
- **Post-conditions:** Incident created with stable fingerprint (`rule_name + resource_id`), severity assigned, and deduplicated against existing open incidents.

### UC-4: Static Cloud Infrastructure Security Scanning
- **Description:** The policy engine parses YAML infrastructure manifests and evaluates 5 OWASP-aligned security rules (`SEC-001` through `SEC-005`).
- **Actors:** Operator, Administrator.
- **Post-conditions:** Violations recorded in `security_findings` with rule ID, severity, offending configuration snippet (evidence), and remediation guidance. Repeat scans automatically resolve fixed items.

### UC-5: Incident Lifecycle & Acknowledgment Management
- **Description:** Operators review active incidents, inspect supporting evidence, and transition state from `open` to `acknowledged`.
- **Actors:** Operator, Administrator.
- **Post-conditions:** Incident updated with acknowledgment timestamp.

### UC-6: Controlled Remediation Request, Approval, & Execution
- **Description:** Operators submit remediation requests for an incident or finding. An Administrator reviews the proposed allowlisted action and approves/executes it.
- **Actors:** Operator (Requester), Administrator (Approver/Executor).
- **Post-conditions:** Worker executes safe allowlisted routine, validates post-execution health/security status, and marks job `succeeded` or `failed`.

### UC-7: Immutable Audit Trail and Compliance Verification
- **Description:** System logs every security scan, remediation request, approval, and execution event into an immutable audit table.
- **Actors:** Administrator, Auditor.
- **Post-conditions:** Tamper-evident record containing actor, timestamp, target, action type, before/after evidence, and verification outcome.

---

## 3. Measurable Acceptance Criteria

| Requirement Area | Acceptance Criterion | Verification Method |
| :--- | :--- | :--- |
| **Telemetry Monitoring** | CPU, Memory, Health, Latency, and Error counts updated in UI every 5 seconds. | Live dashboard verification against `test-app`. |
| **Alert Generation** | Injected failure (HTTP 500 or CPU > 85%) produces an incident within $\le 10$ seconds. | Failure simulation panel test. |
| **Deduplication** | Repeated threshold alerts update existing incident without creating duplicate rows. | Database query checking distinct fingerprints. |
| **Security Scanning** | 5 predefined rules detect 100% of injected policy flaws in `target_infrastructure.yaml`. | Automated Pytest scanner suite. |
| **Repeat Scan Resolution**| Fixed configurations cause existing findings to transition to `resolved`. | Scanner diff validation. |
| **Remediation Safety** | Arbitrary bash/shell input is strictly rejected; only `ACTION_REGISTRY` entries execute. | Code audit and negative security test. |
| **Closed-Loop Verification**| Incidents and findings close ONLY if post-action health poll or re-scan succeeds. | End-to-end integration test. |
| **Access Control (RBAC)**| Operator request to execute remediation without Admin approval returns HTTP 403 Forbidden. | Automated Pytest RBAC test. |
| **Audit Completeness** | 100% of remediation attempts record actor, timestamps, before/after evidence, and outcome. | Audit log inspection. |
| **Portability & Setup** | System boots cleanly on a fresh developer machine using a single command. | README clean-install verification. |

---

## 4. MoSCoW Scope Prioritization

- **Must Have (Mandatory for Project Passing):**
  - Full JWT Authentication with Admin and Operator RBAC
  - Real-time Prometheus telemetry scraping from custom `test-app`
  - Automated threshold alerts and deduplicated incident creation
  - 5 YAML configuration security rules (`SEC-001` to `SEC-005`)
  - Two working remediation scenarios (Scenario A: App Recovery; Scenario B: Config Remediation)
  - Post-action verification and immutable audit logging

- **Should Have:**
  - Docker Compose multi-service deployment
  - Comprehensive GitHub Actions CI workflow
  - Live demo simulation panel in the React frontend
  - Exportable academic evaluation results

- **Could Have (Optional Extensions):**
  - Read-only AWS Boto3 integration for S3 bucket public access inspection
  - Synthetic workload generators for stress-testing latency histograms

- **Won't Have (Explicit Out-of-Scope):**
  - Production paid cloud infrastructure spend
  - Complex multi-cloud Kubernetes cluster orchestration
  - Black-box AI LLM execution of unvalidated shell commands
