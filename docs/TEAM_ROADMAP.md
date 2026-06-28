# 🚀 AI LeadOS — Full Project Roadmap & Team Guide
### ProyoTech Internship 2026

> **For the team:** This document is your single source of truth for how we are building AI LeadOS as a team of 10. It covers every sprint, who owns what, how to work with Git, and what "done" means for each deliverable.

---

## 📌 Project Overview

**AI LeadOS** is a full-stack AI-powered CRM and lead management platform.

| Property | Value |
|----------|-------|
| **Total Sprints** | 8 |
| **Completed** | Sprint 1 ✅ |
| **Remaining** | Sprints 2 – 8 |
| **Team Size** | 10 members |
| **Stack** | NestJS · Next.js 14 · PostgreSQL · Prisma · Google Gemini AI |
| **Repo** | `github.com/proyotech/AI_LeadOS` |
| **Base Branch** | `main` (always production-ready) |

---

## 👥 Team Structure & Roles

Every member has a **primary role** and a **secondary responsibility**. This ensures no single point of failure.

| # | Role | Primary Focus | Secondary |
|---|------|--------------|-----------|
| **Member 1** | **Tech Lead / Scrum Master** | Sprint planning, PR reviews, architecture decisions | Backend |
| **Member 2** | **Backend Dev 1** | NestJS APIs, business logic, Prisma migrations | DevOps |
| **Member 3** | **Backend Dev 2** | NestJS modules, guards, services, unit tests | Backend |
| **Member 4** | **Frontend Dev 1** | Next.js pages, routing, state management | UI Integration |
| **Member 5** | **Frontend Dev 2** | Components, forms, API integration, auth flows | Testing |
| **Member 6** | **UI/UX Designer** | Figma designs, Tailwind tokens, component specs | Frontend |
| **Member 7** | **AI Engineer 1** | Gemini prompts, AI service layer, response parsing | Backend |
| **Member 8** | **AI Engineer 2** | Lead scoring logic, AI insights, testing AI outputs | AI |
| **Member 9** | **Automation Engineer** | Workflow engine, event bus, sequence execution | Backend |
| **Member 10** | **QA / Full-Stack** | Testing, bug fixes, documentation, cross-team support | Any |

---

## 🌿 Git Workflow (Everyone Must Follow This)

```
main                          ← protected, never push directly
└── sprint-N/feature-name     ← your working branch
```

### Branch Naming
```
sprint-2/leads-crud           ← feature branches
sprint-2/dashboard-ui
fix/lead-score-bug            ← bug fixes
docs/update-architecture      ← documentation only
```

### Commit Convention
```
feat: add lead CRUD endpoints
fix: correct null check in leads service
docs: update sprint 2 architecture
test: add unit tests for auth service
refactor: extract lead validation to guard
```

### Pull Request Rules
1. **Branch from `main`**, never from another feature branch
2. **PR title** must follow commit convention (`feat:`, `fix:`, etc.)
3. **At least 1 reviewer** must approve before merging
4. **Copilot review** is automatic — address all High/Medium comments before merging
5. **Delete your branch** after merge (GitHub does this automatically)
6. **PR description** must include: what was built, how to test it, checklist

---

## 📅 Sprint-by-Sprint Plan

---

### ✅ Sprint 1 — Foundation & Setup
**Status:** Merged to `main` | **Branch:** `sprint-1/foundation`

| Deliverable | Owner | Status |
|-------------|-------|--------|
| NestJS backend scaffold | Member 1 | ✅ Done |
| PostgreSQL + Docker Compose | Member 1 | ✅ Done |
| Prisma schema (11 models) | Member 1 | ✅ Done |
| Auth Module (register/login/me + JWT) | Member 1 | ✅ Done |
| RolesGuard + RBAC | Member 1 | ✅ Done |
| Next.js 14 frontend scaffold | Member 1 | ✅ Done |
| Login / Register pages | Member 1 | ✅ Done |
| Dashboard shell (sidebar + topbar) | Member 1 | ✅ Done |
| AI Service Layer (Gemini wrapper) | Member 1 | ✅ Done |
| Prompt Library (4 prompts) | Member 1 | ✅ Done |
| Workflow + Sequence + Event schemas | Member 1 | ✅ Done |
| Automation Engine stub | Member 1 | ✅ Done |

> Sprint 1 was bootstrapped solo to give everyone a working foundation. From Sprint 2 onwards, all 10 members contribute.

---

### 🔵 Sprint 2 — Core CRM: Leads, Deals & Dashboard Data
**Status:** 🟡 Planning  
**Goal:** Build the real CRM data layer — leads and deals CRUD, live dashboard stats, and the leads list UI.

#### Backend (Members 2 & 3)
| Task | Owner | Branch |
|------|-------|--------|
| `LeadsModule` — CRUD endpoints (`GET /leads`, `POST /leads`, `PATCH /leads/:id`, `DELETE /leads/:id`) | Member 2 | `sprint-2/leads-backend` |
| `DealsModule` — CRUD endpoints for deals with stage transitions | Member 3 | `sprint-2/deals-backend` |
| Pagination, filtering & search on `GET /leads` | Member 2 | `sprint-2/leads-backend` |
| Dashboard stats endpoint (`GET /dashboard/stats`) | Member 3 | `sprint-2/deals-backend` |
| Input validation DTOs for all endpoints | Member 2 | `sprint-2/leads-backend` |
| Swagger docs for all new endpoints | Both | Respective branches |

#### Frontend (Members 4, 5 & 6)
| Task | Owner | Branch |
|------|-------|--------|
| Leads List page (`/leads`) — data table with search/filter/sort | Member 4 | `sprint-2/leads-ui` |
| Add Lead modal — form connected to backend `POST /leads` | Member 5 | `sprint-2/leads-ui` |
| Lead detail side panel — view/edit lead info | Member 4 | `sprint-2/leads-ui` |
| Dashboard home — connect stats cards to real `GET /dashboard/stats` | Member 5 | `sprint-2/dashboard-ui` |
| Design system: colour tokens, typography, spacing in Tailwind | Member 6 | `sprint-2/design-system` |
| Reusable `DataTable`, `Modal`, `Badge` components | Member 6 | `sprint-2/design-system` |

#### AI (Members 7 & 8)
| Task | Owner | Branch |
|------|-------|--------|
| Trigger `scoreLead()` automatically on lead creation | Member 7 | `sprint-2/ai-auto-score` |
| Store AI score + reason back to `Lead.score` in DB | Member 7 | `sprint-2/ai-auto-score` |
| Display AI score badge on leads list UI | Member 8 | `sprint-2/ai-score-ui` |

#### QA (Member 10)
| Task | Owner | Branch |
|------|-------|--------|
| End-to-end test: create lead → see score in list | Member 10 | `sprint-2/qa-leads` |
| Test all filter/search/sort combinations on leads list | Member 10 | `sprint-2/qa-leads` |

---

### 🟡 Sprint 3 — Pipeline, Activity Feed & Task Management
**Status:** Upcoming  
**Goal:** Visual deal pipeline (Kanban), activity timeline per lead, and task management.

#### Backend (Members 2 & 3)
| Task | Owner |
|------|-------|
| `TasksModule` — CRUD for tasks with lead association | Member 3 |
| `ActivitiesModule` — log activity (call, email, note, WhatsApp) | Member 2 |
| Pipeline stage-change endpoint with activity auto-log | Member 2 |
| `GET /leads/:id` — full lead detail with deals, tasks, activities, AI insights | Member 3 |

#### Frontend (Members 4, 5 & 6)
| Task | Owner |
|------|-------|
| Pipeline page (`/pipeline`) — Kanban board with drag-and-drop deal cards | Member 4 |
| Deal card component with stage badge, amount, and owner avatar | Member 6 |
| Activity timeline component — chronological feed per lead | Member 5 |
| Task management sidebar — add/complete tasks on lead detail | Member 5 |
| Lead detail page (`/leads/:id`) — full 360° view | Member 4 |

#### Automation (Member 9)
| Task | Owner |
|------|-------|
| Wire `InMemoryEventBus` to fire `lead.status_changed` events on pipeline stage change | Member 9 |
| Wire `task.completed` event when a task is marked done | Member 9 |

---

### 🟠 Sprint 4 — AI Intelligence Module & Outreach Sequences
**Status:** Upcoming  
**Goal:** Real AI intelligence per lead (company audit, outreach plan) connected to the UI. Sequence builder.

#### Backend & AI (Members 2, 7 & 8)
| Task | Owner |
|------|-------|
| `AIInsightModule` — endpoint `POST /leads/:id/analyze` (calls `analyzeCompany()`) | Member 7 |
| Store AI insights to `AIInsight` DB model | Member 7 |
| `SequenceModule` — CRUD for sequences and steps | Member 2 |
| Enroll lead into sequence endpoint `POST /sequences/:id/enroll/:leadId` | Member 8 |
| `generateOutreachSequence()` — generate and persist 7-day plan per lead | Member 8 |

#### Frontend (Members 4, 5 & 6)
| Task | Owner |
|------|-------|
| AI Intelligence page (`/ai-intelligence`) — company audit UI | Member 4 |
| AI insight cards — display score, opportunities, risks, next action | Member 6 |
| Sequence builder UI — step editor with channel/delay/template fields | Member 5 |
| Sequence enrollment — select leads and enroll from the UI | Member 5 |

---

### 🔴 Sprint 5 — Automation Builder (Visual Workflow Editor)
**Status:** Upcoming  
**Goal:** Drag-and-drop visual workflow builder connected to the real execution engine.

#### Automation & Backend (Members 9 & 2)
| Task | Owner |
|------|-------|
| Persist workflows to DB via `WorkflowModule` CRUD | Member 2 |
| Real workflow executor — replace in-memory engine with DB-backed execution | Member 9 |
| Schedule cron-triggered workflows (use `@nestjs/schedule`) | Member 9 |
| `WorkflowExecutionModule` — start, pause, stop, view execution logs | Member 9 |

#### Frontend (Members 4, 5 & 6)
| Task | Owner |
|------|-------|
| Visual workflow canvas (`/automation`) using React Flow | Member 4 |
| Trigger node panel — select from 8 trigger types | Member 5 |
| Action node panel — select from 12 action types | Member 5 |
| AI Decision node — condition branching based on AI score | Member 6 |
| Workflow run history panel — execution status per workflow | Member 4 |

---

### 🟣 Sprint 6 — Communications Hub (Email, WhatsApp, LinkedIn)
**Status:** Upcoming  
**Goal:** Outbound communication channels connected to the CRM.

#### Backend (Members 2, 3 & 7)
| Task | Owner |
|------|-------|
| Email integration (Resend / Nodemailer) — send template emails from sequences | Member 3 |
| WhatsApp integration (Meta Cloud API or Twilio) — send/receive messages | Member 2 |
| LinkedIn outreach (Sales Navigator API or approved approach) | Member 7 |
| `CommunicationLog` model — store every outbound/inbound message per lead | Member 3 |
| Deliverability tracking — open/click/bounce webhook handlers | Member 2 |

#### Frontend (Members 5 & 6)
| Task | Owner |
|------|-------|
| Communications Hub page (`/communications`) — unified inbox | Member 5 |
| Conversation thread view per lead (WhatsApp-style) | Member 6 |
| Email composer with template variables | Member 5 |

---

### 🟢 Sprint 7 — Analytics, Reporting & Admin Panel
**Status:** Upcoming  
**Goal:** Data-driven insights dashboard, team performance metrics, and admin controls.

#### Backend (Members 2 & 3)
| Task | Owner |
|------|-------|
| Analytics endpoints — conversion funnel, revenue pipeline, source breakdown | Member 3 |
| Lead velocity metrics (time from NEW → CONVERTED) | Member 2 |
| Team performance endpoint — activities per executive, deals won | Member 3 |
| Admin user management (already RBAC-protected) | Member 2 |

#### Frontend (Members 4, 5 & 6)
| Task | Owner |
|------|-------|
| Analytics page (`/analytics`) — charts using Recharts or Chart.js | Member 4 |
| Conversion funnel chart, pipeline value by stage | Member 5 |
| Team leaderboard panel | Member 6 |
| Admin panel (`/admin`) — manage users, roles, team settings | Member 4 |

#### AI (Members 7 & 8)
| Task | Owner |
|------|-------|
| AI-generated weekly performance summary via Gemini | Member 7 |
| Predictive deal close probability using AI scoring history | Member 8 |

---

### 🏁 Sprint 8 — Polish, Production Readiness & Launch
**Status:** Upcoming  
**Goal:** Production deployment, security hardening, and final demo.

#### DevOps & Backend (Members 2 & 3)
| Task | Owner |
|------|-------|
| Dockerize frontend + backend into `docker-compose.prod.yml` | Member 2 |
| CI/CD pipeline (GitHub Actions) — lint, test, build on every PR | Member 3 |
| Environment secret management (Railway / Render / VPS) | Member 2 |
| Rate limiting, helmet, CORS hardening on NestJS | Member 3 |

#### Frontend (Members 4 & 6)
| Task | Owner |
|------|-------|
| Performance audit — Lighthouse score > 90 | Member 4 |
| Mobile responsiveness pass on all pages | Member 6 |
| Loading skeletons, error boundaries, toast notifications | Member 4 |

#### QA & Docs (Members 10 & 1)
| Task | Owner |
|------|-------|
| Full regression test: all user flows end-to-end | Member 10 |
| Final `README.md` with production setup guide | Member 1 |
| Record demo video of the platform | Member 10 |
| Final sprint review presentation | Member 1 |

---

## 🗓️ Sprint Timeline Overview

```
Sprint 1  ✅  Foundation & Setup                  DONE
Sprint 2  🔵  Core CRM — Leads, Deals, Dashboard  Week 2
Sprint 3  🟡  Pipeline, Activities, Tasks          Week 3
Sprint 4  🟠  AI Intelligence & Sequences          Week 4
Sprint 5  🔴  Automation Builder (Visual)          Week 5
Sprint 6  🟣  Communications Hub                  Week 6
Sprint 7  🟢  Analytics & Admin                   Week 7
Sprint 8  🏁  Polish, Deploy & Launch              Week 8
```

---

## 📋 Definition of Done (Every Sprint)

Before a branch can be merged to `main`:

- [ ] Feature is fully implemented as described in this roadmap
- [ ] Code compiles with no TypeScript errors (`npx tsc --noEmit`)
- [ ] All Swagger endpoints are documented (backend)
- [ ] No hardcoded secrets or `.env` values in code
- [ ] Copilot High/Medium-severity comments addressed
- [ ] PR description includes: what was built + how to test
- [ ] At least 1 peer review approval
- [ ] Branch deleted after merge

---

## ⚠️ Team Rules (Non-Negotiable)

1. **Never push directly to `main`** — always use a PR
2. **Always pull `main` before starting a new branch** — avoids merge conflicts
3. **Each person works on their own branch** — never share a branch
4. **Commit often, push daily** — don't sit on a week of uncommitted work
5. **Read the PR description of every merged PR** — stay aware of what changed
6. **The Prisma schema is shared** — coordinate with Member 2 before adding models
7. **If you're blocked, communicate immediately** — don't stay stuck silently

---

## 🔗 Key Resources

| Resource | Link |
|----------|------|
| GitHub Repo | `github.com/proyotech/AI_LeadOS` |
| Notion Project Board | _(see Notion link shared by Tech Lead)_ |
| Backend Swagger Docs | `http://localhost:3001/api/docs` |
| Architecture Doc | `docs/SPRINT_1_ARCHITECTURE.md` |
| PR Template | `docs/PR_Description_Sprint1.md` |
| Environment Template | `backend/.env.example` |

---

## 🚦 Quick Start for New Members (Sprint 2)

```bash
# 1. Clone the repo
git clone https://github.com/proyotech/AI_LeadOS.git
cd AI_LeadOS

# 2. Always start from main
git checkout main
git pull origin main

# 3. Create your sprint branch
git checkout -b sprint-2/your-feature-name

# 4. Backend setup
cd backend
npm install
cp .env.example .env
# Fill in: DATABASE_URL, JWT_SECRET, PGADMIN_DEFAULT_PASSWORD
docker-compose up -d
npx prisma migrate dev
npm run start:dev       # → http://localhost:3001/api/docs

# 5. Frontend setup (new terminal)
cd ../frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
npm run dev             # → http://localhost:3000

# 6. Work, commit, push
git add .
git commit -m "feat: your feature description"
git push origin sprint-2/your-feature-name

# 7. Open a Pull Request on GitHub against main
```

---

*Last updated: After Sprint 1 completion — ProyoTech Internship 2026*  
*Maintained by: Tech Lead (Member 1)*
