#!/bin/bash

echo "========================================"
echo "Agentic Workflow Experiment Platform"
echo "Frontend Startup Script"
echo "========================================"
echo ""

cd frontend

echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    exit 1
fi
node --version

echo ""
echo "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed"
    exit 1
fi
npm --version

echo ""
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
else
    echo "Dependencies already installed. Skipping..."
fi

echo ""
echo "========================================"
echo "Starting Vite development server..."
echo "Frontend will run on http://localhost:5173"
echo "Press Ctrl+C to stop"
echo "========================================"
echo ""

npm run dev
