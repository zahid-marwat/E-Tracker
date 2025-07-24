from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date, timedelta
from sqlalchemy import func, extract, and_, or_
import calendar
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///expense_tracker_enhanced.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)

# Enhanced Database Models
class Person(db.Model):
    __tablename__ = 'persons'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    contact = db.Column(db.String(50))
    email = db.Column(db.String(120))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    loans = db.relationship('Loan', backref='person', lazy=True)

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(200))
    color = db.Column(db.String(7), default='#95a5a6')
    icon = db.Column(db.String(50), default='fas fa-circle')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    expenses = db.relationship('Expense', backref='category', lazy=True)

class PaymentMethod(db.Model):
    __tablename__ = 'payment_methods'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    type = db.Column(db.String(20), nullable=False)
    details = db.Column(db.String(200))
    is_active = db.Column(db.Boolean, default=True)

class Expense(db.Model):
    __tablename__ = 'expenses'
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    payment_method_id = db.Column(db.Integer, db.ForeignKey('payment_methods.id'))
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200), nullable=False)
    date = db.Column(db.Date, default=date.today)
    location = db.Column(db.String(200))
    notes = db.Column(db.Text)
    tags = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Loan(db.Model):
    __tablename__ = 'loans'
    id = db.Column(db.Integer, primary_key=True)
    person_id = db.Column(db.Integer, db.ForeignKey('persons.id'), nullable=False)
    loan_type = db.Column(db.String(20), nullable=False)  # 'given', 'taken', 'received_back'
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200))
    date = db.Column(db.Date, default=date.today)
    due_date = db.Column(db.Date)
    interest_rate = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(20), default='active')  # 'active', 'paid', 'partial'
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Committee(db.Model):
    __tablename__ = 'committees'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    monthly_amount = db.Column(db.Float, nullable=False)
    expected_receiving_amount = db.Column(db.Float, nullable=False)
    expected_receiving_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='active')  # 'active', 'completed', 'paused'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    payments = db.relationship('CommitteePayment', backref='committee', lazy=True)

class CommitteePayment(db.Model):
    __tablename__ = 'committee_payments'
    id = db.Column(db.Integer, primary_key=True)
    committee_id = db.Column(db.Integer, db.ForeignKey('committees.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.Date, default=date.today)
    month_year = db.Column(db.String(7), nullable=False)  # Format: "2024-01"
    status = db.Column(db.String(20), default='paid')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class MonthlyIncome(db.Model):
    __tablename__ = 'monthly_income'
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    month_year = db.Column(db.String(7), nullable=False)  # Format: "2024-01"
    source = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# API Routes

# Dashboard Overview
@app.route('/api/dashboard/overview', methods=['GET'])
def get_dashboard_overview():
    current_month = date.today().strftime('%Y-%m')
    
    # Monthly expenses (including committee payments)
    monthly_expenses = db.session.query(func.sum(Expense.amount)).filter(
        func.strftime('%Y-%m', Expense.date) == current_month
    ).scalar() or 0
    
    committee_payments = db.session.query(func.sum(CommitteePayment.amount)).filter(
        CommitteePayment.month_year == current_month
    ).scalar() or 0
    
    total_monthly_expenses = monthly_expenses + committee_payments
    
    # Loan summary
    total_given = db.session.query(func.sum(Loan.amount)).filter(
        Loan.loan_type == 'given'
    ).scalar() or 0
    
    total_taken = db.session.query(func.sum(Loan.amount)).filter(
        Loan.loan_type == 'taken'
    ).scalar() or 0
    
    total_received_back = db.session.query(func.sum(Loan.amount)).filter(
        Loan.loan_type == 'received_back'
    ).scalar() or 0
    
    net_loan = total_given - total_taken - total_received_back
    
    # Monthly income
    monthly_income = db.session.query(func.sum(MonthlyIncome.amount)).filter(
        MonthlyIncome.month_year == current_month
    ).scalar() or 0
    
    total_savings = monthly_income - total_monthly_expenses
    net_worth = total_savings + net_loan
    
    return jsonify({
        'monthly_expenses': total_monthly_expenses,
        'committee_payments': committee_payments,
        'total_given': total_given,
        'total_taken': total_taken,
        'total_received_back': total_received_back,
        'net_loan': net_loan,
        'monthly_income': monthly_income,
        'total_savings': total_savings,
        'net_worth': net_worth,
        'current_month': current_month
    })

# Status endpoint (for backward compatibility)
@app.route('/api/status', methods=['GET'])
def status():
    # Get total expenses
    total_expenses = db.session.query(func.sum(Expense.amount)).scalar() or 0
    
    # Get loan totals
    total_loans_given = db.session.query(func.sum(Loan.amount)).filter(
        Loan.loan_type == 'given'
    ).scalar() or 0
    
    total_loans_taken = db.session.query(func.sum(Loan.amount)).filter(
        Loan.loan_type == 'taken'
    ).scalar() or 0
    
    net_balance = total_loans_given - total_loans_taken
    
    return jsonify({
        'total_expenses': total_expenses,
        'total_loans_given': total_loans_given,
        'total_loans_taken': total_loans_taken,
        'net_balance': net_balance
    })

# Categories
@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([{
        'id': cat.id,
        'name': cat.name,
        'color': cat.color,
        'icon': cat.icon,
        'description': cat.description
    } for cat in categories])

# Payment Methods
@app.route('/api/payment-methods', methods=['GET'])
def get_payment_methods():
    methods = PaymentMethod.query.filter_by(is_active=True).all()
    return jsonify([{
        'id': method.id,
        'name': method.name,
        'type': method.type,
        'details': method.details
    } for method in methods])

# Loan Management
@app.route('/api/loans', methods=['GET'])
def get_loans():
    loans = db.session.query(Loan, Person.name).join(Person).all()
    
    # Group by person
    loan_summary = {}
    for loan, person_name in loans:
        if person_name not in loan_summary:
            loan_summary[person_name] = {
                'person_id': loan.person_id,
                'given': 0,
                'taken': 0,
                'received_back': 0,
                'net_amount': 0,
                'transactions': []
            }
        
        amount = loan.amount
        if loan.loan_type == 'given':
            loan_summary[person_name]['given'] += amount
        elif loan.loan_type == 'taken':
            loan_summary[person_name]['taken'] += amount
        elif loan.loan_type == 'received_back':
            loan_summary[person_name]['received_back'] += amount
        
        loan_summary[person_name]['transactions'].append({
            'id': loan.id,
            'type': loan.loan_type,
            'amount': amount,
            'date': loan.date.isoformat() if loan.date else None,
            'description': loan.description,
            'status': loan.status,
            'due_date': loan.due_date.isoformat() if loan.due_date else None,
            'interest_rate': loan.interest_rate
        })
    
    # Calculate net amounts
    for person_data in loan_summary.values():
        person_data['net_amount'] = (
            person_data['given'] - person_data['taken'] - person_data['received_back']
        )
    
    return jsonify(loan_summary)

@app.route('/api/loans', methods=['POST'])
def add_loan():
    data = request.json
    
    try:
        # Find or create person
        person = Person.query.filter_by(name=data['person_name']).first()
        if not person:
            person = Person(
                name=data['person_name'],
                contact=data.get('contact', ''),
                email=data.get('email', '')
            )
            db.session.add(person)
            db.session.flush()
        
        loan = Loan(
            person_id=person.id,
            loan_type=data['loan_type'],
            amount=float(data['amount']),
            description=data.get('description', ''),
            date=datetime.strptime(data.get('date', date.today().isoformat()), '%Y-%m-%d').date(),
            due_date=datetime.strptime(data['due_date'], '%Y-%m-%d').date() if data.get('due_date') else None,
            interest_rate=float(data.get('interest_rate', 0)),
            notes=data.get('notes', '')
        )
        
        db.session.add(loan)
        db.session.commit()
        
        return jsonify({'message': 'Loan added successfully', 'id': loan.id}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to add loan: {str(e)}'}), 500

# Committee Management
@app.route('/api/committees', methods=['GET'])
def get_committees():
    committees = Committee.query.all()
    result = []
    
    for committee in committees:
        payments = CommitteePayment.query.filter_by(committee_id=committee.id).all()
        total_paid = sum(p.amount for p in payments)
        
        result.append({
            'id': committee.id,
            'name': committee.name,
            'start_date': committee.start_date.isoformat(),
            'end_date': committee.end_date.isoformat(),
            'monthly_amount': committee.monthly_amount,
            'expected_receiving_amount': committee.expected_receiving_amount,
            'expected_receiving_date': committee.expected_receiving_date.isoformat(),
            'status': committee.status,
            'total_paid': total_paid,
            'payments': [{
                'id': p.id,
                'amount': p.amount,
                'payment_date': p.payment_date.isoformat(),
                'month_year': p.month_year,
                'status': p.status
            } for p in payments]
        })
    
    return jsonify(result)

@app.route('/api/committees', methods=['POST'])
def add_committee():
    data = request.json
    
    try:
        committee = Committee(
            name=data['name'],
            start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date(),
            end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date(),
            monthly_amount=float(data['monthly_amount']),
            expected_receiving_amount=float(data['expected_receiving_amount']),
            expected_receiving_date=datetime.strptime(data['expected_receiving_date'], '%Y-%m-%d').date()
        )
        
        db.session.add(committee)
        db.session.commit()
        
        return jsonify({'message': 'Committee added successfully', 'id': committee.id}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to add committee: {str(e)}'}), 500

@app.route('/api/committees/<int:committee_id>/payment', methods=['POST'])
def add_committee_payment(committee_id):
    data = request.json
    
    try:
        payment_date = datetime.strptime(data.get('payment_date', date.today().isoformat()), '%Y-%m-%d').date()
        month_year = data.get('month_year', payment_date.strftime('%Y-%m'))
        
        payment = CommitteePayment(
            committee_id=committee_id,
            amount=float(data['amount']),
            payment_date=payment_date,
            month_year=month_year
        )
        
        db.session.add(payment)
        
        # Also add to expenses
        committee = Committee.query.get(committee_id)
        committee_category = get_or_create_category("Committee")
        
        expense = Expense(
            amount=float(data['amount']),
            description=f"Committee Payment - {committee.name}",
            category_id=committee_category.id,
            date=payment_date
        )
        
        db.session.add(expense)
        db.session.commit()
        
        return jsonify({'message': 'Committee payment added successfully', 'id': payment.id}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to add committee payment: {str(e)}'}), 500

# Expense Management
@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    expenses = db.session.query(
        Expense, Category.name.label('category_name'), Category.color, Category.icon
    ).join(Category).order_by(Expense.date.desc()).all()
    
    return jsonify([{
        'id': expense.id,
        'amount': expense.amount,
        'description': expense.description,
        'category': category_name,
        'category_color': color,
        'category_icon': icon,
        'date': expense.date.isoformat() if expense.date else None,
        'location': expense.location,
        'notes': expense.notes,
        'tags': expense.tags,
        'created_at': expense.created_at.isoformat() if expense.created_at else None
    } for expense, category_name, color, icon in expenses])

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    data = request.json
    
    try:
        category = get_or_create_category(data.get('category', 'Others'))
        
        expense = Expense(
            amount=float(data['amount']),
            description=data['description'],
            category_id=category.id,
            date=datetime.strptime(data.get('date', date.today().isoformat()), '%Y-%m-%d').date(),
            location=data.get('location', ''),
            notes=data.get('notes', ''),
            tags=data.get('tags', '')
        )
        
        db.session.add(expense)
        db.session.commit()
        
        return jsonify({
            'message': 'Expense added successfully',
            'id': expense.id,
            'amount': expense.amount,
            'date': expense.date.isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to add expense: {str(e)}'}), 500

# Monthly Income
@app.route('/api/income', methods=['POST'])
def add_monthly_income():
    data = request.json
    
    try:
        income = MonthlyIncome(
            amount=float(data['amount']),
            month_year=data['month_year'],
            source=data.get('source', '')
        )
        
        db.session.add(income)
        db.session.commit()
        
        return jsonify({'message': 'Income added successfully', 'id': income.id}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to add income: {str(e)}'}), 500

# Analytics endpoints
@app.route('/api/analytics/last-20-days', methods=['GET'])
def last_20_days_analytics():
    cutoff_date = date.today() - timedelta(days=20)
    
    # Get expenses from last 20 days
    expenses = Expense.query.filter(Expense.date >= cutoff_date).all()
    
    total_amount = sum(exp.amount for exp in expenses)
    transaction_count = len(expenses)
    daily_average = total_amount / 20 if total_amount > 0 else 0
    
    return jsonify({
        'total_amount': total_amount,
        'transaction_count': transaction_count,
        'daily_average': daily_average,
        'period_days': 20
    })

@app.route('/api/analytics/monthly-summary', methods=['GET'])
def get_monthly_summary():
    # Get last 12 months of data
    end_date = date.today()
    start_date = date(end_date.year - 1, end_date.month, 1)
    
    # Monthly expenses by category
    monthly_expenses = db.session.query(
        func.strftime('%Y-%m', Expense.date).label('month'),
        Category.name.label('category'),
        func.sum(Expense.amount).label('total')
    ).join(Category).filter(
        Expense.date >= start_date
    ).group_by(
        func.strftime('%Y-%m', Expense.date),
        Category.name
    ).order_by('month').all()
    
    # Organize by month
    summary = {}
    for month, category, total in monthly_expenses:
        if month not in summary:
            summary[month] = {'expenses': {}, 'total_expenses': 0}
        summary[month]['expenses'][category] = total
        summary[month]['total_expenses'] += total
    
    # Add income data
    incomes = MonthlyIncome.query.filter(
        MonthlyIncome.month_year >= start_date.strftime('%Y-%m')
    ).all()
    
    for income in incomes:
        if income.month_year not in summary:
            summary[income.month_year] = {'expenses': {}, 'total_expenses': 0}
        if 'income' not in summary[income.month_year]:
            summary[income.month_year]['income'] = 0
        summary[income.month_year]['income'] += income.amount
    
    # Add committee payments
    committee_payments = db.session.query(
        CommitteePayment.month_year,
        func.sum(CommitteePayment.amount).label('total')
    ).group_by(CommitteePayment.month_year).all()
    
    for month_year, total in committee_payments:
        if month_year in summary:
            summary[month_year]['committee_payments'] = total
            summary[month_year]['total_expenses'] += total
    
    # Calculate savings
    for month_data in summary.values():
        income = month_data.get('income', 0)
        total_exp = month_data.get('total_expenses', 0)
        month_data['savings'] = income - total_exp
    
    return jsonify(summary)

@app.route('/api/analytics/loan-timeline', methods=['GET'])
def get_loan_timeline():
    # Get all loans ordered by date
    loans = Loan.query.order_by(Loan.date).all()
    
    timeline = []
    cumulative_net = 0
    
    for loan in loans:
        if loan.loan_type == 'given':
            cumulative_net += loan.amount
        elif loan.loan_type == 'taken':
            cumulative_net -= loan.amount
        elif loan.loan_type == 'received_back':
            cumulative_net -= loan.amount
        
        timeline.append({
            'date': loan.date.isoformat() if loan.date else None,
            'month': loan.date.strftime('%Y-%m') if loan.date else None,
            'type': loan.loan_type,
            'amount': loan.amount,
            'cumulative_net': cumulative_net,
            'person': loan.person.name,
            'description': loan.description
        })
    
    return jsonify(timeline)

@app.route('/api/analytics/net-values/<string:month>', methods=['GET'])
def get_net_values_for_month(month):
    """Get all net values for a specific month (format: YYYY-MM)"""
    
    # Parse month
    try:
        year, month_num = month.split('-')
        year = int(year)
        month_num = int(month_num)
    except ValueError:
        return jsonify({'error': 'Invalid month format. Use YYYY-MM'}), 400
    
    # Expenses for the month
    monthly_expenses = db.session.query(func.sum(Expense.amount)).filter(
        func.strftime('%Y-%m', Expense.date) == month
    ).scalar() or 0
    
    # Committee payments for the month
    committee_payments = db.session.query(func.sum(CommitteePayment.amount)).filter(
        CommitteePayment.month_year == month
    ).scalar() or 0
    
    # Loan data for the month
    loan_given = db.session.query(func.sum(Loan.amount)).filter(
        func.strftime('%Y-%m', Loan.date) == month,
        Loan.loan_type == 'given'
    ).scalar() or 0
    
    loan_taken = db.session.query(func.sum(Loan.amount)).filter(
        func.strftime('%Y-%m', Loan.date) == month,
        Loan.loan_type == 'taken'
    ).scalar() or 0
    
    loan_received_back = db.session.query(func.sum(Loan.amount)).filter(
        func.strftime('%Y-%m', Loan.date) == month,
        Loan.loan_type == 'received_back'
    ).scalar() or 0
    
    # Income for the month
    monthly_income = db.session.query(func.sum(MonthlyIncome.amount)).filter(
        MonthlyIncome.month_year == month
    ).scalar() or 0
    
    # Calculations
    total_expenses = monthly_expenses + committee_payments
    net_loan = loan_given - loan_taken - loan_received_back
    total_savings = monthly_income - total_expenses
    net_worth = total_savings + net_loan
    
    return jsonify({
        'month': month,
        'loan_given': loan_given,
        'loan_taken': loan_taken,
        'loan_received_back': loan_received_back,
        'net_loan': net_loan,
        'income': monthly_income,
        'total_expenses': total_expenses,
        'committee_payments': committee_payments,
        'total_savings': total_savings,
        'net_worth': net_worth
    })

# Helper functions
def get_or_create_category(name):
    category = Category.query.filter_by(name=name).first()
    if not category:
        colors = ['#e74c3c', '#3498db', '#9b59b6', '#f39c12', '#e67e22', '#27ae60', '#95a5a6', '#34495e', '#1abc9c', '#8e44ad']
        icons = ['fas fa-utensils', 'fas fa-car', 'fas fa-gamepad', 'fas fa-shopping-bag', 
                'fas fa-home', 'fas fa-dumbbell', 'fas fa-bus', 'fas fa-graduation-cap',
                'fas fa-plane', 'fas fa-users', 'fas fa-circle']
        
        category_count = Category.query.count()
        category = Category(
            name=name,
            color=colors[category_count % len(colors)],
            icon=icons[category_count % len(icons)]
        )
        db.session.add(category)
        db.session.flush()
    return category

def init_default_data():
    # Create default categories if they don't exist
    default_categories = [
        ('Food', '#e74c3c', 'fas fa-utensils'),
        ('Shopping', '#f39c12', 'fas fa-shopping-bag'),
        ('Home', '#27ae60', 'fas fa-home'),
        ('Sports', '#9b59b6', 'fas fa-dumbbell'),
        ('Commute', '#34495e', 'fas fa-bus'),
        ('Education', '#e67e22', 'fas fa-graduation-cap'),
        ('Trip', '#1abc9c', 'fas fa-plane'),
        ('Committee', '#8e44ad', 'fas fa-users'),
        ('Others', '#95a5a6', 'fas fa-circle')
    ]
    
    for name, color, icon in default_categories:
        if not Category.query.filter_by(name=name).first():
            category = Category(name=name, color=color, icon=icon)
            db.session.add(category)
    
    # Create default payment methods
    default_payment_methods = [
        ('Cash', 'cash', 'Physical cash payments'),
        ('Credit Card', 'card', 'Credit card payments'),
        ('Debit Card', 'card', 'Debit card payments'),
        ('Bank Transfer', 'transfer', 'Online bank transfers'),
        ('Mobile Wallet', 'digital', 'Mobile wallet payments'),
        ('UPI', 'digital', 'UPI payments'),
        ('Cheque', 'cheque', 'Cheque payments'),
        ('Other', 'other', 'Other payment methods')
    ]
    
    for name, type_val, details in default_payment_methods:
        if not PaymentMethod.query.filter_by(name=name).first():
            method = PaymentMethod(name=name, type=type_val, details=details)
            db.session.add(method)
    
    db.session.commit()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        init_default_data()
    app.run(debug=True, host='127.0.0.1', port=5000)
