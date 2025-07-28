@echo off
echo ========================================
echo Enhanced Expense Tracker - Quick Start
echo ========================================
echo.

echo Checking prerequisites...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found. Please install Python 3.12+ first.
    pause
    exit /b 1
)

node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Python and Node.js found!
echo.

echo ========================================
echo Step 1: Setting up Backend (Flask)
echo ========================================
cd expense-tracker-app\backend

echo Installing Python dependencies...
pip install flask flask-cors flask-sqlalchemy
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)

echo ✅ Backend dependencies installed!
echo.

echo ========================================
echo Step 2: Setting up Frontend (React)
echo ========================================
cd ..\frontend-react

echo Installing Node dependencies...
npm install
if errorlevel 1 (
    echo ERROR: Failed to install Node dependencies
    pause
    exit /b 1
)

echo ✅ Frontend dependencies installed!
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To run the application:
echo.
echo 1. Start Backend (in one terminal):
echo    cd expense-tracker-app\backend
echo    python app.py
echo.
echo 2. Start Frontend (in another terminal):
echo    cd expense-tracker-app\frontend-react
echo    npm start
echo.
echo 3. Open browser to: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul
