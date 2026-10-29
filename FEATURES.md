# CREDEN — Feature Guide & How to Use

CREDEN is an academic data governance and credential verification platform built for the **All India Council for Technical Education (AICTE)**. This guide outlines the platform's core features, where to find them, and how to use them.

---

## Quick Navigation & Roles

CREDEN includes a **Quick Role Switcher** in the top navigation bar and a dedicated **Sign In / Sign Out** authentication flow:
- **AICTE Admin:** Full national governance, validation center, intake compliance, and system audit logs.
- **Institution Admin:** Institution-level student record uploads, programme quotas, and local discrepancy resolution.
- **Authorized Verifier:** Opaque credential verification for employers and external universities.
- **Student:** Personal academic identity portal, enrolled programmes, and verification QR references.

---

## Core Features & Usage Instructions

### 1. Terminal Authentication: Login & Secure Logout
* **Routes:** `/login` & `/logout`
* **What it does:** Enterprise authentication portal providing role-specific authenticated access, 1-click demonstration personas, and cryptographic session termination.
* **How to use:**
  - Navigate to `/login` or click **Sign In** in the top navigation bar.
  - Use one of the 4 **1-Click Demonstration Personas**:
    - **AICTE Central Admin** (`admin@aicte.gov.in`) $\rightarrow$ opens National Governance Dashboard (`/dashboard`)
    - **Institution Registrar** (`registrar@coep.ac.in`) $\rightarrow$ opens COEP student records (`/students?institution=COEP`)
    - **Authorized Verifier** (`verifications@tcs.com`) $\rightarrow$ opens Employer Verification Desk (`/verification`)
    - **Student** (`aarav.sharma@students.aicte.gov.in`) $\rightarrow$ opens Academic Identity Pass (`/student`)
  - Alternatively, enter any custom email and password to log in with simulated 2FA checks.
  - **Signing Out:** Click the user profile dropdown or the Sign Out icon in the top navigation bar, or select **Sign Out** at the bottom of the sidebar. You will be taken to `/logout`, which confirms cryptographic session invalidation, displays a session revocation receipt, and provides a 10-second redirect back to the home page.

---

### 2. Interactive 3D Landing Page
* **Route:** `/`
* **What it does:** An academic identity showcase featuring an interactive Three.js 3D network with pulsating nodes and connection arcs.
* **How to use:**
  - Rotate the 3D identity sphere with mouse/touch drag.
  - Click **Explore Dashboard** to open the governance cockpit.
  - Click **Discover How It Works** to view the architectural workflow.
  - Use the top navigation or role switcher to jump directly into any module.

---

### 3. AICTE National Governance Dashboard
* **Route:** `/dashboard`
* **What it does:** Real-time national overview of all technical institutions, aggregate student enrolments, flagged discrepancies, and intake compliance metrics.
* **How to use:**
  - View top-level summary cards (Active Institutions, Total Enrolment, Flagged Records, Intake Compliance Rate).
  - Inspect the **State-wise Institution Distribution** and **Intake Utilization Trends** charts.
  - Check **Recent Critical Alerts** at the bottom of the page and click any alert to jump directly to the relevant record or institution.

---

### 4. Institution Management
* **Route:** `/institutions` (Details: `/institutions/:id`, e.g., `/institutions/INST-001`)
* **What it does:** Directory of all AICTE-approved colleges and universities with approved seat caps, reported admissions, and compliance health.
* **How to use:**
  - **Search & Filter:** Search by institution name or code (e.g., `COEP`, `Delhi Technological University`), filter by state, or filter by compliance status (*Compliant*, *Review Required*, *Intake Exceeded*).
  - **Inspect Details:** Click **View Details** or the eye icon on any row to open the full institution profile.
  - **Programme Quotas:** Inside the detail view, review programme-level seat breakdowns (e.g., B.Tech Computer Engineering), approved vs. reported intake, and past submission history.

---

### 5. Student Records & CSV Batch Upload
* **Route:** `/students` (Details: `/students/:id`)
* **What it does:** Searchable repository of student academic records with privacy-preserving masked APAAR identifiers (`•••• •••• 4892`) and an automated CSV ingestion engine.
* **How to use:**
  - **Search & Filter:** Filter by institution, academic year, admission category (General, EWS, TFW, PMSSS), or validation status.
  - **Record Drawer:** Click on any student row to slide out the detailed profile showing masked identifiers, enrolment dates, and verification history.
  - **Batch CSV Upload:**
    1. Click the **Upload CSV** button in the header.
    2. Drag and drop a student records CSV file (or use sample CSV data from the repository).
    3. The engine instantly checks format validity, duplicate records, and APAAR checksums, outputting an instant summary report.

---

### 6. Explainable Validation Center
* **Route:** `/validation` (Details: `/validation/:id`)
* **What it does:** Automated diagnostic engine that identifies and explains student record inconsistencies without opaque black-box errors.
* **Rules & Checks:**
  - **APAAR Identifier Validation:** Verifies 12-digit format, detects invalid checksums, and flags conflicting IDs across multiple institutions.
  - **Duplicate Enrolment Detection:** Identifies concurrent full-time admissions across different institutions or programmes.
  - **Intake Violations:** Flags enrolments that exceed approved sanctioned intake caps.
* **How to use:**
  - Filter findings by category (APAAR, Duplicates, Intake, Data Quality) or severity (Critical, Warning, Info).
  - Click any issue to view its **Root-Cause Analysis**, deterministic rule triggered, and recommended remediation action.

---

### 7. Statutory Intake Monitoring
* **Route:** `/intake`
* **What it does:** Monitors institution and programme capacity against approved seat quotas.
* **Intelligent Supernumerary Handling:**
  - Crucially, it accounts for statutory supernumerary quotas (**EWS 10%**, **TFW 5%**, **PMSSS**), ensuring that lawful admissions above base capacity are **not** falsely flagged as violations.
* **How to use:**
  - Use the filters to inspect a specific State, Academic Year, or Programme.
  - Check the **Utilization %** progress bar for each programme.
  - Hover over or click on any warning flag to see the exact breakdown of regular vs. supernumerary seats.

---

### 8. Academic Verification Portal
* **Route:** `/verification` (Direct link: `/verify/:reference`)
* **What it does:** Sub-second credential verification for authorized employers and higher education institutions using opaque cryptographic reference codes and secure QR tokens.
* **Privacy by Design:**
  - Raw 12-digit APAAR numbers are **never** revealed to verifiers or embedded inside public QR codes.
  - Only authorized, role-permitted academic fields are disclosed.
* **How to use:**
  1. Navigate to `/verification`.
  2. Enter an opaque verification reference (e.g., `VRF-2024-00101` or `VRF-2024-00102`) or click the **Camera** button to scan a credential QR code.
  3. Click **Verify Credential**.
  4. View the validated record, issuing institution, programme, degree completion status, and SHA-256 integrity signature.
  5. Click **Download Verification Receipt** to save or print an official audit receipt.

---

### 9. Student Academic Identity Portal
* **Route:** `/student`
* **What it does:** A dedicated view for students to review their academic records, check verification references, and confirm compliance status.
* **How to use:**
  - Switch to the **Student** role in the top navigation bar or navigate to `/student`.
  - View registered academic details, enrolled programme, and current academic year.
  - Check the status of the student's APAAR link.
  - Access their personal **Verification QR Code** and shareable reference ID for job applications and academic transfers.

---

### 10. Analytics, Forecast & Reports
* **Routes:** `/analytics` & `/reports`
* **What it does:** Governance analytics, future enrolment forecasting (CAGR models), regional discrepancy breakdowns, and exportable AICTE compliance reports.
* **How to use:**
  - Switch between **Capacity Utilization**, **Discrepancy Trends**, and **Forecast Models**.
  - On `/reports`, generate and download compliance summaries for specific states or academic years in CSV or PDF format.

---

## Demo Reference Codes & Scenarios

Use these pre-loaded references to test the platform instantly:

| Reference ID | Student / Institution | Test Scenario | Expected Result |
|---|---|---|---|
| `VRF-2024-00101` | COEP Pune — B.Tech Comp. Engg | Validated Degree Credential | ✅ Valid & Verified with Full Receipt |
| `VRF-2024-00102` | Delhi Tech. Univ. — B.Tech Mech. | Validated Enrolment Credential | ✅ Valid & Active Enrolment |
| `VRF-2024-00103` | Jadavpur Univ. — B.Tech IT | Duplicate Enrolment Flag | ⚠️ Flagged for Multi-Institute Review |
| `VRF-2024-99999` | Non-existent Reference | Invalid or Revoked Reference | ❌ Verification Failed / Not Found |

---

## Running the Project Locally

```bash
# 1. Start the FastAPI backend
cd backend
python -m venv .venv
source .venv/bin/activate    # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 2. In another terminal, start the React frontend
cd frontend
npm install
npm run dev
# Frontend runs at http://localhost:5173
```
