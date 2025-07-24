# 📊 Database Documentation - Expense Tracker

## Overview
The Expense Tracker uses SQLite as the default database with SQLAlchemy ORM for database operations. The database is designed to track expenses, loans, budgets, and provide comprehensive financial management.

## 🗃️ Database Tables

### 1. Users Table
Stores user account information for multi-user support.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer (PK) | Unique user identifier |
| username | String(80) | Unique username |
| email | String(120) | Unique email address |
| created_at | DateTime | Account creation timestamp |

### 2. Categories Table
Manages expense categories with visual customization.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer (PK) | Unique category identifier |
| name | String(50) | Category name (unique) |
| description | String(200) | Category description |
| color | String(7) | Hex color code for UI |
| icon | String(50) | Font Awesome icon class |
| created_at | DateTime | Creation timestamp |

**Default Categories:**
- Food (🍽️ #e74c3c)
- Transportation (🚗 #3498db)
- Entertainment (🎮 #9b59b6)
- Shopping (🛍️ #f39c12)
- Bills (📄 #e67e22)
- Healthcare (⚕️ #27ae60)
- Other (📋 #95a5a6)

### 3. Payment Methods Table
Tracks different payment methods used for expenses.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer (PK) | Unique method identifier |
| name | String(50) | Method name |
| type | String(20) | Type: cash, card, bank_transfer, digital_wallet |
| details | String(200) | Additional details (last 4 digits, etc.) |
| is_active | Boolean | Whether method is active |

**Default Payment Methods:**
- Cash
- Credit Card
- Debit Card
- Bank Transfer
- JazzCash (Pakistan mobile wallet)
- EasyPaisa (Pakistan mobile wallet)
- HBL Konnect (Pakistan digital wallet)
- SadaPay (Pakistan digital wallet)

### 4. Expenses Table
Core table for tracking all expenses.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer (PK) | Unique expense identifier |
| user_id | Integer (FK) | Reference to user (optional) |
| category_id | Integer (FK) | Reference to category |
| payment_method_id | Integer (FK) | Reference to payment method |
| amount | Float | Expense amount |
| description | String(200) | Expense description |
| category | String(50) | Category name (backward compatibility) |
| date | DateTime | Transaction date |
| location | String(200) | Where expense occurred |
| notes | Text | Additional notes |
| receipt_url | String(500) | URL to receipt image |
| tags | String(200) | Comma-separated tags |

### 5. Loans Given Table
Tracks money lent to others.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer (PK) | Unique loan identifier |
| user_id | Integer (FK) | Reference to user (optional) |
| amount | Float | Loan amount |
| person_name | String(100) | Borrower's name |
| person_contact | String(100) | Contact info (phone/email) |
| description | String(200) | Loan description |
| date | DateTime | Loan date |
| due_date | Date | Expected return date |
| interest_rate | Float | Interest rate (%) |
| is_returned | Boolean | Whether loan is returned |
| return_date | Date | Actual return date |
| notes | Text | Additional notes |

### 6. Loans Taken Table
Tracks money borrowed from others.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer (PK) | Unique loan identifier |
| user_id | Integer (FK) | Reference to user (optional) |
| amount | Float | Loan amount |
| person_name | String(100) | Lender's name |
| person_contact | String(100) | Contact info (phone/email) |
| description | String(200) | Loan description |
| date | DateTime | Loan date |
| due_date | Date | Expected payment date |
| interest_rate | Float | Interest rate (%) |
| is_paid | Boolean | Whether loan is paid |
| payment_date | Date | Actual payment date |
| notes | Text | Additional notes |

### 7. Budgets Table
Manages budget planning and tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer (PK) | Unique budget identifier |
| user_id | Integer (FK) | Reference to user |
| category_id | Integer (FK) | Reference to category |
| amount | Float | Budget amount |
| period | String(20) | Period: monthly, weekly, yearly |
| start_date | Date | Budget start date |
| end_date | Date | Budget end date |
| is_active | Boolean | Whether budget is active |

### 8. Transaction History Table
Audit trail for all database changes.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer (PK) | Unique record identifier |
| user_id | Integer (FK) | Reference to user (optional) |
| transaction_type | String(20) | Type: expense, loan_given, loan_taken |
| transaction_id | Integer | ID of the actual transaction |
| action | String(20) | Action: create, update, delete |
| old_data | Text | JSON of old data |
| new_data | Text | JSON of new data |
| timestamp | DateTime | When change occurred |
| ip_address | String(45) | IP address of user |
| user_agent | String(500) | Browser user agent |

## 🔗 Relationships

- **Users** → **Expenses** (One-to-Many)
- **Users** → **Loans Given** (One-to-Many)
- **Users** → **Loans Taken** (One-to-Many)
- **Users** → **Budgets** (One-to-Many)
- **Categories** → **Expenses** (One-to-Many)
- **Categories** → **Budgets** (One-to-Many)
- **Payment Methods** → **Expenses** (One-to-Many)

## 🚀 Database Operations

### Initialize Database
```bash
python db_manager.py init
```

### Reset Database (⚠️ Deletes all data)
```bash
python db_manager.py reset
```

### View Statistics
```bash
python db_manager.py stats
```

### Export Data
```bash
python db_manager.py export
```

### Import Data
```bash
python db_manager.py import backup_file.json
```

### Add Sample Data
```bash
python db_manager.py sample
```

### View Recent Transactions
```bash
python db_manager.py recent 20
```

## 📈 Analytics Queries

The database supports various analytics queries:

1. **Spending by Category**
   - Groups expenses by category
   - Shows total amount and count
   - Configurable date range

2. **Monthly Trends**
   - Shows spending trends by month
   - Useful for identifying patterns

3. **Loan Status**
   - Outstanding loans given/taken
   - Interest calculations
   - Overdue tracking

## 🔒 Data Security

1. **Audit Trail**: All changes are logged in transaction_history
2. **Data Validation**: SQLAlchemy models include constraints
3. **Backup Support**: Regular exports recommended
4. **Environment Variables**: Sensitive data in .env files

## 📊 Performance Considerations

1. **Indexes**: Added on frequently queried columns
2. **Pagination**: Large datasets are paginated
3. **Lazy Loading**: Relationships use lazy loading
4. **Query Optimization**: Efficient queries for analytics

## 🔧 Database Maintenance

### Regular Tasks
1. **Backup Data**: Export to JSON regularly
2. **Clean Old History**: Remove old transaction history records
3. **Update Categories**: Add/modify categories as needed
4. **Monitor Size**: Check database file size

### Troubleshooting
1. **Corruption**: Use SQLite integrity check
2. **Performance**: Analyze query patterns
3. **Space**: Vacuum database periodically

## 🌐 Migration Support

The database schema supports migrations:
1. Version tracking in metadata
2. Backward compatibility maintained
3. Data migration scripts available

## 📝 API Endpoints

All database operations are accessible via REST API:

- `GET /api/status` - Financial overview
- `GET/POST /api/expenses` - Expense operations
- `GET/POST /api/loans-given` - Loan given operations
- `GET/POST /api/loans-taken` - Loan taken operations
- `GET/POST /api/categories` - Category management
- `GET/POST /api/payment-methods` - Payment method management
- `GET/POST /api/budgets` - Budget management
- `GET /api/transaction-history` - Audit trail
- `GET /api/analytics/*` - Various analytics
- `GET /api/backup` - Data export

This comprehensive database design ensures reliable tracking of all financial activities while providing flexibility for future enhancements.
