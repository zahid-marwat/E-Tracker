#!/bin/bash
echo "========================================"
echo "Enhanced Expense Tracker - Quick Start"
echo "========================================"
echo

echo "Checking prerequisites..."
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python3 not found. Please install Python 3.12+ first."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Python and Node.js found!"
echo

echo "========================================"
echo "Step 1: Setting up Backend (Flask)"
echo "========================================"
cd expense-tracker-app/backend

echo "Installing Python dependencies..."
pip3 install flask flask-cors flask-sqlalchemy
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install Python dependencies"
    exit 1
fi

echo "✅ Backend dependencies installed!"
echo

echo "========================================"
echo "Step 2: Setting up Frontend (React)"
echo "========================================"
cd ../frontend-react

echo "Installing Node dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install Node dependencies"
    exit 1
fi

echo "✅ Frontend dependencies installed!"
echo

echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo
echo "To run the application:"
echo
echo "1. Start Backend (in one terminal):"
echo "   cd expense-tracker-app/backend"
echo "   python3 app.py"
echo
echo "2. Start Frontend (in another terminal):"
echo "   cd expense-tracker-app/frontend-react"
echo "   npm start"
echo
echo "3. Open browser to: http://localhost:3000"
echo
