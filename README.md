# CyberRange — Red Team Attacks. Blue Team Defends. Where Your Codebase Stays Unbreakable.

A production-ready cybersecurity simulation and training platform competing with Hack The Box and TryHackMe.

---

## 🏗️ Architecture

```
RED TEAM VS BLUE TEAM/
├── frontend/          # Next.js 15 + React + TypeScript + Tailwind
│   └── src/
│       ├── app/
│       │   ├── page.tsx                    # Landing page
│       │   ├── (auth)/login/               # Auth pages
│       │   ├── (auth)/register/
│       │   └── (dashboard)/               # Protected pages
│       │       ├── dashboard/             # Overview
│       │       ├── red-team/              # Offensive ops
│       │       ├── blue-team/             # Defensive ops
│       │       ├── cyber-range/           # Live scenarios
│       │       ├── learning/              # Challenges + labs
│       │       ├── analytics/             # Charts + metrics
│       │       └── admin/                 # Admin panel
│       ├── components/
│       │   ├── ui/                        # Badge, Button, Card, Input
│       │   ├── layout/                    # Sidebar, Header
│       │   └── dashboard/                 # StatCard
│       ├── lib/                           # api.ts, utils.ts
│       ├── store/                         # Zustand authStore
│       └── types/                         # TypeScript types
└── backend/           # Node.js + Express + Prisma + PostgreSQL
    ├── prisma/
    │   ├── schema.prisma                  # Database models
    │   └── seed.ts                        # Seed data
    └── src/
        ├── index.ts                       # Express + Socket.IO entry
        ├── lib/prisma.ts                  # Prisma client
        ├── types/                         # JWT payload types
        ├── utils/                         # jwt.ts, logger.ts
        ├── middleware/                    # auth, audit, errorHandler
        ├── controllers/authController.ts  # Auth logic
        ├── routes/                        # All API routes
        └── services/socketService.ts      # Real-time events
```

---

## 🗄️ Database Schema

| Model             | Key Fields                                                    |
|-------------------|---------------------------------------------------------------|
| User              | id, email, username, password, role, securityScore, 2FA      |
| RefreshToken      | token, userId, expiresAt                                      |
| Simulation        | type, status, findings (JSON), score                          |
| Alert             | severity, category, source, isResolved                        |
| Challenge         | category, difficulty, points, solution                        |
| ChallengeProgress | userId, challengeId, isCompleted, attempts                    |
| Vulnerability     | cveId, severity, cvssScore, solution                          |
| AuditLog          | action, resource, userId, ipAddress                           |
| ThreatFeed        | indicator, type, severity, source                             |

---

## 🔐 Security Features

- **JWT Auth** — Access tokens (15m) + Refresh tokens (7d)
- **RBAC** — STUDENT / RED_TEAM / BLUE_TEAM / ADMIN
- **2FA** — TOTP via Google Authenticator
- **Rate Limiting** — 200 req/15min global, 10 req/15min auth
- **Helmet** — Security headers
- **Audit Logging** — Every write operation logged with IP + user agent
- **Input Validation** — express-validator on all auth endpoints
- **Password Hashing** — bcrypt with 12 salt rounds
- **Refresh Token Rotation** — Stored in DB, revocable

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- npm 9+

### Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts
npm run dev
```

Backend runs on http://localhost:4000

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3000

---

## 📡 API Reference

| Method | Endpoint                      | Auth     | Description                  |
|--------|-------------------------------|----------|------------------------------|
| POST   | /api/auth/register            | Public   | Create account               |
| POST   | /api/auth/login               | Public   | Login + JWT                  |
| POST   | /api/auth/refresh             | Public   | Refresh access token         |
| POST   | /api/auth/logout              | JWT      | Revoke refresh token         |
| GET    | /api/auth/me                  | JWT      | Get current user             |
| POST   | /api/auth/2fa/setup           | JWT      | Get 2FA QR code              |
| POST   | /api/auth/2fa/verify          | JWT      | Enable 2FA                   |
| GET    | /api/simulations              | JWT      | List user simulations        |
| POST   | /api/simulations              | JWT      | Run new simulation           |
| GET    | /api/alerts                   | JWT      | List alerts                  |
| PATCH  | /api/alerts/:id/resolve       | JWT      | Resolve alert                |
| GET    | /api/challenges               | JWT      | List challenges              |
| POST   | /api/challenges/:id/submit    | JWT      | Submit challenge answer      |
| GET    | /api/vulnerabilities          | JWT      | List vulnerabilities         |
| GET    | /api/analytics/dashboard      | JWT      | Dashboard stats              |
| GET    | /api/analytics/global         | BLUE/ADMIN| Global stats                |
| GET    | /api/admin/stats              | ADMIN    | Admin statistics             |
| GET    | /api/admin/audit-logs         | ADMIN    | Audit log                   |
| PATCH  | /api/admin/users/:id/role     | ADMIN    | Change user role             |
| GET    | /api/threats                  | JWT      | Threat feed                  |

---

## 🌐 WebSocket Events

| Event                 | Direction | Description                       |
|-----------------------|-----------|-----------------------------------|
| alert:new             | Server→Client | New security alert           |
| simulation:update     | Server→Client | Simulation completed         |
| threat:detected       | Server→Blue/Admin | New threat indicator     |
| join:simulation       | Client→Server | Subscribe to sim updates    |

---

## 🚢 Deployment

### Docker (Recommended)

```dockerfile
# Backend Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
CMD ["node", "dist/index.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: cyberrange
      POSTGRES_PASSWORD: securepassword
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports: ["4000:4000"]
    environment:
      DATABASE_URL: postgresql://postgres:securepassword@postgres:5432/cyberrange
      JWT_SECRET: <your-secret>
    depends_on: [postgres]

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      NEXT_PUBLIC_API_URL: https://api.yourdomain.com/api

volumes:
  pgdata:
```

### Production Checklist

- [ ] Change all secrets in `.env`
- [ ] Enable HTTPS (use Nginx or Caddy as reverse proxy)
- [ ] Set `NODE_ENV=production`
- [ ] Configure SMTP for password reset emails
- [ ] Set up database backups
- [ ] Configure log rotation
- [ ] Set `CLIENT_URL` to production domain
- [ ] Use strong JWT secrets (64+ chars, random)
- [ ] Enable database SSL (`?sslmode=require`)
- [ ] Add Redis for rate limiting in multi-instance deployments

---

## 🎮 Demo Credentials

| Role      | Email                      | Password    |
|-----------|----------------------------|-------------|
| Admin     | admin@cyberrange.io        | Admin@123!  |
| Red Team  | redteam@cyberrange.io      | User@123!   |
| Blue Team | blueteam@cyberrange.io     | User@123!   |
