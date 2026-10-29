# CREDEN — AICTE Student Data Management & Academic Verification Platform

CREDEN is an enterprise-grade academic data infrastructure and verification platform engineered for the **All India Council for Technical Education (AICTE)**. It unifies institutional student records, provides explainable discrepancy triaging, monitors statutory intake quotas with supernumerary seat adjustments, and delivers tamper-evident academic credential verification via opaque cryptographic references.

---

## 1. Project Overview

CREDEN addresses three fundamental challenges in Indian technical higher education governance:
1. **Academic Identity Integrity:** Safe, privacy-preserving integration with the 12-digit Automated Permanent Academic Account Registry (**APAAR**) without public identifier exposure.
2. **Transparent Intake Monitoring:** Capacity monitoring that evaluates approved sanctioned seats alongside statutory supernumerary quotas (EWS 10%, TFW 5%, PMSSS), eliminating false violation flags.
3. **Authorized Credential Verification:** High-throughput, sub-second verification portal for authorized employers and universities using opaque references (`VRF-YYYY-XXXXX`), QR credentials, and role-based attribute shielding.

---

## 2. Architecture & System Flow

```
                                  ┌───────────────────────────────┐
                                  │      CREDEN Frontend          │
                                  │   (React 18, TypeScript)      │
                                  │  Three.js Identity Network    │
                                  └───────────────┬───────────────┘
                                                  │
                                         REST API / Axios
                                                  │
                                  ┌───────────────▼───────────────┐
                                  │       FastAPI Gateway         │
                                  │      (Python 3.12, CORS)      │
                                  └───────┬───────────────┬───────┘
                                          │               │
                     ┌────────────────────┴───┐       ┌───┴───────────────────┐
                     │ Verification Engine    │       │ CSV Batch Validator   │
                     │  - Opaque Ref Routing  │       │  - RFC-4180 Ingestion │
                     │  - Role Field Shield   │       │  - Intra-batch DUPs   │
                     │  - SHA-256 Digits      │       │  - APAAR Checksums    │
                     └────────────────────────┘       └───────────────────────┘
                                          │               │
                                  ┌───────▼───────────────▼───────┐
                                  │   SQLAlchemy 2.x ORM / DB     │
                                  │   PostgreSQL / SQLite Dev     │
                                  └───────────────────────────────┘
```

---

## 3. Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript (Strict Mode)
- **Bundler:** Vite 5
- **Styling:** Tailwind CSS (Dark enterprise tokens: `#060709`, `#0c1017`)
- **3D Graphics:** Three.js animated identity network with graceful WebGL fallback
- **Routing:** React Router v6 with RoleContext state
- **Visualizations:** Recharts (Intake curves, state distribution, CAGR forecasts)
- **Icons:** Lucide React
- **HTTP Client:** Axios with health interceptors and offline failover

### Backend
- **Framework:** FastAPI with Python 3.12+
- **Database / ORM:** SQLAlchemy 2.x with SQLite (dev zero-dependency) and PostgreSQL support
- **Migrations:** Alembic
- **Data Validation:** Pydantic v2 & Pydantic-Settings
- **Test Harness:** pytest with pytest-asyncio and Starlette TestClient

---

## 4. Prerequisites

- **Node.js:** v18.0.0 or higher (v20+ recommended)
- **Python:** 3.12 or higher
- **Package Managers:** `npm` (frontend), `pip` or `uv` (backend)

---

## 5. Environment Configuration

### Root / Backend Configuration (`backend/.env`)
```env
PROJECT_NAME="CREDEN AICTE Verification Platform"
ENVIRONMENT="development"
API_V1_STR="/api/v1"
SECRET_KEY="dev-secret-key-change-in-production-1234567890"

# Uses local SQLite by default. Set PostgreSQL URL for production
DATABASE_URL="sqlite:///./creden_dev.db"
FALLBACK_SQLITE_URL="sqlite:///./creden_dev.db"

BACKEND_CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173","http://localhost:3000"]
```

### Frontend Configuration (`frontend/.env`)
```env
VITE_API_BASE_URL="http://localhost:8000"
```

---

## 6. Backend Setup & Launch

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run database migrations (Alembic)
alembic upgrade head

# 5. Initialize deterministic synthetic demo dataset
python3 -m app.db.seed --reset

# 6. Start the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Health Endpoint:** `http://localhost:8000/api/health`
- **Interactive OpenAPI Documentation:** `http://localhost:8000/docs`

---

## 7. Frontend Setup & Launch

Open a separate terminal window:

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start Vite development server
npm run dev
```

- **Application URL:** `http://localhost:5173`

---

## 8. Database Migrations & Reseeding

### Running Migrations
```bash
cd backend
alembic upgrade head
```

### Resetting / Reseeding Synthetic Demo Data
```bash
cd backend
python3 -m app.db.seed --reset
```
*Populates 12 technical institutions across 7 Indian states, 1,000 deterministic student records, and 5 academic verification test scenarios.*

---

## 9. Running Tests

### Backend Tests (pytest)
```bash
pytest -v
```
*Runs all 19 tests covering CORS headers, health checks, model definitions, server-side CSV upload validation, anti-APAAR enumeration, and role-based field restrictions.*

### Frontend Tests (Vitest / tsx)
```bash
cd frontend
npm test
```
*Runs all 33 tests across Student & CSV validation, Deterministic Validation Engine, Intake Monitoring & Reports, and Academic Verification & Student Portal.*

### Code Quality & Build Checks
```bash
cd frontend
npm run lint    # ESLint check (0 errors, 0 warnings)
npm run build   # Production TypeScript build
```

---

## 10. Demo Role Switcher & Persona Navigation

CREDEN features a **Simulated Role Switcher** in the top navigation bar to showcase how the governance platform adapts per stakeholder without requiring multiple login accounts:

| Persona | Scope | Default Route | Key Demonstration Capabilities |
|---|---|---|---|
| **AICTE Admin** | National | `/dashboard` | National KPIs, state filters, intake capacity monitoring, validation findings queue, immutable audit logs. |
| **Institution Admin** | College Node (COEP Pune [1-332901124]) | `/students?institution=COEP` | Scoped student registry, CSV batch upload, row-level validation diagnostics, template download. |
| **Student** | Self-Service (Aarav Sharma [STU-001]) | `/student` | Masked APAAR ID (`98••-••••-9011`), dynamic QR credential pass generation, PNG pass export, transparency ledger. |
| **Authorized Verifier** | Third-Party Screener / Employer | `/verification` | Opaque reference lookup (`VRF-*`), role-based attribute shielding, printable digitally signed receipts. |

---

## 11. Synthetic Test Records & Verification Scenarios

| Reference | Target Institution & Program | Conferred Status | Permitted Disclosure |
|---|---|---|---|
| **`VRF-2026-V8892`** | COEP Pune (B.Tech Computer Science) | **Verified Authentic** | Full degree details, CGPA 9.24, state DTE clearance |
| **`VRF-2026-R4109`** | DTU Delhi (B.Tech Information Tech) | **Awaiting Review** | Enrollment active; pending dual-counseling certificate |
| **`VRF-2026-D9901`** | COEP Pune (B.Tech Mechanical) | **Corrected & Cleared** | Previous dual-enrollment token resolved by State DTE |
| **`VRF-2026-X0012`** | Unaccredited Technical Institute | **Invalid / Revoked** | Unapproved programme exceeding statutory quota |
| **`VRF-2025-EXP99`** | PSG College of Technology | **Expired Reference** | Lapsed verification window |

---

## 12. Security & Privacy Safeguards

- **No Plaintext APAAR Exposure:** Student APAAR identifiers are strictly masked (`98••-••••-9011`) across all public, verifier, and audit screens.
- **Anti-Enumeration Protection:** Student records cannot be queried or searched publicly by raw APAAR numbers or Aadhaar IDs.
- **Opaque Reference Architecture:** Verifiers query opaque references (`VRF-YYYY-XXXXX`); QR codes embed only the controlled URL `/verify/:reference`.
- **Role-Based Attribute Disclosure:** Public inquiries shield CGPA and migration details; employer screeners receive only authorized academic credentials.
- **Zero-PII Audit Trails:** Access logs record only opaque references, hashed client IP headers (`d41d8cd98f00•••`), and timestamps.
- **Server-Side CSV Upload Validation:** File size caps (5MB), MIME verification, encoding safety, and row-level schema checks protect against malicious ingestion.

---

## 13. Known Limitations & Demonstration Boundaries

- **Simulated APAAR Sandbox Adapter:** CREDEN integrates with a simulated DigiLocker/UIDAI sandbox adapter. It does not ping live Indian citizen vaults or Aadhaar biometric services.
- **Simulated Role Switcher:** The role switcher is designed for evaluator demonstration; it is distinct from production OAuth2/OpenID single sign-on.
- **Local Fallback Mode:** If the backend FastAPI process is halted, the frontend automatically falls back to an in-browser deterministic engine, allowing presentations to continue uninterrupted.

---

## 14. Deployment Configuration

### Production Dockerfile (Backend)
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Static Build (Frontend)
```bash
cd frontend
npm run build
# Output directory: dist/ (serve via Nginx, Vercel, or AWS CloudFront)
```

For the step-by-step presentation walkthrough, see [DEMO_SCRIPT.md](file:///Users/shouryasinha/bigleagues/prism/DEMO_SCRIPT.md).
