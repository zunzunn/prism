# PRISM — Project Context & Implementation Progress

**PRISM: Proactive Regulatory Intelligence & Status Monitoring**  
**Design Direction:** Calm Ledger · **Accent:** Indigo / Violet · **Themes:** 6 Semantic Themes · **Platform:** Desktop (≥1280px)

---

## 1. Project Overview & Architecture

PRISM is an AI-assisted regulatory workflow and compliance monitoring platform designed to help technical educational institutions and regulatory officials manage approval applications, document verification, compliance obligations, deadlines, and immutable audit logs.

### Core Stack
- **Frontend**: React 18, TypeScript (strict), Vite, Tailwind CSS, TanStack Query, Radix UI headless primitives, Lucide React, and Motion.
- **Backend**: FastAPI, Python 3.12, SQLModel (SQLAlchemy 2.0 ORM), SQLite (`prism.db`), and Uvicorn.
- **Storage**: Private local disk storage in `backend/storage/uploads/` with sanitized, collision-resistant server-generated filenames.
- **Authentication**: Stateless HMAC-SHA256 cryptographically signed session tokens with role and institution claim validation on every protected route.

---

## 2. Progress Summary

### Phase 1: Project Foundation (Completed)
- **Repository Setup**: Initialized Git repository on `main` branch with comprehensive `.gitignore` preventing build artifacts, virtual environments, local databases, and uploaded documents from tracking.
- **Design Tokens & Themes**: Implemented all 6 themes from `design.md` in `frontend/src/styles/tokens.css` (`daylight`, `dusk`, `void`, `paper`, `contrast-light`, `contrast-dark`) with semantic CSS variables, derived status soft backgrounds (`color-mix`), and the signature `--prism` gradient touch.
- **Typography & Numerals**: Inter for UI text and JetBrains Mono with tabular numerals (`tabular-nums`) for identifiers, dates, and metric digits.
- **Automated Contrast Verification**: Added `frontend/src/lib/contrast.test.ts` verifying all 30 color pairings meet WCAG 2.2 AA (≥ 4.5:1) and AAA (≥ 7:1) contrast requirements.
- **Application Shell**: Collapsible sidebar (240px / 64px, auto-collapsing below 1440px), top bar with demo environment pill, live IST clock, theme dropdown menu, and short page transitions.
- **Backend Foundation**: Configured FastAPI entry point, CORS middleware, environment-based configuration, and health check route (`/api/health`).

### Phase 2: Authentication & Core Application Management (Completed)
- **Demo Authentication System**:
  - One-click sign-in screen at `/signin` (440px centered card, 2px prism top edge, delta logo, persistent sample-data disclaimer).
  - Supported roles:
    - `institution_user`: Dr. Ramesh Gupta (Apex Institute of Technology, `inst-01`)
    - `officer`: Priya Sharma (Regulatory Review Bureau)
    - `admin`: Vikramaditya Nair (PRISM System Administration)
    - Disabled concept cards for Committee Reviewer and Auditor.
  - Endpoints: `POST /api/demo-login`, `GET /api/me`, `POST /api/logout`.
  - Frontend `AuthContext` with session restoration from `localStorage` (`prism.auth_token`) and automatic Bearer token injection in `apiClient`.
- **Database & Relative-Date Seed Data**:
  - SQLModel tables: `User`, `Institution`, `StageConfig`, `Application`, `Document`, `AuditEvent`.
  - Deterministic seeder with relative dates (`now + 6 days`, `now - 3 days` for overdue tasks), populating 12 diverse applications across 3 institutions and 8 stages.
  - Idempotent seeding during application lifespan startup; reset endpoint at `POST /api/demo/reset`.
- **Applications List View & API**:
  - Endpoint `GET /api/applications` with server-side pagination, search (ref, institution, program type), stage filtering, status filtering, and sorting.
  - Priority detection flagging overdue tasks and attention-requiring dossiers.
  - Role-based scoping: Institution users strictly view applications belonging to their institution; officers and admins view all applications.
  - Frontend `ListPage.tsx` with filter bar, responsive data table, and pagination controls.
- **Application Dossier**:
  - Route `/applications/:id` with application header (ref, institution, program type, owner, deadline).
  - Data-driven 8-stage progress tracker with completed indicators and active **prism gradient** segment.
  - Dossier tabs:
    - **Summary**: Structured particulars and institutional governance details.
    - **Documents**: File list with metadata, upload timestamp, and preview/download links.
    - **Audit History**: Chronological vertical event timeline.
  - Error and authorization handling: 404 for missing applications and 403 for cross-institution access attempts.
- **Real Document Uploads & Storage**:
  - Drag-and-drop dropzone supporting PDF, PNG, and JPEG formats up to 10 MB.
  - Magic byte verification (`%PDF-`, `\x89PNG`, `\xff\xd8\xff`) to prevent MIME spoofing.
  - Storage under `backend/storage/uploads/` with UUID-prefixed filenames.
  - Authenticated preview and download endpoint `GET /api/documents/{id}/file`.
  - Automatic `AuditEvent` logging upon upload.

---

## 3. Current Directory Structure

```
prism/
├── design.md                 # Primary design & architecture specification
├── context.md                # Ongoing progress & implementation context
├── README.md                 # Project architecture, setup, and verification guide
├── .env.example              # Environment variables template
├── backend/                  # FastAPI backend
│   ├── pyproject.toml        # Dependencies and packaging
│   ├── requirements.txt      # Pip dependencies
│   ├── main.py               # App entrypoint, lifespan seeding, router mounting
│   ├── app/
│   │   ├── config.py         # Application settings (secret keys, storage, db)
│   │   ├── db.py             # SQLite engine & session management
│   │   ├── auth.py           # HMAC-SHA256 session token management & RBAC
│   │   ├── models.py         # SQLModel database entities
│   │   ├── schemas.py        # Pydantic request & response schemas
│   │   ├── seed.py           # Relative-date idempotent seed data generator
│   │   └── routers/
│   │       ├── health.py     # /api/health
│   │       ├── auth.py       # /api/demo-login, /api/me, /api/logout
│   │       ├── applications.py # /api/applications, /api/applications/{id}
│   │       ├── documents.py  # /api/applications/{id}/documents, /api/documents/{id}/file
│   │       └── demo.py       # /api/demo/reset
│   ├── storage/uploads/      # Local document storage directory
│   └── tests/
│       ├── conftest.py       # Test database setup fixture
│       ├── test_health.py    # Health check endpoint tests
│       ├── test_auth.py      # Authentication and token validation tests
│       ├── test_seed.py      # Seeding persistence & idempotency tests
│       ├── test_applications.py # Listing, filtering, and RBAC tests
│       └── test_documents.py # Upload validation, size limits, and download tests
└── frontend/                 # React + TypeScript frontend
    ├── package.json          # Dependencies & scripts
    ├── vite.config.ts        # Vite configuration & backend proxy
    ├── tailwind.config.ts    # Semantic token mappings & theme configuration
    ├── eslint.config.js      # ESLint 9 configuration with strict rules
    ├── index.html            # Root HTML with delta mark
    ├── src/
    │   ├── main.tsx          # Application entrypoint
    │   ├── App.tsx           # Providers & RouterProvider
    │   ├── app/
    │   │   ├── router.tsx    # App routes & ProtectedRoute setup
    │   │   ├── providers.tsx # QueryClient, AuthProvider & MotionConfig
    │   │   └── layout/       # AppShell, Sidebar, TopBar, ThemeMenu, PageTransition
    │   ├── styles/           # tokens.css, fonts.css, globals.css
    │   ├── lib/              # api.ts, theme.ts, motion.ts, statusMap.ts, dates.ts
    │   ├── components/       # StatusBadge, DemoPill, Button, Card
    │   ├── features/
    │   │   ├── auth/         # SignInPage, AuthContext, useAuth, ProtectedRoute
    │   │   ├── applications/ # ListPage, DossierPage
    │   │   └── foundation/   # FoundationReadinessPage, PlaceholderPage
    │   └── types/            # TypeScript domain interfaces
    └── dist/                 # Production build bundle
```

---

## 4. Test Suite & Verification Status

| Suite | Runner | Test Count | Status |
|---|---|---|---|
| **Backend API & RBAC** | `uv run pytest` | 28 tests | **All Passed** (0.64s) |
| **Frontend Contrast & Tokens** | `npm run test` (Vitest) | 30 tests | **All Passed** (30 WCAG AA/AAA theme pairings) |
| **Frontend Auth Storage** | `npm run test` (Vitest) | 2 tests | **All Passed** (Storage lifecycle) |
| **TypeScript Strictness** | `npm run typecheck` | N/A | **0 errors** (`tsc --noEmit`) |
| **ESLint 9** | `npm run lint` | N/A | **0 errors, 0 warnings** |
| **Production Build** | `npm run build` | N/A | **Clean build** (2.17s) |

---

## 5. Git Commit History

The repository maintains an incremental, natural-language commit history:

1. `174edc2`: `Initialize project repository and add design specification`
2. `552ee28`: `Set up backend foundation with FastAPI, health router, and tests`
3. `ef3d579`: `Add design tokens, six themes, and automated WCAG contrast test suite`
4. `7680ee4`: `Create application shell layout, routing, and foundation verification view`
5. `b4d631e`: `Add project documentation with architecture overview and startup instructions`
6. `f3048c5`: `Add persistent demo authentication for institution users, officers, and administrators`
7. `341493c`: `Create SQLite models and seed realistic demo applications with relative deadlines`
8. `4219d11`: `Implement application listing and detail endpoints with role-based access control`
9. `22b1583`: `Build demo authentication views, session management, and applications list interface`
10. `9aef1b1`: `Build application dossier with stage tracker, summary details, and audit history`
11. `b3a47b5`: `Implement secure document uploads with validation, local storage, and preview endpoints`
12. `9a5f14c`: `Finalize Phase 2 integration, test suite, and setup documentation`

---

## 6. How to Run Locally

### Start Backend
```bash
cd backend
uv run uvicorn main:app --reload --port 8000
```
- API Documentation: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

### Start Frontend
```bash
cd frontend
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 7. Upcoming Next Phase: Phase 3

### Phase 3 Scope (AI Document Analysis, Verification Findings & Clarifications)
1. **Rule-Based & Mocked AI Verification Engine**:
   - Deterministic field extraction checks (registration dates vs. form dates, mandatory disclosures, expiring certificates).
   - Generates evidence-backed `Finding` cards with source labels (`Rule-based check` or `AI extraction (demo, mocked)`) and confidence labels (`High`, `Medium`, `Low`).
2. **Findings Review Workflow**:
   - Review officer can mark findings as `Confirmed` or `Dismissed` with notes.
   - Findings disclaimer footer: *"Findings are possible issues flagged for human review. They do not establish authenticity or decide outcomes."*
   - Audit event generated for every finding review transition.
3. **Clarifications Thread**:
   - Review officer "Request clarification" dialog pre-linked to findings with due dates.
   - Institution user reply interface with text and document attachments.
   - Clarification status lifecycle (`Open` → `Replied` → `Resolved` / `Overdue`).
