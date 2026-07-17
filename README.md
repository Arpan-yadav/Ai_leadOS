<div align="center">
<img width="1200" height="475" alt="AI LeadOS Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# 🚀 AI LeadOS — AI-Powered CRM & Sales Automation

> An intelligent Lead Management, Sales Automation, and CRM platform powered by Google Gemini AI.

[![Sprint](https://img.shields.io/badge/Sprint-8%20Complete-success)](https://github.com/proyotech/AI_LeadOS)
[![Deployment](https://img.shields.io/badge/Status-Live%20on%20Vercel%20%26%20Render-success)](https://ai-lead-os-eight.vercel.app)
[![Stack](https://img.shields.io/badge/Stack-NestJS%20%2B%20Next.js%20%2B%20Prisma%20%2B%20Gemini-blue)](https://github.com/proyotech/AI_LeadOS)
[![License](https://img.shields.io/badge/License-Apache%202.0-green)](LICENSE)

---

## 🌍 Live Deployment (Production)

- **Frontend Application (Vercel):** [https://ai-lead-os-eight.vercel.app](https://ai-lead-os-eight.vercel.app)
- **Backend API Docs (Render):** [https://ai-leados.onrender.com/api/docs](https://ai-leados.onrender.com/api/docs)

---

## ✨ Full-Stack Features (Sprint 1 to 8)

| Module | Description |
|--------|-------------|
| 🤖 **AI Lead Scoring** | Auto-scores leads (0-100) using Gemini AI, assigning ICP fit & priorities. |
| ⚡ **Event-Driven Core** | `EventBusService` triggers automations instantly on CRM events. |
| 🎯 **Lead Management** | REST API (CRUD) for Leads with pagination, search, and dynamic filtering. |
| 💼 **Deals & Pipeline** | Kanban deals pipeline API and real-time aggregated dashboard stats. |
| ✉️ **Multi-Channel Outbox** | Twilio (WhatsApp/SMS) and Nodemailer (SMTP Email) integration. |
| 🔀 **Automation Builder** | React Flow drag-and-drop workflow sequence builder. |
| 🗄️ **Backend Engine** | NestJS + PostgreSQL + Prisma + Docker + CI/CD. |
| 🛡️ **Security** | JWT Authentication, CORS protection, and Role-Based Access Control (RBAC). |

---

## 🏗️ Architecture

```text
backend/src/
├── ai/               ← Google Gemini AI wrapper
├── automation/       ← Drag-and-drop workflow executor
├── communications/   ← Twilio & SMTP Email integrations
├── events/           ← Asynchronous EventBus pattern
├── leads/            ← Leads & Deals APIs
├── auth/             ← JWT strategies & roles
└── prisma/           ← 11-table PostgreSQL Schema

frontend/             ← Next.js 14 App Router on Vercel
```

---

## 🚀 Local Development Quick Start

**Prerequisites:** Node.js 20+, Docker (for PostgreSQL)

```bash
# 1. Clone the repository
git clone https://github.com/proyotech/AI_LeadOS.git
cd AI_LeadOS

# 2. Start Backend
cd backend
npm install
cp .env.example .env
docker-compose up -d
npx prisma migrate dev
npm run start:dev       # API: http://localhost:3001/api/docs

# 3. Start Frontend (in a new terminal)
cd ../frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
npm run dev             # UI: http://localhost:3000
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for auth tokens |
| `GEMINI_API_KEY` | Optional | Google Gemini API key (App runs in Demo mode if missing) |

---

## 🌐 API Reference (Swagger)

All endpoints are documented at `http://localhost:3001/api/docs` (local) or via the Render deployment link.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register a new user |
| `/api/auth/login` | POST | Get JWT token |
| `/api/leads` | POST | Create lead (Triggers AI Auto-Score) |
| `/api/leads` | GET | List leads (paginated, searchable) |
| `/api/leads/:id` | GET | Get full lead detail with AI insights |

---

## 🗓️ Sprint Roadmap

| Sprint | Focus | Status |
|--------|-------|--------|
| **Sprint 1** | Foundation, Auth, DB Schema, Scaffold | ✅ Done |
| **Sprint 2** | Core CRM (Leads, Deals) + AI Auto-Scoring + UI | ✅ Done |
| **Sprint 3** | Live Automation Engine, Activity Feed & Task Mgmt | ✅ Done |
| **Sprint 4** | AI Intelligence Module & Outreach Sequences | ✅ Done |
| **Sprint 5** | Automation Builder (Visual Workflow Editor) | ✅ Done |
| **Sprint 6** | Communications Hub (Email, WhatsApp, LinkedIn) | ✅ Done |
| **Sprint 7** | Analytics, Reporting & Admin Panel | ✅ Done |
| **Sprint 8** | Polish, Production Readiness & Launch | ✅ Done |

---

## 👥 Team

Built by the **ProyoTech** internship team.

- **AI + Automation:** Arpan, Soumya
- **Backend:** Dushyant, Saransh, Ujjwal
- **Frontend:** Arav, Harshwardhan

## 🚀 Deployment

The system is fully production-ready and configured for modern hosting platforms.

### Frontend (Vercel)
The Next.js 14 frontend is optimized for zero-config Vercel deployment.
1. Add the GitHub repo to Vercel.
2. Set the Framework Preset to **Next.js**.
3. Set the Root Directory to `frontend`.
4. Provide `NEXT_PUBLIC_API_URL` environment variable pointing to the backend.

### Backend (Render / Docker)
The NestJS backend includes a multi-stage Dockerfile designed for Alpine Linux.
1. Add the GitHub repo to Render as a Web Service.
2. Select **Docker** as the Runtime environment.
3. Set the Root Directory to `backend`.
4. Provide the `.env` variables required (Database, JWT, Gemini API, Twilio, SMTP).
