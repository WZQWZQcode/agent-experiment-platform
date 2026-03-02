@echo off
echo ========================================
echo Agentic Workflow Experiment Platform
echo Backend Startup Script
echo ========================================
echo.

cd backend

echo Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Checking virtual environment...
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo.
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Installing/Updating dependencies...
pip install -r requirements.txt

echo.
echo ========================================
echo Starting FastAPI server...
echo Backend will run on http://localhost:8000
echo Press Ctrl+C to stop
echo ========================================
echo.

uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause
