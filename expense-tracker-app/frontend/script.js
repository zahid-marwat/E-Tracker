// Enhanced Expense Tracker JavaScript
const API_BASE_URL = 'http://localhost:5000/api';

// Test API connection on load
async function testConnection() {
    try {
        console.log('Testing API connection...');
        const response = await fetch(`${API_BASE_URL}/dashboard/overview`);
        console.log('Connection test response:', response.status, response.ok);
        if (response.ok) {
            const data = await response.json();
            console.log('Connection test data:', data);
        }
    } catch (error) {
        console.error('Connection test failed:', error);
    }
}

// Global variables
let loanTimelineChart = null;
let monthlyExpenseChart = null;
let netValuesChart = null;
let monthlyExpensesData = {};
let currentMonth = new Date().toISOString().slice(0, 7);

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced Expense Tracker loaded');
    initializeApp();
});

async function initializeApp() {
    console.log('Initializing app...');
    await testConnection();
    setCurrentDate();
    setTodayAsDefault();
    await loadDashboardOverview();
    await loadLoanDashboard();
    await loadCommitteeDashboard();
    await loadExpensesDashboard();
    await loadNetValuesDashboard();
    setupEventListeners();
}

function setCurrentDate() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('currentDate').textContent = dateStr;
}

function setTodayAsDefault() {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Set default dates in forms
    const dateInputs = ['expenseDate', 'loanDate', 'paymentDate'];
    dateInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = today;
    });
    
    // Set default months
    const monthInputs = ['expenseMonth', 'incomeMonth', 'paymentMonth', 'netValuesMonth'];
    monthInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = currentMonth;
    });
}

// API Helper Functions
async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        console.log(`Making ${method} request to ${API_BASE_URL}${endpoint}`);
        console.log('Request data:', data);
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        console.log('Fetch options:', options);
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error text:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Response data:', result);
        return result;
    } catch (error) {
        console.error(`API request failed: ${endpoint}`, error);
        showNotification(`Error: ${error.message}`, 'error');
        throw error;
    }
}

// Dashboard Overview
async function loadDashboardOverview() {
    try {
        const data = await apiRequest('/dashboard/overview');
        
        document.getElementById('monthlyIncome').textContent = formatCurrency(data.monthly_income);
        document.getElementById('totalExpenses').textContent = formatCurrency(data.monthly_expenses);
        document.getElementById('totalSavings').textContent = formatCurrency(data.total_savings);
        document.getElementById('netWorth').textContent = formatCurrency(data.net_worth);
        
    } catch (error) {
        console.error('Failed to load dashboard overview:', error);
    }
}

// Loan Dashboard
async function loadLoanDashboard() {
    try {
        const loans = await apiRequest('/loans');
        displayLoanSummary(loans);
        await loadLoanTimeline();
    } catch (error) {
        console.error('Failed to load loan dashboard:', error);
    }
}

function displayLoanSummary(loans) {
    const container = document.getElementById('loanSummaryTable');
    container.innerHTML = '';
    
    if (Object.keys(loans).length === 0) {
        container.innerHTML = '<p class="text-center">No loan transactions yet.</p>';
        return;
    }
    
    Object.entries(loans).forEach(([personName, loanData]) => {
        const netAmount = loanData.net_amount;
        const netAmountClass = netAmount > 0 ? 'positive' : netAmount < 0 ? 'negative' : 'zero';
        const netAmountText = netAmount > 0 ? `They owe you ₨${Math.abs(netAmount).toFixed(2)}` :
                              netAmount < 0 ? `You owe them ₨${Math.abs(netAmount).toFixed(2)}` :
                              'All settled';
        
        const personCard = document.createElement('div');
        personCard.className = 'loan-person-card';
        personCard.innerHTML = `
            <div class="loan-person-header">
                <div class="loan-person-name">${personName}</div>
                <div class="loan-net-amount ${netAmountClass}">${netAmountText}</div>
            </div>
            <div class="loan-summary-row">
                <div class="loan-summary-item">
                    <div class="label">Given</div>
                    <div class="value">₨${loanData.given.toFixed(2)}</div>
                </div>
                <div class="loan-summary-item">
                    <div class="label">Taken</div>
                    <div class="value">₨${loanData.taken.toFixed(2)}</div>
                </div>
                <div class="loan-summary-item">
                    <div class="label">Received Back</div>
                    <div class="value">₨${loanData.received_back.toFixed(2)}</div>
                </div>
                <div class="loan-summary-item">
                    <div class="label">Transactions</div>
                    <div class="value">${loanData.transactions.length}</div>
                </div>
            </div>
            <div class="loan-transactions">
                <h4>Recent Transactions:</h4>
                ${loanData.transactions.slice(-3).map(t => `
                    <div class="transaction-item">
                        <span class="transaction-type">${t.type.replace('_', ' ').toUpperCase()}</span>
                        <span class="transaction-amount">₨${t.amount.toFixed(2)}</span>
                        <span class="transaction-date">${formatDate(t.date)}</span>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(personCard);
    });
}

async function loadLoanTimeline() {
    try {
        const timeline = await apiRequest('/analytics/loan-timeline');
        displayLoanTimelineChart(timeline);
    } catch (error) {
        console.error('Failed to load loan timeline:', error);
    }
}

function displayLoanTimelineChart(timeline) {
    const ctx = document.getElementById('loanTimelineChart').getContext('2d');
    
    if (loanTimelineChart) {
        loanTimelineChart.destroy();
    }
    
    const labels = timeline.map(item => formatDate(item.date));
    const data = timeline.map(item => item.cumulative_net);
    
    loanTimelineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Net Loan Amount (₨)',
                data: data,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Loan Net Amount Over Time'
                },
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₨' + value.toFixed(0);
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Committee Dashboard
async function loadCommitteeDashboard() {
    try {
        const committees = await apiRequest('/committees');
        displayCommittees(committees);
        await populateCommitteePaymentDropdown(committees);
    } catch (error) {
        console.error('Failed to load committee dashboard:', error);
    }
}

function displayCommittees(committees) {
    const container = document.getElementById('committeeList');
    container.innerHTML = '';
    
    if (committees.length === 0) {
        container.innerHTML = '<p class="text-center">No committees found. Add a committee to get started.</p>';
        return;
    }
    
    committees.forEach(committee => {
        const progressPercentage = (committee.total_paid / committee.expected_receiving_amount) * 100;
        
        const committeeCard = document.createElement('div');
        committeeCard.className = 'committee-card';
        committeeCard.innerHTML = `
            <div class="committee-header">
                <div class="committee-name">${committee.name}</div>
                <div class="committee-status ${committee.status}">${committee.status}</div>
            </div>
            <div class="committee-details">
                <div class="committee-detail">
                    <div class="label">Monthly Amount</div>
                    <div class="value">₨${committee.monthly_amount.toFixed(2)}</div>
                </div>
                <div class="committee-detail">
                    <div class="label">Total Paid</div>
                    <div class="value">₨${committee.total_paid.toFixed(2)}</div>
                </div>
                <div class="committee-detail">
                    <div class="label">Expected Amount</div>
                    <div class="value">₨${committee.expected_receiving_amount.toFixed(2)}</div>
                </div>
                <div class="committee-detail">
                    <div class="label">Expected Date</div>
                    <div class="value">${formatDate(committee.expected_receiving_date)}</div>
                </div>
            </div>
            <div class="committee-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(progressPercentage, 100)}%"></div>
                </div>
                <div class="progress-text">${progressPercentage.toFixed(1)}% Complete</div>
            </div>
            <div class="committee-payments">
                <h4>Recent Payments:</h4>
                ${committee.payments.slice(-3).map(p => `
                    <div class="payment-item">
                        <span class="payment-amount">₨${p.amount.toFixed(2)}</span>
                        <span class="payment-date">${formatDate(p.payment_date)}</span>
                        <span class="payment-month">(${p.month_year})</span>
                    </div>
                `).join('') || '<p>No payments yet</p>'}
            </div>
        `;
        container.appendChild(committeeCard);
    });
}

async function populateCommitteePaymentDropdown(committees) {
    const select = document.getElementById('paymentCommittee');
    select.innerHTML = '<option value="">Select Committee</option>';
    
    committees.filter(c => c.status === 'active').forEach(committee => {
        const option = document.createElement('option');
        option.value = committee.id;
        option.textContent = `${committee.name} (₨${committee.monthly_amount.toFixed(2)}/month)`;
        select.appendChild(option);
    });
}

// Expenses Dashboard
async function loadExpensesDashboard() {
    try {
        const summary = await apiRequest('/analytics/monthly-summary');
        monthlyExpensesData = summary;
        displayMonthlyExpensesTable(summary);
        
        // Set default month and load chart
        const monthInput = document.getElementById('expenseMonth');
        monthInput.value = currentMonth;
        await loadMonthlyExpenses();
    } catch (error) {
        console.error('Failed to load expenses dashboard:', error);
    }
}

function displayMonthlyExpensesTable(summary) {
    const tbody = document.getElementById('monthlyExpensesBody');
    tbody.innerHTML = '';
    
    if (Object.keys(summary).length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" class="text-center">No expense data available</td></tr>';
        return;
    }
    
    // Sort months in descending order
    const sortedMonths = Object.keys(summary).sort((a, b) => b.localeCompare(a));
    const currentDate = new Date();
    const currentMonthStr = currentDate.toISOString().slice(0, 7);
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toISOString().slice(0, 7);
    const secondLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1).toISOString().slice(0, 7);
    
    sortedMonths.forEach(month => {
        const data = summary[month];
        const expenses = data.expenses || {};
        const isEditable = month === currentMonthStr || month === lastMonth || month === secondLastMonth;
        
        const row = document.createElement('tr');
        if (month === currentMonthStr) {
            row.classList.add('editable-row');
        }
        
        row.innerHTML = `
            <td><strong>${formatMonth(month)}</strong></td>
            <td>₨${(expenses.Food || 0).toFixed(2)}</td>
            <td>₨${(expenses.Shopping || 0).toFixed(2)}</td>
            <td>₨${(expenses.Home || 0).toFixed(2)}</td>
            <td>₨${(expenses.Sports || 0).toFixed(2)}</td>
            <td>₨${(expenses.Commute || 0).toFixed(2)}</td>
            <td>₨${(expenses.Education || 0).toFixed(2)}</td>
            <td>₨${(expenses.Trip || 0).toFixed(2)}</td>
            <td>₨${(expenses.Committee || 0).toFixed(2)}</td>
            <td>₨${(expenses.Others || 0).toFixed(2)}</td>
            <td><strong>₨${data.total_expenses.toFixed(2)}</strong></td>
            <td class="month-actions">
                ${isEditable ? `<button class="btn-edit" onclick="editMonth('${month}')">Edit</button>` : 'Fixed'}
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function loadMonthlyExpenses() {
    const selectedMonth = document.getElementById('expenseMonth').value;
    if (!selectedMonth) return;
    
    try {
        const data = await apiRequest(`/analytics/net-values/${selectedMonth}`);
        displayMonthlyExpenseChart(data, selectedMonth);
    } catch (error) {
        console.error('Failed to load monthly expenses:', error);
    }
}

function displayMonthlyExpenseChart(data, month) {
    const ctx = document.getElementById('monthlyExpenseChart').getContext('2d');
    
    if (monthlyExpenseChart) {
        monthlyExpenseChart.destroy();
    }
    
    const categories = ['Food', 'Shopping', 'Home', 'Sports', 'Commute', 'Education', 'Trip', 'Committee', 'Others'];
    const values = categories.map(cat => monthlyExpensesData[month]?.expenses[cat] || 0);
    const colors = ['#e74c3c', '#f39c12', '#27ae60', '#9b59b6', '#34495e', '#e67e22', '#1abc9c', '#8e44ad', '#95a5a6'];
    
    monthlyExpenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: `Expenses for ${formatMonth(month)}`,
                data: values,
                backgroundColor: colors,
                borderColor: colors.map(color => color + '80'),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `Monthly Expenses - ${formatMonth(month)}`
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₨' + value.toFixed(0);
                        }
                    }
                }
            }
        }
    });
}

// Net Values Dashboard
async function loadNetValuesDashboard() {
    const month = document.getElementById('netValuesMonth').value;
    await loadNetValues(month);
}

async function loadNetValues(month = null) {
    if (!month) {
        month = document.getElementById('netValuesMonth').value || currentMonth;
    }
    
    try {
        const data = await apiRequest(`/analytics/net-values/${month}`);
        displayNetValuesGrid(data);
        displayNetValuesChart(data, month);
    } catch (error) {
        console.error('Failed to load net values:', error);
    }
}

function displayNetValuesGrid(data) {
    const container = document.getElementById('netValuesGrid');
    container.innerHTML = '';
    
    const netValues = [
        { label: 'Loan Given', value: data.loan_given, class: 'loan-given' },
        { label: 'Loan Taken', value: data.loan_taken, class: 'loan-taken' },
        { label: 'Loan Received Back', value: data.loan_received_back, class: 'loan-received' },
        { label: 'Net Loan', value: data.net_loan, class: 'net-loan' },
        { label: 'Income', value: data.income, class: 'income' },
        { label: 'Total Expenses', value: data.total_expenses, class: 'expenses' },
        { label: 'Total Savings', value: data.total_savings, class: 'savings' },
        { label: 'Net Worth', value: data.net_worth, class: 'net-worth' }
    ];
    
    netValues.forEach(item => {
        const card = document.createElement('div');
        card.className = `net-value-card ${item.class}`;
        card.innerHTML = `
            <h4>${item.label}</h4>
            <div class="amount">${formatCurrency(item.value)}</div>
        `;
        container.appendChild(card);
    });
}

function displayNetValuesChart(data, month) {
    const ctx = document.getElementById('netValuesChart').getContext('2d');
    
    if (netValuesChart) {
        netValuesChart.destroy();
    }
    
    const labels = ['Loan Given', 'Loan Taken', 'Net Loan', 'Income', 'Expenses', 'Savings', 'Net Worth'];
    const values = [
        data.loan_given,
        data.loan_taken,
        data.net_loan,
        data.income,
        data.total_expenses,
        data.total_savings,
        data.net_worth
    ];
    const colors = ['#ff6b6b', '#4ecdc4', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
    
    netValuesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Financial Overview - ${formatMonth(month)}`,
                data: values,
                backgroundColor: colors,
                borderColor: colors.map(color => color + '80'),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `Financial Overview - ${formatMonth(month)}`
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return '₨' + value.toFixed(0);
                        }
                    }
                }
            }
        }
    });
}

// Form Handling
function setupEventListeners() {
    // Expense form
    document.getElementById('expenseForm').addEventListener('submit', handleExpenseSubmit);
    
    // Loan form
    document.getElementById('loanForm').addEventListener('submit', handleLoanSubmit);
    
    // Committee form
    document.getElementById('committeeForm').addEventListener('submit', handleCommitteeSubmit);
    
    // Committee payment form
    document.getElementById('committeePaymentForm').addEventListener('submit', handleCommitteePaymentSubmit);
    
    // Income form
    document.getElementById('incomeForm').addEventListener('submit', handleIncomeSubmit);
    
    // Month selectors
    document.getElementById('expenseMonth').addEventListener('change', loadMonthlyExpenses);
    document.getElementById('netValuesMonth').addEventListener('change', () => loadNetValues());
}

async function handleExpenseSubmit(e) {
    e.preventDefault();
    
    console.log('Form submission started');
    
    const formData = {
        amount: parseFloat(document.getElementById('expenseAmount').value),
        description: document.getElementById('expenseDescription').value,
        category: document.getElementById('expenseCategory').value,
        date: document.getElementById('expenseDate').value,
        location: document.getElementById('expenseLocation').value,
        notes: document.getElementById('expenseNotes').value
    };
    
    console.log('Form data:', formData);
    
    try {
        console.log('Making API request...');
        const result = await apiRequest('/expenses', 'POST', formData);
        console.log('API response:', result);
        showNotification('Expense added successfully!', 'success');
        closeModal('expenseModal');
        document.getElementById('expenseForm').reset();
        setTodayAsDefault();
        await loadDashboardOverview();
        await loadExpensesDashboard();
        await loadNetValuesDashboard();
    } catch (error) {
        console.error('Error in form submission:', error);
        showNotification('Failed to add expense. Please try again.', 'error');
    }
}

async function handleLoanSubmit(e) {
    e.preventDefault();
    
    const formData = {
        loan_type: document.getElementById('loanType').value,
        person_name: document.getElementById('personName').value,
        amount: parseFloat(document.getElementById('loanAmount').value),
        description: document.getElementById('loanDescription').value,
        date: document.getElementById('loanDate').value,
        due_date: document.getElementById('loanDueDate').value,
        interest_rate: parseFloat(document.getElementById('interestRate').value) || 0,
        notes: document.getElementById('loanNotes').value
    };
    
    try {
        await apiRequest('/loans', 'POST', formData);
        showNotification('Loan transaction added successfully!', 'success');
        closeModal('loanModal');
        document.getElementById('loanForm').reset();
        setTodayAsDefault();
        await loadDashboardOverview();
        await loadLoanDashboard();
        await loadNetValuesDashboard();
    } catch (error) {
        showNotification('Failed to add loan transaction. Please try again.', 'error');
    }
}

async function handleCommitteeSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('committeeName').value,
        start_date: document.getElementById('startDate').value,
        end_date: document.getElementById('endDate').value,
        monthly_amount: parseFloat(document.getElementById('monthlyAmount').value),
        expected_receiving_amount: parseFloat(document.getElementById('expectedAmount').value),
        expected_receiving_date: document.getElementById('expectedDate').value
    };
    
    try {
        await apiRequest('/committees', 'POST', formData);
        showNotification('Committee added successfully!', 'success');
        closeModal('committeeModal');
        document.getElementById('committeeForm').reset();
        await loadCommitteeDashboard();
    } catch (error) {
        showNotification('Failed to add committee. Please try again.', 'error');
    }
}

async function handleCommitteePaymentSubmit(e) {
    e.preventDefault();
    
    const committeeId = document.getElementById('paymentCommittee').value;
    const formData = {
        amount: parseFloat(document.getElementById('paymentAmount').value),
        payment_date: document.getElementById('paymentDate').value,
        month_year: document.getElementById('paymentMonth').value
    };
    
    try {
        await apiRequest(`/committees/${committeeId}/payment`, 'POST', formData);
        showNotification('Committee payment added successfully!', 'success');
        closeModal('committeePaymentModal');
        document.getElementById('committeePaymentForm').reset();
        setTodayAsDefault();
        await loadDashboardOverview();
        await loadCommitteeDashboard();
        await loadExpensesDashboard();
        await loadNetValuesDashboard();
    } catch (error) {
        showNotification('Failed to add committee payment. Please try again.', 'error');
    }
}

async function handleIncomeSubmit(e) {
    e.preventDefault();
    
    const formData = {
        amount: parseFloat(document.getElementById('incomeAmount').value),
        source: document.getElementById('incomeSource').value,
        month_year: document.getElementById('incomeMonth').value
    };
    
    try {
        await apiRequest('/income', 'POST', formData);
        showNotification('Income added successfully!', 'success');
        closeModal('incomeModal');
        document.getElementById('incomeForm').reset();
        setTodayAsDefault();
        await loadDashboardOverview();
        await loadNetValuesDashboard();
    } catch (error) {
        showNotification('Failed to add income. Please try again.', 'error');
    }
}

// Modal Functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    setTodayAsDefault();
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// Loan form label updates
function updateLoanLabels() {
    const loanType = document.getElementById('loanType').value;
    const personLabel = document.getElementById('personNameLabel');
    const dueDateLabel = document.getElementById('dueDateLabel');
    
    switch(loanType) {
        case 'given':
            personLabel.textContent = 'Person Name (To whom you are giving)';
            dueDateLabel.textContent = 'Expected Return Date';
            break;
        case 'taken':
            personLabel.textContent = 'Person Name (From whom you are taking)';
            dueDateLabel.textContent = 'Promise Return Date';
            break;
        case 'received_back':
            personLabel.textContent = 'Person Name (Who returned the money)';
            dueDateLabel.textContent = 'Return Date';
            break;
    }
}

// Utility Functions
function formatCurrency(amount) {
    return '₨' + (amount || 0).toFixed(2);
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatMonth(monthStr) {
    if (!monthStr) return 'N/A';
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;
    
    // Add to top of container
    const container = document.querySelector('.container');
    container.insertBefore(notification, container.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Edit functionality for expense table
function editMonth(month) {
    showNotification('Edit functionality will be implemented in next version', 'info');
}

// Initialize tooltips and other UI enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Add loading states to buttons
    const buttons = document.querySelectorAll('button[type="submit"]');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.form && this.form.checkValidity()) {
                this.disabled = true;
                this.innerHTML = '<span class="loading"></span> Adding...';
                
                setTimeout(() => {
                    this.disabled = false;
                    this.innerHTML = this.dataset.originalText || 'Add';
                }, 3000);
            }
        });
        
        // Store original text
        button.dataset.originalText = button.textContent;
    });
});
