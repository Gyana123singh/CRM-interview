# 🎨 Enterprise Next.js 14 App Router Frontend - CRM Management Suite

[![Live App](https://img.shields.io/badge/Live_App-crm.sjemsbamunigam.in-blueviolet?style=for-the-badge&logo=googlechrome)](https://crm.sjemsbamunigam.in/)
[![Hostinger VPS](https://img.shields.io/badge/Deployed_On-Hostinger_VPS-7232B3?style=for-the-badge&logo=hostinger)](https://crm.sjemsbamunigam.in/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14_App_Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-RTK_Query-purple?style=for-the-badge&logo=redux)](https://redux-toolkit.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

Enterprise-grade frontend web application built with **Next.js 14 App Router**, **React 19**, **Redux Toolkit & RTK Query**, **Tailwind CSS**, **TanStack DataTables**, **Recharts**, **React Hook Form**, and **Zod**. Deployed live on a **Hostinger VPS**.

---

## 🌐 Live Production Deployment (Hostinger VPS)

- **Live Web App**: [https://crm.sjemsbamunigam.in/](https://crm.sjemsbamunigam.in/)
- **Live Backend API**: `https://api.sjemsbamunigam.in/api`
- **Live Socket Server**: `https://api.sjemsbamunigam.in`

---

## 🏛️ Directory & Application Architecture

```text
Frontend/
├── src/
│   ├── app/                    # Next.js 14 App Router Pages
│   │   ├── admin/              # Client Admin Dashboard & CRM Modules
│   │   │   ├── dashboard/      # Analytics, Revenue Growth & Channel Charts
│   │   │   ├── leads/          # Leads CRM Table, Filters & Conversion Modals
│   │   │   ├── deals/          # Kanban Deal Pipeline Stage Board
│   │   │   ├── customers/      # Customer Accounts & Lifecycle History
│   │   │   ├── whatsapp/       # WhatsApp Campaigns & Template Builder
│   │   │   ├── agents/         # Sales Rep Performance & Assignment Policies
│   │   │   ├── automations/    # Workflow Automation Rules Builder
│   │   │   ├── appointments/   # Client Scheduling Calendar
│   │   │   ├── knowledge-base/ # AI Chatbot Context Repository
│   │   │   ├── subscriptions/  # Subscription Plans & Billing Invoices
│   │   │   └── audit-logs/     # Enterprise Compliance & Security Logs
│   │   ├── team/               # Sales Rep & Team Member Views
│   │   │   ├── conversations/  # Real-time Multi-channel Inbox
│   │   │   └── leads/          # Assigned Leads View
│   │   ├── embed/              # Embedded Form Engines
│   │   │   └── forms/          # Public Embeddable Website Lead Form
│   │   ├── login/              # Authentication Page
│   │   ├── layout.jsx          # Root Layout & Redux Provider Wrapper
│   │   └── page.jsx            # Landing Page & Auto-Redirect
│   ├── components/             # Reusable UI Component Library
│   │   ├── leads/              # Lead Modals (ConvertLeadModal, EditLeadModal, ScriptGeneratorModal)
│   │   ├── shared/             # Global Components (DashboardWrapper, ActivityTimelineModal, CSVImportModal)
│   │   └── ui/                 # Core Data UI (DataTable, Kanban, Metric Cards)
│   ├── store/                  # Global State Management
│   │   ├── index.js            # Redux Store Configuration
│   │   ├── slices/             # Client State Slices (authSlice, uiSlice)
│   │   └── api/                # RTK Query Services (leadsApi, dealsApi, customersApi, etc.)
│   └── utils/                  # Helper Utilities
│       ├── config.js           # Live Server & Local API Resolution Rules
│       ├── exportCsv.js        # Dynamic CSV Download Manager
│       └── socketEvents.js     # Socket.io Real-time Event Subscription Utilities
├── public/                     # Static Assets & Icons
├── tailwind.config.js          # Enterprise Dark Theme Tokens & Color Palette
└── next.config.js              # Next.js Application Settings
```

---

## ⚡ Core Client State & Caching Architecture

### 1. RTK Query Server State & Automatic Tag Invalidation
Data management uses **RTK Query** (`@reduxjs/toolkit/query/react`) for optimized server-state fetching, polling, and automatic cache invalidation:

```javascript
// Example: RTK Query Lead Invalidation Pipeline
export const leadsApi = createApi({
  reducerPath: "leadsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Leads", "Deals", "Customers", "Agents"],
  endpoints: (builder) => ({
    getLeads: builder.query({
      query: (params) => ({ url: "/leads", params }),
      providesTags: ["Leads"]
    }),
    createLead: builder.mutation({
      query: (body) => ({ url: "/leads", method: "POST", body }),
      invalidatesTags: ["Leads"]
    }),
    convertLead: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/leads/${id}/convert`, method: "POST", body }),
      invalidatesTags: ["Leads", "Deals", "Customers"]
    })
  })
});
```

### 2. Form Validation Layer (`React Hook Form` + `Zod`)
Forms use React Hook Form paired with `@hookform/resolvers/zod` for real-time client-side validation, enforcing field constraints before server dispatch.

### 3. Enterprise Data Tables (`TanStack Table v9`)
The `<DataTable />` component leverages `@tanstack/react-table` for high-performance rendering:
- Dynamic column sorting
- Multi-column filtering & search text highlight
- Client-side and server-side paginated controls
- Custom inline cell components (e.g., Status dropdown, Priority badges, Assigned Rep selectors)

---

## 🎨 Main Dashboard Features

1. **Leads CRM Workspace (`/admin/leads`)**:
   - High-density data table with quick filters for status, channel source, and priority.
   - **⚡ Ingestion Script Generator Modal**: Generates integration code snippets (JS Embed, HTML Forms, cURL, Python, Node.js) for external website lead ingestion.
   - **CSV Export & Import**: Standardized CSV file ingestion and one-click data download.
   - **Transactional Lead Conversion Modal**: Converts qualified leads into Customers and Deals atomically.
2. **Deals Pipeline Kanban (`/admin/deals`)**:
   - Stage-based Kanban column view with real-time expected revenue metrics.
   - Stage update validations enforcing mandatory loss reasons on `LOST` status transitions.
3. **Multi-Channel Inbox (`/team/conversations`)**:
   - Real-time conversation thread view supporting WhatsApp, Website Chat, and Email channels.
4. **Embeddable Ingestion Forms (`/embed/forms`)**:
   - Lightweight public form route that can be embedded into third-party sites via `<iframe>` for direct CRM lead capture.

---

## 🚀 Local Development Setup

```bash
# 1. Install Dependencies
npm install

# 2. Start Next.js Development Server
npm run dev
```

Application will run at `http://localhost:3000`.

### Environment Configuration (`.env`)
```env
# Local Development Environment URLs
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_BACKEND_URL="http://localhost:5000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:5000"

# Hostinger VPS Production Live Deployment URLs
NEXT_PUBLIC_LIVE_FRONTEND_URL="https://crm.sjemsbamunigam.in"
NEXT_PUBLIC_LIVE_API_URL="https://api.sjemsbamunigam.in/api"
NEXT_PUBLIC_LIVE_BACKEND_URL="https://api.sjemsbamunigam.in"
NEXT_PUBLIC_LIVE_SOCKET_URL="https://api.sjemsbamunigam.in"
```

---

## 📦 Build & Production Commands

```bash
# Production Build
npm run build

# Start Production Bundle
npm run start

# Code Quality & Linting
npm run lint
```
