@echo off
echo ========================================
echo Agentic Workflow Experiment Platform
echo Frontend Startup Script
echo ========================================
echo.

cd frontend

echo Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Checking npm installation...
npm --version
if errorlevel 1 (
    echo ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo.
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
) else (
    echo Dependencies already installed. Skipping...
)

echo.
echo ========================================
echo Starting Vite development server...
echo Frontend will run on http://localhost:5173
echo Press Ctrl+C to stop
echo ========================================
echo.

npm run dev

pause
