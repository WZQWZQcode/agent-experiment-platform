#!/bin/bash

echo "========================================"
echo "Agentic Workflow Experiment Platform"
echo "Backend Startup Script"
echo "========================================"
echo ""

cd backend

echo "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python3 is not installed"
    exit 1
fi
python3 --version

echo ""
echo "Checking virtual environment..."
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo ""
echo "Activating virtual environment..."
source venv/bin/activate

echo ""
echo "Installing/Updating dependencies..."
pip install -r requirements.txt

echo ""
echo "========================================"
echo "Starting FastAPI server..."
echo "Backend will run on http://localhost:8000"
echo "Press Ctrl+C to stop"
echo "========================================"
echo ""

uvicorn main:app --reload --host 0.0.0.0 --port 8000
