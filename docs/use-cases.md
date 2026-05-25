# CloudShield: Architecture, Use Cases & Data Flow Specifications

## 1. System Architecture Diagram

```mermaid
graph TB
    subgraph ClientLayer ["Client & Presentation Tier"]
        UI["React 18 Dashboard<br/>(Vite, Tailwind, Recharts)"]
    end

    subgraph APILayer ["Backend Application Tier (FastAPI)"]
        API["FastAPI Gateway"]
        AuthSvc["Auth & RBAC Service<br/>(JWT + Bcrypt)"]
        MonSvc["Monitoring & Alert Ingestion"]
        SecSvc["Security Policy Engine<br/>(YAML Parser)"]
        RemSvc["Controlled Remediation Worker<br/>(Allowlist Registry)"]
        AuditSvc["Audit Logging Service"]
    end

    subgraph DataLayer ["Persistence Tier"]
        DB[(PostgreSQL 16 / SQLite<br/>Users, Resources, Findings,<br/>Incidents, Remediations, Audit)]
    end

    subgraph MonitoringLayer ["Telemetry & Test Infrastructure"]
        Prom["Prometheus Server<br/>(Scraping & Alert Rules)"]
        TestApp["Monitored Test Application<br/>(/health, /metrics, /simulate)"]
        ConfigFile["Target Infrastructure Config<br/>(target_infrastructure.yaml)"]
    end

    UI -->|HTTP / REST API + JWT| API
    API --> AuthSvc
    API --> MonSvc
    API --> SecSvc
    API --> RemSvc
    API --> AuditSvc

    AuthSvc --> DB
    MonSvc --> DB
    SecSvc --> DB
    RemSvc --> DB
    AuditSvc --> DB

    Prom -->|Scrapes /metrics| TestApp
    MonSvc -->|Scrapes & Ingests| Prom
    MonSvc -->|Heartbeats & Telemetry| TestApp
    SecSvc -->|Evaluates Policies| ConfigFile
    RemSvc -->|Safe Recovery Call| TestApp
    RemSvc -->|Safe Key Patch| ConfigFile
```

---

## 2. Use Case Diagram

```mermaid
flowchart LR
    Operator["User: Operator"]
    Admin["User: Administrator"]
    SystemWorker["System Worker / Daemon"]

    subgraph CloudShieldPlatform ["CloudShield Platform Boundary"]
        UC1(["UC-1: Authenticate & Refresh Session"])
        UC2(["UC-2: View Live Telemetry & Resources"])
        UC3(["UC-3: Ingest Metric Alerts & Deduplicate"])
        UC4(["UC-4: Trigger Configuration Security Scan"])
        UC5(["UC-5: Acknowledge & Triage Incidents"])
        UC6A(["UC-6a: Submit Remediation Request"])
        UC6B(["UC-6b: Approve & Execute Remediation"])
        UC7(["UC-7: Review Immutable Audit Logs"])
    end

    Operator --> UC1
    Operator --> UC2
    Operator --> UC4
    Operator --> UC5
    Operator --> UC6A

    Admin --> UC1
    Admin --> UC2
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6A
    Admin --> UC6B
    Admin --> UC7

    SystemWorker --> UC3
```

---

## 3. End-to-End Remediation Sequence Diagram (Scenario A: App Recovery)

```mermaid
sequenceDiagram
    autonumber
    actor Op as Operator
    actor Adm as Administrator
    participant UI as CloudShield Dashboard
    participant API as FastAPI Backend
    participant Worker as Remediation Engine
    participant App as Monitored Test-App
    participant DB as PostgreSQL Database

    Note over App: Failure injected (Health = 500)
    API->>App: Poll /health & /metrics
    App-->>API: 500 Internal Error
    API->>DB: Upsert Incident (Fingerprint, Recommended Action: RESTART_TEST_APP)
    UI->>API: GET /api/incidents
    API-->>UI: Return open incident

    Op->>UI: Click "Request Remediation"
    UI->>API: POST /api/incidents/{id}/remediation-requests
    API->>DB: Save RemediationJob (Status: PENDING)
    API->>DB: Write AuditLog (Action: REQUESTED)

    Adm->>UI: Review Pending Approvals
    Adm->>UI: Click "Approve & Execute"
    UI->>API: POST /api/remediation/{id}/execute
    API->>Worker: Dispatch RESTART_TEST_APP
    Worker->>App: POST /simulate/recover
    Worker->>App: Poll GET /health (Verification loop)
    App-->>Worker: 200 OK (Healthy)
    Worker->>DB: Update RemediationJob (Status: SUCCEEDED, verification_passed: true)
    Worker->>DB: Update Incident (Status: RESOLVED)
    Worker->>DB: Write AuditLog (Action: EXECUTED, Result: SUCCESS)
    API-->>UI: Remediation completed & verified
```

---

## 4. End-to-End Configuration Correction Sequence Diagram (Scenario B: Config Remediation)

```mermaid
sequenceDiagram
    autonumber
    actor Adm as Administrator
    participant UI as CloudShield Dashboard
    participant API as FastAPI Backend
    participant Scanner as Security Scanner
    participant Worker as Remediation Engine
    participant TargetFile as target_infrastructure.yaml
    participant DB as PostgreSQL Database

    Adm->>UI: Click "Run Security Scan"
    UI->>API: POST /api/findings/scan
    API->>Scanner: Parse and evaluate policies
    Scanner->>TargetFile: Read configuration
    Scanner->>DB: Insert findings (e.g., SEC-001 Public Storage)
    API-->>UI: Display 5 active findings

    Adm->>UI: Request Auto-Fix for SEC-001
    UI->>API: POST /api/findings/{id}/remediation-requests
    API->>DB: Save RemediationJob (Status: PENDING)

    Adm->>UI: Approve & Execute
    UI->>API: POST /api/remediation/{id}/execute
    API->>Worker: Dispatch FIX_SEC_001
    Worker->>TargetFile: Safely set storage.public_access = false
    Worker->>Scanner: Trigger immediate verification re-scan
    Scanner-->>Worker: SEC-001 no longer violated
    Worker->>DB: Update Finding (Status: RESOLVED)
    Worker->>DB: Update RemediationJob (Status: SUCCEEDED)
    Worker->>DB: Write AuditLog with before/after diff
    API-->>UI: Config remediated and verified
```
