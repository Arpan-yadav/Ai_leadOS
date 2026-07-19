<div align="center">

# 🚀 AI LeadOS
### AI-Powered CRM & Sales Automation Platform

> Built by **ProyoTech** — an intelligent, multi-tenant SaaS platform that automates the full sales lifecycle using Google Gemini AI, from lead capture through pipeline management to revenue analytics.

[![Sprint](https://img.shields.io/badge/Sprint-8%20Complete-success)](https://github.com/proyotech/AI_LeadOS)
[![Status](https://img.shields.io/badge/Status-Live%20in%20Production-success)](https://ai-lead-os-eight.vercel.app)
[![Stack](https://img.shields.io/badge/Stack-NestJS%20%2B%20Next.js%2014%20%2B%20Prisma%20%2B%20Gemini%20AI-blue)](https://github.com/proyotech/AI_LeadOS)
[![License](https://img.shields.io/badge/License-Apache%202.0-green)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage%20Alpine-blue)](./backend/Dockerfile)

</div>

---

## 🌍 Live Production Deployment

| Service | URL | Status |
|---------|-----|--------|
| **Frontend (Vercel)** | [https://ai-lead-os-eight.vercel.app](https://ai-lead-os-eight.vercel.app) | ✅ Live |
| **Backend API (Render)** | [https://ai-leados.onrender.com/api](https://ai-leados.onrender.com/api) | ✅ Live |
| **Swagger Docs** | [https://ai-leados.onrender.com/api/docs](https://ai-leados.onrender.com/api/docs) | ✅ Live |

> **Note:** The Render instance runs on the Free Tier — the first request after inactivity may take up to 50 seconds to warm up (cold start). Subsequent requests are instant.

---

## 🎯 What is AI LeadOS?

AI LeadOS is a **production-grade, multi-tenant CRM** for SaaS sales teams. It replaces the tedious, manual parts of sales with intelligent automation:

- **Automatic lead scoring** — every new lead gets a Gemini AI score (0–100) and ICP fit rating without any human input
- **Multi-channel outreach** — send Email, WhatsApp, and SMS directly from the CRM
- **Visual workflow automation** — design drag-and-drop sales sequences using React Flow
- **Real-time analytics** — track revenue, pipeline velocity, and conversion rates with live charts
- **Deep AI insights** — run an on-demand Gemini analysis on any lead to get opportunities, risks, and the recommended next action

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        USER (Browser)                                │
└──────────────────────┬───────────────────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼───────────────────────────────────────────────┐
│           FRONTEND — Next.js 14 on Vercel (Edge CDN)                 │
│  18 Static + Dynamic Pages | Tailwind CSS | SWR | Axios apiClient    │
│  NEXT_PUBLIC_API_URL → Render Backend                                │
└──────────────────────┬───────────────────────────────────────────────┘
                       │ JWT Bearer Tokens
┌──────────────────────▼───────────────────────────────────────────────┐
│           BACKEND — NestJS 10 on Render (Docker / Alpine)            │
│  21 Modules | Prisma ORM | JWT Auth | Helmet | ThrottlerGuard        │
│  Rate Limit: 100 req/IP/min | Global /api prefix | Swagger at /docs  │
└────────────┬──────────────────────────────────┬──────────────────────┘
             │ DATABASE_URL (pgBouncer pool)    │ External APIs
┌────────────▼──────────────┐  ┌───────────────▼────────────────────┐
│  Supabase PostgreSQL DB   │  │ Google Gemini Pro  (AI Scoring)    │
│  15 tables, Multi-tenant  │  │ Twilio             (WhatsApp/SMS)  │
│  Row-level tenant scoping │  │ Nodemailer SMTP    (Email)         │
└───────────────────────────┘  └────────────────────────────────────┘
```

---

## ✨ Features by Sprint

### Sprint 1 — Foundation
- Multi-tenant PostgreSQL schema (15 tables) designed in Prisma
- JWT authentication with bcrypt password hashing
- RBAC (Role-Based Access Control): Admin, Manager, Executive
- Login + Register pages (Next.js App Router)
- Swagger API documentation auto-generated at `/api/docs`

### Sprint 2 — Core CRM
- Leads management: CRUD, search, filter, pagination, CSV export
- Deals pipeline with 6 stages: Discovery → Proposal → Negotiation → Closing → Won → Lost
- Kanban board with `react-beautiful-dnd` drag-and-drop
- Dashboard: real-time aggregated KPIs (revenue, conversion rate, total leads)

### Sprint 3 — AI Engine
- **Google Gemini AI integration** — automatic lead scoring on creation (0–100)
- Event Bus architecture: `EventBusService` → `AutoScoreListener` → `AiService`
- Lead 360° detail page with Activity Timeline
- Task Management API (CRUD + complete/undo)

### Sprint 4 — AI Insights
- On-demand deep lead analysis: `POST /api/leads/:id/analyze`
- Gemini returns: analysis, opportunities, website audit, sentiment, next action
- AI insights stored in `AIInsight` table with full history

### Sprint 5 — Automation
- Visual Workflow Builder using React Flow (drag-and-drop nodes)
- Multi-step Sales Sequences: Email → Wait → SMS → LinkedIn
- Cron-based sequence executor (runs every hour via `@nestjs/schedule`)
- Enrollment advance/undo for manual testing and control

### Sprint 6 — Communications Hub
- **Twilio** WhatsApp & SMS delivery
- **Nodemailer SMTP** email sending
- BYOK (Bring Your Own Key) — companies connect their own API accounts
- Communication log stored per lead with delivery status tracking

### Sprint 7 — Analytics & Admin
- Analytics: Leads over time, Revenue by stage, Source breakdown (Recharts)
- Admin panel: view users, change roles, reset passwords
- Settings UI: configure SMTP, Twilio, Gemini keys per tenant
- Dark / Light theme (next-themes + CSS custom properties)

### Sprint 8 — Deployment & Support
- Docker multi-stage build (Alpine Linux, minimised image size)
- CI/CD pipeline (GitHub Actions → Render Auto-Deploy → Vercel Preview)
- Help Centre (`/help`) with FAQ accordion
- Support Ticket system: `POST /api/support/tickets`
- All hardcoded URLs replaced with `NEXT_PUBLIC_API_URL` env variable
- CORS locked to production Vercel URL

---

## 🗄️ Database Schema Overview

```
Tenant ──── User ──── Lead ──── Deal
  │           │         │         
  │           │         ├── Activity
  │           │         ├── AIInsight
  │           │         ├── Task
  │           │         ├── CommunicationLog
  │           │         ├── SequenceEnrollment ──── Sequence
  │           │         └── WorkflowExecution ──── Workflow
  │           │
  └── TenantSettings (SMTP, Twilio, Gemini keys)
```

**Enumerations:**
- `LeadStatus`: NEW | CONTACTED | QUALIFIED | UNQUALIFIED | CONVERTED
- `LeadSource`: WEBSITE | EMAIL | WHATSAPP | META_LEADS | LINKEDIN | COLD_OUTREACH | REFERRAL
- `DealStage`: DISCOVERY | PROPOSAL | NEGOTIATION | CLOSING | WON | LOST
- `SequenceStatus`: DRAFT | ACTIVE | PAUSED | COMPLETED | ARCHIVED
- `WorkflowStatus`: DRAFT | ACTIVE | PAUSED | ARCHIVED

---

## 🚀 Local Development Setup

**Prerequisites:** Node.js 20+, Docker Desktop (for local PostgreSQL)

### 1. Clone the repository
```bash
git clone https://github.com/proyotech/AI_LeadOS.git
cd AI_LeadOS
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials (DATABASE_URL, JWT_SECRET, GEMINI_API_KEY, etc.)

docker-compose up -d          # Starts local PostgreSQL container
npx prisma migrate dev        # Applies all migrations
npx prisma studio             # (Optional) Visual DB browser at localhost:5555
npm run start:dev             # API running at http://localhost:3001/api/docs
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
npm run dev                   # App running at http://localhost:3000
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (Supabase pgBouncer pool URL) |
| `DIRECT_URL` | ✅ | Direct Supabase connection (for migrations) |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens (use a 64-char random string) |
| `GEMINI_API_KEY` | ⚡ | Google Gemini API key — AI scoring disabled if missing |
| `TWILIO_ACCOUNT_SID` | 📱 | Twilio Account SID (for WhatsApp/SMS) |
| `TWILIO_AUTH_TOKEN` | 📱 | Twilio Auth Token |
| `TWILIO_WHATSAPP_FROM` | 📱 | Twilio WhatsApp sender number |
| `SMTP_HOST` | 📧 | SMTP host (e.g., smtp.gmail.com) |
| `SMTP_PORT` | 📧 | SMTP port (usually 587) |
| `SMTP_USER` | 📧 | SMTP username / email address |
| `SMTP_PASS` | 📧 | SMTP password / app password |
| `FRONTEND_URL` | 🔒 | Allowed CORS origin (set to Vercel URL in production) |
| `PORT` | ⚙️ | Server port (defaults to 3001) |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API base URL (e.g., `https://ai-leados.onrender.com/api`) |

---

## 🌐 Complete API Reference

All endpoints require `Authorization: Bearer <JWT>` unless noted.

### 🔐 Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user + tenant |
| POST | `/api/auth/login` | Authenticate and receive JWT |
| GET | `/api/auth/me` | Get current user profile |

### 👥 Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | List leads (page, limit, search, source, status) |
| POST | `/api/leads` | Create lead (triggers AI auto-scoring) |
| GET | `/api/leads/:id` | Get full lead with activities + insights |
| PATCH | `/api/leads/:id` | Update lead fields |
| DELETE | `/api/leads/:id` | Delete a lead |
| POST | `/api/leads/:id/analyze` | Run deep Gemini AI analysis |
| GET | `/api/leads/:id/insights` | Get insight history |
| GET | `/api/leads/:id/activities` | Get activity timeline |

### 💼 Deals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/deals` | List all deals |
| POST | `/api/deals` | Create a new deal |
| PATCH | `/api/deals/:id/stage` | Move deal to a new pipeline stage |
| DELETE | `/api/deals/:id` | Delete a deal |

### ✅ Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks for current user |
| POST | `/api/tasks` | Create a task (optionally linked to lead) |
| PATCH | `/api/tasks/:id/complete` | Mark as complete |
| PATCH | `/api/tasks/:id/undo` | Revert to pending |
| DELETE | `/api/tasks/:id` | Delete a task |

### 🤖 AI & Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Overall CRM KPIs |
| GET | `/api/analytics/overview` | Chart-ready analytics data |

### ✉️ Communications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/communications` | All communication logs |
| POST | `/api/communications/send` | Send Email / WhatsApp / SMS |

### 🔀 Sequences & Workflows
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sequences` | List all sequences |
| POST | `/api/sequences` | Create a sequence |
| POST | `/api/sequences/enroll` | Enroll a lead into a sequence |
| POST | `/api/sequences/enrollments/:id/advance` | Advance to next step |
| GET | `/api/workflows` | List all visual workflows |
| POST | `/api/workflows` | Save a workflow |

### 🛡️ Admin & Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users (Admin only) |
| PATCH | `/api/admin/users/:id/role` | Update user role |
| GET | `/api/settings` | Get tenant BYOK settings |
| PUT | `/api/settings` | Update SMTP, Twilio, Gemini keys |

### 🆘 Support
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/support/faqs` | List all FAQs |
| POST | `/api/support/tickets` | Submit a support ticket |

---

## 🔒 Security Features

| Feature | Implementation |
|---------|----------------|
| Password Hashing | `bcryptjs` with 10 salt rounds |
| Authentication | JWT Bearer tokens (24h expiry) |
| Role-Based Access | `@Roles()` decorator + `RolesGuard` |
| Rate Limiting | `@nestjs/throttler` — 100 req/IP/min |
| HTTP Security Headers | `helmet` middleware |
| Response Compression | `compression` middleware |
| Input Sanitization | Global `ValidationPipe` with `whitelist: true` |
| CORS Protection | Locked to `FRONTEND_URL` in production |
| Secrets Management | All API keys via environment variables (never in code) |

---

## 🗓️ Sprint Completion Status

| Sprint | Theme | Status |
|--------|-------|--------|
| Sprint 1 | Foundation, Auth, DB Schema | ✅ Complete |
| Sprint 2 | Core CRM — Leads, Deals, Dashboard | ✅ Complete |
| Sprint 3 | AI Engine — Gemini Auto-Scoring, Tasks | ✅ Complete |
| Sprint 4 | AI Insights — Deep Lead Analysis | ✅ Complete |
| Sprint 5 | Automation — Sequences, Workflow Builder | ✅ Complete |
| Sprint 6 | Communications Hub — Email, WhatsApp | ✅ Complete |
| Sprint 7 | Analytics, Admin Panel, Settings | ✅ Complete |
| Sprint 8 | Docker, CI/CD, Production Deployment | ✅ Complete |

---

## 🏭 Deployment Guide

### Backend (Render — Docker)
1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect `github.com/Arpan-yadav/Ai_leadOS` (or proyotech/AI_LeadOS)
3. Set **Runtime** to `Docker` and **Root Directory** to `backend`
4. Add all environment variables from the backend table above
5. Render will auto-detect the Dockerfile and deploy

### Frontend (Vercel)
1. Import the repository on [vercel.com](https://vercel.com)
2. Set **Framework Preset** to `Next.js`
3. Set **Root Directory** to `frontend`
4. Add `NEXT_PUBLIC_API_URL=https://ai-leados.onrender.com/api`
5. Deploy

### Automatic Deployments
Both platforms are connected to GitHub. Any `git push` to `main` triggers an automatic rebuild and zero-downtime deployment on both Vercel and Render.

---

## 👥 Team

Built with ❤️ by the **ProyoTech** internship team.

| Role | Members |
|------|---------|
| AI + Automation + DevOps | Arpan |
| Backend Engineering | Dushyant, Saransh, Ujjwal |
| Frontend Engineering | Arav, Harshwardhan |
| Product Management | Soumya |

---

## 📄 License

Licensed under the **Apache 2.0 License** — see [LICENSE](LICENSE) for details.
