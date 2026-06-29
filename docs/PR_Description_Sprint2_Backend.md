### PR Title
```
feat: Sprint 2 Backend — Deals Pipeline & Dashboard Stats API
```

### PR Description

## 📋 Sprint 2 Backend — Deals & Dashboard

**Branch:** `sprint-2/backend` → `main`
**Sprint Goal contribution:** Core backend infrastructure for the Deal Pipeline and Dashboard Analytics.

---

### What was built

#### 📊 Dashboard Module (`backend/src/dashboard/`)
- Created `DashboardService` and `DashboardController`.
- **`GET /api/dashboard/stats`**: Returns aggregated CRM statistics including:
  - Total Leads and New Leads (last 7 days).
  - Total Deals and total Pipeline Value.
  - Overall Conversion Rate.
  - Grouped metrics (`leadsByStatus`, `dealsByStage`) using Prisma aggregations.

#### 💼 Deals Module (`backend/src/deals/`)
- Created `DealsService` and `DealsController`.
- Built core pipeline CRUD operations:
  - **`POST /api/deals`**: Create a new deal attached to a lead.
  - Includes validated DTOs (`CreateDealDto`, `UpdateDealDto`).

#### 🔧 App Wiring & Fixes
- Registered `DealsModule` and `DashboardModule` in the root `app.module.ts` so endpoints are exposed to the frontend.
- Fixed Prisma TypeScript compilation errors in grouping queries.
- Ensured full compatibility with the existing Sprint 2 AI features (safely restored `AiService` methods).

---

### ✅ PR Checklist
- [x] TypeScript compiles with 0 errors (`npx tsc --noEmit`).
- [x] Modules successfully wired into `app.module.ts`.
- [x] Dashboard returns accurate grouped statistics.
- [x] Deals API uses correct Prisma schema relationships (Title, OwnerId).
- [x] Merge conflicts with AI/Automation branch resolved.

**Merge Instructions:** Safe to merge. This completes the Backend requirements for Sprint 2.
