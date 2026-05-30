# CloudShield: Intelligent Cloud Security, Monitoring and Auto-Remediation Platform

[![CI/CD Pipeline](https://github.com/cloudshield/cloudshield/actions/workflows/ci.yml/badge.svg)](https://github.com/cloudshield/cloudshield/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![React 18](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![Docker Compose](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)
[![Mandatory Cloud Spend](https://img.shields.io/badge/Cloud%20Spend-%E2%82%B90%20(Free%20%26%20Open%20Source)-success.svg)]()

> **B.Tech Major Capstone Project (4 Students, 24 Weeks, ₹0 Mandatory Cloud Spend)**  
> *A unified platform for continuous telemetry monitoring, OWASP configuration compliance assessment, fingerprint-based incident triage, and allowlisted auto-remediation with closed-loop verification.*

---

## 1. System Architecture

```text
[React 18 Dashboard] <──HTTP / JWT──> [FastAPI Backend Gateway]
 (Vite, Tailwind, Recharts)             ├── Authentication & RBAC (Bcrypt, JWT)
                                        ├── Monitoring Service (Fingerprint Deduplication)
                                        ├── Policy Engine (YAML Checks SEC-001..005)
                                        └── Allowlisted Remediation Worker
                                                 │
            ┌────────────────────────────────────┼────────────────────────────────────┐
            ▼                                    ▼                                    ▼
[PostgreSQL 16 / SQLite]               [Prometheus Server]                   [Monitored Test-App]
 Users, Resources, Incidents,           Scrapes /metrics at 5s intervals     FastAPI on Port 8001
 Findings, Remediations, Audit          Evaluates 5 Alert Rules              Failure Simulation API
```

---

## 2. Pre-Seeded Demonstration Accounts

| Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@cloudshield.local` | `Admin@123` | Full access: View telemetry, trigger scans, **approve & execute remediation**, inspect audit logs. |
| **Operator** | `operator@cloudshield.local` | `Operator@123` | View telemetry/findings, acknowledge incidents, **submit remediation requests** (Cannot approve/execute). |

*(1-Click Demo Fill buttons are provided directly on the Login screen for examination convenience).*

---

## 3. Quickstart: 1-Command Startup

### Option A: Complete Docker Compose Stack (Recommended)
Boot all 5 services (Postgres, Prometheus, Test-App, Backend, Frontend) with a single command:
```bash
docker compose up --build
```
- **React Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
- **FastAPI Interactive Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Prometheus Console:** [http://localhost:9090](http://localhost:9090)
- **Monitored Test Application:** [http://localhost:8001](http://localhost:8001)

---

### Option B: Local-First Zero-Config Development (Without Docker)
CloudShield automatically defaults to SQLite if PostgreSQL is not active, allowing zero-blocker local execution:

#### Step 1: Install Dependencies
```bash
pip install -r backend/requirements.txt
cd frontend && npm install && cd ..
```

#### Step 2: Seed the Database
```bash
python backend/app/seed.py
```

#### Step 3: Launch Services in 3 Terminals
- **Terminal 1 (Monitored Test-App):**
  ```bash
  python test-app/app.py
  ```
- **Terminal 2 (FastAPI Backend):**
  ```bash
  python -m uvicorn backend.app.main:app --port 8000 --reload
  ```
- **Terminal 3 (React Dashboard):**
  ```bash
  cd frontend && npm run dev
  ```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 4. How to Verify All Project Milestone Tests

### 1. Run Automated Test Suite (Unit, RBAC & Integration)
```bash
pytest backend/tests -v
```
*Validates 14 tests: all 5 OWASP rules, malformed YAML handling, JWT issuance, Operator 403 access rejection, Scenario A recovery, Scenario B config fix, and Failure Retention.*

### 2. Run Empirical Evaluation Benchmark (Phase 9 Academic Experiments)
```bash
python scripts/run_evaluation.py
```
*Executes all 7 experiments across multiple trials and outputs empirical metrics to `docs/evaluation-results.md`.*

---

## 5. Live Demonstration Sequences for Project Defense

### Scenario A: Application Health Outage & Verified Recovery
1. Open the **Dashboard** at [http://localhost:5173](http://localhost:5173).
2. Under the **Live Academic Demo Simulation Control Panel**, click **Simulate Outage (HTTP 500)**.
3. Within seconds, telemetry drops to 0.0, and an Incident appears in **Incidents & Triage** with fingerprint `ApplicationUnavailable:1`.
4. As an Operator, click **Request Recovery**.
5. Switch to an Admin account (`admin@cloudshield.local`). Open **Remediation & Audit**.
6. Under **Pending Remediation Approvals**, click **Approve & Execute**.
7. The worker triggers recovery on the test-app, polls `/health`, confirms HTTP 200, closes the incident, and updates the immutable audit trail.

### Scenario B: Security Configuration Assessment & Auto-Correction
1. In **Security Assessment**, click **Reset Insecure Config** then **Run Security Scan**.
2. 5 critical findings appear (`SEC-001` through `SEC-005`) with exact forensic evidence from `target_infrastructure.yaml`.
3. For `SEC-001` (Public Storage Access), click **Request Auto-Fix**.
4. In **Remediation & Audit**, click **Approve & Execute**.
5. The worker safely patches `target_infrastructure.yaml` setting `public_access = false`, triggers an immediate repeat scan, and verifies the finding is **RESOLVED**.

---

## 6. Academic Documentation Index
- [Problem Statement & Scope (`docs/problem-statement.md`)](file:///docs/problem-statement.md)
- [Requirements & Acceptance Criteria (`docs/requirements.md`)](file:///docs/requirements.md)
- [System Architecture & Use Cases (`docs/use-cases.md`)](file:///docs/use-cases.md)
- [24-Week Implementation Roadmap (`docs/project-roadmap.md`)](file:///docs/project-roadmap.md)
- [4-Member Team Responsibilities (`docs/team-responsibilities.md`)](file:///docs/team-responsibilities.md)
- [Empirical Evaluation Benchmark Results (`docs/evaluation-results.md`)](file:///docs/evaluation-results.md)
- [12-Chapter Thesis Report & Viva Voce Guide (`docs/final-report-and-viva-prep.md`)](file:///docs/final-report-and-viva-prep.md)
