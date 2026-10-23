# PRISM — Proactive Regulatory Intelligence & Status Monitoring

PRISM is an AI-assisted regulatory workflow and compliance monitoring platform designed to help institutions and authorised officials manage regulatory approval applications, supporting documents, compliance requirements, deadlines, application workflows, and audit trails.

> **Notice:** PRISM is an institutional regulatory prototype. All names, institutions, applications, metrics, stages, and findings in the demo represent fictional sample data. AI analysis and rule checks flag possible issues for human review and never make autonomous regulatory decisions.

---

## Architecture & Technology Stack

* **Frontend**: React 18, TypeScript (Strict), Vite, Tailwind CSS, TanStack Query, Radix UI primitives, Lucide React, and Motion.
* **Design System**: Calm Ledger aesthetic with six semantic themes (`daylight`, `dusk`, `void`, `paper`, `contrast-light`, `contrast-dark`) passing WCAG 2.2 AA / AAA contrast requirements.
* **Backend**: FastAPI, Python 3.12, Uvicorn, Pydantic, SQLModel, and SQLite.
* **Storage**: Local document storage in `backend/storage/uploads/`.

---

## Directory Structure

```
prism/
├── design.md                 # Primary design & architecture specification
├── .env.example              # Environment variable template
├── backend/                  # FastAPI service
│   ├── pyproject.toml        # Backend dependencies & metadata
│   ├── requirements.txt      # Pip-compatible dependency requirements
│   ├── main.py               # Application entry point & CORS configuration
│   ├── app/
│   │   ├── config.py         # Application configuration & environment settings
│   │   └── routers/
│   │       └── health.py     # Health check & system status endpoints
│   ├── storage/uploads/      # Local file storage for uploaded documents
│   └── tests/
│       └── test_health.py    # Health check & system tests
└── frontend/                 # React + TypeScript Vite frontend
    ├── package.json          # Frontend dependencies & npm scripts
    ├── vite.config.ts        # Vite configuration & backend proxy
    ├── tailwind.config.ts    # Semantic token mappings & theme configuration
    ├── eslint.config.js      # ESLint 9 configuration with strict checks
    ├── src/
    │   ├── main.tsx          # Client entrypoint
    │   ├── App.tsx           # Providers and root routing
    │   ├── app/
    │   │   ├── router.tsx    # Route definitions
    │   │   ├── providers.tsx # QueryClient & MotionConfig
    │   │   └── layout/       # AppShell, Sidebar, TopBar, ThemeMenu
    │   ├── styles/           # Design tokens, typography, and globals
    │   ├── lib/              # API client, theme switcher, motion, contrast test
    │   ├── components/       # StatusBadge, DemoPill, Button, Card
    │   ├── features/         # Foundation readiness and route placeholders
    │   └── types/            # Domain TypeScript interfaces
    └── dist/                 # Production build output
```

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

Verify backend health at `http://localhost:8000/api/health` or browse interactive documentation at `http://localhost:8000/docs`.

### 2. Frontend Application

Requirements: Node.js 18+ and `npm`.

```bash
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## Verification & Quality Checks

Run the verification suite across both projects:

### Frontend
```bash
cd frontend
npm run typecheck    # TypeScript compiler check (0 errors)
npm run lint         # ESLint check (0 errors, 0 warnings)
npm run test         # Vitest test suite (all 30 WCAG contrast tests passing)
npm run build        # Production bundle build
```

### Backend
```bash
cd backend
uv run pytest        # Pytest test suite (health check endpoint tests passing)
```
