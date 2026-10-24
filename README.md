# PRISM — Proactive Regulatory Intelligence & Status Monitoring

PRISM is an AI-assisted regulatory workflow and compliance monitoring platform designed to help institutions and authorised officials manage regulatory approval applications, supporting documents, compliance requirements, deadlines, application workflows, and audit trails.

> **Notice:** PRISM is an institutional regulatory prototype. All names, institutions, applications, metrics, stages, and findings in the demo represent fictional sample data. AI analysis and rule checks flag possible issues for human review and never make autonomous regulatory decisions.

---

## Architecture & Technology Stack

* **Frontend**: React 18, TypeScript (Strict), Vite, Tailwind CSS, TanStack Query, Radix UI primitives, Lucide React, and Motion.
* **Design System**: Calm Ledger aesthetic with six semantic themes (`daylight`, `dusk`, `void`, `paper`, `contrast-light`, `contrast-dark`) passing WCAG 2.2 AA / AAA contrast requirements.
* **Backend**: FastAPI, Python 3.12/3.13, Uvicorn, Pydantic, SQLModel, and SQLite.
* **Storage**: Secure local document storage in `backend/storage/uploads/`.
* **Authentication**: Cryptographically signed HMAC-SHA256 session tokens with role-based access enforcement.

---

## Directory Structure

```
prism/
├── design.md                 # Primary design & architecture specification
├── context.md                # Detailed implementation progress & phase history
├── .env.example              # Environment variable template
├── backend/                  # FastAPI service
│   ├── pyproject.toml        # Backend dependencies & metadata
│   ├── requirements.txt      # Pip-compatible dependency requirements
│   ├── main.py               # Application entry point, lifespan, and CORS setup
│   ├── app/
│   │   ├── config.py         # Application settings (secret keys, storage, db)
│   │   ├── db.py             # SQLite engine and session generator
│   │   ├── auth.py           # HMAC-SHA256 session token management & RBAC
│   │   ├── models.py         # SQLModel entities (User, Application, Document, Finding, Extraction, Rules, Obligations, StageConfig, AssignmentHistory, ClarificationRequest, ClarificationResponse, DecisionRecord)
│   │   ├── schemas.py        # Pydantic request/response schemas
│   │   ├── seed.py           # Deterministic & idempotent sample data generator
│   │   ├── services/         # Decoupled verification, compliance, and workflow services
│   │   │   ├── document_processor.py   # PyMuPDF text & page layout extraction
│   │   │   ├── field_extractor.py     # Deterministic structured entity extraction
│   │   │   ├── verification_pipeline.py # Deterministic document-level cross-checks
│   │   │   ├── rules_registry.py      # Authoritative AICTE APH citations & rules
│   │   │   ├── rules_engine.py        # Deterministic compliance obligations engine
│   │   │   ├── workflow_engine.py     # Stage progression, readiness blockers, assignments, decisions
│   │   │   └── clarification_service.py # Clarification threads, responses, and resolution
│   │   └── routers/
│   │       ├── health.py       # Health check & system status
│   │       ├── auth.py         # One-click demo login, session restore, logout
│   │       ├── applications.py # Application listing, filtering, search & dossier
│   │       ├── documents.py    # File upload validation, storage, and preview
│   │       ├── verification.py # Document verification, extraction, and finding review
│   │       ├── compliance.py   # Compliance obligations, evaluations, and review
│   │       ├── workflow.py     # Stage transitions, readiness assessment, assignments, decisions
│   │       ├── clarifications.py # Clarification inquiries, replies, and resolution
│   │       └── demo.py         # Demo reset control endpoint
│   ├── storage/uploads/        # Local file storage for uploaded documents
│   └── tests/
│       ├── conftest.py         # Session-scoped test fixtures
│       ├── test_health.py      # Health check tests
│       ├── test_auth.py        # Session token and authentication tests
│       ├── test_seed.py        # Persistence and idempotency tests
│       ├── test_applications.py # Role access and application listing tests
│       ├── test_documents.py   # Upload validation and secure download tests
│       ├── test_verification.py # PyMuPDF extraction, checks, and review tests
│       ├── test_rules_engine.py # Compliance checks, citations, versions, and overrides
│       └── test_workflow.py    # Workflow transitions, readiness blockers, assignments, clarifications, decisions
│
└── frontend/                   # React + TypeScript Vite frontend
    ├── package.json            # Frontend dependencies & npm scripts
    ├── vite.config.ts          # Vite configuration & backend proxy
    ├── tailwind.config.ts      # Semantic token mappings & theme configuration
    ├── eslint.config.js        # ESLint 9 configuration with strict checks
    ├── src/
    │   ├── main.tsx            # Client entrypoint
    │   ├── App.tsx             # Providers and root routing
    │   ├── app/
    │   │   ├── router.tsx      # Route definitions (Protected routes)
    │   │   ├── providers.tsx   # QueryClient, AuthProvider & MotionConfig
    │   │   └── layout/         # AppShell, Sidebar, TopBar, ThemeMenu
    │   ├── styles/             # Design tokens, typography, and globals
    │   ├── lib/                # API client, theme switcher, motion, contrast test, workflow test
    │   ├── components/         # StatusBadge, DemoPill, Button, Card, FindingCard, DocumentExtractionDrawer
    │   ├── features/
    │   │   ├── auth/           # SignInPage, AuthContext, ProtectedRoute
    │   │   ├── applications/   # ListPage, DossierPage
    │   │   ├── compliance/     # ComplianceCard, ComplianceSummaryCards, ComplianceAuditHistory
    │   │   ├── workflow/       # WorkflowActionCenter, AdvanceStageModal, ReturnStageModal, AssignOfficerModal, DecisionRecordModal
    │   │   ├── clarifications/ # ClarificationThread, ClarificationRequestModal, ClarificationReplyModal, ClarificationResolveModal
    │   │   └── foundation/     # Foundation readiness and route placeholders
    │   └── types/              # Domain TypeScript interfaces
    └── dist/                   # Production build output
```

---

## Demo Roles & Access Permissions

PRISM features a lightweight, passwordless one-click authentication system tailored for demonstration:

| Role | Demo Persona | Institution | Permissions |
|---|---|---|---|
| **Institution User** | Dr. Ramesh Gupta | Apex Institute of Technology (`inst-01`) | Views only their institution's applications, uploads supporting documents, submits initial application drafts, and responds to interlocutory clarification requests. Cross-institution access is strictly denied. |
| **Review Officer** | Priya Sharma | Regulatory Review Bureau | Reviews all applications across institutions, assesses stage readiness, advances/returns stages, initiates and resolves clarification inquiries, and records statutory determinations. |
| **System Administrator** | Vikramaditya Nair | System Administration | Global administrative visibility, assigns/reassigns scrutiny officers, updates stage configurations, and exercises statutory overrides when authorized. |

---

## Workflow Automation Engine (Phase 5)

PRISM enforces an authoritative regulatory approval lifecycle across 8 configurable stages:

1. **Configurable Stage Sequence**:
   - `stage-draft`: Institutional compilation and document preparation.
   - `stage-submitted`: Formal intake and statutory submission.
   - `stage-doc-check`: Initial completeness and document readability check.
   - `stage-desk-review`: Substantive regulatory verification and rules engine scrutiny.
   - `stage-clarification`: Interlocutory procedural discourse and institution responses.
   - `stage-committee`: Scrutiny committee and hearing panel evaluation.
   - `stage-decision`: Final statutory determination (Approval / Rejection).
   - `stage-closed`: Terminal archival and decision recording.

2. **Stage Readiness & Blocker Evaluation (`WorkflowEngine.evaluate_stage_readiness`)**:
   - Assesses 6 distinct categories of stage blockers:
     - **Documents**: Unreadable, corrupt, or missing mandatory evidentiary files.
     - **Findings**: Unreviewed high or medium severity document inconsistencies.
     - **Compliance**: Unsatisfied obligations or obligations pending human review under AICTE APH norms.
     - **Clarifications**: Open or unresolved clarification threads.
     - **Assignments**: Unassigned scrutiny officer ownership on higher evaluation stages.
     - **Decisions**: Absence of a recorded statutory determination when in decision stages.
   - **Administrator Override**: Authorised administrators may override blocking conditions with mandatory legal justification recorded in the immutable audit trail.

3. **Interlocutory Clarification Threads**:
   - Scrutiny officers can initiate formal clarification inquiries pre-linked to specific findings or rule codes.
   - Institution users receive immediate notification, submit threaded responses, and attach new or existing evidentiary documents.
   - Scrutiny officers review responses and record official resolution notes or cancel obsolete inquiries.

4. **Statutory Regulatory Determination (`DecisionRecord`)**:
   - Formal Approval or Rejection recorded by authorized officers/administrators.
   - Requires recorded statutory grounds, conditions of approval (e.g., temporary NOC fulfillment windows), and links to reference findings.
   - Issuing a decision immediately transitions the application to the terminal `stage-closed` status.

---

## Verification & Quality Checks

Run the verification suite across both projects:

### Frontend
```bash
cd frontend
npm run typecheck    # TypeScript compiler check (0 errors)
npm run lint         # ESLint check (0 errors, 0 warnings)
npm run test         # Vitest test suite (49 tests passing: WCAG contrast, auth, compliance, workflow, API URL resolver)
npm run build        # Production bundle build (clean Vite build, zero errors)
```

### Backend
```bash
cd backend
uv run pytest        # Pytest test suite (62 tests passing: health, CORS origins, auth, seed, applications, documents, verification, compliance, workflow)
```

---

## Deployment Guide: Vercel Frontend & Render Backend

PRISM is architected for decoupled deployment with the React frontend hosted on **Vercel** and the FastAPI backend service hosted on **Render**.

### 1. Render Backend Web Service Configuration

1. Create a new **Web Service** on Render connected to this repository.
2. Configure settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Add **Environment Variables** in Render Dashboard:
   | Variable | Value | Purpose |
   |---|---|---|
   | `CORS_ORIGINS` | `https://<your-vercel-app>.vercel.app,http://localhost:5173` | Allowed frontend origins (trailing slashes stripped automatically; wildcard `*` excluded for secure credentialed auth) |
   | `DATABASE_URL` | `sqlite:///./prism.db` | Database connection string (or PostgreSQL URL) |
   | `STORAGE_DIR` | `./storage/uploads` | Document storage directory |
   | `SECRET_KEY` | `<secure-random-32-byte-hex>` | Secret key for signing session tokens |
   | `SESSION_EXPIRY_HOURS` | `24` | Token validity duration |
   | `DEBUG` | `false` | Production error masking |

4. Verify health endpoint:
   ```bash
   curl https://<your-render-service>.onrender.com/api/health
   ```
   Expected response:
   ```json
   {
     "status": "ok",
     "app": "PRISM API",
     "version": "0.2.0",
     "database": "connected"
   }
   ```
   *(If database connectivity fails, returns HTTP `503 Service Unavailable` with `status: "degraded"` without exposing database credentials or file paths).*

### 2. Vercel Frontend Deployment Configuration

1. Import the repository into **Vercel**.
2. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
3. Add **Environment Variables** in Vercel Project Settings:
   | Variable | Value | Purpose |
   |---|---|---|
   | `VITE_API_URL` | `https://<your-render-service>.onrender.com` | Base URL of deployed Render backend service |

   > **Note:** Do NOT include a trailing slash in `VITE_API_URL`. PRISM's `getApiUrl()` helper automatically normalizes and strips trailing slashes, but omitting it ensures standard URL construction.

4. Deploy the frontend. All API requests (`/api/me`, `/api/applications`, `/api/compliance`, `/api/documents`, etc.) will route to the Render backend, while document previews and downloads include the authenticated session token query parameter for seamless viewing.

---

## Getting Started Locally

### 1. Backend Service
```bash
cd backend
uv venv
uv pip install -r requirements.txt
uv run uvicorn main:app --reload --port 8000
```
- Interactive API Documentation: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`
- Default redirect to `/signin` with instant demo persona selection.
- In local development, leaving `VITE_API_URL` empty automatically proxies `/api` requests to `http://127.0.0.1:8000` via Vite.
