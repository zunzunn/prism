# PRISM — Project Context & Implementation Progress

**PRISM: Proactive Regulatory Intelligence & Status Monitoring**  
**Design Direction:** Calm Ledger · **Accent:** Indigo / Violet · **Themes:** 6 Semantic Themes · **Platform:** Desktop (≥1280px)

---

## 1. Project Overview & Architecture

PRISM is an AI-assisted regulatory workflow and compliance monitoring platform designed to help technical educational institutions and regulatory officials manage approval applications, document verification, compliance obligations, deadlines, and immutable audit logs.

### Core Stack
- **Frontend**: React 18, TypeScript (strict), Vite, Tailwind CSS, TanStack Query, Radix UI headless primitives, Lucide React, and Motion.
- **Backend**: FastAPI, Python 3.12/3.13, PyMuPDF (fitz), SQLModel (SQLAlchemy 2.0 ORM), SQLite (`prism.db`), and Uvicorn.
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
  - Supported roles: `institution_user`, `officer`, and `admin`.
  - Endpoints: `POST /api/demo-login`, `GET /api/me`, `POST /api/logout`.
- **Database & Relative-Date Seed Data**:
  - SQLModel tables: `User`, `Institution`, `StageConfig`, `Application`, `Document`, `AuditEvent`.
  - Deterministic seeder with relative dates, populating 12 diverse applications across 3 institutions and 8 stages.
- **Applications List View & API**:
  - Endpoint `GET /api/applications` with server-side pagination, search, stage filtering, status filtering, and sorting.
  - Role-based scoping: Institution users view only their institution's applications; officers and admins view all applications.
- **Application Dossier**:
  - Route `/applications/:id` with application particulars, 8-stage progress tracker, and audit history.
- **Real Document Uploads & Storage**:
  - Drag-and-drop dropzone supporting PDF, PNG, and JPEG formats up to 10 MB.
  - Magic byte verification (`%PDF-`, `\x89PNG`, `\xff\xd8\xff`) to prevent MIME spoofing.
  - Authenticated preview and download endpoint `GET /api/documents/{id}/file`.

### Phase 3: Document Verification Engine (Completed)
- **PyMuPDF Document Processing Engine (`backend/app/services/document_processor.py`)**:
  - Robust text and page layout extraction using PyMuPDF (`pymupdf`).
  - Graceful, exception-safe handling for:
    - Empty files (0 bytes / 0 pages) → marked as `empty` with clear warning.
    - Corrupt or invalid PDFs (`fitz.FileDataError`) → marked as `failed` without server crashing.
    - Scanned/image-only PDFs → detected and flagged with advisory notices.
    - Image documents (PNG, JPEG) → validated for dimensions and optical structure.
- **Structured Field Extraction Service (`backend/app/services/field_extractor.py`)**:
  - Deterministic entity parsing extracting:
    - Institution name
    - Document reference / registration / certificate numbers
    - Dates (registration, issuance, and certificate expiry)
    - Land details (survey / khasra numbers)
  - Explicit extraction states: `extracted`, `uncertain`, and `not_found` (no fabricated numerical confidence percentages).
  - Extracts verbatim surrounding evidence excerpts (monospace context snippets) and exact page references.
- **Modular Verification Pipeline (`backend/app/services/verification_pipeline.py`)**:
  - Pipeline completely decoupled from route handlers.
  - Idempotent execution (removes prior findings for a document on re-processing to prevent duplication).
  - Deterministic regulatory cross-checks:
    - `CHK_INST_MATCH`: Identifies discrepancies between document institution name and registered application record.
    - `CHK_DATE_ORDER`: Detects certificates dated later than the application submission date.
    - `CHK_EXPIRY_PAST`: Flags expired compliance certificates (High severity).
    - `CHK_EXPIRY_SOON`: Flags certificates expiring within 60 days (Medium severity).
    - `CHK_MISSING_SURVEY`: Flags land deeds lacking required survey/khasra numbers.
    - `CHK_MISSING_CERT_NO`: Flags safety documents lacking certificate reference numbers.
    - `CHK_EMPTY_DOC`: Flags 0-byte or blank document payloads.
    - `CHK_CORRUPT_DOC`: Flags unreadable or corrupt file binaries.
  - Automatic escalation: flags application `current_status = "needs_attention"` when high-severity findings are detected.
  - Generates immutable `AuditEvent` records upon each verification run.
- **Verification & Findings API (`backend/app/routers/verification.py`)**:
  - `POST /api/documents/{document_id}/verify`: Executes verification on an authorized document.
  - `GET /api/documents/{document_id}/extraction`: Retrieves structured fields, states, and text layer.
  - `GET /api/applications/{application_id}/findings`: Lists findings with optional `severity`, `review_state`, and `category` filters.
  - `POST /api/findings/{finding_id}/review`: Records human review decisions (`confirmed` or `dismissed`) with optional reviewer note, enforced by RBAC (officer/admin only; institution users receive 403 Forbidden) and generates audit events.
- **Frontend Dossier UI Enhancement (`frontend/src/features/applications/DossierPage.tsx`)**:
  - **Findings & Verification Tab**:
    - Filter chips: `All`, `Needs review`, `Confirmed`, `Dismissed`, plus severity selector.
    - Dynamic count badge in the tab header showing pending review items.
    - Mandatory disclaimer footer: *"Findings are possible issues flagged for human review. They do not establish authenticity or decide outcomes."*
  - **FindingCard Component (`frontend/src/components/FindingCard.tsx`)**:
    - Conforms strictly to `design.md` §6.11.
    - Severity badge, plain-language explanation, evidence block with monospace verbatim excerpt and comparison values (extracted vs expected).
    - Source and confidence labels.
    - Officer review actions with confirmation dialog and note input.
    - Read-only presentation for Institution users.
  - **DocumentExtractionDrawer (`frontend/src/components/DocumentExtractionDrawer.tsx`)**:
    - Inspects parsed structured entities with status badges (`extracted`, `uncertain`, `not_found`), page numbers, and verbatim text contexts.
    - Full extracted raw text stream viewer.
  - **Documents Tab Integration**:
    - "Extractions" inspection button and "Verify" action button per document row.
    - Auto-verification upon document upload.

---

## 3. Test Suite & Quality Verification Status

| Suite | Runner | Test Count | Status |
|---|---|---|---|
| **Backend Verification & API** | `uv run pytest` | 37 tests | **All Passed** (0.83s) |
| **Frontend Verification & Status** | `npm run test` (Vitest) | 34 tests | **All Passed** (0.33s) |
| **TypeScript Strictness** | `npm run typecheck` | N/A | **0 errors** (`tsc --noEmit`) |
| **ESLint 9** | `npm run lint` | N/A | **0 errors, 0 warnings** |
| **Production Build** | `npm run build` | N/A | **Clean build** (1.78s) |

---

## 4. Git Commit History

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
13. `bf932e1`: `Implement document verification pipeline, deterministic checks, and findings API`

---

## 5. How to Run Locally

### Start Backend
```bash
cd backend
uv run uvicorn main:app --reload --port 8000
```
- Interactive API Documentation: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

### Start Frontend
```bash
cd frontend
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 6. Next Phase: Phase 4 (Clarifications, Deadlines & Alerts)
- Officer "Request Clarification" workflow linked to findings.
- Institution user clarification replies with file attachments.
- Escalation engine, deadlines calendar & priority alerts queue.
