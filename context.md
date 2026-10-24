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
### Phase 4: Regulatory Compliance Rules Engine (Completed)
- **Authoritative Regulatory Rules Registry (`backend/app/services/rules_registry.py`)**:
  - Authoritative citations directly referencing official AICTE Approval Process Handbook (APH 2024–2027) chapters, clauses, and procedural norms:
    - `RULE-LAND-01` (v1.0 & v2.0): Land Title & Ownership Consistency (APH 2024–2027 Ch. II Cl. 2.1).
    - `RULE-SAFE-01` (v1.0): Structural Stability & Fire Safety Certification (APH 2024–2027 Ch. II Cl. 2.4).
    - `RULE-DISC-01` (v1.0): Mandatory Institutional Public Disclosure (APH 2024–2027 Ch. VII Cl. 7.2).
    - `RULE-AFFI-01` (v1.0): Anti-Ragging & Faculty Pay Undertaking Affidavit (APH 2024–2027 Ch. II Cl. 2.8 & 2.9).
    - `RULE-DATE-01` (v1.0): Statutory Clearance Issuance Pre-dating Application (APH 2024–2027 Ch. I Procedural Guidelines).
    - `RULE-BUILD-01` (v1.0): Approved Campus Layout & Architectural Plan (APH 2024–2027 Ch. II Cl. 2.3).
    - `DEMO-RULE-SPEC-01` (v1.0): Smart Campus Solar Energy & Water Audit (*Explicitly tagged as Synthetic Demonstration Rule, not official AICTE mandate*).
  - Version resolution: engine determines the active rule version effective at the application submission date/cycle (demonstrated with v1.0 and v2.0 for `RULE-LAND-01`).
- **Data Models (`backend/app/models.py`)**:
  - `RegulatoryRule`: versioned regulatory requirements, criteria configuration, severity, mandatory review flag, source handbook citations, effectivity dates.
  - `ComplianceObligation`: application-level compliance obligations with distinct evaluation statuses, due dates, review statuses, and notes.
  - `RuleEvaluation`: immutable, explainable evaluation audit records with batch IDs, expected vs actual values, document references, page numbers, and verbatim evidence snippets.
- **Deterministic Rules Engine (`backend/app/services/rules_engine.py`)**:
  - Decoupled from HTTP routes, pure deterministic logic without arbitrary Python code execution.
  - Check types: `required_document_presence`, `required_field_presence`, `certificate_expiry`, `date_order_validity`, `extracted_vs_record_match`, and `mandatory_human_review`.
  - Non-fabricated statuses: `satisfied`, `not_satisfied`, `pending_evidence`, `needs_review`, `unable_to_evaluate`, `not_applicable`, `exception_granted`.
  - Automatic `AuditEvent` logging upon every evaluation execution.
  - Authorized officer review override workflow with accountability notes and audit trail preservation.
- **Compliance API Router (`backend/app/routers/compliance.py`)**:
  - `GET /api/rules`: Lists regulatory rules with category and synthetic filters.
  - `GET /api/rules/{rule_code}/versions`: Lists all historical and upcoming versions of a rule.
  - `GET /api/applications/{application_id}/compliance`: Retrieves obligations, summary metrics, and latest evaluations.
  - `POST /api/applications/{application_id}/compliance/evaluate`: Executes deterministic re-evaluation on-demand.
  - `GET /api/applications/{application_id}/compliance/history`: Retrieves full evaluation audit trail.
  - `POST /api/compliance/obligations/{obligation_id}/review`: Records authorized officer/admin review decisions and overrides with RBAC enforcement (officers/admins only; institution users receive 403 Forbidden).
- **Frontend Dossier Compliance UI (`frontend/src/features/compliance/`)**:
  - **Compliance Tab in Dossier (`DossierPage.tsx`)**:
    - Header indicator showing total obligations and attention items.
    - Executive status cards (`ComplianceSummaryCards.tsx`) displaying exact counts for Satisfied, Needs Review, Pending Evidence, Not Satisfied, and Unable to Evaluate (strictly avoiding fabricated single percentages).
    - Interactive filters (Status chips, Category dropdown, text search).
    - View switcher between "Requirements" and "Audit Trail" views.
  - **ComplianceCard Component (`ComplianceCard.tsx`)**:
    - AICTE Handbook citation badge vs Synthetic Demonstration badge.
    - Severity and mandatory officer review indicators.
    - Explainability box with expected condition, actual extracted evidence, verbatim snippet, and document link.
    - Review state badge (`unreviewed`, `confirmed`, `overridden`).
    - Officer actions: Quick "Confirm Status" or "Record Review Decision / Override" with form for decision selection (`satisfied`, `not_satisfied`, `exception_granted`) and mandatory review rationale.
  - **ComplianceAuditHistory Component (`ComplianceAuditHistory.tsx`)**:
    - Chronological log of automated checks and officer review overrides.
  - **Mandatory AICTE Governance Disclaimer**:
    - *"Regulatory compliance assessments are evidence-based deterministic evaluations under AICTE Approval Process Handbook (APH 2024–2027) guidelines. The rules engine does not automatically grant or deny institutional approval; all final statutory determinations rest with authorized scrutiny officers."*

---

## 3. Test Coverage & Verification

- **Backend**: **49 automated tests** (`pytest`) passing with 100% success rate:
  - `test_rules_engine.py`: 12 tests covering default rules, citations, version resolution, deterministic checks (expiry, name match, post-dating, missing evidence, unreadable docs), officer review overrides, audit logging, API endpoints, and cross-institution isolation.
  - `test_verification.py`: 9 tests covering document processing and verification.
  - `test_applications.py`, `test_documents.py`, `test_auth.py`, `test_seed.py`, `test_health.py`: 28 tests.
- **Frontend**: **36 automated unit tests** (`vitest`) passing:
  - Contrast accessibility tests (all 30 pairs passing AA/AAA).
  - Auth token and session restore tests.
  - Finding state and severity tests.
  - Compliance status governance and non-fabrication tests (`compliance.test.ts`).
- **Type Safety & Linting**:
  - `npm run typecheck` → **0 errors**
  - `npm run lint` → **0 errors, 0 warnings**
  - `npm run build` → **Production bundle builds cleanly** (Vite in 1.50s).

---

## 4. Git Commit History
1. `89b33a5`: `Initialize repository with foundation structure and .gitignore`
2. `ef26756`: `Configure design tokens, themes, and automated contrast verification`
3. `a9da84f`: `Initialize FastAPI application with health check and CORS`
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
14. `69c8558`: `Integrate findings review interface, document extraction drawer, and test suite`
15. `cc1d4d9`: `Update documentation and context for Phase 3 Document Verification Engine`
16. `fe66c10`: `Implement Phase 4 Regulatory Compliance Rules Engine backend, seed rules, and tests`
17. `bfa5353`: `Implement Phase 4 Regulatory Compliance UI tab, obligation cards, and evaluation metrics in Application Dossier`

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

## 6. Next Steps: Subsequent Phases
- Clarification thread messaging directly between review officers and institutions.
- Multi-channel notification, escalation rules, and deadline warning banners.
- Committee review management and final statutory disposition issuance.

