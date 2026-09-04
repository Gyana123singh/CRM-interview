# Enterprise AI-Powered Multi-Tenant CRM, B2B Lead Intelligence & WhatsApp Marketing Suite

Production-grade, enterprise multi-tenant CRM application built with Next.js 14 App Router, React, Redux Toolkit & RTK Query, Express.js, JavaScript, MongoDB, Mongoose ODM, Zod Validation, TanStack Table, Recharts, Swagger/OpenAPI, Vitest, and Docker.

---

## 🛠️ Target Technology Stack

### Frontend
- **Framework**: Next.js 14 App Router, React 19, TypeScript
- **Styling**: Tailwind CSS with sleek enterprise dark aesthetics
- **Client State**: Redux Toolkit (`auth`, `user`, `ui`)
- **Server State**: RTK Query (`leadsApi`, `dealsApi`, `customersApi`, `dashboardApi`, `campaignsApi`, `conversationsApi`)
- **Form Management & Validation**: React Hook Form + Zod (`@hookform/resolvers`)
- **Data UI**: Enterprise TanStack Table (`@tanstack/react-table`) with server-side pagination, sorting, and search filtering
- **Data Visualization**: Recharts for pipeline and revenue analytics

### Backend
- **Framework**: Node.js & Express.js with JavaScript (ES Modules)
- **Database & ODM**: MongoDB with Mongoose ODM
- **Authentication**: JWT & bcryptjs password hashing
- **Input Validation**: Zod middleware (`validateRequest` for body, query, path params)
- **Error Handling**: Centralized error middleware with standard HTTP status codes (`401`, `403`, `409`, `422`, `500`)
- **API Documentation**: Interactive Swagger/OpenAPI 3.0 UI (`/api-docs`)
- **Realtime**: Server-Sent Events (SSE) broadcasting engine
- **Queue/Background Processing**: BullMQ / Redis support for campaign dispatching

---

## 🏛️ System Architecture

```text
Frontend (Next.js 14 App Router)
 ├── UI Layer (React Components + TanStack Table + Recharts)
 ├── Form Layer (React Hook Form + ZodResolver)
 ├── Global Client State (Redux Toolkit)
 └── Server State & Caching (RTK Query with Tag Invalidation)
       ↓ (REST APIs with JWT Bearer Token)
Backend (Express.js + JavaScript)
 ├── Route Definitions & Middlewares
 ├── Authentication Middleware (JWT)
 ├── Authorization / RBAC Middleware (SUPER_ADMIN, CLIENT_ADMIN, TEAM)
 ├── Zod Validation Middleware (Request Body/Params/Query)
 ├── Controller & Domain Service Layer
 ├── Mongoose ODM & Database Models
 └── MongoDB Database
```

---

## 🔑 Key CRM Business Rules Implemented

### 1. Transactional Lead Conversion (`Lead` → `Customer` → `Deal`)
- **Eligibility Check**: Verifies lead exists in authenticated workspace and has not already been converted.
- **Duplicate Prevention**: Returns `HTTP 409 Conflict` if the lead has already been converted into a Customer account.
- **Database Transaction (Mongoose Session Transaction)**:
  1. Creates `Customer` record linked to the `Company` tenant.
  2. Creates initial `Deal` in pipeline with weighted probability.
  3. Updates `Lead.status` to `CONVERTED`.
  4. Records `Activity` timeline event (`LEAD_CONVERTED`).
  5. Records audit record in `AuditLog`.
  - *If any step fails, the entire transaction rolls back cleanly.*

### 2. Deal Pipeline Stage Rules
- **Pipeline Hierarchy**: `QUALIFICATION` → `DISCOVERY` → `PROPOSAL` → `NEGOTIATION` → `WON` / `LOST`.
- **Expected Revenue Calculation**: `expectedRevenue = dealValue × (probability / 100)`.
- **Loss Reason Enforcement**: Setting a deal stage to `LOST` strictly requires providing a `lossReason` (returns `422 Unprocessable Entity` if omitted).
- **Closure Info**: Transitioning to `WON` or `LOST` automatically sets `closedAt` timestamp.
- **Terminal Stage Protection**: `WON` and `LOST` stages cannot be mutated without administrative reopen approval.

### 3. Multi-Tenant Data Isolation
- Tenant identity (`companyId`) is strictly derived from the authenticated JWT session on the backend.
- Prevents cross-tenant data leakage by enforcing `WHERE companyId = authenticatedUser.companyId` on all database queries.

---

## 🚀 API Documentation (Swagger / OpenAPI)

Interactive API documentation is exposed at `/api-docs` when running the backend.

- **URL**: `http://localhost:5000/api-docs`
- **Swagger JSON**: `http://localhost:5000/api-docs.json`

Supported API Groups:
- **Authentication**: `POST /api/auth/login`
- **Leads**: `GET /api/leads`, `POST /api/leads`, `POST /api/leads/:id/convert`
- **Deals Pipeline**: `GET /api/deals`, `POST /api/deals`, `PATCH /api/deals/:id/stage`
- **Customers**: `GET /api/customers`, `POST /api/customers`
- **WhatsApp Campaigns**: `GET /api/client-admin/whatsapp/campaigns`

---

## 🧪 Automated Testing Suite

The project includes an automated test suite powered by **Vitest** & **Supertest** in the Backend directory.

### Covered Test Scenarios:
- ✅ JWT Authentication & 401 Unauthorized handling
- ✅ Expected Revenue calculation `(dealValue * probability) / 100`
- ✅ Deal probability bounds validation (0 to 100)
- ✅ Loss reason enforcement when marking deals as `LOST`
- ✅ Duplicate conversion prevention returning `HTTP 409 Conflict`

### Run Backend Tests:
```bash
cd Backend
npm run test
```

---

## 🐳 Docker Deployment

Run the complete multi-container stack (PostgreSQL, Backend API, Next.js Frontend) using Docker Compose:

```bash
docker-compose up --build -d
```

### Services Started:
- **MongoDB Database**: `mongodb://localhost:27017/crm`
- **Backend API & Swagger**: `http://localhost:5000` (Swagger UI: `http://localhost:5000/api-docs`)
- **Frontend App**: `http://localhost:3000`

---

## 💻 Local Setup & Development

### 1. Backend Setup
```bash
cd Backend
npm install
npm run seed
npm run dev
```

### 2. Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```

---

## 🔐 Demo Credentials for Interview Demonstration

| Role | Email | Password | Allowed Scope |
| :--- | :--- | :--- | :--- |
| **Client Admin** | `pradeep@infotattva.com` | `securepassword` | Workspace Admin (Leads, Deals, Customers, WhatsApp, AI Settings) |
| **Team Member** | `sales@infotattva.com` | `securepassword` | Assigned Leads, Conversations, Appointments |
| **Super Admin** | `superadmin@infotattva.com` | `securepassword` | Platform-wide Tenants, Subscriptions, Audit Logs |

---

## 🎯 Recommended Interview Demo Flow

1. **Login & Dashboard**:
   - Log in as **Client Admin** (`pradeep@infotattva.com`).
   - View the Workspace Dashboard with Recharts monthly pipeline growth trends and lead channel distribution.
2. **Lead Management & Zod Validation**:
   - Navigate to **Leads CRM Workspace**.
   - Create a new lead using the React Hook Form + Zod modal.
   - Observe server-side pagination and TanStack Table UI.
3. **Execute Transactional Lead Conversion**:
   - Click **Convert** on an active lead.
   - Specify deal title, value ($25,000), probability (60%), and initial stage.
   - Submit -> Observe Mongoose transaction execute: Lead status becomes `CONVERTED`, Customer record is created, and Deal is added to the pipeline.
   - Click **Convert** again -> Observe `HTTP 409 Conflict` duplicate prevention warning.
4. **Deal Pipeline & Expected Revenue Rules**:
   - Navigate to **Deal Pipeline**.
   - Observe Kanban columns and automatic **Expected Weighted Revenue** calculation.
   - Update a deal stage to `LOST` without providing a reason -> observe Zod validation rejection.
   - Provide a valid loss reason -> stage updates and timeline log is recorded.
5. **OpenAPI / Swagger**:
   - Open `http://localhost:5000/api-docs` to demonstrate interactive API documentation.
6. **Automated Testing**:
   - Execute `npm run test` in `Backend/` to run unit & integration tests.
