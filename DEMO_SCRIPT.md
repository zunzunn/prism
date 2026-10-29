# CREDEN — Live Hackathon Demonstration Script

This document details the exact **9-Step Sequence** for presenting CREDEN (AICTE Student Data Management and Academic Verification Platform) to judges and evaluators.

---

## Pre-Flight Checklist (Run Before Presenting)

1. **Start Backend (FastAPI):**
   ```bash
   cd backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   *Verify:* `curl http://localhost:8000/api/health` returns `{"status":"healthy"}`.

2. **Initialize Database (Deterministic Seed):**
   ```bash
   cd backend
   python3 -m app.db.seed --reset
   ```
   *Verify:* Logs show `Seeded 12 institutions`, `Seeded 5 core students`, `Seeded 5 verification scenarios`.

3. **Start Frontend (Vite):**
   ```bash
   cd frontend
   npm run dev
   ```
   *Open:* `http://localhost:5173`

---

## 9-Step Demonstration Sequence

### Step 1: Public Landing Page & 3D Identity Network
- **URL:** `http://localhost:5173/`
- **Active Persona:** AICTE Admin
- **Action:**
  1. Open the home page.
  2. Point out the hero copy: *"Every Student. One Trusted Academic Identity."*
  3. Show the interactive geodesic 3D particle identity network representing technical institutions linked to AICTE.
  4. Note the 3 foundational pillars: **APAAR Format Validation**, **Explainable Duplicate Detection**, and **Approved Intake Monitoring**.
  5. Click **"Explore Dashboard"** or **"Launch Interactive Demo"**.
- **Expected Result:** Smooth transition into `/dashboard`.

---

### Step 2: AICTE National Academic Governance Dashboard
- **URL:** `http://localhost:5173/dashboard`
- **Active Persona:** AICTE Admin
- **Action:**
  1. Inspect National Metrics: Total Institutions (**3,824**), Total Records (**1,428,500**), APAAR Validation Pass Rate (**98.4%**).
  2. Highlight the **Intake Utilization** KPI:
     - Enrolled: **1,522,000**
     - Approved Capacity: **1,600,000**
     - Utilization Rate: **95.1%** *(1,522,000 / 1,600,000 × 100 = 95.125%)*
  3. Use the State Filter dropdown to switch from *"All States / UTs"* to *"Maharashtra"* or *"Karnataka"*.
  4. Point out the **Recent Submissions** and **Discrepancy Alerts** feed.
- **Expected Result:** Metrics update cleanly and consistently without contradictory percentages or layout overflow.

---

### Step 3: Institution Administrator Persona & CSV Batch Upload
- **URL:** `http://localhost:5173/students?institution=COEP`
- **Action:**
  1. In the Top Bar, open the **Role Switcher** and select **"Institution Admin"**.
  2. Notice the prominent institutional scope banner:
     *"🏛️ Institution Node: College of Engineering, Pune (COEP) [1-332901124]"*.
  3. Notice the student registry is pre-scoped to COEP campus records.
  4. Click **"Import Student CSV"**.
  5. Click **"Download Official AICTE Template"** to demonstrate CSV template generation.
  6. Upload a test CSV or drag the sample file into the dropzone.
  7. Click **"Submit Batch for Validation"**.
- **Expected Result:**
  - FastAPI server-side ingestion engine validates the batch.
  - Diagnostic breakdown displays: Valid Records, Warnings, and Rejected Rows (with exact row-level explanations).
  - Valid students automatically prepend to the student registry table in real-time.

---

### Step 4: Validation Center & Explainable Discrepancy Triaging
- **URL:** `http://localhost:5173/validation`
- **Active Persona:** AICTE Admin (switch back via top bar or banner)
- **Action:**
  1. Point out the categorized discrepancy queue:
     - APAAR Identifier Format Violations
     - Multi-Signal Duplicate Conflicts (Intra-college roll number collisions and cross-college concurrent enrollments)
     - Intake Capacity Breaches
  2. Open an explainable finding (e.g. *Cross-Institutional Concurrent Enrollment*).
  3. Show the audit evidence: matching timestamps, institution IDs, and candidate metadata.
  4. Explain to judges: *"CREDEN never treats a duplicate match as automated proof of fraud. It initiates evidence triaging."*
  5. Click **"Request Explanation"** or **"Resolve Discrepancy"** with an administrative note.
- **Expected Result:** Audit trail updates immediately with the administrator's triaging action.

---

### Step 5: Academic Intake Capacity Monitoring
- **URL:** `http://localhost:5173/intake`
- **Active Persona:** AICTE Admin
- **Action:**
  1. Inspect the monitored program intake table.
  2. Point out the transparent mathematical denominator:
     $$\text{Denominator} = \text{Base Approved Intake} + \text{Permitted Supernumerary Quotas (EWS 10\% + TFW 5\% + PMSSS)}$$
  3. Demonstrate why admissions exceeding regular approved intake are **NOT** falsely flagged as violations if within approved supernumerary capacity.
  4. Point out programs where policy parameters are unconfigured: they safely default to **"Requires Review"** rather than fabricating false violations.
- **Expected Result:** Filter by State, Program, and Compliance Status displays mathematically rigorous utilization.

---

### Step 6: Institutional Governance & Audit Inspection
- **URL:** `http://localhost:5173/institutions`
- **Active Persona:** AICTE Admin
- **Action:**
  1. Inspect the 12 technical institutions across 7 Indian states (COEP, VJTI, DTU, NSUT, PSG Tech, TCE, NIE Mysuru, RVCE, BMSCE, IET Lucknow, LDCE, Jadavpur University).
  2. Click on **College of Engineering, Pune (COEP)** [1-332901124] to inspect the detailed view.
  3. View program-level sanctioned vs enrolled seats, submission history, and accreditation tier.
- **Expected Result:** Institutional details load instantly with full program allocations.

---

### Step 7: Authorized Academic Verification Portal & Opaque References
- **URL:** `http://localhost:5173/verification`
- **Active Persona:** Authorized Verifier (Screening Partner / Employer)
- **Action:**
  1. Switch role to **"Authorized Verifier"**.
  2. Explain privacy rule to judges: *"Student records are NEVER publicly searchable by raw APAAR IDs. Verifiers must provide an opaque cryptographic reference."*
  3. Test the 5 synthetic demonstration scenarios using the quick-test buttons:
     - **`VRF-2026-V8892`**: Authentic Degree Conferred (COEP Pune, B.Tech CS, First Class Distinction).
     - **`VRF-2026-R4109`**: Awaiting Institutional Review (DTU, dual-counseling certificate pending).
     - **`VRF-2026-D9901`**: Corrected & Cleared Duplicate Conflict (State DTE cancellation certificate).
     - **`VRF-2026-X0012`**: Invalid / Revoked (Unapproved program exceeding statutory quota).
     - **`VRF-2025-EXP99`**: Expired Reference (Lapsed verification window).
  4. Toggle the **Verifier Authorization Tier** (Employer vs University vs Public Inquiry) to demonstrate **Role-Based Attribute Disclosure** (public inquiries shield CGPA and migration clearances).
  5. Click **"Download Official Receipt"** to view and export the digitally sealed verification certificate.
- **Expected Result:** Verification queries return in <100ms with strict attribute shielding.

---

### Step 8: Student Academic Identity Self-Service Portal
- **URL:** `http://localhost:5173/student`
- **Active Persona:** Student
- **Action:**
  1. Switch role to **"Student"** (Aarav Sharma, STU-001).
  2. Show that student's APAAR ID is safely masked: `98••-••••-9011`.
  3. Inspect the Academic Lifecycle Stages: *Institution-submitted → Format-validated → Externally verified*.
  4. Click **"Generate QR Credential Pass"** to produce a secure QR credential.
  5. Point out to judges: *"The QR code embeds ONLY the controlled verification URL (`/verify/VRF-2026-V8892`), NOT the raw APAAR ID or unencrypted student record."*
  6. Click **"Download PNG Pass"** or **"Copy Verification Link"**.
  7. Show the **Transparency Audit Ledger** displaying every employer that queried their credentials.
- **Expected Result:** Complete student self-sovereign identity experience.

---

### Step 9: Statutory Compliance Reports & Immutable Audit Ledger
- **URL:** `http://localhost:5173/reports` and `http://localhost:5173/compliance`
- **Active Persona:** AICTE Admin
- **Action:**
  1. Open `/reports`: Select **"Intake Capacity Compliance Audit"** or **"Discrepancy Reconciliation Summary"**.
  2. Click **"Export Formal CSV Report"**: Open the downloaded file to show RFC-4180 compliance with official AICTE statutory comment headers.
  3. Navigate to **Audit Logs** (`/compliance`):
     - Review the tamper-evident security ledger.
     - Note the zero-PII security standard: only opaque references, hashed client IPs (`d41d8cd98f00•••`), and timestamps are preserved.
     - Click **"Export Audit Ledger"** for regulatory archiving.
- **Expected Result:** Professional compliance artifact ready for regulatory review.

---

## Failover & Recovery Plan (If Services Drop)

| Issue | Immediate Fix | Fallback Mechanism |
|---|---|---|
| Backend FastAPI server is offline | Run `uvicorn app.main:app --port 8000` in `backend/` | Frontend automatically activates the **Local Deterministic Fallback Engine**; all verification queries and CSV uploads continue functioning in demo mode with visible fallback tags. |
| Port 8000 is occupied | Kill existing process: `lsof -ti:8000 \| xargs kill -9` | Or set `VITE_API_BASE_URL=http://localhost:8001` in `frontend/.env`. |
| Port 5173 is occupied | Vite will automatically offer port 5174 | Visit `http://localhost:5174`. |
| Browser camera blocked for QR scan | Click fallback simulated scan buttons | `QrScannerModal` contains simulated demo capture buttons (`Simulate Scan Pass`). |
| Database corrupted or out of sync | Run `python3 -m app.db.seed --reset` | Recreates SQLite database with all 12 institutions and 5 verification scenarios in <1 second. |

---

## Presenter Closing Summary

> *"CREDEN solves the triple dilemma of Indian academic governance: protecting student privacy through masked APAAR identifiers, providing mathematical rigor to institutional intake quotas without false positives, and delivering sub-second cryptographic degree verification for authorized global employers."*
