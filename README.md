<div align="center">
<img width="1200" height="475" alt="AI LeadOS Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# 🚀 AI LeadOS — AI-Powered CRM & Sales Automation

> An intelligent Lead Management, Sales Automation, and CRM platform powered by Google Gemini AI.

[![Sprint](https://img.shields.io/badge/Sprint-2%20Active-blue)](https://github.com/proyotech/AI_LeadOS)
[![Stack](https://img.shields.io/badge/Stack-NestJS%20%2B%20Next.js%20%2B%20Prisma%20%2B%20Gemini-blue)](https://github.com/proyotech/AI_LeadOS)
[![License](https://img.shields.io/badge/License-Apache%202.0-green)](LICENSE)

---

## ✨ Features (Sprint 1 & 2)

| Module | Description |
|--------|-------------|
| 🤖 **AI Lead Scoring** | Auto-scores leads (0-100) on creation using Gemini AI, with priority and ICP fit |
| ⚡ **Event Bus** | Typed, in-process automation event bus (`lead.created`, `lead.scored`) |
| 🎯 **Lead Management** | Full REST API (CRUD) for Leads with pagination, search, and filtering |
| 🗄️ **Backend Core** | NestJS + PostgreSQL + Prisma with JWT RBAC Auth and Swagger docs |
| 🎨 **Frontend Shell** | Next.js 14 layout, Sidebar, and Auth pages |

---

## 🏗️ Architecture

```
backend/src/
├── ai/               ← NestJS AiModule (Gemini wrapper)
├── automation/       ← AutoScore listeners and rules
├── events/           ← Typed EventBusService
├── leads/            ← Leads CRUD API
├── auth/             ← JWT + RolesGuard
└── prisma/           ← Schema with 11 core models

frontend/             ← Next.js 14 App Router
```

---

## 🚀 Quick Start

**Prerequisites:** Node.js 18+, Docker (for PostgreSQL)

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

All endpoints are documented at `http://localhost:3001/api/docs`

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
| **Sprint 2** | Core CRM (Leads, Deals) + AI Auto-Scoring | 🔵 Active |
| **Sprint 3** | Pipeline, Activity Feed & Task Management | 🟡 Upcoming |
| **Sprint 4** | AI Intelligence Module & Outreach Sequences | 🟠 Upcoming |
| **Sprint 5** | Automation Builder (Visual Workflow Editor) | 🔴 Upcoming |
| **Sprint 6** | Communications Hub (Email, WhatsApp, LinkedIn) | 🟣 Upcoming |
| **Sprint 7** | Analytics, Reporting & Admin Panel | 🟢 Upcoming |
| **Sprint 8** | Polish, Production Readiness & Launch | 🏁 Upcoming |

---

## 👥 Team

Built by the **ProyoTech** internship team.

- **AI + Automation:** Arpan, Soumya
- **Backend:** Dushyant, Saransh, Ujjwal
- **Frontend:** Arav, Harshwardhan

---

## 📄 License

Apache 2.0 — See [LICENSE](LICENSE)

---

<div align="center">
  <sub>Built with ❤️ using Google Gemini AI • ProyoTech Internship 2026</sub>
</div>
