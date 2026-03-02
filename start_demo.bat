@echo off
chcp 65001 >nul
title Agent-Experiment-Platform
color 0A

echo.
echo ========================================
echo   AGENTIC WORKFLOW EXPERIMENT PLATFORM
echo   One-Click Demo Launcher
echo ========================================
echo.
echo [SYSTEM] Initializing platform...
echo.

echo [1/2] Starting Python Backend...
start "Backend-Server" cmd /k "cd backend && venv\Scripts\activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo       Backend service launched in new window
echo       API: http://localhost:8000
echo.

echo [WAIT] Backend initializing...
timeout /t 2 /nobreak >nul

echo [2/2] Starting React Frontend...
start "Frontend-DevServer" cmd /k "cd frontend && npm run dev"
echo       Frontend service launched in new window
echo       App: http://localhost:5173
echo.

echo [WAIT] Frontend compiling...
timeout /t 3 /nobreak >nul

echo ========================================
echo [DONE] Services Ready!
echo ========================================
echo.
echo [BROWSER] Opening experiment homepage...
start http://localhost:5173
echo.
echo ----------------------------------------
echo Tips:
echo - Backend window: FastAPI + SQLite
echo - Frontend window: React + Vite
echo - Admin panel: Ctrl+Shift+A (password: admin)
echo ----------------------------------------
echo.
echo Demo is ready! Good luck!
echo.
echo Press any key to close this window (services will keep running)...
pause >nul
