# AI LeadOS — Sprint 1 Architecture Documentation

## Sprint 1: Foundation & Setup
**Status:** ✅ Completed  
**Sprint Goal:** Establish the technical foundation — environment setup, AI service layer, automation schemas, and a working prototype.

---

## 🗂️ Module Architecture

```
src/
├── ai/                         ← AI Team Deliverables
│   ├── index.ts                ← Public API barrel export
│   ├── aiService.ts            ← Core AI Service (Gemini wrapper)
│   └── prompts/
│       └── leadAnalyzer.ts     ← Prompt Library (all AI prompts)
│
├── automation/                 ← Automation Team Deliverables
│   ├── index.ts                ← Public API barrel export
│   ├── engine.ts               ← Automation Engine (event bus + executor)
│   └── schemas/
│       ├── workflowSchema.ts   ← Workflow type system
│       ├── sequenceSchema.ts   ← Sequence type system
│       └── eventSchema.ts      ← Event architecture schema
│
├── pages/                      ← Frontend (prototype)
│   ├── Landing.tsx
│   ├── Auth.tsx
│   ├── Dashboard.tsx
│   ├── LeadList.tsx
│   ├── Pipeline.tsx
│   ├── AIIntelligence.tsx      ← Uses /api/analyze-company
│   ├── AutomationBuilder.tsx
│   ├── Communications.tsx
│   ├── Analytics.tsx
│   └── Settings.tsx
│
└── components/
    ├── layout/
    │   ├── Layout.tsx
    │   ├── Sidebar.tsx
    │   └── Header.tsx
    ├── LeadAIPulse.tsx
    ├── LeadForm.tsx
    └── Modal.tsx

server.ts                       ← Express server + Gemini API proxy
```

---

## 🤖 AI Team — Deliverables

### 1. `src/ai/aiService.ts` — Core AI Service
The central wrapper around the Google Gemini API. Provides typed, structured methods.

**Methods:**
| Method | Description | API Endpoint |
|--------|-------------|--------------|
| `analyzeCompany(url)` | Company intelligence audit | `POST /api/analyze-company` |
| `generateOutreachSequence(...)` | 7-day outreach plan | `POST /api/generate-outreach` |
| `suggestWorkflows(context)` | Automation recommendations | `POST /api/suggest-workflows` |
| `scoreLead(leadData)` | AI lead scoring | `POST /api/score-lead` |

### 2. `src/ai/prompts/leadAnalyzer.ts` — Prompt Library
Central registry of all AI prompt templates. Each prompt has:
- `name`: Unique identifier
- `description`: What it does
- `version`: For prompt versioning
- `model`: Target Gemini model
- `build(ctx)`: Function that generates the prompt string
- `outputSchema`: Expected JSON output structure

**Registered Prompts:**
| Key | Purpose |
|-----|---------|
| `company_audit` | Analyze company from URL |
| `lead_scorer` | Score individual lead 0-100 |
| `outreach_sequence` | 7-day multi-channel outreach |
| `workflow_suggester` | Suggest automation workflows |

---

## ⚡ Automation Team — Deliverables

### 3. `src/automation/schemas/workflowSchema.ts` — Workflow Schema
Complete type system for the visual workflow builder.

**Key Types:**
- `Workflow` — Full workflow definition with nodes, edges, metrics
- `WorkflowNode` — Individual step (trigger/condition/action/delay/ai_logic)
- `TriggerType` — 8 supported trigger types (lead_created, schedule_cron, etc.)
- `ActionType` — 12 supported action types (send_email, ai_score_lead, etc.)
- `WorkflowExecution` — Runtime execution record with per-node results

### 4. `src/automation/schemas/sequenceSchema.ts` — Sequence Schema
Type system for time-based drip communication campaigns.

**Key Types:**
- `Sequence` — Full sequence with steps, enrollment, exit rules
- `SequenceStep` — Individual touchpoint with channel, delay, template
- `SequenceEnrollment` — Tracks a specific lead's progress through a sequence

### 5. `src/automation/schemas/eventSchema.ts` — Event Schema
Event architecture for the event-driven automation system.

**Event Categories:**
- `crm` — Lead, deal, task events
- `communication` — Email, WhatsApp, LinkedIn events  
- `ai` — AI scoring and analysis events
- `automation` — Workflow and sequence lifecycle events

### 6. `src/automation/engine.ts` — Automation Engine
In-memory automation engine for the Sprint 1 prototype.

**Features:**
- `InMemoryEventBus` — Pub/sub event routing
- Workflow registration and graph execution
- Sequence enrollment management
- Node-by-node execution with result tracking

---

## 🌐 API Endpoints (Sprint 1)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze-company` | AI company intelligence audit |
| `POST` | `/api/generate-outreach` | Generate outreach sequence |
| `POST` | `/api/score-lead` | AI lead scoring |
| `POST` | `/api/suggest-workflows` | Workflow suggestions |

All endpoints return demo data when `GEMINI_API_KEY` is not set.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Set your Gemini API key (optional - demo mode works without it)
cp .env.example .env.local
# Edit .env.local and add: GEMINI_API_KEY=your_key_here

# 3. Run the development server
npm run dev
```

Open http://localhost:3000

---

## 📋 Sprint 1 Checklist

### Environment Setup
- [x] Repository cloned and configured
- [x] Development environment running
- [x] Gemini AI integration working (with demo fallback)

### AI Team
- [x] AI Service Layer (`src/ai/aiService.ts`)
- [x] Prompt Library (`src/ai/prompts/leadAnalyzer.ts`)
- [x] Lead Analyzer Flow defined and documented
- [x] 4 AI API endpoints on Express server

### Automation Team  
- [x] Workflow Schema (`src/automation/schemas/workflowSchema.ts`)
- [x] Sequence Schema (`src/automation/schemas/sequenceSchema.ts`)
- [x] Event Model (`src/automation/schemas/eventSchema.ts`)
- [x] Automation Engine stub (`src/automation/engine.ts`)

### Frontend/Design Review
- [x] UI prototype reviewed (all pages functional)
- [x] User workflows mapped to frontend routes

---

## 📌 Branch: `sprint-1/foundation`

Commit history follows convention:
```
feat: add ai service layer with gemini integration
feat: add prompt library for lead analyzer flow  
feat: add workflow schema for automation engine
feat: add sequence schema for drip campaigns
feat: add event architecture schema
feat: add automation engine with event bus
feat: add outreach and scoring api endpoints
docs: add sprint 1 architecture documentation
```
