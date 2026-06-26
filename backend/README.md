# AI LeadOS — Backend

> NestJS + PostgreSQL + Prisma ORM + JWT Authentication

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | NestJS 10 |
| Database | PostgreSQL 16 (Docker) |
| ORM | Prisma 5 |
| Auth | Passport JWT |
| Validation | class-validator |
| Docs | Swagger (OpenAPI 3) |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL via Docker
docker-compose up -d

# 3. Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET

# 4. Run Prisma migration
npx prisma migrate dev --name init

# 5. Generate Prisma Client
npx prisma generate

# 6. Start development server
npm run start:dev
```

**API Base:** http://localhost:3001/api  
**Swagger Docs:** http://localhost:3001/api/docs

## API Endpoints (Sprint 1)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login → JWT |
| GET | `/api/auth/me` | ✅ JWT | Get current user |
| GET | `/api/users` | ✅ JWT | List all users |

## Directory Structure

```
backend/
├── src/
│   ├── main.ts              ← Entry point + Swagger setup
│   ├── app.module.ts        ← Root module
│   ├── prisma/
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   └── users/
│       ├── users.module.ts
│       ├── users.controller.ts
│       └── users.service.ts
├── prisma/
│   └── schema.prisma        ← All DB entities
├── docker-compose.yml
├── .env.example
└── package.json
```
