# PRISM — Project Context & Implementation Progress

**PRISM: Proactive Regulatory Intelligence & Status Monitoring**  
**Design Direction:** Calm Ledger · **Accent:** Indigo / Violet · **Themes:** 6 Semantic Themes · **Platform:** Desktop (≥1280px)

---

## 1. Project Overview & Architecture

PRISM is an AI-assisted regulatory workflow and compliance monitoring platform designed to help technical educational institutions and regulatory officials manage approval applications, document verification, compliance obligations, deadlines, workflow progression, and immutable audit logs.

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
  - Graceful, exception-safe handling for empty files, corrupt or invalid PDFs, scanned PDFs, and optical structures.
- **Structured Field Extraction Service (`backend/app/services/field_extractor.py`)**:
  - Deterministic entity parsing extracting institution name, registration numbers, dates, land details.
  - Explicit extraction states: `extracted`, `uncertain`, and `not_found` with verbatim evidence excerpts and page citations.
- **Modular Verification Pipeline (`backend/app/services/verification_pipeline.py`)**:
  - Idempotent deterministic regulatory cross-checks (`CHK_INST_MATCH`, `CHK_DATE_ORDER`, `CHK_EXPIRY_PAST`, `CHK_EXPIRY_SOON`, `CHK_MISSING_SURVEY`, `CHK_MISSING_CERT_NO`, `CHK_EMPTY_DOC`, `CHK_CORRUPT_DOC`).
  - Automatic status escalation to `needs_attention` and `AuditEvent` generation.
- **Findings Review & Inspection UI (`frontend/src/features/applications/DossierPage.tsx`)**:
  - FindingCard component with severity badges, evidence block, officer review actions, and DocumentExtractionDrawer.

### Phase 4: Regulatory Compliance Rules Engine (Completed)
- **Authoritative Regulatory Rules Registry (`backend/app/services/rules_registry.py`)**:
  - Authoritative citations directly referencing official AICTE Approval Process Handbook (APH 2024–2027) chapters, clauses, and procedural norms (`RULE-LAND-01`, `RULE-SAFE-01`, `RULE-DISC-01`, `RULE-AFFI-01`, `RULE-DATE-01`, `RULE-BUILD-01`, and synthetic `DEMO-RULE-SPEC-01`).
  - Version resolution: engine determines the active rule version effective at the application submission date/cycle.
- **Deterministic Rules Engine (`backend/app/services/rules_engine.py`)**:
  - Non-fabricated statuses: `satisfied`, `not_satisfied`, `pending_evidence`, `needs_review`, `unable_to_evaluate`, `not_applicable`, `exception_granted`.
  - Officer review overrides with mandatory justifications and immutable audit logs.
- **Compliance UI & Audit History (`frontend/src/features/compliance/`)**:
  - Executive summary cards with exact status counts, compliance obligation cards, explainability excerpts, and review dialogs.

### Phase 5: Workflow Automation Engine (Completed)
- **Workflow State Transitions & Enforcement (`backend/app/services/workflow_engine.py`)**:
  - Dynamic 8-stage pipeline (`stage-draft`, `stage-submitted`, `stage-doc-check`, `stage-desk-review`, `stage-clarification`, `stage-committee`, `stage-decision`, `stage-closed`).
  - Strict sequential ordering, role permissions (`institution_user` submits draft; `officer`/`admin` advance and return subsequent stages).
  - Terminal stage protection: applications in `stage-closed` cannot advance or return.
- **Comprehensive Stage Readiness Evaluation (`WorkflowEngine.evaluate_stage_readiness`)**:
  - Evaluates blockers across 6 distinct regulatory categories:
    - **Documents**: Detects unreadable or missing required evidentiary uploads.
    - **Findings**: Identifies unreviewed or unconfirmed high/medium severity discrepancies.
    - **Compliance**: Blocks transition if mandatory compliance obligations are unsatisfied or need review.
    - **Clarifications**: Identifies active, unresolved interlocutory inquiries.
    - **Assignments**: Verifies assigned scrutiny officer ownership for higher stages.
    - **Decisions**: Requires formal determination before advancing to terminal archiving.
  - Statutory Administrator Override: permits authorized emergency waiver with mandatory recorded legal reason.
- **Scrutiny Officer Workload & Assignment History (`AssignmentHistory`)**:
  - Dedicated assignment model logging assignor, assignee, previous owner, reason, and timestamp.
  - API endpoint `GET /api/users/officers` returning active officer workload metrics.
- **Interlocutory Clarification Request & Response Lifecycle (`ClarificationService`)**:
  - Data models `ClarificationRequest` and `ClarificationResponse` supporting threaded discourse.
  - Status lifecycle: `open` → `responded` → `under_review` → `resolved` / `cancelled`.
  - Secure institutional isolation: institution users can only view and reply to inquiries for their own institution.
  - Supporting document attachments linking uploaded PDFs/images to clarification messages.
  - Formal officer resolution and cancellation notes recorded in audit events.
- **Statutory Regulatory Determination (`DecisionRecord`)**:
  - Legally consequential approval (`approved`) or rejection (`rejected`) recorded by authorized officers/admins.
  - Captures mandatory legal justification, conditions/remarks, and linked finding IDs.
  - Recording a final determination automatically transitions the application to `stage-closed`.
- **Frontend Dossier Integration (`frontend/src/features/`)**:
  - **Workflow Action Center (`WorkflowActionCenter.tsx`)**:
    - Readiness banner ("Ready for Advancement" vs "Advancement Blocked").
    - Expandable blocker inspector detailing blocker codes, categories, and severity.
    - Assigned officer chip with quick "Reassign" dialog.
    - Stage transition buttons: "Advance Stage" (with modal), "Return Stage" (with modal), and "Record Decision".
    - Official Determination Certificate card displayed once final decision is rendered.
  - **Clarifications Tab (`ClarificationThread.tsx`)**:
    - Thread stream displaying conversation bubbles, officer vs institution sender tags, and timestamps.
    - Supporting document attachment chips with click-to-preview.
    - Response composer modal and officer resolution / cancellation dialogs.
    - Direct "Request Clarification" action integrated into Finding cards.

---

## 3. Test Coverage & Verification

| Suite | Runner | Test Count | Status |
|---|---|---|---|
| **Backend Test Suite** | `uv run pytest` | **59 tests** | **All Passed** (1.11s) |
| **Frontend Test Suite** | `npm run test` (Vitest) | **40 tests** | **All Passed** (0.47s) |
| **TypeScript Strictness** | `npm run typecheck` | N/A | **0 errors** (`tsc --noEmit`) |
| **ESLint 9** | `npm run lint` | N/A | **0 errors, 0 warnings** |
| **Production Build** | `npm run build` | N/A | **Clean build** (1.59s) |

---

## 4. Key Endpoints Added in Phase 5

| Method | Endpoint | Description | Auth Role |
|---|---|---|---|
| `GET` | `/api/stages` | List configured workflow approval stages | All Authenticated |
| `PUT` | `/api/stages/{id}` | Update stage configuration | Admin Only |
| `GET` | `/api/users/officers` | List eligible officers and active caseloads | All Authenticated |
| `GET` | `/api/applications/{id}/readiness` | Assess stage readiness & blocking conditions | Scoped Institution / Officer / Admin |
| `POST` | `/api/applications/{id}/advance` | Advance application to next stage | Role Enforced (Institution for draft, Officer/Admin) |
| `POST` | `/api/applications/{id}/return` | Return application to an earlier stage | Officer / Admin |
| `POST` | `/api/applications/{id}/assign` | Assign or reassign scrutiny officer | Officer / Admin |
| `GET` | `/api/applications/{id}/assignments` | Retrieve assignment audit history | Scoped Institution / Officer / Admin |
| `POST` | `/api/applications/{id}/decision` | Record statutory approval / rejection decision | Officer / Admin |
| `GET` | `/api/applications/{id}/decision` | Retrieve recorded statutory decision | Scoped Institution / Officer / Admin |
| `GET` | `/api/applications/{id}/clarifications` | List application clarification threads | Scoped Institution / Officer / Admin |
| `POST` | `/api/applications/{id}/clarifications` | Initiate clarification inquiry | Officer / Admin |
| `POST` | `/api/clarifications/{id}/reply` | Submit institution reply with optional document | Scoped Institution / Officer / Admin |
| `POST` | `/api/clarifications/{id}/resolve` | Confirm clarification resolution with notes | Officer / Admin |
| `POST` | `/api/clarifications/{id}/cancel` | Cancel open clarification inquiry | Officer / Admin |

---

## 5. Git Commit History

1. `174edc2`: `Initialize project repository and add design specification`
2. `552ee28`: `Set up backend foundation with FastAPI, health router, and tests`
3. `ef3d579`: `Add design tokens, six themes, and automated WCAG contrast test suite`
4. `89b33a5`: `Initialize repository with foundation structure and .gitignore`
5. `ef26756`: `Configure design tokens, themes, and automated contrast verification`
6. `a9da84f`: `Initialize FastAPI application with health check and CORS`
7. `7680ee4`: `Create application shell layout, routing, and foundation verification view`
8. `b4d631e`: `Add project documentation with architecture overview and startup instructions`
9. `f3048c5`: `Add persistent demo authentication for institution users, officers, and administrators`
10. `341493c`: `Create SQLite models and seed realistic demo applications with relative deadlines`
11. `4219d11`: `Implement application listing and detail endpoints with role-based access control`
12. `22b1583`: `Build demo authentication views, session management, and applications list interface`
13. `9aef1b1`: `Build application dossier with stage tracker, summary details, and audit history`
14. `b3a47b5`: `Implement secure document uploads with validation, local storage, and preview endpoints`
15. `9a5f14c`: `Finalize Phase 2 integration, test suite, and setup documentation`
16. `bf932e1`: `Implement document verification pipeline, deterministic checks, and findings API`
17. `69c8558`: `Integrate findings review interface, document extraction drawer, and test suite`
18. `cc1d4d9`: `Update documentation and context for Phase 3 Document Verification Engine`
19. `fe66c10`: `Regulatory Compliance Rules Engine backend, seed rules, and test`
20. `bfa5353`: `Regulatory Compliance UI tab, obligation cards, and evaluation metrics in Application Dossier`
21. `525f37d`: `Add workflow, assignment, clarification, and decision data models and schemas`
22. `d07e176`: `Add workflow transitions, readiness assessment, assignments, clarification endpoints, and automated tests`
23. `143dc04`: `Build dossier workflow action center, readiness inspector, clarifications, and stage transitions`
24. `fa8249c`: `Update documentation and context for workflow automation engine`
25. `9132e80`: `Move Six Calm Ledger Semantic Themes and preferences to Settings view`
26. `6cbb188`: `Configure robust CORS origin parsing, database health probe, and query auth for files`
27. `89d014c`: `Centralize API URL resolution and update document asset links`

---

## 6. Vercel & Render Integration Architecture

- **Backend CORS Handling (`backend/app/config.py`)**:
  - `parse_cors_origins()` strips whitespace and trailing slashes from `CORS_ORIGINS`.
  - Filters out wildcard `*` to ensure compatibility with credentialed authentication (`allow_credentials=True`).
  - Preserves local origins (`http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:3000`) alongside production origins.
- **Backend Health Check (`backend/app/routers/health.py`)**:
  - Live probe executing `SELECT 1` against the database.
  - Distinguishes healthy status (`"database": "connected"`, HTTP 200) from degraded status (`"database": "disconnected"`, HTTP 503).
  - Shields sensitive connection strings, file paths, and stack traces.
- **Frontend URL Resolution (`frontend/src/lib/api.ts`)**:
  - Centralized `getBaseApiUrl()`, `getApiUrl()`, and `getAuthenticatedDocumentUrl()`.
  - Eliminates duplicate slashes and missing slashes regardless of trailing slashes in `VITE_API_URL`.
  - Emits console warnings in production builds if `VITE_API_URL` is omitted.
  - Generates signed token query URLs for direct document download, image tags, and PDF iframe previews.
- **Cross-Origin Authentication**:
  - Bearer token stored in `localStorage` under `prism.auth_token`.
  - Injected into all `fetch` requests as `Authorization: Bearer <token>`.

---

## 7. How to Run Locally

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
- In local development, leaving `VITE_API_URL` empty automatically proxies `/api` requests to `http://127.0.0.1:8000` via Vite.
