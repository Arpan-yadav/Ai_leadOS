# 📋 Sprint 2 — Task Assignment Sheet
### AI LeadOS · ProyoTech Internship 2026

> **Send this file directly to your Sprint 2 active members.** Each person's section is self-contained — they only need to read their own block.

**Sprint Goal:** Build the real CRM data layer — Leads & Deals CRUD, live dashboard stats, and AI auto-scoring on lead creation.

---

## 🗓️ Sprint 2 Active Members

| Team | Active This Sprint | Reviewer (inactive) |
|------|--------------------|---------------------|
| **Backend** | **Dushyant** | Saransh, Ujjwal |
| **Frontend** | **Arav** | Harshwardhan |
| **AI + Automation** | **Arpan** | Soumya |

---

---

## 🟦 DUSHYANT — Backend

**Branch:** `sprint-2/backend`  
**Base:** `main`  
**Reviewers:** Saransh, Ujjwal

### Setup
```bash
git checkout main
git pull origin main
git checkout -b sprint-2/backend

cd backend
npm install
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, PGADMIN_DEFAULT_PASSWORD in .env
docker-compose up -d
npx prisma migrate dev
npm run start:dev
# → Swagger: http://localhost:3001/api/docs
```

### Your Tasks

#### 1. Leads Module — `backend/src/leads/`
Create the full module: controller, service, module file, and DTOs.

**Endpoints to build:**
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/leads` | List all leads (with pagination, filter by status/source, search by name/email/company) |
| `POST` | `/leads` | Create a new lead |
| `GET` | `/leads/:id` | Get single lead by ID |
| `PATCH` | `/leads/:id` | Update a lead |
| `DELETE` | `/leads/:id` | Delete a lead |

**DTOs to create:**
- `CreateLeadDto` — name (required), email (required), company (required), title?, phone?, website?, linkedin?, source?, status?
- `UpdateLeadDto` — all fields optional (extend `PartialType(CreateLeadDto)`)
- `LeadQueryDto` — page?, limit?, search?, status?, source?

**Pagination response shape:**
```json
{
  "data": [...],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

All endpoints must be **JWT protected** (`@UseGuards(JwtAuthGuard)`) and **Swagger documented** (`@ApiTags`, `@ApiOperation`, `@ApiBearerAuth`).

#### 2. Deals Module — `backend/src/deals/`
Create the full module: controller, service, module file, and DTOs.

**Endpoints to build:**
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/deals` | List all deals |
| `POST` | `/deals` | Create a deal (requires leadId) |
| `PATCH` | `/deals/:id` | Update deal — including stage transitions |
| `DELETE` | `/deals/:id` | Delete a deal |

**DTOs:**
- `CreateDealDto` — title (required), amount (required), stage?, leadId (required), expectedCloseDate?
- `UpdateDealDto` — all optional

#### 3. Dashboard Stats Endpoint — add to a new `DashboardModule`

**Endpoint:** `GET /dashboard/stats`

**Response shape:**
```json
{
  "totalLeads": 87,
  "newLeadsThisWeek": 12,
  "totalDeals": 23,
  "pipelineValue": 145000,
  "conversionRate": 18.5,
  "leadsByStatus": {
    "NEW": 30, "CONTACTED": 20, "QUALIFIED": 25, "CONVERTED": 12
  },
  "dealsByStage": {
    "DISCOVERY": 5, "PROPOSAL": 8, "NEGOTIATION": 4, "WON": 6
  }
}
```

#### 4. Files to Create
```
backend/src/
├── leads/
│   ├── leads.module.ts
│   ├── leads.controller.ts
│   ├── leads.service.ts
│   └── dto/
│       ├── create-lead.dto.ts
│       ├── update-lead.dto.ts
│       └── lead-query.dto.ts
├── deals/
│   ├── deals.module.ts
│   ├── deals.controller.ts
│   ├── deals.service.ts
│   └── dto/
│       ├── create-deal.dto.ts
│       └── update-deal.dto.ts
└── dashboard/
    ├── dashboard.module.ts
    ├── dashboard.controller.ts
    └── dashboard.service.ts
```

Register all new modules in `app.module.ts`.

### PR Checklist
- [ ] All 5 leads endpoints working and Swagger-documented
- [ ] All 4 deals endpoints working and Swagger-documented
- [ ] `GET /dashboard/stats` returns real DB counts
- [ ] All endpoints JWT protected
- [ ] DTOs validated with `class-validator` decorators
- [ ] No hardcoded values, no `.env` content in code
- [ ] TypeScript compiles: `npx tsc --noEmit`

### How to Submit
```bash
git add .
git commit -m "feat: add leads, deals, and dashboard modules with CRUD and stats endpoints"
git push origin sprint-2/backend
# Open PR on GitHub → base: main
# Title: feat: Sprint 2 backend — leads, deals & dashboard stats API
# Request review from: Saransh, Ujjwal
```

---

---

## 🟩 ARAV — Frontend

**Branch:** `sprint-2/frontend`  
**Base:** `main`  
**Reviewer:** Harshwardhan

### Setup
```bash
git checkout main
git pull origin main
git checkout -b sprint-2/frontend

cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
npm run dev
# → http://localhost:3000
```

> Note: While Dushyant builds the backend, use mock data for your UI first. Once backend is merged to `main`, switch to live API calls.

### Your Tasks

#### 1. Leads List Page — `frontend/app/leads/page.tsx`
Build the main leads management page at `/leads`.

**Features:**
- Data table showing: Name, Company, Email, Status (badge), AI Score (badge), Source, Created date
- Search bar — filter by name / email / company
- Status filter dropdown — NEW, CONTACTED, QUALIFIED, UNQUALIFIED, CONVERTED
- Sort by columns (name, score, date)
- Pagination — show 20 per page with next/prev controls
- "Add Lead" button — opens the Add Lead modal
- Row click → opens lead detail side panel

**API call:** `GET /leads?page=1&limit=20&search=...&status=...`

#### 2. Add Lead Modal — reusable component
Build a `<AddLeadModal>` component.

**Form fields:**
- Name * (required)
- Email * (required, validated)
- Company * (required)
- Title (optional)
- Phone (optional)
- Source (dropdown: WHATSAPP, EMAIL, META_LEADS, LINKEDIN, WEBSITE, COLD_OUTREACH, REFERRAL)

**Behaviour:**
- React Hook Form + Zod validation
- On submit → `POST /leads` → close modal → refresh leads table
- Show inline validation errors
- Loading state on submit button

#### 3. Lead Detail Side Panel
A slide-in panel on the right when a lead row is clicked.

**Shows:**
- Lead name, company, title, email, phone
- Status badge (editable dropdown)
- AI Score badge (colour-coded: green ≥ 70, amber 40–69, red < 40)
- Source chip
- "Edit" button → inline edit mode
- Created / updated timestamps

#### 4. Dashboard Home — connect to live stats
Update `frontend/app/dashboard/page.tsx` to fetch from `GET /dashboard/stats`.

**Replace hardcoded numbers with real API data:**
- Total Leads card
- New This Week card
- Pipeline Value card
- Conversion Rate card

Show a loading skeleton while data is fetching.

#### 5. Reusable Components to Build
These go in `frontend/components/ui/`:

| Component | Description |
|-----------|-------------|
| `DataTable` | Generic sortable table — accepts columns config + data array |
| `StatusBadge` | Colour-coded badge for LeadStatus values |
| `ScoreBadge` | Colour-coded badge for AI score (red / amber / green) |
| `SearchBar` | Debounced search input |
| `Pagination` | Prev / Next with page count |
| `Skeleton` | Loading placeholder block |

#### 6. Files to Create / Update
```
frontend/app/
├── leads/
│   └── page.tsx              ← Leads List page
└── dashboard/
    └── page.tsx              ← Update to use live stats

frontend/components/
├── leads/
│   ├── AddLeadModal.tsx
│   └── LeadDetailPanel.tsx
└── ui/
    ├── DataTable.tsx
    ├── StatusBadge.tsx
    ├── ScoreBadge.tsx
    ├── SearchBar.tsx
    ├── Pagination.tsx
    └── Skeleton.tsx
```

### PR Checklist
- [ ] `/leads` page shows data table with search, filter, sort, pagination
- [ ] Add Lead modal creates a lead via API + refreshes table
- [ ] Lead detail side panel shows full lead info
- [ ] Dashboard stats cards load from real API
- [ ] All reusable components in `components/ui/`
- [ ] No TypeScript errors
- [ ] Responsive — works on tablet width

### How to Submit
```bash
git add .
git commit -m "feat: Sprint 2 frontend — leads list, add lead modal, dashboard live stats"
git push origin sprint-2/frontend
# Open PR on GitHub → base: main
# Title: feat: Sprint 2 frontend — leads list page, modal & live dashboard
# Request review from: Harshwardhan
```

---

---

## 🟥 ARPAN — AI + Automation

**Branch:** `sprint-2/ai-automation`  
**Base:** `main`  
**Reviewer:** Soumya

### Setup
```bash
git checkout main
git pull origin main
git checkout -b sprint-2/ai-automation

cd backend
npm install
npm run start:dev
```

### Your Tasks

> Coordinate with Dushyant — your AI scoring hooks into the `LeadsService`. Once his `sprint-2/backend` branch is merged to `main`, pull `main` into your branch and wire up the integration.

#### 1. Auto-Score Leads on Creation

**Where:** `backend/src/leads/leads.service.ts` (in the `create()` method)

After a lead is saved to DB, call the AI service to score it:

```typescript
// After prisma.lead.create(...)
const scoreResult = await this.aiService.scoreLead({
  name: lead.name,
  company: lead.company,
  title: lead.title,
  source: lead.source,
  interactions: 0,
});

// Update lead with score
await this.prisma.lead.update({
  where: { id: lead.id },
  data: {
    score: scoreResult.score,
    // Store reason in an AIInsight record
  },
});
```

Create an `AIInsight` record with the score reasoning so it's stored per lead.

#### 2. Wire Event Bus — `lead.created` event

In `leads.service.ts` after lead creation + scoring, fire an event:

```typescript
this.eventBus.emit('lead.created', {
  leadId: lead.id,
  score: scoreResult.score,
  source: lead.source,
  timestamp: new Date(),
});
```

Register `AutomationEngine` and `EventBus` as providers in the relevant module.

#### 3. Score Badge on Frontend (coordinate with Arav)

Confirm the score returned by `GET /leads` includes the `score` field. Arav will use this in the `ScoreBadge` component — just make sure the backend response includes it (it's already in the Prisma schema, just ensure it's not filtered out in the service).

#### 4. Inject `AIService` into Backend
The AI service currently lives in `src/ai/` (the prototype). You need to register it as a NestJS injectable:

Create `backend/src/ai/ai.module.ts`:
```typescript
@Module({
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
```

Create `backend/src/ai/ai.service.ts` — wrap the existing Gemini logic as a proper NestJS service with `@Injectable()`.

Import `AiModule` into `LeadsModule`.

#### 5. Files to Create / Update
```
backend/src/
├── ai/
│   ├── ai.module.ts          ← NEW — NestJS module wrapper
│   └── ai.service.ts         ← NEW — Injectable Gemini service
└── leads/
    └── leads.service.ts      ← UPDATE — call AiService on lead creation
```

### PR Checklist
- [ ] `AiService` is an injectable NestJS service in `AiModule`
- [ ] `scoreLead()` is called on every `POST /leads`
- [ ] Score + reason stored in `Lead.score` and `AIInsight` table
- [ ] `lead.created` event fires on the event bus after creation
- [ ] `GET /leads` response includes the `score` field
- [ ] No hardcoded Gemini API key — uses `process.env.GEMINI_API_KEY`
- [ ] Demo mode works when `GEMINI_API_KEY` is not set
- [ ] TypeScript compiles: `npx tsc --noEmit`

### How to Submit
```bash
git add .
git commit -m "feat: Sprint 2 AI — auto-score leads on creation, AiModule as NestJS service, event bus wiring"
git push origin sprint-2/ai-automation
# Open PR on GitHub → base: main
# Title: feat: Sprint 2 AI/Automation — auto lead scoring & event bus integration
# Request review from: Soumya
```

---

---

## 📌 Sprint 2 Merge Order

To avoid conflicts, merge branches in this order:

```
1. sprint-2/backend      (Dushyant)  ← merge first
2. sprint-2/ai-automation (Arpan)    ← depends on leads service
3. sprint-2/frontend     (Arav)      ← merge last, connects to both
```

---

## 🔁 What Inactive Members Should Do This Sprint

| Member | What to do |
|--------|-----------|
| **Saransh** | Review Dushyant's PR · Study NestJS modules · Prepare for Sprint 3 backend |
| **Ujjwal** | Review Dushyant's PR · Study Prisma schema deeply · Prepare for Sprint 4 backend |
| **Harshwardhan** | Review Arav's PR · Study Next.js App Router and Tailwind setup · Prepare for Sprint 3 frontend |
| **Soumya** | Review Arpan's PR · Study AI service layer and event bus code · Prepare for Sprint 3 AI/Automation |

---

*Sprint 2 — ProyoTech Internship 2026 · AI LeadOS*  
*Prepared by: Arpan (Tech Lead)*
