# 🚀 AI LeadOS — Full Project Roadmap & Team Guide
### ProyoTech Internship 2026

> **For the team:** This document is your single source of truth for how we are building AI LeadOS. It covers every sprint, who is active when, how to work with Git, and what "done" means for each deliverable.

---

## 📌 Project Overview

| Property | Value |
|----------|-------|
| **Total Sprints** | 8 |
| **Completed** | Sprint 1 ✅ |
| **Remaining** | Sprints 2 – 8 |
| **Team Size** | 8 members |
| **Stack** | NestJS · Next.js 14 · PostgreSQL · Prisma · Google Gemini AI |
| **Repo** | `github.com/proyotech/AI_LeadOS` |
| **Base Branch** | `main` (always production-ready) |

---

## 👥 Team Structure & Roles

| Name | Team | Role |
|------|------|------|
| **Arpan** | AI + Automation | Tech Lead · AI Engineer · Automation Engineer |
| **Soumya** | AI + Automation | AI Engineer · Automation Engineer |
| **Dushyant** | Backend | Backend Developer |
| **Saransh** | Backend | Backend Developer |
| **Ujjwal** | Backend | Backend Developer |
| **Arav** | Frontend | Frontend Developer |
| **Harshwardhan** | Frontend | Frontend Developer |

---

## 🔄 Sprint Rotation Strategy

To keep the codebase conflict-free, **only one member per team is active in each sprint**. The inactive member reviews PRs, studies the codebase, and prepares for their upcoming sprint.

| Sprint | Backend (rotates: D → S → U → D…) | Frontend (rotates: Arav → Harsh → …) | AI + Automation (rotates: Arpan → Soumya → …) |
|--------|------------------------------------|---------------------------------------|------------------------------------------------|
| Sprint 1 ✅ | — *(Arpan solo bootstrap)* | — | **Arpan** |
| Sprint 2 🔵 | **Dushyant** | **Arav** | **Arpan** |
| Sprint 3 🟡 | **Saransh** | **Harshwardhan** | **Soumya** |
| Sprint 4 🟠 | **Ujjwal** | **Arav** | **Arpan** |
| Sprint 5 🔴 | **Dushyant** | **Harshwardhan** | **Soumya** |
| Sprint 6 🟣 | **Saransh** | **Arav** | **Arpan** |
| Sprint 7 🟢 | **Ujjwal** | **Harshwardhan** | **Soumya** |
| Sprint 8 🏁 | **Dushyant** | **Arav** | **Arpan** |

> **Inactive members:** Review the active member's PR, read the new code, and use the sprint to prepare questions, set up your local dev environment, and study the relevant docs.

---

## 🌿 Git Workflow (Everyone Must Follow This)

```
main                          ← protected, never push directly
└── sprint-N/feature-name     ← your working branch
```

### Branch Naming
```
sprint-2/leads-backend        ← backend feature
sprint-2/leads-ui             ← frontend feature
sprint-2/ai-auto-score        ← AI feature
fix/lead-score-bug            ← bug fix
docs/update-roadmap           ← documentation only
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
3. **At least 1 reviewer must approve** before merging (the inactive team member reviews)
4. **Copilot review is automatic** — address all High/Medium comments before merging
5. **Delete your branch** after merge
6. **PR description must include:** what was built, how to test it, checklist

---

## 📅 Sprint-by-Sprint Plan

---

### ✅ Sprint 1 — Foundation & Setup
**Status:** Merged to `main`  
**Active:** Arpan (solo bootstrap)

| Deliverable | Status |
|-------------|--------|
| NestJS backend scaffold + PostgreSQL Docker | ✅ Done |
| Prisma schema — 11 models | ✅ Done |
| Auth Module (register / login / me + JWT) | ✅ Done |
| RolesGuard + RBAC | ✅ Done |
| Next.js 14 frontend scaffold | ✅ Done |
| Login / Register pages | ✅ Done |
| Dashboard shell (sidebar + topbar) | ✅ Done |
| AI Service Layer (Gemini wrapper + 4 prompts) | ✅ Done |
| Workflow + Sequence + Event schemas | ✅ Done |
| Automation Engine stub | ✅ Done |

---

### 🔵 Sprint 2 — Core CRM: Leads, Deals & Dashboard Data
**Status:** 🟡 Active  
**Goal:** Real CRM data layer — leads & deals CRUD, live dashboard stats, AI auto-scoring.

| Team | Active Member | Branch |
|------|--------------|--------|
| Backend | **Dushyant** | `sprint-2/backend` |
| Frontend | **Arav** | `sprint-2/frontend` |
| AI + Automation | **Arpan** | `sprint-2/ai-automation` |

#### Dushyant — Backend (`sprint-2/backend`)
| Task |
|------|
| `LeadsModule` — `GET /leads`, `POST /leads`, `PATCH /leads/:id`, `DELETE /leads/:id` |
| `DealsModule` — CRUD with stage transitions |
| Pagination, filtering & search on `GET /leads` |
| `GET /dashboard/stats` — total leads, deals, conversion rate |
| Input validation DTOs for all new endpoints |
| Swagger docs for all new endpoints |

#### Arav — Frontend (`sprint-2/frontend`)
| Task |
|------|
| Leads List page (`/leads`) — data table with search / filter / sort |
| Add Lead modal — form connected to `POST /leads` |
| Lead detail side panel — view / edit lead info |
| Dashboard home — connect stats cards to real `GET /dashboard/stats` |
| Reusable `DataTable`, `Modal`, `Badge` components |
| Design refinements — Tailwind colour tokens & typography |

#### Arpan — AI + Automation (`sprint-2/ai-automation`)
| Task |
|------|
| Trigger `scoreLead()` automatically on `POST /leads` creation |
| Store AI score + reasoning back to `Lead.score` in DB |
| Display AI score badge on leads list UI |
| Wire up `InMemoryEventBus` to fire `lead.created` event |

---

### 🟡 Sprint 3 — Pipeline, Activity Feed & Task Management
**Status:** Upcoming  
**Goal:** Kanban pipeline, per-lead activity timeline, task management.

| Team | Active Member | Branch |
|------|--------------|--------|
| Backend | **Saransh** | `sprint-3/backend` |
| Frontend | **Harshwardhan** | `sprint-3/frontend` |
| AI + Automation | **Soumya** | `sprint-3/ai-automation` |

#### Saransh — Backend
| Task |
|------|
| `TasksModule` — CRUD for tasks with lead association |
| `ActivitiesModule` — log activity (call, email, note, WhatsApp) |
| Pipeline stage-change endpoint with activity auto-log |
| `GET /leads/:id` — full lead detail with deals, tasks, activities, AI insights |

#### Harshwardhan — Frontend
| Task |
|------|
| Pipeline page (`/pipeline`) — Kanban board with drag-and-drop deal cards |
| Deal card component — stage badge, amount, owner avatar |
| Activity timeline component — chronological feed per lead |
| Task management sidebar — add/complete tasks on lead detail |
| Lead detail page (`/leads/:id`) — full 360° view |

#### Soumya — AI + Automation
| Task |
|------|
| Wire `InMemoryEventBus` → `lead.status_changed` on pipeline stage change |
| Wire `task.completed` event when task is marked done |
| Auto-trigger `scoreLead()` on status change (re-score as lead progresses) |

---

### 🟠 Sprint 4 — AI Intelligence Module & Outreach Sequences
**Status:** Upcoming  
**Goal:** Real per-lead AI analysis (company audit), outreach sequence builder.

| Team | Active Member | Branch |
|------|--------------|--------|
| Backend | **Ujjwal** | `sprint-4/backend` |
| Frontend | **Arav** | `sprint-4/frontend` |
| AI + Automation | **Arpan** | `sprint-4/ai-automation` |

#### Ujjwal — Backend
| Task |
|------|
| `SequenceModule` — CRUD for sequences and steps |
| Enroll lead endpoint — `POST /sequences/:id/enroll/:leadId` |
| `AIInsightModule` — `POST /leads/:id/analyze` endpoint |
| Store AI insights to `AIInsight` DB model |

#### Arav — Frontend
| Task |
|------|
| AI Intelligence page (`/ai-intelligence`) — company audit UI |
| AI insight cards — score, opportunities, risks, next action |
| Sequence builder UI — step editor with channel/delay/template fields |
| Sequence enrollment — select leads and enroll from the UI |

#### Arpan — AI + Automation
| Task |
|------|
| `analyzeCompany()` — wire to `POST /leads/:id/analyze` endpoint |
| `generateOutreachSequence()` — generate and persist 7-day plan per lead |
| Persist generated sequence steps to DB via `SequenceModule` |

---

### 🔴 Sprint 5 — Automation Builder (Visual Workflow Editor)
**Status:** Upcoming  
**Goal:** Drag-and-drop visual workflow builder with real DB-backed execution engine.

| Team | Active Member | Branch |
|------|--------------|--------|
| Backend | **Dushyant** | `sprint-5/backend` |
| Frontend | **Harshwardhan** | `sprint-5/frontend` |
| AI + Automation | **Soumya** | `sprint-5/ai-automation` |

#### Dushyant — Backend
| Task |
|------|
| `WorkflowModule` — CRUD for workflows (persist definition to DB) |
| `WorkflowExecutionModule` — start, pause, stop, view logs |
| Schedule cron-triggered workflows (`@nestjs/schedule`) |

#### Harshwardhan — Frontend
| Task |
|------|
| Visual workflow canvas (`/automation`) — React Flow integration |
| Trigger node panel — 8 trigger types |
| Action node panel — 12 action types |
| AI Decision node — branching on AI score |
| Workflow run history panel |

#### Soumya — AI + Automation
| Task |
|------|
| Replace in-memory engine with DB-backed workflow executor |
| Integrate `suggestWorkflows()` to recommend automations to users |
| Per-node execution result tracking and logging |

---

### 🟣 Sprint 6 — Communications Hub (Email, WhatsApp, LinkedIn)
**Status:** Upcoming  
**Goal:** Outbound communication channels connected to the CRM.

| Team | Active Member | Branch |
|------|--------------|--------|
| Backend | **Saransh** | `sprint-6/backend` |
| Frontend | **Arav** | `sprint-6/frontend` |
| AI + Automation | **Arpan** | `sprint-6/ai-automation` |

#### Saransh — Backend
| Task |
|------|
| Email integration (Resend / Nodemailer) — send template emails from sequences |
| WhatsApp integration (Meta Cloud API or Twilio) |
| `CommunicationLog` model — store every outbound/inbound message per lead |
| Deliverability tracking — open/click/bounce webhook handlers |

#### Arav — Frontend
| Task |
|------|
| Communications Hub page (`/communications`) — unified inbox |
| Conversation thread view per lead (WhatsApp-style) |
| Email composer with template variables |

#### Arpan — AI + Automation
| Task |
|------|
| AI-personalised message generation — use Gemini to write outreach copy |
| Auto-enroll leads in sequences based on communication triggers |
| Smart send-time optimisation prompt |

---

### 🟢 Sprint 7 — Analytics, Reporting & Admin Panel
**Status:** Upcoming  
**Goal:** Charts dashboard, team performance metrics, admin user management.

| Team | Active Member | Branch |
|------|--------------|--------|
| Backend | **Ujjwal** | `sprint-7/backend` |
| Frontend | **Harshwardhan** | `sprint-7/frontend` |
| AI + Automation | **Soumya** | `sprint-7/ai-automation` |

#### Ujjwal — Backend
| Task |
|------|
| Analytics endpoints — conversion funnel, revenue pipeline, source breakdown |
| Lead velocity metrics (time from NEW → CONVERTED) |
| Team performance endpoint — activities per executive, deals won |
| Admin user management endpoints |

#### Harshwardhan — Frontend
| Task |
|------|
| Analytics page (`/analytics`) — Recharts / Chart.js |
| Conversion funnel chart + pipeline value by stage |
| Team leaderboard panel |
| Admin panel (`/admin`) — manage users, roles, settings |

#### Soumya — AI + Automation
| Task |
|------|
| AI weekly performance summary — Gemini-generated report |
| Predictive deal close probability using AI scoring history |
| Anomaly detection — flag leads with no activity in X days |

---

### 🏁 Sprint 8 — Polish, Production Readiness & Launch
**Status:** Upcoming  
**Goal:** Deployment, security hardening, final demo.

| Team | Active Member | Branch |
|------|--------------|--------|
| Backend | **Dushyant** | `sprint-8/backend` |
| Frontend | **Arav** | `sprint-8/frontend` |
| AI + Automation | **Arpan** | `sprint-8/ai-automation` |

#### Dushyant — Backend + DevOps
| Task |
|------|
| `docker-compose.prod.yml` — production-ready multi-container setup |
| CI/CD pipeline (GitHub Actions) — lint, build, test on every PR |
| Environment secret management (Railway / Render / VPS) |
| Rate limiting, helmet, CORS hardening |

#### Arav — Frontend
| Task |
|------|
| Performance audit — Lighthouse score > 90 |
| Mobile responsiveness pass on all pages |
| Loading skeletons, error boundaries, toast notifications |

#### Arpan — AI + Automation + Final Docs
| Task |
|------|
| Final AI prompt review — accuracy, latency, token cost |
| Full regression test: all AI + automation user flows |
| Final `README.md` production setup guide |
| Record demo video of the platform |
| Sprint 8 review presentation |

---

## 🗓️ Sprint Timeline Overview

```
Sprint 1  ✅  Foundation & Setup                  DONE
Sprint 2  🔵  Core CRM — Leads, Deals, Dashboard  Week 2   → Dushyant / Arav / Arpan
Sprint 3  🟡  Pipeline, Activities, Tasks          Week 3   → Saransh / Harshwardhan / Soumya
Sprint 4  🟠  AI Intelligence & Sequences          Week 4   → Ujjwal / Arav / Arpan
Sprint 5  🔴  Automation Builder (Visual)          Week 5   → Dushyant / Harshwardhan / Soumya
Sprint 6  🟣  Communications Hub                  Week 6   → Saransh / Arav / Arpan
Sprint 7  🟢  Analytics & Admin                   Week 7   → Ujjwal / Harshwardhan / Soumya
Sprint 8  🏁  Polish, Deploy & Launch              Week 8   → Dushyant / Arav / Arpan
```

---

## 📋 Definition of Done (Every Sprint)

Before any branch is merged to `main`:

- [ ] Feature fully implemented as described in this roadmap
- [ ] TypeScript compiles with no errors (`npx tsc --noEmit`)
- [ ] Swagger docs updated for all backend endpoints
- [ ] No hardcoded secrets or `.env` values in code
- [ ] Copilot High/Medium severity comments addressed
- [ ] PR description: what was built + how to test
- [ ] At least 1 peer review approval
- [ ] Branch deleted after merge

---

## ⚠️ Team Rules (Non-Negotiable)

1. **Never push directly to `main`** — always open a PR
2. **Always `git pull origin main`** before creating your branch
3. **One person per branch** — never share a working branch
4. **Commit and push daily** — don't sit on uncommitted work
5. **Read every merged PR description** — know what changed
6. **Prisma schema is shared** — coordinate with the active backend dev before touching it
7. **If you're stuck, speak up immediately** — don't stay blocked silently
8. **Inactive sprint? Still review PRs and study the new code** — stay sharp

---

## 🔗 Key Resources

| Resource | Link |
|----------|------|
| GitHub Repo | `github.com/proyotech/AI_LeadOS` |
| Notion Board | _(link shared by mentor)_|
| Swagger API Docs | `http://localhost:3001/api/docs` |
| Architecture Doc | `docs/SPRINT_1_ARCHITECTURE.md` |
| PR Template | `docs/PR_Description_Sprint1.md` |
| Sprint 2 Task Sheet | `docs/SPRINT_2_TASKS.md` |
| Env Template | `backend/.env.example` |

---

## 🚦 Quick Start for Every Member

```bash
# 1. Clone the repo (first time only)
git clone https://github.com/proyotech/AI_LeadOS.git
cd AI_LeadOS

# 2. Always start from latest main
git checkout main
git pull origin main

# 3. Create your sprint branch (use the name from your task sheet)
git checkout -b sprint-2/backend        # example

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

# 6. Commit and push your work
git add .
git commit -m "feat: your feature description"
git push origin sprint-2/backend

# 7. Open a Pull Request on GitHub → base: main
```

---

*Last updated: Sprint 2 planning — ProyoTech Internship 2026*
*Maintained by: Arpan (Tech Lead)*
