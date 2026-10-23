# PRISM — Proactive Regulatory Intelligence & Status Monitoring

PRISM is an AI-assisted regulatory workflow and compliance monitoring platform designed to help institutions and authorised officials manage regulatory approval applications, supporting documents, compliance requirements, deadlines, application workflows, and audit trails.

> **Notice:** PRISM is an institutional regulatory prototype. All names, institutions, applications, metrics, stages, and findings in the demo represent fictional sample data. AI analysis and rule checks flag possible issues for human review and never make autonomous regulatory decisions.

---

## Architecture & Technology Stack

* **Frontend**: React 18, TypeScript (Strict), Vite, Tailwind CSS, TanStack Query, Radix UI primitives, Lucide React, and Motion.
* **Design System**: Calm Ledger aesthetic with six semantic themes (`daylight`, `dusk`, `void`, `paper`, `contrast-light`, `contrast-dark`) passing WCAG 2.2 AA / AAA contrast requirements.
* **Backend**: FastAPI, Python 3.12, Uvicorn, Pydantic, SQLModel, and SQLite.
* **Storage**: Secure local document storage in `backend/storage/uploads/`.
* **Authentication**: Cryptographically signed HMAC-SHA256 session tokens with role-based access enforcement.

---

## Directory Structure

```
prism/
├── design.md                 # Primary design & architecture specification
├── .env.example              # Environment variable template
├── backend/                  # FastAPI service
│   ├── pyproject.toml        # Backend dependencies & metadata
│   ├── requirements.txt      # Pip-compatible dependency requirements
│   ├── main.py               # Application entry point, lifespan, and CORS setup
│   ├── app/
│   │   ├── config.py         # Application settings (secret keys, storage, db)
│   │   ├── db.py             # SQLite engine and session generator
│   │   ├── auth.py           # HMAC-SHA256 session token management & RBAC
│   │   ├── models.py         # SQLModel entities (User, Application, Document, Finding, Extraction)
│   │   ├── schemas.py        # Pydantic request/response schemas
│   │   ├── seed.py           # Deterministic & idempotent sample data generator
│   │   ├── services/         # Decoupled verification services
│   │   │   ├── document_processor.py # PyMuPDF text & page layout extraction
│   │   │   ├── field_extractor.py   # Deterministic structured entity extraction
│   │   │   └── verification_pipeline.py # Deterministic regulatory cross-checks
│   │   └── routers/
│   │       ├── health.py     # Health check & system status
│   │       ├── auth.py       # One-click demo login, session restore, logout
│   │       ├── applications.py # Application listing, filtering, search & dossier
│   │       ├── documents.py  # File upload validation, storage, and preview
│   │       ├── verification.py # Document verification, extraction, and finding review
│   │       └── demo.py       # Demo reset control endpoint
│   ├── storage/uploads/      # Local file storage for uploaded documents
│   └── tests/
│       ├── conftest.py       # Session-scoped test fixtures
│       ├── test_health.py    # Health check tests
│       ├── test_auth.py      # Session token and authentication tests
│       ├── test_seed.py      # Persistence and idempotency tests
│       ├── test_applications.py # Role access and application listing tests
│       ├── test_documents.py # Upload validation and secure download tests
│       └── test_verification.py # PyMuPDF extraction, checks, and review tests
└── frontend/                 # React + TypeScript Vite frontend
    ├── package.json          # Frontend dependencies & npm scripts
    ├── vite.config.ts        # Vite configuration & backend proxy
    ├── tailwind.config.ts    # Semantic token mappings & theme configuration
    ├── eslint.config.js      # ESLint 9 configuration with strict checks
    ├── src/
    │   ├── main.tsx          # Client entrypoint
    │   ├── App.tsx           # Providers and root routing
    │   ├── app/
    │   │   ├── router.tsx    # Route definitions (Protected routes)
    │   │   ├── providers.tsx # QueryClient, AuthProvider & MotionConfig
    │   │   └── layout/       # AppShell, Sidebar, TopBar, ThemeMenu
    │   ├── styles/           # Design tokens, typography, and globals
    │   ├── lib/              # API client, theme switcher, motion, contrast test
    │   ├── components/       # StatusBadge, DemoPill, Button, Card, FindingCard, DocumentExtractionDrawer
    │   ├── features/
    │   │   ├── auth/         # SignInPage, AuthContext, ProtectedRoute
    │   │   ├── applications/ # ListPage, DossierPage
    │   │   └── foundation/   # Foundation readiness and route placeholders
    │   └── types/            # Domain TypeScript interfaces
    └── dist/                 # Production build output
```

---

## Demo Roles & Access Permissions

PRISM features a lightweight, passwordless one-click authentication system tailored for demonstration:

| Role | Demo Persona | Institution | Permissions |
|---|---|---|---|
| **Institution User** | Dr. Ramesh Gupta | Apex Institute of Technology (`inst-01`) | Views only their institution's applications, uploads supporting documents, views dossiers for their institution. Cross-institution access is strictly denied. |
| **Review Officer** | Priya Sharma | Regulatory Review Bureau | Reviews all assigned applications across institutions, inspects dossiers, advances stages, downloads documents. |
| **System Administrator** | Vikramaditya Nair | System Administration | Global visibility over all institutions, applications, users, documents, and audit logs. |

---

## Getting Started Locally

### 1. Backend Service

Requirements: Python 3.11+ (Python 3.12+ recommended) and `uv` or `pip`.

```bash
cd backend

# Option A: Using uv (fastest)
uv venv
uv pip install -r requirements.txt
uv run uvicorn main:app --reload --port 8000

# Option B: Using standard Python venv
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Verify backend health at `http://localhost:8000/api/health` or browse interactive OpenAPI documentation at `http://localhost:8000/docs`.

### 2. Frontend Application

Requirements: Node.js 18+ and `npm`.

```bash
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173`. If you are not authenticated, you will be redirected to the `/signin` screen.

---

## Verification & Quality Checks

Run the verification suite across both projects:

### Frontend
```bash
cd frontend
npm run typecheck    # TypeScript compiler check (0 errors)
npm run lint         # ESLint check (0 errors, 0 warnings)
npm run test         # Vitest test suite (32 tests passing: WCAG contrast + auth storage)
npm run build        # Production bundle build (clean Vite build, zero errors)
```

### Backend
```bash
cd backend
uv run pytest        # Pytest test suite (37 tests passing: auth, seed, applications, documents, verification)
```

---

## Document Verification Engine (Phase 3)

The PRISM Document Verification Engine automatically processes uploaded supporting documents and executes deterministic compliance checks against application records:

1. **Extraction Pipeline (`DocumentProcessor` & `FieldExtractor`)**:
   - Uses **PyMuPDF** to extract page streams and text layers cleanly.
   - Extracts structured regulatory entities: Institution Name, Document Identifiers, Registration/Issuance Dates, Certificate Expiry Dates, and Land Survey Numbers.
   - Uses explicit states (`extracted`, `uncertain`, `not_found`) rather than fabricating artificial confidence scores.
   - Preserves verbatim monospace text excerpts and page references for auditing.

2. **Deterministic Regulatory Cross-Checks (`VerificationPipeline`)**:
   - `CHK_INST_MATCH`: Discrepancy between document institution and application record.
   - `CHK_DATE_ORDER`: Certificate dated later than application submission.
   - `CHK_EXPIRY_PAST`: Expired certificate (High severity).
   - `CHK_EXPIRY_SOON`: Certificate expiring within 60 days (Medium severity).
   - `CHK_MISSING_SURVEY`: Missing land survey or plot allocation reference.
   - `CHK_EMPTY_DOC`: Empty file payload (0 bytes).
   - `CHK_CORRUPT_DOC`: Unreadable or corrupt document binary.

3. **Human Review Workflow (`FindingCard`)**:
   - Regulatory Officers can **Confirm** or **Dismiss** findings with optional audit notes.
   - Mandatory disclaimer: *"Findings are possible issues flagged for human review. They do not establish authenticity or decide outcomes."*
   - Institution users view findings in read-only mode without internal reviewer actions.

---

## Resetting Demo Data

To reset the SQLite database back to its deterministic seed state with relative dates:

```bash
curl -X POST http://localhost:8000/api/demo/reset
```

Or trigger it directly from Settings once implemented in Phase 4.

---

## Security & Demo Limitations

1. **Demo Authentication**: The one-click login issues HMAC-SHA256 signed session tokens. In production, this must be replaced by OAuth2/OIDC with proper multi-factor authentication and official government credential verification.
2. **File Storage**: Uploads are stored locally in `backend/storage/uploads/` using sanitized server-generated filenames. In production, this should interface with private S3/GCS object storage with pre-signed access URLs.
3. **MIME and Header Verification**: File types are verified via magic byte inspection (`%PDF-`, PNG, JPEG) and extension matching. While this prevents file-type spoofing, it does not prove the legal authenticity of the regulatory document.
4. **Findings & Compliance**: System-generated findings are possibilities flagged for human review. They do not decide outcomes or certify official legal compliance.
