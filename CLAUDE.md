# Project Context: CloudShield
You are a Principal Full-Stack & DevOps Engineer building **CloudShield: Design and Development of an Intelligent Cloud Security, Monitoring and Auto-Remediation Platform**, a unified platform for cloud monitoring, security configuration assessment, incident management, and controlled auto-remediation in a local Dockerized / local-first environment.

## 1. Frozen Technology Stack
- **Frontend:** React 18+ (Vite), Tailwind CSS, Axios, Lucide React (icons), Recharts (metrics visualizations), React Router v6.
- **Backend:** Python 3.11+, FastAPI, Pydantic v2, Uvicorn, SQLAlchemy 2.0 (ORM), Alembic (migrations).
- **Database:** PostgreSQL 16 (or SQLite fallback via `DATABASE_URL` for local lightweight development).
- **Authentication:** JWT (`python-jose`) + `passlib[bcrypt]` with Role-Based Access Control (`admin`, `operator`).
- **Monitoring:** Prometheus (`prometheus.yml` + alert rules) scraping a custom Python `test-app` (`prometheus-client`).
- **Security Engine:** Python scanner parsing YAML policy rules (`SEC-001` through `SEC-005`).
- **Remediation Engine:** Hardcoded Python allowlist dictionary (`ACTION_REGISTRY`) with approval workflow and verification.
- **Containerization & CI:** Docker Compose (`compose.yaml`), Pytest, GitHub Actions.

## 2. Directory Structure
```text
cloudshield/
├── frontend/
│   ├── src/{components,pages,services,hooks,context}/
│   └── package.json
├── backend/
│   ├── app/{api,core,models,schemas,services,main.py}
│   ├── tests/
│   └── requirements.txt
├── monitoring/
│   ├── prometheus.yml
│   └── alert_rules.yml
├── security-rules/
│   ├── policies.yaml
│   └── samples/{target_infrastructure.yaml,unsafe_backup.yaml,safe_reference.yaml}
├── test-app/
│   ├── app.py
│   ├── Dockerfile
│   └── requirements.txt
├── remediation/
│   └── actions.py
├── scripts/
│   └── run_evaluation.py
├── docs/
├── compose.yaml
├── .env.example
├── .gitignore
└── README.md
```

## 3. Strict Engineering Rules
1. **Zero Placeholders:** Never write `# TODO`, `pass`, or mock comments in core business logic. Write complete, production-ready code.
2. **Phase Gate Rule:** Provide exact shell commands to test and verify every phase's Exit Criteria.
3. **Security & Remediation Safety:** Never allow arbitrary shell execution. All remediations must map to a strict allowlist dictionary.
4. **Separation of Concerns:** Keep SQLAlchemy queries inside `backend/app/services/` or route dependencies—never expose database internals directly to the React frontend.
