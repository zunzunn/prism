# PRISM — Frontend Design Specification (`design.md`)

**PRISM: Proactive Regulatory Intelligence & Status Monitoring**
Direction: **Calm Ledger** · Accent: indigo/violet · Six themes · Desktop only · 5-day hackathon build

> **Read this first (important framing).**
> PRISM is a **concept/prototype**. Everything shown in the demo — institutions, people, application IDs, stage names, deadlines, requirements, metrics, findings — is **sample data**. Stage names and compliance requirements are **configurable placeholders** and must be verified against official AICTE sources before any real use. Do not present any of it as an official AICTE rule, status, or decision. AI/rules may *flag possible issues*; they never prove authenticity and never make regulatory decisions. Humans decide.

---

## 1. Product overview and design goals

### 1.1 What PRISM does
Helps institutions and authorised officials manage regulatory approval applications:

- Track applications through configurable approval stages.
- Review documents; see missing fields, inconsistencies, expiry dates, and evidence-backed findings.
- Monitor compliance requirements, deadlines, and overdue tasks.
- Manage clarification requests and responses.
- Receive prioritised alerts.
- Inspect application history through an audit trail.
- Understand workload and bottlenecks (simple analytics).

### 1.2 Design goals

| # | Goal | What it means concretely |
|---|---|---|
| G1 | **Calm and trustworthy** | Neutral surfaces, one accent, restrained status colours, generous but efficient spacing. |
| G2 | **Next action is always obvious** | Every attention item states *why* it is flagged, *what evidence* supports it, and *the next action* (one primary button). |
| G3 | **Evidence over scores** | No unexplained numbers. Findings show source document, page, and extracted snippet. |
| G4 | **Honest about AI and data** | Findings are "possible issues" with human-review states. Sample data and metric definitions are always labelled. |
| G5 | **Polished, never distracting** | Smooth, short, purposeful motion everywhere it helps; nothing looping or decorative. |
| G6 | **Accessible by default** | WCAG 2.2 AA minimum; AAA in contrast themes; never colour alone; full keyboard support. |
| G7 | **Themeable** | Six minimal themes through semantic CSS variables only. |

### 1.3 Non-goals (for this build)
Mobile/tablet layouts, 3D visualisation, what-if simulator, real authentication/authorisation, real OCR/ML document analysis, email/SMS delivery, multi-language UI.

---

## 2. Users, key journeys, and information architecture

### 2.1 Demo roles

| Role | In demo? | Purpose |
|---|---|---|
| **Institution user** | Full | Submits applications, uploads documents, responds to clarifications. Sees only their institution's applications. |
| **Officer** | Full | Reviews applications, confirms/dismisses findings, requests clarifications, advances stages, assigns. |
| **Admin** | Full (light) | Sees everything, analytics, activity history, settings; can reassign. |
| Committee reviewer | Label only | Shown as a disabled card on sign-in: "Exists in the full concept; not enabled in this demo." |
| Auditor | Label only | Same as above. |

Demo auth: one-click role cards. **No passwords or credentials are embedded or displayed.** The backend issues a simple session token for the chosen demo user.

### 2.2 Primary demo journey (must work end to end)

| Step | Actor | What happens | Screen |
|---|---|---|---|
| 1 | Institution user | Opens a draft application, fills fields, **uploads documents (real local upload)**, submits. | Dossier (Summary, Documents) |
| 2 | System | Runs checks; creates findings (missing field, inconsistent dates, expiring document) and audit events. Brief "Analysing…" state. | Dossier (Findings) |
| 3 | Officer | Sees the application at the top of **Needs attention** with reason chips. | Overview |
| 4 | Officer | Opens dossier, inspects evidence for a finding, marks **Confirmed**. | Dossier (Findings) |
| 5 | Officer | Clicks **Request clarification** (linked to the finding), sets a due date. | Dossier (Clarifications) |
| 6 | Institution user | Receives an alert, opens the clarification, replies with text and an optional file. | Alerts, Dossier |
| 7 | Officer | Sees the reply, resolves the clarification, advances the stage. | Dossier |
| 8 | Anyone (role-aware) | Every action above appears in the audit trail with actor, time, and detail. | History |

### 2.3 Information architecture

```
Sign-in
App shell
├── Overview                      (all roles; content adapts)
├── Applications
│   └── Application dossier       Summary · Documents · Findings · Clarifications · History
├── Compliance requirements       (should-have; simple configurable checklist view)
├── Deadlines & alerts
├── Analytics                     (Officer, Admin)
├── Activity history              (Officer, Admin)
└── Settings                      (all: theme, motion, role info)
```

### 2.4 Navigation visibility

| Item | Institution user | Officer | Admin |
|---|---|---|---|
| Overview | ✅ (own applications) | ✅ | ✅ |
| Applications | ✅ own only | ✅ assigned + all | ✅ all |
| Compliance requirements | ✅ read-only | ✅ | ✅ (edit placeholder config: later) |
| Deadlines & alerts | ✅ own | ✅ | ✅ |
| Analytics | — | ✅ | ✅ |
| Activity history | — (history tab in own dossier only) | ✅ | ✅ |
| Settings | ✅ | ✅ | ✅ |

---

## 3. Visual direction and rationale

**Calm Ledger**: clean, editorial, ledger-like. Neutral surfaces, hairline borders, a single indigo/violet accent, tabular numbers, and quiet motion. Chosen over "Aurora Glass" (hard to keep accessible, heavy blur) and "Precision Console" (cold, weak in light themes) because it:

- reads as credible to regulators and judges,
- keeps tables, badges, and evidence legible in every theme,
- puts polish in spacing, typography, and motion rather than effects.

**Signature "prism" touch** (the only decorative element):

```css
--prism: linear-gradient(90deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%);
```

Use it in exactly **three** places:
1. The logo mark (Δ) background/edge.
2. The **active stage** segment in the stage tracker.
3. A 2 px top edge on the sign-in card.

In **Contrast Light/Dark**, replace `--prism` with the solid `--accent` (no gradients).

---

## 4. Design tokens

### 4.1 Theming mechanism
- Set `data-theme` on `<html>`: `daylight | dusk | void | paper | contrast-light | contrast-dark`.
- All components use **semantic tokens only** (never raw hex in components).
- Define tokens as CSS variables; map Tailwind colours to them (e.g. `bg-surface`, `text-muted`, `border-border`).
- Persist the choice in `localStorage` (`prism.theme`). First load: follow `prefers-color-scheme` (Daylight or Dusk).
- Theme switch: crossfade `background-color`, `color`, `border-color` over 200 ms (skipped under reduced motion).

### 4.2 Semantic token list

`--bg`, `--surface`, `--surface-2`, `--border`, `--border-strong`, `--text`, `--text-muted`, `--accent`, `--accent-fg`, `--accent-soft` (tinted accent background), `--success`, `--warning`, `--danger`, `--info`, `--focus-ring`, `--overlay`, `--shadow-sm`, `--shadow-md`, `--prism`.

Status tint backgrounds are derived, not hand-picked:

```css
--success-soft: color-mix(in srgb, var(--success) 12%, var(--surface));
/* same for warning, danger, info */
```

### 4.3 Theme values

> Values are **starting points**. The developer must verify each foreground/background pair meets the target ratio (see 4.4) and adjust the hex if not.

| Token | Daylight | Dusk | Void |
|---|---|---|---|
| `--bg` | `#FAFAFB` | `#0E0E13` | `#000000` |
| `--surface` | `#FFFFFF` | `#15151C` | `#0A0A0D` |
| `--surface-2` | `#F4F4F6` | `#1C1C25` | `#111116` |
| `--border` | `#E4E4E9` | `#2A2A36` | `#1F1F28` |
| `--border-strong` | `#C9C9D3` | `#3D3D4D` | `#33333F` |
| `--text` | `#16161D` | `#ECECF3` | `#F2F2F7` |
| `--text-muted` | `#5B5B6B` | `#9A9AAE` | `#9C9CB0` |
| `--accent` | `#4F46E5` | `#8B8CF8` | `#9A8CFF` |
| `--accent-fg` | `#FFFFFF` | `#0E0E13` | `#000000` |
| `--success` | `#15803D` | `#4ADE80` | `#4ADE80` |
| `--warning` | `#B45309` | `#FBBF24` | `#FBBF24` |
| `--danger` | `#B91C1C` | `#F87171` | `#F87171` |
| `--info` | `#1D4ED8` | `#60A5FA` | `#60A5FA` |
| `--focus-ring` | `#4F46E5` | `#A5A6FA` | `#B4A8FF` |

| Token | Paper | Contrast Light | Contrast Dark |
|---|---|---|---|
| `--bg` | `#F7F3EC` | `#FFFFFF` | `#000000` |
| `--surface` | `#FFFDF8` | `#FFFFFF` | `#0D0D0D` |
| `--surface-2` | `#EFE9DE` | `#F0F0F0` | `#1A1A1A` |
| `--border` | `#DDD5C5` | `#4D4D4D` | `#9E9E9E` |
| `--border-strong` | `#BFB5A0` | `#000000` | `#FFFFFF` |
| `--text` | `#1C1A17` | `#000000` | `#FFFFFF` |
| `--text-muted` | `#5E574B` | `#3D3D3D` | `#D0D0D0` |
| `--accent` | `#0F766E` | `#0033CC` | `#FFD60A` |
| `--accent-fg` | `#FFFFFF` | `#FFFFFF` | `#000000` |
| `--success` | `#166534` | `#0B5D1E` | `#5CFF8A` |
| `--warning` | `#92400E` | `#7A3E00` | `#FFB020` |
| `--danger` | `#991B1B` | `#A00000` | `#FF7A7A` |
| `--info` | `#1E40AF` | `#0033CC` | `#6FD3FF` |
| `--focus-ring` | `#0F766E` | `#000000` | `#FFD60A` |

Theme descriptions: **Daylight** (default light), **Dusk** (default dark), **Void** (true black, minimal borders), **Paper** (warm off-white, ink text, teal accent), **Contrast Light** and **Contrast Dark** (AAA contrast, strong borders, no gradients, 3 px focus rings).

### 4.4 Accessible pairings (targets)

| Pair | Minimum ratio |
|---|---|
| `--text` on `--bg` / `--surface` / `--surface-2` | 4.5:1 (AAA themes 7:1) |
| `--text-muted` on `--surface` | 4.5:1 (AAA themes 7:1) |
| `--accent-fg` on `--accent` | 4.5:1 |
| `--accent` text/icon on `--surface` | 4.5:1 for text, 3:1 for icons/UI |
| Status colour text on its `-soft` background | 4.5:1 |
| `--border` for input outlines | 3:1 against adjacent surface where the border is the only boundary |
| `--focus-ring` against any adjacent surface | 3:1 |

Add an automated contrast check script (or test) that iterates all themes and fails the build below targets. Verify before finalising.

### 4.5 Typography

| Use | Font | Fallback |
|---|---|---|
| UI text | **Inter** (variable) | `system-ui, sans-serif` |
| IDs, dates, reference numbers, code | **JetBrains Mono** | `ui-monospace, monospace` |

Self-host fonts (no external CDN dependency for a local demo).

| Token | Size / line height | Weight | Use |
|---|---|---|---|
| `text-xs` | 12 / 16 | 500 | Badges, helper text, table meta |
| `text-sm` | 13 / 18 | 400/500 | Table cells, secondary text |
| `text-base` | 14 / 20 | 400 | Body default |
| `text-md` | 16 / 24 | 500 | Card titles, inputs |
| `text-lg` | 20 / 28 | 600 | Section headings |
| `text-xl` | 24 / 32 | 600 | Page titles |
| `text-2xl` | 32 / 40 | 600 | Large metric numbers |

Rules: use `font-variant-numeric: tabular-nums` for all numbers, dates, and metrics. Sentence case everywhere. No all-caps except `text-xs` group labels in the sidebar (letter-spacing 0.04em).

### 4.6 Spacing, layout, shape, elevation, icons

| Aspect | Spec |
|---|---|
| Spacing scale | 4 px base: 4, 8, 12, 16, 24, 32, 48, 64 |
| Page padding | 24 px; card padding 16–20 px; table cell padding 10 px × 12 px |
| Content width | Fluid, max 1360 px, centred |
| Grid | 12 columns, 24 px gutter, used on Overview and Analytics |
| Radii | 8 px (inputs, buttons, menu items), 12 px (cards, dialogs, drawer), 999 px (badges, chips) |
| Borders | 1 px `--border`; use `--border-strong` for emphasis and in contrast themes |
| Elevation | Borders first. `--shadow-sm` (card hover), `--shadow-md` (popovers, dialogs, drawers). No glows. Void and contrast themes: no shadows, use borders. |
| Icons | **Lucide**, 1.5 px stroke, 16 px inline / 20 px in nav and cards. Never icon-only without an accessible label or tooltip. |
| Focus | 2 px ring in `--focus-ring` with 2 px offset (3 px in contrast themes). Always visible on keyboard focus. |

---

## 5. App shell and navigation

### 5.1 Layout

```
┌──────────┬──────────────────────────────────────────────┐
│ Sidebar  │ Top bar (56px)                                │
│ 240px /  ├──────────────────────────────────────────────┤
│ 64px     │ Page header (title, breadcrumbs, actions)     │
│          │ Page content (scrolls)                        │
└──────────┴──────────────────────────────────────────────┘
```

### 5.2 Sidebar
- Width 240 px; collapses to 64 px (icons + tooltips). Collapse state persisted (`prism.sidebar`).
- Auto-collapse below 1440 px viewport width on first load.
- Top: logo mark (Δ with prism edge) + "PRISM" + "Regulatory intelligence".
- Groups (12 px uppercase labels): **Workspace** (Overview, Applications), **Compliance** (Requirements, Deadlines & alerts), **Insights** (Analytics), **Administration** (Activity history, Settings).
- Active item: `--accent-soft` background, `--accent` icon and text, 2 px left indicator; a shared-layout indicator animates between items (200 ms).
- Badge counts on Deadlines & alerts (unread alerts).

### 5.3 Top bar (56 px)
Left to right: sidebar toggle · breadcrumbs · **⌘K search button** (shows shortcut hint) · live clock (IST, optional) · **theme menu** (palette icon) · **notification bell** (count; opens popover with latest 5 + "View all") · **user/role menu** (name, role badge, "Switch demo user", "Sign out").

A persistent, small **"Demo environment · Sample data"** pill sits in the top bar (neutral colour, tooltip: "All data is fictional sample data").

### 5.4 Command palette (⌘K / Ctrl+K)
Dialog with search input and grouped results:
- **Go to**: any page.
- **Applications**: search by ID, institution, or title; Enter opens the dossier.
- **Actions**: "Switch theme: …", "Toggle reduced motion", "Collapse sidebar", "Sign out".
Keyboard: ↑/↓ navigate, Enter selects, Esc closes. Results update as you type (<100 ms from cached data). Empty state: "No matches. Try an application ID or a page name."

### 5.5 Page transitions
Route change: content fades in with 8 px upward translate (200 ms). Use `AnimatePresence` with `mode="wait"`; keep the shell mounted. Page header and content stagger by 40 ms.

---

## 6. Core component specifications

All components use tokens; all interactive ones have visible hover, focus-visible, active, and disabled states. Build on **shadcn/ui** primitives (Radix) and customise through tokens.

### 6.1 Buttons

| Variant | Use | Style |
|---|---|---|
| Primary | One per view region (the next action) | `--accent` bg, `--accent-fg` text |
| Secondary | Common actions | `--surface` bg, 1 px `--border-strong`, `--text` |
| Ghost | Toolbars, icon buttons | Transparent, `--surface-2` on hover |
| Danger | Destructive/dismiss with consequence | `--danger` text/outline; filled only in confirm dialogs |

Height 36 px (default), 32 px (compact), 40 px (large, sign-in only). Loading state: inline spinner replaces icon, label stays, button disabled. Hover: background shift only (no scale). Press: 1 px translate (150 ms).

### 6.2 Inputs
Height 36 px; label above (13 px, 500); helper/error text below (12 px). Error state: `--danger` border + icon + text message (never colour alone). Includes text, textarea, select, date picker, file dropzone, search. Placeholder uses `--text-muted`.

### 6.3 Status badge
Pill, 12 px text, icon + label, tinted `-soft` background, status colour text/icon.

| Meaning | Icon | Colour | Example labels |
|---|---|---|---|
| Needs attention | `alert-circle` | danger | Overdue, Action required |
| Warning | `alert-triangle` | warning | Due soon, Expiring |
| In progress | `circle-dashed` | info | Under review, Awaiting reply |
| On track / done | `circle-check` | success | On track, Resolved, Confirmed |
| Neutral | `circle` | text-muted | Draft, Not started, Dismissed |

Labels come from backend enums; map enum → (icon, colour, label) in one file (`statusMap.ts`).

### 6.4 Cards
Surface, 1 px border, 12 px radius, 16–20 px padding. Interactive cards lift 2 px with `--shadow-sm` on hover (150 ms). Metric card anatomy: label (13 px, muted) · value (32 px, tabular) · definition icon (tooltip) · sub-label (time range) · "Sample data" tag.

### 6.5 Tables (TanStack Table)
- Sticky header, 44 px rows (compact 36 px), zebra off, hairline row dividers, hover `--surface-2`.
- Sortable columns with a visible sort icon and `aria-sort`; keyboard-focusable rows that open the dossier (Enter).
- Row actions in a final column (kebab menu); the primary action is the row click.
- Pagination footer ("1–20 of 48", page size 20).
- Selected row has a left accent indicator.
- Rows enter with a 20 ms stagger (first 10 rows only), 150 ms fade/rise.

### 6.6 Tabs
Underline tabs; the active underline slides (shared layout, 200 ms). Arrow-key navigation (Radix). Tab content crossfades (150 ms). Count badges on Findings and Clarifications.

### 6.7 Dialogs and drawers
- Dialog: centred, max 560 px, 12 px radius, overlay `--overlay` (60% opacity), spring-in (scale 0.97 → 1, 200 ms), focus trap, Esc to close, returns focus to trigger.
- Drawer (right, 480 px): slides in 250 ms; used for application peek and notifications detail.
- Destructive/consequential actions (confirm finding, dismiss finding, advance stage) show a confirm dialog with a plain-language consequence line and an optional note field.

### 6.8 Tooltips and popovers
Tooltips: 500 ms delay, 12 px text, `--text` on `--surface-2` with border, also shown on keyboard focus. Essential info is never *only* in a tooltip.

### 6.9 Toasts
Bottom-right, max 3 stacked, 4 s auto-dismiss (6 s for errors; persistent if action needed), slide + fade 200 ms. Icon + text + optional action ("Undo", "View"). Container is `aria-live="polite"` (errors `assertive`).

### 6.10 Stage tracker
Horizontal stepper in the dossier header: completed (check icon, `--success`), current (**prism gradient** segment + bold label), upcoming (muted, dashed). Each step shows its name and, on hover, the date entered. Stages are loaded from backend config. Animate the progress segment fill on stage change (300 ms).

### 6.11 Finding card
Anatomy (top to bottom):
1. Severity badge + title (e.g. "Possible date inconsistency").
2. One-line plain-language explanation ("The registration date on the certificate (12 Mar 2023) is later than the date stated in the form (04 Jan 2023).").
3. **Evidence block**: document name (link), page number, extracted snippet in mono with the relevant text highlighted. For form-field rules: field name and value.
4. **Source label**: "Rule-based check" or "AI extraction (demo, mocked)".
5. **Confidence label** (High / Medium / Low), no fake percentages.
6. **Human-review state**: `Needs review` → `Confirmed` / `Dismissed`, with reviewer, time, and optional note once set.
7. Actions: **Confirm**, **Dismiss**, **Request clarification** (opens the clarification dialog pre-linked to this finding).

Footer line on the Findings tab (always visible): "Findings are possible issues flagged for human review. They do not establish authenticity or decide outcomes."

### 6.12 Empty, loading, and error states

| State | Pattern |
|---|---|
| Empty | Icon (24 px, muted) + one-line title + one-line explanation + primary action if applicable. Example: "No findings yet. Findings appear after an application is submitted." |
| Loading | **Skeletons** matching final layout (shimmer 1.2 s, replaced by a static tone under reduced motion). Spinners only for button actions. |
| Error | Inline banner with `alert-circle`, what failed, and a **Retry** button. Never a blank page. Include the request ID in small mono text where available. |
| Forbidden | "You don't have access to this page" with a button back to Overview. |
| Not found | "We couldn't find that application" with a link to the list. |

### 6.13 Charts (Recharts)
- One accent series colour, others from a fixed categorical set derived from tokens (accent, info, success, warning; never red/green alone for meaning).
- Always: title, one-line description, units, legend if >1 series, and a "Sample data" tag.
- Include a **data table toggle** ("View as table") for accessibility.
- Axes in `--text-muted`, 12 px; gridlines `--border`; tooltips like 6.8.
- Draw-in animation on first render (400 ms); none under reduced motion.
- Chart types allowed: bar, horizontal bar, line. No pie/donut, no 3D.

---

## 7. Screen specifications

### 7.1 Sign-in
**Purpose:** let a judge enter as a role in one click.

- Centred card (440 px) on `--bg`, 2 px **prism** top edge, logo mark above.
- Title: "Sign in to PRISM". Subtitle: "Regulatory approval workspace (demo)".
- **Demo role cards shown by default** (not hidden): Institution user, Officer, Admin. Each: icon, role name, one-line description, "Continue as…" on click. Two disabled muted cards (Committee reviewer, Auditor) with "Not enabled in this demo".
- Persistent banner: **"Demo environment — all data is fictional sample data. No real credentials are used."**
- No email/password fields. (Optional: an email field shown disabled/read-only with the chosen demo identity after selection. Do not render fake credentials.)
- Motion: card rises 12 px and fades in (300 ms); role cards stagger 50 ms.
- Theme picker available in the corner.

### 7.2 Overview
**Purpose:** answer "what needs me now?"

Layout (12-col grid):
1. **Page header**: "Overview", greeting line with name and role, date.
2. **Metric row** (4 cards, each with definition tooltip + time range + "Sample data"):

| Card | Definition (shown in tooltip) |
|---|---|
| Needs attention | Applications with at least one finding awaiting review, an overdue deadline, or an overdue clarification. |
| Due soon | Deadlines falling within the next 14 days (window configurable in Settings). |
| In progress | Applications not yet closed. |
| Requirements met | Met requirements ÷ applicable requirements across open applications. Computed from sample data. |

   Replace the prototype's "94.2% audit rate / Verifiable". Metrics must be computed from backend data and carry a definition.
3. **Needs attention queue** (8 cols): list of up to 8 items, sorted by (overdue first, then nearest deadline, then open-finding count). Each row: application ID (mono) + title + institution · **reason chips** (e.g. "2 findings need review", "Clarification overdue 3 days") · due date · stage · **one primary action button** ("Review findings", "Open clarification"). Row click opens the application peek drawer. "View all" goes to Applications with the attention filter applied.
4. **Upcoming deadlines** (4 cols): next 5 deadlines with date, application, type, and a status badge.
5. **Stage summary** (full width): horizontal bar showing applications per stage; each segment is clickable and filters Applications.

Role adaptation:
- Institution user: queue = "Waiting on you" (clarifications to answer, drafts to finish, documents expiring).
- Officer: queue as above, scoped to assigned applications first.
- Admin: queue across all, plus an "Unassigned" count chip.

States: skeleton for cards and rows; empty queue = "Nothing needs attention right now."

### 7.3 Applications list
- Page header with **New application** (Institution user only) and filters.
- Filter bar: search, stage (multi), status (multi), institution (Officer/Admin), owner, "Needs attention only" toggle. Active filters as removable chips; "Clear all".
- Table columns: **ID** (mono) · **Title/Institution** · **Stage** · **Status badge** · **Open findings** (count) · **Deadline** (date + relative, e.g. "in 6 days") · **Owner** · **Updated**.
- Default sort: needs-attention first, then deadline ascending.
- Row click → dossier. Kebab: Open, Assign (Officer/Admin), Copy ID.
- Empty (no match): "No applications match these filters" + "Clear filters".
- Empty (none exist, Institution user): "You haven't started an application" + **Start application**.

### 7.4 Application dossier (core screen)
**Header:** ID (mono) · title · institution · status badge · owner · deadline · **stage tracker** · primary action (role- and state-aware, e.g. "Submit application", "Review findings", "Reply to clarification", "Advance stage").

**Tabs:** Summary · Documents · Findings (count) · Clarifications (count) · History.

**Summary**
- Two columns: application details (fields in a definition list; missing required fields flagged with a warning badge and "Add" link for Institution user) and "Key dates & deadlines" (list).
- "What needs attention" card at the top, listing reasons with links to the relevant tab.

**Documents**
- Table: name · type · uploaded by/date · size · status (e.g. "Extracted fields", "Expires 30 Nov 2026" warning badge) · actions (Preview, Download).
- **Upload**: dropzone (drag-and-drop + button). Accepts PDF, PNG, JPG; max 10 MB each; validation errors inline. Per-file progress bar → "Uploaded" → "Analysing…" (skeleton, max ~2 s) → findings appear (toast: "2 possible issues found").
- **Preview**: split view or drawer: PDF/image viewer on the left, extracted fields on the right with each field showing source page. Non-previewable types: download only.
- Institution user can upload while the application is Draft or Awaiting clarification; otherwise read-only.

**Findings**
- Filter chips: All · Needs review · Confirmed · Dismissed. Group by severity (High, Medium, Low).
- List of **finding cards** (see 6.11).
- Officer actions: Confirm, Dismiss (note optional), Request clarification. Institution user sees findings read-only (title, explanation, status), without internal reviewer notes.
- Always show the disclaimer footer line.

**Clarifications**
- Thread-style list: each clarification has title, linked finding (if any), requested by, due date, status (Open, Replied, Resolved, Overdue), and messages.
- Officer: **Request clarification** dialog (title, message, linked finding, due date, required documents). After the reply: **Resolve**.
- Institution user: **Reply** with text and optional file upload. Submitting shows a toast and moves status to "Replied".

**History**
- Vertical timeline from the audit log for this application: icon · actor (name + role) · action sentence · timestamp (absolute on hover, relative inline) · optional detail chips (e.g. "Finding → Confirmed"). Filter by event type. Read-only. Entries slide in with a 30 ms stagger.

### 7.5 Compliance requirements (should-have)
- Page header with the banner: **"Requirements shown are sample placeholders. Verify against official AICTE sources before use."**
- Table: requirement name · category · applies to (stage) · due rule (e.g. "30 days after submission", sample) · applications affected · status summary (met / pending / overdue counts).
- Row click opens a drawer with the description and the list of affected applications.
- Read-only in this build.

### 7.6 Deadlines & alerts
Two panes with a segmented control (Alerts · Deadlines):

**Alerts**
- Priority-grouped list (Critical, Important, Info). Each alert: icon + title + one-line reason + application link + time + **action button** + overflow (Mark read / Snooze 1 day).
- Unread alerts have a bold title and a dot **plus** an "Unread" visually hidden label for screen readers.
- Bulk "Mark all as read". Filter by type (Finding, Clarification, Deadline, Document expiry).
- Alerts are generated by the backend from events (new finding, clarification requested/replied, deadline approaching/overdue, document expiring).

**Deadlines**
- **Timeline view** (default): next 30 days as a horizontal date axis with markers, grouped by week, hover shows details. Overdue items are pinned on the left with a danger badge.
- **List view** toggle: table sorted by date.
- Each deadline: date (mono), type, application link, owner, status badge.

### 7.7 Analytics (Officer, Admin)
Three charts with consistent chart cards (6.13), each with a definition and a "Sample data" tag:
1. **Applications by stage** (horizontal bar): count of open applications per stage.
2. **Average days in stage** (bar): mean days applications have spent in each completed stage (sample).
3. **Workload by officer** (bar): open applications and open findings assigned per officer.

Plus a small "Bottleneck" callout: the stage with the highest average days, phrased factually ("Desk review has the longest average time in stage in the sample data (X days)"), with a link to the filtered Applications view. Time range selector (Last 30 / 90 days) affects the data.

### 7.8 Activity history (Officer, Admin)
- Global audit log table: time · actor · role · action · application · detail.
- Filters: actor, event type, date range, application. Search by application ID.
- Read-only; export is later.
- Banner: "Audit events are recorded by the backend for every action in this demo."

### 7.9 Settings
- **Appearance:** theme grid (six swatch cards showing a mini preview, with name and "Light/Dark/High contrast" label); selection applies instantly.
- **Motion:** toggle "Reduce motion" (default follows OS).
- **Notifications (display-only):** "Due soon window" (7/14/30 days) used by Overview and Deadlines.
- **About this demo:** role, data note, build info, and a **"Reset demo data"** button (confirm dialog) that re-seeds the backend.

---

## 8. Interaction and state specifications

### 8.1 Application lifecycle (states)
Stages are configurable. Seed placeholder: `Draft → Submitted → Document check → Desk review → Clarification → Committee review → Decision pending → Closed`. Rules enforced by the backend: only Institution user can submit; only Officer/Admin can advance stages; advancing requires no finding in "Needs review" at that stage (soft rule: warn and require a note to override).

### 8.2 Finding review states

```
Needs review ──Confirm──▶ Confirmed
      │
      └──Dismiss──▶ Dismissed
(Confirmed/Dismissed can be reopened by Officer/Admin with a note)
```
Each transition: confirm dialog → optimistic UI update → toast with **Undo** (5 s) → audit event written.

### 8.3 Optimistic updates and errors
Mutations update the UI immediately and roll back with an error toast if the request fails. All mutations write exactly one audit event server-side.

### 8.4 Keyboard shortcuts

| Shortcut | Action |
|---|---|
| ⌘/Ctrl + K | Open command palette |
| `g` then `o` / `a` / `d` | Go to Overview / Applications / Deadlines (disabled in inputs) |
| `[` | Toggle sidebar |
| Esc | Close dialog, drawer, popover, palette |

### 8.5 Upload flow
1. Select/drop file → client validates type and size.
2. Upload with progress; show filename, size, and cancel.
3. On success: "Uploaded", then "Analysing…" skeleton (~1–2 s).
4. Findings appear and the Findings tab count animates; toast summarises.
5. On failure: inline error with retry; no data loss for other files.

### 8.6 Focus management
After dialog/drawer close, focus returns to the trigger. After route change, move focus to the page `<h1>` (visually keep position). Provide a "Skip to content" link as the first focusable element.

---

## 9. Motion specification

### 9.1 Principle
**Polished but never distracting.** Smooth transitions on every page; short, purposeful, one-shot. Nothing loops except skeleton shimmer.

### 9.2 Tokens

| Token | Value | Use |
|---|---|---|
| `--dur-fast` | 120 ms | Hover, press, toggles |
| `--dur-base` | 200 ms | Tabs, page content, theme crossfade, toasts |
| `--dur-slow` | 300 ms | Drawers, dialogs, stage progress fill |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Default |
| Spring (dialogs/drawers) | stiffness 380, damping 32 | Motion `type: "spring"` |
| Stagger | 20–50 ms per item, first 10 items only | Lists, tables, cards |

### 9.3 Catalogue

| Element | Animation |
|---|---|
| Route change | Fade + 8 px rise, 200 ms |
| Lists/tables | Staggered fade + 6 px rise |
| Cards (interactive) | 2 px lift + shadow on hover |
| Sidebar active indicator | Shared layout slide, 200 ms |
| Tabs | Underline slide + content crossfade |
| Dialog / drawer | Scale 0.97→1 / slide from right, spring |
| Metric numbers | Count-up, 600 ms, once on mount |
| Charts | Draw-in, 400 ms, once |
| Toasts | Slide + fade, 200 ms |
| Stage tracker | Progress fill, 300 ms |
| Finding status change | Badge crossfade + card background flash (accent-soft → surface, 400 ms) |
| Theme switch | Colour crossfade, 200 ms |

### 9.4 Reduced motion
- Wrap the app with `<MotionConfig reducedMotion="user">` **and** an in-app setting (Settings → Reduce motion, persisted `prism.reduceMotion`) that overrides to "always".
- When reduced: no translate/scale/stagger, no count-up (show final value), no chart draw-in, skeleton shimmer becomes a static tone; keep only instant or ≤100 ms opacity changes.
- Animate only `opacity` and `transform` (and colours for theme switch); never animate layout properties like `width/height/top` except via Motion layout animations where needed.

---

## 10. Responsive and accessibility requirements

### 10.1 Responsive (desktop only)
- Supported viewport: **1280 px and wider**; design target 1440 px; test at 1280, 1440, 1920, 2560.
- Sidebar auto-collapses below 1440 px; metrics grid stays 4 columns ≥1280.
- Below 1280 px: show a non-blocking notice banner "PRISM is designed for desktop screens (1280 px or wider)" and allow horizontal scroll on tables. No mobile layouts required.
- Tables scroll horizontally inside their container (never the page body) when columns don't fit.

### 10.2 Accessibility (WCAG 2.2 AA; AAA in contrast themes)
- **Colour is never the only signal**: every status has an icon and text; links are underlined or have clear affordance; required fields marked with text.
- Contrast targets in 4.4, verified per theme.
- Full keyboard operability; logical tab order; visible focus (2–3 px ring); no keyboard traps except intentional focus traps in dialogs.
- Semantic landmarks: `header`, `nav`, `main`, `aside`; one `<h1>` per page; headings in order.
- Tables use real `<table>` semantics with `<th scope>`; sortable headers expose `aria-sort`.
- Dialogs/drawers use Radix (`role="dialog"`, labelled, focus trap, Esc).
- Toasts and async status use `aria-live`; the "Analysing…" state announces completion.
- Charts: text alternative (summary sentence) and a "View as table" toggle.
- Icon-only buttons have `aria-label`; tooltips also appear on focus.
- Target size ≥ 24×24 px (aim for 32+ px).
- Form errors are linked with `aria-describedby` and summarised near the submit action.
- Respect `prefers-reduced-motion` and `prefers-contrast` (default to a contrast theme suggestion in Settings if `prefers-contrast: more` is detected, as a non-forced prompt).

---

## 11. Data-display rules

### 11.1 Labelling mock data and metrics
- A persistent **"Demo environment · Sample data"** pill in the top bar.
- A "Sample data" tag on every metric card, chart, and analytics callout.
- Every metric has: **definition** (tooltip and Settings → About), **time range**, and **source** (computed from backend records).
- No metric may be hard-coded. Compute from the database (seeded data counts as sample data).
- Never show unexplained scores. If a "risk" concept is needed, use severity labels with explanations on findings instead.

### 11.2 Sample-data conventions
- Institution names clearly fictional: "Sample Institute of Technology A", "Demo College of Engineering B".
- People: fictional names; no real people, emails, phone numbers, or IDs. Emails use `@example.test`.
- Application IDs: `DEMO-APP-0001` format (mono).
- Dates: seeded **relative to the current date** (e.g. today+6 days) so the demo always looks current; format `dd MMM yyyy` (e.g. 23 Oct 2026), IST timezone; relative text ("in 6 days", "3 days overdue") alongside.
- Seed enough variety: ~12–15 applications across stages, ≥3 with findings needing review, ≥2 overdue, ≥2 with expiring documents, ≥1 with an open clarification.
- Seed documents are small placeholder PDFs generated locally (no real certificates or logos).
- No credentials, tokens, or personal data in the repository or UI.

### 11.3 Findings honesty rules
- Wording: "possible issue", "may be inconsistent", "appears to be missing" — never "fake", "forged", "fraud", "invalid".
- Always show evidence (document, page, snippet or field).
- Show **source**: "Rule-based check" (deterministic checks on form fields and dates) or "AI extraction (demo, mocked)".
- Confidence as labels, not percentages.
- Disclaimer on the Findings tab and in Settings → About.
- Findings never change an application's decision state automatically; only humans advance stages.

### 11.4 Content tone
Calm, precise, plain English. Short sentences. Active voice. Say what happened, why, and what to do. No exclamation marks, no jargon, no blame. Examples:
- "2 findings need review before this application can move to Committee review."
- "Clarification requested from Demo College of Engineering B. Reply due 30 Oct 2026."
- Error: "We couldn't upload this file. Check that it's a PDF, PNG or JPG under 10 MB, then try again."

---

## 12. Backend contract (for matching the UI)

**Stack:** FastAPI + SQLite (SQLModel or SQLAlchemy). Local only. Files stored in `backend/storage/uploads/`.

### 12.1 Entities

| Entity | Key fields |
|---|---|
| User | id, name, role (`institution_user`/`officer`/`admin`), institution_id (nullable) |
| Institution | id, name |
| Application | id, ref (`DEMO-APP-0001`), title, institution_id, stage_id, status, owner_id, form_data (JSON), submitted_at, deadline, updated_at |
| StageConfig | id, name, order, is_terminal (configurable placeholders) |
| Document | id, application_id, name, type, size, path, uploaded_by, uploaded_at, expires_on (nullable), extracted_fields (JSON) |
| Finding | id, application_id, document_id (nullable), severity, title, explanation, evidence (JSON: document, page, snippet, field), source (`rule`/`ai_mock`), confidence (`high`/`medium`/`low`), review_state (`needs_review`/`confirmed`/`dismissed`), reviewed_by, reviewed_at, note |
| Clarification | id, application_id, finding_id (nullable), title, message, requested_by, due_date, status (`open`/`replied`/`resolved`/`overdue`) + messages |
| Requirement | id, name, category, applies_to_stage, due_rule, description (sample placeholders) |
| Deadline | id, application_id, type, due_date, status |
| Alert | id, user_id, type, priority, title, reason, application_id, created_at, read_at |
| AuditEvent | id, application_id (nullable), actor_id, actor_role, action, detail (JSON), created_at |

### 12.2 Endpoints (suggested)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/demo-login` | `{role}` → session token + user |
| GET | `/api/me` | Current user |
| GET | `/api/overview` | Metric values (with definitions), attention queue, deadlines, stage counts |
| GET | `/api/applications` | List with filters/sort/pagination |
| POST | `/api/applications` | Create draft |
| GET | `/api/applications/{id}` | Dossier summary |
| POST | `/api/applications/{id}/submit` | Submit (runs checks) |
| POST | `/api/applications/{id}/advance` | Advance stage (`note` optional) |
| POST | `/api/applications/{id}/assign` | Assign owner |
| GET/POST | `/api/applications/{id}/documents` | List / upload (multipart) |
| GET | `/api/documents/{id}/file` | Download/preview |
| GET | `/api/applications/{id}/findings` | List |
| POST | `/api/findings/{id}/review` | `{state, note}` |
| GET/POST | `/api/applications/{id}/clarifications` | List / create |
| POST | `/api/clarifications/{id}/reply` | Reply (text + optional file) |
| POST | `/api/clarifications/{id}/resolve` | Resolve |
| GET | `/api/alerts`, POST `/api/alerts/read` | List / mark read |
| GET | `/api/deadlines` | Timeline/list |
| GET | `/api/requirements` | Sample requirements |
| GET | `/api/analytics` | Chart data with definitions |
| GET | `/api/audit` | Global or per-application audit events |
| POST | `/api/demo/reset` | Re-seed |

Rules: every mutating endpoint writes an `AuditEvent`; errors return `{code, message, request_id}`; list endpoints return `{items, total}`.

---

## 13. Recommended file and component organisation

```
prism/
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.ts            # colours map to CSS variables
│   └── src/
│       ├── main.tsx
│       ├── app/
│       │   ├── router.tsx
│       │   ├── providers.tsx         # QueryClient, MotionConfig, Theme, Auth, Toaster
│       │   └── layout/
│       │       ├── AppShell.tsx
│       │       ├── Sidebar.tsx
│       │       ├── TopBar.tsx
│       │       ├── CommandPalette.tsx
│       │       ├── ThemeMenu.tsx
│       │       └── PageTransition.tsx
│       ├── styles/
│       │   ├── globals.css
│       │   ├── tokens.css            # all six data-theme blocks
│       │   └── fonts.css
│       ├── components/
│       │   ├── ui/                   # shadcn primitives, themed (button, input, dialog…)
│       │   ├── StatusBadge.tsx
│       │   ├── MetricCard.tsx
│       │   ├── StageTracker.tsx
│       │   ├── FindingCard.tsx
│       │   ├── EvidenceBlock.tsx
│       │   ├── DataTable.tsx
│       │   ├── FilterBar.tsx
│       │   ├── FileDropzone.tsx
│       │   ├── DocumentPreview.tsx
│       │   ├── Timeline.tsx
│       │   ├── ChartCard.tsx
│       │   ├── EmptyState.tsx
│       │   ├── ErrorBanner.tsx
│       │   └── DemoPill.tsx
│       ├── features/
│       │   ├── auth/                 # SignInPage, RoleCard
│       │   ├── overview/
│       │   ├── applications/         # ListPage, DossierPage, tabs/*
│       │   ├── findings/
│       │   ├── clarifications/
│       │   ├── requirements/
│       │   ├── alerts/               # AlertsPage, DeadlinesTimeline
│       │   ├── analytics/
│       │   ├── audit/
│       │   └── settings/
│       ├── lib/
│       │   ├── api.ts                # fetch wrapper, typed endpoints
│       │   ├── statusMap.ts          # enum → icon/colour/label
│       │   ├── dates.ts              # IST formatting, relative text
│       │   ├── motion.ts             # duration/ease/spring presets
│       │   ├── theme.ts              # theme list, persistence
│       │   └── contrast.test.ts      # token contrast checks
│       └── types/                    # shared API types
└── backend/
    ├── main.py
    ├── app/
    │   ├── models.py
    │   ├── schemas.py
    │   ├── db.py
    │   ├── seed.py                   # relative-date sample data
    │   ├── checks.py                 # rule-based findings + mocked extraction
    │   ├── audit.py
    │   └── routers/ (auth, applications, documents, findings, clarifications, alerts, analytics, audit)
    └── storage/uploads/
```

Conventions: TypeScript strict; feature folders own their queries (`useApplications`, `useFindings`) via TanStack Query; no raw hex in components; every list/page has loading, empty, and error states before it's considered done.

---

## 14. MVP priorities

| Priority | Items |
|---|---|
| **Must-have** | App shell + sidebar + top bar; 6 themes with persistence; sign-in with demo role cards; Applications list; **Dossier** (Summary, Documents with **real upload**, Findings with review states, Clarifications, History); Overview (metrics with definitions + needs-attention queue); audit event for every action; demo loop works end to end; reduced-motion support; demo/sample-data labelling |
| **Should-have** | Deadlines & alerts (timeline + alerts); Analytics (3 charts); Activity history page; Settings page; ⌘K command palette; Compliance requirements (read-only); application peek drawer; Undo toasts |
| **Later** | Real OCR/AI extraction; real auth/permissions; committee reviewer and auditor roles; EVC scheduling; configurable stage/requirement editor; export/reports; mobile layouts; notifications by email/SMS; what-if simulation; 3D/network view |

### 5-day plan

| Day | Goal | Done when |
|---|---|---|
| 1 | Shell, tokens, six themes, sign-in, backend + seed data + demo login | Can sign in as each role; themes switch; seed data loads |
| 2 | Applications list; dossier Summary + Documents (upload, preview) | Can upload a file and see it listed |
| 3 | Findings, clarifications, History, audit writes | Full demo loop (section 2.2) works |
| 4 | Overview, Deadlines & alerts, Analytics, ⌘K | All must/should screens present |
| 5 | Motion pass, accessibility pass, empty/error states, demo script, bug bash | Acceptance criteria and QA checklist pass |

**Cut first if behind:** analytics charts → ⌘K palette → compliance requirements. **Never cut:** the demo loop, audit trail, and sample-data labelling.

---

## 15. Acceptance criteria

1. Signing in as Institution user, Officer, and Admin works with one click; no credentials are shown.
2. The full demo loop (section 2.2, steps 1–8) completes without errors, with data persisted by the backend across page reloads.
3. Real file upload works (PDF/PNG/JPG ≤10 MB); invalid files show clear inline errors; uploaded PDFs/images preview in the dossier.
4. After submission, at least one finding is created with evidence (document/field, snippet or value), source label, confidence label, and review state.
5. Confirm/Dismiss/Request clarification each produce an audit event visible in History within the same session.
6. Overview metrics are computed from backend data, each with a definition tooltip, time range, and "Sample data" tag. No hard-coded values.
7. Every status uses icon + text + colour.
8. All six themes are selectable, persist across reloads, and pass contrast targets (AA minimum, AAA for contrast themes).
9. Reduced motion (OS or in-app) removes all non-essential animation.
10. All screens have loading, empty, and error states.
11. Keyboard-only users can complete the demo loop, including dialogs and the command palette.
12. No text, finding, or label claims official AICTE rules or proves authenticity; the findings disclaimer is visible.
13. The 3D view and what-if simulator are absent.
14. The layout holds without horizontal page scroll at 1280, 1440, 1920, and 2560 px.

## 16. Visual QA checklist

- [ ] Tokens only: no hard-coded colours in components (search for `#` in `src/components` and `src/features`).
- [ ] Check every screen in all six themes (screenshots side by side); no unreadable text, invisible borders, or washed-out badges.
- [ ] Contrast spot checks: muted text, badge text on soft backgrounds, disabled states, chart labels.
- [ ] Focus ring visible on every interactive element, in every theme.
- [ ] Prism gradient appears only in the logo, active stage segment, and sign-in card edge (and is solid in contrast themes).
- [ ] Spacing follows the 4 px scale; cards, tables, and headers align to the grid.
- [ ] Numbers, dates, and IDs use tabular numerals/mono consistently.
- [ ] Table rows: consistent height, truncation with tooltip for long titles, no layout shift when data loads.
- [ ] Skeletons match final layout; no layout jump when content arrives.
- [ ] Motion: durations 120–300 ms, no looping animation other than skeleton shimmer; nothing blocks interaction.
- [ ] Reduced motion verified: toggle on and walk through every screen.
- [ ] Dialogs/drawers: focus trap, Esc, return focus, overlay contrast.
- [ ] Toasts don't cover primary actions and are announced to screen readers.
- [ ] Sample-data pill and metric tags visible on every relevant screen.
- [ ] Empty/error copy follows the tone guide (calm, specific, with a next step).
- [ ] Sidebar collapsed and expanded states look correct at 1280 and 1440 px.

---

## 17. Assumptions and open questions

### Assumptions
- Stage names, requirement names, due rules, and statuses are **placeholders**; they must be verified against applicable official sources before real use.
- "AI extraction" is mocked/rule-based in this build and labelled as such.
- Demo auth is intentionally minimal and not secure; the app runs locally only.
- IST is the display timezone; sample dates are generated relative to today.
- English only; desktop only (≥1280 px).
- Fonts are self-hosted; no external network calls at runtime.

### Open questions
1. Should the sign-in screen also show a fictional email for each demo identity (read-only), or role names only?
2. Are the placeholder stage names acceptable, or does the team have a verified stage list to seed?
3. Should Institution users be able to edit form fields after submission when a clarification is open?
4. Is a PDF.js-based viewer required, or is the browser's built-in PDF viewer (`<iframe>/<object>`) acceptable for the demo?
5. Should "Reset demo data" be available to all roles or Admin only? (Default here: all roles in Settings → About, with confirm dialog.)
