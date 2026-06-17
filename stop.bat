@echo off
title CyberRange — Shutdown
color 0C

echo.
echo  ============================================
echo   CYBERRANGE — SHUTTING DOWN
echo  ============================================
echo.

echo [1/3] Closing server terminal windows...
taskkill /fi "WINDOWTITLE eq CyberRange — Backend" /f >nul 2>&1
taskkill /fi "WINDOWTITLE eq CyberRange — Frontend" /f >nul 2>&1

echo [2/3] Stopping Node processes on ports 3000 and 4000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 "') do taskkill /pid %%a /f >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":4000 "') do taskkill /pid %%a /f >nul 2>&1

echo [3/3] Stopping PostgreSQL container...
docker stop cyberrange-db >nul 2>&1

echo.
echo  All services stopped.
echo.
pause
