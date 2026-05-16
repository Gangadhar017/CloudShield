# CloudShield: 24-Week Phase-Wise Project Implementation Roadmap

## 1. Executive Timeline (6 Months, 9 Sequential Phases)

```text
Week 01-02: Phase 1 — Planning, Scope & Requirements Specification
Week 03-04: Phase 2 — Development Environment, Skeleton & First Running App
Week 05-07: Phase 3 — Backend Foundation, Database ORM & JWT Auth with RBAC
Week 08-09: Phase 4 — Frontend UI Dashboard & Full REST API Integration
Week 10-12: Phase 5 — Monitoring Engine, Custom Test-App & Alerting Pipeline
Week 13-15: Phase 6 — Security Assessment Engine & Policy Evaluation
Week 16-18: Phase 7 — Controlled Auto-Remediation & Approval Lifecycle
Week 19-21: Phase 8 — Integration Hardening, Automated Testing & CI/CD
Week 22-24: Phase 9 — Empirical Evaluation, Final Thesis Report & Viva Voce
```

---

## 2. Phase-by-Phase Deliverables and Verification Gates

| Phase | Milestone Name | Key Technical Deliverables | Verification Exit Test |
| :--- | :--- | :--- | :--- |
| **Phase 1** (W1–2) | Requirements Freeze | Problem statement, use cases, architecture, team roles. | Department guide sign-off on 7 use cases and ₹0 budget. |
| **Phase 2** (W3–4) | Skeleton & Health Check | FastAPI backend skeleton, React shell, Docker Compose. | `GET /api/health` returns HTTP 200 via curl and React UI. |
| **Phase 3** (W5–7) | Data Layer & RBAC | 7 SQLAlchemy models, Alembic migrations, JWT auth. | Pytest suite passes testing token issuance and role rejection. |
| **Phase 4** (W8–9) | UI Presentation | 5 React dashboard views with Lucide icons & Recharts. | Operators and Admins can log in and view live database state. |
| **Phase 5** (W10–12)| Live Telemetry Engine | `test-app` (8001), Prometheus scraper, alert deduplication. | Injected failure automatically generates a deduplicated incident. |
| **Phase 6** (W13–15)| Security Policy Engine | 5 OWASP YAML rules, config scanner, diff engine. | Scanner detects all 5 injected flaws; repeat scan resolves fixes. |
| **Phase 7** (W16–18)| Closed-Loop Remediation | Allowlist registry, Admin approval, post-action verify. | Scenario A (recovery) and Scenario B (config fix) pass end-to-end. |
| **Phase 8** (W19–21)| Quality & CI/CD | Pytest unit/integration suites, GitHub Actions workflow. | Clean clone starts with 1 command; CI passes all linters/tests. |
| **Phase 9** (W22–24)| Academic Submission | 12-chapter final report, evaluation benchmark, viva deck. | 15-minute live viva rehearsal with complete empirical data. |

---

## 3. Team Weekly Working Routine (Agile Engineering Rhythm)

To ensure zero last-minute integration blockers, the 4-student team adheres to this weekly sprint rhythm:

- **Monday (Sprint Planning):** Review GitHub issues, define the week's acceptance criteria, map cross-member dependencies (e.g., API schemas needed by frontend).
- **Tuesday–Thursday (Implementation):** Build features on designated git branches (`feature/*`), write automated tests, maintain commit standards.
- **Friday (Integration & Review):** Open Pull Requests, conduct peer code reviews, merge to `develop`, verify integration in Docker Compose.
- **Weekend (Milestone Verification):** Run end-to-end tests, update project documentation, verify deliverables against the checklist.
