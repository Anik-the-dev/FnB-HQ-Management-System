# -- FnB HQ Management System

# Description
A company operates a central HQ system managing multiple F&B outlets. HQ manages the master menu, assigns menu items to outlets, and monitors sales activity across outlets. Each outlet can process sales transactions and deduct inventory locally.
## Flow
Single Company → Multiple Outlets → HQ assigns menu → Outlets create sales → HQ sees reports.

# Local Setup
1. Clone the repo (git clone https://github.com/Anik-the-dev/FnB-HQ-Management-System.git)
2. cp env.example .env (directory: FNB_HQ_MANAGEMENT)
3. Fill env via your postgress connection string.
4. Run docker instance in your machine(docker desktop)
5. Run: "docker compose up --build" ( run the cmd where docker-compose.yml located)
6. Browse http://localhost:3000/ to view the project.
7. Admin login: username: admin, password: password
8. Create users from admin panel for outets to view POS outlet, add stock and create sales.

# Live Site ( Need to wait 30sec  to activate as Render free tier goes down due to inactivity)
https://fnb-frontend.onrender.com

Admin login: username: admin, password: password
Chittagong Outlet Login: username: anik, password: password

# API Endpoints ( Postman Collection: )

### Auth

| Method | Endpoint                         | Access | Description              |
|--------|----------------------------------|--------|--------------------------|
| POST   | `/api/auth/login`                | Public | Login, returns JWT token |
| GET    | `/api/auth/me`                   | Any    | Get current user info    |
| GET    | `/api/auth/users`                | Admin  | List all users           |
| POST   | `/api/auth/users`                | Admin  | Create a user            |
| PATCH  | `/api/auth/users/:id/activate`   | Admin  | Activate a user          |
| PATCH  | `/api/auth/users/:id/deactivate` | Admin  | Deactivate a user        |

### Menu Items

| Method | Endpoint               | Access       | Description          |
|--------|------------------------|--------------|----------------------|
| GET    | `/api/menu-items`      | Admin        | List all menu items  |
| GET    | `/api/menu-items/:id`  | Admin        | Get single item      |
| POST   | `/api/menu-items`      | Admin        | Create menu item     |
| PUT    | `/api/menu-items/:id`  | Admin        | Update menu item     |
| DELETE | `/api/menu-items/:id`  | Admin        | Deactivate menu item |

### Outlets

| Method | Endpoint                        | Access       | Description                |
|--------|---------------------------------|--------------|----------------------------|
| GET    | `/api/outlets`                  | Admin        | List all outlets           |
| POST   | `/api/outlets`                  | Admin        | Create outlet              |
| GET    | `/api/outlets/:id`              | Outlet.      | Get outlet by ID           |
| PUT    | `/api/outlets/:id`              | Admin        | Update outlet              |
| GET    | `/api/outlets/:id/menu`         | Admin/Outlet | Get outlet assigned menu   |
| POST   | `/api/outlets/:id/menu`         | Admin        | Assign item to outlet      |
| PATCH  | `/api/outlets/:id/menu/:itemId` | Admin        | Update price override      |
| DELETE | `/api/outlets/:id/menu/:itemId` | Admin        | Remove item from outlet    |


### Inventory

| Method | Endpoint                           | Access       | Description                    |
|--------|------------------------------------|--------------|--------------------------------|
| GET    | `/api/inventory/:outletId`         | Outlet       | Get outlet inventory           |
| PUT    | `/api/inventory/:outletId/:itemId` | Admin        | Set absolute stock (HQ)        |
| PATCH  | `/api/inventory/:outletId/:itemId` | Outlet       | Adjust stock by delta (restock)|

### Sales

| Method | Endpoint                                  | Access       | Description          |
|--------|-------------------------------------------|--------------|----------------------|
| POST   | `/api/sales`                              | Outlet       | Create sale          |
| GET    | `/api/sales/:outletId`                    | Outlet       | List outlet sales    |
| GET    | `/api/sales/:outletId/:receiptNumber`     | Outlet       | Get sale by receipt  |

### Reports

| Method | Endpoint                            | Access       | Description              |
|--------|-------------------------------------|--------------|--------------------------|
| GET    | `/api/reports/revenue`              | Admin        | Total revenue by outlet  |
| GET    | `/api/reports/top-items/:outletId`  | Admin        | Top 5 selling items      |

# Schema Explanation

The database has 9 tables organised around a single company that owns multiple outlets.

### Table Breakdown

**`companies`**
Single row representing the business. All outlets and menu items belong to this company. Designed to extend to multi-tenant SaaS later.

**`outlets`**
Physical locations. Each outlet is independent — it has its own menu assignments, inventory, and sales history.

**`menu_items`**
The HQ master menu. Only admin can create or modify items. Outlets cannot invent their own items. Each item has a `base_price` and a `category`.

**`outlet_menu_items`**
Assignment bridge between outlets and menu items. Resolves the many-to-many relationship. Holds an optional `override_price` — if set, the outlet charges this price instead of `base_price`. If `is_available = false`, the item is hidden from that outlet's POS.

**`inventory`**
One row per (outlet, menu item) pair. Tracks `quantity_on_hand` with a `CHECK (quantity_on_hand >= 0)` constraint — stock can never go negative at the database level. Auto-created with `quantity = 0` when HQ assigns an item to an outlet.

**`outlet_receipt_counters`**
One row per outlet. Holds a `last_sequence` integer. During every sale this row is locked with `SELECT FOR UPDATE`, incremented atomically, and released. Guarantees sequential unique receipt numbers even under concurrent requests.

**`transactions`**
Sale headers. One row per completed sale. `total_amount` is stored (denormalised) for fast reporting — no need to sum line items on every report query. Receipt number format: `OT{outletId}-{YYYYMMDD}-{seq}` e.g. `OT1-20260316-0042`.

**`transaction_items`**
Sale line items. Each row is one menu item in one sale. `unit_price` is a **snapshot** of the price at time of sale — if HQ changes the price later, historical receipts remain accurate.

**`users`**
Authentication table. Role is either `admin` (no outlet link) or `outlet` (must have `outlet_id`). A `CHECK` constraint enforces that outlet-role users always have an outlet assigned.


# Architecture Explanation

### Overall Structure

```
Browser
  └── React SPA
          │
          │  HTTPS
          ▼
    Express API (Node.js 20, ESM)
          │
          │  pg connection pool
          ▼
    PostgreSQL 16
```

### Backend — Layered Architecture

Each feature follows a strict 4-layer pattern. No layer skips another.

```
HTTP Request
    │
    ▼
Routes          → defines URL, applies middleware chain
    │
    ▼
Controllers     → reads req, calls service, sends res
    │
    ▼
Services        → business logic, orchestrates repositories
    │
    ▼
Repositories    → raw SQL queries, returns plain objects
    │
    ▼
PostgreSQL
```

### Middleware Chain

Every protected request passes through:

```
Request → authenticate → authorize → validate → controller
```

- `authenticate` — verifies JWT, attaches `req.user`
- `authorize(roles, options)` — checks role, checks outlet ownership for outlet users
- `validate` — runs express-validator rules, returns 400 on failure

### Sale Transaction Flow

The most critical flow — 8 steps inside a single DB transaction:

```
POST /api/sales
    │
    ├── BEGIN (dedicated DB connection)
    │
    ├── 1. getEffectivePrices      verify all items assigned + active at outlet
    ├── 2. lockInventoryRows       SELECT FOR UPDATE (blocks concurrent sales)
    ├── 3. validateStock           check ALL items have enough stock
    ├── 4. deductStock             UPDATE inventory for each item
    ├── 5. incrementReceiptCounter SELECT FOR UPDATE + increment sequence
    ├── 6. buildReceiptNumber      OT{outletId}-{YYYYMMDD}-{seq padded 4}
    ├── 7. createTransaction       INSERT sale header
    ├── 8. createTransactionItems  bulk INSERT line items
    │
    ├── COMMIT (all succeed) → return receipt
    └── ROLLBACK (any fail)  → DB unchanged, error returned
```

**Respect Concurrency:** Steps 2 and 5 use `SELECT FOR UPDATE`. If two requests arrive simultaneously for the same outlet, one waits at the lock until the other commits. This prevents overselling and duplicate receipt numbers.

### Frontend — Page Structure

```
App.jsx (AuthProvider)
    │
    ├── /login              Login.jsx (public)
    ├── /unauthorized       Unauthorized.jsx (public)
    │
    ├── HQLayout (admin only via ProtectedRoute)
    │   ├── /              Dashboard
    │   ├── /menu          MenuManagement
    │   ├── /outlets       OutletManagement
    │   ├── /reports       Reports
    │   └── /users         Users
    │
    └── OutletLayout (authenticated, outlet-scoped)
        ├── /outlet/:id/pos        POS
        ├── /outlet/:id/inventory  Inventory
        └── /outlet/:id/sales      SalesHistory
```

**Auth flow:**
- Login stores JWT + user in `localStorage`
- Axios interceptor attaches `Authorization: Bearer <token>` to every request
- On 401 → auto-redirect to `/login`
- On 403 → `fnb:forbidden` custom event → `ForbiddenModal` shown
- `ProtectedRoute` checks role — outlet users cannot access HQ pages

## Scaling Strategy
The current system runs on a single server. Below are the strategies 
for evolving the system as traffic grows:

- **Read replica** — We can route all report and history queries to a PostgreSQL read replica. Writes (sales, stock updates) go to primary only.
- **Table partitioning** — Partition the `transactions` table by month. Postgres scans only the relevant partition on date-range queries instead of the full table.
- **Connection pooling** — We can add PgBouncer between the app and PostgreSQL. Handles 1000+ concurrent users with a fixed pool of 20 DB connections.
- **Horizontal scaling** — The Express app is stateless (JWT carries all session state). Run multiple instances behind a load balancer — no sticky sessions needed.
- **Caching** — Cache menu items and outlet assignments in Redis (60s TTL). Invalidate on HQ update. Reduces DB load on every POS page load.
- **Job queue for sales** — Under very high concurrency, move sale creation to a job queue (BullMQ + Redis). The POS submits a job and gets a job ID back immediately without waiting for the DB transaction to complete. A background worker processes the queue and the POS polls for the receipt. This decouples HTTP response time from DB transaction time and prevents request pile-up during peak hours.


# Project Structure

```
fnb-system/
├── backend/
│   ├── src/
│   │   ├── config/         app.js, db.js
│   │   ├── controllers/    auth, outlet, menuItem, inventory, sales, report
│   │   ├── services/       auth, outlet, menuItem, inventory, sales, report
│   │   ├── repositories/   auth, outlet, menuItem, inventory, sales, report
│   │   ├── routes/         index, auth, outlets, menu-items, inventory, sales, reports
│   │   ├── middlewares/    authenticate.js, authorize.js, validate.js, errorHandler.js
│   │   ├── validators/     auth, outlet, menuItem, inventory, sales
│   │   ├── utils/          asyncHandler.js, response.js, receiptNumber.js
│   │   └── db/             schema.sql, seed.sql
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── context/        AuthContext.jsx
│   │   ├── components/
│   │   │   ├── layout/     HQLayout.jsx, OutletLayout.jsx
│   │   │   └── ui/         Badge, Modal, StatCard, Spinner, EmptyState, ForbiddenModal
│   │   ├── pages/
│   │   │   ├── hq/         Dashboard, MenuManagement, OutletManagement, Reports, Users
│   │   │   └── outlet/     POS, Inventory, SalesHistory
│   │   └── services/       api.js
│   ├── public/             _redirects
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

# Useful Commands

```bash
# Start with Docker
docker-compose up --build

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Connect to DB
docker exec -it db_container psql -U db_user_name -d database_name

# Stop and wipe everything including DB data
docker-compose down -v
```