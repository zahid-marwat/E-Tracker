# 🚀 Enhanced Expense Tracker - Local Setup Guide

## Prerequisites

### Required Software:
1. **Python 3.12+** (with pip)
2. **Node.js 18+** (with npm)
3. **Git** (optional, for cloning)
4. **VS Code** (recommended IDE)

## 📁 Project Structure
```
E-Tracker/
├── expense-tracker-app/
│   ├── backend/                 # Flask API server
│   │   ├── app.py              # Main application file
│   │   ├── requirements.txt    # Python dependencies
│   │   └── instance/          # Database files
│   ├── frontend-react/         # React frontend
│   │   ├── src/               # React components
│   │   ├── package.json       # Node dependencies
│   │   └── public/           # Static assets
│   └── test-frontend.html     # Quick test page
```

## 🛠️ Installation Steps

### Step 1: Clone/Download the Project
```bash
# If using Git
git clone <repository-url>
cd E-Tracker

# Or download and extract the ZIP file
```

### Step 2: Backend Setup (Flask API)

#### 2.1 Navigate to Backend Directory
```bash
cd expense-tracker-app/backend
```

#### 2.2 Create Python Virtual Environment (Recommended)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### 2.3 Install Python Dependencies
```bash
pip install -r requirements.txt
```

**If requirements.txt is missing, install manually:**
```bash
pip install flask flask-cors flask-sqlalchemy
```

#### 2.4 Initialize Database
The database will be automatically created when you first run the app.

### Step 3: Frontend Setup (React)

#### 3.1 Navigate to Frontend Directory
```bash
cd ../frontend-react
```

#### 3.2 Install Node Dependencies
```bash
npm install
```

**If package.json dependencies fail, install manually:**
```bash
npm install react react-dom react-scripts axios react-hot-toast chart.js react-chartjs-2
```

## 🚀 Running the Application

### Method 1: Using VS Code (Recommended)

#### 1. Open in VS Code
```bash
code . # From the E-Tracker root directory
```

#### 2. Start Backend Server
- Open VS Code Terminal
- Navigate to backend: `cd expense-tracker-app/backend`
- Run: `python app.py`
- ✅ Backend will start on `http://127.0.0.1:5000`

#### 3. Start Frontend (New Terminal)
- Open new VS Code Terminal
- Navigate to frontend: `cd expense-tracker-app/frontend-react`
- Run: `npm start`
- ✅ Frontend will start on `http://localhost:3000`

### Method 2: Using Command Line

#### Terminal 1 - Backend
```bash
cd expense-tracker-app/backend
python app.py
```

#### Terminal 2 - Frontend
```bash
cd expense-tracker-app/frontend-react
npm start
```

### Method 3: Quick Test (HTML Only)
Open `expense-tracker-app/test-frontend.html` in your browser to test the backend API without React.

## 🌐 Access Points

Once both servers are running:

- **React Frontend:** http://localhost:3000
- **Backend API:** http://127.0.0.1:5000
- **Test Page:** file:///.../test-frontend.html

## 🔧 Troubleshooting

### Common Issues:

#### 1. Backend Not Starting
```bash
# Check Python version
python --version

# Install missing dependencies
pip install flask flask-cors flask-sqlalchemy

# Check if port 5000 is available
netstat -an | grep :5000
```

#### 2. Frontend Not Starting
```bash
# Check Node version
node --version
npm --version

# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# If port 3000 is busy, React will suggest an alternative
```

#### 3. CORS Errors
- Ensure backend is running first
- Check that CORS is enabled in `app.py`
- Backend must be on `http://127.0.0.1:5000`

#### 4. Database Issues
```bash
# Delete and recreate database
rm backend/instance/expense_tracker_enhanced.db
# Restart backend - database will be recreated
```

#### 5. Environment Issues
```bash
# Windows - Use PowerShell as Administrator
# macOS/Linux - Check permissions
chmod +x scripts
```

## 📊 Verification Steps

### 1. Backend Health Check
Open browser: `http://127.0.0.1:5000/api/dashboard/overview`
Should return JSON data.

### 2. Frontend Test
- Open `http://localhost:3000`
- Should see the Enhanced Expense Tracker dashboard
- Try adding an expense through the modal

### 3. Full Integration Test
1. Add monthly income
2. Add some expenses in different categories
3. Create loan transactions
4. Set up a committee
5. View analytics dashboard

## 💡 Development Tips

### Hot Reloading
- **Frontend:** Changes auto-reload in browser
- **Backend:** Restart manually after code changes (or use `flask run --debug`)

### Database Browser
- Install DB Browser for SQLite to view data
- Database location: `backend/instance/expense_tracker_enhanced.db`

### API Testing
- Use Postman or curl to test API endpoints
- All endpoints documented in the backend code

## 🎯 Quick Start Commands

**Complete setup in 4 commands:**
```bash
# 1. Backend setup
cd expense-tracker-app/backend && pip install flask flask-cors flask-sqlalchemy

# 2. Start backend
python app.py

# 3. Frontend setup (new terminal)
cd ../frontend-react && npm install

# 4. Start frontend
npm start
```

## 🔒 Production Deployment

For production deployment:
1. Set `debug=False` in app.py
2. Use production WSGI server (gunicorn, waitress)
3. Build React for production: `npm run build`
4. Configure proper database (PostgreSQL/MySQL)
5. Set up environment variables

## 📱 Features Available

Once running, you can:
- ✅ Track expenses in 8 categories
- ✅ Manage 3 types of loans (Given/Taken/Received)
- ✅ Set up committee memberships
- ✅ Track monthly income sources
- ✅ View comprehensive analytics
- ✅ Generate financial reports
- ✅ Monitor net worth in real-time

## 🆘 Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Verify all prerequisites are installed
3. Ensure both servers are running
4. Check browser console for errors (F12)
5. Review terminal output for error messages

**Happy Financial Tracking! 💰📊**
