# VendorBridge — All 6 Planning Documents
**Stack:** React + shadcn/ui + Tailwind (Frontend) | Node.js + Express (Backend) | MySQL (Database)
**Team:** 4 people — 3 Frontend, 1 Backend
**Duration:** 8 Hours

---

# DOCUMENT 1: Product Requirements Document (PRD)

## App Overview
**Name:** VendorBridge
**Tagline:** Procurement & Vendor Management ERP
**One-liner:** A centralized ERP platform that digitizes procurement workflows — from vendor registration to invoice generation — eliminating manual inefficiencies.

## Target Users
- Procurement Officers
- Vendors (external)
- Managers / Approvers
- Admins

## Problem Being Solved
Organizations manage vendor communication, quotations, approvals, and invoices manually via spreadsheets and emails. This causes delays, errors, lack of visibility, and no audit trail.

## User Roles & Permissions

| Role | Permissions |
|------|-------------|
| Admin | Manage users, manage vendors, view analytics |
| Procurement Officer | Create RFQs, compare quotations, generate POs & invoices |
| Vendor | Submit quotations, track RFQ status, view POs |
| Manager/Approver | Approve/reject procurement requests, monitor workflows |

## Core Features (MVP Scope)

1. **Auth** — Login, Signup, role-based access, session handling
2. **Dashboard** — Pending approvals, active RFQs, recent POs, invoices, analytics cards
3. **Vendor Management** — Register vendors, status tracking, GST & contact details, search & filter
4. **RFQ Creation** — Title, product/service details, quantity, deadline, vendor assignment
5. **Quotation Submission** — Vendors submit pricing, delivery timeline, notes
6. **Quotation Comparison** — Side-by-side view, lowest price highlight, delivery timeline comparison
7. **Approval Workflow** — Approve/reject with remarks, timeline, status tracking
8. **PO & Invoice Generation** — Auto PO number, tax calculation, PDF download, print, email invoice
9. **Activity Logs & Notifications** — Audit logs, RFQ/approval/invoice alerts
10. **Reports & Analytics** — Vendor performance, spending summaries, monthly trends, exportable reports

## User Stories

- As a **Procurement Officer**, I want to create RFQs and assign them to vendors so I can collect quotations efficiently.
- As a **Vendor**, I want to submit my quotation with pricing and delivery details so the procurement team can evaluate my offer.
- As a **Manager**, I want to approve or reject procurement requests with remarks so there is a clear audit trail.
- As an **Admin**, I want to manage users and vendors centrally so the platform stays organized.
- As a **Procurement Officer**, I want to compare quotations side-by-side so I can make the best vendor selection.
- As a **Procurement Officer**, I want to generate and email invoices directly from the platform so I don't need external tools.

## Success Metrics
- All 4 user roles functional with correct access restrictions
- Full procurement cycle working end-to-end (RFQ → Quotation → Approval → PO → Invoice)
- Dynamic data from MySQL (no static JSON in final build)
- Invoice PDF download and email sending functional
- Responsive UI across desktop and tablet

## Out of Scope (V1)
- Multi-organization/tenant support
- Payment gateway integration
- Mobile app
- AI-based vendor recommendations
- Real-time chat between vendor and officer

---

# DOCUMENT 2: Technical Requirements Document (TRD)

## Frontend Stack
- **Framework:** React (Vite)
- **UI Library:** shadcn/ui
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State Management:** React Context API + useState (no Redux — overkill for 8hrs)
- **HTTP Client:** Axios
- **PDF Generation:** react-pdf or jsPDF
- **Charts:** Recharts
- **Icons:** Lucide React (ships with shadcn)

## Backend Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Sequelize (MySQL compatible, reduces raw SQL errors)
- **Auth:** JWT (jsonwebtoken) + bcrypt for password hashing
- **Email:** Nodemailer (SMTP / Gmail App Password)
- **PDF:** PDFKit (server-side PDF generation)
- **Validation:** express-validator
- **CORS:** cors middleware

## Database
- **Engine:** MySQL (local)
- **Tool:** MySQL Workbench or phpMyAdmin for local management
- **ORM:** Sequelize with migrations

## Authentication
- JWT-based auth
- Token stored in localStorage on client
- Protected routes on frontend via React Router guards
- Middleware on backend to verify JWT on every protected API call
- Role stored in JWT payload — used for both frontend UI rendering and backend permission checks

## API Design
- RESTful API
- Base URL: `http://localhost:5000/api`
- All responses: `{ success: true/false, data: {}, message: "" }`
- Auth header: `Authorization: Bearer <token>`

## Key API Endpoints

### Auth
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`

### Vendors
- `GET /api/vendors`
- `POST /api/vendors`
- `PUT /api/vendors/:id`
- `DELETE /api/vendors/:id`

### RFQ
- `GET /api/rfq`
- `POST /api/rfq`
- `GET /api/rfq/:id`
- `PUT /api/rfq/:id/status`

### Quotations
- `POST /api/rfq/:rfqId/quotations`
- `GET /api/rfq/:rfqId/quotations`
- `PUT /api/quotations/:id`

### Approvals
- `POST /api/approvals/:quotationId/approve`
- `POST /api/approvals/:quotationId/reject`
- `GET /api/approvals`

### Purchase Orders
- `POST /api/po`
- `GET /api/po`
- `GET /api/po/:id`

### Invoices
- `POST /api/invoices`
- `GET /api/invoices/:id/pdf`
- `POST /api/invoices/:id/send-email`

### Dashboard & Reports
- `GET /api/dashboard/stats`
- `GET /api/reports/vendor-performance`
- `GET /api/reports/spending`
- `GET /api/activity-logs`

## Security Requirements
- All non-auth routes require valid JWT
- Role-based middleware on sensitive routes (e.g., only Manager can approve)
- Input validation on all POST/PUT routes
- Passwords hashed with bcrypt (salt rounds: 10)
- No sensitive data in JWT payload (no passwords)

## Performance Requirements
- API responses under 500ms for local MySQL queries
- No N+1 query problems — use Sequelize eager loading (include: [])
- Frontend lazy loading for heavy pages (Reports, Comparison)

## Environment
- Frontend: `http://localhost:5173` (Vite default)
- Backend: `http://localhost:5000`
- MySQL: `localhost:3306`
- `.env` file for all secrets — never hardcode

---

# DOCUMENT 3: App Flow Document

## Screen List & Navigation

```
/login              → Login page (public)
/register           → Register page (public)
/dashboard          → Home dashboard (all roles, filtered by role)
/vendors            → Vendor list
/vendors/new        → Add vendor form
/vendors/:id        → Vendor detail/edit
/rfq                → RFQ list
/rfq/new            → Create RFQ form
/rfq/:id            → RFQ detail + quotations received
/rfq/:id/compare    → Quotation comparison screen
/quotations/:id     → Vendor quotation submission form
/approvals          → Approval queue (Manager only)
/purchase-orders    → PO list
/purchase-orders/:id → PO detail + invoice generation
/invoices/:id       → Invoice view + download/email
/activity-logs      → Audit log + notifications
/reports            → Reports & analytics
```

## Detailed User Journeys

### Journey 1: Procurement Officer — Full Cycle
1. Login → redirected to `/dashboard`
2. Dashboard shows: pending approvals count, active RFQs, recent POs, quick action buttons
3. Click "Create RFQ" → `/rfq/new`
   - Fill: title, product details, quantity, deadline, select vendors to assign
   - Submit → RFQ created, vendors notified (activity log entry)
4. RFQ appears in `/rfq` list with status "Open"
5. When vendors submit quotations → Officer sees them at `/rfq/:id`
6. Click "Compare Quotations" → `/rfq/:id/compare`
   - Side-by-side table: vendor name, price, delivery time, rating
   - Lowest price highlighted in green
   - Select winner → triggers approval workflow
7. Approval sent to Manager
8. On approval → Officer generates PO at `/purchase-orders/:id`
9. From PO → Generate Invoice → `/invoices/:id`
   - Download PDF or Send via Email

### Journey 2: Vendor — Submit Quotation
1. Login → Dashboard shows assigned RFQs
2. Click RFQ → `/quotations/:id` (submission form)
   - Fill: unit price, total, delivery timeline, notes
   - Submit → Quotation saved, status "Submitted"
3. Vendor can edit quotation while RFQ is still "Open"
4. View PO when approved → `/purchase-orders/:id` (read-only)

### Journey 3: Manager — Approval
1. Login → Dashboard shows pending approval count with alert
2. Go to `/approvals`
   - List of quotations awaiting approval
   - Click one → view quotation details, vendor info, RFQ context
   - Add remarks → Approve or Reject
3. On Approve → system auto-creates PO
4. On Reject → RFQ status reverts, procurement officer notified

### Journey 4: Admin
1. Login → Dashboard with full analytics
2. Manage users at `/vendors` (vendor registration, status toggle)
3. View reports at `/reports`

## State Flows

### RFQ Status Flow
`Draft` → `Open` → `Under Review` → `Approved` / `Rejected` → `PO Generated`

### Quotation Status Flow
`Submitted` → `Under Comparison` → `Selected` / `Rejected`

### PO Status Flow
`Generated` → `Invoice Raised`

## Empty States
- No vendors yet → "No vendors registered. Add your first vendor."
- No RFQs → "No RFQs created yet. Start your first procurement."
- No quotations on RFQ → "Waiting for vendor quotations."
- No approvals pending → "All caught up. No pending approvals."

## Error States
- Login fail → "Invalid credentials. Please try again."
- Form validation → inline field errors (red, below input)
- API fail → toast notification "Something went wrong. Try again."
- Unauthorized access → redirect to `/login`

## Success States
- RFQ created → toast "RFQ created successfully"
- Quotation submitted → toast "Quotation submitted"
- Approved → toast "Quotation approved. Purchase Order generated."
- Invoice emailed → toast "Invoice sent to vendor email"

---

# DOCUMENT 4: UI/UX Design Brief

## Design Direction
**Style:** Enterprise Dark — refined, data-dense, high contrast. Think linear.app meets a procurement tool. Not flashy, but unmistakably sharp.

Not generic corporate blue. Not purple gradient on white. Something that actually looks like a tool professionals want to use.

## Color Palette

```
Background:       #0F1117  (near black)
Surface:          #1A1D27  (card/sidebar bg)
Border:           #2E3347  (subtle separators)
Primary Accent:   #4F8EF7  (blue — actions, links, highlights)
Success:          #22C55E  (approved, lowest price)
Warning:          #F59E0B  (pending, under review)
Danger:           #EF4444  (rejected, errors)
Text Primary:     #F1F5F9  (headings, labels)
Text Secondary:   #94A3B8  (descriptions, metadata)
```

## Typography
- **Display / Headings:** `DM Sans` (bold, clean, modern — not overused)
- **Body / Data:** `IBM Plex Mono` for numbers, IDs, amounts; `DM Sans` for all other body text
- **Import from Google Fonts**

## Layout Rules
- **Sidebar:** Fixed left, 240px wide, collapsible to icon-only on small screens
- **Main content:** Full remaining width with 24px padding
- **Cards:** Rounded-xl, subtle border, dark surface bg — no heavy drop shadows
- **Tables:** Zebra striping using surface + slightly lighter alternate row
- **Spacing system:** Strictly 4px base unit (4, 8, 12, 16, 24, 32, 48)

## Component Style (shadcn/ui customized)

- **Buttons:** Primary = solid blue, Secondary = ghost with border, Danger = solid red
- **Inputs:** Dark bg, blue focus ring, error state = red border + message below
- **Badges:** Pill-shaped status badges — color-coded by status (green/yellow/red/blue)
- **Tables:** Sortable headers with chevron icons, row hover highlight
- **Modals:** Centered overlay, blurred backdrop, close on Escape
- **Toasts:** Bottom-right, slide-in animation, auto-dismiss 3s
- **Cards on Dashboard:** Icon + metric number (large) + label + trend arrow

## Dashboard Layout
```
[Sidebar] | [Top bar: breadcrumb + user avatar + notifications bell]
          | [Stats row: 4 cards — Pending Approvals, Active RFQs, POs This Month, Invoices]
          | [Middle: Recent RFQs table (left) + Spending chart (right)]
          | [Bottom: Recent Activity feed]
```

## Quotation Comparison Screen (Key Differentiator)
- Full-width table, sticky first column (vendor name)
- Lowest price cell: green background + "Best Price" badge
- Fastest delivery: blue badge
- Vendor rating shown as star row
- "Select Vendor" button on each column header

## Responsive Behavior
- Sidebar collapses to hamburger menu on tablet (< 1024px)
- Tables become horizontally scrollable on small screens
- Cards stack vertically on mobile
- **Priority: Desktop first** (ERP tools are desktop-primary)

## What Makes It Stand Out
1. Dark enterprise theme — most hackathon ERPs are generic white/blue
2. IBM Plex Mono for financial data — feels professional and intentional
3. Status badges everywhere — instant visual status without reading text
4. Quotation comparison table — this is the hero screen, make it exceptional
5. Smooth sidebar collapse animation
6. Skeleton loaders instead of spinners (feels production-grade)

---

# DOCUMENT 5: Backend Schema Document

## Database: `vendorbridge_db`

---

### Table: `users`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(150) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| role | ENUM('admin','officer','vendor','manager') | NOT NULL |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

---

### Table: `vendors`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| user_id | INT | FK → users.id (nullable, for vendor login) |
| company_name | VARCHAR(150) | NOT NULL |
| contact_person | VARCHAR(100) | NOT NULL |
| email | VARCHAR(150) | NOT NULL |
| phone | VARCHAR(20) | |
| gst_number | VARCHAR(20) | |
| category | VARCHAR(100) | |
| address | TEXT | |
| status | ENUM('active','inactive','blacklisted') | DEFAULT 'active' |
| rating | DECIMAL(2,1) | DEFAULT 0.0 |
| created_at | TIMESTAMP | DEFAULT NOW() |

---

### Table: `rfqs`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| rfq_number | VARCHAR(50) | UNIQUE, NOT NULL |
| title | VARCHAR(200) | NOT NULL |
| description | TEXT | |
| quantity | INT | NOT NULL |
| unit | VARCHAR(50) | |
| deadline | DATE | NOT NULL |
| status | ENUM('draft','open','under_review','approved','rejected','closed') | DEFAULT 'draft' |
| created_by | INT | FK → users.id |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

---

### Table: `rfq_vendors` (RFQ ↔ Vendor many-to-many)
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| rfq_id | INT | FK → rfqs.id |
| vendor_id | INT | FK → vendors.id |
| notified_at | TIMESTAMP | |

---

### Table: `quotations`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| rfq_id | INT | FK → rfqs.id |
| vendor_id | INT | FK → vendors.id |
| unit_price | DECIMAL(10,2) | NOT NULL |
| total_price | DECIMAL(12,2) | NOT NULL |
| delivery_days | INT | NOT NULL |
| notes | TEXT | |
| status | ENUM('submitted','under_comparison','selected','rejected') | DEFAULT 'submitted' |
| submitted_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

---

### Table: `approvals`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| quotation_id | INT | FK → quotations.id |
| reviewed_by | INT | FK → users.id |
| status | ENUM('pending','approved','rejected') | DEFAULT 'pending' |
| remarks | TEXT | |
| reviewed_at | TIMESTAMP | |
| created_at | TIMESTAMP | DEFAULT NOW() |

---

### Table: `purchase_orders`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| po_number | VARCHAR(50) | UNIQUE, NOT NULL |
| quotation_id | INT | FK → quotations.id |
| rfq_id | INT | FK → rfqs.id |
| vendor_id | INT | FK → vendors.id |
| subtotal | DECIMAL(12,2) | NOT NULL |
| tax_percent | DECIMAL(5,2) | DEFAULT 18.00 |
| tax_amount | DECIMAL(12,2) | |
| total_amount | DECIMAL(12,2) | |
| status | ENUM('generated','invoice_raised') | DEFAULT 'generated' |
| created_by | INT | FK → users.id |
| created_at | TIMESTAMP | DEFAULT NOW() |

---

### Table: `invoices`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| invoice_number | VARCHAR(50) | UNIQUE, NOT NULL |
| po_id | INT | FK → purchase_orders.id |
| vendor_id | INT | FK → vendors.id |
| amount_due | DECIMAL(12,2) | NOT NULL |
| status | ENUM('generated','sent','paid') | DEFAULT 'generated' |
| sent_at | TIMESTAMP | |
| created_at | TIMESTAMP | DEFAULT NOW() |

---

### Table: `activity_logs`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| user_id | INT | FK → users.id |
| action | VARCHAR(200) | NOT NULL |
| entity_type | VARCHAR(50) | (e.g. 'rfq', 'quotation', 'invoice') |
| entity_id | INT | |
| metadata | JSON | (optional extra context) |
| created_at | TIMESTAMP | DEFAULT NOW() |

---

## Relationships Summary
- `users` 1→many `rfqs` (created_by)
- `rfqs` many↔many `vendors` via `rfq_vendors`
- `rfqs` 1→many `quotations`
- `vendors` 1→many `quotations`
- `quotations` 1→1 `approvals`
- `approvals` 1→1 `purchase_orders` (on approval)
- `purchase_orders` 1→1 `invoices`
- All actions → `activity_logs`

## Auto-generated Number Formats
- RFQ: `RFQ-2024-0001` (prefix + year + 4-digit sequence)
- PO: `PO-2024-0001`
- Invoice: `INV-2024-0001`
Generate these in backend before INSERT.

## Indexes
- `users.email` — UNIQUE index
- `rfqs.rfq_number` — UNIQUE index
- `quotations.rfq_id` — index for fast lookup
- `activity_logs.entity_type + entity_id` — composite index

---

# DOCUMENT 6: Implementation Plan

## Team Split

| Person | Responsibility |
|--------|---------------|
| **Person A (Backend)** | Express setup, MySQL, all APIs, auth, email, PDF |
| **Person B (Frontend 1)** | Auth screens, Dashboard, Vendor Management |
| **Person C (Frontend 2)** | RFQ Creation, Quotation Submission, Quotation Comparison |
| **Person D (Frontend 3)** | Approval Workflow, PO & Invoice, Activity Logs, Reports |

---

## Phase-by-Phase Build Order

### PHASE 0 — Setup (First 30 mins — ALL)
**Person A (Backend):**
- Init Express project: `npm init`, install dependencies
- Create MySQL database `vendorbridge_db`
- Run all CREATE TABLE statements
- Setup `.env`: DB credentials, JWT secret, email config
- Setup Sequelize models for all tables
- Test DB connection

**Person B/C/D (Frontend):**
- Init Vite + React project: `npm create vite@latest`
- Install: `tailwindcss`, `shadcn/ui`, `axios`, `react-router-dom`, `recharts`, `lucide-react`
- Setup Tailwind config with custom colors (from design brief)
- Create folder structure:
  ```
  src/
    components/     # shared UI components
    pages/          # one folder per screen
    context/        # AuthContext
    lib/            # axios instance, helpers
    hooks/          # custom hooks
  ```
- Create `axios` instance with base URL + JWT interceptor
- Setup React Router with all routes defined (placeholder pages first)
- Build Sidebar + TopBar layout shell

**Git:** Person B creates repo, adds all 4 as collaborators. Each person works on their own branch.

---

### PHASE 1 — Auth (Hour 1)
**Backend (Person A):**
- `POST /api/auth/register` — hash password, insert user, return JWT
- `POST /api/auth/login` — verify password, return JWT + role
- `GET /api/auth/me` — return user from JWT
- Auth middleware function (verify JWT, attach user to req)

**Frontend (Person B):**
- Login page — email + password form, call API, store JWT in localStorage, redirect by role
- Register page — name, email, password, role select
- AuthContext — store user, token, login(), logout()
- ProtectedRoute component — redirects to /login if no token
- RoleGuard component — renders children only if role matches

**Test checkpoint:** Login works, wrong credentials show error, role stored correctly.

---

### PHASE 2 — Core Data APIs + Vendor Management (Hours 1-2)
**Backend (Person A):**
- All Vendor CRUD APIs
- Dashboard stats API (`GET /api/dashboard/stats`)
- Activity log helper function (used by all other APIs)

**Frontend (Person B):**
- Dashboard page — 4 stat cards, recent RFQ table, spending chart (Recharts), recent activity feed (use mock data temporarily if API not ready)
- Vendor Management — list with search/filter, status badge, add vendor modal, edit vendor

---

### PHASE 3 — RFQ + Quotations (Hours 2-4)
**Backend (Person A):**
- RFQ CRUD APIs + vendor assignment
- Quotation submission + update APIs
- Quotation comparison data API (returns all quotations for an RFQ with vendor details)

**Frontend (Person C):**
- RFQ list page — status badges, filter by status, click to view
- RFQ creation form — title, description, quantity, unit, deadline, multi-select vendors
- RFQ detail page — shows RFQ info + quotations received list
- Quotation submission form (Vendor role) — unit price, total, delivery days, notes, submit/edit
- **Quotation Comparison page** — this is the hero screen:
  - Full-width table, one column per vendor
  - Rows: Unit Price, Total, Delivery Days, Rating, Notes
  - Green highlight on lowest price cell
  - "Best Price" badge + "Fastest Delivery" badge
  - "Select This Vendor" button → triggers approval creation

---

### PHASE 4 — Approvals + PO + Invoice (Hours 4-6)
**Backend (Person A):**
- Approval create/approve/reject APIs
- On approve: auto-create PO with auto-generated PO number
- PO list + detail APIs
- Invoice create API
- PDF generation (PDFKit) — Invoice PDF endpoint
- Email sending (Nodemailer) — `POST /api/invoices/:id/send-email`

**Frontend (Person D):**
- Approval queue page (Manager) — list of pending approvals, quotation details inline, approve/reject with remarks input
- Approval timeline per quotation
- PO list + PO detail page — shows vendor, items, tax calculation, totals
- Invoice page — invoice preview (styled like a real invoice), Download PDF button, Send Email button, print button (`window.print()`)

---

### PHASE 5 — Activity Logs + Reports (Hours 6-7)
**Backend (Person A):**
- Activity logs API with filters
- Reports APIs — vendor performance, monthly spending

**Frontend (Person D):**
- Activity logs page — timeline UI, filter by entity type
- Reports page — Recharts bar chart for monthly spending, vendor performance table, export button (CSV)

---

### PHASE 6 — Polish + Integration + Testing (Hour 7-8)
**ALL:**
- Replace any remaining mock data with real API calls
- Test full procurement cycle end-to-end
- Input validation — all forms must show inline errors
- Loading states — skeleton loaders on tables, spinner on buttons
- Empty states — every list page must have one
- Error handling — toast on API failure
- Responsive check — sidebar collapse on tablet
- Git — clean up branches, merge to main

---

## Git Workflow Rules
- `main` branch — stable only, Person A manages merges
- Each person: `git checkout -b feature/your-screen-name`
- Commit every 30-45 mins minimum: `git commit -m "feat: add vendor list page"`
- Push before asking for help or review
- No one pushes directly to main — use PRs or Person A merges
- `.env` file goes in `.gitignore` — share credentials via message, never commit

---

## Critical Dependencies (Build These First)
These must exist before anyone else's work can connect:
1. MySQL tables created (Person A — Hour 0)
2. Auth API working (Person A — Hour 1)
3. JWT interceptor on Axios (Person B — Hour 1)
4. Sidebar + layout shell (Person B — Hour 0-1)
5. AuthContext (Person B — Hour 1)

---

## Risk Mitigation
| Risk | Mitigation |
|------|-----------|
| Email sending fails | Use Nodemailer with Gmail App Password, test in Phase 4 not Phase 6 |
| PDF generation slow | Generate on-demand server-side, stream to client |
| API not ready when frontend needs it | Use hardcoded mock response shape, swap to real API later |
| Time runs out | Reports page is lowest priority — skip if needed, fake with recharts + static data |
| MySQL connection issues | Test DB connection in Hour 0, fix before anything else |

---

## Prompt To Feed Into Antigravity
Use this when starting each phase in Antigravity:

> "Read the VendorBridge planning documents carefully. Do not start coding yet. First confirm what you understood about the screen/API you are building, what data it consumes, and what it outputs. Then build phase by phase. Stack: React + shadcn/ui + Tailwind (frontend), Express + MySQL + Sequelize (backend). Follow the color palette and design brief exactly. All API responses follow `{ success, data, message }` format. JWT is passed as Bearer token in Authorization header."
