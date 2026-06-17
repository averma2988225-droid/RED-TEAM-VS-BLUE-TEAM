# CyberRange — Deployment Guide

## Why Not a Single Vercel Deployment?

Vercel is a **serverless** platform. It cannot run:
- Long-running Express servers
- Socket.IO (requires persistent WebSocket connections)
- File system writes (used by the code scanner)
- PostgreSQL direct connections (requires a persistent process)

**The correct architecture for production:**

```
┌─────────────────────┐        ┌──────────────────────────┐
│   Vercel            │        │   Railway                │
│   Frontend (Next.js)│◄──────►│   Backend (Express)      │
│   yourapp.vercel.app│  HTTPS │   + PostgreSQL           │
│                     │  WSS   │   yourapp.railway.app    │
└─────────────────────┘        └──────────────────────────┘
```

---

## Step 1 — Deploy Backend to Railway (Free)

### 1.1 Create Railway account
Go to https://railway.app and sign up with GitHub.

### 1.2 Create new project
- Click **New Project**
- Select **Deploy from GitHub repo**
- Select your `RED-TEAM-VS-BLUE-TEAM` repository
- Set **Root Directory** to `backend`

### 1.3 Add PostgreSQL
- Inside your Railway project, click **+ New**
- Select **Database → PostgreSQL**
- Railway auto-injects `DATABASE_URL` into your backend service

### 1.4 Add Environment Variables
In Railway → Your Backend Service → **Variables**, add:

```
JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_REFRESH_SECRET=<run same command again for a different value>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=4000
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app
TOTP_SERVICE_NAME=CyberRange
```

### 1.5 Run Database Migration
After first deploy, open Railway shell or use the CLI:
```bash
railway run npx prisma db push
railway run npx ts-node prisma/seed.ts
```

### 1.6 Get your backend URL
Railway gives you a URL like:
```
https://cyberrange-backend-production.up.railway.app
```
**Save this — you need it for Step 2.**

---

## Step 2 — Deploy Frontend to Vercel

### 2.1 Import project
- Go to https://vercel.com/new
- Import your `RED-TEAM-VS-BLUE-TEAM` GitHub repository
- Set **Root Directory** to `frontend`
- Framework will auto-detect as **Next.js**

### 2.2 Add Environment Variables
In Vercel → Project → **Settings → Environment Variables**, add:

```
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
NEXT_PUBLIC_WS_URL=https://your-backend.up.railway.app
```

Replace with your actual Railway URL from Step 1.6.

### 2.3 Deploy
Click **Deploy**. Vercel builds and deploys automatically.

Your frontend will be live at:
```
https://cyberrange.vercel.app
```

---

## Step 3 — Connect Frontend ↔ Backend

### Update Railway CLIENT_URL
Go back to Railway → Backend → Variables and update:
```
CLIENT_URL=https://your-actual-frontend.vercel.app
```

This is required for CORS to allow your Vercel frontend to call the backend.

### Redeploy backend
Railway will auto-redeploy when you save the variable.

---

## Final Architecture

| Service | Platform | URL Pattern |
|---------|----------|-------------|
| Frontend (Next.js) | Vercel | `https://cyberrange.vercel.app` |
| Backend (Express + Socket.IO) | Railway | `https://cyberrange-backend.up.railway.app` |
| PostgreSQL | Railway (plugin) | Auto-injected as `DATABASE_URL` |

---

## Environment Variables Summary

### Frontend (Vercel)
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.up.railway.app/api` |
| `NEXT_PUBLIC_WS_URL` | `https://your-backend.up.railway.app` |

### Backend (Railway)
| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Auto-provided by Railway PostgreSQL plugin |
| `JWT_SECRET` | 64-char random hex string |
| `JWT_REFRESH_SECRET` | 64-char random hex string |
| `JWT_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `PORT` | `4000` |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | Your Vercel frontend URL |
| `TOTP_SERVICE_NAME` | `CyberRange` |

---

## Local Development

```bash
# Terminal 1 — Start DB
docker start cyberrange-db

# Terminal 2 — Backend
cd backend && npm run dev

# Terminal 3 — Frontend  
cd frontend && npm run dev
```

Or just double-click `start.bat` — it does everything automatically.

---

## Demo Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cyberrange.io | Admin@123! |
| Red Team | redteam@cyberrange.io | User@123! |
| Blue Team | blueteam@cyberrange.io | User@123! |
