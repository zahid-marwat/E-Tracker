# Expense Tracker App

A full-stack expense tracking application with Python Flask backend and HTML/CSS/JavaScript frontend.

## Features

- **📊 Comprehensive Dashboard**: View total expenses, loans given, loans taken, and net balance
- **💰 Advanced Expense Tracking**: Track expenses with categories, payment methods, locations, and tags
- **🏦 Loan Management**: Track loans you've given to others and loans you've taken with interest calculations
- **📈 Budget Planning**: Set and monitor budgets by category and time period
- **📱 Categories & Payment Methods**: Customizable categories with colors and icons
- **📊 Analytics & Reports**: Spending trends, category analysis, and financial insights
- **🔄 Data Backup & Export**: Full data export/import capabilities
- **📝 Transaction History**: Complete audit trail of all changes
- **⚙️ Settings**: Customize currency, theme, and preferences
- **📱 Recent Transactions**: View your latest financial activities

## Database Features

### 🗃️ Comprehensive Data Storage
- **SQLite Database**: Reliable local storage with SQLAlchemy ORM
- **8 Data Tables**: Users, Categories, Payment Methods, Expenses, Loans, Budgets, Transaction History
- **Full Relationships**: Proper foreign key relationships between all entities
- **Audit Trail**: Every change is logged for complete accountability

### 📊 Advanced Analytics
- Spending by category with visual charts
- Monthly and yearly spending trends
- Loan status and overdue tracking
- Budget vs actual spending comparisons

### 🛠️ Database Management Tools
```bash
# Database operations
python db_manager.py init          # Initialize database
python db_manager.py stats         # View statistics
python db_manager.py export        # Export all data
python db_manager.py import file   # Import data
python db_manager.py sample        # Add sample data
python db_manager.py recent 10     # View recent transactions
```

## Project Structure

```
expense-tracker-app/
├── backend/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   └── expense_tracker.db  # SQLite database (created automatically)
├── frontend/
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styles
│   └── script.js          # JavaScript functionality
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```powershell
   cd backend
   ```

2. Create a virtual environment:
   ```powershell
   python -m venv venv
   ```

3. Activate the virtual environment:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```

4. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

5. Run the Flask application:
   ```powershell
   python app.py
   ```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```powershell
   cd frontend
   ```

2. Open `index.html` in your web browser or serve it using a local server:
   ```powershell
   # Using Python's built-in server
   python -m http.server 8000
   ```

The frontend will be available at `http://localhost:8000`

## API Endpoints

### Core Endpoints
- `GET /api/status` - Get current financial status
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Add a new expense
- `GET /api/loans-given` - Get all loans given
- `POST /api/loans-given` - Add a new loan given
- `GET /api/loans-taken` - Get all loans taken
- `POST /api/loans-taken` - Add a new loan taken

### Enhanced Endpoints
- `GET/POST /api/categories` - Manage expense categories
- `GET/POST /api/payment-methods` - Manage payment methods
- `GET/POST /api/budgets` - Manage budgets
- `GET /api/transaction-history` - View audit trail
- `GET /api/analytics/spending-by-category` - Category analytics
- `GET /api/analytics/monthly-trends` - Monthly spending trends
- `GET /api/backup` - Export all data as JSON

## Usage

1. **Start the backend server** first by running `python app.py` in the backend directory
2. **Open the frontend** by opening `index.html` in your browser
3. **Add your first expense** by clicking the "Add Expense" button
4. **Track loans** using the "Add Loan Given" and "Add Loan Taken" buttons
5. **View your financial status** on the dashboard

## Technologies Used

### Backend
- Python 3.7+
- Flask - Web framework
- Flask-SQLAlchemy - Database ORM
- Flask-CORS - Cross-origin resource sharing
- SQLite - Database

### Frontend
- HTML5
- CSS3 with modern features (Grid, Flexbox, Gradients)
- Vanilla JavaScript (ES6+)
- Font Awesome icons

## Features in Detail

### Dashboard
- Real-time financial status overview
- Color-coded net balance (green for positive, red for negative)
- Recent transactions list

### Expense Tracking
- Categorized expenses (Food, Transportation, Entertainment, etc.)
- Date and time tracking
- Detailed transaction history

### Loan Management
- Track money lent to others
- Track money borrowed from others
- Person name and description fields
- Return/payment status tracking

### Settings
- Multiple currency support (USD, EUR, GBP, INR)
- Light/Dark theme toggle
- Local storage for user preferences

## Future Enhancements

- User authentication and multiple user support
- Data export functionality (CSV, PDF)
- Budget planning and alerts
- Charts and data visualization
- Mobile app version
- Bank account integration
- Recurring expense tracking
- Categories customization
