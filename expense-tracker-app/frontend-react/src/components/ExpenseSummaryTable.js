import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiService } from '../services/apiService';

const ExpenseSummaryTable = ({ refreshTrigger = 0 }) => {
  const [monthlyData, setMonthlyData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const expenseCategories = [
    'Food', 'Shopping', 'Home', 'Sports', 'Commute', 
    'Education', 'Trip', 'Committee', 'Others'
  ];

  useEffect(() => {
    loadMonthlyData();
  }, [refreshTrigger]); // Add refreshTrigger to dependency array

  const loadMonthlyData = async () => {
    try {
      setLoading(true); // Show loading state during refresh
      const data = await apiService.getMonthlyAnalytics();
      setMonthlyData(data);
    } catch (error) {
      console.error('Error loading monthly data:', error);
      toast.error('Failed to load monthly data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₨${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getCurrentMonthYear = () => {
    return new Date().toISOString().slice(0, 7);
  };

  const isEditable = (monthYear) => {
    const current = getCurrentMonthYear();
    const monthDate = new Date(monthYear + '-01');
    const currentDate = new Date(current + '-01');
    const diffMonths = (currentDate.getFullYear() - monthDate.getFullYear()) * 12 + 
                      (currentDate.getMonth() - monthDate.getMonth());
    return diffMonths <= 2; // Current month + 2 previous months
  };

  const getMonthlyTotal = (monthData) => {
    if (!monthData || !monthData.expenses) return 0;
    return Object.values(monthData.expenses).reduce((sum, amount) => sum + amount, 0) + 
           (monthData.committee_payments || 0);
  };

  const openExpenseModal = (month) => {
    toast.info(`Opening expense editor for ${month}. This would open a detailed expense editing modal.`);
    // This would trigger the ExpenseModal with pre-filled data for the selected month
  };

  if (loading) {
    return (
      <div className="expense-summary-table">
        <h3><i className="fas fa-table"></i> Monthly Expense Summary</h3>
        <div className="loading">Loading expense data...</div>
      </div>
    );
  }

  const sortedMonths = Object.keys(monthlyData).sort().reverse();

  return (
    <div className="expense-summary-table">
      <h3><i className="fas fa-table"></i> Monthly Expense Summary</h3>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Month</th>
              {expenseCategories.map(category => (
                <th key={category}>{category}</th>
              ))}
              <th>Committee</th>
              <th>Total Expenses</th>
              <th>Income</th>
              <th>Savings</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedMonths.map(month => {
              const monthData = monthlyData[month];
              const editable = isEditable(month);
              const totalExpenses = getMonthlyTotal(monthData);
              
              return (
                <tr key={month} className={editable ? 'editable' : 'locked'}>
                  <td className="month-cell">
                    {new Date(month + '-01').toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short' 
                    })}
                    {editable && <span className="edit-indicator">✏️</span>}
                  </td>
                  
                  {expenseCategories.map(category => (
                    <td key={category}>
                      {formatCurrency(monthData.expenses?.[category] || 0)}
                    </td>
                  ))}
                  
                  <td>{formatCurrency(monthData.committee_payments || 0)}</td>
                  <td className="total-cell">{formatCurrency(totalExpenses)}</td>
                  <td className="income-cell">{formatCurrency(monthData.income || 0)}</td>
                  <td className={`savings-cell ${(monthData.savings || 0) >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(Math.abs(monthData.savings || 0))}
                  </td>
                  <td>
                    {editable ? (
                      <button 
                        className="btn-edit" 
                        onClick={() => openExpenseModal(month)}
                        title="Edit month expenses"
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                    ) : (
                      <span className="locked-text">Locked</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="expense-chart-section">
        <h4>Monthly Expense Chart</h4>
        <div className="chart-controls">
          <label htmlFor="monthSelector">Select Month:</label>
          <select 
            id="monthSelector"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {sortedMonths.map(month => (
              <option key={month} value={month}>
                {new Date(month + '-01').toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </option>
            ))}
          </select>
        </div>
        
        <div className="expense-bars">
          {expenseCategories.map(category => {
            const amount = monthlyData[selectedMonth]?.expenses?.[category] || 0;
            const maxAmount = Math.max(...Object.values(monthlyData).map(m => 
              Math.max(...expenseCategories.map(c => m.expenses?.[c] || 0))
            ));
            const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
            
            return (
              <div key={category} className="expense-bar-item">
                <span className="category-name">{category}</span>
                <div className="bar-container">
                  <div 
                    className="bar" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                  <span className="amount">{formatCurrency(amount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExpenseSummaryTable;
