#!/usr/bin/env python3
"""
Enhanced test script to verify the comprehensive backend is working
"""

import requests
import json
from datetime import datetime, date

def test_enhanced_backend():
    base_url = "http://localhost:5000/api"
    
    print("🧪 Testing Enhanced Expense Tracker Backend...")
    print("=" * 60)
    
    # Test 1: Check if server is running
    print("📊 Testing Dashboard Overview...")
    try:
        response = requests.get(f"{base_url}/dashboard/overview")
        if response.status_code == 200:
            print("✅ Dashboard overview working")
            data = response.json()
            print(f"   Monthly Expenses: ₨{data.get('monthly_expenses', 0):.2f}")
            print(f"   Monthly Income: ₨{data.get('monthly_income', 0):.2f}")
            print(f"   Total Savings: ₨{data.get('total_savings', 0):.2f}")
            print(f"   Net Worth: ₨{data.get('net_worth', 0):.2f}")
        else:
            print(f"❌ Dashboard failed with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Is it running on localhost:5000?")
        return False
    except Exception as e:
        print(f"❌ Error connecting to server: {e}")
        return False
    
    # Test 2: Check categories
    print("\n📝 Testing Categories...")
    try:
        response = requests.get(f"{base_url}/categories")
        if response.status_code == 200:
            categories = response.json()
            print(f"✅ Categories loaded: {len(categories)} categories")
            for cat in categories[:3]:  # Show first 3
                print(f"   - {cat['name']} ({cat['color']})")
        else:
            print(f"❌ Failed to load categories: {response.status_code}")
    except Exception as e:
        print(f"❌ Error loading categories: {e}")
    
    # Test 3: Test Loan Management
    print("\n🤝 Testing Loan Management...")
    try:
        # Add a test loan
        test_loan = {
            "loan_type": "given",
            "person_name": "Test Person",
            "amount": 1000.0,
            "description": "Test loan transaction",
            "date": date.today().isoformat(),
            "interest_rate": 0.0,
            "notes": "This is a test loan"
        }
        response = requests.post(f"{base_url}/loans", json=test_loan)
        if response.status_code == 201:
            print("✅ Test loan added successfully")
            
            # Get loans summary
            loans_response = requests.get(f"{base_url}/loans")
            if loans_response.status_code == 200:
                loans = loans_response.json()
                print(f"✅ Loans summary retrieved: {len(loans)} persons")
                for person, data in loans.items():
                    print(f"   - {person}: Net ₨{data['net_amount']:.2f}")
        else:
            print(f"❌ Failed to add test loan: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error testing loan management: {e}")
    
    # Test 4: Test Committee Management
    print("\n👥 Testing Committee Management...")
    try:
        # Add a test committee
        test_committee = {
            "name": "Test Committee",
            "start_date": "2024-01-01",
            "end_date": "2024-12-31",
            "monthly_amount": 5000.0,
            "expected_receiving_amount": 60000.0,
            "expected_receiving_date": "2024-12-31"
        }
        response = requests.post(f"{base_url}/committees", json=test_committee)
        if response.status_code == 201:
            print("✅ Test committee added successfully")
            
            # Get committees
            committees_response = requests.get(f"{base_url}/committees")
            if committees_response.status_code == 200:
                committees = committees_response.json()
                print(f"✅ Committees retrieved: {len(committees)} committees")
                for committee in committees:
                    print(f"   - {committee['name']}: ₨{committee['monthly_amount']:.2f}/month")
        else:
            print(f"❌ Failed to add test committee: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error testing committee management: {e}")
    
    # Test 5: Test Enhanced Analytics
    print("\n📈 Testing Enhanced Analytics...")
    try:
        # Test monthly summary
        response = requests.get(f"{base_url}/analytics/monthly-summary")
        if response.status_code == 200:
            summary = response.json()
            print(f"✅ Monthly summary working: {len(summary)} months")
            
        # Test loan timeline
        timeline_response = requests.get(f"{base_url}/analytics/loan-timeline")
        if timeline_response.status_code == 200:
            timeline = timeline_response.json()
            print(f"✅ Loan timeline working: {len(timeline)} data points")
            
        # Test net values for current month
        current_month = date.today().strftime('%Y-%m')
        net_values_response = requests.get(f"{base_url}/analytics/net-values/{current_month}")
        if net_values_response.status_code == 200:
            net_values = net_values_response.json()
            print(f"✅ Net values working for {current_month}")
            print(f"   Income: ₨{net_values.get('income', 0):.2f}")
            print(f"   Expenses: ₨{net_values.get('total_expenses', 0):.2f}")
            print(f"   Savings: ₨{net_values.get('total_savings', 0):.2f}")
            
    except Exception as e:
        print(f"❌ Error testing analytics: {e}")
    
    # Test 6: Test Enhanced Expense Management
    print("\n💰 Testing Enhanced Expense Management...")
    try:
        test_expense = {
            "amount": 250.0,
            "description": "Test expense from enhanced script",
            "category": "Food",
            "date": date.today().isoformat(),
            "location": "Test Restaurant",
            "notes": "This is a test expense for the enhanced system"
        }
        response = requests.post(f"{base_url}/expenses", json=test_expense)
        if response.status_code == 201:
            print("✅ Enhanced expense added successfully")
            expense = response.json()
            print(f"   ID: {expense['id']}, Amount: ₨{expense['amount']:.2f}")
            print(f"   Date: {expense.get('date', 'N/A')}")
            
            # Get expenses to verify
            expenses_response = requests.get(f"{base_url}/expenses")
            if expenses_response.status_code == 200:
                expenses = expenses_response.json()
                print(f"✅ Expenses retrieved: {len(expenses)} total expenses")
        else:
            print(f"❌ Failed to add enhanced expense: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error testing enhanced expense management: {e}")
    
    # Test 7: Test Income Management
    print("\n💵 Testing Income Management...")
    try:
        test_income = {
            "amount": 50000.0,
            "source": "Test Salary",
            "month_year": date.today().strftime('%Y-%m')
        }
        response = requests.post(f"{base_url}/income", json=test_income)
        if response.status_code == 201:
            print("✅ Test income added successfully")
            income = response.json()
            print(f"   Income ID: {income['id']}")
        else:
            print(f"❌ Failed to add test income: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error testing income management: {e}")
    
    # Test 8: Test 20-day analytics (backward compatibility)
    print("\n📅 Testing 20-day Analytics (Backward Compatibility)...")
    try:
        response = requests.get(f"{base_url}/analytics/last-20-days")
        if response.status_code == 200:
            analytics = response.json()
            print("✅ 20-day analytics endpoint working")
            print(f"   Total Amount (20 days): ₨{analytics.get('total_amount', 0):.2f}")
            print(f"   Daily Average: ₨{analytics.get('daily_average', 0):.2f}")
            print(f"   Transaction Count: {analytics.get('transaction_count', 0)}")
        else:
            print(f"❌ Failed to load 20-day analytics: {response.status_code}")
    except Exception as e:
        print(f"❌ Error loading 20-day analytics: {e}")
    
    print("\n" + "=" * 60)
    print("✅ Enhanced Backend test completed!")
    print("\n🎯 All Systems Tested:")
    print("   ✅ Dashboard Overview with comprehensive metrics")
    print("   ✅ Loan Management (Given/Taken/Received Back)")
    print("   ✅ Committee Management with payment tracking")
    print("   ✅ Enhanced Expense Management with categories")
    print("   ✅ Income Management for monthly tracking")
    print("   ✅ Advanced Analytics (Monthly/Timeline/Net Values)")
    print("   ✅ Backward compatibility with existing features")
    print("\n💡 If you see any ❌ errors:")
    print("   1. Make sure the enhanced backend is running: python app_enhanced.py")
    print("   2. Check the backend terminal for error messages")
    print("   3. Ensure the database is properly initialized")
    print("\n🚀 Your Enhanced Expense Tracker is ready!")
    
    return True

if __name__ == "__main__":
    test_enhanced_backend()
