# Sprint 2 — AI/Automation Audit & Merge Analysis

---

## ✅ Task Completion Checklist (Arpan — Sprint 2)

### From `docs/SPRINT_2_TASKS.md` — Arpan's section:

| # | Task | Status | File |
|---|------|--------|------|
| 1 | `AiService` as `@Injectable()` NestJS service | ✅ Done | `backend/src/ai/ai.service.ts` |
| 2 | `AiModule` exported for other modules | ✅ Done | `backend/src/ai/ai.module.ts` |
| 3 | `scoreLead()` called on every `POST /leads` | ✅ Done | `leads.service.ts` L50 — async call after DB save |
| 4 | AI score + reason stored to `Lead.score` in DB | ✅ Done | `leads.service.ts` L77 — `prisma.lead.update()` |
| 5 | `AIInsight` record created per lead | ✅ Done | `leads.service.ts` L83 — full `AIInsight` row |
| 6 | `lead.created` event fired on EventBus | ✅ Done | `leads.service.ts` L103 — fires with score + priority |
| 7 | `lead.scored` event fired for hot-lead alerts | ✅ Done | `leads.service.ts` L112 — fires after scoring |
| 8 | `GET /leads` returns `score` field | ✅ Done | `leads.service.ts` L146 — `score` is on `Lead` model, always returned |
| 9 | Demo mode when no `GEMINI_API_KEY` | ✅ Done | `ai.service.ts` L76 — warns and returns demo data |
| 10 | `EventBusService` (typed, in-process event bus) | ✅ Done | `backend/src/events/event-bus.service.ts` |
| 11 | `EventsModule` registered globally | ✅ Done | `@Global()` on `events.module.ts` |
| 12 | `AutoScoreListener` for priority alerts | ✅ Done | `auto-score.listener.ts` — hooks for Sprint 6 notifications |
| 13 | `AutomationModule` registered | ✅ Done | `app.module.ts` |
| 14 | Full `LeadsModule` (CRUD + DTOs + controller) | ✅ Done | Built ahead of Dushyant to unblock AI integration |
| 15 | TypeScript compiles with 0 errors | ✅ Done | `npx tsc --noEmit` — clean |

**All 15 Sprint 2 AI/Automation tasks: ✅ COMPLETE**

---

## ⚠️ Merge Conflict Analysis

### Files changed in `sprint-2/ai-automation`

```
backend/package-lock.json           ← NEW
backend/src/ai/ai.module.ts         ← NEW
backend/src/ai/ai.service.ts        ← NEW
backend/src/app.module.ts           ← MODIFIED
backend/src/automation/...          ← NEW (2 files)
backend/src/events/...              ← NEW (2 files)
backend/src/leads/...               ← NEW (6 files)
docs/TEAM_ROADMAP.md                ← MODIFIED
```

---

### 🔴 Conflict Risk with Dushyant (sprint-2/backend)

| File | Risk | Reason |
|------|------|--------|
| `backend/src/leads/` | 🔴 **HIGH** | Arpan already created the full `LeadsModule` (service, controller, module, DTOs). Dushyant's task also includes creating `LeadsModule`. If he creates it from scratch on his branch → **direct conflict on all 6 lead files**. |
| `backend/src/app.module.ts` | 🔴 **HIGH** | Arpan modified this to add 4 imports. Dushyant will also modify it to add `DealsModule` and `DashboardModule` → **merge conflict on the same lines**. |
| `backend/package-lock.json` | 🟡 **MEDIUM** | Both branches will have different lock files — auto-resolvable but requires `npm install` after merge. |
| `backend/src/deals/` | ✅ **NONE** | Only Dushyant creates this — no conflict. |
| `backend/src/dashboard/` | ✅ **NONE** | Only Dushyant creates this — no conflict. |

### ✅ No Conflict with Arav (sprint-2/frontend)

Arav works entirely in `frontend/` — **zero overlap** with Arpan's `backend/` changes.

| File area | Arav's work | Arpan's work | Conflict? |
|-----------|------------|--------------|-----------|
| `frontend/app/leads/` | ✅ Arav creates | ❌ Not touched | None |
| `frontend/components/` | ✅ Arav creates | ❌ Not touched | None |
| `backend/src/` | ❌ Not touched | ✅ Arpan creates | None |

---

## 🛠️ Conflict Resolution Strategy

> **IMPORTANT — Read before merging**

### Recommended Merge Order

```
Step 1: Merge sprint-2/ai-automation (Arpan) → main   ✅ (your PR)
Step 2: Dushyant pulls main into his branch            ← KEY STEP
Step 3: Dushyant builds ONLY DealsModule + DashboardModule
Step 4: Merge sprint-2/backend (Dushyant) → main
Step 5: Merge sprint-2/frontend (Arav) → main          (no dependencies)
```

### Instructions for Dushyant

Once Arpan's PR is merged:

```bash
# Pull the latest main (with Arpan's LeadsModule already in it)
git checkout main
git pull origin main

# Create your branch from this updated main
git checkout -b sprint-2/backend

# ✅ LeadsModule is already done by Arpan — DO NOT recreate it
# ✅ Your tasks: ONLY build DealsModule + DashboardModule

# Files to create:
# backend/src/deals/deals.module.ts
# backend/src/deals/deals.controller.ts
# backend/src/deals/deals.service.ts
# backend/src/deals/dto/create-deal.dto.ts
# backend/src/deals/dto/update-deal.dto.ts
# backend/src/dashboard/dashboard.module.ts
# backend/src/dashboard/dashboard.controller.ts
# backend/src/dashboard/dashboard.service.ts

# In app.module.ts — only ADD your 2 new modules:
# DealsModule, DashboardModule
# (EventsModule, AiModule, AutomationModule, LeadsModule already there)
```

> ⚠️ If Dushyant branches from `main` AFTER Arpan's PR merges → **zero conflicts guaranteed**.

---

## 📋 Sprint 2 — PR Description (paste into GitHub)

---

### PR Title
```
feat: Sprint 2 AI/Automation — NestJS AiService, typed EventBus, LeadsModule with AI auto-scoring
```

### PR Description

---

## 📋 Sprint 2 AI + Automation — Arpan

**Branch:** `sprint-2/ai-automation` → `main`  
**Sprint Goal contribution:** AI auto-scoring on every lead created, typed event bus for the CRM, and full Leads CRUD API.

---

### What was built

#### 🤖 AI Module — `backend/src/ai/`

**`AiService`** — Proper NestJS `@Injectable()` wrapping the Google Gemini API.

| Method | Description | Demo Fallback |
|--------|-------------|---------------|
| `scoreLead(input)` | Scores a lead 0–100 with priority + ICP fit | ✅ Source-based deterministic scores |
| `analyzeCompany(url)` | Full company intelligence audit | ✅ Rich demo analysis |
| `generateOutreachSequence()` | 7-day multi-channel outreach plan | ✅ 5 touchpoint demo sequence |
| `suggestWorkflows()` | 3 AI-recommended automations | ✅ Curated demo workflows |

- Injects `ConfigService` to read `GEMINI_API_KEY` from env
- Lazily initializes Gemini client — no crash if key is missing
- All methods return rich demo data in demo mode — **fully usable without an API key**

**`AiModule`** — exports `AiService` for consumption by `LeadsModule` and future modules.

---

#### ⚡ Events Module — `backend/src/events/`

**`EventBusService`** — Typed, in-process pub/sub event bus.

```typescript
// Fully typed — TypeScript enforces correct payload shape
eventBus.emit('lead.created', { leadId, leadName, score, priority, ... });
eventBus.on('lead.scored', (payload) => { /* handle hot lead */ });
```

| Event | Payload | Fired by |
|-------|---------|---------|
| `lead.created` | leadId, name, company, source, score, priority | `LeadsService.create()` |
| `lead.scored` | leadId, score, previousScore, reason | `LeadsService.scoreLeadAsync()` |
| `lead.status_changed` | leadId, previous/new status | Sprint 3 (Soumya) |
| `task.completed` | taskId, leadId, completedBy | Sprint 3 (Soumya) |

**`EventsModule`** is marked `@Global()` — inject `EventBusService` anywhere without re-importing.

---

#### 🔧 Automation Module — `backend/src/automation/`

**`AutoScoreListener`** — registered on `OnModuleInit`, subscribes to:
- `lead.created` → logs priority tier (🔥 hot / 📋 medium / 📁 low)
- `lead.scored` → triggers alert if score ≥ 80 (Sprint 6: Slack/WhatsApp notification hook ready)

---

#### 🗂️ Leads Module — `backend/src/leads/`

Full Leads CRUD API built ahead of schedule to unblock AI integration.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/leads` | Create lead → **AI scores automatically (async)** |
| `GET` | `/leads` | List with pagination, search, status/source filter |
| `GET` | `/leads/:id` | Full detail with AI insights, deals, tasks, activities |
| `PATCH` | `/leads/:id` | Update lead fields |
| `DELETE` | `/leads/:id` | Remove lead |

**AI auto-scoring flow on `POST /leads`:**
```
1. Lead saved to DB instantly (response returned to client)
2. scoreLead() called async (non-blocking)
3. Lead.score updated in DB
4. AIInsight record created (reason, priority, ICP fit, next action)
5. lead.created event emitted → AutoScoreListener reacts
6. lead.scored event emitted → hot-lead alert if score ≥ 80
```

**DTOs:** `CreateLeadDto`, `UpdateLeadDto` (PartialType), `LeadQueryDto` — all validated with `class-validator`, documented with `@nestjs/swagger`.

---

### Testing

#### Prerequisites
```bash
# Backend running
cd backend && npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET
docker-compose up -d
npx prisma migrate dev
npm run start:dev      # → http://localhost:3001/api/docs
```

#### Test AI auto-scoring
```bash
# 1. Login to get JWT
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
# Copy accessToken

# 2. Create a lead — score is assigned async within ~1-2s
curl -X POST http://localhost:3001/api/leads \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"James Wilson","email":"james@techcorp.com","company":"TechCorp","title":"CTO","source":"LINKEDIN"}'

# 3. GET the lead — score field will be 78 (demo) or AI-generated
curl http://localhost:3001/api/leads \
  -H "Authorization: Bearer <token>"
```

#### Verify demo mode (no GEMINI_API_KEY)
- Remove `GEMINI_API_KEY` from `.env`
- Create a lead — score defaults to source-based demo value
- Console: `WARN [AiService] GEMINI_API_KEY not set — running in demo mode`

#### Swagger
- All 5 endpoints visible at `http://localhost:3001/api/docs` under **Leads** tag
- Authorize with JWT → test directly in Swagger UI

---

### Files Changed

```
backend/src/
├── ai/
│   ├── ai.module.ts          ← NEW
│   └── ai.service.ts         ← NEW
├── automation/
│   ├── automation.module.ts  ← NEW
│   └── auto-score.listener.ts ← NEW
├── events/
│   ├── events.module.ts      ← NEW
│   └── event-bus.service.ts  ← NEW
├── leads/
│   ├── leads.module.ts       ← NEW
│   ├── leads.controller.ts   ← NEW
│   ├── leads.service.ts      ← NEW
│   └── dto/
│       ├── create-lead.dto.ts ← NEW
│       ├── update-lead.dto.ts ← NEW
│       └── lead-query.dto.ts  ← NEW
└── app.module.ts             ← MODIFIED (4 new module imports)

docs/TEAM_ROADMAP.md          ← MODIFIED (Notion link update)
```

---

### ✅ PR Checklist
- [x] All Sprint 2 AI/Automation tasks from `docs/SPRINT_2_TASKS.md` completed
- [x] TypeScript compiles with 0 errors (`npx tsc --noEmit`)
- [x] All endpoints documented in Swagger
- [x] No hardcoded secrets — `GEMINI_API_KEY` read from env via `ConfigService`
- [x] Demo mode works without API key
- [x] `lead.created` and `lead.scored` events fire correctly
- [x] AI score stored in `Lead.score` + `AIInsight` table
- [x] No `.env` files committed

**Reviewer:** Soumya  
**Merge after:** This PR should merge **before** Dushyant's `sprint-2/backend` PR — see `docs/SPRINT_2_TASKS.md` merge order.

*Sprint 2 — ProyoTech Internship 2026 · AI LeadOS*

---

## ⚠️ Note to Reviewers & Dushyant

> Arpan built the full `LeadsModule` to unblock AI integration (scoring requires the service to exist). **Dushyant should NOT recreate `src/leads/`** — instead, he should branch from `main` AFTER this PR merges and build only `DealsModule` + `DashboardModule`. This guarantees zero merge conflicts.
