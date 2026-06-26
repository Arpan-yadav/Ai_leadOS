<div align="center">
<img width="1200" height="475" alt="AI LeadOS Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# 🚀 AI LeadOS — AI-Powered CRM & Sales Automation

> An intelligent Lead Management, Sales Automation, and CRM platform powered by Google Gemini AI.

[![Sprint](https://img.shields.io/badge/Sprint-1%20Foundation-brand)](https://github.com/proyotech/AI_LeadOS)
[![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Vite%20%2B%20Gemini-blue)](https://github.com/proyotech/AI_LeadOS)
[![License](https://img.shields.io/badge/License-Apache%202.0-green)](LICENSE)

---

## ✨ Features (Sprint 1)

| Module | Description |
|--------|-------------|
| 🤖 **AI Intelligence** | Company website audits with Gemini AI — sales score, opportunities, risks |
| ⚡ **Automation Engine** | Event-driven workflow execution with visual builder |
| 📧 **Outreach Sequences** | AI-personalized multi-channel drip campaigns |
| 📊 **Dashboard** | Real-time CRM metrics and activity feed |
| 🎯 **Lead Management** | Full lead pipeline with AI scoring |
| 🔄 **Pipeline View** | Kanban-style deal stage management |

---

## 🏗️ Architecture

```
src/
├── ai/               ← Gemini AI Service Layer
│   ├── aiService.ts  ← Core AI methods
│   └── prompts/      ← Prompt Library
│       └── leadAnalyzer.ts
│
├── automation/       ← Automation Engine
│   ├── engine.ts     ← Event bus + workflow executor
│   └── schemas/      ← Type system
│       ├── workflowSchema.ts
│       ├── sequenceSchema.ts
│       └── eventSchema.ts
│
├── pages/            ← React Pages (Full UI Prototype)
└── components/       ← Reusable Components
```

---

## 🚀 Quick Start

**Prerequisites:** Node.js 18+

```bash
# 1. Clone the repository
git clone https://github.com/proyotech/AI_LeadOS.git
cd AI_LeadOS

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Add your Gemini API key (optional — demo mode works without it)

# 4. Start development server
npm run dev
```

Open **http://localhost:3000** 🎉

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Optional | Google Gemini API key for live AI analysis |
| `APP_URL` | Optional | Deployed app URL |

> **Note:** The app runs in demo mode without a Gemini API key — all AI features return realistic sample data.

---

## 🌐 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze-company` | POST | AI company intelligence audit |
| `/api/generate-outreach` | POST | Generate 7-day outreach sequence |
| `/api/score-lead` | POST | AI lead scoring (0-100) |
| `/api/suggest-workflows` | POST | Automation workflow suggestions |

---

## 🗓️ Sprint Roadmap

| Sprint | Focus | Status |
|--------|-------|--------|
| **Sprint 1** | Foundation, AI Service Layer, Automation Schemas | ✅ In Progress |
| Sprint 2 | Full Lead CRUD, Pipeline, Communications | 🔜 Planned |
| Sprint 3 | Live Automation Engine, Email Gateway | 🔜 Planned |
| Sprint 4 | Analytics, Reporting, Team Features | 🔜 Planned |

---

## 👥 Team

Built by the **ProyoTech** internship team.

- **AI Team:** AI Service Layer, Prompt Library, Lead Analyzer
- **Automation Team:** Workflow Schema, Sequence Schema, Event Architecture
- **Frontend Team:** React UI, Component Library, Dashboard
- **Backend Team:** NestJS API, PostgreSQL, Authentication

---

## 📄 License

Apache 2.0 — See [LICENSE](LICENSE)

---

<div align="center">
  <sub>Built with ❤️ using Google Gemini AI • ProyoTech Internship 2026</sub>
</div>
