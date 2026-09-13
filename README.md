# QueueLess — Smart Digital Ordering & Token System

QueueLess is a multi-tenant digital ordering and token management system designed for fast-paced retail food outlets (tea & snacks shops, cafes, bakeries, quick-service restaurants).

---

## DEVELOPMENT LOGIN

Use these development credentials to access the business administration dashboard:

- **Email**: `admin@queueless.local`
- **Password**: `QueueLess@123`
- **Role**: `OWNER`
- **Assigned Shop**: `Sri Lakshmi Tea & Snacks`

> [!NOTE]
> These credentials are for local development and demonstration purposes only.

---

## SYSTEM ARCHITECTURE

- **Backend API**: Express + TypeScript + Prisma ORM (SQLite / PostgreSQL ready) + Socket.IO (`http://localhost:4000`)
- **Customer Web App**: Mobile-first React + Vite + TypeScript (`http://localhost:5173`)
- **Admin Dashboard**: Business operations React + Vite + TypeScript (`http://localhost:5174`)

---

## SERVICE PORTS & URLS

| Service | Port | Local URL | Description |
|---|---|---|---|
| **API** | `4000` | `http://localhost:4000/api/health` | Backend API & WebSocket Server |
| **Customer App** | `5173` | `http://localhost:5173` | QR-based self-ordering menu & bill |
| **Admin Portal** | `5174` | `http://localhost:5174` | Management, KOT, POS billing & analytics |

---

## SETUP & STARTUP COMMANDS

```bash
# 1. Install dependencies
npm install

# 2. Setup database schema
npm run generate --workspace=packages/database
npm run migrate --workspace=packages/database

# 3. Seed demo shop & admin user
npm run seed --workspace=packages/database

# 4. Start all services concurrently
npm run dev
```

---

## ENVIRONMENT VARIABLES

See `.env.example` for all configurable environment variables:

- `DATABASE_URL` — Connection string (SQLite file or PostgreSQL)
- `JWT_SECRET` — Secret key for auth tokens
- `API_PORT` — API server port (default `4000`)
- `CORS_ORIGIN` — Allowed client origins
