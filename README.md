# CREDEN — AICTE Student Data Management & Academic Verification Platform

CREDEN is an enterprise-grade academic data infrastructure and verification platform built for the All India Council for Technical Education (AICTE). It provides high-throughput student credential verification, APAAR ID linkage, automated transcript validation, and cryptographic audit proofs in a dark, futuristic minimal interface.

---

## Architecture & Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript in strict mode
- **Build Tool:** Vite
- **Styling:** Tailwind CSS with minimal dark enterprise design tokens
- **Routing:** React Router v6
- **Icons:** Lucide React
- **HTTP Client:** Axios with response interceptors
- **Analytics & Visuals:** Recharts & Framer Motion

### Backend
- **Framework:** FastAPI with Python 3.12+
- **ORM & DB:** SQLAlchemy 2.x with PostgreSQL (with SQLite fallback for zero-dependency local dev)
- **Migrations:** Alembic
- **Validation:** Pydantic v2 & Pydantic-Settings
- **Testing:** pytest with pytest-asyncio and FastAPI TestClient

---

## Directory Structure

```text
creden/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/            # TopBar, Sidebar, Navigation
│   │   │   ├── dashboard/         # MetricsGrid, RecentVerificationsTable, StatusBanner
│   │   │   ├── students/          # Student registry components
│   │   │   ├── institutions/      # AICTE institute management
│   │   │   ├── validation/        # Bulk validation pipeline
│   │   │   ├── verification/      # Academic credential verification engine
│   │   │   └── charts/            # Analytical charts
│   │   ├── pages/                 # Route views & module pages
│   │   ├── layouts/               # AppShell responsive container
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── services/              # Axios API clients
│   │   ├── types/                 # TypeScript interfaces
│   │   ├── lib/                   # Utility helpers
│   │   ├── data/                  # Mock audit data & metrics
│   │   └── styles/                # Tailwind CSS globals
│   ├── package.json
│   ├── tsconfig.json              # Strict mode TypeScript config
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/
│   ├── app/
│   │   ├── api/                   # API routers (GET /api/health)
│   │   ├── core/                  # App config & environment settings
│   │   ├── db/                    # SQLAlchemy engine & session factory
│   │   ├── models/                # Student, Institution, Verification models
│   │   ├── schemas/               # Pydantic schemas
│   │   ├── services/              # Business logic services
│   │   ├── repositories/          # Database queries
│   │   └── middleware/            # Custom middlewares
│   ├── tests/                     # Pytest suite
│   ├── alembic/                   # Database migrations
│   ├── alembic.ini
│   ├── requirements.txt
│   └── pyproject.toml
├── .env.example                   # Root environment configuration
├── .gitignore
└── README.md
```

---

## Development Setup

### 1. Prerequisites
- **Python:** 3.12+ (or `uv`)
- **Node.js:** v18+ (tested on Node v20/v26)
- **PostgreSQL:** (optional for initial mock/dev, required for full production DB)

---

### 2. Environment Configuration

Copy the example environment files:

```bash
# In the repository root
cp .env.example .env

# In backend/
cp backend/.env.example backend/.env

# In frontend/
cp frontend/.env.example frontend/.env
```

Key environment settings:
- `DATABASE_URL`: PostgreSQL connection string (`postgresql+psycopg://postgres:postgres@localhost:5432/creden`). If Postgres is not running, the backend falls back gracefully to SQLite in development mode.
- `BACKEND_CORS_ORIGINS`: JSON array of authorized origins (`["http://localhost:5173", "http://127.0.0.1:5173"]`).
- `VITE_API_BASE_URL`: Backend API base URL (`http://localhost:8000`).

---

### 3. Backend Setup

```bash
cd backend

# Create and activate virtual environment (using uv or standard python)
uv venv .venv
source .venv/bin/activate

# Install dependencies
uv pip install -e .
uv pip install pytest pytest-asyncio

# Run the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify backend health:
```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "CREDEN AICTE Verification Platform",
  "environment": "development",
  "version": "0.1.0",
  "timestamp": "2026-10-29T08:50:00Z",
  "database": "connected"
}
```

Interactive OpenAPI docs are available at `http://localhost:8000/docs`.

---

### 4. Database Migrations (Alembic)

```bash
cd backend
source .venv/bin/activate

# Generate new migration
alembic revision --autogenerate -m "initial schema"

# Apply migrations
alembic upgrade head
```

---

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run Vite development server
npm run dev
```

The frontend will run at `http://localhost:5173`.

To verify TypeScript and production build:
```bash
npm run build
```

---

### 6. Running Tests

```bash
# Backend pytest suite
cd backend
source .venv/bin/activate
pytest -v

# Frontend TypeScript check
cd ../frontend
npm run build
```

---

## Design System & UX Principles
- **Theme:** Minimal enterprise dark mode (`#060709` deep background, `#0c1017` charcoal cards).
- **Accents:** Emerald green (`#10b981`) for verified status and operational health; amber for in-review states; muted rose for audit discrepancies.
- **Typography:** Inter for clean operational density, JetBrains Mono for cryptographic hashes, block numbers, and APAAR IDs.
