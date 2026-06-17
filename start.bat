@echo off
title CyberRange Launcher
color 0A

echo.
echo  ============================================
echo   CYBERRANGE — AUTOMATED STARTUP
echo  ============================================
echo.

:: ── Step 1: Start Docker Desktop if not running ─────────────────────────────
echo [1/5] Checking Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo       Docker not running. Starting Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo       Waiting for Docker to be ready (30s)...
    ping -n 31 127.0.0.1 >nul
    :DOCKER_WAIT
    docker info >nul 2>&1
    if %errorlevel% neq 0 (
        echo       Still waiting...
        ping -n 6 127.0.0.1 >nul
        goto DOCKER_WAIT
    )
)
echo       Docker is ready.

:: ── Step 2: Start PostgreSQL container ──────────────────────────────────────
echo.
echo [2/5] Starting PostgreSQL...
docker start cyberrange-db >nul 2>&1
if %errorlevel% neq 0 (
    echo       Container not found. Creating a new one...
    docker run -d --name cyberrange-db ^
        -e POSTGRES_USER=postgres ^
        -e POSTGRES_PASSWORD=password ^
        -e POSTGRES_DB=cyberrange ^
        -p 5432:5432 ^
        postgres:16-alpine >nul 2>&1
)
echo       Waiting for PostgreSQL to accept connections...
:PG_WAIT
docker exec cyberrange-db pg_isready -U postgres >nul 2>&1
if %errorlevel% neq 0 (
    ping -n 3 127.0.0.1 >nul
    goto PG_WAIT
)
echo       PostgreSQL is ready.

:: ── Step 3: Push DB schema + seed ───────────────────────────────────────────
echo.
echo [3/5] Syncing database schema...
cd /d "%~dp0backend"
call npx prisma db push --skip-generate >nul 2>&1
echo       Schema synced.
echo       Seeding demo data...
call npx ts-node prisma/seed.ts >nul 2>&1
echo       Seed complete.

:: ── Step 4: Launch Backend ───────────────────────────────────────────────────
echo.
echo [4/5] Starting Backend on http://localhost:4000 ...
start "CyberRange — Backend" cmd /k "cd /d "%~dp0backend" && color 0A && echo  [BACKEND] Starting... && npx nodemon src/index.ts"

:: wait a moment for backend to boot
ping -n 5 127.0.0.1 >nul

:: ── Step 5: Launch Frontend ──────────────────────────────────────────────────
echo.
echo [5/5] Starting Frontend on http://localhost:3000 ...
start "CyberRange — Frontend" cmd /k "cd /d "%~dp0frontend" && color 0B && echo  [FRONTEND] Starting... && npm run dev"

:: ── Done ────────────────────────────────────────────────────────────────────
echo.
echo  ============================================
echo   ALL SYSTEMS UP
echo.
echo   Frontend  →  http://localhost:3000
echo   Backend   →  http://localhost:4000
echo   DB        →  localhost:5432 (cyberrange)
echo.
echo   Demo Login:
echo     admin@cyberrange.io  /  Admin@123!
echo     redteam@cyberrange.io  /  User@123!
echo  ============================================
echo.
echo  Opening browser in 5 seconds...
ping -n 6 127.0.0.1 >nul
start "" "http://localhost:3000"
echo.
pause
