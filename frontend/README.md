# AI LeadOS — Frontend

> Next.js 14 App Router + TypeScript + Tailwind CSS

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 3 |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios |
| Icons | Lucide React |
| Animation | Framer Motion |

## Quick Start

```bash
npm install
cp .env.local.example .env.local
# Edit NEXT_PUBLIC_API_URL=http://localhost:3001/api
npm run dev
```

Open http://localhost:3000

## Pages (Sprint 1)

| Route | Component | Auth |
|-------|-----------|------|
| `/login` | Login Page | Public |
| `/register` | Register Page | Public |
| `/dashboard` | Dashboard Shell | Protected |

## Structure

```
frontend/
├── app/
│   ├── layout.tsx           ← Root layout (Inter font, metadata)
│   ├── page.tsx             ← Redirects to /login
│   ├── globals.css          ← Tailwind + custom classes
│   ├── (auth)/
│   │   ├── login/page.tsx   ← Login form (RHF + Zod)
│   │   └── register/page.tsx ← Register form
│   └── dashboard/
│       ├── layout.tsx       ← Dashboard shell (Sidebar + TopBar)
│       └── page.tsx         ← Dashboard home
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx      ← Dark sidebar navigation
│   │   └── TopBar.tsx       ← Search + notifications + logout
│   └── ui/
│       ├── Button.tsx       ← Reusable button with variants
│       └── Card.tsx         ← Glass card component
│
└── lib/
    ├── api.ts               ← Axios client with JWT interceptor
    └── auth.ts              ← Token management (localStorage)
```
