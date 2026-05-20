# CloudShield: 4-Member Team Responsibilities Matrix

## 1. Student Workstreams & Ownership

```text
Student 1: Frontend & User Experience (React 18, Vite, Tailwind CSS, Recharts)
Student 2: Backend & Database Engineering (FastAPI, SQLAlchemy, PostgreSQL, JWT RBAC)
Student 3: Monitoring & Security Policy Engine (Prometheus, Custom Test-App, YAML Parser)
Student 4: DevOps, Remediation & Test Automation (Docker Compose, GitHub Actions, Remediation Worker)
```

---

## 2. Detailed Responsibility Breakdown

### Student 1 — Frontend & User Experience Architect
- **Primary Tech:** React 18, Vite, Tailwind CSS, Axios, Lucide React, Recharts
- **Key Modules Owned:**
  - Modern, responsive application layout (Sidebar, Navbar, Status Badges, Dark Theme)
  - Interactive Dashboard with real-time KPI tiles and telemetry graphs (CPU, Memory, Latency)
  - Monitored Resources table with health status and endpoint links
  - Security Findings table with expandable evidence inspector and "Request Auto-Fix" triggers
  - Incidents view with detailed triage modal and timeline breakdown
  - Remediation & Audit view featuring Admin approval queue and Before/After diff viewer
  - Live Demo Simulation Panel for one-click failure injection and reset during project defense

### Student 2 — Backend & Database Engineer
- **Primary Tech:** Python 3.11+, FastAPI, SQLAlchemy 2.0, PostgreSQL 16, Alembic, Pydantic v2
- **Key Modules Owned:**
  - PostgreSQL schema design across 7 core entities with indexes and foreign key cascades
  - Database migrations and automatic database seed runner (`seed.py`)
  - Cryptographic authentication: JWT signing/verification and bcrypt password hashing
  - Role-Based Access Control middleware (`get_current_user`, `require_admin`)
  - REST API routes for authentication, resources, incidents, findings, and audit trails
  - Pydantic v2 data transfer schemas with strict request validation and response filtering

### Student 3 — Monitoring & Security Engine Specialist
- **Primary Tech:** Prometheus, Python `prometheus-client`, PyYAML, HTTPX
- **Key Modules Owned:**
  - Instrumented `test-app` simulating real microservice behavior, metrics, and failure modes
  - Prometheus scrape configurations (`prometheus.yml`) and 5 detection rules (`alert_rules.yml`)
  - Real-time telemetry ingestion service with stable fingerprint-based deduplication
  - Static security scanner parsing YAML infrastructure policies against 5 OWASP checks (`SEC-001` to `SEC-005`)
  - Scan comparison logic to automatically resolve findings when patches are detected

### Student 4 — DevOps, Remediation & Quality Assurance Lead
- **Primary Tech:** Docker, Docker Compose, Pytest, GitHub Actions, Python Automation
- **Key Modules Owned:**
  - Multi-container orchestration in `compose.yaml` (Postgres, Prometheus, Test-App, Backend, Frontend)
  - Allowlisted remediation worker (`remediation/actions.py` & `remediation_service.py`)
  - Safe execution engine with strict sandboxing (preventing unvalidated shell execution)
  - Post-action verification workflows (health checks and scanner re-runs)
  - Automated CI/CD pipeline (`.github/workflows/ci.yml`)
  - Evaluation experiment runner (`scripts/run_evaluation.py`) for generating empirical thesis data

---

## 3. Shared Cross-Cutting Responsibilities
1. **Peer Code Review:** All pull requests require at least one approving review before merging into `develop`.
2. **Defensive Documentation:** Each member co-authors sections of the 12-chapter thesis report corresponding to their core technical domain.
3. **Viva Voce Mastery:** All 4 members must be capable of demonstrating any of the 7 core use cases during the final academic examination.
