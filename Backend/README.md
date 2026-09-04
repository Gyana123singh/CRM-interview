# ⚡ Multi-Tenant CRM Backend API Service

[![Live API](https://img.shields.io/badge/Live_API-api.sjemsbamunigam.in-blueviolet?style=for-the-badge&logo=googlechrome)](https://api.sjemsbamunigam.in/api-docs)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Zod](https://img.shields.io/badge/Zod-3.23-blue?style=for-the-badge&logo=zod)](https://zod.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-1.6-yellow?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI_3.0-brightgreen?style=for-the-badge&logo=swagger)](https://swagger.io/)

Production-ready Express.js & MongoDB backend service powering the Multi-Tenant CRM, B2B Lead Intelligence, and WhatsApp Marketing Suite. Deployed on **Hostinger VPS** with Nginx reverse proxy and SSL encryption.

---

## 🌐 Live Production API Server (Hostinger VPS)

- **Backend Base URL**: `https://api.sjemsbamunigam.in/api`
- **Interactive Swagger UI**: [https://api.sjemsbamunigam.in/api-docs](https://api.sjemsbamunigam.in/api-docs)
- **OpenAPI JSON Spec**: `https://api.sjemsbamunigam.in/api-docs.json`
- **Socket.io / SSE Server**: `https://api.sjemsbamunigam.in`

---

## 🏗️ Technical Architecture & Key Modules

```text
Backend/
├── src/
│   ├── config/             # DB Connection, Swagger/OpenAPI Configuration
│   │   ├── db.js           # Mongoose MongoDB Connection Setup
│   │   └── swagger.js      # Swagger OpenAPI 3.0 JSDoc Spec
│   ├── controllers/        # Domain Controllers & Business Rules
│   │   ├── authController.js       # User Login, Token Refresh, Role Validation
│   │   ├── leadsController.js      # Lead CRUD, Status, Priority & Conversion
│   │   ├── dealsController.js      # Deal Pipeline, Stage Transitions, Loss Reasons
│   │   ├── customersController.js  # Customer Account & Contract Management
│   │   ├── agentsController.js     # Agent Profiles & Performance Tracking
│   │   ├── dashboardController.js  # Executive Dashboard Metrics & Revenue Stats
│   │   ├── whatsappController.js   # WhatsApp Marketing Campaigns & Webhooks
│   │   └── conversationsController.js # Realtime Messaging & Thread Routing
│   ├── middlewares/        # Express Middlewares
│   │   ├── authMiddleware.js      # JWT Authentication & Multi-Tenant Scope
│   │   ├── validateRequest.js     # Zod Request Body/Params Schema Enforcement
│   │   ├── errorHandler.js        # Centralized HTTP Error Handling
│   │   └── rbacMiddleware.js      # Role-Based Access Control Guards
│   ├── models/             # Mongoose Schemas & Database Collections
│   │   ├── Company.js             # Tenant Workspace Isolation Boundary
│   │   ├── User.js                # System Accounts & Password Hashes
│   │   ├── AgentProfile.js        # Sales Rep Statistics & Specialization
│   │   ├── Lead.js                # Inbound Leads Pipeline Data
│   │   ├── Customer.js            # Converted Customer Accounts
│   │   ├── Deal.js                # Pipeline Opportunities & Revenue Stages
│   │   ├── Activity.js            # Lead/Deal Timeline Events
│   │   ├── ChatThread.js          # Channel Conversation Threads
│   │   ├── Message.js             # Individual Messages
│   │   ├── AutomationRule.js      # Automated Trigger & Workflow Rules
│   │   ├── Appointment.js         # Scheduled Appointments & Viewing Sessions
│   │   ├── KnowledgeBase.js       # AI Chatbot Knowledge Context
│   │   ├── Subscription.js        # Tenant Plan & Billing Records
│   │   ├── Invoice.js             # Tenant Invoices & Payment Logs
│   │   └── AuditLog.js            # System Compliance & Audit History
│   ├── routes/             # Express API Routers
│   ├── utils/              # Mappers, Helpers, Loggers & Enums
│   ├── index.js            # Express Server App & Socket.io Initializer
│   └── seed.js             # Full Seed Data Generator
├── tests/                  # Integration & Unit Tests (Vitest + Supertest)
│   ├── auth.test.js        # JWT Security Tests
│   ├── leads.test.js       # Lead Ingestion & Conversion Transaction Tests
│   └── deals.test.js       # Deal Probability & Stage Rule Tests
└── package.json            # Scripts & Dependency Manifest
```

---

## 🔑 Key Engineering Patterns Implemented

### 1. Atomic Mongoose Session Transactions
Lead conversion (`POST /api/leads/:id/convert`) executes inside a managed Mongoose session transaction (`mongoose.startSession()`):
```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
  // 1. Verify Lead Status
  // 2. Create Customer Document
  // 3. Create Opportunity Deal Document
  // 4. Update Lead Status to 'Converted'
  // 5. Create Activity & Audit Log entries
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### 2. Multi-Tenant Query Scoping
Security middleware automatically attaches the authenticated user's `companyId` to `req.user`. Controllers append `companyId` to all database filters:
```javascript
const leads = await Lead.find({ companyId: req.user.companyId, ...filters });
```

### 3. Zod Request Schema Enforcement
Routes pass request payloads through the `validateRequest` middleware using Zod validation schemas to reject invalid inputs prior to controller execution:
```javascript
export const validateRequest = (schema) => (req, res, next) => {
  try {
    schema.parse({ body: req.body, query: req.query, params: req.params });
    next();
  } catch (err) {
    return res.status(400).json({ error: err.errors });
  }
};
```

---

## 🌐 OpenAPI / Swagger Interactive Documentation

When running locally or inspecting the live VPS deployment:

- **Live Hostinger VPS Swagger UI**: [https://api.sjemsbamunigam.in/api-docs](https://api.sjemsbamunigam.in/api-docs)
- **Local Swagger UI**: `http://localhost:5000/api-docs`

### Supported Route Modules:
- `POST /api/auth/login` - Authenticate User & Receive JWT Bearer Token
- `GET /api/leads` - List Leads (supports `page`, `limit`, `status`, `source`, `priority`, `search`)
- `POST /api/leads` - Ingest New Lead
- `POST /api/leads/:id/convert` - Transactionally convert Lead to Customer & Deal
- `GET /api/deals` - Fetch Deal Pipeline Opportunities
- `PATCH /api/deals/:id/stage` - Update Deal Pipeline Stage
- `GET /api/customers` - Fetch Tenant Customer Accounts
- `GET /api/agents` - Fetch Active Sales Rep Profiles & Performance Indicators

---

## 🧪 Running Automated Tests

Tests are written using **Vitest** and **Supertest**.

```bash
cd Backend
npm run test
```

### Key Verified Specifications:
- **Authentication**: Unauthorized access without a valid JWT returns `401 Unauthorized`.
- **Validation**: Attempting to set a Deal stage to `LOST` without a `lossReason` returns `422 Unprocessable Entity`.
- **Conflict Prevention**: Re-converting an already-converted lead returns `409 Conflict`.
- **Revenue Calculation**: Expected revenue strictly matches `(dealValue * probability) / 100`.

---

## 🚀 Running Locally

```bash
# 1. Install Dependencies
npm install

# 2. Seed Database
npm run seed

# 3. Start Development Server (with nodemon hot reloading)
npm run dev
```

Server will start on `http://localhost:5000`.
